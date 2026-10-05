import LoadingWheel from '@/components/LoadingWheel';

export default function StoreLoading() {
    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 space-y-10" role="status" aria-label="Loading catalog">
            {/* Header with animated loading wheel */}
            <div className="flex flex-col items-center justify-center py-6">
                <LoadingWheel size="lg" showLogo={true} label="OGmodz Standings · Store" />
            </div>

            {/* Products grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-white/5 bg-zinc-900 overflow-hidden"
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