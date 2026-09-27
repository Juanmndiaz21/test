export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.ogmodz.com');

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/*/admin/',
                    '/api/',
                    '/checkout/',
                    '/*/checkout/',
                    '/profile',
                    '/*/profile',
                    '/reset-password',
                    '/*/reset-password',
                    '/track',
                    '/*/track',
                ],
            },
            {
                userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot-Extended'],
                allow: '/',
                disallow: [
                    '/admin/',
                    '/*/admin/',
                    '/api/',
                    '/checkout/',
                    '/*/checkout/',
                    '/profile',
                    '/*/profile',
                    '/reset-password',
                    '/*/reset-password',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
