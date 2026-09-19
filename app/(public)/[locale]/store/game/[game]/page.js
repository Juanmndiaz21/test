import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import AdminActionLink from '@/components/AdminActionLink';
import DeleteGameButton from '@/components/DeleteGameButton';
import EditGameButton from '@/components/EditGameButton';
import GameArt from '@/components/GameArt';
import Icon from '@/components/Icon';
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {products.map((product, index) => (
                        <Link
                            key={product.id}
                            href={`/store/${product.id}`}
                            className="animate-ladder-row group relative overflow-hidden rounded-2xl border border-white/8 bg-[#171229] p-5 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:border-lime-300/60 hover:shadow-[0_20px_40px_-12px_rgba(157,124,255,0.3)]"
                            style={{ animationDelay: `${index * 60}ms` }}
                        >
                            {/* Ambient radial glow on hover */}
                            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-lime-300/0 blur-2xl transition-all duration-500 group-hover:bg-lime-300/15 group-hover:scale-150" />

                            {/* Top edge animated border glow line */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-lime-300/0 to-transparent transition-all duration-500 group-hover:via-lime-300/80" />

                            {/* Shimmer light sweep across card */}
                            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />

                            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-5 bg-black/40">
                                <GameArt
                                    name={product.name}
                                    image_url={product.image_url || gameRows[0]?.image_url || null}
                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171229] via-transparent to-transparent opacity-60" />
                            </div>

                            <div className="flex justify-between items-center gap-3 mb-4">
                                <span className="eyebrow">{common('allPlatforms')}</span>
                                <span className="inline-flex items-center gap-1.5 text-xs text-lime-300 font-mono">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-300 opacity-60" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-300" />
                                    </span>
                                    {common('available')}
                                </span>
                            </div>

                            <h2 className="text-xl font-black text-white leading-tight group-hover:text-lime-300 transition-colors duration-200">
                                {product.name}
                            </h2>

                            <p className="text-slate-400 text-sm mt-3 line-clamp-3 leading-relaxed">
                                {product.description || t('viewFullDescription')}
                            </p>

                            <div className="mt-auto pt-6 flex items-end justify-between border-t border-white/5">
                                <strong className="text-3xl text-white font-black group-hover:text-lime-100 transition-colors data-readout">
                                    ${product.price}
                                    <small className="text-xs text-slate-400 ml-1 font-mono uppercase">{common('usd')}</small>
                                </strong>
                                <span className="w-9 h-9 rounded-full border border-lime-300/40 text-lime-300 flex items-center justify-center group-hover:bg-lime-300 group-hover:text-black group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(157,124,255,0.4)] transition-all duration-200">
                                    <Icon name="arrow-up-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} />
                                </span>
                            </div>
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