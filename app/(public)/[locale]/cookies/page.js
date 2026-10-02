import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'cookies' });
    return {
        title: t('titleMeta'),
        description: t('sec1Text'),
        alternates: {
            canonical: '/cookies',
        },
        openGraph: {
            title: t('titleMeta'),
            description: t('sec1Text'),
            url: '/cookies',
        },
    };
}

export default async function CookiesPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('cookies');

    const sections = [
        { title: t('sec1Title'), text: t('sec1Text') },
        { title: t('sec2Title'), text: t('sec2Text') },
        { title: t('sec3Title'), text: t('sec3Text') },
        { title: t('sec4Title'), text: t('sec4Text') },
        { title: t('sec5Title'), text: t('sec5Text') },
    ];

    return (
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('lastUpdated')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 py-10 sm:py-12">
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <Reveal key={index} delay={0.05 * (index + 1)}>
                            <div className="rounded-xl bg-[#252530] p-6 sm:p-7 border border-white/5">
                                <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2.5">
                                    {section.title}
                                </h2>
                                <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                                    {section.text}
                                </p>
                            </div>
                        </Reveal>
                    ))}

                    <Reveal delay={0.35}>
                        <div className="rounded-xl bg-[#1c162b] p-6 sm:p-7 border border-[#9d7cff]/30 text-center">
                            <h3 className="font-['Trebuchet_MS',sans-serif] text-base font-bold text-white mb-2">
                                {t('privacyLinkTitle')}
                            </h3>
                            <p className="text-sm text-slate-300 mb-4">
                                {t('privacyLinkText')}
                            </p>
                            <Link
                                href="/privacy"
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#9d7cff] text-[#0d0914] text-xs font-bold uppercase tracking-wider hover:bg-[#b59dff] transition-colors focus-visible:outline-2 focus-visible:outline-[#9d7cff]"
                            >
                                {t('viewPrivacyBtn')}
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
}
