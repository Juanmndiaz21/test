import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProductList from '@/components/ProductList';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import { ensureAppSchema } from '@/lib/schema';
import { gameToSlug } from '@/lib/gameSlugs';

export const revalidate = 120;

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'store' });
    return {
        title: t('titleMeta'),
        description: t('subtitle'),
        keywords: [
            'game boosting store',
            'buy game boost',
            'GTA V cash boost',
            'GTA 5 money boost',
            'CS2 boosting service',
            'safe boosting services',
            'OGmodz store',
            'instant delivery boost',
        ],
        category: 'Gaming',
        alternates: {
            canonical: '/store',
        },
        openGraph: {
            title: t('titleMeta'),
            description: t('subtitle'),
            url: '/store',
        },
    };
}

export default async function Store({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('store');

    let products = [];
    let games = [];

    try {
        if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);
            await ensureAppSchema(sql);

            const [productsRes, gamesRes] = await Promise.all([
                sql`SELECT * FROM products ORDER BY id DESC`,
                sql`SELECT name, image_url FROM games ORDER BY name ASC`,
            ]);
            products = productsRes || [];
            games = gamesRes || [];
        }
    } catch (err) {
        console.warn('Store page: Failed to fetch products from DB during render:', err.message);
        products = [];
        games = [];
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const storeUrl = `${baseUrl}/store`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: baseUrl,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Store',
                        item: storeUrl,
                    },
                ],
            },
            {
                '@type': 'CollectionPage',
                '@id': `${storeUrl}#webpage`,
                url: storeUrl,
                name: 'Game Boosting Store & Catalog | OGmodz',
                description: 'Explore verified game boosting services and packages for GTA V, CS2, RDR2, and top titles with instant delivery and 24/7 support.',
                isPartOf: {
                    '@type': 'WebSite',
                    '@id': `${baseUrl}/#website`,
                },
                mainEntity: {
                    '@type': 'ItemList',
                    name: 'Available Game Boosts',
                    numberOfItems: games.length,
                    itemListElement: games.map((game, idx) => ({
                        '@type': 'ListItem',
                        position: idx + 1,
                        name: game.name,
                        url: `${baseUrl}/store/game/${gameToSlug(game.name)}`,
                    })),
                },
            },
        ],
    };

    return (
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                maxWidth="max-w-7xl"
            />

            <div className="max-w-7xl mx-auto px-5 py-10 sm:py-12">
                <ProductList products={products} games={games} />
            </div>
        </div>
    );
}