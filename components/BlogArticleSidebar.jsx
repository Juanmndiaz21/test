'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from './Icon';

export default function BlogArticleSidebar({
    headings = [],
    post = {},
    wordCount = 0,
    formattedDate = '',
    shareUrl = ''
}) {
    const [activeId, setActiveId] = useState(headings[0]?.id || '');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!headings || headings.length === 0) return;

        const handleScroll = () => {
            const scrollPos = window.scrollY + 140;
            let current = headings[0]?.id || '';

            for (const h of headings) {
                const el = document.getElementById(h.id);
                if (el && el.offsetTop <= scrollPos) {
                    current = h.id;
                }
            }
            setActiveId(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    const scrollToHeading = (e, id) => {
        e.preventDefault();
        const target = document.getElementById(id);
        if (target) {
            const top = target.getBoundingClientRect().top + window.pageYOffset - 110;
            window.scrollTo({ top, behavior: 'smooth' });
            history.pushState(null, '', `#${id}`);
            setActiveId(id);
        }
    };

    const handleCopy = () => {
        const url = shareUrl || window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const encodedUrl = encodeURIComponent(shareUrl || '');
    const encodedTitle = encodeURIComponent(post.title || '');

    return (
        <aside className="space-y-6">
            {/* 1. Sidebar CTA (DamnModz style) */}
            <div className="rounded-2xl p-6 border border-emerald-500/30 shadow-2xl bg-zinc-900 relative overflow-hidden">
                <div
                    className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                        RECOMMENDED
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        INSTANT DELIVERY
                    </span>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight">
                    Upgrade Your Account
                </h3>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                    Skip hundreds of hours of grinding. Explore verified packages, boosting, and cash options tailored for your gameplay.
                </p>

                <div className="mt-5 space-y-2.5">
                    <Link
                        href="/store"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                        Browse Boosting Catalog
                        <Icon name="arrow-right" className="w-4 h-4" />
                    </Link>
                    <a
                        href="https://discord.gg/qwyQjn4Aqx"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-bold text-xs transition-colors cursor-pointer"
                    >
                        <Icon name="discord" className="w-3.5 h-3.5 text-[#5865F2]" />
                        Talk to Support
                    </a>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-400 text-center">
                    <Icon name="shield" className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Ban-Safe · SSL 256-bit encrypted</span>
                </div>
            </div>

            {/* 2. Table of Contents (TOC with Scroll-Spy) */}
            {headings.length > 0 && (
                <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 shadow-lg">
                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                        <Icon name="clipboard" className="w-4 h-4 text-emerald-400" />
                        <span>Table of Contents</span>
                    </div>

                    <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-none text-xs">
                        {headings.map((h) => {
                            const isActive = activeId === h.id;
                            const isSub = h.level === 3;
                            return (
                                <a
                                    key={h.id}
                                    href={`#${h.id}`}
                                    onClick={(e) => scrollToHeading(e, h.id)}
                                    className={`group flex items-start gap-2 py-1.5 rounded-lg transition-all ${
                                        isSub ? 'pl-5 text-zinc-400' : 'pl-2 text-zinc-300'
                                    } ${
                                        isActive
                                            ? 'text-emerald-400 font-bold bg-emerald-500/10'
                                            : 'hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 transition-colors ${
                                            isActive
                                                ? 'bg-emerald-400 scale-125'
                                                : 'bg-white/20 group-hover:bg-white/50'
                                        }`}
                                    />
                                    <span className="leading-snug">{h.title}</span>
                                </a>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* 3. Article Metadata Card */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 shadow-lg">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    <Icon name="info" className="w-4 h-4 text-emerald-400" />
                    <span>Article Info</span>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                    <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-400">Category</span>
                        <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {post.category || 'Guides'}
                        </span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-400">Published</span>
                        <span className="font-mono text-zinc-200">{formattedDate}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-400">Read Time</span>
                        <span className="font-mono text-zinc-200">{post.read_time}</span>
                    </div>
                    {wordCount > 0 && (
                        <div className="py-2 flex items-center justify-between">
                            <span className="text-zinc-400">Total Words</span>
                            <span className="font-mono text-zinc-200">
                                {wordCount.toLocaleString()} words
                            </span>
                        </div>
                    )}
                    <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-400">Verified By</span>
                        <span className="font-medium text-zinc-200">{post.author}</span>
                    </div>
                </div>
            </div>

            {/* 4. Share Article Widget */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 shadow-lg">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    <Icon name="arrow-up-right" className="w-4 h-4 text-emerald-400" />
                    <span>Share Article</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {/* X (Twitter) */}
                    <a
                        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on X"
                        className="h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-all hover:scale-105"
                    >
                        <span className="font-bold text-xs font-mono">𝕏</span>
                    </a>

                    {/* Facebook */}
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on Facebook"
                        className="h-10 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/40 flex items-center justify-center text-zinc-300 hover:text-[#1877F2] transition-all hover:scale-105"
                    >
                        <span className="font-bold text-xs font-mono">f</span>
                    </a>

                    {/* Reddit */}
                    <a
                        href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on Reddit"
                        className="h-10 rounded-xl bg-white/5 hover:bg-[#FF4500]/20 border border-white/10 hover:border-[#FF4500]/40 flex items-center justify-center text-zinc-300 hover:text-[#FF4500] transition-all hover:scale-105"
                    >
                        <span className="font-bold text-xs font-mono">r/</span>
                    </a>

                    {/* Copy Link Button */}
                    <button
                        onClick={handleCopy}
                        title={copied ? 'Link Copied!' : 'Copy Link'}
                        className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            copied
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white hover:scale-105'
                        }`}
                    >
                        {copied ? (
                            <Icon name="check" className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <Icon name="copy" className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {copied && (
                    <p className="text-[11px] font-mono text-emerald-400 text-center mt-2 animate-fade-in">
                        ✓ Link copied to clipboard!
                    </p>
                )}
            </div>
        </aside>
    );
}
