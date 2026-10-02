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
import BisSkinCleaner from '../../../components/BisSkinCleaner';
import { Analytics } from '@vercel/analytics/next';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const viewport = {
    themeColor: '#0d0914',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};

export async function generateMetadata({ params }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');

    const title = 'Buy Game Boosting Services — GTA 5 & CS2 | OGmodz';
    const description = 'Buy premium game boosting at OGmodz. Fast delivery for GTA 5 cash boost, modded accounts & CS2 rank boost. 100% account safety with 24/7 support.';

    const englishKeywords = [
        'game boosting',
        'game boosting services',
        'GTA V cash boost',
        'GTA 5 money boost',
        'GTA Online cash boost',
        'GTA V recovery service',
        'CS2 boosting',
        'CS2 commendations boost',
        'Counter-Strike 2 rank boost',
        'rank boosting',
        'level up boost',
        'safe game boosting',
        'OGmodz',
        'OGmodz boosting',
        'buy game boost',
    ];

    return {
        metadataBase: new URL(baseUrl),
        applicationName: 'OGmodz',
        category: 'Gaming',
        classification: 'Video Game Boosting Services',
        creator: 'OGmodz',
        publisher: 'OGmodz',
        title: {
            default: title,
            template: '%s · OGmodz',
        },
        description,
        keywords: englishKeywords,
        robots: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: baseUrl,
            languages: {
                en: baseUrl,
                'x-default': baseUrl,
            },
        },
        openGraph: {
            title,
            description,
            url: '/',
            siteName: 'OGmodz',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: 'OGmodz Game Boosting Services',
                },
            ],
            locale: 'en_US',
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
                { url: '/favicon.ico', sizes: 'any' },
                { url: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
                { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
                { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
            ],
            apple: [
                { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            ],
        },
        manifest: '/site.webmanifest',
    };
}

export default async function LocaleLayout({ children, params }) {
    const { locale } = await params;

    if (!routing.locales.includes(locale)) notFound();
    setRequestLocale(locale);

    const messages = await getMessages();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const storeSearchUrl = `${baseUrl}/store`;

    const schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${baseUrl}/#organization`,
                name: 'OGmodz',
                url: baseUrl,
                logo: `${baseUrl}/logo.png`,
                description: 'Professional video game boosting and progression services for competitive titles.',
                sameAs: [
                    'https://discord.gg/qwyQjn4Aqx',
                ],
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    url: `${baseUrl}/contact`,
                    availableLanguage: ['English'],
                },
            },
            {
                '@type': 'WebSite',
                '@id': `${baseUrl}/#website`,
                url: baseUrl,
                name: 'OGmodz',
                publisher: {
                    '@id': `${baseUrl}/#organization`,
                },
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${storeSearchUrl}?search={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@type': 'WebPage',
                '@id': `${baseUrl}/#webpage`,
                url: baseUrl,
                name: 'Buy Game Boosting Services — GTA 5 & CS2 | OGmodz',
                isPartOf: {
                    '@id': `${baseUrl}/#website`,
                },
                about: {
                    '@id': `${baseUrl}/#organization`,
                },
                inLanguage: 'en-US',
            },
        ],
    };

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <BisSkinCleaner />
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
                <Analytics />
            </body>
        </html>
    );
}