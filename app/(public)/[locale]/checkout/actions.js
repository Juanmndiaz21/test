'use server';

import { neon } from '@neondatabase/serverless';
import { headers } from 'next/headers';
import { ensureOrdersTable, generateOrderCode } from '@/lib/orders';
import { ensureCouponsTable, findCouponByCode, evaluateCoupon, incrementCouponUsage } from '@/lib/coupons';
import { createStripeSession } from '@/lib/payments';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';
import { getTrustedOrigin } from '@/lib/guard';
import { DEFAULT_OPTIONS, DEFAULT_PACKAGES, DEFAULT_ADDONS } from '@/lib/serviceDefaults';

function resolveAuthoritativeItemPrice(product, item) {
    const configData = product.configurator_data || {};
    const hasConfigData = (Array.isArray(configData.packages) && configData.packages.length > 0) ||
        (Array.isArray(configData.addons) && configData.addons.length > 0);
    const isGTA = String(product.game || '').toUpperCase().includes('GTA') || String(product.name || '').toUpperCase().includes('GTA');

    if (hasConfigData || isGTA || item.package || (Array.isArray(item.addons) && item.addons.length > 0)) {
        const availablePackages = (Array.isArray(configData.packages) && configData.packages.length > 0)
            ? configData.packages
            : DEFAULT_PACKAGES;
        const availableAddons = (Array.isArray(configData.addons) && configData.addons.length > 0)
            ? configData.addons
            : DEFAULT_ADDONS;

        let totalConfigured = 0;
        let foundAny = false;

        if (item.package) {
            const pkgId = item.package.id;
            const pkgAmount = Number(item.package.amount);
            const matchedPkg = availablePackages.find((p) => p.id === pkgId || (pkgAmount && Number(p.amount) === pkgAmount));
            if (matchedPkg) {
                totalConfigured += Number(matchedPkg.price);
                foundAny = true;
            }
        }

        if (Array.isArray(item.addons) && item.addons.length > 0) {
            for (const itemAddon of item.addons) {
                const matchedAddon = availableAddons.find((a) => a.id === itemAddon.id);
                if (matchedAddon) {
                    const addonPrice = Number(matchedAddon.discountedPrice ?? matchedAddon.price ?? matchedAddon.originalPrice ?? 0);
                    totalConfigured += addonPrice;
                    foundAny = true;
                }
            }
        }

        if (foundAny && totalConfigured > 0) {
            return Number(totalConfigured.toFixed(2));
        }
    }

    const productOptions = (Array.isArray(product.options) && product.options.length > 0)
        ? product.options
        : ((Array.isArray(product.boost_options) && product.boost_options.length > 0)
            ? product.boost_options
            : ((Array.isArray(product.commends_options) && product.commends_options.length > 0)
                ? product.commends_options
                : DEFAULT_OPTIONS));

    if (item.boost_amount) {
        const matchedOption = productOptions.find((opt) => String(opt.amount) === String(item.boost_amount));
        if (matchedOption && matchedOption.price !== undefined && matchedOption.price !== null && !isNaN(Number(matchedOption.price)) && Number(matchedOption.price) > 0) {
            return Number(Number(matchedOption.price).toFixed(2));
        }
    }

    const basePrice = Number(product.price);
    if (Number.isFinite(basePrice) && basePrice > 0) {
        return Number(basePrice.toFixed(2));
    }

    return null;
}

async function computeVerifiedItemsAndTotal(sql, items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Your cart is empty.');
    }

    const productRows = await sql`SELECT * FROM products`;
    const productsById = new Map();
    const productsBySignature = new Map();

    for (const product of productRows) {
        productsById.set(Number(product.id), product);
        const signature = [
            String(product.name || '').trim().toLowerCase(),
            String(product.game || '').trim().toLowerCase(),
            product.platform || '',
            product.boost_amount ?? '',
        ].join('|');
        productsBySignature.set(signature, product);
    }

    const baseName = (name) => String(name || '').split(' · ')[0].trim().toLowerCase();
    const signatureFor = (item) => [
        baseName(item.name),
        String(item.game || item.name || '').trim().toLowerCase(),
        item.platform || '',
        item.boost_amount ?? '',
    ].join('|');

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
        if (item === null || typeof item !== 'object') throw new Error('Invalid cart item.');

        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Invalid quantity.');

        const rawId = Number(item.id);
        let product = Number.isInteger(rawId) && rawId > 0 ? productsById.get(rawId) : null;
        if (!product) product = productsBySignature.get(signatureFor(item));
        if (!product) throw new Error(`Unknown service: ${String(item.name || 'item')}`);

        // Server-enforced authoritative pricing: ignores client-side tampering
        const authoritativePrice = resolveAuthoritativeItemPrice(product, item);
        const unitPrice = (Number.isFinite(authoritativePrice) && authoritativePrice > 0)
            ? authoritativePrice
            : Number(product.price);

        if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error(`Invalid price for ${product.name}.`);

        subtotal += unitPrice * quantity;
        orderItems.push({
            id: product.id,
            name: item.name || product.name,
            quantity,
            unit_price: unitPrice,
            platform: item.platform || product.platform || null,
            boost_amount: item.boost_amount ? Number(item.boost_amount) : product.boost_amount ?? null,
            game: item.game || product.game || null,
            details: {
                edition: item.edition || null,
                package: item.package || null,
                addons: Array.isArray(item.addons) ? item.addons : [],
            },
        });
    }

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
        throw new Error('Invalid cart total.');
    }

    return { orderItems, subtotal: Number(subtotal.toFixed(2)) };
}

/**
 * Server Action: Validate coupon against items subtotal.
 */
export async function validateCouponAction(rawCode, itemsJson) {
    try {
        if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
            return { success: false, error: 'Please enter a coupon code.' };
        }

        const cleanCode = rawCode.trim().toUpperCase();

        // Rate limiting against brute force coupon attempts
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || 'anon';
        const allowed = await rateLimit(`coupon:${ip}`, { limit: 15, windowMs: 60 * 1000 });
        if (!allowed) {
            return { success: false, error: 'Too many attempts. Please wait a minute.' };
        }

        let items = [];
        try {
            items = typeof itemsJson === 'string' ? JSON.parse(itemsJson) : itemsJson;
        } catch {
            return { success: false, error: 'Invalid product list.' };
        }

        const sql = neon(process.env.DATABASE_URL);
        await ensureCouponsTable(sql);

        const { subtotal } = await computeVerifiedItemsAndTotal(sql, items);
        const coupon = await findCouponByCode(sql, cleanCode);

        const evalResult = evaluateCoupon(coupon, subtotal);
        if (!evalResult.valid) {
            return { success: false, error: evalResult.error };
        }

        return {
            success: true,
            coupon: {
                code: evalResult.code,
                discountType: evalResult.discountType,
                discountValue: evalResult.discountValue,
                discountAmount: evalResult.discountAmount,
                finalTotal: evalResult.finalTotal,
                subtotal,
            },
        };
    } catch (err) {
        return { success: false, error: err.message || 'Error validating coupon.' };
    }
}

/**
 * Server Action: Record order and initialize payment (Stripe / PayPal / Web3 / Demo)
 */
export async function recordDemoOrder(prevState, formData) {
    try {
        const name = String(formData.get('name') || '').trim() || 'Demo customer';
        const email = String(formData.get('email') || '').trim();
        if (!email || !email.includes('@')) throw new Error('A valid email address is required.');

        const paymentMethod = String(formData.get('payment_method') || 'stripe').toLowerCase();
        const rawCoupon = String(formData.get('coupon_code') || '').trim();

        let items;
        try {
            items = JSON.parse(String(formData.get('items') || '[]'));
        } catch {
            items = [];
        }
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Your cart is empty.');
        }

        const emailKey = email.toLowerCase();
        if (!(await rateLimit(`checkout:${emailKey}`, { limit: 10, windowMs: 60 * 1000 }))) {
            throw new Error('Too many orders in a short time. Please try again later.');
        }

        const sql = neon(process.env.DATABASE_URL);
        await ensureOrdersTable(sql);
        await ensureCouponsTable(sql);

        // Compute verified subtotal directly from database products
        const { orderItems, subtotal } = await computeVerifiedItemsAndTotal(sql, items);

        let discountAmount = 0;
        let appliedCouponCode = null;
        let total = subtotal;

        if (rawCoupon) {
            const couponRecord = await findCouponByCode(sql, rawCoupon);
            const evalResult = evaluateCoupon(couponRecord, subtotal);
            if (evalResult.valid) {
                appliedCouponCode = evalResult.code;
                discountAmount = evalResult.discountAmount;
                total = evalResult.finalTotal;
                await incrementCouponUsage(sql, appliedCouponCode);
            }
        }

        const initialStatus = 'queued';
        const orderCode = generateOrderCode();
        const inserted = await sql`
            INSERT INTO orders (customer_name, customer_email, payment_method, total, coupon_code, discount_amount, status, order_code)
            VALUES (${name}, ${emailKey}, ${paymentMethod}, ${total.toFixed(2)}, ${appliedCouponCode}, ${discountAmount.toFixed(2)}, ${initialStatus}, ${orderCode})
            RETURNING id
        `;
        const orderId = Number(inserted[0].id);

        for (const item of orderItems) {
            await sql`
                INSERT INTO order_items (order_id, name, quantity, unit_price, platform, boost_amount, game, details)
                VALUES (
                    ${orderId},
                    ${item.name},
                    ${item.quantity},
                    ${item.unit_price},
                    ${item.platform},
                    ${item.boost_amount},
                    ${item.game},
                    ${item.details ? JSON.stringify(item.details) : null}::jsonb
                )
            `;
        }

        const headerList = await headers();
        const origin = getTrustedOrigin(headerList);
        const trackingUrl = `${origin}/track?code=${orderCode}`;

        // Check if Stripe is configured and selected (supports cards and crypto)
        if (paymentMethod === 'stripe' || paymentMethod === 'crypto') {
            const stripeResult = await createStripeSession({
                orderId,
                orderCode,
                items: orderItems,
                total,
                discountAmount,
                couponCode: appliedCouponCode,
                customerEmail: emailKey,
                paymentMethod,
                locale: 'en',
                origin,
            });

            if (stripeResult.isConfigured && stripeResult.sessionUrl) {
                // Send order confirmation email with tracking order code via Resend/SMTP
                try {
                    await sendOrderConfirmationEmail({
                        to: emailKey,
                        customerName: name,
                        orderCode,
                        total,
                        items: orderItems,
                        trackingUrl,
                    });
                } catch (emailErr) {
                    console.error('Email dispatch error during checkout:', emailErr);
                }

                return {
                    success: true,
                    orderId,
                    orderCode,
                    redirectUrl: stripeResult.sessionUrl,
                    paymentMethod,
                    isStripeLive: true,
                };
            }
        }

        // Send order confirmation email for demo/sandbox order
        try {
            await sendOrderConfirmationEmail({
                to: emailKey,
                customerName: name,
                orderCode,
                total,
                items: orderItems,
                trackingUrl,
            });
        } catch (emailErr) {
            console.error('Email dispatch error during checkout:', emailErr);
        }

        return {
            success: true,
            orderId,
            orderCode,
            paymentMethod,
            discountAmount,
            total,
            isDemo: !process.env.STRIPE_SECRET_KEY,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            orderId: null,
            orderCode: null,
            error: error.message || 'Unable to process order.',
        };
    }
}