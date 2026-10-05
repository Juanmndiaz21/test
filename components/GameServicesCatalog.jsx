'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import PlatformFilterBar from './PlatformFilterBar';
import Icon from './Icon';

export default function GameServicesCatalog({ products = [], game = '' }) {
    const t = useTranslations('gamePage');
    const [activePlatform, setActivePlatform] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const filtered = products.filter((product) => {
            // Platform filter
            if (activePlatform !== 'all') {
                const target = activePlatform.toLowerCase();
                const p = String(product.platform || 'all').toLowerCase();
                if (p !== 'all') {
                    const match =
                        (target === 'playstation' && (p.includes('playstation') || p.includes('ps'))) ||
                        (target === 'xbox' && p.includes('xbox')) ||
                        (target === 'pc' && (p.includes('pc') || p.includes('windows'))) ||
                        p.includes(target);
                    if (!match) return false;
                }
            }

            // Price range filter
            if (priceRange !== 'all') {
                const price = Number(product.price);
                if (priceRange === 'under-20' && price >= 20) return false;
                if (priceRange === '20-50' && (price < 20 || price > 50)) return false;
                if (priceRange === '50-100' && (price < 50 || price > 100)) return false;
                if (priceRange === 'over-100' && price <= 100) return false;
            }

            // Search query filter
            if (query) {
                const name = String(product.name || '').toLowerCase();
                const desc = String(product.description || '').toLowerCase();
                const category = String(product.category || '').toLowerCase();
                const features = Array.isArray(product.features)
                    ? product.features.join(' ').toLowerCase()
                    : '';
                const matches =
                    name.includes(query) ||
                    desc.includes(query) ||
                    category.includes(query) ||
                    features.includes(query);
                if (!matches) return false;
            }

            return true;
        });

        // Sorting
        if (sortBy === 'price-asc') {
            return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
        }
        if (sortBy === 'price-desc') {
            return [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
        }
        return filtered;
    }, [products, activePlatform, priceRange, sortBy, searchQuery]);

    if (products.length === 0) {
        return (
            <div className="panel-surface rounded-3xl text-center py-20 border border-white/10 bg-zinc-900/60">
                <p className="eyebrow mb-3 text-emerald-400">{t('noServicesYet')}</p>
                <p className="text-zinc-300 text-lg">{t('readyForFirstService')}</p>
            </div>
        );
    }

    const hasActiveFilters = activePlatform !== 'all' || priceRange !== 'all' || sortBy !== 'default' || searchQuery.trim().length > 0;

    const resetFilters = () => {
        setActivePlatform('all');
        setPriceRange('all');
        setSortBy('default');
        setSearchQuery('');
    };

    return (
        <div className="space-y-8">
            {/* Filter toolbar with Search, Price, Platforms & Sorting */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-zinc-900/70 border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <label htmlFor="services-search" className="sr-only">
                            {t('searchLabel')}
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
                                <Icon name="search" className="w-4 h-4" />
                            </span>
                            <input
                                id="services-search"
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('searchServices')}
                                className="w-full bg-zinc-950 border border-white/10 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none transition-all shadow-inner"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label={t('clearSearch')}
                                    className="absolute right-2.5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <Icon name="x" className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Secondary Filters: Price Range & Sort */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Price Range Filter */}
                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs">
                            <Icon name="tag" className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-zinc-400 font-mono hidden sm:inline">{t('filterByPrice')}:</span>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                aria-label={t('filterByPrice')}
                                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                            >
                                <option value="all" className="bg-zinc-900 text-white">{t('allPrices')}</option>
                                <option value="under-20" className="bg-zinc-900 text-white">{t('under20')}</option>
                                <option value="20-50" className="bg-zinc-900 text-white">{t('from20to50')}</option>
                                <option value="50-100" className="bg-zinc-900 text-white">{t('from50to100')}</option>
                                <option value="over-100" className="bg-zinc-900 text-white">{t('over100')}</option>
                            </select>
                        </div>

                        {/* Sort Select */}
                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs">
                            <Icon name="sliders" className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-zinc-400 font-mono hidden sm:inline">{t('sortBy')}:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label={t('sortBy')}
                                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                            >
                                <option value="default" className="bg-zinc-900 text-white">{t('sortDefault')}</option>
                                <option value="price-asc" className="bg-zinc-900 text-white">{t('sortPriceAsc')}</option>
                                <option value="price-desc" className="bg-zinc-900 text-white">{t('sortPriceDesc')}</option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 font-mono cursor-pointer transition-colors"
                            >
                                {t('clearAllFilters')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Platforms & Result Count */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                            {t('allPlatforms')}:
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            {t('servicesCountBadge', { count: filteredProducts.length })}
                        </span>
                    </div>

                    <PlatformFilterBar
                        activePlatform={activePlatform}
                        onSelectPlatform={setActivePlatform}
                    />
                </div>
            </div>

            {/* Section Heading */}
            <div className="flex items-center justify-between pt-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    <span>{game ? `${game} Boosting Packages` : 'Available Packages'}</span>
                </h2>
            </div>

            {/* Filtered Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="panel-surface rounded-2xl text-center py-16 border border-white/10 bg-zinc-900/60 space-y-4 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                        <Icon name="search" className="w-6 h-6" />
                    </div>
                    <p className="text-white text-lg font-bold">
                        {searchQuery.trim()
                            ? t('noServicesMatchQuery', { query: searchQuery.trim() })
                            : t('noServicesForPlatform', { platform: activePlatform })}
                    </p>
                    <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                        {searchQuery.trim()
                            ? t('noServicesMatchQueryDesc')
                            : t('noServicesForPlatformDesc', { platform: activePlatform })}
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            {searchQuery.trim() ? t('clearAllFilters') : t('showAllPlatforms')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}
