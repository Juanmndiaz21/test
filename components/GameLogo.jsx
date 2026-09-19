'use client';

import { memo } from 'react';

function normalize(str = '') {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function GameLogo({ name = '', imageUrl = null, className = '' }) {
    const key = normalize(name);

    // 1. GTA / GTA V
    if (key === 'gta' || key === 'gtav' || key === 'grandtheftautov' || key === 'grandtheftauto') {
        return (
            <div className={`flex items-center justify-center relative select-none ${className}`}>
                <div className="relative flex items-center justify-center">
                    {/* Iconic Green Roman V */}
                    <span className="font-serif font-black text-2xl sm:text-3xl text-emerald-500 tracking-tighter drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                        V
                    </span>
                    {/* Overlay White GTA text */}
                    <span className="absolute -inset-x-2 font-['Impact',sans-serif] font-black text-xs sm:text-sm tracking-wider text-white bg-[#161224]/85 px-1 py-0.5 rounded border border-white/10 shadow-sm uppercase">
                        GTA
                    </span>
                </div>
            </div>
        );
    }

    // 2. ARC Raiders
    if (key === 'arcraiders') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <div className="flex items-center gap-0.5 text-sm sm:text-base font-black italic tracking-tighter">
                    <span className="text-cyan-400">//</span>
                    <span className="text-amber-400">A</span>
                    <span className="text-rose-500">R</span>
                    <span className="text-cyan-400">C</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-300 uppercase">
                    Raiders
                </span>
            </div>
        );
    }

    // 3. COD (Call of Duty)
    if (key === 'cod' || key === 'callofduty') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg tracking-widest text-white px-2 py-0.5 border border-white/20 rounded bg-black/40">
                    COD
                </span>
            </div>
        );
    }

    // 4. BO7
    if (key === 'bo7' || key === 'blackops7') {
        return (
            <div className={`flex items-center justify-center gap-0.5 select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-white tracking-tight">BO</span>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-orange-500 tracking-tight">7</span>
            </div>
        );
    }

    // 5. BO2
    if (key === 'bo2' || key === 'blackops2') {
        return (
            <div className={`flex items-center justify-center gap-0.5 select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-white tracking-tight">BO</span>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-orange-500 tracking-tight">2</span>
            </div>
        );
    }

    // 6. BO1
    if (key === 'bo1' || key === 'blackops1' || key === 'blackops') {
        return (
            <div className={`flex items-center justify-center gap-0.5 select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-white tracking-tight">BO</span>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-orange-500 tracking-tight">1</span>
            </div>
        );
    }

    // 7. MW4
    if (key === 'mw4' || key === 'modernwarfare4') {
        return (
            <div className={`flex items-center justify-center gap-0.5 select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-white tracking-tight">MW</span>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-yellow-400 tracking-tight">4</span>
            </div>
        );
    }

    // 8. FORTNITE
    if (key === 'fortnite') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-xs sm:text-sm tracking-wider text-white uppercase italic">
                    FORTNITE
                </span>
            </div>
        );
    }

    // 9. ROBLOX
    if (key === 'roblox') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-black text-xs sm:text-sm tracking-widest text-red-500 uppercase font-mono">
                    ROBLOX
                </span>
            </div>
        );
    }

    // 10. ELDEN RING
    if (key === 'eldenring') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-serif text-[10px] sm:text-xs tracking-[0.2em] text-[#d4af37] uppercase">
                    ELDEN RING
                </span>
            </div>
        );
    }

    // 11. FORZA HORIZON 6 / Forza 6
    if (key === 'forzahorizon6' || key === 'forza6') {
        return (
            <div className={`flex flex-col items-center justify-center select-none ${className}`}>
                <span className="font-black italic text-[11px] sm:text-xs text-white tracking-wider">FORZA</span>
                <span className="text-[8px] sm:text-[9px] font-black uppercase text-pink-500 bg-pink-500/10 px-1 rounded tracking-tighter">
                    HORIZON 6
                </span>
            </div>
        );
    }

    // 12. RDR II / RDR2
    if (key === 'rdr2' || key === 'rdrii' || key === 'reddeadredemption2' || key === 'reddeadredemption') {
        return (
            <div className={`flex items-center justify-center gap-0.5 select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-sm sm:text-base text-white tracking-tight">RDR</span>
                <span className="font-['Impact',sans-serif] text-sm sm:text-base text-red-600 tracking-tight">II</span>
            </div>
        );
    }

    // 13. BORDERLANDS 4
    if (key === 'borderlands4' || key === 'borderlands') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-black italic text-[10px] sm:text-xs text-yellow-400 tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    BORDERLANDS<span className="text-white text-xs ml-0.5">4</span>
                </span>
            </div>
        );
    }

    // 14. FC 26
    if (key === 'fc26' || key === 'eafc26' || key === 'fc') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-black italic text-sm sm:text-base text-emerald-400 tracking-wider">
                    FC<span className="text-white ml-0.5">26</span>
                </span>
            </div>
        );
    }

    // 15. OVERWATCH
    if (key === 'overwatch' || key === 'overwatch2') {
        return (
            <div className={`flex items-center justify-center gap-1 select-none ${className}`}>
                <svg className="w-3.5 h-3.5 fill-orange-400 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M12 4a8 8 0 0 0-8 8h3a5 5 0 0 1 10 0h3a8 8 0 0 0-8-8z" />
                </svg>
                <span className="font-['Impact',sans-serif] text-[10px] sm:text-xs tracking-wider text-white uppercase">
                    OVERWATCH
                </span>
            </div>
        );
    }

    // 16. APEX LEGENDS
    if (key === 'apexlegends' || key === 'apex') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-xs sm:text-sm tracking-widest text-white leading-none">
                    APEX
                </span>
                <span className="text-[7px] sm:text-[8px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
                    — LEGENDS —
                </span>
            </div>
        );
    }

    // 17. Bloodborne
    if (key === 'bloodborne') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-serif italic text-xs sm:text-sm text-slate-200 tracking-wide drop-shadow">
                    Bloodborne
                </span>
            </div>
        );
    }

    // 18. Demon's Souls
    if (key === 'demonssouls' || key === 'demonsouls') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-serif text-[11px] sm:text-xs text-slate-300 tracking-wider">
                    Demon&apos;s Souls
                </span>
            </div>
        );
    }

    // 19. DYING LIGHT THE BEAST
    if (key === 'dyinglightthebeast' || key === 'dyinglight') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-[9px] sm:text-[10px] text-white tracking-widest">
                    DYING LIGHT
                </span>
                <span className="text-[7px] font-mono font-bold text-slate-400 tracking-wider">
                    THE BEAST
                </span>
            </div>
        );
    }

    // 20. LORDS OF THE FALLEN
    if (key === 'lordsofthefallen') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-serif text-[9px] sm:text-[10px] text-slate-200 tracking-widest uppercase">
                    LORDS OF THE
                </span>
                <span className="font-serif font-black text-[10px] sm:text-xs text-white tracking-wider">
                    FALLEN
                </span>
            </div>
        );
    }

    // 21. SUBNAUTICA 2
    if (key === 'subnautica2' || key === 'subnautica') {
        return (
            <div className={`flex items-center justify-center gap-0.5 select-none ${className}`}>
                <span className="font-sans font-black text-[9px] sm:text-[10px] text-cyan-400 tracking-widest uppercase">
                    SUBNAUTICA
                </span>
                <span className="font-black text-xs text-orange-500">2</span>
            </div>
        );
    }

    // 22. WINDROSE
    if (key === 'windrose') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <svg className="w-3.5 h-3.5 fill-white mb-0.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2L6 18h12L12 2zm0 4.5l3.5 9.5h-7L12 6.5z" />
                </svg>
                <span className="font-serif text-[9px] sm:text-[10px] tracking-widest text-slate-200 uppercase">
                    WINDROSE
                </span>
            </div>
        );
    }

    // 23. 8 POOL
    if (key === '8pool' || key === '8ballpool') {
        return (
            <div className={`flex items-center justify-center gap-1 select-none ${className}`}>
                <span className="w-4 h-4 rounded-full bg-black border border-white text-[9px] font-black text-white flex items-center justify-center">
                    8
                </span>
                <span className="font-['Impact',sans-serif] text-[11px] sm:text-xs text-amber-400 tracking-wider">
                    POOL
                </span>
            </div>
        );
    }

    // 24. BATTLEFIELD 6
    if (key === 'battlefield6' || key === 'battlefield') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-['Trebuchet_MS',sans-serif] font-black text-[10px] sm:text-xs text-slate-200 tracking-wider uppercase">
                    BATTLEFIELD <span className="text-white text-xs">6</span>
                </span>
            </div>
        );
    }

    // 25. BRAWL STARS
    if (key === 'brawlstars') {
        return (
            <div className={`flex items-center justify-center gap-1 select-none ${className}`}>
                <span className="font-black text-xs text-rose-500 tracking-tight uppercase">
                    BRAWL
                </span>
                <span className="font-black text-xs text-amber-400 uppercase">
                    STARS
                </span>
            </div>
        );
    }

    // 26. CLASH OF CLANS
    if (key === 'clashofclans' || key === 'coc') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-black text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-tighter">
                    CLASH OF
                </span>
                <span className="font-black text-xs text-amber-500 uppercase tracking-tight">
                    CLANS
                </span>
            </div>
        );
    }

    // 27. CLASH ROYALE
    if (key === 'clashroyale' || key === 'cr') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-black text-[9px] sm:text-[10px] text-sky-400 uppercase tracking-tighter">
                    CLASH
                </span>
                <span className="font-black text-xs text-amber-400 uppercase tracking-tight">
                    ROYALE
                </span>
            </div>
        );
    }

    // 28. DEAD BY DAYLIGHT
    if (key === 'deadbydaylight' || key === 'dbd') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-[9px] sm:text-[10px] text-slate-200 tracking-wider">
                    DEAD BY DAYLIGHT
                </span>
                <span className="text-red-500 text-xs font-mono font-black -mt-0.5">
                    ||||
                </span>
            </div>
        );
    }

    // 29. DIABLO II RESURRECTED
    if (key === 'diabloiiresurrected' || key === 'diablo2') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-serif font-black text-xs text-red-500 tracking-widest">
                    DIABLO II
                </span>
                <span className="text-[7px] font-serif tracking-widest text-amber-400 uppercase">
                    RESURRECTED
                </span>
            </div>
        );
    }

    // 30. DIABLO IV
    if (key === 'diabloiv' || key === 'diablo4' || key === 'diablo') {
        return (
            <div className={`flex items-center justify-center gap-1 select-none ${className}`}>
                <span className="font-serif font-black text-xs sm:text-sm text-slate-300 tracking-widest">
                    DIABLO
                </span>
                <span className="font-serif font-black text-xs sm:text-sm text-red-600">
                    IV
                </span>
            </div>
        );
    }

    // 31. FALLOUT 76
    if (key === 'fallout76' || key === 'fallout') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-mono font-black italic text-xs text-yellow-400 tracking-tight border border-yellow-400/40 px-1.5 py-0.5 rounded bg-black/40">
                    Fallout 76
                </span>
            </div>
        );
    }

    // 32. FORZA HORIZON 4
    if (key === 'forzahorizon4' || key === 'forza4') {
        return (
            <div className={`flex flex-col items-center justify-center select-none ${className}`}>
                <span className="font-black italic text-[10px] text-white tracking-wider">FORZA</span>
                <span className="text-[8px] font-black uppercase text-pink-500 bg-pink-500/10 px-1 rounded">
                    HORIZON 4
                </span>
            </div>
        );
    }

    // 33. FORZA HORIZON 5
    if (key === 'forzahorizon5' || key === 'forza5') {
        return (
            <div className={`flex flex-col items-center justify-center select-none ${className}`}>
                <span className="font-black italic text-[10px] text-white tracking-wider">FORZA</span>
                <span className="text-[8px] font-black uppercase text-pink-500 bg-pink-500/10 px-1 rounded">
                    HORIZON 5
                </span>
            </div>
        );
    }

    // 34. HELLDIVERS 2
    if (key === 'helldivers2' || key === 'helldivers') {
        return (
            <div className={`flex flex-col items-center justify-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-[9px] sm:text-[10px] text-yellow-400 tracking-widest">
                    HELLDIVERS
                </span>
                <span className="font-['Impact',sans-serif] text-xs text-white">
                    II
                </span>
            </div>
        );
    }

    // 35. LEAGUE OF LEGENDS
    if (key === 'leagueoflegends' || key === 'lol') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-serif font-black text-[9px] sm:text-[10px] text-amber-300 tracking-widest uppercase">
                    LEAGUE OF
                </span>
                <span className="font-serif font-black text-[10px] sm:text-xs text-amber-400 tracking-wider uppercase">
                    LEGENDS
                </span>
            </div>
        );
    }

    // 36. MARVEL RIVALS
    if (key === 'marvelrivals') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-[8px] bg-red-600 text-white px-1 tracking-wider uppercase">
                    MARVEL
                </span>
                <span className="font-['Impact',sans-serif] text-xs text-white tracking-wider uppercase mt-0.5">
                    RIVALS
                </span>
            </div>
        );
    }

    // 37. NO REST FOR THE WICKED
    if (key === 'norestforthewicked') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-serif text-[8px] text-amber-300 tracking-widest uppercase">
                    NO REST
                </span>
                <span className="font-serif text-[9px] text-amber-400 font-bold tracking-wider uppercase">
                    FOR THE WICKED
                </span>
            </div>
        );
    }

    // 38. POKÉMON GO
    if (key === 'pokemongo') {
        return (
            <div className={`flex items-center justify-center gap-1 select-none ${className}`}>
                <span className="font-black text-xs text-amber-400 tracking-tight">
                    Pokémon
                </span>
                <span className="font-black text-xs text-sky-400">
                    GO
                </span>
            </div>
        );
    }

    // 39. PSN AVATARS
    if (key === 'psnavatars') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-[10px] mb-0.5">
                    😎
                </div>
                <span className="font-mono text-[8px] text-slate-300 font-bold uppercase">
                    PSN AVATARS
                </span>
            </div>
        );
    }

    // 40. PSN TROPHIES
    if (key === 'psntrophies') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <svg className="w-4 h-4 fill-slate-300 mb-0.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1c1.9-.44 3.39-2 3.61-3.96C19.08 11.63 21 9.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                </svg>
                <span className="font-mono text-[8px] text-slate-300 font-bold uppercase">
                    PSN TROPHIES
                </span>
            </div>
        );
    }

    // 41. RAINBOW 6 SIEGE
    if (key === 'rainbow6siege' || key === 'rainbowsixsiege' || key === 'r6') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-[9px] text-orange-500 tracking-wider">
                    RAINBOW 6
                </span>
                <span className="font-['Impact',sans-serif] text-xs text-white tracking-widest uppercase">
                    SIEGE
                </span>
            </div>
        );
    }

    // 42. ROCKET LEAGUE
    if (key === 'rocketleague') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-black italic text-[9px] text-sky-400 tracking-tight uppercase">
                    ROCKET
                </span>
                <span className="font-black italic text-xs text-white tracking-tight uppercase -mt-0.5">
                    LEAGUE
                </span>
            </div>
        );
    }

    // 43. SPACE MARINE 2
    if (key === 'spacemarine2' || key === 'spacemarine') {
        return (
            <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
                <span className="font-serif text-[8px] text-slate-400 tracking-widest uppercase">
                    WARHAMMER
                </span>
                <span className="font-['Impact',sans-serif] text-[10px] text-slate-200 tracking-wider uppercase">
                    SPACE MARINE
                </span>
            </div>
        );
    }

    // 44. CS2 / COUNTER-STRIKE 2
    if (key === 'cs2' || key === 'counterstrike2' || key === 'counterstrike') {
        return (
            <div className={`flex items-center justify-center select-none ${className}`}>
                <span className="font-['Impact',sans-serif] text-base sm:text-lg text-amber-400 tracking-widest px-2 py-0.5 border border-amber-400/30 rounded bg-black/40">
                    CS2
                </span>
            </div>
        );
    }

    // Custom game with provided imageUrl
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className={`max-h-full max-w-full object-contain filter drop-shadow transition-transform duration-150 group-hover:scale-105 ${className}`}
            />
        );
    }

    // Clean Fallback for any arbitrary added title
    const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
            <span className="display-font text-sm sm:text-base text-[#9d7cff] font-bold">
                {initials}
            </span>
            <span className="text-[8px] font-mono text-slate-400 truncate max-w-[80px]">
                {name}
            </span>
        </div>
    );
}

export default memo(GameLogo);

