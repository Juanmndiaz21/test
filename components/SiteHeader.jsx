'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '../i18n/navigation';
import { useSession } from 'next-auth/react';
import CartLink from './CartLink';
import UserNav from './UserNav';
import Icon from './Icon';
import LanguageSwitcher from './LanguageSwitcher';

export default function SiteHeader() {
    const t = useTranslations('common');
    const { status } = useSession();
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: t('home') },
        { href: '/store', label: t('store') },
        { href: '/help', label: t('support') },
        { href: '/contact', label: t('contact') },
    ];

    const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    return (
        <header className="border-b border-lime-300/10 bg-[#0d0914]/90 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center gap-5">
                <Link href="/" className="shrink-0" aria-label={t('brand')}>
                    <Image
                        src="/logo.png"
                        alt={t('brand')}
                        width={886}
                        height={281}
                        priority
                        className="h-7 w-auto md:h-8"
                    />
                </Link>

                <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-400">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`transition-colors hover:text-lime-300 ${isActive(item.href) ? 'text-lime-300' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <CartLink className="text-lime-300 hover:text-white transition-colors" />
                </nav>

                <div className="flex items-center gap-2.5">
                    <div className="hidden md:block">
                        <UserNav />
                    </div>
                    <LanguageSwitcher />
                    <MobileMenu pathname={pathname} authed={status === 'authenticated'} />
                </div>
            </div>
        </header>
    );
}

function MobileMenu({ pathname, authed }) {
    const t = useTranslations('common');
    const [open, setOpen] = useState(false);
    const reduceMotion = useReducedMotion();

    const links = [
        { href: '/', label: t('home') },
        { href: '/store', label: t('store') },
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
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-lime-300/40 hover:text-lime-300 transition-colors"
            >
                <Icon name={open ? 'x' : 'menu'} className="w-5 h-5" strokeWidth={2.2} />
            </button>

            {open && (
                <motion.div
                    className="fixed inset-0 z-[80] bg-[#0d0914]/95 backdrop-blur-md pt-20"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <nav className="flex flex-col items-stretch gap-2 px-6" aria-label={t('navLanguage')}>
                        {links.map((item, index) => (
                            <motion.div
                                key={item.href}
                                initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.04 * index, duration: 0.25 }}
                            >
                                <Link
                                    href={item.href}
                                    onClick={close}
                                    className={`block py-4 border-b border-white/5 display-font text-3xl uppercase leading-none transition-colors ${
                                        pathname === item.href ? 'text-lime-300' : 'text-white hover:text-lime-300'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            className="mt-8 flex items-center justify-between gap-4"
                            initial={reduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.24 }}
                        >
                            <Link
                                href={authed ? '/checkout' : '/login'}
                                onClick={close}
                                className="flex-1 text-center bg-lime-300 text-black font-black py-3.5 rounded-lg transition-colors hover:bg-white"
                            >
                                {authed ? t('myCart') : t('signIn')}
                            </Link>
                            <CartLink className="h-11 w-11 rounded-lg border border-white/10 bg-white/5 text-lime-300 inline-flex items-center justify-center" />
                        </motion.div>
                    </nav>
                </motion.div>
            )}
        </div>
    );
}