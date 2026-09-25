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

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ogmodz.com');

    const isEs = locale === 'es';
    const title = isEs
        ? 'OGmodz — Servicios Premium de Game Boosting | Sube de Rango y Nivel'
        : 'OGmodz — Premium Game Boosting Services | Rank & Level Up';
    const description = isEs
        ? 'Servicios profesionales de boosting para GTA V, CS2 y más. Elige tu plataforma, configura tu boost y recibe entrega inmediata y segura.'
        : 'Competitive boosting services for GTA V, CS2, and more. Pick your platform, set your boost amount, and get back to the match.';

    return {
        metadataBase: new URL(baseUrl),
        title: {
            default: title,
            template: '%s · OGmodz',
        },
        description,
        alternates: {
            canonical: `/${locale}`,
            languages: {
                es: '/es',
                en: '/en',
                'x-default': '/es',
            },
        },
        openGraph: {
            title,
            description,
            url: `/${locale}`,
            siteName: 'OGmodz',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: 'OGmodz Game Boosting Services',
                },
            ],
            locale: isEs ? 'es_ES' : 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
        icons: {
            icon: [
                { url: '/favicon.ico?v=4', sizes: 'any' },
                { url: '/favicon-32.png?v=4', type: 'image/png', sizes: '32x32' },
                { url: '/icon-192.png?v=4', type: 'image/png', sizes: '192x192' },
            ],
            apple: '/apple-touch-icon.png?v=4',
        },
        manifest: '/site.webmanifest',
    };
}

export default async function LocaleLayout({ children, params }) {
    const { locale } = await params;

    if (!routing.locales.includes(locale)) notFound();
    setRequestLocale(locale);

    const messages = await getMessages();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ogmodz.com');

    const schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${baseUrl}/#organization`,
                name: 'OGmodz',
                url: `${baseUrl}/${locale}`,
                logo: `${baseUrl}/logo.png`,
                description: 'Competitive game boosting services for popular competitive titles.',
                sameAs: [],
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.9',
                    reviewCount: '120',
                    bestRating: '5',
                    worstRating: '1',
                },
            },
            {
                '@type': 'WebSite',
                '@id': `${baseUrl}/#website`,
                url: `${baseUrl}/${locale}`,
                name: 'OGmodz',
                publisher: {
                    '@id': `${baseUrl}/#organization`,
                },
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${baseUrl}/${locale}/store?search={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                },
            },
        ],
    };

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            </head>
            <body suppressHydrationWarning className="text-slate-50 selection:bg-[#9d7cff] selection:text-[#0d0914] min-h-screen flex flex-col">
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