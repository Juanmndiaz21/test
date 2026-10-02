import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'terms' });
    return {
        title: t('titleMeta'),
        description: t('sec1Text'),
        alternates: {
            canonical: '/terms',
        },
        openGraph: {
            title: t('titleMeta'),
            description: t('sec1Text'),
            url: '/terms',
        },
    };
}

export default async function TermsPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('terms');

    const sections = [
        { title: t('sec1Title'), text: t('sec1Text') },
        { title: t('sec2Title'), text: t('sec2Text') },
        { title: t('sec3Title'), text: t('sec3Text') },
        { title: t('sec4Title'), text: t('sec4Text') },
        { title: t('sec5Title'), text: t('sec5Text') },
        { title: t('sec6Title'), text: t('sec6Text') },
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
                        <div className="rounded-xl bg-[#1c162b] p-6 sm:p-7 border border-[#9d7cff]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2">
                                    Questions Regarding Our Terms?
                                </h2>
                                <p className="text-sm leading-relaxed text-slate-300 max-w-xl">
                                    Our support team and legal coordinator are available 24/7 to clarify service details, safety guidelines, and order milestones.
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#9d7cff] text-[#0d0914] hover:bg-[#b59dff] font-['Trebuchet_MS',sans-serif] text-xs font-bold uppercase tracking-wider transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#9d7cff]"
                            >
                                <span>Contact Team</span>
                                <Icon name="arrow-right" className="w-4 h-4" />
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
}
