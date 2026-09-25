import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';
import PageHeaderBanner from '@/components/PageHeaderBanner';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'refunds' });
    const isEs = locale === 'es';
    return {
        title: t('titleMeta'),
        description: t('sec1Text'),
        alternates: {
            canonical: isEs ? '/refunds' : '/en/refunds',
            languages: {
                es: '/refunds',
                en: '/en/refunds',
                'x-default': '/refunds',
            },
        },
    };
}

export default async function RefundsPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('refunds');

    return (
        <div className="min-h-screen bg-[#1A1A24] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('lastUpdated')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 py-10 sm:py-12">
                <div className="space-y-4">
                    <Reveal delay={0.05}>
                        <div className="rounded-xl bg-[#252530] p-6 sm:p-7">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="w-9 h-9 rounded-lg bg-[#9333EA] text-white flex items-center justify-center shrink-0">
                                    <Icon name="shield" className="w-5 h-5" />
                                </span>
                                <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white">
                                    {t('sec1Title')}
                                </h2>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                                {t('sec1Text')}
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="rounded-xl bg-[#252530] p-6 sm:p-7">
                            <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2.5">
                                {t('sec2Title')}
                            </h2>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                                {t('sec2Text')}
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.15}>
                        <div className="rounded-xl bg-[#252530] p-6 sm:p-7">
                            <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2.5">
                                {t('sec3Title')}
                            </h2>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                                {t('sec3Text')}
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.2}>
                        <div className="rounded-xl bg-[#252530] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2">
                                    {t('sec4Title')}
                                </h2>
                                <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl">
                                    {t('sec4Text')}
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#9333EA] text-white hover:bg-[#8229b8] font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                            >
                                <span>Contact Support</span>
                                <Icon name="arrow-right" className="w-4 h-4" />
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
}
