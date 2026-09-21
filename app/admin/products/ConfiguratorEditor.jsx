'use client';

import { useState } from 'react';

const DEFAULT_CONFIG = {
    versions: {
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
    },
    packages: [
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
    ],
    addons: [
        { id: 'bunker', label: '51/51 Bunker Research Unlocked', originalPrice: 60.0, discountedPrice: 54.0 },
        { id: 'skills', label: 'Max Skills', originalPrice: 60.0, discountedPrice: 54.0 },
        { id: 'rank120', label: 'Rank 120', originalPrice: 72.2, discountedPrice: 65.0 },
        { id: 'trophy_ps5', label: 'Unlock GTA 5 PS5 Platinum Trophy', originalPrice: 27.8, discountedPrice: 25.0, platformOnly: 'PlayStation' },
        { id: 'trophy_ps4', label: 'Unlock GTA 5 PS4 Platinum Trophy', originalPrice: 16.7, discountedPrice: 15.0, platformOnly: 'PlayStation' },
        { id: 'fast_run', label: 'Fast Run (Optional Addon)', originalPrice: 38.9, discountedPrice: 35.0 },
    ],
};

export default function ConfiguratorEditor({ initialData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('packages'); // 'versions' | 'packages' | 'addons'

    const [config, setConfig] = useState(() => {
        if (initialData && typeof initialData === 'object') {
            return {
                versions: initialData.versions || DEFAULT_CONFIG.versions,
                packages: Array.isArray(initialData.packages) ? initialData.packages : DEFAULT_CONFIG.packages,
                addons: Array.isArray(initialData.addons) ? initialData.addons : DEFAULT_CONFIG.addons,
            };
        }
        return DEFAULT_CONFIG;
    });

    // Version handlers
    const updateVersion = (platform, index, label) => {
        setConfig((prev) => {
            const list = [...(prev.versions[platform] || [])];
            list[index] = { ...list[index], label };
            return {
                ...prev,
                versions: { ...prev.versions, [platform]: list },
            };
        });
    };

    const addVersion = (platform) => {
        setConfig((prev) => {
            const list = [...(prev.versions[platform] || [])];
            const id = `ver-${Date.now()}`;
            list.push({ id, label: 'New Edition / Version' });
            return {
                ...prev,
                versions: { ...prev.versions, [platform]: list },
            };
        });
    };

    const removeVersion = (platform, index) => {
        setConfig((prev) => {
            const list = (prev.versions[platform] || []).filter((_, i) => i !== index);
            return {
                ...prev,
                versions: { ...prev.versions, [platform]: list },
            };
        });
    };

    // Package handlers
    const updatePackage = (index, patch) => {
        setConfig((prev) => {
            const nextPackages = [...prev.packages];
            nextPackages[index] = { ...nextPackages[index], ...patch };
            return { ...prev, packages: nextPackages };
        });
    };

    const addPackage = () => {
        setConfig((prev) => {
            const last = prev.packages[prev.packages.length - 1];
            const nextAmount = (Number(last?.amount) || 0) + 50;
            const nextPrice = (Number(last?.price) || 0) + 40;
            const nextWas = (Number(last?.wasPrice) || 0) + 55;
            return {
                ...prev,
                packages: [
                    ...prev.packages,
                    {
                        id: `pkg-${Date.now()}`,
                        label: `${nextAmount} Million Cash`,
                        amount: nextAmount,
                        price: nextPrice,
                        wasPrice: nextWas,
                    },
                ],
            };
        });
    };

    const removePackage = (index) => {
        setConfig((prev) => ({
            ...prev,
            packages: prev.packages.filter((_, i) => i !== index),
        }));
    };

    // Addon handlers
    const updateAddon = (index, patch) => {
        setConfig((prev) => {
            const nextAddons = [...prev.addons];
            nextAddons[index] = { ...nextAddons[index], ...patch };
            return { ...prev, addons: nextAddons };
        });
    };

    const addAddon = () => {
        setConfig((prev) => ({
            ...prev,
            addons: [
                ...prev.addons,
                {
                    id: `addon-${Date.now()}`,
                    label: 'New Custom Addon',
                    originalPrice: 40.0,
                    discountedPrice: 36.0,
                    platformOnly: '',
                },
            ],
        }));
    };

    const removeAddon = (index) => {
        setConfig((prev) => ({
            ...prev,
            addons: prev.addons.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="border border-white/10 rounded-xl bg-black/30 p-3.5 my-3">
            <input type="hidden" name="configurator_data" value={JSON.stringify(config)} />

            <div className="flex items-center justify-between">
                <div>
                    <strong className="block text-xs uppercase tracking-wider text-[#9d7cff] font-mono">
                        Interactive Configurator Settings
                    </strong>
                    <span className="text-[11px] text-slate-400">
                        Edit versions, packages and addons for &quot;Configure your order&quot;
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-3 py-1 text-xs font-bold rounded-lg border border-[#9d7cff]/40 text-[#9d7cff] hover:bg-[#9d7cff]/10 transition-colors cursor-pointer"
                >
                    {isOpen ? 'Close configurator' : 'Edit configurator'}
                </button>
            </div>

            {isOpen && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex gap-1.5 p-1 bg-black/40 rounded-lg border border-white/10 text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('packages')}
                            className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                                activeTab === 'packages'
                                    ? 'bg-[#9d7cff] text-[#0d0914]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Packages ({config.packages.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('addons')}
                            className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                                activeTab === 'addons'
                                    ? 'bg-[#9d7cff] text-[#0d0914]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Addons ({config.addons.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('versions')}
                            className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                                activeTab === 'versions'
                                    ? 'bg-[#9d7cff] text-[#0d0914]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Versions / Editions
                        </button>
                    </div>

                    {/* 1. PACKAGES TAB */}
                    {activeTab === 'packages' && (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">
                                    Label · Price · Was Price
                                </span>
                                <button
                                    type="button"
                                    onClick={addPackage}
                                    className="text-xs text-[#9d7cff] hover:underline font-bold cursor-pointer"
                                >
                                    + Add Package
                                </button>
                            </div>

                            {config.packages.map((pkg, idx) => (
                                <div
                                    key={pkg.id || idx}
                                    className="p-2.5 rounded-lg bg-black/30 border border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                                >
                                    <div className="sm:col-span-5">
                                        <input
                                            type="text"
                                            value={pkg.label}
                                            onChange={(e) => updatePackage(idx, { label: e.target.value })}
                                            placeholder="Package label"
                                            className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-slate-400">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={pkg.price}
                                                onChange={(e) => updatePackage(idx, { price: Number(e.target.value) })}
                                                placeholder="Price"
                                                className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-slate-500 line-through">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={pkg.wasPrice || ''}
                                                onChange={(e) => updatePackage(idx, { wasPrice: Number(e.target.value) })}
                                                placeholder="Was price"
                                                className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-slate-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        <button
                                            type="button"
                                            onClick={() => removePackage(idx)}
                                            className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 2. ADDONS TAB */}
                    {activeTab === 'addons' && (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-mono text-slate-400 uppercase">
                                    Addon Title · Orig $ · Disc $
                                </span>
                                <button
                                    type="button"
                                    onClick={addAddon}
                                    className="text-xs text-[#9d7cff] hover:underline font-bold cursor-pointer"
                                >
                                    + Add Addon
                                </button>
                            </div>

                            {config.addons.map((addon, idx) => (
                                <div
                                    key={addon.id || idx}
                                    className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-2"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                        <div className="sm:col-span-6">
                                            <input
                                                type="text"
                                                value={addon.label}
                                                onChange={(e) => updateAddon(idx, { label: e.target.value })}
                                                placeholder="Addon title"
                                                className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-slate-500 line-through">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={addon.originalPrice || ''}
                                                    onChange={(e) =>
                                                        updateAddon(idx, { originalPrice: Number(e.target.value) })
                                                    }
                                                    placeholder="Was"
                                                    className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-slate-300"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-3">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-[#9d7cff] font-bold">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={addon.discountedPrice}
                                                    onChange={(e) =>
                                                        updateAddon(idx, { discountedPrice: Number(e.target.value) })
                                                    }
                                                    placeholder="Discounted"
                                                    className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-1 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeAddon(idx)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-mono text-slate-400">Platform limit:</label>
                                        <select
                                            value={addon.platformOnly || ''}
                                            onChange={(e) => updateAddon(idx, { platformOnly: e.target.value || null })}
                                            className="bg-black/50 border border-white/10 text-[11px] text-slate-300 rounded px-2 py-0.5"
                                        >
                                            <option value="">All Platforms</option>
                                            <option value="PlayStation">PlayStation only</option>
                                            <option value="Xbox">Xbox only</option>
                                            <option value="PC">PC only</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. VERSIONS TAB */}
                    {activeTab === 'versions' && (
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                            {['PlayStation', 'Xbox', 'PC'].map((plat) => {
                                const list = config.versions[plat] || [];
                                return (
                                    <div key={plat} className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <strong className="text-xs font-bold text-slate-200">{plat}</strong>
                                            <button
                                                type="button"
                                                onClick={() => addVersion(plat)}
                                                className="text-[11px] text-[#9d7cff] hover:underline cursor-pointer"
                                            >
                                                + Add {plat} Version
                                            </button>
                                        </div>

                                        {list.map((ver, vIdx) => (
                                            <div key={ver.id || vIdx} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={ver.label}
                                                    onChange={(e) => updateVersion(plat, vIdx, e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white"
                                                    placeholder="Version label (e.g. PS5 Edition)"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVersion(plat, vIdx)}
                                                    className="text-red-400 hover:text-red-300 text-xs px-1 font-bold cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
