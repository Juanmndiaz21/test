export default function StoreLoading() {
    return (
        <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 space-y-10" role="status" aria-label="Loading catalog">
            <div className="space-y-3">
                <div className="h-6 w-32 rounded bg-white/5 animate-pulse" />
                <div className="h-14 md:h-16 w-1/2 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-1/3 rounded bg-white/5 animate-pulse" />
            </div>

            <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-28 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${index * 90}ms` }} />
                ))}
            </div>
        </div>
    );
}