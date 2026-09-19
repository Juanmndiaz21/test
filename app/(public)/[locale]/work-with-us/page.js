import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'workWithUs' });
    return {
        title: t('titleMeta'),
        description: t('subtitle'),
    };
}

export default async function WorkWithUsPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('workWithUs');

    return (
        <div className="max-w-4xl mx-auto px-5 py-12 md:py-16">
            <p className="eyebrow mb-3 text-[#9d7cff]">{t('eyebrow')}</p>
            <h1 className="display-font text-4xl sm:text-6xl uppercase text-white mb-4">{t('title')}</h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mb-12 leading-relaxed">
                {t('subtitle')}
            </p>

            {/* Perks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                <Reveal delay={0.05}>
                    <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 h-full flex flex-col justify-between">
                        <div>
                            <span className="w-10 h-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff] flex items-center justify-center mb-4">
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
                    <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 h-full flex flex-col justify-between">
                        <div>
                            <span className="w-10 h-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff] flex items-center justify-center mb-4">
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
                    <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 h-full flex flex-col justify-between">
                        <div>
                            <span className="w-10 h-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff] flex items-center justify-center mb-4">
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
                <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h2 className="display-font text-2xl uppercase text-white mb-4">
                            {t('reqTitle')}
                        </h2>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                            <li className="flex items-start gap-2.5">
                                <span className="text-[#9d7cff] font-bold mt-0.5">✓</span>
                                <span>{t('req1')}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-[#9d7cff] font-bold mt-0.5">✓</span>
                                <span>{t('req2')}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-[#9d7cff] font-bold mt-0.5">✓</span>
                                <span>{t('req3')}</span>
                            </li>
                        </ul>
                    </div>

                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#9d7cff] text-[#0d0914] hover:bg-[#b59dff] font-['Trebuchet_MS',sans-serif] text-sm font-black uppercase tracking-wider transition-all duration-150 shrink-0"
                    >
                        <span>{t('applyButton')}</span>
                        <Icon name="arrow-right" className="w-4 h-4" />
                    </Link>
                </div>
            </Reveal>
        </div>
    );
}

