'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconMenu2, IconX } from '@tabler/icons-react';

export const Navbar = ({ children, className }) => {
    return (
        <header className={cn('sticky top-0 inset-x-0 z-50 w-full flex justify-center py-2.5 transition-all duration-300', className)}>
            {children}
        </header>
    );
};

export const NavBody = ({ children, className }) => {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (latest > 40) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    });

    return (
        <motion.div
            animate={{
                width: scrolled ? '90%' : '100%',
                maxWidth: scrolled ? '1120px' : '1280px',
                borderRadius: scrolled ? '9999px' : '18px',
                borderWidth: '1px',
                borderColor: scrolled ? 'rgba(146, 37, 207, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                backgroundColor: scrolled ? 'rgba(18, 18, 22, 0.88)' : 'rgba(9, 9, 11, 0.75)',
                boxShadow: scrolled
                    ? '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(146, 37, 207, 0.2)'
                    : 'none',
                paddingTop: '12px',
                paddingBottom: '12px',
            }}
            transition={{
                duration: 0.25,
                ease: [0.23, 1, 0.32, 1],
            }}
            className={cn(
                'hidden md:flex items-center justify-between px-6 backdrop-blur-xl transition-all mx-auto',
                className
            )}
        >
            {children}
        </motion.div>
    );
};

const scrollToPageTop = () => {
    if (typeof window === 'undefined') return;
    if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.2, smooth: true });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

export const NavItems = ({ items = [], pathname, className }) => {
    const [hovered, setHovered] = useState(null);

    const isItemActive = (link) => {
        if (!pathname) return false;
        const cleanPath = pathname.replace(/\/$/, '') || '/';
        const cleanLink = (link || '').replace(/\/$/, '') || '/';
        if (cleanLink === '/') {
            return cleanPath === '/';
        }
        return cleanPath === cleanLink || cleanPath.startsWith(cleanLink + '/');
    };

    const handleItemClick = (e, item, linkHref) => {
        if (item.onClick) item.onClick(e);
        if (linkHref === '/' || linkHref === '#') {
            if (typeof window !== 'undefined') {
                const isHome = window.location.pathname === '/' || /^\/[a-z]{2}\/?$/.test(window.location.pathname);
                if (isHome) {
                    e.preventDefault();
                    scrollToPageTop();
                }
            }
        }
    };

    return (
        <nav aria-label="Main Navigation" className={cn('flex items-center gap-1.5', className)}>
            {items.map((item, idx) => {
                const linkHref = item.link || item.href || '#';
                const isActive = isItemActive(linkHref);

                return (
                    <Link
                        key={linkHref + idx}
                        href={linkHref}
                        onClick={(e) => handleItemClick(e, item, linkHref)}
                        onMouseEnter={() => setHovered(idx)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                            'relative px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150 select-none cursor-pointer',
                            isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                        )}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="nav-active-pill"
                                className="absolute inset-0 rounded-full bg-[#9225CF]/20 border border-[#9225CF]/50 shadow-[0_0_14px_rgba(146,37,207,0.35)]"
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                        )}
                        {hovered === idx && !isActive && (
                            <motion.span
                                layoutId="nav-hover-pill"
                                className="absolute inset-0 rounded-full bg-white/[0.06] border border-white/10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.25 }}
                            />
                        )}
                        <span className={cn('relative z-10 flex items-center gap-1.5', isActive && 'text-purple-200 font-bold')}>
                            {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#9225CF] shadow-[0_0_8px_#9225CF]" />
                            )}
                            <span>{item.name || item.label}</span>
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export const NavbarLogo = ({ className, href = '/', onClick }) => {
    const handleClick = (e) => {
        if (onClick) onClick(e);
        if (typeof window !== 'undefined') {
            const isHome = window.location.pathname === '/' || /^\/[a-z]{2}\/?$/.test(window.location.pathname);
            if (isHome) {
                e.preventDefault();
                scrollToPageTop();
            }
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={cn('shrink-0 flex items-center gap-2.5 cursor-pointer', className)}
            aria-label="OGMODZ Brand Logo"
        >
            <img
                src="/logo-v3.svg"
                alt="OGMODZ"
                className="h-7 md:h-8 w-auto object-contain"
            />
        </Link>
    );
};

export const NavbarButton = ({
    children,
    className,
    variant = 'primary',
    href,
    onClick,
    ...props
}) => {
    const baseClasses = cn(
        'px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-150 inline-flex items-center justify-center cursor-pointer active:scale-95 select-none',
        variant === 'primary'
            ? 'bg-[#9225CF] hover:bg-[#a83ff0] text-white shadow-[0_0_15px_rgba(146,37,207,0.4)]'
            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white',
        className
    );

    if (href) {
        return (
            <Link href={href} className={baseClasses} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={baseClasses} {...props}>
            {children}
        </button>
    );
};

export const MobileNav = ({ children, className }) => {
    return (
        <div className={cn('md:hidden w-full px-4 relative', className)}>
            {children}
        </div>
    );
};

export const MobileNavHeader = ({ children, className }) => {
    return (
        <div className={cn('flex items-center justify-between w-full py-2.5 px-4 rounded-2xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-lg relative z-50', className)}>
            {children}
        </div>
    );
};

export const MobileNavToggle = ({ isOpen, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
            {isOpen ? <IconX className="w-5 h-5 text-white" /> : <IconMenu2 className="w-5 h-5 text-white" />}
        </button>
    );
};

export const MobileNavMenu = ({
    isOpen,
    onClose,
    children,
    className,
}) => {
    if (!isOpen) return null;

    return (
        <div className="md:hidden">
            {/* Backdrop to close menu on outside tap & block clicks on underlying elements */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 transition-opacity duration-150 animate-in fade-in"
                aria-hidden="true"
            />

            {/* Floating Mobile Nav Drawer (Floats over content, never displaces layout) */}
            <div
                className={cn(
                    'absolute top-full left-4 right-4 mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-5 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150',
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
};
