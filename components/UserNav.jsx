'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function UserNav() {
    const { data: session, status } = useSession();

    if (status === 'loading') return null;

    if (!session?.user) {
        return (
            <div className="flex items-center gap-3 text-sm font-semibold">
                <Link href="/login" className="text-slate-300 hover:text-lime-300 transition-colors">
                    Sign In
                </Link>
                <Link href="/login" className="bg-lime-300 hover:bg-white text-black px-4 py-2 rounded-lg transition-colors">
                    Sign Up
                </Link>
            </div>
        );
    }

    const email = session.user.email || 'user';
    const avatarUrl = `https://i.pravatar.cc/96?u=${encodeURIComponent(email)}`;

    return (
        <div className="flex items-center gap-3">
            <Link
                href="/admin/products"
                className="hidden sm:inline text-sm font-semibold text-lime-300 hover:text-white transition-colors"
            >
                Panel de admin
            </Link>
            <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">Mi perfil</p>
                <p className="text-xs text-slate-400 max-w-36 truncate">{email}</p>
            </div>
            <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="h-10 w-10 rounded-full border-2 border-lime-300 object-cover"
            />
            <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
}