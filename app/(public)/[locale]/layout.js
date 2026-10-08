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
import CookieConsentBanner from '../../../components/CookieConsentBanner';
import MotionSystem from '../../../components/MotionSystem';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const viewport = {
    themeColor: '#09090b',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};

export async function generateMetadata({ params }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');

    const title = 'Buy Game Boosting Services — GTA 5 & CS2 | OGmodz';
    const description = 'Buy premium game boosting at OGmodz. Fast delivery for GTA 5 cash boost, modded accounts & CS2 rank boost. Verified account safety protocols, private VPN routing and 24/7 support.';

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
                { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
                { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            ],
            apple: [
                { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            ],
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
            yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
            bing: process.env.NEXT_PUBLIC_BING_VERIFICATION || undefined,
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
                    'https://discord.gg/eaYMP2hnm4',
                ],
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    url: `${baseUrl}/contact`,
                    availableLanguage: ['English'],
                },
                hasMerchantReturnPolicy: {
                    '@type': 'MerchantReturnPolicy',
                    applicableCountry: 'US',
                    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    merchantReturnDays: 14,
                    returnMethod: 'https://schema.org/ReturnOnline',
                    returnFees: 'https://schema.org/FreeReturn',
                    refundType: 'https://schema.org/FullRefund',
                    url: `${baseUrl}/refunds`,
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
            <head suppressHydrationWarning>
                <BisSkinCleaner />
                <script
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: `if(typeof window!=='undefined'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('has-motion');setTimeout(function(){document.documentElement.classList.add('motion-failsafe')},3000);}`,
                    }}
                />
                <script
                    type="application/ld+json"
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
                {/* Google tag (gtag.js) */}
                <Script
                    strategy="afterInteractive"
                    src="https://www.googletagmanager.com/gtag/js?id=G-VLP5EHBJZP"
                />
                <Script
                    id="google-analytics"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());

                            // Check local storage consent
                            try {
                                var consent = localStorage.getItem('ogmodz_cookie_consent_v1');
                                if (consent) {
                                    var parsed = JSON.parse(consent);
                                    if (parsed.analytics === false) {
                                        gtag('consent', 'default', {
                                            'analytics_storage': 'denied',
                                            'ad_storage': 'denied'
                                        });
                                    }
                                }
                            } catch(e) {}

                            gtag('config', 'G-VLP5EHBJZP', {
                                page_path: window.location.pathname,
                            });
                        `,
                    }}
                />
            </head>
            <body suppressHydrationWarning className="bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300 min-h-screen flex flex-col">
                <AuthSession>
                    <NextIntlClientProvider messages={messages}>
                        <MotionSystem />
                        <a
                            href="#main-content"
                            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-500 focus:text-zinc-950 focus:font-black focus:rounded-lg focus:shadow-[0_0_25px_rgba(16,185,129,0.5)] focus:outline-none"
                        >
                            Skip to main content
                        </a>
                        <SiteHeader />
                        <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
                            <PageTransition>{children}</PageTransition>
                        </main>
                        <Footer />
                        <CookieConsentBanner />
                        <BackToTop />
                    </NextIntlClientProvider>
                </AuthSession>
                <Analytics />
            </body>
        </html>
    );
}