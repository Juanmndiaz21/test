import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import PageHeaderBanner from '@/components/PageHeaderBanner';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'privacy' });
    const isEs = locale === 'es';
    const enPath = '/privacy';
    const esPath = '/es/privacy';
    return {
        title: t('titleMeta'),
        description: t('sec1Text'),
        alternates: {
            canonical: isEs ? esPath : enPath,
            languages: {
                en: enPath,
                es: esPath,
                'x-default': enPath,
            },
        },
        openGraph: {
            title: t('titleMeta'),
            description: t('sec1Text'),
            url: isEs ? esPath : enPath,
        },
    };
}

export default async function PrivacyPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('privacy');

    return (
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('lastUpdated')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 py-10 sm:py-12">
                <div className="space-y-4">
                    <Reveal delay={0.05}>
                        <div className="rounded-xl bg-[#252530] p-6 sm:p-7">
                            <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2.5">
                                {t('sec1Title')}
                            </h2>
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
                        <div className="rounded-xl bg-[#252530] p-6 sm:p-7">
                            <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2.5">
                                {t('sec4Title')}
                            </h2>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                                {t('sec4Text')}
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
}
