import { memo } from 'react';
import GameLogo from './GameLogo';

function GameArt({ name, image_url: imageUrl, className = '', priority = false }) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className={`object-cover ${className}`}
            />
        );
    }

    return (
        <div aria-label={`${name} cover art`} role="img" className={`relative overflow-hidden flex items-center justify-center bg-[#120e1c] ${className}`}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#9d7cff]/20 via-[#171229]/60 to-[#0d0914] pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center p-6 w-full h-full">
                <GameLogo name={name} className="w-24 sm:w-28 h-24 sm:h-28 transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]" />
            </div>
            <span className="data-readout absolute bottom-2 left-3 right-3 text-[11px] uppercase tracking-[0.2em] text-slate-400 truncate text-center z-10" aria-hidden="true">
                {`// ${name}`}
            </span>
        </div>
    );
}

export default memo(GameArt);