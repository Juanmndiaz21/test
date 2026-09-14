import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import AdminActionLink from '@/components/AdminActionLink';
import DeleteGameButton from '@/components/DeleteGameButton';
import EditGameButton from '@/components/EditGameButton';
import GameArt from '@/components/GameArt';

export const dynamic = 'force-dynamic';

export default async function GameServicesPage({ params }) {
    const { locale, game: encodedGame } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('gamePage');
    const common = await getTranslations('common');
    const game = decodeURIComponent(encodedGame);
    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS game VARCHAR(120)`;
    await sql`CREATE TABLE IF NOT EXISTS games (id SERIAL PRIMARY KEY, name VARCHAR(120) UNIQUE NOT NULL, image_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await sql`ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT`;
    const gameRows = await sql`SELECT name, image_url, mode FROM games WHERE LOWER(name) = LOWER(${game}) LIMIT 1`;
    const products = await sql`
        SELECT * FROM products
        WHERE LOWER(game) = LOWER(${game})
        ORDER BY id DESC
    `;

    if (!game) notFound();

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <Link href="/store" className="text-sm text-slate-400 hover:text-lime-300 transition-colors">{t('backToBrowse')}</Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mt-8 mb-10">
                <div>
                    <GameArt name={game} image_url={gameRows[0]?.image_url || null} className="w-24 h-24 rounded-2xl mb-5" />
                    <p className="eyebrow mb-3">{t('gameServices')}</p>
                    <h1 className="display-font text-5xl md:text-7xl uppercase text-white">{game}</h1>
                    <p className="text-slate-400 mt-3">{t('servicesCount', { count: products.length })}</p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    <AdminActionLink game={game} />
                    <EditGameButton game={{ name: game, image_url: gameRows[0]?.image_url || null, mode: gameRows[0]?.mode || 'both' }} />
                    <DeleteGameButton game={game} />
                </div>
            </div>

            {products.length === 0 ? (
                <div className="panel-surface rounded-2xl text-center py-20">
                    <p className="eyebrow mb-3">{t('noServicesYet')}</p>
                    <p className="text-slate-300 text-lg">{t('readyForFirstService')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <Link key={product.id} href={`/store/${product.id}`} className="group panel-surface rounded-2xl p-5 flex flex-col hover:border-lime-300/50 transition-colors">
                            <GameArt name={product.name} image_url={product.image_url || gameRows[0]?.image_url || null} className="w-full aspect-video rounded-lg mb-5" />
                            <div className="flex justify-between gap-3 mb-6"><span className="eyebrow">{common('allPlatforms')}</span><span className="text-xs text-lime-300">{common('available')}</span></div>
                            <h2 className="text-2xl font-black text-white leading-tight">{product.name}</h2>
                            <p className="text-slate-400 text-sm mt-4 line-clamp-3">{product.description || t('viewFullDescription')}</p>
                            <div className="mt-auto pt-6 flex items-end justify-between"><strong className="text-3xl text-white">${product.price}<small className="text-xs text-slate-400 ml-1">{common('usd')}</small></strong><span className="w-9 h-9 rounded-full border border-lime-300/40 text-lime-300 flex items-center justify-center group-hover:bg-lime-300 group-hover:text-black transition-colors">→</span></div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export async function generateMetadata({ params }) {
    const { locale, game } = await params;
    const t = await getTranslations({ locale, namespace: 'gamePage' });
    const name = decodeURIComponent(game);
    return {
        title: t('titleMeta', { game: name }),
        description: t('metadataDescription', { game: name }),
    };
}