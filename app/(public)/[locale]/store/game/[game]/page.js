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

    if (!game || !gameRows[0]) notFound();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const localizedGameUrl = `${baseUrl}${locale === 'es' ? '/es' : ''}/store/game/${encodeURIComponent(game)}`;

    // Schema.org structured data for game services category & offers
    const jsonLd = {
        '@context': 'https://schema.org',
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
                url: `${baseUrl}${locale === 'es' ? '/es' : ''}/store/${product.id}`,
            })),
        },
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

                <GameServicesCatalog products={products} />
            </div>
        </>
    );
}

export async function generateMetadata({ params }) {
    const { locale, game: encodedGame } = await params;
    const t = await getTranslations({ locale, namespace: 'gamePage' });
    const name = decodeURIComponent(encodedGame);
    const isEs = locale === 'es';

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

    const enPath = `/store/game/${encodeURIComponent(name)}`;
    const esPath = `/es/store/game/${encodeURIComponent(name)}`;
    const title = `${t('titleMeta', { game: name })} | OGmodz`;
    const description = t('metadataDescription', { game: name });

    const isGta = name.toLowerCase().includes('gta');
    const isCs = name.toLowerCase().includes('cs');

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
        isCs ? 'CS2 boosting' : '',
        isCs ? 'CS2 commendations' : '',
        isCs ? 'Counter-Strike 2 premier boost' : '',
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
            canonical: isEs ? esPath : enPath,
            languages: {
                en: enPath,
                es: esPath,
                'x-default': enPath,
            },
        },
        openGraph: {
            title,
            description,
            url: isEs ? esPath : enPath,
        },
    };
}