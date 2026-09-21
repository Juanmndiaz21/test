'use client';

export function PlayStationIcon({ className = 'w-3.5 h-3.5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="PlayStation">
            <path d="M8.544 1.705c-.487.324-.764.838-.764 1.41v12.217l3.873 1.206V3.882c0-.52-.303-.923-.746-1.127-.583-.268-1.782-.416-2.363-.05zM22.95 16.592c-.172-.414-.66-.69-1.343-.758l-5.632-.613-2.378-.26v2.247l2.846.331c1.398.163 1.62.457 1.62.836 0 .445-.487.77-1.46.77-1.04 0-2.482-.397-4.148-1.144l-.858-.387v2.308l1.32.487c1.472.544 2.827.818 4.02.818 2.593 0 4.254-1.144 4.254-2.835 0-.756-.37-1.398-.94-1.845h-.3zM1.05 19.34c.758.37 1.84.582 3.16.582 1.48 0 2.51-.252 3.44-.766l.76-.414v-2.285l-1.03.456c-1.13.5-2.07.696-2.88.696-.86 0-1.29-.26-1.29-.697 0-.325.26-.59.95-.77l3.8-.952.45-.114V13.01l-1.92.42-3.87.848C1.29 14.57.8 15.34.8 16.32c0 1.29.98 2.37 2.25 2.88z" />
        </svg>
    );
}

export function XboxIcon({ className = 'w-3.5 h-3.5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Xbox">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2.05 4.3c.75.87 2.2 3.4 2.8 4.5.2-.33 1.4-2.6 2.4-4.2 2.5 1 4.5 2.9 5.7 5.3-1.4 1.8-4.4 5.2-6.3 7.4 1.9 2.2 5 5.7 6.4 7.6-1.3 2.4-3.3 4.3-5.8 5.3-1-1.6-2.3-3.9-2.5-4.3-.6 1.1-2.1 3.7-2.8 4.6-2.5-1-4.6-2.9-5.9-5.3 1.4-1.8 4.5-5.4 6.4-7.6-1.9-2.2-4.9-5.7-6.3-7.5 1.2-2.4 3.3-4.3 5.8-5.3 1 1.6 2.2 3.9 2.4 4.2z" />
        </svg>
    );
}

export function PcIcon({ className = 'w-3.5 h-3.5' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="PC Windows">
            <path d="M0 3.449L9.75 2.1v9.451H0V3.449zm0 8.802h9.75v9.45L0 20.251V12.25zm10.75-10.3l13.25-1.85v11.4h-13.25V1.95zm0 10.3H24v11.4l-13.25-1.85V12.25z" />
        </svg>
    );
}

export default function PlatformBadges({ platform = 'PC', size = 'md' }) {
    const p = String(platform || '').toLowerCase();
    const hasPlayStation = p.includes('playstation') || p.includes('ps') || p.includes('all');
    const hasXbox = p.includes('xbox') || p.includes('all');
    const hasPc = p.includes('pc') || p.includes('all') || (!hasPlayStation && !hasXbox);

    const sizeClasses = size === 'sm'
        ? 'w-6 h-6'
        : 'w-7 h-7';

    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

    return (
        <div className="flex items-center gap-1.5" aria-label={`Platforms: ${platform}`}>
            {hasPlayStation && (
                <span
                    title="PlayStation"
                    className={`${sizeClasses} rounded-full bg-[#1b1b22]/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform`}
                >
                    <PlayStationIcon className={iconSize} />
                </span>
            )}
            {hasXbox && (
                <span
                    title="Xbox"
                    className={`${sizeClasses} rounded-full bg-[#107c10]/85 backdrop-blur-md border border-[#2ca243]/50 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform`}
                >
                    <XboxIcon className={iconSize} />
                </span>
            )}
            {hasPc && (
                <span
                    title="PC"
                    className={`${sizeClasses} rounded-full bg-[#0078d4]/80 backdrop-blur-md border border-[#3ba0e9]/50 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform`}
                >
                    <PcIcon className={iconSize} />
                </span>
            )}
        </div>
    );
}

