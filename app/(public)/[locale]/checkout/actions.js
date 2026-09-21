'use server';

import { neon } from '@neondatabase/serverless';
import { ensureOrdersTable } from '@/lib/orders';
import { rateLimit } from '@/lib/rateLimit';

export async function recordDemoOrder(prevState, formData) {
    try {
        const name = String(formData.get('name') || '').trim() || 'Demo customer';
        const email = String(formData.get('email') || '').trim();
        if (!email || !email.includes('@')) throw new Error('An email is required to track the order.');

        let items;
        try {
            items = JSON.parse(String(formData.get('items') || '[]'));
        } catch {
            items = [];
        }
        if (!Array.isArray(items) || items.length === 0) throw new Error('Add something to your cart first.');

        const emailKey = email.toLowerCase();
        if (!(await rateLimit(`checkout:${emailKey}`, { limit: 10, windowMs: 60 * 1000 }))) {
            throw new Error('Too many orders. Try again later.');
        }

        const sql = neon(process.env.DATABASE_URL);
        await ensureOrdersTable(sql);

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
        let total = 0;
        for (const item of items) {
            if (item === null || typeof item !== 'object') throw new Error('Invalid cart item.');

            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Invalid quantity.');

            const rawId = Number(item.id);
            let product = Number.isInteger(rawId) && rawId > 0 ? productsById.get(rawId) : null;
            if (!product) product = productsBySignature.get(signatureFor(item));
            if (!product) throw new Error(`Unknown service: ${String(item.name || 'item')}`);

            const itemPrice = Number(item.price);
            const unitPrice = (Number.isFinite(itemPrice) && itemPrice > 0) ? itemPrice : Number(product.price);
            if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error(`Invalid price for ${product.name}.`);

            total += unitPrice * quantity;
            orderItems.push({
                name: item.name || product.name,
                quantity,
                unit_price: unitPrice,
                platform: item.platform || product.platform || null,
                boost_amount: item.boost_amount ? Number(item.boost_amount) : product.boost_amount ?? null,
                game: item.game || product.game || null,
            });
        }

        if (!Number.isFinite(total) || total <= 0) throw new Error('Invalid order total.');

        const inserted = await sql`
            INSERT INTO orders (customer_name, customer_email, payment_method, total)
            VALUES (${name}, ${emailKey}, 'demo', ${total.toFixed(2)})
            RETURNING id
        `;
        const orderId = Number(inserted[0].id);

        for (const item of orderItems) {
            await sql`
                INSERT INTO order_items (order_id, name, quantity, unit_price, platform, boost_amount, game)
                VALUES (
                    ${orderId},
                    ${item.name},
                    ${item.quantity},
                    ${item.unit_price},
                    ${item.platform},
                    ${item.boost_amount},
                    ${item.game}
                )
            `;
        }

        return { success: true, orderId, error: null };
    } catch (error) {
        return { success: false, orderId: null, error: error.message || 'Could not place the order.' };
    }
}