import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ProductDetail from '@/components/ProductDetail';
import { getServiceOptions } from '@/lib/settings';
import { gameToSlug } from '@/lib/gameSlugs';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }) {
    const { locale, id } = await params;
    setRequestLocale(locale);
    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS game VARCHAR(120)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS requirements TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs TEXT`;
    const products = await sql`SELECT * FROM products WHERE id = ${id}`;
    const product = products[0];

    if (!product) notFound();

    const relatedProducts = await sql`
        SELECT * FROM products
        WHERE game = ${product.game || ''} AND id <> ${product.id}
        ORDER BY id DESC
        LIMIT 4
    `;

    const { options } = await getServiceOptions(sql);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const localizedProductUrl = `${baseUrl}/store/${product.id}`;
    const cleanGameSlug = gameToSlug(product.game || 'store');

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
                    availability: 'https://schema.org/InStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    seller: {
                        '@type': 'Organization',
                        name: 'OGmodz',
                        url: baseUrl,
                    },
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
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`SELECT name, description, game, image_url FROM products WHERE id = ${id}`;
        const product = rows[0];
        if (!product) return {};

        const isCashBoost = product.name?.toLowerCase().includes('cash boost');
        const isGta = product.game?.toLowerCase().includes('gta');

        let title = `Buy ${product.name} | Fast Delivery at OGmodz`;
        if (isGta && isCashBoost) {
            title = `Buy ${product.name} — GTA 5 Cash Boost | Fast Delivery at OGmodz`;
        }

        const description = product.description
            ? `${product.description.slice(0, 115).trim()}. Instant delivery, 100% safe methods, and 24/7 support at OGmodz.`
            : `Buy ${product.name} for ${product.game} at OGmodz. Instant delivery, 100% account safety guaranteed, and 24/7 live support. Choose your platform and amount now.`;

        const productKeywords = [
            product.name,
            `buy ${product.name}`,
            `${product.name} boost`,
            `${product.game} ${product.name}`,
            `${product.game} boosting`,
            isCashBoost ? 'GTA V cash boost' : '',
            isCashBoost ? 'GTA 5 money boost' : '',
            isCashBoost ? 'GTA Online cash boost' : '',
            isCashBoost ? 'GTA Online money service' : '',
            isGta ? 'GTA V recovery service' : '',
            isGta ? 'buy GTA 5 money' : '',
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
                canonical: productPath,
            },
            openGraph: {
                title,
                description,
                url: productPath,
                images: product.image_url ? [{ url: product.image_url }] : [{ url: '/og-image.png' }],
            },
        };
    } catch {
        return {};
    }
}