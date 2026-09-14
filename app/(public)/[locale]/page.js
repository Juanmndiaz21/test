import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LandingCatalog from '@/components/LandingCatalog';
import HeroEffects from '@/components/HeroEffects';
import Reveal from '@/components/Reveal';
import ReviewGrid from '@/components/ReviewGrid';
import Icon from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function Home({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('home');

    let ladder = [];

    try {
        const sql = neon(process.env.DATABASE_URL);
        await sql`
            CREATE TABLE IF NOT EXISTS games (
                id SERIAL PRIMARY KEY,
                name VARCHAR(120) UNIQUE NOT NULL,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                platform VARCHAR(80),
                boost_amount INTEGER,
                game VARCHAR(120)
            )
        `;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
        const rows = await sql`
            SELECT g.name, g.image_url, g.mode, COUNT(p.id)::int AS services
            FROM games g
            LEFT JOIN products p ON LOWER(p.game) = LOWER(g.name)
            GROUP BY g.name, g.image_url, g.mode
            ORDER BY COUNT(p.id) DESC, g.name ASC
        `;
        ladder = rows;
    } catch {
        ladder = [];
    }

    const features = t.raw('features') ?? [];
    const reviews = t.raw('reviews') ?? [];

    return (
        <>
            <section className="relative max-w-7xl mx-auto px-5 pt-16 md:pt-24">
                <HeroEffects />
                <div className="max-w-3xl relative">
                    <h1 className="display-font text-6xl md:text-8xl leading-[0.9] uppercase">
                        {t('heroTitleA')}
                        <span className="block text-lime-300">{t('heroTitleB')}</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl mt-8 leading-relaxed max-w-xl">
                        {t('heroSub')}
                    </p>
                </div>
            </section>

            <LandingCatalog games={ladder} />

            <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
                <div className="flex items-center gap-4 mb-12">
                    <h2 className="display-font text-4xl md:text-5xl uppercase text-white">{t('featuresTitle')}</h2>
                    <div className="h-px bg-white/10 flex-1" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {(features || []).map((feature, index) => (
                        <Reveal key={feature.title} delay={index * 0.06}>
                            <div className="panel-surface rounded-2xl p-7 md:p-8 h-full transition-colors hover:border-lime-300/40">
                                <Icon name="arrow-up-right" className="text-lime-300 w-6 h-6" />
                                <h3 className="text-xl font-black text-white mt-5">{feature.title}</h3>
                                <p className="text-slate-400 mt-3 leading-relaxed">{feature.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="display-font text-4xl md:text-5xl uppercase text-white">{t('reviewsTitle')}</h2>
                    <div className="h-px bg-white/10 flex-1" />
                </div>
                <p className="text-sm text-slate-400 mb-10">
                    {t('reviewsNote')}
                </p>
                <ReviewGrid reviews={reviews} starsAria={t('starsAria')} />
            </section>
        </>
    );
}