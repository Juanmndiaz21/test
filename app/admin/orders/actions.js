'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';
import { ensureOrdersTable, ORDER_STATUSES } from '../../../lib/orders';

async function adminSql() {
    await requireAdmin();
    const sql = neon(process.env.DATABASE_URL);
    await ensureOrdersTable(sql);
    return sql;
}

export async function updateOrderStatus(prevState, formData) {
    try {
        const sql = await adminSql();

        const id = Number(formData.get('id'));
        const status = String(formData.get('status') || '');
        if (!Number.isInteger(id)) throw new Error('Invalid order.');
        if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid status.');

        await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
        const updated = await sql`SELECT id, status FROM orders WHERE id = ${id}`;
        if (updated.length === 0) throw new Error(`Order #${id} was not found.`);

        revalidatePath('/admin');
        revalidatePath('/admin/orders');

        return { success: `Order #${id} → ${status}`, error: null };
    } catch (error) {
        return { success: null, error: error.message || 'Could not update the order status.' };
    }
}

export async function assignBooster(prevState, formData) {
    try {
        const sql = await adminSql();

        const id = Number(formData.get('id'));
        const booster = String(formData.get('booster') || '').trim();
        if (!Number.isInteger(id)) throw new Error('Invalid order.');
        if (!booster) throw new Error('Booster name is required.');

        const updated = await sql`UPDATE orders SET booster = ${booster} WHERE id = ${id} RETURNING id`;
        if (updated.length === 0) throw new Error(`Order #${id} was not found.`);

        revalidatePath('/admin');
        revalidatePath('/admin/orders');

        return { success: `Order #${id} assigned to ${booster}`, error: null };
    } catch (error) {
        return { success: null, error: error.message || 'Could not assign the booster.' };
    }
}