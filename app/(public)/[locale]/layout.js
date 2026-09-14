import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import '../../globals.css';
import { routing } from '../../../i18n/routing';
import AuthSession from '../../../components/AuthSession';
import SiteHeader from '../../../components/SiteHeader';
import Footer from '../../../components/Footer';
import PageTransition from '../../../components/PageTransition';
import BackToTop from '../../../components/BackToTop';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
    title: {
        default: 'Rowmodz — Premium Game Boosting Services',
        template: '%s · Rowmodz',
    },
    description:
        'Competitive boosting services for the games you play. Pick your platform, set your boost amount, and get back to the match.',
    icons: {
        icon: '/logo.png',
    },
};

export default async function LocaleLayout({ children, params }) {
    const { locale } = await params;

    if (!routing.locales.includes(locale)) notFound();
    setRequestLocale(locale);

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className="text-slate-50 selection:bg-lime-300 selection:text-black min-h-screen flex flex-col">
                <AuthSession>
                    <NextIntlClientProvider messages={messages}>
                        <SiteHeader />
                        <main className="flex-grow">
                            <PageTransition>{children}</PageTransition>
                        </main>
                        <Footer />
                        <BackToTop />
                    </NextIntlClientProvider>
                </AuthSession>
            </body>
        </html>
    );
}