import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProductList from '@/components/ProductList';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import { ensureAppSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'store' });
    const isEs = locale === 'es';
    return {
        title: t('titleMeta'),
        description: t('subtitle'),
        alternates: {
            canonical: isEs ? '/store' : '/en/store',
            languages: {
                es: '/store',
                en: '/en/store',
                'x-default': '/store',
            },
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
        <div className="min-h-screen bg-[#1A1A24] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                badge={t('liveCatalog')}
                maxWidth="max-w-7xl"
            />

            <div className="max-w-7xl mx-auto px-5 py-10 sm:py-12">
                <ProductList products={products} games={games} />
            </div>
        </div>
    );
}