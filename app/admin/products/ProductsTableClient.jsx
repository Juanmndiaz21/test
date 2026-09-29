'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Icon from '../../../components/Icon';
import { ProductDeleteButton, ProductEditDrawer } from './ProductRowActions';
import { PlatformTableCell } from './PlatformSelector';

export default function ProductsTableClient({ products: initialProducts = [], defaultOptions = {} }) {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGame, setSelectedGame] = useState('all');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [sortBy, setSortBy] = useState('id-desc');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const searchInputRef = useRef(null);

    // Keep in sync with server revalidations
    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    // Handle local platform update for instant UI responsiveness
    const handlePlatformChange = (productId, newPlatform) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, platform: newPlatform } : p))
        );
    };

    // Keyboard shortcut '/' to focus search input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Extract unique games for quick filter pills
    const games = useMemo(() => {
        const unique = new Set();
        for (const p of products) {
            if (p.game) unique.add(p.game);
        }
        return Array.from(unique).sort();
    }, [products]);

    // Filter & Sort products
    const filteredProducts = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();

        const filtered = products.filter((p) => {
            // Game filter
            if (selectedGame !== 'all' && p.game !== selectedGame) {
                return false;
            }

            // Platform filter
            if (selectedPlatform !== 'all') {
                const target = selectedPlatform.toLowerCase();
                const pPlatform = String(p.platform || 'all').toLowerCase();
                if (pPlatform !== 'all' && !pPlatform.includes(target)) {
                    return false;
                }
            }

            // Search query filter
            if (!query) return true;

            const idMatch = String(p.id).includes(query);
            const nameMatch = String(p.name || '').toLowerCase().includes(query);
            const gameMatch = String(p.game || '').toLowerCase().includes(query);
            const platformMatch = String(p.platform || '').toLowerCase().includes(query);
            const boostMatch = String(p.boost_amount || '').toLowerCase().includes(query);
            const priceMatch = String(p.price || '').includes(query);

            return idMatch || nameMatch || gameMatch || platformMatch || boostMatch || priceMatch;
        });

        // Sorting
        return filtered.sort((a, b) => {
            if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
            if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
            if (sortBy === 'name-asc') return String(a.name).localeCompare(String(b.name));
            if (sortBy === 'id-asc') return Number(a.id) - Number(b.id);
            return Number(b.id) - Number(a.id); // default id-desc
        });
    }, [products, searchTerm, selectedGame, selectedPlatform, sortBy]);

    // Reset pagination to page 1 on filter or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGame, selectedPlatform, sortBy, pageSize]);

    const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const getVisiblePages = (current, total) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    const hasActiveFilters =
        searchTerm.trim().length > 0 ||
        selectedGame !== 'all' ||
        selectedPlatform !== 'all' ||
        sortBy !== 'id-desc';

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedGame('all');
        setSelectedPlatform('all');
        setSortBy('id-desc');
    };

    return (
        <div className="space-y-4">
            {/* SEARCH AND FILTER TOOLBAR */}
            <div className="panel-surface rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4 bg-[#171229] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-lg">
                        <Icon
                            name="search"
                            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, game, platform, ID, price... (press '/' to focus)"
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-[#9d7cff] focus:ring-1 focus:ring-[#9d7cff]/40 outline-none transition-all shadow-inner"
                        />
                        {searchTerm ? (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                                title="Clear search"
                            >
                                <Icon name="x" className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <span className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-slate-400 pointer-events-none">
                                /
                            </span>
                        )}
                    </div>

                    {/* Secondary Filters: Platform & Sorting */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Platform Filter Dropdown */}
                        <div className="flex items-center gap-1.5 bg-[#120e1c] border border-white/10 rounded-xl px-3 py-2 text-xs">
                            <span className="text-slate-400 font-mono text-[11px]">Platform:</span>
                            <select
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                            >
                                <option value="all" className="bg-[#171229] text-white">All Platforms</option>
                                <option value="pc" className="bg-[#171229] text-white">PC</option>
                                <option value="playstation" className="bg-[#171229] text-white">PlayStation</option>
                                <option value="xbox" className="bg-[#171229] text-white">Xbox</option>
                            </select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-1.5 bg-[#120e1c] border border-white/10 rounded-xl px-3 py-2 text-xs">
                            <span className="text-slate-400 font-mono text-[11px]">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                            >
                                <option value="id-desc" className="bg-[#171229] text-white">Newest first</option>
                                <option value="id-asc" className="bg-[#171229] text-white">Oldest first</option>
                                <option value="price-asc" className="bg-[#171229] text-white">Price: Low to High</option>
                                <option value="price-desc" className="bg-[#171229] text-white">Price: High to Low</option>
                                <option value="name-asc" className="bg-[#171229] text-white">Name: A to Z</option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="text-xs text-[#9d7cff] hover:text-white px-3 py-2 rounded-xl bg-[#9d7cff]/10 hover:bg-[#9d7cff]/20 border border-[#9d7cff]/20 font-mono cursor-pointer transition-colors"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Game Category Filter Pills */}
                {games.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1.5 border-t border-white/5 custom-scrollbar">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 shrink-0 font-bold">
                            Category:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedGame('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 ${
                                selectedGame === 'all'
                                    ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-white shadow-sm'
                                    : 'bg-[#120e1c] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                        >
                            All ({products.length})
                        </button>
                        {games.map((gameName) => {
                            const count = products.filter((p) => p.game === gameName).length;
                            const isSelected = selectedGame === gameName;
                            return (
                                <button
                                    key={gameName}
                                    type="button"
                                    onClick={() => setSelectedGame(gameName)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 ${
                                        isSelected
                                            ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-white shadow-sm'
                                            : 'bg-[#120e1c] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    {gameName} ({count})
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* PRODUCTS TABLE */}
            <div className="panel-surface rounded-2xl overflow-hidden border border-white/10 bg-[#171229] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#120e1c]/80 text-slate-300 text-xs font-mono uppercase tracking-wider border-b border-white/10">
                            <tr>
                                <th className="py-4 px-4 w-16">ID</th>
                                <th className="py-4 px-4 min-w-[240px]">Product / Service</th>
                                <th className="py-4 px-4 min-w-[140px]">Game</th>
                                <th className="py-4 px-4 min-w-[180px]">Platform (Click to change)</th>
                                <th className="py-4 px-4">Boost / Spec</th>
                                <th className="py-4 px-4 text-right">Price</th>
                                <th className="py-4 px-4 text-right min-w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-400 space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                                            <Icon name="search" className="w-5 h-5" />
                                        </div>
                                        <p className="text-white font-medium text-sm">
                                            No services found matching your criteria.
                                        </p>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={clearAllFilters}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9d7cff]/20 text-[#9d7cff] hover:bg-[#9d7cff] hover:text-[#0d0914] text-xs font-mono font-bold transition-colors cursor-pointer"
                                            >
                                                Clear filters & search
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        {/* ID */}
                                        <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                                            <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/5 text-slate-300 font-bold">
                                                #{product.id}
                                            </span>
                                        </td>

                                        {/* Thumbnail & Title */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                {product.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-11 h-11 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0 shadow-sm"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                                                        <Icon name="package" className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white text-sm truncate max-w-xs sm:max-w-md group-hover:text-[#9d7cff] transition-colors">
                                                        {product.name}
                                                    </div>
                                                    {product.slug && (
                                                        <span className="text-[11px] text-slate-500 font-mono truncate block">
                                                            /store/{product.id}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Game Category */}
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff] font-mono text-xs font-bold">
                                                {product.game || 'General'}
                                            </span>
                                        </td>

                                        {/* Platform (Interactive Platform Selector Cell) */}
                                        <td className="py-4 px-4">
                                            <PlatformTableCell
                                                product={product}
                                                onPlatformChange={handlePlatformChange}
                                            />
                                        </td>

                                        {/* Boost / Spec */}
                                        <td className="py-4 px-4 text-xs font-mono text-slate-300">
                                            {product.boost_amount ? (
                                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-bold">
                                                    {product.boost_amount}M
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">Standard</span>
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="text-lime-300 font-bold font-mono text-sm sm:text-base tabular-nums">
                                                ${product.price} USD
                                            </div>
                                            {product.original_price ? (
                                                <div className="text-xs text-slate-500 line-through font-mono tabular-nums">
                                                    ${product.original_price} USD
                                                </div>
                                            ) : null}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                <ProductEditDrawer product={product} defaultOptions={defaultOptions} />
                                                <ProductDeleteButton productId={product.id} productName={product.name} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="p-4 sm:p-5 border-t border-white/10 bg-[#120e1c]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span>
                            {filteredProducts.length === 0
                                ? '0 services'
                                : `Showing ${startIndex + 1}–${endIndex} of ${filteredProducts.length} services`}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
                            <span className="text-[11px] text-slate-400">Per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-[#120e1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:border-[#9d7cff] outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#120e1c] hover:bg-white/10 text-xs font-mono font-bold text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                                <Icon name="chevron-left" className="w-3.5 h-3.5" />
                                <span>Prev</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {getVisiblePages(safeCurrentPage, totalPages).map((p, idx) => {
                                    if (p === '...') {
                                        return (
                                            <span
                                                key={`dots-${idx}`}
                                                className="px-1.5 text-center text-xs font-mono text-slate-500"
                                            >
                                                …
                                            </span>
                                        );
                                    }
                                    const isActive = p === safeCurrentPage;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setCurrentPage(p)}
                                            className={`min-w-[34px] h-8 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#9d7cff] text-[#0d0914] shadow-sm font-black'
                                                    : 'bg-[#120e1c] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#120e1c] hover:bg-white/10 text-xs font-mono font-bold text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                                <span>Next</span>
                                <Icon name="chevron-right" className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
