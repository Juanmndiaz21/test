'use client';

import React from 'react';
import { HoverBorderGradient, AceternityLogo } from '@/components/ui/hover-border-gradient';

export function HoverBorderGradientDemo() {
    return (
        <div className="m-40 flex justify-center text-center">
            <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
                <AceternityLogo />
                <span>EXPLORE STORE</span>
            </HoverBorderGradient>
        </div>
    );
}

export default HoverBorderGradientDemo;
