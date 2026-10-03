import Image from 'next/image';
import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LandingCatalog from '@/components/LandingCatalog';
import HeroEffects from '@/components/HeroEffects';
import Reveal from '@/components/Reveal';
import ReviewGrid from '@/components/ReviewGrid';
import FaqAccordion from '@/components/FaqAccordion';
import Icon from '@/components/Icon';
import TopBoostingServices from '@/components/TopBoostingServices';
import AnimateOnScroll, { AnimationOnScrollInit } from '@/components/AnimateOnScroll';
import { Link } from '@/i18n/navigation';
import { getApprovedReviews } from '@/lib/reviews';
import { ensureAppSchema } from '@/lib/schema';

export const revalidate = 3600;

export async function generateMetadata() {
    return {
        alternates: {
            canonical: '/',
        },
    };
}

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
    let featuredProducts = [];

    try {
        const sql = neon(process.env.DATABASE_URL);
        await ensureAppSchema(sql);

        const [rows, reviewsData, featuredRows] = await Promise.all([
            sql`
                SELECT g.name, g.image_url, g.mode, COUNT(p.id)::int AS services
                FROM games g
                LEFT JOIN products p ON LOWER(p.game) = LOWER(g.name)
                GROUP BY g.name, g.image_url, g.mode
                ORDER BY COUNT(p.id) DESC, g.name ASC
            `,
            getApprovedReviews(),
            sql`
                SELECT * FROM products
                ORDER BY id DESC
                LIMIT 32
            `,
        ]);
        ladder = rows;
        dbApprovedReviews = reviewsData;
        featuredProducts = featuredRows || [];
    } catch {
        ladder = [];
        dbApprovedReviews = await getApprovedReviews().catch(() => []);
        featuredProducts = [];
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
            <AnimationOnScrollInit />
            {/* Hero Section matching reference banner - Calibrated Proportion */}
            <section aria-label="Hero" className="relative max-w-7xl mx-auto px-5 pt-14 pb-14 sm:pt-20 sm:pb-20 md:pt-24 md:pb-24 lg:pt-28 lg:pb-28 min-h-[520px] sm:min-h-[580px] md:min-h-[640px] flex items-center justify-center text-center">
                <HeroEffects />
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    {/* Centered Brand Logo with Violet Glow */}
                    <div className="relative mb-5 sm:mb-6 flex items-center justify-center">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 w-48 h-14 sm:w-60 sm:h-16 md:w-72 md:h-18 rounded-full bg-[#9d7cff]/30 blur-2xl scale-125 mx-auto"
                        />
                        <Image
                            src="/logo-v3.svg"
                            alt="OG MODZ"
                            width={922}
                            height={176}
                            priority
                            loading="eager"
                            className="relative h-11 sm:h-14 md:h-16 lg:h-18 w-auto object-contain drop-shadow-[0_6px_28px_rgba(146,37,207,0.5)]"
                        />
                    </div>

                    {/* H1 with SEO keywords: Brand Hero Title */}
                    <h1 className="font-['Trebuchet_MS',sans-serif] text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl">
                        {t('heroH1')}{' '}
                        <span className="block text-[#9d7cff] mt-1">{t('heroTitle')}</span>
                    </h1>

                    {/* Subtitle Description */}
                    <p className="text-slate-200 text-sm sm:text-base md:text-lg lg:text-xl mt-4 sm:mt-5 max-w-2xl mx-auto font-normal leading-relaxed">
                        {t('heroSub')}
                    </p>

                    {/* Quick Hero Call To Actions */}
                    <div className="mt-6 sm:mt-8 flex flex-col items-center gap-5">
                        <Link
                            href="/store"
                            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#9d7cff] text-[#0d0914] font-['Trebuchet_MS',sans-serif] font-black text-sm uppercase tracking-wider shadow-[0_6px_24px_rgba(157,124,255,0.45)] hover:bg-[#b59dff] hover:shadow-[0_10px_32px_rgba(157,124,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <span>Explore Store</span>
                            <span className="text-base font-bold">→</span>
                        </Link>

                        {/* Above-The-Fold Trust & Security Verification Bar */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-1 text-xs font-mono text-slate-300">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                                <span className="text-amber-400 font-bold">★ 4.9/5</span>
                                <span className="text-slate-400">Verified Reviews</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-slate-300">100% Anti-Cheat Safe</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                                <span className="text-[#9d7cff]">⚡ 15-Min</span>
                                <span className="text-slate-400">Express Start</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                                <span className="text-emerald-400">✓</span>
                                <span className="text-slate-400">Money-Back Guarantee</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Standings Catalog Funnel */}
            <AnimateOnScroll duration="0.8s" delay="0.1s">
                <LandingCatalog games={ladder} />
            </AnimateOnScroll>

            {/* Top Boosting Services: Horizontal mini-cards with Best Sellers / Featured / New / On Sale filter tabs */}
            <AnimateOnScroll duration="0.8s" delay="0.1s">
                <TopBoostingServices products={featuredProducts} />
            </AnimateOnScroll>

            {/* Tournament Protocol & Service Integrity */}
            <AnimateOnScroll as="section" duration="0.8s" delay="0.1s" aria-label={t('featuresTitle')} className="max-w-7xl mx-auto px-5 py-16 md:py-24 content-auto">
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
                            <Reveal key={feature.title} delay={index * 0.05}>
                                <div className="group relative rounded-2xl border border-white/10 bg-[#141022] p-6 sm:p-7 h-full flex flex-col justify-between overflow-hidden transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(157,124,255,0.12)] motion-reduce:transition-none">
                                    {/* Subtle Top Rim Highlight */}
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                                    {/* Content Container */}
                                    <div>
                                        {/* Header: Icon badge & Protocol Tag */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#9d7cff] group-hover:border-[#9d7cff]/30 group-hover:bg-[#9d7cff]/10 group-hover:scale-105 transition-[transform,background-color,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]">
                                                <Icon
                                                    name={meta.icon}
                                                    className="w-5 h-5"
                                                    strokeWidth={2.2}
                                                />
                                            </div>
                                            <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors duration-200 data-readout">
                                                {meta.tag}
                                            </span>
                                        </div>

                                        {/* Title and Description */}
                                        <div className="mt-5">
                                            <h3 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-[#9d7cff] transition-colors duration-200">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-2.5 text-sm leading-relaxed text-slate-300 font-normal">
                                                {feature.text}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Status Readout */}
                                    <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono tracking-wider uppercase">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#9d7cff]" />
                                            <span className="text-slate-300 font-semibold">{meta.status}</span>
                                        </span>
                                        <span className="data-readout text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                                            VERIFIED
                                        </span>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </AnimateOnScroll>

            {/* Verified Player Reviews */}
            <AnimateOnScroll as="section" duration="0.8s" delay="0.1s" aria-label={t('reviewsTitle')} className="max-w-7xl mx-auto px-5 py-16 md:py-24 content-auto">
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
            </AnimateOnScroll>

            {/* FAQ Section for AI Search (GEO) and Player Trust */}
            <AnimateOnScroll as="section" duration="0.8s" delay="0.1s" aria-label={faqTitle} className="max-w-7xl mx-auto px-5 py-16 md:py-24 content-auto">
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

                <FaqAccordion faqs={faqs} />
            </AnimateOnScroll>

            {/* Closing Conversion Anchor */}
            <AnimateOnScroll as="section" duration="0.8s" delay="0.1s" aria-label="Ready to climb" className="max-w-7xl mx-auto px-5 pb-20 md:pb-28 content-auto">
                <div className="rounded-3xl border border-[#9d7cff]/30 bg-gradient-to-br from-[#1c1533] via-[#140e26] to-[#0e0918] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.5),0_0_40px_rgba(157,124,255,0.12)]">
                    {/* Deep Ambient Glows */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#9d7cff]/20 blur-[90px]"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#7928ca]/20 blur-[90px]"
                    />

                    <div className="max-w-2xl mx-auto relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-[#c8b4ff] mb-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#9d7cff] animate-pulse" />
                            <span>VERIFIED BOOSTING MARKETPLACE</span>
                        </div>

                        <h2 className="display-font text-4xl sm:text-5xl md:text-6xl uppercase text-white leading-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
                            {t('ctaTitle')}
                        </h2>
                        <p className="text-slate-300 text-base sm:text-lg mt-4 max-w-lg mx-auto leading-relaxed font-normal">
                            {t('ctaSub')}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="#landing-search"
                                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#9d7cff] text-[#0d0914] hover:bg-[#b59dff] font-['Trebuchet_MS',sans-serif] text-sm font-black uppercase tracking-wider transition-all duration-150 shadow-[0_4px_20px_rgba(157,124,255,0.4)] hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2"
                            >
                                <span>{t('ctaButton')}</span>
                                <Icon name="arrow-up-right" className="w-4 h-4" strokeWidth={2.4} />
                            </a>
                            <a
                                href="/store"
                                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#9d7cff]/50 hover:text-white font-['Trebuchet_MS',sans-serif] text-sm font-bold uppercase tracking-wider text-slate-200 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2"
                            >
                                <span>{t('ctaSecondary')}</span>
                                <Icon name="arrow-right" className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </AnimateOnScroll>
        </>
    );
}