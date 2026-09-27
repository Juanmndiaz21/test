import Icon from './Icon';

export default function LoadingWheel({
    size = 'lg', // 'sm' | 'md' | 'lg' | 'xl'
    label,
    showLogo = false,
    className = '',
}) {
    const sizeConfig = {
        sm: {
            container: 'w-6 h-6',
            outerRing: 'w-6 h-6 border-[2px]',
            innerRing: 'hidden',
            logo: 'w-3 h-3',
            dot: 'w-1 h-1',
        },
        md: {
            container: 'w-11 h-11',
            outerRing: 'w-11 h-11 border-[2.5px]',
            innerRing: 'w-7 h-7 border',
            logo: 'w-5 h-5',
            dot: 'w-1.5 h-1.5',
        },
        lg: {
            container: 'w-16 h-16',
            outerRing: 'w-16 h-16 border-[2.5px]',
            innerRing: 'w-10 h-10 border',
            logo: 'w-8 h-8',
            dot: 'w-2 h-2',
        },
        xl: {
            container: 'w-20 h-20',
            outerRing: 'w-20 h-20 border-[3px]',
            innerRing: 'w-12 h-12 border-[1.5px]',
            logo: 'w-10 h-10',
            dot: 'w-2.5 h-2.5',
        },
    }[size] || {
        container: 'w-16 h-16',
        outerRing: 'w-16 h-16 border-[2.5px]',
        innerRing: 'w-10 h-10 border',
        logo: 'w-8 h-8',
        dot: 'w-2 h-2',
    };

    return (
        <div
            className={`flex flex-col items-center justify-center ${className}`}
            role="status"
            aria-label={label || 'Loading'}
        >
            <div className={`relative flex items-center justify-center ${sizeConfig.container}`}>
                {/* Static hairline guide track */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-[#9d7cff]/20"
                />

                {/* Primary fast-spinning active violet arc */}
                <div
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-full border-transparent border-t-[#9d7cff] border-r-[#9d7cff]/70 animate-loading-spin ${sizeConfig.outerRing}`}
                />

                {/* Secondary inner counter-rotating orbital ring for depth */}
                <div
                    aria-hidden="true"
                    className={`absolute rounded-full border-dashed border-[#9d7cff]/35 animate-loading-spin-reverse ${sizeConfig.innerRing}`}
                />

                {/* Center Hub: Brand logo or glowing core dot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {showLogo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src="/logo-v3.png"
                            alt=""
                            aria-hidden="true"
                            className={`object-contain animate-logo-pulse select-none ${sizeConfig.logo}`}
                        />
                    ) : (
                        <span
                            aria-hidden="true"
                            className={`rounded-full bg-[#9d7cff] ${sizeConfig.dot}`}
                        />
                    )}
                </div>
            </div>

            {/* Readout label if specified */}
            {label && (
                <div className="mt-5 flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cff] animate-pulse" aria-hidden="true" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-slate-300">
                        {label}
                    </span>
                </div>
            )}
        </div>
    );
}
