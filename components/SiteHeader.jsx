'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
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
        { href: '/about', label: 'About' },
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
    const shouldReduceMotion = useReducedMotion();
    const user = session?.user;
    const isAdmin = user?.role === 'ADMIN';

    const links = [
        { href: '/', label: t('home') },
        { href: '/store', label: t('store') },
        { href: '/about', label: 'About' },
        { href: '/track', label: t('trackOrder') },
        { href: '/help', label: t('support') },
        { href: '/contact', label: t('contact') },
        { href: '/checkout', label: t('myCart') },
    ];

    useEffect(() => {
        if (!open) return;
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open]);

    const close = () => setOpen(false);

    return (
        <div className="md:hidden">
            <button
                type="button"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:border-[#9d7cff]/40 hover:text-[#9d7cff] transition-[color,border-color,background-color] duration-150 active:scale-[0.95] focus-visible:outline-2 focus-visible:outline-[#9d7cff]"
            >
                <Icon name={open ? 'x' : 'menu'} className="w-5 h-5" strokeWidth={2.2} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="mobile-nav"
                        className="fixed inset-0 z-[80] bg-[#0d0914]/95 backdrop-blur-md pt-20 overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <nav className="flex flex-col items-stretch gap-2 px-6 pb-12" aria-label="Main Navigation">
                            {links.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateX(-12px)' }}
                                    animate={{ opacity: 1, transform: 'translateX(0)' }}
                                    transition={{
                                        delay: shouldReduceMotion ? 0 : 0.03 * index,
                                        duration: shouldReduceMotion ? 0.15 : 0.2,
                                        ease: [0.23, 1, 0.32, 1],
                                    }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={close}
                                        className={`block py-4 border-b border-white/5 display-font text-3xl uppercase leading-none transition-colors ${
                                            pathname === item.href ? 'text-[#9d7cff]' : 'text-white hover:text-[#9d7cff]'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}

                        {user ? (
                            <motion.div
                                className="mt-8 pt-6 border-t border-white/10 space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.24 }}
                            >
                                <Link
                                    href="/profile"
                                    onClick={close}
                                    className="block text-xs text-slate-400 bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-white truncate group-hover:text-[#9d7cff] transition-colors">{user.email}</p>
                                        <span className="text-[11px] font-semibold text-[#9d7cff] inline-flex items-center gap-1">
                                            {t('myProfile')}
                                            <Icon name="arrow-right" className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <p className="text-slate-400 mt-0.5">{isAdmin ? t('administratorAccount') : t('customerAccount')}</p>
                                </Link>

                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={close}
                                        className="flex items-center justify-center gap-2 w-full text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-colors"
                                    >
                                        <Icon name="box" className="w-4 h-4 text-[#9d7cff]" />
                                        {t('controlRoom')}
                                    </Link>
                                )}

                                <div className="space-y-2">
                                    <Link
                                        href="/track"
                                        onClick={close}
                                        className="flex items-center justify-center gap-2 w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold py-2.5 rounded-lg transition-colors text-xs"
                                    >
                                        <Icon name="radar" className="w-4 h-4 text-[#9d7cff]" />
                                        {t('trackOrder')}
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                close();
                                                signOut({ callbackUrl: '/' });
                                            }}
                                            className="flex-1 text-center bg-white/5 border border-white/10 text-slate-300 hover:text-white font-bold py-3 rounded-lg transition-colors cursor-pointer text-xs"
                                        >
                                            {t('signOut')}
                                        </button>
                                        <CartLink className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-lg border border-white/10 bg-white/5 text-[#9d7cff] inline-flex items-center justify-center" />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="mt-8 space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.24 }}
                            >
                                <Link
                                    href="/track"
                                    onClick={close}
                                    className="flex items-center justify-center gap-2 w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold py-2.5 rounded-lg transition-colors text-xs"
                                >
                                    <Icon name="radar" className="w-4 h-4 text-[#9d7cff]" />
                                    {t('trackOrder')}
                                </Link>
                                <div className="flex items-center justify-between gap-3">
                                    <Link
                                        href="/login"
                                        onClick={close}
                                        className="flex-1 text-center bg-[#9d7cff] text-[#0d0914] font-black py-3 rounded-lg transition-colors hover:bg-[#b59dff] text-xs"
                                    >
                                        {t('signIn')}
                                    </Link>
                                    <CartLink className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-lg border border-white/10 bg-white/5 text-[#9d7cff] inline-flex items-center justify-center" />
                                </div>
                            </motion.div>
                        )}
                    </nav>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}