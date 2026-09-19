import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ProductList from '@/components/ProductList';

import { ensureAppSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'store' });
    return {
        title: t('titleMeta'),
        description: t('subtitle'),
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
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <p className="eyebrow mb-3">{t('eyebrow')}</p>
                    <h1 className="display-font text-5xl md:text-6xl uppercase text-white">{t('title')}</h1>
                    <p className="text-slate-400 mt-3 max-w-xl">{t('subtitle')}</p>
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 border border-white/10 rounded-full px-4 py-2">{t('liveCatalog')}</div>
            </div>

            <ProductList products={products} games={games} />
        </div>
    );
}