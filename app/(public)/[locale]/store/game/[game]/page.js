import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameCategoryBanner from '@/components/GameCategoryBanner';
import GameServicesCatalog from '@/components/GameServicesCatalog';
import { ensureAppSchema } from '@/lib/schema';
import { slugToGameName, gameToSlug, productToSlug } from '@/lib/gameSlugs';

export const revalidate = 120;

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

    const isGta = game.toLowerCase().includes('gta');
    const isCs = game.toLowerCase().includes('cs');
    const isRdr = game.toLowerCase().includes('rdr') || game.toLowerCase().includes('red dead');

    const faqs = isGta
        ? [
            {
                q: 'How does GTA 5 Cash Boost work on OGmodz?',
                a: 'Our verified boosters access your GTA Online account using secure encrypted VPN connections matching your region to safely deliver GTA$ directly without triggering security flags.',
            },
            {
                q: 'Is GTA 5 money boosting safe from bans?',
                a: 'Yes. OGmodz employs private, tested stealth transfer methods with an unblemished 0% ban rate record. Every order is backed by full customer warranty and 24/7 support.',
            },
            {
                q: 'How long does delivery take for GTA 5 boost services?',
                a: 'Most GTA 5 boost orders start within 15 minutes of checkout and are completely fulfilled within 1 to 2 hours.',
            },
        ]
        : isCs
        ? [
            {
                q: 'How does CS2 rank boosting work?',
                a: 'Professional, top-tier Counter-Strike 2 players team up with you (Duo) or play directly on your account using private VPN routing to boost your Premier rating or Competitive skill group.',
            },
            {
                q: 'Do boosters use cheats or third-party software?',
                a: 'Never. All boosting at OGmodz is performed 100% legitimately by vetted high-rank players with thousands of verified hours.',
            },
            {
                q: 'How fast will my CS2 boost start?',
                a: 'Boosters are assigned and begin playing within 15 to 30 minutes of order placement.',
            },
        ]
        : isRdr
        ? [
            {
                q: 'How does Red Dead Online gold & cash boosting work?',
                a: 'Our boosters use private session methods and secure VPN encryption to deliver gold bars, cash, and role leveling safely to your Red Dead Online character.',
            },
            {
                q: 'Is RDR2 boosting safe for my account?',
                a: 'Yes, we only utilize non-invasive, safe recovery techniques that keep your Rockstar account completely safe.',
            },
        ]
        : [
            {
                q: `How does ${game} boosting work?`,
                a: `Experienced professional players handle your order quickly and safely using encrypted VPN connections to deliver ${game} progression, levels, or in-game currency.`,
            },
            {
                q: `Is ${game} boosting safe?`,
                a: `Yes, we prioritize customer account security above all else. Every order is protected by regional VPN routing and private booster protocols.`,
            },
        ];

    const validPrices = products.map((p) => Number(p.price || 0)).filter((p) => p > 0);
    const lowPrice = validPrices.length ? Math.min(...validPrices).toFixed(2) : '9.99';
    const highPrice = validPrices.length ? Math.max(...validPrices).toFixed(2) : '199.99';
    const offerCount = products.length || 1;

    const merchantReturnPolicy = {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnOnline',
        returnFees: 'https://schema.org/FreeReturn',
        refundType: 'https://schema.org/FullRefund',
        url: `${baseUrl}/refunds`,
    };

    const shippingDetails = [
        {
            '@type': 'OfferShippingDetails',
            shippingRate: {
                '@type': 'MonetaryAmount',
                value: '0.00',
                currency: 'USD',
            },
            shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'US',
            },
            deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
                    unitCode: 'd',
                },
                transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
                    unitCode: 'd',
                },
            },
        },
    ];

    // Schema.org structured data for game services category, breadcrumbs, AggregateOffer & FAQPage
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
                offers: {
                    '@type': 'AggregateOffer',
                    lowPrice,
                    highPrice,
                    priceCurrency: 'USD',
                    offerCount,
                    offers: products.map((product) => ({
                        '@type': 'Offer',
                        name: product.name,
                        description: product.description || `${product.name} boost for ${game}`,
                        price: Number(product.price || 0).toFixed(2),
                        priceCurrency: 'USD',
                        priceValidUntil: '2027-12-31',
                        validFrom: product.created_at
                            ? new Date(product.created_at).toISOString().split('T')[0]
                            : '2024-01-01',
                        availability: 'https://schema.org/InStock',
                        itemCondition: 'https://schema.org/NewCondition',
                        url: `${baseUrl}/store/${product.slug || productToSlug(product.name)}`,
                        hasMerchantReturnPolicy: merchantReturnPolicy,
                        shippingDetails,
                    })),
                },
            },
            {
                '@type': 'FAQPage',
                '@id': `${localizedGameUrl}#faq`,
                mainEntity: faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.q,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.a,
                    },
                })),
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const gamePath = `/store/game/${cleanSlug}`;
    const canonicalUrl = `${baseUrl}${gamePath}`;

    const isGta = name.toLowerCase().includes('gta');
    const isCs = name.toLowerCase().includes('cs');
    const isRdr = name.toLowerCase().includes('rdr') || name.toLowerCase().includes('red dead');

    let title = `${t('titleMeta', { game: name })} | OGmodz`;
    let description = t('metadataDescription', { game: name });

    if (isGta) {
        title = 'Buy GTA 5 Cash Boost, Money & Modded Accounts | Fast Delivery at OGmodz';
        description = 'Buy GTA 5 cash boost & money services at OGmodz. Instant delivery, 100% safe recovery methods, and 24/7 priority support for PC, PS5, PS4 & Xbox.';
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
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}