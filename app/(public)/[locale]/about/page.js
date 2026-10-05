import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import Icon from '@/components/Icon';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'about' });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');

    return {
        title: t('titleMeta'),
        description: t('subtitle'),
        alternates: {
            canonical: '/about',
        },
        openGraph: {
            title: t('titleMeta'),
            description: t('subtitle'),
            url: '/about',
        },
    };
}

export default async function AboutPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('about');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');

    const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: t('titleMeta'),
        description: t('subtitle'),
        url: `${baseUrl}/about`,
        mainEntity: {
            '@type': 'Organization',
            name: 'OGmodz',
            url: baseUrl,
            logo: `${baseUrl}/logo.png`,
            sameAs: ['https://discord.gg/eaYMP2hnm4'],
        },
    };

    const pillars = [
        {
            icon: 'shield-check',
            title: t('pillar1Title'),
            desc: t('pillar1Text'),
            badge: 'VERIFIED EXPERTS',
        },
        {
            icon: 'lock',
            title: t('pillar2Title'),
            desc: t('pillar2Text'),
            badge: 'VPN ENCRYPTED',
        },
        {
            icon: 'badge-dollar-sign',
            title: t('pillar3Title'),
            desc: t('pillar3Text'),
            badge: 'MONEY-BACK',
        },
        {
            icon: 'headset',
            title: t('pillar4Title'),
            desc: t('pillar4Text'),
            badge: '24/7 LIVE',
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 py-10 sm:py-12 space-y-12">
                {/* Mission Section */}
                <Reveal>
                    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-7 sm:p-10 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                <Icon name="sparkles" className="w-5 h-5" />
                            </span>
                            <h2 className="display-font text-3xl sm:text-4xl uppercase text-white">
                                {t('missionTitle')}
                            </h2>
                        </div>
                        <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-normal mt-4">
                            {t('missionText')}
                        </p>
                    </section>
                </Reveal>

                {/* Trust Pillars Grid */}
                <Reveal delay={0.1}>
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="display-font text-3xl uppercase text-white">Security & Integrity Standards</h2>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {pillars.map((pillar) => (
                                <div
                                    key={pillar.title}
                                    className="rounded-2xl border border-white/10 bg-zinc-900 p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/40 transition-[border-color,transform] duration-200"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                                                <Icon name={pillar.icon} className="w-5 h-5" />
                                            </div>
                                            <span className="font-mono text-[11px] font-bold tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase">
                                                {pillar.badge}
                                            </span>
                                        </div>
                                        <h3 className="font-['Trebuchet_MS',sans-serif] text-lg font-bold text-white mb-2">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {pillar.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </Reveal>

                {/* Direct Action Hub */}
                <Reveal delay={0.2}>
                    <section className="rounded-2xl border border-emerald-500/30 bg-zinc-900 p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <h3 className="display-font text-3xl uppercase text-white mb-3 relative z-10">
                            Ready to Boost Your Game?
                        </h3>
                        <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto mb-6 relative z-10">
                            Explore our live catalog of GTA V, CS2, and Red Dead Redemption 2 services with instant dispatch and guaranteed safety.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                            <Link
                                href="/store"
                                className="px-6 py-3 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-['Trebuchet_MS',sans-serif] text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] inline-flex items-center gap-2 cursor-pointer"
                            >
                                <span>Browse Services</span>
                                <Icon name="arrow-right" className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:border-emerald-500/50 text-zinc-200 hover:text-white font-['Trebuchet_MS',sans-serif] text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </section>
                </Reveal>
            </div>
        </div>
    );
}
