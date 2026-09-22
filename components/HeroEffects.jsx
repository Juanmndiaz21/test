export default function HeroEffects() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden select-none"
        >
            {/* Deep violet radial aura centered behind the logo */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] md:w-[1000px] h-[500px] rounded-full bg-[#9d7cff]/[0.12] blur-[120px] pointer-events-none" />

            {/* Subtle secondary ambient glow */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[300px] rounded-full bg-[#6640d6]/[0.18] blur-3xl pointer-events-none" />

            {/* Architectural dark gaming geometry backdrop (matching reference image) */}
            <svg
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[420px] sm:h-[480px] opacity-25 pointer-events-none mix-blend-screen"
                viewBox="0 0 1000 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Central pyramid / apex structure */}
                <polygon
                    points="500,40 280,480 720,480"
                    fill="url(#apexGrad)"
                    stroke="rgba(157, 124, 255, 0.2)"
                    strokeWidth="1.5"
                />
                {/* Lateral structural facets */}
                <polygon
                    points="500,40 500,480 720,480"
                    fill="rgba(157, 124, 255, 0.04)"
                />
                <line x1="500" y1="40" x2="500" y2="480" stroke="rgba(157, 124, 255, 0.25)" strokeWidth="1.5" />
                <line x1="500" y1="160" x2="380" y2="480" stroke="rgba(157, 124, 255, 0.12)" strokeWidth="1" />
                <line x1="500" y1="160" x2="620" y2="480" stroke="rgba(157, 124, 255, 0.12)" strokeWidth="1" />
                
                {/* Geometric mesh / constellation web at the apex */}
                <circle cx="500" cy="40" r="80" stroke="rgba(157, 124, 255, 0.15)" strokeDasharray="3 3" strokeWidth="1" />
                <circle cx="500" cy="40" r="140" stroke="rgba(157, 124, 255, 0.08)" strokeDasharray="4 4" strokeWidth="1" />
                
                <defs>
                    <linearGradient id="apexGrad" x1="500" y1="40" x2="500" y2="480" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="rgba(157, 124, 255, 0.18)" />
                        <stop offset="70%" stopColor="rgba(23, 18, 41, 0.4)" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Bottom vignette fade out into page ground */}
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent" />
            
            {/* Top horizon subtle hairline */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9d7cff]/20 to-transparent" />
        </div>
    );
}