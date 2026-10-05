'use client';

import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import {
    IconBrandTabler,
    IconPackage,
    IconDeviceGamepad2,
    IconClipboardList,
    IconStar,
    IconUsers,
    IconHelpCircle,
    IconBook,
    IconMail,
    IconSettings,
    IconBuildingStore,
    IconArrowLeft,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const Logo = () => {
    return (
        <Link
            href="/admin"
            className="relative z-20 flex items-center space-x-2.5 py-1 text-sm font-normal"
        >
            <div className="h-6 w-7 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-[#9225CF] shadow-[0_0_12px_rgba(146,37,207,0.6)] flex items-center justify-center font-black text-[10px] text-white">
                OG
            </div>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold whitespace-pre text-white tracking-tight flex items-center gap-1.5"
            >
                <span>OGMODZ</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN
                </span>
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            href="/admin"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
        >
            <div className="h-6 w-7 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-[#9225CF] shadow-[0_0_12px_rgba(146,37,207,0.6)] flex items-center justify-center font-black text-[10px] text-white">
                OG
            </div>
        </Link>
    );
};

export function AdminShell({ children, user }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const links = [
        {
            label: 'Dashboard',
            href: '/admin',
            icon: <IconBrandTabler className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Products',
            href: '/admin/products',
            icon: <IconPackage className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Categories / Games',
            href: '/admin/categories',
            icon: <IconDeviceGamepad2 className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Orders',
            href: '/admin/orders',
            icon: <IconClipboardList className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Reviews',
            href: '/admin/reviews',
            icon: <IconStar className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Users',
            href: '/admin/users',
            icon: <IconUsers className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Help / FAQs',
            href: '/admin/help',
            icon: <IconHelpCircle className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Blog & Guides',
            href: '/admin/blog',
            icon: <IconBook className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Contact Messages',
            href: '/admin/contact',
            icon: <IconMail className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Payment Methods',
            href: '/admin/settings',
            icon: <IconSettings className="h-5 w-5 shrink-0" />,
        },
        {
            label: 'Back to Store',
            href: '/',
            icon: <IconBuildingStore className="h-5 w-5 shrink-0" />,
        },
    ];

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const initial = (user?.email?.[0] || 'A').toUpperCase();

    return (
        <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-zinc-950 text-slate-100">
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-6">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-6 flex flex-col gap-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <SidebarLink
                                        key={link.href}
                                        link={link}
                                        active={isActive}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom User Profile & Logout */}
                    <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                        <SidebarLink
                            link={{
                                label: user?.email || 'Administrator',
                                href: '/admin',
                                icon: (
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-[#9225CF]/20 border border-[#9225CF]/50 flex items-center justify-center text-xs font-bold text-purple-300 shadow-[0_0_8px_rgba(146,37,207,0.3)]">
                                        {initial}
                                    </div>
                                ),
                            }}
                        />

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center justify-start gap-3 py-2 px-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left group/sidebar"
                        >
                            <IconArrowLeft className="h-5 w-5 shrink-0 text-zinc-400 group-hover/sidebar:text-red-400" />
                            {open && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-medium whitespace-pre text-zinc-300 group-hover/sidebar:text-red-400 transition-colors"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </button>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main scrollable content zone */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 bg-zinc-950">
                {children}
            </main>
        </div>
    );
}

// Standalone Demo Export matching user's requested component name
export function SidebarDemo() {
    return (
        <AdminShell user={{ email: 'admin@ogmodz.com' }}>
            <div className="p-8">Admin Dashboard</div>
        </AdminShell>
    );
}

export default AdminShell;
