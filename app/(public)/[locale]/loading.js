export default function RootLoading() {
    return (
        <div className="max-w-7xl mx-auto px-5 pt-16 md:pt-24 space-y-14" role="status" aria-label="Loading">
            <div className="max-w-3xl space-y-5">
                <div className="h-8 w-40 rounded bg-white/5 animate-pulse" />
                <div className="h-16 md:h-24 w-3/4 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-2/3 rounded bg-white/5 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-28 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${index * 90}ms` }} />
                ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-48 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${index * 90}ms` }} />
                ))}
            </div>
        </div>
    );
}