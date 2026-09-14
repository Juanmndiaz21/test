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
    const menuRef = useRef(null);

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

    if (status === 'loading') {
        return <div className="h-9 w-28 rounded-lg bg-white/5 border border-white/10 animate-pulse" />;
    }

    if (!session?.user) {
        return (
            <div className="flex items-center gap-3 text-sm font-semibold">
                <Link href="/login" className="text-slate-300 hover:text-lime-300 transition-colors">
                    {t('signIn')}
                </Link>
                <Link href="/login" className="bg-lime-300 hover:bg-white text-black px-4 py-2 rounded-lg transition-colors">
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
        <div className="flex items-center gap-3">
            {isAdmin && (
                <RawLink
                    href="/admin/products"
                    className="hidden sm:inline-flex items-center gap-2 border border-lime-300/40 text-lime-300 hover:bg-lime-300 hover:text-black font-bold text-xs uppercase tracking-wide px-4 py-2 rounded-lg transition-colors"
                >
                    <Icon name="crown" className="w-3.5 h-3.5" />
                    Admin panel
                </RawLink>
            )}

            <div className="relative" ref={menuRef}>
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-haspopup="menu"
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 pl-1.5 pr-3 py-1.5 hover:border-lime-300/40 transition-colors"
                >
                    <span className="relative shrink-0">
                        {avatarFailed ? (
                            <span className="h-8 w-8 rounded-md bg-lime-300 text-black flex items-center justify-center text-sm font-black">{initial}</span>
                        ) : (
                            <img
                                src={avatarUrl}
                                alt=""
                                onError={() => setAvatarFailed(true)}
                                className="h-8 w-8 rounded-md object-cover border border-lime-300/40"
                            />
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-lime-300 border border-[#0d0914]" />
                    </span>
                    <span className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-white">{t('myProfile')}</span>
                        <span className="text-xs text-slate-400 max-w-32 truncate">{email}</span>
                    </span>
                    <span className={`text-[10px] text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}><Icon name="chevron-down" className="w-3 h-3" strokeWidth={2.5} /></span>
                </button>

                {open && (
                    <div role="menu" className="absolute right-0 top-full mt-2 w-64 panel-surface rounded-xl overflow-hidden z-50 border-lime-300/20">
                        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                            {avatarFailed ? (
                                <span className="h-10 w-10 rounded-lg bg-lime-300 text-black flex items-center justify-center font-black">{initial}</span>
                            ) : (
                                <img src={avatarUrl} alt="" onError={() => setAvatarFailed(true)} className="h-10 w-10 rounded-lg object-cover border border-lime-300/40" />
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{email}</p>
                                <p className="text-xs text-slate-400">{isAdmin ? t('administratorAccount') : t('customerAccount')}</p>
                            </div>
                        </div>

                        <nav className="p-2 space-y-1 text-sm">
                            {isAdmin ? (
                                <>
                                    <RawLink href="/admin/products" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-bold text-lime-300 hover:bg-lime-300 hover:text-black transition-colors">
                                        <Icon name="box" className="w-4 h-4" />
                                        {t('controlRoom')}
                                    </RawLink>
                                    <RawLink href="/admin" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-slate-300 hover:bg-lime-300 hover:text-black transition-colors">
                                        <Icon name="dashboard" className="w-4 h-4" />
                                        {t('dashboard')}
                                    </RawLink>
                                </>
                            ) : (
                                <p className="px-3 py-2.5 text-xs text-slate-400 flex items-center gap-2.5">
                                    <Icon name="shield" className="w-4 h-4 shrink-0" />
                                    {t('customerNote')}
                                </p>
                            )}
                            <Link href="/checkout" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-slate-300 hover:bg-lime-300 hover:text-black transition-colors">
                                <Icon name="cart" className="w-4 h-4" />
                                {t('myCart')}
                            </Link>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg font-semibold text-red-300 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <Icon name="logout" className="w-4 h-4" />
                                {t('signOut')}
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}