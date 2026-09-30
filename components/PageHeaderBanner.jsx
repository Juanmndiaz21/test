export default function PageHeaderBanner({
    title,
    subtitle,
    badge,
    maxWidth = 'max-w-7xl',
    children,
}) {
    return (
        <div className="relative overflow-hidden bg-[#0d0917] py-14 sm:py-18 md:py-20 px-5 border-b border-[#9d7cff]/20">
            {/* Deep Layered Ambient Glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 left-1/4 w-[700px] h-[380px] bg-[#9d7cff]/16 rounded-full blur-[130px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 right-1/5 w-[500px] h-[300px] bg-[#7928ca]/12 rounded-full blur-[100px]"
            />

            {/* Precision Tech Blueprint Grid with Vignette Mask */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                    maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 85%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 85%)',
                }}
            >
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="header-banner-grid-polished" width="36" height="36" patternUnits="userSpaceOnUse">
                            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#9d7cff" strokeWidth="0.5" strokeOpacity="0.4" />
                            <circle cx="36" cy="0" r="1" fill="#c8b4ff" fillOpacity="0.6" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#header-banner-grid-polished)" />
                </svg>
            </div>

            {/* Decorative Cyber Geometry Accents (Right Side) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3.5 opacity-15 select-none"
            >
                <div className="w-24 h-48 border-r-2 border-[#9d7cff] skew-x-[-26deg]" />
                <div className="w-16 h-48 border-r border-[#9d7cff]/70 skew-x-[-26deg]" />
                <div className="w-10 h-48 border-r border-white/40 skew-x-[-26deg]" />
            </div>

            {/* Glowing Bottom Neon Accent Line */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#9d7cff] to-transparent shadow-[0_0_16px_rgba(157,124,255,0.7)]"
            />

            {/* Foreground Content */}
            <div className={`relative z-10 ${maxWidth} mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6`}>
                <div className="max-w-3xl">
                    <h1 className="display-font text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black uppercase tracking-tight text-white leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mt-4 text-slate-300 text-sm sm:text-base md:text-[17px] max-w-2xl leading-relaxed font-normal">
                            {subtitle}
                        </p>
                    )}
                </div>

                {(badge || children) && (
                    <div className="shrink-0 mt-3 md:mt-0 flex items-center gap-3 flex-wrap">
                        {badge && (
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#171229]/95 border border-[#9d7cff]/40 shadow-[0_0_24px_rgba(157,124,255,0.22)] backdrop-blur-md">
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
