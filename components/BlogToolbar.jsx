'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import Icon from './Icon';

export default function BlogToolbar({ categories = [], activeCategory = 'All', initialSearch = '' }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(initialSearch);
    const [isPending, startTransition] = useTransition();

    const updateParams = (newCat, newSearch) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newCat && newCat !== 'All') {
            params.set('category', newCat);
        } else {
            params.delete('category');
        }

        if (newSearch && newSearch.trim()) {
            params.set('search', newSearch.trim());
        } else {
            params.delete('search');
        }

        startTransition(() => {
            const query = params.toString();
            router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
        });
    };

    const handleCategoryClick = (cat) => {
        updateParams(cat, search);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateParams(activeCategory, search);
    };

    const handleClearSearch = () => {
        setSearch('');
        updateParams(activeCategory, '');
    };

    return (
        <div className="space-y-6 mb-12">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
                <div className="relative flex items-center">
                    <Icon
                        name="search"
                        className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search guides, game tips, strategies, and meta updates..."
                        className="w-full bg-[#120e1c] border border-white/10 hover:border-white/20 focus:border-[#9d7cff] rounded-2xl pl-12 pr-28 py-3.5 text-sm md:text-base text-white placeholder-slate-500 shadow-[0_4px_24px_rgba(0,0,0,0.4)] focus:outline-none transition-all"
                    />
                    <div className="absolute right-2 flex items-center gap-1.5">
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Icon name="x" className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 rounded-xl bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? '...' : 'Search'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Category Filter Pills (DamnModz style) */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
                {['All', ...categories].map((cat) => {
                    const isActive = (activeCategory || 'All').toLowerCase() === cat.toLowerCase();
                    return (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-[#9d7cff] text-[#0d0914] shadow-[0_0_16px_rgba(157,124,255,0.4)]'
                                    : 'bg-[#161126] text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
