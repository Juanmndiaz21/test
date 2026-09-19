import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'refunds' });
    return {
        title: t('titleMeta'),
        description: t('sec1Text'),
    };
}

export default async function RefundsPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('refunds');

    return (
        <div className="max-w-4xl mx-auto px-5 py-12 md:py-16">
            <p className="eyebrow mb-3 text-[#9d7cff]">{t('eyebrow')}</p>
            <h1 className="display-font text-4xl sm:text-5xl uppercase text-white mb-2">{t('title')}</h1>
            <p className="text-xs font-mono text-slate-400 mb-10 data-readout">{t('lastUpdated')}</p>

            <div className="space-y-6">
                <Reveal delay={0.05}>
                    <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-9 h-9 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff] flex items-center justify-center">
                                <Icon name="shield" className="w-5 h-5" />
                            </span>
                            <h2 className="font-['Trebuchet_MS',sans-serif] text-xl font-bold text-white">
                                {t('sec1Title')}
                            </h2>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                            {t('sec1Text')}
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 sm:p-8">
                        <h2 className="font-['Trebuchet_MS',sans-serif] text-xl font-bold text-white mb-3">
                            {t('sec2Title')}
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                            {t('sec2Text')}
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={0.15}>
                    <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 sm:p-8">
                        <h2 className="font-['Trebuchet_MS',sans-serif] text-xl font-bold text-white mb-3">
                            {t('sec3Title')}
                        </h2>
                        <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                            {t('sec3Text')}
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
                    <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h2 className="font-['Trebuchet_MS',sans-serif] text-xl font-bold text-white mb-2">
                                {t('sec4Title')}
                            </h2>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl">
                                {t('sec4Text')}
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#9d7cff] text-[#0d0914] hover:bg-[#b59dff] font-['Trebuchet_MS',sans-serif] text-xs font-black uppercase tracking-wider transition-colors shrink-0"
                        >
                            <span>Contact Support</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </div>
    );
}

