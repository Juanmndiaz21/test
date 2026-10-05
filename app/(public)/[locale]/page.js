import { neon } from '@neondatabase/serverless';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getApprovedReviews } from '@/lib/reviews';
import { ensureAppSchema } from '@/lib/schema';
import NewStyleLanding from '@/components/NewStyleLanding';

export const revalidate = 120;

export async function generateMetadata() {
    return {
        alternates: {
            canonical: '/',
        },
    };
}

export default async function Home({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('home');

    let ladder = [];
    let dbApprovedReviews = [];
    let featuredProducts = [];

    try {
        const sql = neon(process.env.DATABASE_URL);
        await ensureAppSchema(sql);

        const [rows, reviewsData, featuredRows] = await Promise.all([
            sql`
                SELECT g.name, g.image_url, g.mode, COUNT(p.id)::int AS services
                FROM games g
                LEFT JOIN products p ON LOWER(p.game) = LOWER(g.name)
                GROUP BY g.name, g.image_url, g.mode
                ORDER BY COUNT(p.id) DESC, g.name ASC
            `,
            getApprovedReviews(),
            sql`
                SELECT * FROM products
                ORDER BY id DESC
                LIMIT 48
            `,
        ]);
        ladder = rows;
        featuredProducts = featuredRows || [];

        const productMap = Object.fromEntries(featuredProducts.map((p) => [String(p.id), p]));
        dbApprovedReviews = (reviewsData || []).map((r) => {
            const prod = productMap[String(r.product_id)];
            return {
                ...r,
                productName: prod?.name || null,
                game: prod?.game || prod?.name || r.game || 'GTA V Online',
            };
        });
    } catch {
        ladder = [];
        const rawReviews = await getApprovedReviews().catch(() => []);
        dbApprovedReviews = (rawReviews || []).map((r) => ({
            ...r,
            game: r.game || 'GTA V Online',
        }));
        featuredProducts = [];
    }

    const features = t.raw('features') ?? [];
    const fallbackReviews = t.raw('reviews') ?? [];
    const reviews = (dbApprovedReviews && dbApprovedReviews.length > 0) ? dbApprovedReviews : fallbackReviews;
    const faqs = t.raw('faqs') ?? [];
    const faqTitle = t('faqTitle');
    const faqSubtitle = t('faqSubtitle');

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (faqs || []).map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <NewStyleLanding
                dbGames={ladder}
                dbProducts={featuredProducts}
                dbReviews={reviews}
                faqs={faqs}
            />
        </>
    );
}