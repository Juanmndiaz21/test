import { neon } from '@neondatabase/serverless';
import { routing } from '../i18n/routing.js';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const now = new Date();

    const locales = routing.locales;

    const staticRoutes = [
        { path: '', priority: 1.0, changeFrequency: 'daily' },
        { path: '/store', priority: 0.9, changeFrequency: 'daily' },
        { path: '/help', priority: 0.6, changeFrequency: 'weekly' },
        { path: '/contact', priority: 0.6, changeFrequency: 'weekly' },
        { path: '/work-with-us', priority: 0.5, changeFrequency: 'monthly' },
        { path: '/refunds', priority: 0.4, changeFrequency: 'monthly' },
        { path: '/terms', priority: 0.4, changeFrequency: 'monthly' },
        { path: '/privacy', priority: 0.4, changeFrequency: 'monthly' },
    ];

    const entries = [];

    // Helper to generate clean, non-redirecting canonical URLs
    // English is served at root (/), Spanish at /es. Never output /en which 307-redirects.
    const getLocalizedUrl = (locale, path = '') => {
        if (locale === 'es') {
            return `${baseUrl}/es${path}`;
        }
        return `${baseUrl}${path || '/'}`;
    };

    // 1. Static routes with bidirectional hreflang alternates
    for (const route of staticRoutes) {
        for (const locale of locales) {
            entries.push({
                url: getLocalizedUrl(locale, route.path),
                lastModified: now,
                changeFrequency: route.changeFrequency,
                priority: route.priority,
                alternates: {
                    languages: {
                        en: getLocalizedUrl('en', route.path),
                        es: getLocalizedUrl('es', route.path),
                    },
                },
            });
        }
    }

    // 2. Dynamic game category and product routes from DB
    let gamesAdded = false;
    try {
        if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);

            // Strictly only games with active products to avoid thin content indexation
            const games = await sql`
                SELECT g.name
                FROM games g
                INNER JOIN products p ON LOWER(p.game) = LOWER(g.name)
                GROUP BY g.name
                HAVING COUNT(p.id) > 0
                ORDER BY g.name ASC
            `;

            for (const game of games) {
                const encodedGame = encodeURIComponent(game.name);
                const gamePath = `/store/game/${encodedGame}`;
                for (const locale of locales) {
                    entries.push({
                        url: getLocalizedUrl(locale, gamePath),
                        lastModified: now,
                        changeFrequency: 'weekly',
                        priority: 0.8,
                        alternates: {
                            languages: {
                                en: getLocalizedUrl('en', gamePath),
                                es: getLocalizedUrl('es', gamePath),
                            },
                        },
                    });
                }
            }
            gamesAdded = games.length > 0;

            // 3. Dynamic product routes
            const products = await sql`
                SELECT id, created_at
                FROM products
                ORDER BY id DESC
                LIMIT 200
            `;

            for (const product of products) {
                const productPath = `/store/${product.id}`;
                const lastModifiedDate = product.created_at || now;
                for (const locale of locales) {
                    entries.push({
                        url: getLocalizedUrl(locale, productPath),
                        lastModified: new Date(lastModifiedDate),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                        alternates: {
                            languages: {
                                en: getLocalizedUrl('en', productPath),
                                es: getLocalizedUrl('es', productPath),
                            },
                        },
                    });
                }
            }
        }
    } catch (err) {
        console.error('Error generating dynamic sitemap entries:', err);
        // Fallback popular games with verified services if DB unavailable
        if (!gamesAdded) {
            const fallbackGames = ['GTA V', 'CS2'];
            for (const game of fallbackGames) {
                const encodedGame = encodeURIComponent(game);
                const gamePath = `/store/game/${encodedGame}`;
                for (const locale of locales) {
                    entries.push({
                        url: getLocalizedUrl(locale, gamePath),
                        lastModified: now,
                        changeFrequency: 'weekly',
                        priority: 0.8,
                        alternates: {
                            languages: {
                                en: getLocalizedUrl('en', gamePath),
                                es: getLocalizedUrl('es', gamePath),
                            },
                        },
                    });
                }
            }
        }
    }

    return entries;
}
