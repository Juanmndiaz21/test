import { neon } from '@neondatabase/serverless';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://test-nu-eosin-53.vercel.app');
    const now = new Date();

    const locales = ['es', 'en'];

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

    // Add static routes for each locale
    for (const locale of locales) {
        for (const route of staticRoutes) {
            entries.push({
                url: `${baseUrl}/${locale}${route.path}`,
                lastModified: now,
                changeFrequency: route.changeFrequency,
                priority: route.priority,
            });
        }
    }

    // Dynamic game category routes from DB
    try {
        if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);
            const games = await sql`SELECT name FROM games ORDER BY name ASC`;
            for (const game of games) {
                const encodedGame = encodeURIComponent(game.name);
                for (const locale of locales) {
                    entries.push({
                        url: `${baseUrl}/${locale}/store/game/${encodedGame}`,
                        lastModified: now,
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    });
                }
            }
        }
    } catch {
        // Fallback popular games if DB unavailable during build
        const fallbackGames = ['GTA V', 'CS2', 'BO2', 'BO7', 'COD', 'Fortnite'];
        for (const game of fallbackGames) {
            const encodedGame = encodeURIComponent(game);
            for (const locale of locales) {
                entries.push({
                    url: `${baseUrl}/${locale}/store/game/${encodedGame}`,
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            }
        }
    }

    return entries;
}

