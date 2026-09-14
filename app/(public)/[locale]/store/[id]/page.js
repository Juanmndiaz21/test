import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ProductDetail from '@/components/ProductDetail';

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

    return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}

export async function generateMetadata({ params }) {
    try {
        const { id } = await params;
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`SELECT name FROM products WHERE id = ${id}`;
        const name = rows[0]?.name;
        return { title: name };
    } catch {
        return {};
    }
}