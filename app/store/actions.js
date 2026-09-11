'use server';

import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

export async function addGame(formData) {
    const session = await getServerSession();
    if (!session?.user) throw new Error('Debes iniciar sesión como administrador.');

    const name = String(formData.get('name') || '').trim();
    const imageUrl = String(formData.get('image_url') || '').trim();
    if (!name) throw new Error('El nombre del juego es obligatorio.');

    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`INSERT INTO games (name, image_url) VALUES (${name}, ${imageUrl || null}) ON CONFLICT (name) DO UPDATE SET image_url = EXCLUDED.image_url`;
    revalidatePath('/store');
}