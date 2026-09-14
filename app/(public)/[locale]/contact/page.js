import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import ContactForm from './ContactForm';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'contact' });
    return {
        title: t('titleMeta'),
        description: t('subtitle'),
    };
}

export default async function ContactPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('contact');

    return (
        <div className="max-w-4xl mx-auto px-5 py-12 md:py-16">
            <p className="eyebrow mb-3">{t('eyebrow')}</p>
            <h1 className="display-font text-5xl uppercase text-white mb-4">{t('title')}</h1>
            <p className="text-slate-400 text-lg max-w-xl mb-10">{t('subtitle')}</p>

            <Reveal>
                <ContactForm />
            </Reveal>
        </div>
    );
}