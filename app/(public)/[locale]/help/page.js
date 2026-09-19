import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchHelpEntries } from '../../../../lib/helpData';
import { HELP_TYPES } from '../../../../lib/helpTypes';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'help' });
    return {
        title: t('title'),
        description: t('faq1q'),
    };
}

export default async function Help({ params }) {
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

    return (
        <div className="max-w-4xl mx-auto px-5 py-12 md:py-16">
            <p className="eyebrow mb-3">{t('eyebrow')}</p>
            <h1 className="display-font text-5xl uppercase text-white mb-10">{t('title')}</h1>

            {groups.length === 0 ? (
                <div className="space-y-6">
                    <div className="panel-surface p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-lime-300 mb-2">{t('faq1q')}</h2>
                        <p className="text-slate-400">{t('faq1a')}</p>
                    </div>

                    <div className="panel-surface p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-lime-300 mb-2">{t('faq2q')}</h2>
                        <p className="text-slate-400">{t('faq2a')}</p>
                    </div>

                    <div className="panel-surface p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-lime-300 mb-2">{t('faq3q')}</h2>
                        <p className="text-slate-400">{t('faq3a')}</p>
                    </div>
                </div>
            ) : (
                groups.map((group) => (
                    <section key={group.id} className="mb-10">
                        <h2 className="display-font text-2xl uppercase text-lime-300 mb-4">{t(`types.${group.id}`)}</h2>
                        <div className="space-y-6">
                            {group.items.map((entry) => (
                                <div key={entry.id} className="panel-surface p-6 rounded-2xl">
                                    <h3 className="text-xl font-bold text-lime-300 mb-2">{entry.title}</h3>
                                    <p className="text-slate-400 whitespace-pre-line">{entry.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}