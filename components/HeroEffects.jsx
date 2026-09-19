export default function HeroEffects() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden select-none"
        >
            {/* Subtle atmospheric radial night-violet glow */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[500px] rounded-full bg-[#9d7cff]/[0.035] blur-3xl pointer-events-none" />

            {/* Fine hairline horizon rule */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
}