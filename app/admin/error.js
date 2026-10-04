'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Icon from '../../components/Icon';

export default function AdminError({ error, reset }) {
    useEffect(() => {
        console.error('Admin route error:', error);
    }, [error]);

    return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Icon name="alert-triangle" className="w-7 h-7" />
            </div>

            <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
                    Control Room Error
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white display-font">
                    Something went wrong
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                    {error?.message || 'An unexpected error occurred while loading this section of the admin panel.'}
                </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="px-5 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-white text-[#0d0914] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                    Try again
                </button>
                <Link
                    href="/admin/products"
                    className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                >
                    Products Catalog
                </Link>
            </div>
        </div>
    );
}

