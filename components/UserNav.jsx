'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import RawLink from 'next/link';
import { Link } from '../i18n/navigation';
import Icon from './Icon';

export default function UserNav() {
    const { data: session, status } = useSession();
    const t = useTranslations('common');
    const [open, setOpen] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;
        const closeOnOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutside);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOnOutside);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open]);

    if (!mounted || status === 'loading') {
        return <div suppressHydrationWarning className="h-8.5 w-8.5 rounded-full bg-white/10 border border-white/10 animate-pulse" />;
    }

    if (!session?.user) {
        return (
            <div className="flex items-center gap-3 text-sm font-semibold">
                <Link href="/login" className="text-slate-300 hover:text-[#9d7cff] transition-colors">
                    {t('signIn')}
                </Link>
                <Link href="/login" className="bg-[#9d7cff] hover:bg-[#b59dff] text-[#0d0914] font-bold px-4 py-2 rounded-lg transition-colors">
                    {t('signUp')}
                </Link>
            </div>
        );
    }

    const email = session.user.email || 'user';
    const avatarUrl = `https://i.pravatar.cc/96?u=${encodeURIComponent(email)}`;
    const initial = email[0].toUpperCase();
    const isAdmin = session.user.role === 'ADMIN';

    return (
        <div className="relative" ref={menuRef}>
            {/* Compact circular profile trigger button */}
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={t('myProfile')}
                title={`${email}${isAdmin ? ' (Admin)' : ''}`}
                className={`relative flex items-center justify-center h-8.5 w-8.5 rounded-full border transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#9d7cff] focus-visible:outline-none ${
                    open
                        ? 'border-[#9d7cff] ring-2 ring-[#9d7cff]/40 shadow-[0_0_16px_rgba(157,124,255,0.4)]'
                        : 'border-white/20 bg-white/5 hover:border-[#9d7cff] hover:shadow-[0_0_12px_rgba(157,124,255,0.3)]'
                }`}
            >
                {avatarFailed ? (
                    <span className="h-full w-full rounded-full bg-gradient-to-br from-[#9d7cff] to-[#6640d6] text-[#0d0914] flex items-center justify-center text-xs font-black select-none">
                        {initial}
                    </span>
                ) : (
                    <img
                        src={avatarUrl}
                        alt=""
                        onError={() => setAvatarFailed(true)}
                        className="h-full w-full rounded-full object-cover"
                    />
                )}
                {/* Active status indicator dot */}
                <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0914] ${
                        isAdmin ? 'bg-[#9d7cff] shadow-[0_0_6px_rgba(157,124,255,0.8)]' : 'bg-[#9d7cff]'
                    }`}
                    aria-hidden="true"
                />
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2.5 w-72 panel-surface rounded-2xl overflow-hidden z-50 border border-[#9d7cff]/25 shadow-[0_24px_50px_rgba(0,0,0,0.85)]"
                >
                    {/* Header: User identity & role badge */}
                    <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                        <div className="relative shrink-0">
                            {avatarFailed ? (
                                <span className="h-10 w-10 rounded-full bg-gradient-to-br from-[#9d7cff] to-[#6640d6] text-[#0d0914] flex items-center justify-center font-black text-sm">
                                    {initial}
                                </span>
                            ) : (
                                <img
                                    src={avatarUrl}
                                    alt=""
                                    onError={() => setAvatarFailed(true)}
                                    className="h-10 w-10 rounded-full object-cover border border-[#9d7cff]/40"
                                />
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#9d7cff] border-2 border-[#171229]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate" title={email}>{email}</p>
                            {isAdmin ? (
                                <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#9d7cff] text-[10px] font-mono font-bold uppercase tracking-wider">
                                    <Icon name="crown" className="w-3 h-3" />
                                    Admin
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                                    {t('customerAccount')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Admin Panel Section - housed cleanly inside dropdown */}
                    {isAdmin && (
                        <div className="p-2 border-b border-white/10 bg-[#9d7cff]/[0.03]">
                            <div className="px-2.5 pt-1 pb-1.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-[#9d7cff]">
                                <span className="flex items-center gap-1.5">
                                    <Icon name="crown" className="w-3.5 h-3.5 text-[#9d7cff]" />
                                    {t('adminPanel')}
                                </span>
                                <span className="text-[9px] bg-[#9d7cff]/20 text-[#9d7cff] px-1.5 py-0.5 rounded font-mono">STAFF</span>
                            </div>
                            <div className="space-y-0.5">
                                <RawLink
                                    href="/admin"
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#9d7cff] hover:text-[#0d0914] transition-colors group"
                                >
                                    <Icon name="dashboard" className="w-4 h-4 text-[#9d7cff] group-hover:text-[#0d0914] transition-colors shrink-0" />
                                    <span>{t('dashboard')}</span>
                                </RawLink>
                                <RawLink
                                    href="/admin/products"
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#9d7cff] hover:text-[#0d0914] transition-colors group"
                                >
                                    <Icon name="box" className="w-4 h-4 text-[#9d7cff] group-hover:text-[#0d0914] transition-colors shrink-0" />
                                    <span>{t('services')}</span>
                                </RawLink>
                                <RawLink
                                    href="/admin/orders"
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#9d7cff] hover:text-[#0d0914] transition-colors group"
                                >
                                    <Icon name="clipboard" className="w-4 h-4 text-[#9d7cff] group-hover:text-[#0d0914] transition-colors shrink-0" />
                                    <span>{t('orders')}</span>
                                </RawLink>
                                <RawLink
                                    href="/admin/reviews"
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#9d7cff] hover:text-[#0d0914] transition-colors group"
                                >
                                    <Icon name="star" className="w-4 h-4 text-[#9d7cff] group-hover:text-[#0d0914] transition-colors shrink-0" />
                                    <span>{t('reviews')}</span>
                                </RawLink>
                            </div>
                        </div>
                    )}

                    {/* Customer note if not admin */}
                    {!isAdmin && (
                        <div className="px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2 border-b border-white/10 bg-white/[0.01]">
                            <Icon name="shield" className="w-4 h-4 shrink-0 text-[#9d7cff]" />
                            <span>{t('customerNote')}</span>
                        </div>
                    )}

                    {/* User and Store Actions */}
                    <div className="p-2 space-y-0.5">
                        <Link
                            href="/checkout"
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-[#9d7cff] hover:text-[#0d0914] transition-colors group"
                        >
                            <Icon name="cart" className="w-4 h-4 text-slate-400 group-hover:text-[#0d0914] transition-colors shrink-0" />
                            <span>{t('myCart')}</span>
                        </Link>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer group"
                        >
                            <Icon name="logout" className="w-4 h-4 text-red-400 group-hover:text-white transition-colors shrink-0" />
                            <span>{t('signOut')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}