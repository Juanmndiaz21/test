import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LandingCatalog from '@/components/LandingCatalog';
import HeroEffects from '@/components/HeroEffects';
import Reveal from '@/components/Reveal';
import ReviewGrid from '@/components/ReviewGrid';
import Icon from '@/components/Icon';
import { getApprovedReviews } from '@/lib/reviews';
import { ensureAppSchema } from '@/lib/schema';

export const revalidate = 3600;

const FEATURE_META = [
    {
        icon: 'gamepad',
        tag: 'PROTOCOL / MODES',
        status: 'MP + SP',
    },
    {
        icon: 'bolt',
        tag: 'PROTOCOL / BOOST',
        status: 'CUSTOM',
    },
    {
        icon: 'store',
        tag: 'PROTOCOL / LIVE',
        status: 'REALTIME',
    },
    {
        icon: 'headset',
        tag: 'PROTOCOL / 24·7',
        status: 'DIRECT',
    },
];

export default async function Home({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('home');

    let ladder = [];
    let dbApprovedReviews = [];

    try {
        const sql = neon(process.env.DATABASE_URL);
        await ensureAppSchema(sql);

        const [rows, reviewsData] = await Promise.all([
            sql`
                SELECT g.name, g.image_url, g.mode, COUNT(p.id)::int AS services
                FROM games g
                LEFT JOIN products p ON LOWER(p.game) = LOWER(g.name)
                GROUP BY g.name, g.image_url, g.mode
                ORDER BY COUNT(p.id) DESC, g.name ASC
            `,
            getApprovedReviews(),
        ]);
        ladder = rows;
        dbApprovedReviews = reviewsData;
    } catch {
        ladder = [];
        dbApprovedReviews = await getApprovedReviews().catch(() => []);
    }

    const features = t.raw('features') ?? [];
    const fallbackReviews = t.raw('reviews') ?? [];
    const reviews = (dbApprovedReviews && dbApprovedReviews.length > 0) ? dbApprovedReviews : fallbackReviews;
    const faqs = t.raw('faqs') ?? [];
    const faqTitle = t('faqTitle');
    const faqSubtitle = t('faqSubtitle');

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (faqs || []).map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
            },
        })),
    };

    return (
        <>
            {/* Hero Section matching reference banner */}
            <section aria-label="Hero" className="relative max-w-7xl mx-auto px-5 pt-12 pb-10 md:pt-16 md:pb-14 text-center">
                <HeroEffects />
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    {/* Centered Brand Logo with Violet Glow */}
                    <div className="relative mb-5">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#9d7cff]/30 blur-2xl scale-125 mx-auto"
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt="OGmodz"
                            className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_4px_20px_rgba(157,124,255,0.45)]"
                        />
                    </div>

                    {/* H1 with SEO keywords: Game Boosting Services + Brand Hero Title */}
                    <h1 className="font-['Trebuchet_MS',sans-serif] text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mt-1 sm:mt-2">
                        Game Boosting Services{' '}
                        <span className="block text-[#9d7cff]">{t('heroTitle')}</span>
                    </h1>

                    {/* Subtitle Description */}
                    <p className="text-slate-300 text-sm sm:text-base md:text-lg mt-4 max-w-2xl mx-auto font-normal leading-relaxed">
                        {t('heroSub')}
                    </p>
                </div>
            </section>

            {/* Standings Catalog Funnel */}
            <LandingCatalog games={ladder} />

            {/* Tournament Protocol & Service Integrity */}
            <section aria-label={t('featuresTitle')} className="max-w-7xl mx-auto px-5 py-16 md:py-24">
                <div className="flex items-center gap-4 mb-12">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                            <Icon name="sparkles" className="w-5 h-5" />
                        </span>
                        <h2 className="display-font text-4xl md:text-5xl uppercase text-white">{t('featuresTitle')}</h2>
                    </div>
                    <div className="h-px bg-white/10 flex-1" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {(features || []).map((feature, index) => {
                        const meta = FEATURE_META[index % FEATURE_META.length];
                        return (
                            <Reveal key={feature.title} delay={index * 0.08}>
                                <div className="group relative rounded-2xl border border-white/10 bg-[#171229] p-7 md:p-8 h-full flex flex-col justify-between overflow-hidden transition-colors duration-150 hover:border-[#9d7cff]/60 shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
                                    {/* Content Container */}
                                    <div>
                                        {/* Header: Icon badge & Protocol Tag */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#9d7cff]/20 bg-[#9d7cff]/10 text-[#9d7cff] shadow-sm">
                                                <Icon
                                                    name={meta.icon}
                                                    className="w-5 h-5"
                                                    strokeWidth={2.2}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-slate-400 group-hover:text-[#9d7cff] transition-colors">
                                                <span className="data-readout">{meta.tag}</span>
                                                <Icon
                                                    name="arrow-up-right"
                                                    className="w-3.5 h-3.5 opacity-60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                    strokeWidth={2.4}
                                                />
                                            </div>
                                        </div>

                                        {/* Title and Description with WCAG AA Contrast */}
                                        <div className="mt-6">
                                            <h3 className="font-['Trebuchet_MS',sans-serif] text-xl font-bold text-white tracking-tight transition-colors duration-150 group-hover:text-[#9d7cff]">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                                {feature.text}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Status Readout */}
                                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono tracking-wider uppercase">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9d7cff]" />
                                            </span>
                                            <span className="text-slate-300 font-semibold">{meta.status}</span>
                                        </span>
                                        <span className="data-readout text-slate-400 group-hover:text-slate-200 transition-colors font-bold">
                                            VERIFIED
                                        </span>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            {/* Verified Player Reviews */}
            <section aria-label={t('reviewsTitle')} className="max-w-7xl mx-auto px-5 py-16 md:py-24">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                            <Icon name="star" className="w-5 h-5" />
                        </span>
                        <h2 className="display-font text-4xl md:text-5xl uppercase text-white">{t('reviewsTitle')}</h2>
                    </div>
                    <div className="h-px bg-white/10 flex-1" />
                </div>
                <p className="text-sm text-slate-300 mb-10">
                    {t('reviewsNote')}
                </p>
                <ReviewGrid reviews={reviews} starsAria={t('starsAria')} />
            </section>

            {/* FAQ Section for AI Search (GEO) and Player Trust */}
            <section aria-label={faqTitle} className="max-w-7xl mx-auto px-5 py-16 md:py-24">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                            <Icon name="circle-help" className="w-5 h-5" />
                        </span>
                        <h2 className="display-font text-4xl md:text-5xl uppercase text-white">{faqTitle}</h2>
                    </div>
                    <div className="h-px bg-white/10 flex-1" />
                </div>
                <p className="text-sm text-slate-300 mb-10 max-w-2xl">
                    {faqSubtitle}
                </p>

                <div className="grid md:grid-cols-2 gap-5">
                    {(faqs || []).map((faq, i) => (
                        <div
                            key={i}
                            className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 sm:p-7 flex flex-col justify-between hover:border-[#9d7cff]/40 transition-colors shadow-[0_16px_36px_rgba(0,0,0,0.25)]"
                        >
                            <h3 className="font-['Trebuchet_MS',sans-serif] text-lg font-bold text-white mb-3 flex items-start gap-2.5">
                                <span className="text-[#9d7cff] font-mono text-sm font-black mt-0.5">[{`0${i + 1}`}]</span>
                                <span>{faq.q}</span>
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed font-normal">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Closing Conversion Anchor */}
            <section aria-label="Ready to climb" className="max-w-7xl mx-auto px-5 pb-20 md:pb-28">
                <div className="panel-surface rounded-3xl border border-white/10 bg-[#171229] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                    <div className="max-w-2xl mx-auto relative z-10">
                        <span className="eyebrow inline-block mb-3 text-[#9d7cff]">SEASON STANDINGS ACTIVE</span>
                        <h2 className="display-font text-4xl sm:text-5xl md:text-6xl uppercase text-white leading-tight">
                            {t('ctaTitle')}
                        </h2>
                        <p className="text-slate-300 text-base sm:text-lg mt-4 max-w-lg mx-auto leading-relaxed">
                            {t('ctaSub')}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="#landing-search"
                                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#9d7cff] text-[#0d0914] hover:bg-[#b59dff] font-['Trebuchet_MS',sans-serif] text-sm font-black uppercase tracking-wider transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2"
                            >
                                <span>{t('ctaButton')}</span>
                                <Icon name="arrow-up-right" className="w-4 h-4" strokeWidth={2.4} />
                            </a>
                            <a
                                href="/store"
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:border-[#9d7cff]/50 hover:text-white font-['Trebuchet_MS',sans-serif] text-sm font-bold uppercase tracking-wider text-slate-300 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2"
                            >
                                <span>{t('ctaSecondary')}</span>
                                <Icon name="arrow-right" className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}