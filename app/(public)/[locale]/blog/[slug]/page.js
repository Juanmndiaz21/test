import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';
import Reveal from '@/components/Reveal';
import BlogMarkdown from '@/components/BlogMarkdown';
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

    return {
        title,
        description,
        alternates: {
            canonical: `/blog/${post.slug}`,
        },
        openGraph: {
            title,
            description,
            url: `/blog/${post.slug}`,
            type: 'article',
            publishedTime: post.created_at,
            modifiedTime: post.updated_at || post.created_at,
            authors: [post.author || 'OGmodz Specialist'],
            images: post.image_url ? [{ url: post.image_url }] : [],
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
            month: 'long',
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

    // Related posts from same category or latest
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

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.image_url || undefined,
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
            '@type': 'Person',
            name: post.author || 'OGmodz Specialist',
        },
        publisher: {
            '@type': 'Organization',
            name: 'OGmodz',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo-v3.svg`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${post.slug}`,
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
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
                item: `${baseUrl}/blog/${post.slug}`,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-[#0d0914] text-slate-100 pt-28 pb-20 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#9d7cff]/10 blur-[130px] rounded-full pointer-events-none"
                aria-hidden="true"
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Breadcrumbs */}
                <nav
                    aria-label="Breadcrumbs"
                    className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none"
                >
                    <Link href="/" className="hover:text-white transition-colors">
                        Home
                    </Link>
                    <Icon name="chevron-right" className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <Link href="/blog" className="hover:text-white transition-colors">
                        Blog
                    </Link>
                    <Icon name="chevron-right" className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="text-[#9d7cff] truncate max-w-[220px] sm:max-w-none">
                        {post.title}
                    </span>
                </nav>

                {/* Article Header */}
                <header className="mb-8 sm:mb-12">
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                        <Link
                            href={`/blog?category=${encodeURIComponent(post.category)}`}
                            className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#9d7cff]/20 text-[#9d7cff] border border-[#9d7cff]/30 hover:bg-[#9d7cff]/30 transition-colors"
                        >
                            {post.category}
                        </Link>
                        {post.is_featured && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-mono font-bold">
                                <Icon name="star" className="w-3.5 h-3.5 fill-current" />
                                FEATURED
                            </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                            {formatDate(post.created_at)}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight">
                        {post.title}
                    </h1>

                    {/* Excerpt preview if available */}
                    {post.excerpt && (
                        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Author & Read Time Meta */}
                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#9d7cff]/20 border border-[#9d7cff]/40 flex items-center justify-center text-[#9d7cff] font-bold text-sm">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none">
                                    {post.author}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Verified OGmodz Specialist</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <Icon name="clock" className="w-4 h-4 text-[#9d7cff]" />
                            <span>{post.read_time}</span>
                        </div>
                    </div>
                </header>

                {/* Hero Cover Image */}
                {post.image_url && (
                    <div className="relative aspect-[16/9] w-full rounded-2xl md:rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Article Body Content */}
                <div className="panel-surface rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-12 border border-white/10 shadow-2xl">
                    <BlogMarkdown content={post.content} />
                </div>

                {/* In-Article Contextual Boosting Promotion Banner */}
                <div className="mt-12 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#1b142e] via-[#161126] to-[#120e1c] border border-[#9d7cff]/30 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff] inline-block mb-1">
                                VERIFIED SERVICES · 100% BAN-SAFE
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-white">
                                Ready to Dominate Your Favorite Game?
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-lg leading-relaxed">
                                Get instant delivery, VPN-protected lobbies, and 24/7 specialist assistance for GTA 5, CS2, and more.
                            </p>
                        </div>
                        <Link
                            href="/store"
                            className="shrink-0 px-6 py-3 rounded-xl bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(157,124,255,0.35)] hover:scale-105 active:scale-95"
                        >
                            Browse Boosting Catalog
                        </Link>
                    </div>
                </div>

                {/* Related Articles Section */}
                {relatedPosts.length > 0 && (
                    <section className="mt-16 sm:mt-20 pt-12 border-t border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff]">
                                    EXPLORE MORE
                                </span>
                                <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                                    Related Guides &amp; Articles
                                </h3>
                            </div>
                            <Link
                                href="/blog"
                                className="text-xs font-bold text-[#9d7cff] hover:underline underline-offset-4 flex items-center gap-1"
                            >
                                View all posts
                                <Icon name="arrow-right" className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="group flex flex-col h-full rounded-xl bg-[#120e1c] border border-white/10 hover:border-[#9d7cff]/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-md"
                                >
                                    <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                                        {related.image_url ? (
                                            <img
                                                src={related.image_url}
                                                alt={related.title}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#171229] text-slate-600">
                                                <Icon name="book" className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0d0914]/80 text-[#9d7cff]">
                                                {related.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[11px] font-mono text-slate-400">
                                                {formatDate(related.created_at)}
                                            </span>
                                            <h4 className="text-sm font-bold text-white group-hover:text-[#9d7cff] transition-colors mt-1 line-clamp-2">
                                                {related.title}
                                            </h4>
                                        </div>
                                        <span className="mt-3 text-xs font-bold text-[#9d7cff] inline-flex items-center gap-1">
                                            Read article <Icon name="arrow-right" className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </main>
    );
}
