import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProductList from '@/components/ProductList';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import { ensureAppSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';

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

    const sql = neon(process.env.DATABASE_URL);
    await ensureAppSchema(sql);

    const [products, games] = await Promise.all([
        sql`SELECT * FROM products ORDER BY id DESC`,
        sql`SELECT name, image_url FROM games ORDER BY name ASC`,
    ]);

    return (
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
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