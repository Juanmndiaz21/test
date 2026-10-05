'use client';

import React, { useState } from 'react';
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '../i18n/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import CartLink from './CartLink';
import UserNav from './UserNav';

export default function SiteHeader() {
    const t = useTranslations('common');
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: t('home'), link: '/' },
        { name: t('store'), link: '/store' },
        { name: t('blog'), link: '/blog' },
        { name: t('support'), link: '/help' },
        { name: t('contact'), link: '/contact' },
    ];

    return (
        <Navbar className="sticky top-0 inset-x-0 z-50">
            {/* Desktop Navigation with on-scroll resizing floating pill */}
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} pathname={pathname} />
                <div className="flex items-center gap-3">
                    <CartLink className="min-h-[40px] min-w-[40px] h-10 w-10 rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 hover:text-purple-400 hover:border-[#9225CF]/50 hover:bg-zinc-800 transition-[color,border-color,background-color,transform] duration-150 ease-out active:scale-[0.95] inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#9225CF]" />
                    <UserNav />
                </div>
            </NavBody>

            {/* Mobile Navigation with expandable drawer */}
            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo />
                    <div className="flex items-center gap-2">
                        <CartLink className="min-h-[38px] min-w-[38px] h-9 w-9 rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 hover:text-purple-400 inline-flex items-center justify-center" />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </div>
                </MobileNavHeader>

                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                >
                    <div className="flex flex-col gap-1.5">
                        {navItems.map((item, idx) => {
                            const cleanPath = (pathname || '').replace(/\/$/, '') || '/';
                            const cleanLink = (item.link || '').replace(/\/$/, '') || '/';
                            const isActive = cleanLink === '/' ? cleanPath === '/' : (cleanPath === cleanLink || cleanPath.startsWith(cleanLink + '/'));

                            return (
                                <Link
                                    key={`mobile-link-${idx}`}
                                    href={item.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        'px-3.5 py-2.5 rounded-xl font-semibold transition-all text-sm flex items-center justify-between',
                                        isActive
                                            ? 'bg-[#9225CF]/20 border border-[#9225CF]/40 text-purple-200 shadow-[0_0_12px_rgba(146,37,207,0.25)]'
                                            : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                                    )}
                                >
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <span className="h-2 w-2 rounded-full bg-[#9225CF] shadow-[0_0_8px_#9225CF]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="h-px w-full bg-white/10 my-1" />

                    <div className="flex flex-col gap-3 pt-1">
                        <UserNav />
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}