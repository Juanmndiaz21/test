'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/useCartStore';
import { toast } from '../utils/toast';
import { Link } from '../i18n/navigation';
import Icon from './Icon';

const GTA_PACKAGES = [
    { id: 'pkg-10m', label: '10 Million Cash', amount: 10, price: 25.0, wasPrice: 35.0 },
    { id: 'pkg-15m', label: '15 Million Cash', amount: 15, price: 30.0, wasPrice: 42.0 },
    { id: 'pkg-20m', label: '20 Million Cash', amount: 20, price: 35.0, wasPrice: 49.0 },
    { id: 'pkg-25m', label: '25 Million Cash', amount: 25, price: 40.0, wasPrice: 56.0 },
    { id: 'pkg-30m', label: '30 Million Cash', amount: 30, price: 50.0, wasPrice: 70.0 },
    { id: 'pkg-40m', label: '40 Million Cash', amount: 40, price: 65.0, wasPrice: 90.0 },
    { id: 'pkg-50m', label: '50 Million Cash', amount: 50, price: 80.0, wasPrice: 110.0 },
    { id: 'pkg-75m', label: '75 Million Cash', amount: 75, price: 110.0, wasPrice: 150.0 },
    { id: 'pkg-100m', label: '100 Million Cash', amount: 100, price: 140.0, wasPrice: 195.0 },
    { id: 'pkg-150m', label: '150 Million Cash', amount: 150, price: 190.0, wasPrice: 260.0 },
    { id: 'pkg-200m', label: '200 Million Cash', amount: 200, price: 240.0, wasPrice: 330.0 },
    { id: 'pkg-250m', label: '250 Million Cash', amount: 250, price: 290.0, wasPrice: 400.0 },
    { id: 'pkg-300m', label: '300 Million Cash', amount: 300, price: 340.0, wasPrice: 470.0 },
    { id: 'pkg-400m', label: '400 Million Cash', amount: 400, price: 420.0, wasPrice: 580.0 },
    { id: 'pkg-500m', label: '500 Million Cash', amount: 500, price: 500.0, wasPrice: 690.0 },
    { id: 'pkg-750m', label: '750 Million Cash', amount: 750, price: 680.0, wasPrice: 940.0 },
    { id: 'pkg-1b', label: '1 Billion Cash', amount: 1000, price: 850.0, wasPrice: 1180.0 },
    { id: 'pkg-1.5b', label: '1.5 Billion Cash', amount: 1500, price: 1150.0, wasPrice: 1590.0 },
    { id: 'pkg-2b', label: '2 Billion Cash', amount: 2000, price: 1450.0, wasPrice: 2000.0 },
];

const GTA_ADDONS = [
    { id: 'bunker', label: '51/51 Bunker Research Unlocked', originalPrice: 60.0, discountedPrice: 54.0 },
    { id: 'skills', label: 'Max Skills', originalPrice: 60.0, discountedPrice: 54.0 },
    { id: 'rank120', label: 'Rank 120', originalPrice: 72.2, discountedPrice: 65.0 },
    { id: 'trophy_ps5', label: 'Unlock GTA 5 PS5 Platinum Trophy', originalPrice: 27.8, discountedPrice: 25.0, platformOnly: 'PlayStation', versionOnly: 'PS5' },
    { id: 'trophy_ps4', label: 'Unlock GTA 5 PS4 Platinum Trophy', originalPrice: 16.7, discountedPrice: 15.0, platformOnly: 'PlayStation', versionOnly: 'PS4' },
    { id: 'fast_run', label: 'Fast Run (Optional Addon)', originalPrice: 38.9, discountedPrice: 35.0 },
];

export default function GtaOrderConfigurator({ product }) {
    const t = useTranslations('product');
    const addToCart = useCartStore((state) => state.addToCart);

    // 1. Platform
    const [platform, setPlatform] = useState('PlayStation');

    // 2. Version / Edition
    const versionsByPlatform = useMemo(() => {
        if (platform === 'PlayStation') {
            return [
                { id: 'ps4', label: 'PS4 (Standard Edition)' },
                { id: 'ps5', label: 'PS5 (Expanded & Enhanced Edition)' },
            ];
        }
        if (platform === 'Xbox') {
            return [
                { id: 'xbox_one', label: 'Xbox One (Standard Edition)' },
                { id: 'xbox_series', label: 'Xbox Series X|S (Expanded & Enhanced Edition)' },
            ];
        }
        return [
            { id: 'pc_enhanced', label: 'PC (Enhanced / Steam / Rockstar)' },
            { id: 'pc_legacy', label: 'PC (Epic Games / Legacy)' },
        ];
    }, [platform]);

    const [version, setVersion] = useState(versionsByPlatform[0]?.id || 'ps4');

    // Ensure version matches platform when platform switches
    const currentVersionLabel = useMemo(() => {
        const found = versionsByPlatform.find((v) => v.id === version);
        return found ? found.label : versionsByPlatform[0]?.label || '';
    }, [version, versionsByPlatform]);

    // 3. Package
    const [selectedPackageId, setSelectedPackageId] = useState(GTA_PACKAGES[0].id);
    const [showAllPackages, setShowAllPackages] = useState(false);

    const selectedPackage = useMemo(() => {
        return GTA_PACKAGES.find((p) => p.id === selectedPackageId) || GTA_PACKAGES[0];
    }, [selectedPackageId]);

    // 4. Addons
    const [selectedAddons, setSelectedAddons] = useState(new Set());

    // Filter available addons for current platform/version
    const availableAddons = useMemo(() => {
        return GTA_ADDONS.filter((addon) => {
            if (addon.platformOnly && addon.platformOnly !== platform) return false;
            if (addon.versionOnly) {
                if (addon.versionOnly === 'PS5' && version !== 'ps5') return false;
                if (addon.versionOnly === 'PS4' && version !== 'ps4') return false;
            }
            return true;
        });
    }, [platform, version]);

    const toggleAddon = (addonId) => {
        setSelectedAddons((prev) => {
            const next = new Set(prev);
            if (next.has(addonId)) {
                next.delete(addonId);
            } else {
                next.add(addonId);
            }
            return next;
        });
    };

    // 5. Total calculation
    const { finalTotal, wasTotal } = useMemo(() => {
        let current = selectedPackage.price;
        let was = selectedPackage.wasPrice;

        availableAddons.forEach((addon) => {
            if (selectedAddons.has(addon.id)) {
                current += addon.discountedPrice;
                was += addon.originalPrice;
            }
        });

        return {
            finalTotal: current,
            wasTotal: was,
        };
    }, [selectedPackage, selectedAddons, availableAddons]);

    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        const activeAddonNames = availableAddons
            .filter((a) => selectedAddons.has(a.id))
            .map((a) => a.label);

        const itemKey = `${product.id}|${platform}|${version}|${selectedPackage.amount}|${Array.from(selectedAddons).sort().join(',')}`;

        addToCart({
            ...product,
            key: itemKey,
            name: `${product.name} · ${platform} (${currentVersionLabel.split(' ')[0]}) · ${selectedPackage.label}`,
            price: Number(finalTotal.toFixed(2)),
            platform,
            edition: currentVersionLabel,
            package: selectedPackage.label,
            boost_amount: selectedPackage.amount,
            addons: activeAddonNames,
        });

        setAdded(true);
        toast.success(`GTA V ${selectedPackage.label} added to cart!`, { title: 'Added to Cart' });
    };

    const visiblePackages = showAllPackages ? GTA_PACKAGES : GTA_PACKAGES.slice(0, 6);

    return (
        <div className="panel-surface rounded-2xl p-6 sm:p-8 border border-white/10 bg-[#171229] space-y-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Icon name="sliders" className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="display-font text-xl uppercase tracking-wide text-white leading-tight">
                            Configure your order
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Choose the setup that fits you
                        </p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Secure
                </span>
            </div>

            {/* 1. SELECT YOUR PLATFORM */}
            <div>
                <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
                    <span>SELECT YOUR PLATFORM</span>
                    <span className="text-amber-500">•</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                    {['PlayStation', 'Xbox', 'PC'].map((p) => {
                        const active = platform === p;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => {
                                    setPlatform(p);
                                    if (p === 'PlayStation') setVersion('ps4');
                                    else if (p === 'Xbox') setVersion('xbox_one');
                                    else setVersion('pc_enhanced');
                                }}
                                className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${
                                    active
                                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                        : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                {/* Account Notice Box */}
                <div className="mt-3.5 p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300 leading-relaxed">
                    This boost will be applied to your account. Account information will be collected after checkout.
                </div>
            </div>

            {/* 2. SELECT YOUR VERSION */}
            <div>
                <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
                    <span>SELECT YOUR VERSION</span>
                    <span className="text-amber-500">•</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {versionsByPlatform.map((v) => {
                        const active = version === v.id;
                        return (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => setVersion(v.id)}
                                className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border text-center ${
                                    active
                                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                        : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                                }`}
                            >
                                {v.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. SELECT YOUR PACKAGE */}
            <div>
                <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
                    <span>SELECT YOUR PACKAGE</span>
                    <span className="text-amber-500">•</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {visiblePackages.map((pkg) => {
                        const active = selectedPackageId === pkg.id;
                        return (
                            <button
                                key={pkg.id}
                                type="button"
                                onClick={() => setSelectedPackageId(pkg.id)}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    active
                                        ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                                        : 'bg-black/20 border-white/10 hover:border-white/25'
                                }`}
                            >
                                <span className={`block text-xs sm:text-sm font-black ${active ? 'text-white' : 'text-slate-200'}`}>
                                    {pkg.label}
                                </span>
                                <span className={`block text-xs font-mono mt-1 ${active ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                                    ${pkg.price.toFixed(2)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => setShowAllPackages((prev) => !prev)}
                    className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/5 hover:border-white/30 text-xs font-mono font-bold text-slate-300 transition-colors cursor-pointer"
                >
                    {showAllPackages ? 'Show fewer options' : `Show all ${GTA_PACKAGES.length} options`}
                </button>
            </div>

            {/* 4. SAVE 10% WITH ADDONS */}
            <div>
                <div className="inline-block bg-amber-500 text-black font-black text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md mb-3 shadow-sm">
                    SAVE 10% WITH ADDONS
                </div>

                <div className="space-y-2">
                    {availableAddons.map((addon) => {
                        const isChecked = selectedAddons.has(addon.id);
                        return (
                            <label
                                key={addon.id}
                                onClick={() => toggleAddon(addon.id)}
                                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-colors ${
                                    isChecked
                                        ? 'bg-amber-500/10 border-amber-500/50'
                                        : 'bg-black/20 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                            isChecked
                                                ? 'bg-amber-500 border-amber-500 text-black'
                                                : 'border-white/30 bg-black/40'
                                        }`}
                                    >
                                        {isChecked && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3 h-3">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                                        {addon.label}
                                    </span>
                                </div>

                                <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-mono font-bold text-slate-300 shrink-0">
                                    ${addon.discountedPrice.toFixed(2)}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Total Summary and Order Action */}
            <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="p-4 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest font-bold text-slate-400">
                        TOTAL
                    </span>
                    <div className="text-right">
                        {wasTotal > finalTotal && (
                            <span className="text-xs font-mono text-slate-500 line-through mr-2">
                                ${wasTotal.toFixed(2)}
                            </span>
                        )}
                        <strong className="text-2xl sm:text-3xl font-black text-white data-readout">
                            ${finalTotal.toFixed(2)}
                        </strong>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full bg-amber-500 hover:bg-white text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-pointer text-sm"
                >
                    {added ? 'Added to cart! (Add more)' : 'Add to cart'}
                </button>

                {added && (
                    <Link
                        href="/checkout"
                        className="block text-center text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-white transition-colors"
                    >
                        Proceed to Checkout →
                    </Link>
                )}
            </div>
        </div>
    );
}

