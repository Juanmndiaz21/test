export default function RootLoading() {
    return (
        <div
            className="min-h-[70vh] flex flex-col items-center justify-center px-4"
            role="status"
            aria-label="Loading"
        >
            <div className="relative flex items-center justify-center">
                {/* Subtle ambient violet aura */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute w-28 h-28 rounded-full bg-[#9d7cff]/15 blur-2xl"
                />

                {/* Elegant rotating ring */}
                <div className="w-16 h-16 rounded-full border-[2.5px] border-[#9d7cff]/15 border-t-[#9d7cff] animate-loading-spin" />

                {/* Pulsing centered brand logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo-v3.png"
                        alt="OG MODZ"
                        loading="eager"
                        className="w-8 h-8 object-contain animate-logo-pulse select-none"
                    />
                </div>
            </div>

            {/* Readout label */}
            <div className="mt-6 flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cff] animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.24em] text-slate-300">
                    OGmodz Standings
                </span>
            </div>
        </div>
    );
}