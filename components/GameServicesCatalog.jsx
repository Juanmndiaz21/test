'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import PlatformFilterBar from './PlatformFilterBar';
import Icon from './Icon';

export default function GameServicesCatalog({ products = [] }) {
    const t = useTranslations('gamePage');
    const [activePlatform, setActivePlatform] = useState('all');

    const filteredProducts = useMemo(() => {
        if (activePlatform === 'all') return products;

        const target = activePlatform.toLowerCase();
        return products.filter((product) => {
            const p = String(product.platform || 'all').toLowerCase();
            if (p === 'all') return true;
            if (target === 'playstation') return p.includes('playstation') || p.includes('ps');
            if (target === 'xbox') return p.includes('xbox');
            if (target === 'pc') return p.includes('pc') || p.includes('windows');
            return p.includes(target);
        });
    }, [products, activePlatform]);

    if (products.length === 0) {
        return (
            <div className="panel-surface rounded-3xl text-center py-20 border border-white/10 bg-[#171229]">
                <p className="eyebrow mb-3 text-[#9d7cff]">{t('noServicesYet')}</p>
                <p className="text-slate-300 text-lg">{t('readyForFirstService')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Filter toolbar matching reference layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#171229] border border-white/10 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                        {t('allPlatforms')}:
                    </span>
                    <span className="text-xs font-mono text-[#9d7cff] font-bold px-2.5 py-0.5 rounded-full bg-[#9d7cff]/10 border border-[#9d7cff]/20">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'service' : 'services'}
                    </span>
                </div>

                {/* 4 Platform Icons: All, PlayStation, Xbox, PC */}
                <PlatformFilterBar
                    activePlatform={activePlatform}
                    onSelectPlatform={setActivePlatform}
                />
            </div>

            {/* Filtered Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="panel-surface rounded-2xl text-center py-16 border border-white/10 bg-[#171229] space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                        <Icon name="search" className="w-6 h-6" />
                    </div>
                    <p className="text-white text-lg font-bold">
                        No services available for {activePlatform}
                    </p>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        There are currently no services tagged specifically for {activePlatform}.
                    </p>
                    <button
                        type="button"
                        onClick={() => setActivePlatform('all')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9d7cff]/15 hover:bg-[#9d7cff] text-[#9d7cff] hover:text-[#0d0914] border border-[#9d7cff]/30 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Show all platforms
                    </button>
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
