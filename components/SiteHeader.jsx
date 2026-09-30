'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '../i18n/navigation';
import { useSession, signOut } from 'next-auth/react';
import CartLink from './CartLink';
import UserNav from './UserNav';
import Icon from './Icon';

export default function SiteHeader() {
    const t = useTranslations('common');
    const { data: session } = useSession();
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: t('home') },
        { href: '/store', label: t('store') },
        { href: '/blog', label: t('blog') },
        { href: '/help', label: t('support') },
        { href: '/contact', label: t('contact') },
    ];

    const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    return (
        <header className="border-b border-white/10 bg-[#0d0914]/90 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center gap-5">
                <Link href="/" className="shrink-0" aria-label={t('brand')}>
                    <Image
                        src="/logo-v3.svg"
                        alt={t('brand')}
                        width={922}
                        height={176}
                        priority
                        loading="eager"
                        className="h-7 sm:h-7.5 md:h-8 w-auto object-contain"
                    />
                </Link>

                <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`transition-colors hover:text-[#9d7cff] focus-visible:outline-2 focus-visible:outline-[#9d7cff] ${isActive(item.href) ? 'text-[#9d7cff]' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <CartLink className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-full border border-white/15 bg-white/5 text-slate-300 hover:text-[#9d7cff] hover:border-[#9d7cff]/60 transition-[color,border-color,background-color,transform] duration-150 ease-out active:scale-[0.95] inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#9d7cff]" />
                    <div className="hidden md:block">
                        <UserNav />
                    </div>
                    <MobileMenu pathname={pathname} session={session} />
                </div>
            </div>
        </header>
    );
}

function MobileMenu({ pathname, session }) {
    const t = useTranslations('common');
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const user = session?.user;
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        setMounted(true);
    }, []);

    const links = [
        { href: '/', label: t('home') },
        { href: '/store', label: t('store') },
        { href: '/blog', label: t('blog') },
        { href: '/track', label: t('trackOrder') },
        { href: '/help', label: t('support') },
        { href: '/contact', label: t('contact') },
        { href: '/checkout', label: t('myCart') },
    ];

    const close = () => setOpen(false);

    // Close automatically when route changes
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Handle ESC key and scroll lock
    useEffect(() => {
        if (!open) return;
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = originalOverflow;
        };
    }, [open]);

    return (
        <div className="md:hidden">
            <button
                type="button"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:border-[#9d7cff]/40 hover:text-[#9d7cff] transition-[color,border-color,background-color] duration-150 active:scale-[0.95] focus-visible:outline-2 focus-visible:outline-[#9d7cff]"
            >
                <Icon name="menu" className="w-5 h-5" strokeWidth={2.2} />
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="mobile-nav"
                            className="fixed inset-0 z-[100] bg-[#0d0914] flex flex-col w-screen h-[100dvh]"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {/* Mobile Menu Top Bar */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d0914] shrink-0">
                                <Link href="/" onClick={close} className="shrink-0" aria-label={t('brand')}>
                                    <Image
                                        src="/logo-v3.svg"
                                        alt={t('brand')}
                                        width={922}
                                        height={176}
                                        priority
                                        className="h-7 sm:h-7.5 w-auto object-contain"
                                    />
                                </Link>

                                <div className="flex items-center gap-3">
                                    <CartLink className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-full border border-white/15 bg-white/5 text-slate-300 hover:text-[#9d7cff] inline-flex items-center justify-center" />
                                    <button
                                        type="button"
                                        aria-label="Close menu"
                                        onClick={close}
                                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl border border-[#9d7cff]/30 bg-[#9d7cff]/10 text-[#9d7cff] hover:bg-[#9d7cff]/20 transition-colors active:scale-[0.95] focus-visible:outline-2 focus-visible:outline-[#9d7cff]"
                                    >
                                        <Icon name="x" className="w-5 h-5" strokeWidth={2.2} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Navigation Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain">
                                <nav className="flex flex-col items-stretch gap-1 pb-8" aria-label="Mobile Navigation">
                                    {links.map((item, index) => {
                                        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                                        return (
                                            <motion.div
                                                key={item.href}
                                                initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateX(-10px)' }}
                                                animate={{ opacity: 1, transform: 'translateX(0)' }}
                                                transition={{
                                                    delay: shouldReduceMotion ? 0 : 0.025 * index,
                                                    duration: shouldReduceMotion ? 0.15 : 0.2,
                                                    ease: [0.23, 1, 0.32, 1],
                                                }}
                                            >
                                                <Link
                                                    href={item.href}
                                                    onClick={close}
                                                    className={`flex items-center justify-between py-3.5 border-b border-white/5 font-display text-2xl uppercase tracking-wider transition-colors ${
                                                        active ? 'text-[#9d7cff]' : 'text-slate-200 hover:text-[#9d7cff]'
                                                    }`}
                                                >
                                                    <span>{item.label}</span>
                                                    <Icon name="chevron-right" className="w-4 h-4 opacity-40 text-slate-400" />
                                                </Link>
                                            </motion.div>
                                        );
                                    })}

                                    {/* Account / Auth Section */}
                                    {user ? (
                                        <motion.div
                                            className="mt-6 pt-6 border-t border-white/10 space-y-3"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.18 }}
                                        >
                                            <Link
                                                href="/profile"
                                                onClick={close}
                                                className="block text-xs text-slate-400 bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/10 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-white truncate group-hover:text-[#9d7cff] transition-colors">{user.email}</p>
                                                    <span className="text-[11px] font-semibold text-[#9d7cff] inline-flex items-center gap-1">
                                                        {t('myProfile')}
                                                        <Icon name="arrow-right" className="w-3 h-3" />
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 mt-1">{isAdmin ? t('administratorAccount') : t('customerAccount')}</p>
                                            </Link>

                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    onClick={close}
                                                    className="flex items-center justify-center gap-2 w-full text-center bg-[#9d7cff]/15 border border-[#9d7cff]/30 hover:bg-[#9d7cff]/25 text-[#9d7cff] font-bold py-3 rounded-xl transition-colors text-sm"
                                                >
                                                    <Icon name="box" className="w-4 h-4 text-[#9d7cff]" />
                                                    {t('controlRoom')}
                                                </Link>
                                            )}

                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        close();
                                                        signOut({ callbackUrl: '/' });
                                                    }}
                                                    className="w-full text-center bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs"
                                                >
                                                    {t('signOut')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            className="mt-6 pt-6 border-t border-white/10 space-y-3"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.18 }}
                                        >
                                            <Link
                                                href="/login"
                                                onClick={close}
                                                className="flex items-center justify-center gap-2 w-full text-center bg-[#9d7cff] text-[#0d0914] font-black py-3.5 rounded-xl transition-colors hover:bg-[#b59dff] text-sm shadow-lg shadow-[#9d7cff]/20"
                                            >
                                                {t('signIn')}
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={close}
                                                className="flex items-center justify-center gap-2 w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold py-3 rounded-xl transition-colors text-xs"
                                            >
                                                {t('signUp')}
                                            </Link>
                                        </motion.div>
                                    )}
                                </nav>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}