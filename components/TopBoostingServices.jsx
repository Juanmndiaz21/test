'use client';

import { useState, useMemo } from 'react';
import { Link } from '../i18n/navigation';
import { productToSlug } from '@/lib/gameSlugs';
import GameLogo from './GameLogo';
import Icon from './Icon';

const TABS = [
    { id: 'best-sellers', label: 'Best Sellers', badge: 'HOT' },
    { id: 'featured', label: 'Featured', badge: 'TOP' },
    { id: 'new', label: 'New', badge: 'NEW' },
    { id: 'on-sale', label: 'On Sale', badge: 'SALE' },
];

function getSubtitleSnippet(product) {
    if (product.features) {
        const lines = String(product.features)
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
        if (lines.length > 0) return lines[0];
    }
    if (product.description) {
        const firstLine = product.description.split('\n')[0].replace(/^[#*-]+\s*/, '').trim();
        if (firstLine && firstLine.length > 3) return firstLine;
    }
    if (product.game) {
        return `${product.game} Boost Package`;
    }
    return 'Instant Delivery · Safe Method';
}

export default function TopBoostingServices({ products = [] }) {
    const [activeTab, setActiveTab] = useState('best-sellers');

    const displayedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        let list = [];
        if (activeTab === 'best-sellers') {
            // Prioritize high-demand popular keywords
            list = [...products].sort((a, b) => {
                const aName = (a.name || '').toLowerCase();
                const bName = (b.name || '').toLowerCase();
                const score = (str) => {
                    if (str.includes('cash') || str.includes('billion')) return 4;
                    if (str.includes('modded') || str.includes('rank')) return 3;
                    if (str.includes('unlock') || str.includes('blueprint') || str.includes('camo')) return 2;
                    return 1;
                };
                return score(bName) - score(aName);
            });
        } else if (activeTab === 'featured') {
            // Curated featured services
            list = [...products].filter((p) => {
                const name = (p.name || '').toLowerCase();
                return name.includes('gta') || name.includes('bo6') || name.includes('cs2') || name.includes('modded');
            });
            if (list.length < 8) {
                const ids = new Set(list.map((p) => p.id));
                for (const p of products) {
                    if (!ids.has(p.id)) list.push(p);
                }
            }
        } else if (activeTab === 'new') {
            // Newest products by id desc
            list = [...products].sort((a, b) => Number(b.id) - Number(a.id));
        } else if (activeTab === 'on-sale') {
            // Discounted products (original_price > price)
            list = [...products].filter((p) => Number(p.original_price) > Number(p.price));
            list.sort((a, b) => {
                const diffA = Number(a.original_price) - Number(a.price);
                const diffB = Number(b.original_price) - Number(b.price);
                return diffB - diffA;
            });
            if (list.length < 8) {
                const ids = new Set(list.map((p) => p.id));
                for (const p of products) {
                    if (!ids.has(p.id)) list.push(p);
                }
            }
        } else {
            list = products;
        }

        // Return up to 8 products (2 rows of 4 columns)
        return list.slice(0, 8);
    }, [products, activeTab]);

    if (!products || products.length === 0) return null;

    const currentTabInfo = TABS.find((t) => t.id === activeTab) || TABS[0];

    return (
        <section aria-label="Top Boosting Services" className="max-w-7xl mx-auto px-5 py-12 md:py-16 content-auto">
            {/* Header: Title on Left, Filter Pills on Right matching screenshot */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                        <Icon name="bolt" className="w-5 h-5" />
                    </span>
                    <div>
                        <h2 className="display-font text-3xl sm:text-4xl uppercase text-white tracking-tight">
                            Top Boosting Services
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                            Popular player picks, high-demand cash drops and recovery packages
                        </p>
                    </div>
                </div>

                {/* Filter Pills with Website Night Violet Glowing Theme */}
                <div
                    role="tablist"
                    aria-label="Filter top boosting services"
                    className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
                >
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                type="button"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-mono font-bold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap select-none ${
                                    isActive
                                        ? 'bg-[#1b142d] text-white border border-[#9d7cff] shadow-[0_0_16px_rgba(157,124,255,0.4)] ring-1 ring-[#9d7cff]/30'
                                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/[0.08]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product Cards Grid: 4 Columns Horizontal Mini-Cards matching screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {displayedProducts.map((product) => {
                    const price = Number(product.price) || 0;
                    const originalPrice = product.original_price ? Number(product.original_price) : null;
                    const hasDiscount = originalPrice && originalPrice > price;
                    const wasPrice = hasDiscount ? originalPrice : null;
                    const subtitle = getSubtitleSnippet(product);
                    const slug = product.slug || productToSlug(product.id, product.name);

                    // Dynamic badge per card
                    let badgeLabel = currentTabInfo.badge;
                    if (hasDiscount && activeTab === 'on-sale') {
                        const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
                        badgeLabel = `-${pct}%`;
                    }

                    return (
                        <Link
                            key={product.id}
                            href={`/store/${slug}`}
                            className="group relative p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-[#161126] hover:bg-[#1c1532] hover:border-[#9d7cff]/60 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_22px_rgba(157,124,255,0.18)] transition-all duration-200 flex items-center gap-3 sm:gap-3.5 select-none cursor-pointer overflow-hidden"
                        >
                            {/* Left Thumbnail (Square with rounded corners) */}
                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0 relative flex items-center justify-center">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1b142d] to-[#0d0914] p-2">
                                        <GameLogo
                                            name={product.game || product.name}
                                            className="w-10 h-10 object-contain drop-shadow"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Information Container */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                {/* Row 1: Title + Capsule Badge */}
                                <div className="flex items-start justify-between gap-1.5">
                                    <h3
                                        title={product.name}
                                        className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#9d7cff] transition-colors"
                                    >
                                        {product.name}
                                    </h3>
                                    <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)] ml-1">
                                        {badgeLabel}
                                    </span>
                                </div>

                                {/* Row 2: Subtitle snippet */}
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal">
                                    {subtitle}
                                </p>

                                {/* Row 3: Pricing */}
                                <div className="mt-1.5 flex items-baseline gap-1.5 font-mono">
                                    {wasPrice && (
                                        <span className="text-[11px] text-slate-500 line-through">
                                            ${wasPrice.toFixed(2)}
                                        </span>
                                    )}
                                    <span className="text-sm sm:text-base font-black text-white group-hover:text-[#9d7cff] transition-colors">
                                        ${price.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Link to Full Store */}
            <div className="mt-8 flex justify-center">
                <Link
                    href="/store"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-[#9d7cff]/50 hover:bg-[#9d7cff]/10 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all shadow-sm"
                >
                    <span>View All Services Catalog</span>
                    <Icon name="arrow-right" className="w-3.5 h-3.5 text-[#9d7cff]" />
                </Link>
            </div>
        </section>
    );
}
