export default function PageHeaderBanner({
    title,
    subtitle,
    badge,
    maxWidth = 'max-w-5xl',
    children,
}) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#591d89] via-[#4d1976] to-[#3c125f] py-11 sm:py-14 px-5 border-b border-white/10">
            {/* Ambient Radial Depth Highlight */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 left-1/4 w-96 h-64 bg-[#9225CF]/20 rounded-full blur-3xl"
            />

            {/* Subtle Tech Blueprint Grid Overlay */}
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 w-full h-full opacity-15"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id="banner-tech-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                        <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.6" strokeOpacity="0.25" />
                        <circle cx="28" cy="0" r="1" fill="white" fillOpacity="0.4" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#banner-tech-grid)" />
            </svg>

            {/* Decorative Right-side Tech Chevrons / Angled Slashes */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-20px] top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-15 select-none"
            >
                <div className="w-24 h-48 border-r-2 border-white/20 skew-x-[-25deg]" />
                <div className="w-16 h-48 border-r border-white/15 skew-x-[-25deg]" />
                <div className="w-8 h-48 border-r border-white/10 skew-x-[-25deg]" />
            </div>

            {/* Bottom Hairline Highlight */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#9225CF]/60 to-transparent"
            />

            {/* Foreground Content */}
            <div className={`relative z-10 ${maxWidth} mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 animate-hero-rise`}>
                <div>
                    <h1 className="font-['Trebuchet_MS',sans-serif] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2.5 text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
                {(badge || children) && (
                    <div className="shrink-0 mt-3 md:mt-0">
                        {badge && (
                            <span className="inline-block text-xs uppercase font-mono font-semibold tracking-wider text-white/90 border border-white/20 bg-white/10 rounded-full px-4 py-1.5">
                                {badge}
                            </span>
                        )}
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
