function getInitials(name) {
    return name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

export default function GameArt({ name, image_url: imageUrl, className = '' }) {
    if (imageUrl) {
        return <img src={imageUrl} alt={name} className={`object-cover ${className}`} />;
    }

    return (
        <div aria-label={`${name} cover art`} role="img" className={`relative overflow-hidden flex items-center justify-center bg-[#171229] border border-white/10 ${className}`}>
            <span className="absolute left-0 top-0 w-full h-px bg-lime-300/40" aria-hidden="true" />
            <span className="display-font text-lime-300 leading-none select-none opacity-90">{getInitials(name)}</span>
            <span className="data-readout absolute bottom-1.5 left-2 right-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 truncate" aria-hidden="true">
                {`//${name}`}
            </span>
        </div>
    );
}