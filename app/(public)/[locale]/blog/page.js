import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/Icon';
import BlogToolbar from '@/components/BlogToolbar';
import Reveal from '@/components/Reveal';
import { getBlogPosts, getBlogCategories } from '@/lib/blog';

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }) {
    const { locale } = await params;
    const { category, search } = (await searchParams) || {};

    let title = 'Game Guides, News & Meta Insights | OGmodz Blog';
    let description =
        'Explore expert game guides, GTA 5 money tips, CS2 rating breakdowns, and ban-safe boosting insights written by professional OGmodz specialists.';

    if (category && category !== 'All') {
        title = `${category} Guides & News | OGmodz Blog`;
        description = `Browse the latest ${category} walkthroughs, meta analysis, and player guides on OGmodz.`;
    } else if (search) {
        title = `Search results for "${search}" | OGmodz Blog`;
    }

    return {
        title,
        description,
        alternates: {
            canonical: '/blog',
        },
        openGraph: {
            title,
            description,
            url: '/blog',
            type: 'website',
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

export default async function BlogIndexPage({ params, searchParams }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const sParams = (await searchParams) || {};
    const category = sParams.category || 'All';
    const search = sParams.search || '';

    const [posts, categories] = await Promise.all([
        getBlogPosts({
            category: category !== 'All' ? category : undefined,
            search: search.trim() ? search.trim() : undefined,
            publishedOnly: true,
        }),
        getBlogCategories(),
    ]);

    // When viewing default "All" without search, separate the primary featured post
    const showFeaturedHero = (!category || category === 'All') && !search && posts.length > 0;
    const featuredPost = showFeaturedHero ? (posts.find((p) => p.is_featured) || posts[0]) : null;
    const gridPosts = showFeaturedHero && featuredPost
        ? posts.filter((p) => p.id !== featuredPost.id)
        : posts;

    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : 'https://www.ogmodz.com');

    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'OGmodz Blog & Guides',
        description:
            'Professional game guides, GTA 5 money tips, CS2 Premier ranking strategies, and industry news.',
        url: `${baseUrl}/blog`,
        publisher: {
            '@type': 'Organization',
            name: 'OGmodz',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo-v3.svg`,
            },
        },
        blogPost: posts.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            url: `${baseUrl}/blog/${post.slug}`,
            datePublished: post.created_at,
            image: post.image_url || undefined,
            author: {
                '@type': 'Person',
                name: post.author || 'OGmodz Specialist',
            },
        })),
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 pt-28 pb-20 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none"
                aria-hidden="true"
            />
            <div
                className="absolute top-96 right-0 w-[450px] h-[450px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"
                aria-hidden="true"
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-4 shadow-sm">
                        <Icon name="book" className="w-3.5 h-3.5" />
                        <span>INSIGHTS, META UPDATES &amp; GUIDES</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                        The OGmodz{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-emerald-400">
                            Blog
                        </span>
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Master the meta, discover high-yield money methods, dissect rank algorithms, and unlock insider gaming strategies from verified boosters.
                    </p>
                </div>

                {/* Toolbar: Search & Category Pills */}
                <BlogToolbar
                    categories={categories}
                    activeCategory={category}
                    initialSearch={search}
                />

                {/* Featured Article Card (DamnModz style large banner) */}
                {featuredPost && (
                    <Reveal className="mb-14">
                        <Link
                            href={`/blog/${featuredPost.slug}`}
                            className="group relative block rounded-2xl md:rounded-3xl bg-zinc-900 border border-white/10 hover:border-emerald-500/50 overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                {/* Thumbnail */}
                                <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] overflow-hidden bg-black/40">
                                    {featuredPost.image_url ? (
                                        <img
                                            src={featuredPost.image_url}
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                                            <Icon name="book" className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent lg:hidden" />
                                </div>

                                {/* Content Details */}
                                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap mb-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                {featuredPost.category}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold">
                                                <Icon name="star" className="w-3.5 h-3.5 fill-current" />
                                                FEATURED
                                            </span>
                                            <span className="text-xs text-zinc-400 font-mono">
                                                {formatDate(featuredPost.created_at)}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight leading-snug">
                                            {featuredPost.title}
                                        </h2>

                                        <p className="mt-4 text-sm sm:text-base text-zinc-300 line-clamp-3 sm:line-clamp-4 leading-relaxed">
                                            {featuredPost.excerpt}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                                            <span className="font-bold text-zinc-200">
                                                {featuredPost.author}
                                            </span>
                                            <span>•</span>
                                            <span className="font-mono">{featuredPost.read_time}</span>
                                        </div>

                                        <span className="inline-flex items-center gap-1.5 text-sm font-black text-emerald-400 group-hover:translate-x-1 transition-transform">
                                            Read article
                                            <Icon name="arrow-right" className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </Reveal>
                )}

                {/* 3-Column Articles Grid */}
                {gridPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {gridPosts.map((post) => (
                            <Reveal key={post.id}>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col h-full rounded-2xl bg-zinc-900 border border-white/10 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
                                >
                                    {/* Thumbnail (16:9 aspect) */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                                        {post.image_url ? (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                                                <Icon name="book" className="w-10 h-10" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950/80 backdrop-blur-md text-emerald-400 border border-white/10">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mb-2.5">
                                                <span>{formatDate(post.created_at)}</span>
                                                <span>•</span>
                                                <span>{post.read_time}</span>
                                            </div>

                                            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>

                                            <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-medium text-zinc-400">
                                                By {post.author}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 group-hover:translate-x-1 transition-transform">
                                                Read article
                                                <Icon name="arrow-right" className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center max-w-md mx-auto">
                        <div className="p-4 rounded-full bg-white/5 w-16 h-16 mx-auto mb-4 flex items-center justify-center text-zinc-500">
                            <Icon name="book" className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white">No articles found</h3>
                        <p className="text-sm text-zinc-400 mt-2">
                            {search
                                ? `No results matching "${search}". Try searching for something else.`
                                : `No articles published in the "${category}" category yet.`}
                        </p>
                        <Link
                            href="/blog"
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-colors cursor-pointer"
                        >
                            Reset Filters
                        </Link>
                    </div>
                )}

                {/* Bottom Callout Banner: Fast-Track Progression */}
                <Reveal className="mt-20">
                    <div className="relative rounded-2xl md:rounded-3xl p-8 sm:p-10 bg-zinc-900 border border-emerald-500/30 overflow-hidden shadow-2xl">
                        <div
                            className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
                            aria-hidden="true"
                        />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="max-w-xl text-center md:text-left">
                                <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-2">
                                    FAST-TRACK YOUR PROGRESSION
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Ready to Elevate Your Gaming Rank?
                                </h3>
                                <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                                    Skip hundreds of hours of grinding. Explore verified GTA 5, CS2, and custom boosting services with instant fulfillment and 24/7 dedicated support.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href="/store"
                                    className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer"
                                >
                                    Explore Store
                                </Link>
                                <a
                                    href="https://discord.gg/eaYMP2hnm4"
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-colors cursor-pointer"
                                >
                                    Join Discord
                                </a>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}
