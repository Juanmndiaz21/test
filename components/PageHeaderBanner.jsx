export default function PageHeaderBanner({
    title,
    subtitle,
    badge,
    kicker,
    maxWidth = 'max-w-7xl',
    children,
}) {
    return (
        <div className="relative overflow-hidden bg-[#0d0917] py-12 sm:py-16 px-5 border-b border-[#9d7cff]/20">
            {/* Deep Ambient Lighting */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/4 w-[600px] h-[350px] bg-[#9d7cff]/15 rounded-full blur-[110px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 right-1/6 w-[450px] h-[280px] bg-[#7928ca]/12 rounded-full blur-[90px]"
            />

            {/* Precision Tech Blueprint Grid with Vignette Mask */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                    maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
                }}
            >
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="header-banner-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#9d7cff" strokeWidth="0.5" strokeOpacity="0.35" />
                            <circle cx="32" cy="0" r="1" fill="#c8b4ff" fillOpacity="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#header-banner-grid)" />
                </svg>
            </div>

            {/* Decorative Cyber Slash Accents (Right Side) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 opacity-20 select-none"
            >
                <div className="w-20 h-44 border-r-2 border-[#9d7cff] skew-x-[-28deg]" />
                <div className="w-14 h-44 border-r border-[#9d7cff]/70 skew-x-[-28deg]" />
                <div className="w-8 h-44 border-r border-white/40 skew-x-[-28deg]" />
            </div>

            {/* Glowing Bottom Neon Hairline */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#9d7cff]/80 to-transparent shadow-[0_0_12px_rgba(157,124,255,0.6)]"
            />

            {/* Foreground Content */}
            <div className={`relative z-10 ${maxWidth} mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6`}>
                <div className="max-w-3xl">

                    <h1 className="display-font text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
                            {subtitle}
                        </p>
                    )}
                </div>

                {(badge || children) && (
                    <div className="shrink-0 mt-2 md:mt-0 flex items-center gap-3">
                        {badge && (
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#171229]/90 border border-[#9d7cff]/35 shadow-[0_0_20px_rgba(157,124,255,0.18)] backdrop-blur-md">
                                <span className="h-2 w-2 rounded-full bg-[#9d7cff] animate-pulse" />
                                <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#c8b4ff]">
                                    {badge}
                                </span>
                            </div>
                        )}
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}

