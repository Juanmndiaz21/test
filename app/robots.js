export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://test-nu-eosin-53.vercel.app');

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/checkout/'],
            },
            {
                userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot-Extended'],
                allow: '/',
                disallow: ['/admin/', '/api/', '/checkout/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

