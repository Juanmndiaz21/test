import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';
import Reveal from '@/components/Reveal';
import BlogMarkdown, {
    extractHeadings,
    calculateWordCount,
    extractFaqItems,
} from '@/components/BlogMarkdown';
import BlogReadingProgress from '@/components/BlogReadingProgress';
import BlogArticleSidebar from '@/components/BlogArticleSidebar';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';

export const revalidate = 60;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post || !post.published) {
        return {
            title: 'Article Not Found | OGmodz',
        };
    }

    const title = post.meta_title || `${post.title} | OGmodz Blog`;
    const description = post.meta_description || post.excerpt;
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : 'https://www.ogmodz.com');

    const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
    const wordCount = calculateWordCount(post.content);

    return {
        title,
        description,
        keywords: [
            post.category,
            'game guide',
            'boosting',
            'meta tips',
            'GTA 5 boost',
            'CS2 premier',
            'OGmodz',
        ],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'OGmodz',
            type: 'article',
            publishedTime: post.created_at,
            modifiedTime: post.updated_at || post.created_at,
            section: post.category,
            authors: [post.author || 'OGmodz Specialist'],
            images: post.image_url
                ? [
                      {
                          url: post.image_url,
                          width: 1280,
                          height: 720,
                          alt: post.title,
                      },
                  ]
                : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.image_url ? [post.image_url] : [],
        },
    };
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return '';
    }
}

export default async function BlogPostPage({ params }) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const post = await getBlogPostBySlug(slug);
    if (!post || !post.published) {
        notFound();
    }

    const wordCount = calculateWordCount(post.content);
    const headings = extractHeadings(post.content);
    const faqItems = extractFaqItems(post.content);

    // Fetch related articles
    const allCategoryPosts = await getBlogPosts({
        category: post.category,
        publishedOnly: true,
        limit: 4,
    });
    const relatedPosts = allCategoryPosts
        .filter((p) => p.id !== post.id)
        .slice(0, 3);

    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : 'https://www.ogmodz.com');

    const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
    const formattedDate = formatDate(post.created_at);

    // Schema: BlogPosting / Article
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl}#article`,
        headline: post.title,
        description: post.excerpt,
        image: post.image_url || undefined,
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        wordCount: wordCount,
        articleSection: post.category,
        inLanguage: 'en-US',
        author: {
            '@type': 'Person',
            name: post.author || 'OGmodz Specialist',
            jobTitle: 'Game Specialist & Analyst',
            worksFor: {
                '@type': 'Organization',
                name: 'OGmodz',
                url: baseUrl,
            },
        },
        publisher: {
            '@type': 'Organization',
            name: 'OGmodz',
            url: baseUrl,
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo-v3.svg`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
    };

    // Schema: BreadcrumbList
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${baseUrl}/blog`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: canonicalUrl,
            },
        ],
    };

    // Schema: FAQPage (if FAQs are detected)
    const faqSchema =
        faqItems.length > 0
            ? {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  '@id': `${canonicalUrl}#faq`,
                  mainEntity: faqItems.map((item) => ({
                      '@type': 'Question',
                      name: item.question,
                      acceptedAnswer: {
                          '@type': 'Answer',
                          text: item.answer,
                      },
                  })),
              }
            : null;

    return (
        <main
            id="blog-article-root"
            className="min-h-screen bg-zinc-950 text-zinc-100 pt-28 pb-20 relative overflow-hidden"
        >
            {/* Reading Progress Bar (Top of Viewport) */}
            <BlogReadingProgress />

            {/* Ambient Ambient Glows */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none"
                aria-hidden="true"
            />
            <div
                className="absolute top-96 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none"
                aria-hidden="true"
            />

            {/* Structured Data JSON-LD for Google Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Breadcrumbs Navigation */}
                <nav
                    aria-label="Breadcrumbs"
                    className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none"
                >
                    <Link href="/" className="hover:text-white transition-colors">
                        Home
                    </Link>
                    <Icon name="chevron-right" className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <Link href="/blog" className="hover:text-white transition-colors">
                        Blog
                    </Link>
                    <Icon name="chevron-right" className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span className="text-emerald-400 truncate max-w-[240px] sm:max-w-md">
                        {post.title}
                    </span>
                </nav>

                {/* Article Header */}
                <header className="max-w-5xl mb-8">
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                        <Link
                            href={`/blog?category=${encodeURIComponent(post.category)}`}
                            className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        >
                            {post.category}
                        </Link>
                        {post.is_featured && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-mono font-bold">
                                <Icon name="star" className="w-3.5 h-3.5 fill-current" />
                                FEATURED
                            </span>
                        )}
                        <span className="text-xs text-zinc-400 font-mono">
                            {formattedDate}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    {/* Byline with Author & Read time */}
                    <div className="mt-5 flex items-center gap-4 text-xs text-zinc-400 font-mono flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[11px]">
                                {post.author.charAt(0)}
                            </div>
                            <span className="font-bold text-zinc-200">{post.author}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                            <Icon name="clock" className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{post.read_time}</span>
                        </div>
                        {wordCount > 0 && (
                            <>
                                <span>•</span>
                                <span>{wordCount.toLocaleString()} words</span>
                            </>
                        )}
                    </div>
                </header>

                {/* Cover Image Banner */}
                {post.image_url && (
                    <div className="relative aspect-[16/9] w-full max-w-full rounded-2xl md:rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* TWO-COLUMN GRID: Main Content (8-9 cols) + Sticky Sidebar (4-3 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
                    {/* LEFT COLUMN: Main Article */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-10">
                        {/* Quick Answer / Excerpt Box */}
                        {post.excerpt && (
                            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-300 text-base leading-relaxed">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                                    SUMMARY &amp; QUICK TAKEAWAY
                                </span>
                                <p className="font-medium text-zinc-200">{post.excerpt}</p>
                            </div>
                        )}

                        {/* Article Markdown Body */}
                        <div className="bg-zinc-900 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-xl">
                            <BlogMarkdown content={post.content} />
                        </div>

                        {/* In-Article Contextual Boosting Promotion Banner */}
                        <div className="rounded-3xl p-7 sm:p-10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
                            <div
                                className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
                                aria-hidden="true"
                            />
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-center sm:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 mb-2.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>100% BAN-SAFE · INSTANT DELIVERY</span>
                                    </div>
                                    <h3 className="display-font text-2xl sm:text-3xl font-black uppercase text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                                        Ready to Dominate Your Game?
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-lg leading-relaxed font-normal">
                                        Skip hundreds of hours of repetitive grinding. Get instant fulfillment, private VPN-protected lobbies, and 24/7 dedicated support.
                                    </p>
                                </div>
                                <Link
                                    href="/store"
                                    className="shrink-0 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    Browse Catalog
                                </Link>
                            </div>
                        </div>

                        {/* Author Bio Box */}
                        <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg shrink-0">
                                {post.author.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white text-base">{post.author}</h4>
                                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Verified Specialist
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Competitive gaming analyst and booster at OGmodz. Specializing in high-rank matchmaking algorithms, ban-prevention safety architecture, and in-game economy optimization.
                                </p>
                            </div>
                        </div>

                        {/* Related Articles Section */}
                        {relatedPosts.length > 0 && (
                            <section className="pt-10 border-t border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                                            CONTINUE READING
                                        </span>
                                        <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                                            Related Guides &amp; Articles
                                        </h3>
                                    </div>
                                    <Link
                                        href="/blog"
                                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 flex items-center gap-1"
                                    >
                                        View all
                                        <Icon name="arrow-right" className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {relatedPosts.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/blog/${related.slug}`}
                                            className="group flex flex-col h-full rounded-xl bg-zinc-900 border border-white/10 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-md"
                                        >
                                            <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                                                {related.image_url ? (
                                                    <img
                                                        src={related.image_url}
                                                        alt={related.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                                        <Icon name="book" className="w-8 h-8" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2">
                                                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950/80 text-emerald-400 border border-emerald-500/20">
                                                        {related.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[11px] font-mono text-zinc-400">
                                                        {formatDate(related.created_at)}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mt-1 line-clamp-2">
                                                        {related.title}
                                                    </h4>
                                                </div>
                                                <span className="mt-3 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 inline-flex items-center gap-1">
                                                    Read article <Icon name="arrow-right" className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-28">
                        <BlogArticleSidebar
                            headings={headings}
                            post={post}
                            wordCount={wordCount}
                            formattedDate={formattedDate}
                            shareUrl={canonicalUrl}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
