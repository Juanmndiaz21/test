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
            sameAs: ['https://discord.gg/qwyQjn4Aqx'],
        },
    };

    const pillars = [
        {
            icon: 'shield-check',
            title: t('pillar1Title'),
            desc: t('pillar1Text'),
            badge: '100% MANUAL',
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
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
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
                    <section className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-7 sm:p-10 shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                                <Icon name="sparkles" className="w-5 h-5" />
                            </span>
                            <h2 className="display-font text-3xl sm:text-4xl uppercase text-white">
                                {t('missionTitle')}
                            </h2>
                        </div>
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal mt-4">
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
                                    className="panel-surface rounded-2xl border border-white/10 bg-[#141022] p-6 sm:p-7 flex flex-col justify-between hover:border-[#9d7cff]/40 transition-[border-color,transform] duration-200"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff] flex items-center justify-center">
                                                <Icon name={pillar.icon} className="w-5 h-5" />
                                            </div>
                                            <span className="font-mono text-[11px] font-bold tracking-wider text-[#9d7cff] bg-[#9d7cff]/10 px-2.5 py-1 rounded-full border border-[#9d7cff]/20 uppercase">
                                                {pillar.badge}
                                            </span>
                                        </div>
                                        <h3 className="font-['Trebuchet_MS',sans-serif] text-lg font-bold text-white mb-2">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">
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
                    <section className="rounded-2xl border border-[#9d7cff]/30 bg-gradient-to-br from-[#1b1431] to-[#120e1e] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                        <h3 className="display-font text-3xl uppercase text-white mb-3">
                            Ready to Boost Your Game?
                        </h3>
                        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-6">
                            Explore our live catalog of GTA V, CS2, and Red Dead Redemption 2 services with instant dispatch and guaranteed safety.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/store"
                                className="px-6 py-3 rounded-xl bg-[#9d7cff] text-[#0d0914] hover:bg-[#b59dff] font-['Trebuchet_MS',sans-serif] text-sm font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                            >
                                <span>Browse Services</span>
                                <Icon name="arrow-right" className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:border-[#9d7cff]/50 text-slate-200 hover:text-white font-['Trebuchet_MS',sans-serif] text-sm font-bold uppercase tracking-wider transition-colors"
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
