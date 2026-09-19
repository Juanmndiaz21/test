'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ReviewStatusButtons, ReviewEditDrawer } from './ReviewRowActions';

function Stars({ rating }) {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
        stars.push(
            <svg
                key={i}
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`w-4 h-4 ${i <= rating ? 'fill-lime-300' : 'fill-white/20'}`}
            >
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        );
    }
    return <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>{stars}</div>;
}

const PAGE_SIZE = 10;

export default function ReviewsTable({
    reviews = [],
    products = [],
    productMap = {},
    initialPage = 1,
}) {
    const tableRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter reviews based on search query and status tab
    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            if (statusFilter !== 'all' && review.status !== statusFilter) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const productName = productMap[String(review.product_id)] || '';
                const matchTitle = (review.title || '').toLowerCase().includes(q);
                const matchAuthor = (review.author || '').toLowerCase().includes(q);
                const matchContent = (review.content || '').toLowerCase().includes(q);
                const matchProduct = productName.toLowerCase().includes(q);
                if (!matchTitle && !matchAuthor && !matchContent && !matchProduct) {
                    return false;
                }
            }
            return true;
        });
    }, [reviews, statusFilter, searchQuery, productMap]);

    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));

    // Clamp current page if list length shrinks
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filteredReviews.length);
    const displayedReviews = filteredReviews.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        const target = Math.min(Math.max(1, page), totalPages);
        setCurrentPage(target);

        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (target === 1) {
                url.searchParams.delete('page');
            } else {
                url.searchParams.set('page', String(target));
            }
            window.history.replaceState(null, '', url.toString());
        }

        if (tableRef.current) {
            const rect = tableRef.current.getBoundingClientRect();
            if (rect.top < 0) {
                tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Calculate visible page numbers
    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages = [];
        if (safePage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (safePage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
        }
        return pages;
    }, [totalPages, safePage]);

    return (
        <div ref={tableRef} className="space-y-4">
            {/* Toolbar: Search and Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                        className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            statusFilter === 'all'
                                ? 'bg-white text-black'
                                : 'bg-black/20 text-slate-400 hover:text-white border border-white/5'
                        }`}
                    >
                        All ({reviews.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
                        className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            statusFilter === 'approved'
                                ? 'bg-lime-300 text-black'
                                : 'bg-black/20 text-slate-400 hover:text-lime-300 border border-white/5'
                        }`}
                    >
                        Approved ({reviews.filter((r) => r.status === 'approved').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
                        className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            statusFilter === 'pending'
                                ? 'bg-amber-300 text-black'
                                : 'bg-black/20 text-slate-400 hover:text-amber-300 border border-white/5'
                        }`}
                    >
                        Pending ({reviews.filter((r) => r.status === 'pending').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}
                        className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            statusFilter === 'rejected'
                                ? 'bg-red-400 text-black'
                                : 'bg-black/20 text-slate-400 hover:text-red-400 border border-white/5'
                        }`}
                    >
                        Rejected ({reviews.filter((r) => r.status === 'rejected').length})
                    </button>
                </div>

                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search reviews..."
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-lime-300 outline-none pr-7"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="panel-surface rounded-2xl overflow-hidden border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-300 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">Review Details</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {displayedReviews.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 text-sm">
                                        {reviews.length === 0
                                            ? 'No reviews in the database yet. Click "Add New Review" above to create one.'
                                            : 'No reviews found matching your current filter or search.'}
                                    </td>
                                </tr>
                            ) : (
                                displayedReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-white/[0.02] transition-colors align-top">
                                        <td className="p-4 text-sm font-medium text-lime-300">
                                            {productMap[String(review.product_id)] || `Product #${review.product_id}`}
                                        </td>
                                        <td className="p-4 max-w-sm">
                                            <div className="font-bold text-white text-base">{review.title || 'Untitled'}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                by <span className="text-slate-200 font-semibold">{review.author}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 mt-2 leading-relaxed line-clamp-3">{review.content}</p>

                                            <ReviewEditDrawer review={review} products={products} />
                                        </td>
                                        <td className="p-4">
                                            <Stars rating={review.rating} />
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                review.status === 'approved'
                                                    ? 'bg-lime-400/10 text-lime-300 border border-lime-400/20'
                                                    : review.status === 'rejected'
                                                        ? 'bg-red-400/10 text-red-400 border border-red-400/20'
                                                        : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                                            }`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td suppressHydrationWarning className="p-4 text-xs text-slate-400 whitespace-nowrap font-mono data-readout">
                                            {review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : '—'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <ReviewStatusButtons review={review} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {filteredReviews.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/[0.02] border-t border-white/10 text-xs font-mono text-slate-400">
                        <div>
                            Showing <span className="text-white font-bold">{startIndex + 1}</span> to{' '}
                            <span className="text-white font-bold">{endIndex}</span> of{' '}
                            <span className="text-white font-bold">{filteredReviews.length}</span> reviews
                            {totalPages > 1 && (
                                <span className="ml-2 text-slate-500">
                                    (Page <span className="text-lime-300 font-bold">{safePage}</span> of{' '}
                                    <span className="text-white font-bold">{totalPages}</span>)
                                </span>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                {/* Previous Page Button */}
                                <button
                                    type="button"
                                    disabled={safePage <= 1}
                                    onClick={() => handlePageChange(safePage - 1)}
                                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    ← Previous
                                </button>

                                {/* Page Number Pills */}
                                <div className="hidden sm:flex items-center gap-1">
                                    {pageNumbers.map((p, idx) => {
                                        if (p === '...') {
                                            return (
                                                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-500">
                                                    …
                                                </span>
                                            );
                                        }
                                        const isCurrent = p === safePage;
                                        return (
                                            <button
                                                key={`page-${p}`}
                                                type="button"
                                                onClick={() => handlePageChange(p)}
                                                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center ${
                                                    isCurrent
                                                        ? 'bg-lime-300 text-black shadow-sm font-black'
                                                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Page Button */}
                                <button
                                    type="button"
                                    disabled={safePage >= totalPages}
                                    onClick={() => handlePageChange(safePage + 1)}
                                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

