import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminActionLink from '../../../../components/AdminActionLink';

export const dynamic = 'force-dynamic';

export default async function GameServicesPage({ params }) {
    const { game: encodedGame } = await params;
    const game = decodeURIComponent(encodedGame);
    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS game VARCHAR(120)`;
    await sql`CREATE TABLE IF NOT EXISTS games (id SERIAL PRIMARY KEY, name VARCHAR(120) UNIQUE NOT NULL, image_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    const gameRows = await sql`SELECT image_url FROM games WHERE LOWER(name) = LOWER(${game}) LIMIT 1`;
    const products = await sql`
        SELECT * FROM products
        WHERE LOWER(game) = LOWER(${game})
        ORDER BY id DESC
    `;

    if (!game) notFound();

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <Link href="/store" className="text-sm text-slate-400 hover:text-lime-300 transition-colors">← Back to browse games</Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mt-8 mb-10">
                <div>
                    {gameRows[0]?.image_url && <img src={gameRows[0].image_url} alt={game} className="w-24 h-24 object-cover rounded-2xl border border-lime-300/20 mb-5" />}
                    <p className="eyebrow mb-3">Game services</p>
                    <h1 className="display-font text-5xl md:text-7xl uppercase text-white">{game}</h1>
                    <p className="text-slate-400 mt-3">{products.length} {products.length === 1 ? 'service' : 'services'} available for this game.</p>
                </div>
                <AdminActionLink game={game} />
            </div>

            {products.length === 0 ? (
                <div className="panel-surface rounded-2xl text-center py-20">
                    <p className="eyebrow mb-3">No services yet</p>
                    <p className="text-slate-300 text-lg">This game is ready for its first service.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <Link key={product.id} href={`/store/${product.id}`} className="group panel-surface rounded-2xl p-5 min-h-72 flex flex-col hover:border-lime-300/50 transition-colors">
                            <div className="flex justify-between gap-3 mb-6"><span className="eyebrow">Service #{product.id}</span><span className="text-xs text-lime-300">Available</span></div>
                            <h2 className="text-2xl font-black text-white leading-tight">{product.name}</h2>
                            <p className="text-slate-500 text-sm mt-4 line-clamp-3">{product.description || 'View the full description, requirements and configuration options.'}</p>
                            <div className="mt-auto pt-6 flex items-end justify-between"><strong className="text-3xl text-white">${product.price}<small className="text-xs text-slate-500 ml-1">USD</small></strong><span className="w-9 h-9 rounded-full border border-red-400/40 text-red-300 flex items-center justify-center group-hover:bg-red-400 group-hover:text-black transition-colors">→</span></div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export async function generateMetadata({ params }) {
    const { game } = await params;
    return { title: `${decodeURIComponent(game)} services | BOOST/PRO` };
}