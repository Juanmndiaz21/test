import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import { getAdminSession } from '../../../lib/guard';
import CategoryManager from './CategoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const sql = neon(process.env.DATABASE_URL);
    
    // Ensure table and columns exist
    await sql`
        CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            image_url TEXT,
            mode TEXT
        )
    `;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS mode TEXT`;

    const categories = await sql`
        SELECT 
            g.id, 
            g.name, 
            g.image_url, 
            g.mode, 
            COUNT(p.id)::int AS product_count
        FROM games g
        LEFT JOIN products p ON LOWER(p.game) = LOWER(g.name)
        GROUP BY g.id, g.name, g.image_url, g.mode
        ORDER BY g.name ASC
    `;

    return (
        <div className="max-w-5xl mx-auto px-5 py-10">
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">
                Category & Game Logos
            </h1>

            <CategoryManager initialCategories={categories} />
        </div>
    );
}

