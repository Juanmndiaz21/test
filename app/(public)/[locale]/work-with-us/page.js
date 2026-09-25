import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';
import PageHeaderBanner from '@/components/PageHeaderBanner';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'workWithUs' });
    const isEs = locale === 'es';
    return {
        title: t('titleMeta'),
        description: t('subtitle'),
        alternates: {
            canonical: isEs ? '/work-with-us' : '/en/work-with-us',
            languages: {
                es: '/work-with-us',
                en: '/en/work-with-us',
                'x-default': '/work-with-us',
            },
        },
    };
}

export default async function WorkWithUsPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('workWithUs');

    return (
        <div className="min-h-screen bg-[#1A1A24] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 py-10 sm:py-12">
                {/* Perks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                    <Reveal delay={0.05}>
                        <div className="rounded-xl bg-[#252530] p-6 h-full flex flex-col justify-between">
                            <div>
                                <span className="w-10 h-10 rounded-lg bg-[#9333EA] text-white flex items-center justify-center mb-4">
                                    <Icon name="bolt" className="w-5 h-5" />
                                </span>
                                <h3 className="font-['Trebuchet_MS',sans-serif] font-bold text-white text-lg mb-2">
                                    {t('perk1Title')}
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {t('perk1Text')}
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="rounded-xl bg-[#252530] p-6 h-full flex flex-col justify-between">
                            <div>
                                <span className="w-10 h-10 rounded-lg bg-[#9333EA] text-white flex items-center justify-center mb-4">
                                    <Icon name="clock" className="w-5 h-5" />
                                </span>
                                <h3 className="font-['Trebuchet_MS',sans-serif] font-bold text-white text-lg mb-2">
                                    {t('perk2Title')}
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {t('perk2Text')}
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.15}>
                        <div className="rounded-xl bg-[#252530] p-6 h-full flex flex-col justify-between">
                            <div>
                                <span className="w-10 h-10 rounded-lg bg-[#9333EA] text-white flex items-center justify-center mb-4">
                                    <Icon name="crown" className="w-5 h-5" />
                                </span>
                                <h3 className="font-['Trebuchet_MS',sans-serif] font-bold text-white text-lg mb-2">
                                    {t('perk3Title')}
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {t('perk3Text')}
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Requirements & Call to Action */}
                <Reveal delay={0.2}>
                    <div className="rounded-xl bg-[#252530] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h2 className="font-['Trebuchet_MS',sans-serif] text-2xl font-bold text-white mb-4">
                                {t('reqTitle')}
                            </h2>
                            <ul className="space-y-2.5 text-sm text-slate-300">
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[#9333EA] font-bold mt-0.5">✓</span>
                                    <span>{t('req1')}</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[#9333EA] font-bold mt-0.5">✓</span>
                                    <span>{t('req2')}</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[#9333EA] font-bold mt-0.5">✓</span>
                                    <span>{t('req3')}</span>
                                </li>
                            </ul>
                        </div>

                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-[#9333EA] text-white hover:bg-[#8229b8] font-['Trebuchet_MS',sans-serif] text-sm font-bold uppercase tracking-wider transition-all duration-150 shrink-0"
                        >
                            <span>{t('applyButton')}</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </div>
    );
}
