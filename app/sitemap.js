import { neon } from '@neondatabase/serverless';
import { gameToSlug, productToSlug } from '../lib/gameSlugs.js';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');
    const now = new Date();
    const staticLastMod = new Date('2026-09-29T00:00:00.000Z');

    const staticRoutes = [
        { path: '', priority: 1.0, changeFrequency: 'daily' },
        { path: '/store', priority: 0.9, changeFrequency: 'daily' },
        { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/help', priority: 0.6, changeFrequency: 'weekly' },
        { path: '/contact', priority: 0.6, changeFrequency: 'weekly' },
        { path: '/work-with-us', priority: 0.5, changeFrequency: 'monthly' },
        { path: '/refunds', priority: 0.4, changeFrequency: 'monthly' },
        { path: '/terms', priority: 0.4, changeFrequency: 'monthly' },
        { path: '/privacy', priority: 0.4, changeFrequency: 'monthly' },
    ];

    const entries = [];

    // Helper to generate clean canonical URLs
    const getUrl = (path = '') => `${baseUrl}${path || '/'}`;

    // 1. Static routes
    for (const route of staticRoutes) {
        entries.push({
            url: getUrl(route.path),
            lastModified: route.path === '' || route.path === '/store' ? now : staticLastMod,
            changeFrequency: route.changeFrequency,
            priority: route.priority,
        });
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
                const slug = gameToSlug(game.name);
                const gamePath = `/store/game/${slug}`;

                entries.push({
                    url: getUrl(gamePath),
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            }
            gamesAdded = games.length > 0;

            // 3. Dynamic product routes
            const products = await sql`
                SELECT id, name, slug, created_at
                FROM products
                ORDER BY id DESC
                LIMIT 200
            `;

            for (const product of products) {
                const lastModifiedDate = product.created_at || now;
                const slug = product.slug || productToSlug(product.id, product.name);
                const productPath = `/store/${slug}`;

                entries.push({
                    url: getUrl(productPath),
                    lastModified: new Date(lastModifiedDate),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            }
        }
    } catch (err) {
        console.error('Error generating dynamic sitemap entries:', err);
        if (!gamesAdded) {
            const fallbackGames = ['GTA V', 'CS2'];
            for (const game of fallbackGames) {
                const slug = gameToSlug(game);
                const gamePath = `/store/game/${slug}`;

                entries.push({
                    url: getUrl(gamePath),
                    lastModified: now,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            }
        }
    }

    return entries;
}
