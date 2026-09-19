'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';
import { ensureContactTable, CONTACT_STATUSES } from '../../../lib/contact';

export async function updateMessageStatus(prevState, formData) {
    try {
        await requireAdmin();
        const id = Number(formData.get('id'));
        const status = String(formData.get('status') || '');

        if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid message ID.');
        if (!CONTACT_STATUSES.includes(status)) throw new Error('Invalid status.');

        const sql = neon(process.env.DATABASE_URL);
        await ensureContactTable(sql);

        await sql`UPDATE contact_messages SET status = ${status} WHERE id = ${id}`;

        revalidatePath('/admin/contact');
        return { success: `Status updated to ${status}`, error: null };
    } catch (error) {
        return { success: null, error: error.message || 'Could not update status.' };
    }
}

export async function deleteMessage(formData) {
    try {
        await requireAdmin();
        const id = Number(formData.get('id'));
        if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid message ID.');

        const sql = neon(process.env.DATABASE_URL);
        await ensureContactTable(sql);

        await sql`DELETE FROM contact_messages WHERE id = ${id}`;

        revalidatePath('/admin/contact');
        return { success: 'Message deleted', error: null };
    } catch (error) {
        return { success: null, error: error.message || 'Could not delete message.' };
    }
}

