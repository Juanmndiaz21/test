import { neon } from '@neondatabase/serverless';
import { notFound, permanentRedirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ProductDetail from '@/components/ProductDetail';
import { getServiceOptions } from '@/lib/settings';
import { gameToSlug, parseProductId, productToSlug } from '@/lib/gameSlugs';

export const revalidate = 120;

export default async function ProductPage({ params }) {
    const { locale, id } = await params;
    setRequestLocale(locale);
    const cleanId = parseProductId(id);
    let product = null;
    let relatedProducts = [];
    let options = {};

    try {
        if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);
            await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255)`;
            await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS game VARCHAR(120)`;
            await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
            await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works TEXT`;
            await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS requirements TEXT`;
            await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs TEXT`;

            let products;
            if (cleanId) {
                products = await sql`SELECT * FROM products WHERE id = ${cleanId} LIMIT 1`;
            } else {
                const rawSlug = decodeURIComponent(String(id)).trim().toLowerCase();
                products = await sql`SELECT * FROM products WHERE slug = ${rawSlug} OR id::text = ${rawSlug} LIMIT 1`;
                if (!products || products.length === 0) {
                    const allProducts = await sql`SELECT * FROM products`;
                    const matched = allProducts.find(p => (p.slug || productToSlug(p.name)) === rawSlug);
                    if (matched) products = [matched];
                }
            }
            product = products?.[0] || null;

            if (product) {
                relatedProducts = await sql`
                    SELECT * FROM products
                    WHERE game = ${product.game || ''} AND id <> ${product.id}
                    ORDER BY id DESC
                    LIMIT 4
                `;

                const optRes = await getServiceOptions(sql);
                options = optRes?.options || {};
            }
        }
    } catch (err) {
        console.warn(`ProductPage: Failed to load product "${id}" from DB:`, err.message);
    }

    if (!product) notFound();

    const canonicalSlug = product.slug || productToSlug(product.name);
    if (decodeURIComponent(String(id)) !== canonicalSlug) {
        permanentRedirect(`/store/${canonicalSlug}`);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const localizedProductUrl = `${baseUrl}/store/${canonicalSlug}`;
    const cleanGameSlug = gameToSlug(product.game || 'store');

    const offerValidFrom = product.created_at
        ? new Date(product.created_at).toISOString().split('T')[0]
        : '2024-01-01';

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

    // Schema.org structured data for product page with Breadcrumbs and AggregateRating
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
                        name: product.game || 'Boosts',
                        item: `${baseUrl}/store/game/${cleanGameSlug}`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 4,
                        name: product.name,
                        item: localizedProductUrl,
                    },
                ],
            },
            {
                '@type': 'Product',
                '@id': `${localizedProductUrl}#product`,
                name: product.name,
                description: product.description || `Fast, reliable ${product.name} boosting service for ${product.game}. 100% hand-played by verified professionals with instant delivery.`,
                image: product.image_url ? [product.image_url] : [`${baseUrl}/og-image.png`],
                category: `${product.game || 'Gaming'} Boosting`,
                sku: String(product.id || canonicalSlug),
                mpn: `OGM-${product.id || 'BOOST'}`,
                brand: {
                    '@type': 'Brand',
                    name: 'OGmodz',
                },
                offers: {
                    '@type': 'Offer',
                    url: localizedProductUrl,
                    priceCurrency: 'USD',
                    price: Number(product.price || 0).toFixed(2),
                    priceValidUntil: '2027-12-31',
                    validFrom: offerValidFrom,
                    availability: 'https://schema.org/InStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    seller: {
                        '@type': 'Organization',
                        name: 'OGmodz',
                        url: baseUrl,
                    },
                    hasMerchantReturnPolicy: merchantReturnPolicy,
                    shippingDetails,
                },
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.9',
                    reviewCount: '48',
                    bestRating: '5',
                    worstRating: '1',
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
            <ProductDetail product={product} relatedProducts={relatedProducts} defaultOptions={options} />
        </>
    );
}

export async function generateMetadata({ params }) {
    try {
        const { locale, id } = await params;
        const cleanId = parseProductId(id);
        const sql = neon(process.env.DATABASE_URL);
        let rows;
        if (cleanId) {
            rows = await sql`SELECT id, name, description, game, image_url, slug FROM products WHERE id = ${cleanId} LIMIT 1`;
        } else {
            const rawSlug = decodeURIComponent(String(id)).trim().toLowerCase();
            rows = await sql`SELECT id, name, description, game, image_url, slug FROM products WHERE slug = ${rawSlug} OR id::text = ${rawSlug} LIMIT 1`;
            if (!rows || rows.length === 0) {
                const all = await sql`SELECT id, name, description, game, image_url, slug FROM products`;
                const matched = all.find(p => (p.slug || productToSlug(p.name)) === rawSlug);
                if (matched) rows = [matched];
            }
        }
        const product = rows?.[0];
        if (!product) return {};

        const slug = product.slug || productToSlug(product.name);
        const productPath = `/store/${slug}`;

        const nameLower = (product.name || '').toLowerCase();
        const gameLower = (product.game || '').toLowerCase();
        const isGta = gameLower.includes('gta');
        const isRdr2 = gameLower.includes('rdr') || gameLower.includes('red dead');
        const isCs2 = gameLower.includes('cs') || gameLower.includes('counter');

        let title = `Buy ${product.name} | Fast Delivery at OGmodz`;
        if (isGta) {
            if (nameLower.includes('cash boost')) {
                title = `Buy ${product.name} — GTA 5 Cash Boost | Fast Delivery at OGmodz`;
            } else if (nameLower.includes('car')) {
                title = `Buy ${product.name} — Safe Modded Cars for GTA Online | OGmodz`;
            } else if (nameLower.includes('outfit')) {
                title = `Buy ${product.name} — Exclusive Modded Outfits GTA V | OGmodz`;
            } else if (nameLower.includes('account')) {
                title = `Buy ${product.name} — Safe GTA 5 Modded Accounts | OGmodz`;
            } else if (nameLower.includes('unlock all')) {
                title = `Buy ${product.name} — GTA Online Full Unlock All Service | OGmodz`;
            } else if (nameLower.includes('plane')) {
                title = `Buy ${product.name} — Modded Aircraft & Jets GTA V | OGmodz`;
            } else if (nameLower.includes('rank')) {
                title = `Buy ${product.name} — Fast GTA 5 Level Up Service | OGmodz`;
            }
        } else if (isRdr2) {
            if (nameLower.includes('gold bar')) {
                title = `Buy ${product.name} — Safe RDR2 Gold Bars Service | OGmodz`;
            } else if (nameLower.includes('cash')) {
                title = `Buy ${product.name} — Red Dead Online Money Boost | OGmodz`;
            } else if (nameLower.includes('roles')) {
                title = `Buy ${product.name} — Bounty Hunter, Trader & Collector Max Level | OGmodz`;
            } else if (nameLower.includes('rank')) {
                title = `Buy ${product.name} — Fast RDR2 Online Character Leveling | OGmodz`;
            }
        } else if (isCs2) {
            title = `Buy ${product.name} — Safe Counter-Strike 2 Boost | OGmodz`;
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
        const canonicalUrl = `${baseUrl}${productPath}`;

        const description = product.description
            ? `${product.description.slice(0, 105).trim()}... Fast delivery, 100% account safety with VPN & 24/7 support at OGmodz.`
            : `Buy ${product.name} for ${product.game} at OGmodz. Instant delivery, 100% account safety with VPN, and 24/7 live support. Order online now.`;

        const productKeywords = [
            product.name,
            `buy ${product.name}`,
            `${product.name} boost`,
            `${product.game} ${product.name}`,
            `${product.game} boosting`,
            isGta ? 'GTA V cash boost' : '',
            isGta ? 'GTA 5 money boost' : '',
            isGta ? 'GTA Online modded cars' : '',
            isGta ? 'GTA Online modded accounts' : '',
            isGta ? 'GTA V recovery service' : '',
            isGta ? 'buy GTA 5 money' : '',
            isRdr2 ? 'buy RDR2 gold bars' : '',
            isRdr2 ? 'RDR2 online money boost' : '',
            isRdr2 ? 'RDR2 roles max level' : '',
            isRdr2 ? 'RDR2 bounty hunter boost' : '',
            isRdr2 ? 'Red Dead Online boosting' : '',
            isCs2 ? 'CS2 commends boost' : '',
            isCs2 ? 'CS2 rank boost' : '',
            'buy game boost',
            'instant delivery boost',
            'OGmodz',
        ].filter(Boolean);

        return {
            title,
            description,
            keywords: productKeywords,
            category: `${product.game || 'Gaming'} Boosting`,
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title,
                description,
                url: canonicalUrl,
                images: product.image_url ? [{ url: product.image_url }] : [{ url: '/og-image.png' }],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: product.image_url ? [product.image_url] : ['/og-image.png'],
            },
        };
    } catch {
        return {};
    }
}