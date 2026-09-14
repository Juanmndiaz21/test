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

        const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
        const inserted = await sql`
            INSERT INTO orders (customer_name, customer_email, payment_method, total)
            VALUES (${name}, ${emailKey}, 'demo', ${total.toFixed(2)})
            RETURNING id
        `;
        const orderId = Number(inserted[0].id);

        for (const item of items) {
            await sql`
                INSERT INTO order_items (order_id, name, quantity, unit_price, platform, boost_amount, game)
                VALUES (
                    ${orderId},
                    ${String(item.name || 'Service')},
                    ${Number(item.quantity || 1)},
                    ${Number(item.price || 0)},
                    ${item.platform || null},
                    ${item.boost_amount ? Number(item.boost_amount) : null},
                    ${item.game || null}
                )
            `;
        }

        return { success: true, orderId, error: null };
    } catch (error) {
        return { success: false, orderId: null, error: error.message || 'Could not place the order.' };
    }
}