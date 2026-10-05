'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as: Tag = 'button',
    duration = 1,
    clockwise = true,
    ...props
}) {
    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState('TOP');

    const rotateDirection = (currentDirection) => {
        const directions = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];
        const currentIndex = directions.indexOf(currentDirection);
        const nextIndex = clockwise
            ? (currentIndex - 1 + directions.length) % directions.length
            : (currentIndex + 1) % directions.length;
        return directions[nextIndex];
    };

    const movingMap = {
        TOP: 'radial-gradient(20.7% 50% at 50% 0%, #c084fc 0%, rgba(255, 255, 255, 0) 100%)',
        LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, #c084fc 0%, rgba(255, 255, 255, 0) 100%)',
        BOTTOM:
            'radial-gradient(20.7% 50% at 50% 100%, #c084fc 0%, rgba(255, 255, 255, 0) 100%)',
        RIGHT:
            'radial-gradient(16.2% 41.2% at 100% 50%, #c084fc 0%, rgba(255, 255, 255, 0) 100%)',
    };

    const highlight =
        'radial-gradient(75% 181.16% at 50% 50%, #9225CF 0%, rgba(255, 255, 255, 0) 100%)';

    useEffect(() => {
        if (!hovered) {
            const interval = setInterval(() => {
                setDirection((prevState) => rotateDirection(prevState));
            }, duration * 1000);
            return () => clearInterval(interval);
        }
    }, [hovered, duration, clockwise]);

    return (
        <Tag
            type={Tag === 'button' ? (props.type || 'button') : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                'relative flex rounded-full border border-white/10 content-center bg-black/40 hover:bg-black/20 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit cursor-pointer',
                containerClassName
            )}
            {...props}
        >
            <div
                className={cn(
                    'w-auto text-white z-10 bg-black px-5 py-2.5 rounded-[inherit]',
                    className
                )}
            >
                {children}
            </div>
            <motion.div
                className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
                style={{
                    filter: 'blur(2px)',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}
                initial={{ background: movingMap[direction] }}
                animate={{
                    background: hovered
                        ? [movingMap[direction], highlight]
                        : movingMap[direction],
                }}
                transition={{ ease: 'linear', duration: duration ?? 1 }}
            />
            <div className="bg-black absolute z-[1] flex-none inset-[2px] rounded-[100px]" />
        </Tag>
    );
}

export const AceternityLogo = ({ className }) => {
    return (
        <svg
            width="66"
            height="65"
            viewBox="0 0 66 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('h-3.5 w-3.5 text-white', className)}
        >
            <path
                d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
                stroke="currentColor"
                strokeWidth="15"
                strokeMiterlimit="3.86874"
                strokeLinecap="round"
            />
        </svg>
    );
};
