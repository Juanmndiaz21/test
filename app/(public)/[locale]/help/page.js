import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchHelpEntries } from '../../../../lib/helpData';
import { HELP_TYPES } from '../../../../lib/helpTypes';
import SupportChannels from '@/components/SupportChannels';
import HelpFaqList from '@/components/HelpFaqList';
import PageHeaderBanner from '@/components/PageHeaderBanner';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'help' });
    const isEs = locale === 'es';

    return {
        title: `${t('title')} | OGmodz`,
        description: t('subtitle'),
        alternates: {
            canonical: isEs ? '/help' : '/en/help',
            languages: {
                es: '/help',
                en: '/en/help',
                'x-default': '/help',
            },
        },
    };
}

export default async function HelpPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('help');

    let entries = [];
    try {
        entries = await fetchHelpEntries();
    } catch {
        entries = [];
    }

    const groups = HELP_TYPES
        .map((type) => ({ ...type, items: entries.filter((entry) => entry.type === type.id) }))
        .filter((group) => group.items.length > 0);

    const defaultFaqs = t.raw('faqs') || [
        { q: t('faq1q'), a: t('faq1a') },
        { q: t('faq2q'), a: t('faq2a') },
        { q: t('faq3q'), a: t('faq3a') },
    ];

    const channelTranslations = {
        liveChatTitle: t('channels.liveChat.title'),
        liveChatDesc: t('channels.liveChat.desc'),
        liveChatAction: t('channels.liveChat.action'),
        liveChatActionAuth: t('channels.liveChat.actionAuth'),
        discordTitle: t('channels.discord.title'),
        discordDesc: t('channels.discord.desc'),
        discordAction: t('channels.discord.action'),
        emailTitle: t('channels.email.title'),
        emailDesc: t('channels.email.desc'),
        emailAction: t('channels.email.action'),
    };

    const faqSchemaItems = groups.length > 0
        ? groups.flatMap((g) => g.items.map((item) => ({
            '@type': 'Question',
            name: item.title,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.content,
            },
        })))
        : defaultFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
            },
        }));

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSchemaItems,
    };

    return (
        <div className="min-h-screen bg-[#1A1A24] text-slate-100 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Top Purple Header Banner matching the photo */}
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                maxWidth="max-w-5xl"
            />

            {/* Main Content Area with Clean Paced Rhythm */}
            <div className="max-w-5xl mx-auto px-5 py-10 sm:py-12 space-y-12 sm:space-y-14">
                {/* 3 Contact Channels */}
                <section aria-labelledby="channels-heading">
                    <h2 id="channels-heading" className="sr-only">
                        {t('channelsHeading')}
                    </h2>
                    <SupportChannels translations={channelTranslations} />
                </section>

                {/* Frequently Asked Questions */}
                <section aria-labelledby="faq-heading">
                    <h2
                        id="faq-heading"
                        className="font-['Trebuchet_MS',sans-serif] text-xl sm:text-2xl font-bold text-white tracking-tight mb-5"
                    >
                        {t('faqHeading')}
                    </h2>

                    {groups.length === 0 ? (
                        <HelpFaqList faqs={defaultFaqs} />
                    ) : (
                        <div className="space-y-8">
                            {groups.map((group) => (
                                <div key={group.id} className="space-y-3.5">
                                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9333EA] px-1">
                                        {t(`types.${group.id}`)}
                                    </h3>
                                    <HelpFaqList faqs={group.items} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
