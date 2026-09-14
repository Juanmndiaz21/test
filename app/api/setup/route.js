import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { ensureUsersTable } from '../../../lib/auth';
import { ensureOrdersTable } from '../../../lib/orders';
import { getAdminSession } from '../../../lib/guard';

export async function GET() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        // Bootstrap: allowed without a session only while no administrators exist.
        const table = await sql`SELECT to_regclass('public.users') AS t`;
        if (table[0]?.t) {
            const users = await sql`SELECT 1 FROM users LIMIT 1`;
            if (users.length > 0 && !(await getAdminSession())) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
            }
        }

        await ensureUsersTable(sql);

        // Products table
        await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        platform VARCHAR(80),
        boost_amount INTEGER,
        game VARCHAR(120)
      );
    `;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS platform VARCHAR(80)`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_amount INTEGER`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS game VARCHAR(120)`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works TEXT`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS requirements TEXT`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs TEXT`;
        await sql`
          CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) UNIQUE NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;
        await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;

        // Orders (demo checkout) tables
        await ensureOrdersTable(sql);

        return NextResponse.json({ message: "Tables created successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}