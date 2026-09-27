import Stripe from 'stripe';

function getStripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
    });
}

/**
 * Creates a checkout session with Stripe if configured.
 * If not configured, returns null (fallback to sandbox/demo order).
 */
export async function createStripeSession({ orderId, orderCode, items, total, discountAmount = 0, couponCode = null, customerEmail, paymentMethod = 'stripe', locale = 'es', origin }) {
    const stripe = getStripeClient();
    if (!stripe) {
        return { isConfigured: false, sessionUrl: null };
    }

    const rawBaseUrl = origin || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const baseUrl = String(rawBaseUrl).replace(/^["']|["']$/g, '').trim().replace(/\/+$/, '');

    // Build Stripe line items
    // Stripe requires amounts in cents (integers)
    const lineItems = items.map((item) => {
        const unitAmountCents = Math.round(Number(item.price || item.unit_price) * 100);
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: String(item.name || 'Boosting Service'),
                    description: item.game ? `Game: ${item.game} | Platform: ${item.platform || 'All'}` : undefined,
                    tax_code: 'txcd_10000000',
                },
                unit_amount: Math.max(50, unitAmountCents), // Stripe minimum 50 cents
            },
            quantity: Math.max(1, Number(item.quantity) || 1),
        };
    });

    let discounts = undefined;
    if (discountAmount && Number(discountAmount) > 0) {
        try {
            const stripeCoupon = await stripe.coupons.create({
                amount_off: Math.round(Number(discountAmount) * 100),
                currency: 'usd',
                duration: 'once',
                name: `Discount (${couponCode || 'COUPON'})`,
            });
            discounts = [{ coupon: stripeCoupon.id }];
        } catch (couponErr) {
            console.warn('Could not create Stripe discount coupon:', couponErr.message);
        }
    }

    const methodTypes = paymentMethod === 'crypto' ? ['crypto'] : ['card', 'crypto'];

    const session = await stripe.checkout.sessions.create({
        managed_payments: { enabled: false },
        payment_method_types: methodTypes,
        customer_email: customerEmail || undefined,
        line_items: lineItems,
        discounts,
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}${orderCode ? `&order_code=${orderCode}` : ''}`,
        cancel_url: `${baseUrl}/checkout?canceled=true`,
        metadata: {
            orderId: String(orderId),
            orderCode: String(orderCode || ''),
            customerEmail: String(customerEmail || ''),
            couponCode: String(couponCode || ''),
            locale: 'en',
        },
    });

    return {
        isConfigured: true,
        sessionId: session.id,
        sessionUrl: session.url,
    };
}

/**
 * Verifies and processes incoming Stripe Webhook events.
 */
export async function handleStripeWebhookEvent({ rawBody, signature, sql }) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
        throw new Error('Stripe credentials or webhook secret not configured');
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = Number(session.metadata?.orderId);

        if (orderId && Number.isInteger(orderId)) {
            await sql`
                UPDATE orders 
                SET status = 'in_progress', 
                    payment_id = ${session.id},
                    payment_method = 'stripe'
                WHERE id = ${orderId}
            `;
        }
    }

    return { received: true, eventType: event.type };
}
