'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import React, { useState } from 'react';

export const HoverEffect = ({
    items,
    className,
    hoverClassName,
    layoutId = 'hoverBackground',
    children,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div
            className={cn(
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10',
                className
            )}
        >
            {items.map((item, idx) => {
                const isExternal =
                    item?.link &&
                    (item.link.startsWith('http://') || item.link.startsWith('https://'));
                const Wrapper = item?.link ? (isExternal ? 'a' : Link) : 'div';
                const linkProps = item?.link
                    ? isExternal
                        ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' }
                        : { href: item.link }
                    : {};

                return (
                    <Wrapper
                        key={item?.link || item?.title || idx}
                        {...linkProps}
                        className="relative group block p-2 h-full w-full"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <AnimatePresence>
                            {hoveredIndex === idx && (
                                <motion.span
                                    className={cn(
                                        'absolute inset-0 h-full w-full bg-[#9225CF]/20 border border-[#9225CF]/50 shadow-[0_0_25px_rgba(146,37,207,0.35)] block rounded-3xl',
                                        hoverClassName
                                    )}
                                    layoutId={layoutId}
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 1,
                                        transition: { duration: 0.15 },
                                    }}
                                    exit={{
                                        opacity: 0,
                                        transition: { duration: 0.15, delay: 0.2 },
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {children ? (
                            children(item, idx)
                        ) : (
                            <Card className={item?.step || item?.icon ? 'flex flex-col items-center text-center' : ''}>
                                {item?.icon && (
                                    <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#9225CF]/30 bg-[#9225CF]/15 text-purple-400 shadow-[0_0_14px_rgba(146,37,207,0.2)]">
                                        {item.icon}
                                    </div>
                                )}
                                {item?.step && (
                                    <span className="mb-2 inline-block rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-purple-400 border border-[#9225CF]/30">
                                        {item.step}
                                    </span>
                                )}
                                <CardTitle className={item?.step || item?.icon ? 'text-center' : ''}>
                                    {item?.title}
                                </CardTitle>
                                <CardDescription className={item?.step || item?.icon ? 'text-center' : ''}>
                                    {item?.description}
                                </CardDescription>
                            </Card>
                        )}
                    </Wrapper>
                );
            })}
        </div>
    );
};

export const Card = ({ className, children }) => {
    return (
        <div
            className={cn(
                'rounded-2xl h-full w-full p-4 overflow-hidden bg-black/60 border border-white/[0.08] group-hover:border-[#9225CF]/50 relative z-20 backdrop-blur-md transition-colors duration-200',
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

export const CardTitle = ({ className, children }) => {
    return (
        <h4 className={cn('text-zinc-100 font-bold tracking-tight text-sm sm:text-base mt-2', className)}>
            {children}
        </h4>
    );
};

export const CardDescription = ({ className, children }) => {
    return (
        <p className={cn('mt-2 text-zinc-400 tracking-normal leading-relaxed text-xs sm:text-sm font-normal', className)}>
            {children}
        </p>
    );
};
