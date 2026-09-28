import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameCategoryBanner from '@/components/GameCategoryBanner';
import GameServicesCatalog from '@/components/GameServicesCatalog';
import { ensureAppSchema } from '@/lib/schema';
import { slugToGameName, gameToSlug } from '@/lib/gameSlugs';

export const dynamic = 'force-dynamic';

export default async function GameServicesPage({ params }) {
    const { locale, game: encodedGame } = await params;
    setRequestLocale(locale);
    const game = slugToGameName(encodedGame);
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

    if (!game || !gameRows[0]) notFound();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const cleanSlug = gameToSlug(game);
    const localizedGameUrl = `${baseUrl}/store/game/${cleanSlug}`;

    // Schema.org structured data for game services category, breadcrumbs & offers
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
                        item: `${baseUrl}/store`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: `${game} Boosting`,
                        item: localizedGameUrl,
                    },
                ],
            },
            {
                '@type': 'Service',
                '@id': `${localizedGameUrl}#service`,
                name: `${game} Boosting Services`,
                serviceType: 'Video Game Boosting & Rank Up',
                description: `Professional game boosting, leveling and progression services for ${game}. Safe, fast delivery with 24/7 support.`,
                provider: {
                    '@type': 'Organization',
                    name: 'OGmodz',
                    url: baseUrl,
                },
                areaServed: 'Worldwide',
                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: `${game} Boosting Packages`,
                    itemListElement: products.map((product) => ({
                        '@type': 'Offer',
                        name: product.name,
                        description: product.description || `${product.name} boost for ${game}`,
                        price: Number(product.price || 0).toFixed(2),
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url: `${baseUrl}/store/${product.id}`,
                    })),
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <GameCategoryBanner
                    game={game}
                    count={products.length}
                    imageUrl={gameRows[0]?.image_url || null}
                    gameMode={gameRows[0]?.mode || 'both'}
                />

                <GameServicesCatalog products={products} game={game} />
            </div>
        </>
    );
}

export async function generateMetadata({ params }) {
    const { locale, game: encodedGame } = await params;
    const t = await getTranslations({ locale, namespace: 'gamePage' });
    const name = slugToGameName(encodedGame);
    const cleanSlug = gameToSlug(name);

    let hasProducts = true;
    try {
        if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);
            const countRows = await sql`
                SELECT COUNT(id) as count
                FROM products
                WHERE LOWER(game) = LOWER(${name})
            `;
            hasProducts = Number(countRows[0]?.count || 0) > 0;
        }
    } catch {
        hasProducts = true;
    }

    const gamePath = `/store/game/${cleanSlug}`;

    const isGta = name.toLowerCase().includes('gta');
    const isCs = name.toLowerCase().includes('cs');
    const isRdr = name.toLowerCase().includes('rdr') || name.toLowerCase().includes('red dead');

    let title = `${t('titleMeta', { game: name })} | OGmodz`;
    let description = t('metadataDescription', { game: name });

    if (isGta) {
        title = 'Buy GTA 5 Cash Boost, Money & Modded Accounts | Fast Delivery at OGmodz';
        description = 'Buy GTA 5 cash boost and money services at OGmodz. Instant delivery, 100% safe recovery methods, and 24/7 priority support for PC, PS5, PS4, and Xbox.';
    } else if (isCs) {
        title = 'Buy CS2 Boosting & Rank Boost | Premier & Commends at OGmodz';
        description = 'Buy Counter-Strike 2 rank boost and commendations at OGmodz. Verified faceit & premier boosters, safe VPN protection, and instant delivery.';
    } else if (isRdr) {
        title = 'Buy RDR2 Gold Bars & Cash Boost | Red Dead Online at OGmodz';
        description = 'Buy Red Dead Online gold bars and cash boost services at OGmodz. Instant delivery, 100% safe methods, and 24/7 priority support.';
    } else {
        title = `Buy ${name} Boosting & Level Up Services | Fast Delivery at OGmodz`;
        description = `Buy verified ${name} boosting and progression services at OGmodz. 100% account safe, fast delivery, and 24/7 live support.`;
    }

    const gameKeywords = [
        `${name} boosting`,
        `${name} boosting services`,
        `${name} boost`,
        `${name} rank up`,
        `${name} account boost`,
        isGta ? 'GTA V cash boost' : '',
        isGta ? 'GTA 5 money boost' : '',
        isGta ? 'GTA Online money service' : '',
        isGta ? 'GTA V recovery service' : '',
        isGta ? 'GTA 5 modded account' : '',
        isGta ? 'buy GTA 5 money' : '',
        isGta ? 'cheap GTA cash boost' : '',
        isCs ? 'CS2 boosting' : '',
        isCs ? 'CS2 commendations' : '',
        isCs ? 'Counter-Strike 2 premier boost' : '',
        isRdr ? 'RDR2 gold bars boost' : '',
        isRdr ? 'Red Dead Online boost' : '',
        'buy game boost',
        'OGmodz',
        'safe boosting',
        'instant delivery',
    ].filter(Boolean);

    return {
        title,
        description,
        keywords: gameKeywords,
        category: `${name} Boosting`,
        robots: hasProducts
            ? {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            }
            : { index: false, follow: true }, // Noindex thin empty categories (e.g. 0 products)
        alternates: {
            canonical: gamePath,
        },
        openGraph: {
            title,
            description,
            url: gamePath,
        },
    };
}