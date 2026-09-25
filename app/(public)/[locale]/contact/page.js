import { getTranslations, setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import ContactForm from './ContactForm';
import PageHeaderBanner from '@/components/PageHeaderBanner';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'contact' });
    const isEs = locale === 'es';
    return {
        title: t('titleMeta'),
        description: t('subtitle'),
        alternates: {
            canonical: isEs ? '/contact' : '/en/contact',
            languages: {
                es: '/contact',
                en: '/en/contact',
                'x-default': '/contact',
            },
        },
    };
}

export default async function ContactPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('contact');

    return (
        <div className="min-h-screen bg-[#1A1A24] text-slate-100 pb-20">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 py-10 sm:py-12">
                <Reveal>
                    <ContactForm />
                </Reveal>
            </div>
        </div>
    );
}