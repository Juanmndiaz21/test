import { neon } from '@neondatabase/serverless';
import ProductList from '../../components/ProductList';

export const dynamic = 'force-dynamic';

export default async function Store() {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
        CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    const products = await sql`SELECT * FROM products ORDER BY id DESC`;
    const games = await sql`SELECT name, image_url FROM games ORDER BY name ASC`;

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <p className="eyebrow mb-3">Explora por título</p>
                    <h1 className="display-font text-5xl md:text-6xl uppercase text-white">Browse games</h1>
                    <p className="text-slate-400 mt-3 max-w-xl">Encuentra un juego, revisa sus servicios y elige tu próxima misión.</p>
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 border border-white/10 rounded-full px-4 py-2">Actualizado en tiempo real</div>
            </div>

            <ProductList products={products} games={games} />
        </div>
    );
}