import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ProductDetail from '@/components/ProductDetail';
import { getServiceOptions } from '@/lib/settings';

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
    const localizedProductUrl = `${baseUrl}${locale === 'es' ? '/es' : ''}/store/${product.id}`;

    // Schema.org structured data for product page
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${localizedProductUrl}#product`,
        name: product.name,
        description: product.description || `Fast, reliable ${product.name} boosting service for ${product.game}. 100% hand-played by verified professionals.`,
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
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <ProductDetail product={product} relatedProducts={relatedProducts} defaultOptions={options} />
        </>
    );
}

export async function generateMetadata({ params }) {
    try {
        const { locale, id } = await params;
        const isEs = locale === 'es';
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`SELECT name, description, game, image_url FROM products WHERE id = ${id}`;
        const product = rows[0];
        if (!product) return {};

        const enPath = `/store/${id}`;
        const esPath = `/es/store/${id}`;
        const title = `${product.name} — ${product.game || 'Boost'} | OGmodz`;
        const description = product.description
            ? product.description.slice(0, 160)
            : (isEs
                ? `Compra ${product.name} para ${product.game} con entrega rápida y segura en OGmodz.`
                : `Buy ${product.name} for ${product.game} with fast and secure delivery on OGmodz.`);

        return {
            title,
            description,
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
                images: product.image_url ? [{ url: product.image_url }] : [{ url: '/og-image.png' }],
            },
        };
    } catch {
        return {};
    }
}