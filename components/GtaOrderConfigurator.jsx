'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/useCartStore';
import { toast } from '../utils/toast';
import Icon from './Icon';
import { PlayStationIcon, XboxIcon, PcIcon } from './PlatformBadges';

const DEFAULT_PACKAGES = [
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

const DEFAULT_VERSIONS = {
    PlayStation: [
        { id: 'ps4', label: 'PS4 (Standard Edition)' },
        { id: 'ps5', label: 'PS5 (Expanded & Enhanced Edition)' },
    ],
    Xbox: [
        { id: 'xbox_one', label: 'Xbox One (Standard Edition)' },
        { id: 'xbox_series', label: 'Xbox Series X|S (Expanded & Enhanced Edition)' },
    ],
    PC: [
        { id: 'pc_enhanced', label: 'PC (Enhanced / Steam / Rockstar)' },
        { id: 'pc_legacy', label: 'PC (Epic Games / Legacy)' },
    ],
};

const DEFAULT_ADDONS = [
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

    // Dynamic config resolution from product.configurator_data
    const configData = product?.configurator_data || {};
    const packages = useMemo(() => {
        return Array.isArray(configData.packages) && configData.packages.length > 0
            ? configData.packages
            : DEFAULT_PACKAGES;
    }, [configData.packages]);

    const versionsCatalog = useMemo(() => {
        return configData.versions && typeof configData.versions === 'object'
            ? configData.versions
            : DEFAULT_VERSIONS;
    }, [configData.versions]);

    const addonsCatalog = useMemo(() => {
        return Array.isArray(configData.addons) && configData.addons.length > 0
            ? configData.addons
            : DEFAULT_ADDONS;
    }, [configData.addons]);

    // Step 1: Platform (starts null for progressive disclosure)
    const [platform, setPlatform] = useState(null);

    // Step 2: Version
    const [version, setVersion] = useState(null);

    // Current versions for selected platform
    const versionsByPlatform = useMemo(() => {
        if (!platform) return [];
        return versionsCatalog[platform] || [
            { id: 'std', label: `${platform} Edition` },
        ];
    }, [platform, versionsCatalog]);

    const currentVersionLabel = useMemo(() => {
        const found = versionsByPlatform.find((v) => v.id === version);
        return found ? found.label : (version || '');
    }, [version, versionsByPlatform]);

    // Step 3: Package
    const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || 'pkg-10m');
    const [showAllPackages, setShowAllPackages] = useState(false);

    // Update selectedPackage if packages change
    useEffect(() => {
        if (packages.length > 0 && !packages.some((p) => p.id === selectedPackageId)) {
            setSelectedPackageId(packages[0].id);
        }
    }, [packages, selectedPackageId]);

    const selectedPackage = useMemo(() => {
        return packages.find((p) => p.id === selectedPackageId) || packages[0] || { price: 25.0, wasPrice: 35.0, label: 'Package', amount: 10 };
    }, [packages, selectedPackageId]);

    // Step 4: Addons
    const [selectedAddons, setSelectedAddons] = useState(new Set());

    // Filter available addons for current platform/version
    const availableAddons = useMemo(() => {
        return addonsCatalog.filter((addon) => {
            if (addon.platformOnly && addon.platformOnly !== platform) return false;
            if (addon.versionOnly) {
                const cleanVersion = String(version || '').toLowerCase();
                const req = String(addon.versionOnly).toLowerCase();
                if (!cleanVersion.includes(req)) return false;
            }
            return true;
        });
    }, [addonsCatalog, platform, version]);

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

    // Step 5: Totals
    const { finalTotal, wasTotal } = useMemo(() => {
        let current = Number(selectedPackage.price) || 0;
        let was = Number(selectedPackage.wasPrice) || (current * 1.35);

        availableAddons.forEach((addon) => {
            if (selectedAddons.has(addon.id)) {
                current += Number(addon.discountedPrice) || 0;
                was += Number(addon.originalPrice) || 0;
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

    const visiblePackages = showAllPackages ? packages : packages.slice(0, 6);

    return (
        <div className="panel-surface rounded-2xl p-6 sm:p-8 border border-white/10 bg-[#171229] space-y-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/25 text-[#9d7cff] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(157,124,255,0.2)]">
                        <Icon name="sliders" className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="display-font text-xl uppercase tracking-wide text-white leading-tight">
                            Configure your order
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Choose your platform and setup step by step
                        </p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9d7cff]/10 border border-[#9d7cff]/25 text-[#9d7cff] text-[11px] font-mono font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cff] animate-pulse" />
                    Secure
                </span>
            </div>

            {/* STEP 1: SELECT YOUR PLATFORM */}
            <div className="animate-ladder-row">
                <label className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
                    <span className="flex items-center gap-2">
                        <span className="text-[#9d7cff] font-black">[01]</span>
                        <span>SELECT YOUR PLATFORM</span>
                    </span>
                    {platform && (
                        <span className="text-[10px] text-[#9d7cff] font-mono lowercase">selected: {platform}</span>
                    )}
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
                                    setVersion(null); // Reset version so user chooses edition for this platform
                                }}
                                className={`py-3 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                                    active
                                        ? 'bg-[#9d7cff]/15 border-[#9d7cff] text-white shadow-[0_0_20px_rgba(157,124,255,0.3)] font-black ring-1 ring-[#9d7cff]/50'
                                        : 'bg-black/30 border-white/10 text-slate-300 hover:border-[#9d7cff]/50 hover:text-white'
                                }`}
                            >
                                {p === 'PlayStation' && <PlayStationIcon className="w-4 h-4 text-[#9d7cff]" />}
                                {p === 'Xbox' && <XboxIcon className="w-4 h-4 text-emerald-400" />}
                                {p === 'PC' && <PcIcon className="w-4 h-4 text-sky-400" />}
                                <span>{p}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Account Notice Box */}
                <div className="mt-3.5 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <Icon name="check" className="w-4 h-4 text-[#9d7cff] shrink-0 mt-0.5" />
                    <span>This boost will be applied to your account. Account information will be collected after checkout.</span>
                </div>
            </div>

            {/* STEP 2: SELECT YOUR VERSION (Revealed after Platform is chosen) */}
            {platform && (
                <div className="animate-ladder-row pt-5 border-t border-white/10 space-y-3">
                    <label className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                        <span className="flex items-center gap-2">
                            <span className="text-[#9d7cff] font-black">[02]</span>
                            <span>SELECT YOUR VERSION</span>
                        </span>
                        {version && (
                            <span className="text-[10px] text-[#9d7cff] font-mono">ready</span>
                        )}
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
                                            ? 'bg-[#9d7cff]/15 border-[#9d7cff] text-white shadow-[0_0_20px_rgba(157,124,255,0.3)] font-black ring-1 ring-[#9d7cff]/50'
                                            : 'bg-black/30 border-white/10 text-slate-300 hover:border-[#9d7cff]/50 hover:text-white'
                                    }`}
                                >
                                    {v.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* STEP 3 & STEP 4: PACKAGES & ADDONS (Revealed after Version is chosen) */}
            {platform && version && (
                <>
                    {/* STEP 3: SELECT YOUR PACKAGE */}
                    <div className="animate-ladder-row pt-5 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                                <span className="text-[#9d7cff] font-black">[03]</span>
                                <span>SELECT YOUR PACKAGE</span>
                            </label>

                            <span className="text-[11px] font-mono text-slate-400">
                                {packages.length} packages available
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {visiblePackages.map((pkg) => {
                                const active = selectedPackageId === pkg.id;
                                const pkgPrice = Number(pkg.price);
                                const pkgWas = Number(pkg.wasPrice);

                                return (
                                    <button
                                        key={pkg.id}
                                        type="button"
                                        onClick={() => setSelectedPackageId(pkg.id)}
                                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                            active
                                                ? 'bg-[#9d7cff]/15 border-[#9d7cff] shadow-[0_0_20px_rgba(157,124,255,0.25)] ring-1 ring-[#9d7cff]/50'
                                                : 'bg-black/30 border-white/10 hover:border-[#9d7cff]/40 hover:bg-black/40'
                                        }`}
                                    >
                                        <div className="min-w-0">
                                            <strong className="block text-xs sm:text-sm font-bold text-white leading-tight truncate">
                                                {pkg.label}
                                            </strong>
                                            {pkgWas > pkgPrice && (
                                                <span className="text-[11px] font-mono text-slate-400 line-through mt-0.5 block">
                                                    ${pkgWas.toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-sm sm:text-base font-black text-[#9d7cff] data-readout">
                                                ${pkgPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {packages.length > 6 && (
                            <button
                                type="button"
                                onClick={() => setShowAllPackages(!showAllPackages)}
                                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:border-[#9d7cff]/50 hover:text-white text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>{showAllPackages ? 'Show fewer packages' : `Show all ${packages.length} packages`}</span>
                                <Icon
                                    name="arrow-down"
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                        showAllPackages ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                        )}
                    </div>

                    {/* STEP 4: SAVE 10% WITH ADDONS */}
                    {availableAddons.length > 0 && (
                        <div className="animate-ladder-row pt-5 border-t border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                                    <span className="text-[#9d7cff] font-black">[04]</span>
                                    <span>SAVE 10% WITH ADDONS</span>
                                </label>

                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#9d7cff] font-bold">
                                    10% OFF APPLIED
                                </span>
                            </div>

                            <div className="space-y-2">
                                {availableAddons.map((addon) => {
                                    const checked = selectedAddons.has(addon.id);
                                    const discPrice = Number(addon.discountedPrice) || 0;
                                    const origPrice = Number(addon.originalPrice) || 0;

                                    return (
                                        <label
                                            key={addon.id}
                                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                checked
                                                    ? 'bg-[#9d7cff]/10 border-[#9d7cff]/50 shadow-[0_0_15px_rgba(157,124,255,0.15)]'
                                                    : 'bg-black/30 border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleAddon(addon.id)}
                                                    className="w-4 h-4 rounded accent-[#9d7cff] cursor-pointer shrink-0"
                                                />
                                                <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                                                    {addon.label}
                                                </span>
                                            </div>

                                            <div className="text-right shrink-0 flex items-center gap-2">
                                                {origPrice > discPrice && (
                                                    <span className="text-[11px] font-mono text-slate-400 line-through">
                                                        ${origPrice.toFixed(2)}
                                                    </span>
                                                )}
                                                <span className="px-2.5 py-1 rounded-full bg-[#9d7cff]/15 border border-[#9d7cff]/25 text-xs font-mono font-bold text-[#9d7cff]">
                                                    ${discPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TOTAL SUMMARY & ADD TO CART */}
                    <div className="animate-ladder-row pt-6 border-t border-white/10 space-y-4">
                        <div className="p-4 rounded-xl bg-black/40 border border-[#9d7cff]/30 flex items-center justify-between shadow-[0_0_20px_rgba(157,124,255,0.12)]">
                            <span className="text-xs font-mono uppercase tracking-widest font-bold text-slate-400">
                                TOTAL
                            </span>
                            <div className="text-right">
                                {wasTotal > finalTotal && (
                                    <span className="text-xs font-mono text-slate-400 line-through mr-2">
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
                            className="w-full bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black uppercase tracking-wider py-4 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_25px_rgba(157,124,255,0.35)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] cursor-pointer text-sm"
                        >
                            {added ? 'Added to cart! (Add more)' : 'Add to cart'}
                        </button>

                        {added && (
                            <Link
                                href="/checkout"
                                className="block text-center text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff] hover:text-white transition-colors"
                            >
                                Proceed to Checkout →
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
