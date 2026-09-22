'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import PlatformFilterBar from './PlatformFilterBar';
import Icon from './Icon';

export default function GameServicesCatalog({ products = [] }) {
    const t = useTranslations('gamePage');
    const [activePlatform, setActivePlatform] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return products.filter((product) => {
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
    }, [products, activePlatform, searchQuery]);

    if (products.length === 0) {
        return (
            <div className="panel-surface rounded-3xl text-center py-20 border border-white/10 bg-[#171229]">
                <p className="eyebrow mb-3 text-[#9d7cff]">{t('noServicesYet')}</p>
                <p className="text-slate-300 text-lg">{t('readyForFirstService')}</p>
            </div>
        );
    }

    const hasActiveFilters = activePlatform !== 'all' || searchQuery.trim().length > 0;

    const resetFilters = () => {
        setActivePlatform('all');
        setSearchQuery('');
    };

    return (
        <div className="space-y-8">
            {/* Filter toolbar with Search & Platforms */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#171229] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <label htmlFor="services-search" className="sr-only">
                        {t('searchLabel')}
                    </label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                            <Icon name="search" className="w-4 h-4" />
                        </span>
                        <input
                            id="services-search"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('searchServices')}
                            className="w-full bg-[#120e1c] border border-white/10 focus:border-[#9d7cff]/60 focus:ring-1 focus:ring-[#9d7cff]/40 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none transition-all shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label={t('clearSearch')}
                                className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <Icon name="x" className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Platform Filter & Count */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hidden sm:inline">
                            {t('allPlatforms')}:
                        </span>
                        <span className="text-xs font-mono text-[#9d7cff] font-bold px-2.5 py-1 rounded-full bg-[#9d7cff]/10 border border-[#9d7cff]/20">
                            {t('servicesCountBadge', { count: filteredProducts.length })}
                        </span>
                    </div>

                    {/* 4 Platform Icons: All, PlayStation, Xbox, PC */}
                    <PlatformFilterBar
                        activePlatform={activePlatform}
                        onSelectPlatform={setActivePlatform}
                    />
                </div>
            </div>

            {/* Filtered Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="panel-surface rounded-2xl text-center py-16 border border-white/10 bg-[#171229] space-y-4 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                        <Icon name="search" className="w-6 h-6" />
                    </div>
                    <p className="text-white text-lg font-bold">
                        {searchQuery.trim()
                            ? t('noServicesMatchQuery', { query: searchQuery.trim() })
                            : t('noServicesForPlatform', { platform: activePlatform })}
                    </p>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        {searchQuery.trim()
                            ? t('noServicesMatchQueryDesc')
                            : t('noServicesForPlatformDesc', { platform: activePlatform })}
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9d7cff]/15 hover:bg-[#9d7cff] text-[#9d7cff] hover:text-[#0d0914] border border-[#9d7cff]/30 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
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
