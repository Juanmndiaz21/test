export default function GameLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10" role="status" aria-label="Loading game services">
            {/* Banner skeleton */}
            <div className="relative overflow-hidden rounded-3xl bg-[#171229] border border-[#9d7cff]/10 p-6 sm:p-10 md:p-12">
                {/* Ambient glow shimmer */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#9d7cff]/10 blur-3xl animate-logo-pulse"
                />

                <div className="relative z-10 space-y-5">
                    {/* Breadcrumb skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="h-3.5 w-12 rounded skeleton-shimmer" />
                        <span className="text-slate-600">/</span>
                        <div className="h-3.5 w-20 rounded skeleton-shimmer" />
                    </div>

                    {/* Title skeleton */}
                    <div className="h-10 sm:h-14 md:h-16 w-2/3 rounded-xl skeleton-shimmer" />

                    {/* Subtitle skeleton */}
                    <div className="space-y-2 max-w-xl">
                        <div className="h-4 w-full rounded skeleton-shimmer" />
                        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                    </div>

                    {/* Trust badges skeleton */}
                    <div className="flex items-center gap-6 pt-5 border-t border-white/5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full skeleton-shimmer" />
                                <div className="h-3.5 w-24 rounded skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter toolbar skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#171229] border border-white/10">
                {/* Search skeleton */}
                <div className="h-10 w-full max-w-md rounded-xl skeleton-shimmer" />

                {/* Platform filters skeleton */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-4 w-24 rounded skeleton-shimmer hidden sm:block" />
                        <div className="h-6 w-16 rounded-full skeleton-shimmer" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-xl skeleton-shimmer" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Product cards grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-white/5 overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="aspect-video skeleton-shimmer" />
                        <div className="p-4 space-y-3 bg-[#171229]">
                            <div className="h-5 w-3/4 rounded skeleton-shimmer" />
                            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                            <div className="h-4 w-20 rounded skeleton-shimmer mt-3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

