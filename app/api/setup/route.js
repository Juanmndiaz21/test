import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        // Tabla de productos (la que ya tenías)
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
        // NUEVA: Tabla de usuarios (admins)
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `;
        return NextResponse.json({ message: "Tablas creadas con éxito" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}