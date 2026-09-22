'use client';

import { AllPlatformsIcon, PlayStationIcon, XboxIcon, PcIcon } from './PlatformBadges';

const PLATFORMS = [
    { id: 'all', label: 'All Platforms', icon: AllPlatformsIcon },
    { id: 'PlayStation', label: 'PlayStation', icon: PlayStationIcon },
    { id: 'Xbox', label: 'Xbox', icon: XboxIcon },
    { id: 'PC', label: 'PC', icon: PcIcon },
];

export default function PlatformFilterBar({ activePlatform = 'all', onSelectPlatform, className = '' }) {
    return (
        <div
            role="group"
            aria-label="Filter by platform"
            className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#171229] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.3)] ${className}`}
        >
            {PLATFORMS.map((platform) => {
                const IconComponent = platform.icon;
                const isActive = activePlatform.toLowerCase() === platform.id.toLowerCase();

                return (
                    <button
                        key={platform.id}
                        type="button"
                        onClick={() => onSelectPlatform(platform.id)}
                        title={platform.label}
                        aria-label={platform.label}
                        aria-pressed={isActive}
                        className={`relative px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center ${
                            isActive
                                ? 'text-white bg-[#9d7cff]/20 border border-[#9d7cff]/40 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <IconComponent className="w-5 h-5" />
                        {isActive && (
                            <span className="absolute bottom-1 inset-x-3.5 h-0.5 rounded-full bg-[#9d7cff]" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
