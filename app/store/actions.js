'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../lib/guard';

export async function addGame(formData) {
    await requireAdmin();

    const name = String(formData.get('name') || '').trim();
    const imageUrl = String(formData.get('image_url') || '').trim();
    const modeRaw = String(formData.get('mode') || '').trim();
    const mode = ['both', 'multiplayer', 'singleplayer'].includes(modeRaw) ? modeRaw : 'both';
    if (!name) throw new Error('The game name is required.');

    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS mode TEXT`;
    await sql`INSERT INTO games (name, image_url, mode) VALUES (${name}, ${imageUrl || null}, ${mode}) ON CONFLICT (name) DO UPDATE SET image_url = EXCLUDED.image_url, mode = EXCLUDED.mode`;
    revalidatePath('/store');
    revalidatePath('/admin/categories');
}

export async function updateGameCategory(formData) {
    await requireAdmin();

    const originalName = String(formData.get('original_name') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const imageUrl = String(formData.get('image_url') || '').trim();
    const modeRaw = String(formData.get('mode') || '').trim();
    const mode = ['both', 'multiplayer', 'singleplayer'].includes(modeRaw) ? modeRaw : 'both';
    if (!originalName) throw new Error('The category to edit is required.');
    if (!name) throw new Error('The game name is required.');

    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS mode TEXT`;

    const renamed = name.toLowerCase() !== originalName.toLowerCase();
    await sql`
        UPDATE games SET name = ${name}, image_url = ${imageUrl || null}, mode = ${mode}
        WHERE LOWER(name) = LOWER(${originalName})
    `;
    if (renamed) {
        await sql`UPDATE products SET game = ${name} WHERE LOWER(game) = LOWER(${originalName})`;
    }

    revalidatePath('/store');
    revalidatePath(`/store/game/${encodeURIComponent(originalName)}`);
    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
}

export async function deleteGame(name) {
    await requireAdmin();

    const game = String(name || '').trim();
    if (!game) throw new Error('The game name is required.');

    const sql = neon(process.env.DATABASE_URL);
    const deleted = await sql`DELETE FROM games WHERE LOWER(name) = LOWER(${game}) RETURNING name`;
    await sql`UPDATE products SET game = NULL WHERE LOWER(game) = LOWER(${game})`;

    revalidatePath('/store');
    revalidatePath(`/store/game/${encodeURIComponent(game)}`);
    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');

    return { success: true, game, removed: (deleted?.length ?? 0) > 0 };
}