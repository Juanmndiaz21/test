import { memo } from 'react';

function getInitials(name) {
    return name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

function GameArt({ name, image_url: imageUrl, className = '', priority = false }) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                className={`object-cover ${className}`}
            />
        );
    }

    return (
        <div aria-label={`${name} cover art`} role="img" className={`relative overflow-hidden flex items-center justify-center bg-[#171229] border border-white/10 ${className}`}>
            <span className="absolute left-0 top-0 w-full h-px bg-[#9d7cff]/40" aria-hidden="true" />
            <span className="display-font text-[#9d7cff] leading-none select-none opacity-90" aria-hidden="true">{getInitials(name)}</span>
            <span className="data-readout absolute bottom-1.5 left-2 right-2 text-xs uppercase tracking-[0.18em] text-slate-300 truncate" aria-hidden="true">
                {`//${name}`}
            </span>
        </div>
    );
}

export default memo(GameArt);