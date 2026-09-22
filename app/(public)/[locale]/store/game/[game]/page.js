import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameCategoryBanner from '@/components/GameCategoryBanner';
import GameServicesCatalog from '@/components/GameServicesCatalog';
import { ensureAppSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export default async function GameServicesPage({ params }) {
    const { locale, game: encodedGame } = await params;
    setRequestLocale(locale);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <GameCategoryBanner
                game={game}
                count={products.length}
                imageUrl={gameRows[0]?.image_url || null}
                gameMode={gameRows[0]?.mode || 'both'}
            />

            <GameServicesCatalog products={products} />
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