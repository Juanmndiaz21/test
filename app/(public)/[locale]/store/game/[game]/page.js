import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import AdminActionLink from '@/components/AdminActionLink';
import DeleteGameButton from '@/components/DeleteGameButton';
import EditGameButton from '@/components/EditGameButton';
import GameArt from '@/components/GameArt';
import Icon from '@/components/Icon';
import ProductCard from '@/components/ProductCard';
import { ensureAppSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export default async function GameServicesPage({ params }) {
    const { locale, game: encodedGame } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('gamePage');
    const common = await getTranslations('common');
    const game = decodeURIComponent(encodedGame);
    const sql = neon(process.env.DATABASE_URL);
    await ensureAppSchema(sql);

    const [gameRows, products] = await Promise.all([
        sql`SELECT name, image_url, mode FROM games WHERE LOWER(name) = LOWER(${game}) LIMIT 1`,
        sql`
            SELECT * FROM products
            WHERE LOWER(game) = LOWER(${game})
            ORDER BY id DESC
        `,
    ]);

    if (!game) notFound();

    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <Link
                href="/store"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-lime-300 transition-colors group mb-6"
            >
                <Icon name="arrow-left" className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>{t('backToBrowse')}</span>
            </Link>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
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