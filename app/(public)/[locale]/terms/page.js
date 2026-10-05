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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('lastUpdated')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 py-10 sm:py-12">
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <Reveal key={index} delay={0.05 * (index + 1)}>
                            <div className="rounded-2xl bg-zinc-900 p-6 sm:p-7 border border-white/10">
                                <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2.5">
                                    {section.title}
                                </h2>
                                <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
                                    {section.text}
                                </p>
                            </div>
                        </Reveal>
                    ))}

                    <Reveal delay={0.35}>
                        <div className="rounded-2xl bg-zinc-900 p-6 sm:p-7 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
                            <div>
                                <h2 className="font-['Trebuchet_MS',sans-serif] text-lg sm:text-xl font-bold text-white mb-2">
                                    Questions Regarding Our Terms?
                                </h2>
                                <p className="text-sm leading-relaxed text-zinc-400 max-w-xl">
                                    Our support team and legal coordinator are available 24/7 to clarify service details, safety guidelines, and order milestones.
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-['Trebuchet_MS',sans-serif] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-500 cursor-pointer"
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
