'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
                <Link
                    href="/login"
                    className="text-zinc-300 hover:text-purple-400 transition-[color,transform] duration-150 active:scale-[0.97] inline-flex items-center"
                >
                    {t('signIn')}
                </Link>
                <Link
                    href="/register"
                    className="bg-[#9225CF] hover:bg-[#a83ff0] text-white font-bold px-4 py-2 rounded-lg transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.97] shadow-[0_2px_10px_rgba(146,37,207,0.3)] hover:shadow-[0_0_18px_rgba(146,37,207,0.5)] inline-flex items-center"
                >
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
                className={`relative flex items-center justify-center h-8.5 w-8.5 rounded-full border transition-[border-color,box-shadow,transform] duration-150 cursor-pointer active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-[#9225CF] focus-visible:outline-none ${
                    open
                        ? 'border-[#9225CF] ring-2 ring-[#9225CF]/40 shadow-[0_0_16px_rgba(146,37,207,0.4)]'
                        : 'border-white/20 bg-white/5 hover:border-[#9225CF] hover:shadow-[0_0_12px_rgba(146,37,207,0.3)]'
                }`}
            >
                {avatarFailed ? (
                    <span className="h-full w-full rounded-full bg-gradient-to-br from-[#9225CF] to-purple-600 text-white flex items-center justify-center text-xs font-black select-none">
                        {initial}
                    </span>
                ) : (
                    <img
                        src={avatarUrl}
                        alt="User profile avatar"
                        onError={() => setAvatarFailed(true)}
                        className="h-full w-full rounded-full object-cover"
                    />
                )}
                {/* Active status indicator dot */}
                <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 ${
                        isAdmin ? 'bg-purple-400 shadow-[0_0_6px_rgba(146,37,207,0.8)]' : 'bg-purple-400'
                    }`}
                    aria-hidden="true"
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        role="menu"
                        initial={{ opacity: 0, transform: 'scale(0.95)' }}
                        animate={{ opacity: 1, transform: 'scale(1)' }}
                        exit={{ opacity: 0, transform: 'scale(0.95)' }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        style={{ transformOrigin: 'top right' }}
                        className="absolute right-0 top-full mt-2.5 w-72 panel-surface bg-zinc-900 rounded-2xl overflow-hidden z-50 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.85)] divide-y divide-white/10"
                    >
                        {/* Header: User identity & role badge linking to full profile */}
                        <Link
                            href="/profile"
                            onClick={() => setOpen(false)}
                            className="p-3.5 flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
                        >
                            <div className="relative shrink-0">
                                {avatarFailed ? (
                                    <span className="h-10 w-10 rounded-full bg-gradient-to-br from-[#9225CF] to-purple-600 text-white flex items-center justify-center font-black text-sm">
                                        {initial}
                                    </span>
                                ) : (
                                    <img
                                        src={avatarUrl}
                                        alt="User profile avatar"
                                        onError={() => setAvatarFailed(true)}
                                        className="h-10 w-10 rounded-full object-cover border border-[#9225CF]/40 group-hover:border-[#9225CF] transition-colors"
                                    />
                                )}
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-purple-400 border-2 border-zinc-900" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors" title={email}>{email}</p>
                                    <Icon name="arrow-right" className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors shrink-0" />
                                </div>
                                {isAdmin ? (
                                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-[#9225CF]/15 border border-[#9225CF]/30 text-purple-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                                        <Icon name="crown" className="w-3 h-3" />
                                        Admin
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-zinc-400 group-hover:text-zinc-300">
                                        {t('customerAccount')}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Admin Panel Section - housed cleanly inside dropdown */}
                        {isAdmin && (
                            <div className="p-2 bg-[#9225CF]/[0.05]">
                                <div className="px-2.5 pt-1 pb-1.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">
                                    <span className="flex items-center gap-1.5">
                                        <Icon name="crown" className="w-3.5 h-3.5 text-purple-400" />
                                        {t('adminPanel')}
                                    </span>
                                    <span className="text-[9px] bg-[#9225CF]/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">STAFF</span>
                                </div>
                                <div className="space-y-0.5">
                                    <RawLink
                                        href="/admin"
                                        role="menuitem"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-[#9225CF] hover:text-white transition-colors group"
                                    >
                                        <Icon name="dashboard" className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors shrink-0" />
                                        <span>{t('dashboard')}</span>
                                    </RawLink>
                                    <RawLink
                                        href="/admin/products"
                                        role="menuitem"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-[#9225CF] hover:text-white transition-colors group"
                                    >
                                        <Icon name="box" className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors shrink-0" />
                                        <span>{t('services')}</span>
                                    </RawLink>
                                    <RawLink
                                        href="/admin/orders"
                                        role="menuitem"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-[#9225CF] hover:text-white transition-colors group"
                                    >
                                        <Icon name="clipboard" className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors shrink-0" />
                                        <span>{t('orders')}</span>
                                    </RawLink>
                                    <RawLink
                                        href="/admin/reviews"
                                        role="menuitem"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-[#9225CF] hover:text-white transition-colors group"
                                    >
                                        <Icon name="star" className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors shrink-0" />
                                        <span>{t('reviews')}</span>
                                    </RawLink>
                                </div>
                            </div>
                        )}

                        {/* Customer note if not admin */}
                        {!isAdmin && (
                            <div className="px-3.5 py-2.5 text-xs text-zinc-400 flex items-center gap-2 bg-white/[0.01]">
                                <Icon name="shield" className="w-4 h-4 shrink-0 text-purple-400" />
                                <span>{t('customerNote')}</span>
                            </div>
                        )}

                        {/* User and Store Actions */}
                        <div className="p-2 space-y-0.5">
                            <Link
                                href="/profile"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-[#9225CF] hover:text-white transition-colors group"
                            >
                                <Icon name="users" className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors shrink-0" />
                                <span>{t('myProfile')}</span>
                            </Link>
                            <Link
                                href="/checkout"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-[#9225CF] hover:text-white transition-colors group"
                            >
                                <Icon name="cart" className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
                                <span>{t('myCart')}</span>
                            </Link>
                            <Link
                                href="/track"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-[#9225CF] hover:text-white transition-colors group"
                            >
                                <Icon name="radar" className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors shrink-0" />
                                <span>{t('trackOrder')}</span>
                            </Link>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer group"
                            >
                                <Icon name="logout" className="w-4 h-4 text-rose-400 group-hover:text-white transition-colors shrink-0" />
                                <span>{t('signOut')}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}