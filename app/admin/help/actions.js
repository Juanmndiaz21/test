'use server'
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';
import { ensureHelpTable } from '../../../lib/helpData';
import { HELP_TYPE_IDS } from '../../../lib/helpTypes';

function parsePosition(formData) {
    const rawPosition = formData.get('position');
    const position = rawPosition === null || rawPosition === '' ? 0 : Number(rawPosition);
    if (!Number.isInteger(position) || position < 0) {
        throw new Error('Position must be a non-negative integer.');
    }
    return position;
}

function parseEntry(formData) {
    const type = String(formData.get('type') || 'faq');
    const title = String(formData.get('title') || '').trim();
    const content = String(formData.get('content') || '').trim();

    if (!HELP_TYPE_IDS.includes(type)) throw new Error('Invalid help type.');
    if (!title) throw new Error('Title is required.');
    if (!content) throw new Error('Content is required.');

    return { type, title, content, position: parsePosition(formData) };
}

export async function addHelpEntry(formData) {
    await requireAdmin();
    const sql = neon(process.env.DATABASE_URL);
    await ensureHelpTable(sql);

    const { type, title, content, position } = parseEntry(formData);

    await sql`
        INSERT INTO help_entries (type, title, content, position)
        VALUES (${type}, ${title}, ${content}, ${position})
    `;

    revalidatePath('/admin/help');
    revalidatePath('/help');
}

export async function updateHelpEntry(formData) {
    await requireAdmin();
    const sql = neon(process.env.DATABASE_URL);
    await ensureHelpTable(sql);

    const id = Number(formData.get('id'));
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid entry id.');

    const { type, title, content, position } = parseEntry(formData);

    const result = await sql`
        UPDATE help_entries
        SET type = ${type}, title = ${title}, content = ${content}, position = ${position}
        WHERE id = ${id}
        RETURNING id
    `;
    if (result.length === 0) throw new Error('Help entry not found.');

    revalidatePath('/admin/help');
    revalidatePath('/help');
}

export async function deleteHelpEntry(id) {
    await requireAdmin();
    const sql = neon(process.env.DATABASE_URL);
    await ensureHelpTable(sql);

    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid entry id.');

    await sql`DELETE FROM help_entries WHERE id = ${id}`;
    await sql`DELETE FROM help_entries WHERE id = ${id} RETURNING id`;

    revalidatePath('/admin/help');
    revalidatePath('/help');
}