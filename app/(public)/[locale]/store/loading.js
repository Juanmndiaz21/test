export default function StoreLoading() {
    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 space-y-10" role="status" aria-label="Loading catalog">
            {/* Header section matching store/page.js */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-3">
                    <div className="h-4 w-28 rounded skeleton-shimmer" />
                    <div className="h-12 md:h-14 w-64 md:w-80 rounded-xl skeleton-shimmer" />
                    <div className="h-4 w-72 md:w-96 rounded skeleton-shimmer" />
                </div>
                <div className="h-8 w-32 rounded-full skeleton-shimmer" />
            </div>

            {/* Products grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-white/5 bg-[#171229] overflow-hidden"
                    >
                        <div className="aspect-video skeleton-shimmer" />
                        <div className="p-5 space-y-3">
                            <div className="h-5 w-3/4 rounded skeleton-shimmer" />
                            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                            <div className="pt-2 flex items-center justify-between">
                                <div className="h-6 w-16 rounded skeleton-shimmer" />
                                <div className="h-8 w-10 rounded-full skeleton-shimmer" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}