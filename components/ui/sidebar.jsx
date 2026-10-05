'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconMenu2, IconX } from '@tabler/icons-react';

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({ children, open, setOpen, animate = true }) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...props} />
        </>
    );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                'h-full px-3 py-5 hidden md:flex md:flex-col bg-zinc-900/90 border-r border-white/10 shrink-0 select-none z-30 backdrop-blur-md',
                className
            )}
            animate={{
                width: animate ? (open ? '260px' : '68px') : '260px',
            }}
            transition={{
                duration: 0.22,
                ease: [0.23, 1, 0.32, 1],
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({ className, children, ...props }) => {
    const { open, setOpen } = useSidebar();
    return (
        <div
            className={cn(
                'h-14 px-4 flex flex-row md:hidden items-center justify-between bg-zinc-900 border-b border-white/10 w-full z-40'
            )}
            {...props}
        >
            <div className="flex justify-between items-center w-full">
                <span className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                    <span className="h-4 w-4 rounded-md bg-[#9225CF] inline-block shadow-[0_0_8px_#9225CF]" />
                    <span>OGMODZ Admin</span>
                </span>
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle Menu"
                    className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <IconMenu2 className="w-5 h-5 text-white" />
                </button>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{
                            duration: 0.25,
                            ease: 'easeInOut',
                        }}
                        className={cn(
                            'fixed h-full w-full inset-0 bg-zinc-950/98 backdrop-blur-2xl p-6 z-[100] flex flex-col justify-between overflow-y-auto',
                            className
                        )}
                    >
                        <button
                            type="button"
                            className="absolute right-5 top-5 z-50 text-zinc-400 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                            onClick={() => setOpen(false)}
                            aria-label="Close Menu"
                        >
                            <IconX className="w-6 h-6" />
                        </button>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SidebarLink = ({ link, className, active = false, onClick, ...props }) => {
    const { open, animate, setOpen } = useSidebar();

    const handleClick = (e) => {
        if (onClick) onClick(e);
        setOpen(false);
    };

    return (
        <Link
            href={link.href}
            onClick={handleClick}
            className={cn(
                'flex items-center justify-start gap-3 group/sidebar py-2 px-2.5 rounded-xl transition-all duration-150',
                active
                    ? 'bg-[#9225CF] text-white font-semibold shadow-[0_2px_12px_rgba(146,37,207,0.35)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5',
                className
            )}
            {...props}
        >
            <span className={cn('shrink-0 flex items-center justify-center transition-colors', active ? 'text-white' : 'text-zinc-400 group-hover/sidebar:text-purple-300')}>
                {link.icon}
            </span>

            <motion.span
                animate={{
                    display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                transition={{ duration: 0.15 }}
                className={cn(
                    'text-sm whitespace-pre inline-block !p-0 !m-0 transition duration-150 truncate',
                    active ? 'text-white font-semibold' : 'text-zinc-300 group-hover/sidebar:text-white'
                )}
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
