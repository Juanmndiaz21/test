'use client';

import { useState, useMemo, useEffect } from 'react';
import Icon from '../../../components/Icon';
import { ProductDeleteButton, ProductEditDrawer } from './ProductRowActions';

export default function ProductsTableClient({ products = [], defaultOptions = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGame, setSelectedGame] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Extract unique games for quick filter pills
    const games = useMemo(() => {
        const unique = new Set();
        for (const p of products) {
            if (p.game) unique.add(p.game);
        }
        return Array.from(unique).sort();
    }, [products]);

    // Filter products by search term and game
    const filteredProducts = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return products.filter((p) => {
            const matchesGame = selectedGame === 'all' || p.game === selectedGame;
            if (!matchesGame) return false;

            if (!query) return true;

            const idMatch = String(p.id).includes(query);
            const nameMatch = String(p.name || '').toLowerCase().includes(query);
            const gameMatch = String(p.game || '').toLowerCase().includes(query);
            const platformMatch = String(p.platform || '').toLowerCase().includes(query);
            const boostMatch = String(p.boost_amount || '').toLowerCase().includes(query);
            const priceMatch = String(p.price || '').includes(query);

            return idMatch || nameMatch || gameMatch || platformMatch || boostMatch || priceMatch;
        });
    }, [products, searchTerm, selectedGame]);

    // Reset pagination to page 1 on filter or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGame, pageSize]);

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

    return (
        <div className="space-y-4">
            {/* SEARCH AND FILTER BAR */}
            <div className="panel-surface rounded-xl p-3 sm:p-4 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Icon
                        name="search"
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by product name, game, platform, ID..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                            title="Clear search"
                        >
                            <Icon name="x" className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Game filter pills */}
                {games.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setSelectedGame('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 ${
                                selectedGame === 'all'
                                    ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-white shadow-sm'
                                    : 'bg-black/20 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                            }`}
                        >
                            All ({products.length})
                        </button>
                        {games.map((g) => {
                            const count = products.filter((p) => p.game === g).length;
                            const active = selectedGame === g;
                            return (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setSelectedGame(g)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 ${
                                        active
                                            ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-white shadow-sm'
                                            : 'bg-black/20 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                                    }`}
                                >
                                    {g} ({count})
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* PRODUCTS TABLE */}
            <div className="panel-surface rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-300">
                            <tr>
                                <th className="p-4 text-xs uppercase tracking-wider font-semibold">ID</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Product</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Configuration</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Price</th>
                                <th className="p-4 text-right text-xs uppercase tracking-wider font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Icon name="search" className="w-8 h-8 text-slate-600 mb-1" />
                                            <p className="text-sm font-medium text-slate-300">
                                                {searchTerm || selectedGame !== 'all'
                                                    ? 'No services match your search or filter.'
                                                    : 'No products in the database yet.'}
                                            </p>
                                            {(searchTerm || selectedGame !== 'all') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setSelectedGame('all');
                                                    }}
                                                    className="mt-1 text-xs text-[#9d7cff] hover:underline cursor-pointer font-bold"
                                                >
                                                    Reset filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product) => (
                                    <tr key={product.id} className="border-t border-white/10 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-slate-400 font-mono text-xs">#{product.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {product.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-9 h-9 rounded-lg object-contain bg-black/40 border border-white/10 p-0.5 shrink-0"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                ) : null}
                                                <div>
                                                    <div className="font-bold text-white text-sm">{product.name}</div>
                                                    {product.game && (
                                                        <span className="text-[11px] text-slate-400 font-mono">
                                                            {product.game}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-slate-400">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-slate-300">
                                                {product.platform === 'All' ? 'All platforms' : (product.platform || 'All')}
                                            </span>
                                            <span className="ml-2 font-mono text-slate-400">
                                                {product.boost_amount ? `${product.boost_amount}M` : 'Variable'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-lime-300 font-bold font-mono text-sm">${product.price} USD</div>
                                            {product.original_price ? (
                                                <div className="text-xs text-slate-500 line-through font-mono">
                                                    ${product.original_price} USD
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="inline-flex items-center gap-3 justify-end">
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
                <div className="p-4 border-t border-white/10 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span>
                            {filteredProducts.length === 0
                                ? '0 services'
                                : `Showing ${startIndex + 1}-${endIndex} of ${filteredProducts.length} services`}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
                            <span className="text-[11px] text-slate-500">Per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-[#171229] border border-white/10 rounded px-1.5 py-0.5 text-xs text-slate-300 focus:border-[#9d7cff] outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="px-2.5 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors inline-flex items-center gap-1 cursor-pointer"
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
                                                className="px-1 text-center text-xs font-mono text-slate-500"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    const isActive = p === safeCurrentPage;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setCurrentPage(p)}
                                            className={`min-w-[28px] h-7 px-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#9d7cff] text-[#0d0914]'
                                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
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
                                className="px-2.5 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors inline-flex items-center gap-1 cursor-pointer"
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
