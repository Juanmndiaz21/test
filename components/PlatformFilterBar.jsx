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
            className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#171229] border border-white/10 shadow-lg ${className}`}
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
                        className={`relative p-3 sm:px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            isActive
                                ? 'text-white bg-[#9d7cff]/15 border border-[#9d7cff]/40 shadow-[0_0_16px_rgba(157,124,255,0.3)]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <IconComponent className="w-5 h-5" />
                        {isActive && (
                            <span className="absolute bottom-1 inset-x-3.5 h-0.5 rounded-full bg-[#9d7cff] shadow-[0_0_8px_#9d7cff]" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
