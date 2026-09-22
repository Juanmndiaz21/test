'use client';

import { FaPlaystation, FaXbox } from 'react-icons/fa6';
import { BsMicrosoft } from 'react-icons/bs';
import { IoGrid } from 'react-icons/io5';

export function AllPlatformsIcon({ className = 'w-3.5 h-3.5', ...props }) {
    return <IoGrid className={className} aria-label="All Platforms" {...props} />;
}

export function PlayStationIcon({ className = 'w-3.5 h-3.5', ...props }) {
    return <FaPlaystation className={className} aria-label="PlayStation" {...props} />;
}

export function XboxIcon({ className = 'w-3.5 h-3.5', ...props }) {
    return <FaXbox className={className} aria-label="Xbox" {...props} />;
}

export function PcIcon({ className = 'w-3.5 h-3.5', ...props }) {
    return <BsMicrosoft className={className} aria-label="PC Windows" {...props} />;
}

export default function PlatformBadges({ platform = 'PC', size = 'md' }) {
    const p = String(platform || '').toLowerCase();
    const hasPlayStation = p.includes('playstation') || p.includes('ps') || p.includes('all');
    const hasXbox = p.includes('xbox') || p.includes('all');
    const hasPc = p.includes('pc') || p.includes('all') || (!hasPlayStation && !hasXbox);

    const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

    return (
        <div className="flex items-center gap-1.5" aria-label={`Platforms: ${platform}`}>
            {hasPlayStation && (
                <span
                    title="PlayStation"
                    className={`${sizeClasses} rounded-full bg-[#171229]/90 backdrop-blur-md border border-white/20 text-slate-200 hover:text-white hover:border-[#9d7cff]/60 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-colors`}
                >
                    <PlayStationIcon className={iconSize} />
                </span>
            )}
            {hasXbox && (
                <span
                    title="Xbox"
                    className={`${sizeClasses} rounded-full bg-[#171229]/90 backdrop-blur-md border border-white/20 text-slate-200 hover:text-white hover:border-[#9d7cff]/60 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-colors`}
                >
                    <XboxIcon className={iconSize} />
                </span>
            )}
            {hasPc && (
                <span
                    title="PC"
                    className={`${sizeClasses} rounded-full bg-[#171229]/90 backdrop-blur-md border border-white/20 text-slate-200 hover:text-white hover:border-[#9d7cff]/60 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-colors`}
                >
                    <PcIcon className={iconSize} />
                </span>
            )}
        </div>
    );
}
