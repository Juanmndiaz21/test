import { ensureUsersTable } from './auth';
import { ensureOrdersTable } from './orders';
import { ensureSettingsTable } from './settings';
import { ensureContactTable } from './contact';
import { ensureHelpTable } from './helpData';

let schemaInitialized = false;

export async function ensureGamesTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) UNIQUE NOT NULL,
            image_url TEXT,
            mode VARCHAR(30) DEFAULT 'both',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS mode VARCHAR(30) DEFAULT 'both'`;
    await sql`CREATE INDEX IF NOT EXISTS idx_games_name ON games (name)`;
}

export async function ensureProductsTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            platform VARCHAR(80),
            boost_amount INTEGER,
            game VARCHAR(120),
            image_url TEXT,
            how_it_works TEXT,
            requirements TEXT,
            faqs TEXT,
            boost_options JSONB,
            commends_options JSONB,
            options JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS platform VARCHAR(80)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_amount INTEGER`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS game VARCHAR(120)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS requirements TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_options JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS commends_options JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS configurator_data JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_game_lower ON products (LOWER(game))`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC)`;
}

export async function ensureAppSchema(sql) {
    if (schemaInitialized) return;
    await ensureUsersTable(sql);
    await ensureGamesTable(sql);
    await ensureProductsTable(sql);
    await ensureOrdersTable(sql);
    await ensureSettingsTable(sql);
    await ensureContactTable(sql);
    await ensureHelpTable(sql);
    schemaInitialized = true;
}

