'use client';
import { useState, useMemo, useDeferredValue, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import GameArt from './GameArt';
import GameLogo from './GameLogo';
import Icon from './Icon';

const PopularGameCard = memo(function PopularGameCard({ game, index, t }) {
    const isLeader = index === 0;

    return (
        <Link
            href={`/store/game/${encodeURIComponent(game.name)}`}
            className="animate-ladder-row group relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#171229] block transition-all duration-200 ease-out hover:border-[#9d7cff]/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2 motion-reduce:transition-none select-none"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Game Artwork */}
            <div className="w-full h-full overflow-hidden bg-black/40">
                <GameArt
                    name={game.name}
                    image_url={game.image_url}
                    priority={index < 2}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Tonal Dark Gradient Scrim for Contrast Floor */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0914] via-[#0d0914]/60 to-transparent transition-opacity duration-200 ease-out group-hover:via-[#0d0914]/75 z-10" />

            {/* Standings Rank Badge */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md text-xs font-mono font-bold shadow-sm transition-colors duration-200 ${
                    isLeader
                        ? 'bg-black/85 border border-[#9d7cff]/50 text-[#9d7cff]'
                        : 'bg-black/80 border border-white/15 text-slate-300 group-hover:border-white/30 group-hover:text-white'
                }`}>
                    <Icon name="crown" className={`w-3.5 h-3.5 ${isLeader ? 'text-[#9d7cff]' : 'text-slate-400'}`} />
                    <span className="data-readout">#{index + 1}</span>
                </span>
            </div>

            {/* Card Content & Action Target */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-20 flex flex-col justify-end">
                <h3 className="display-font text-2xl sm:text-3xl uppercase text-white leading-tight tracking-wide group-hover:text-[#9d7cff] transition-colors duration-150 line-clamp-1">
                    {game.name}
                </h3>

                <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-300 group-hover:text-white transition-colors duration-150 inline-flex items-center gap-2">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                            {isLeader ? (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9d7cff]/80 motion-reduce:hidden" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9d7cff]" />
                                </>
                            ) : (
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9d7cff]/80" />
                            )}
                        </span>
                        <span className="data-readout">{t('serviceCount', { count: game.services })}</span>
                    </span>

                    {/* Action Target: Immediate 150ms Acknowledgment on Hover & Focus */}
                    <span className="w-8 h-8 rounded-full border border-white/15 bg-white/5 text-white flex items-center justify-center font-bold transition-all duration-150 ease-out group-hover:bg-[#9d7cff] group-hover:text-[#0d0914] group-hover:border-[#9d7cff] motion-reduce:transition-none">
                        <Icon name="arrow-up-right" className="w-4 h-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" strokeWidth={2.4} />
                    </span>
                </div>
            </div>
        </Link>
    );
});

const REFERENCE_IMAGE_ORDER = [
    'gta v', 'gta', 'arc raiders', 'cod', 'bo7', 'bo2', 'bo1', 'mw4', 'fortnite', 'roblox', 'elden ring',
    'forza horizon 6', 'forza 6', 'rdr2', 'rdr ii', 'borderlands 4', 'fc 26', 'overwatch', 'apex legends',
    'bloodborne', "demon's souls", 'dying light the beast', 'lords of the fallen', 'subnautica 2', 'windrose',
    '8 pool', 'battlefield 6', 'brawl stars', 'clash of clans', 'clash royale', 'dead by daylight',
    'diablo ii resurrected', 'diablo iv', 'fallout 76', 'forza horizon 4', 'forza horizon 5',
    'helldivers 2', 'league of legends', 'marvel rivals', 'no rest for the wicked', 'pokémon go',
    'psn avatars', 'psn trophies', 'rainbow 6 siege', 'rocket league', 'space marine 2', 'cs2'
];

export default function LandingCatalog({ games }) {
    const t = useTranslations('landingCatalog');
    const list = games ?? [];
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [selectedMode, setSelectedMode] = useState('all');

    const isSearching = deferredQuery.trim().length > 0;

    const modeLabel = useCallback((mode) => {
        if (mode === 'both') return t('modeBoth');
        if (mode === 'multiplayer') return t('modeMultiplayer');
        if (mode === 'singleplayer') return t('modeSingleplayer');
        return t('modeAll');
    }, [t]);

    const filtered = useMemo(() => {
        const text = deferredQuery.trim().toLowerCase();
        if (!text) return list;
        return list.filter((game) => game.name.toLowerCase().includes(text));
    }, [list, deferredQuery]);

    const browseFiltered = useMemo(() => {
        let result = selectedMode === 'all'
            ? filtered
            : filtered.filter((game) => game.mode === selectedMode || game.mode === 'both');

        if (!isSearching) {
            result = [...result].sort((a, b) => {
                const indexA = REFERENCE_IMAGE_ORDER.indexOf(a.name.toLowerCase());
                const indexB = REFERENCE_IMAGE_ORDER.indexOf(b.name.toLowerCase());
                const posA = indexA === -1 ? 999 : indexA;
                const posB = indexB === -1 ? 999 : indexB;
                return posA - posB;
            });
        }

        return result;
    }, [filtered, selectedMode, isSearching]);

    const popularGames = useMemo(() => {
        return list.slice(0, 4);
    }, [list]);

    const modeOptions = useMemo(() => [
        { key: 'all', label: t('modeAll') },
        { key: 'multiplayer', label: t('modeMultiplayer') },
        { key: 'singleplayer', label: t('modeSingleplayer') },
    ], [t]);

    const handleClearSearch = useCallback(() => {
        setQuery('');
        setSelectedMode('all');
    }, []);

    return (
        <section aria-label={t('findGameAria')} className="max-w-7xl mx-auto px-5 py-16 md:py-20">
            {/* Search Bar with WCAG AA Contrast and Explicit Focus Visible */}
            <div className="max-w-2xl mx-auto">
                <label htmlFor="landing-search" className="sr-only">{t('searchLabel')}</label>
                <div className="relative">
                    <input
                        id="landing-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') setQuery('');
                        }}
                        placeholder={t('searchPlaceholder')}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl pl-5 pr-14 py-4 data-readout text-base uppercase tracking-wider text-white placeholder:text-slate-400 focus:border-[#9d7cff] focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2 transition-colors"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label={t('clearSearch')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#9d7cff] transition-colors cursor-pointer"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    ) : (
                        <Icon name="search" className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    )}
                </div>
            </div>

            {filtered.length === 0 ? (
                /* Actionable Empty State */
                <div className="panel-surface rounded-2xl text-center py-16 mt-14 border border-white/10 bg-[#171229]">
                    <p className="eyebrow mb-3 text-slate-300">{t('noResults')}</p>
                    <p className="text-sm text-slate-400 mb-6">{t('noGamesMatch', { query: query.trim() })}</p>
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:border-[#9d7cff] hover:text-[#9d7cff] text-xs font-mono font-bold tracking-wider text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#9d7cff] cursor-pointer"
                    >
                        <span>{t('clearSearch')}</span>
                    </button>
                </div>
            ) : (
                <>
                    {/* Featured Leaderboard: Shown when not in an active search query */}
                    {!isSearching && popularGames.length > 0 && (
                        <>
                            <div className="flex items-center gap-4 mb-8 mt-14">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                                        <Icon name="crown" className="w-5 h-5" />
                                    </span>
                                    <h2 className="display-font text-3xl md:text-4xl uppercase text-white">{t('popularTitle')}</h2>
                                </div>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {popularGames.map((game, index) => (
                                    <PopularGameCard
                                        key={game.name}
                                        game={game}
                                        index={index}
                                        t={t}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Standings Leaderboard: Authentic Plum Panel of Hairline List Rows */}
                    <div className={!isSearching ? 'mt-20' : 'mt-14'}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                                    <Icon name="gamepad" className="w-5 h-5" />
                                </span>
                                <div className="flex items-center gap-3">
                                    <h2 className="display-font text-3xl md:text-4xl uppercase text-white">{t('browseAllTitle')}</h2>
                                    <span className="data-readout text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                        {browseFiltered.length}
                                    </span>
                                </div>
                            </div>

                            {/* Mode Filter Tablist with 40px+ Touch Target & ARIA States */}
                            <div
                                role="tablist"
                                aria-label="Filter games by mode"
                                className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm self-start md:self-auto"
                            >
                                {modeOptions.map((opt) => {
                                    const active = selectedMode === opt.key;
                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            aria-pressed={active}
                                            onClick={() => setSelectedMode(opt.key)}
                                            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-1 ${
                                                active
                                                    ? 'bg-[#9d7cff] text-[#0d0914] shadow-sm font-black'
                                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {browseFiltered.length === 0 ? (
                            <div className="panel-surface rounded-2xl text-center py-12 border border-white/10 bg-[#171229]">
                                <p className="text-sm text-slate-400 mb-4">{t('noResults')}</p>
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-slate-300 hover:text-[#9d7cff] hover:border-[#9d7cff]/40 transition-colors cursor-pointer"
                                >
                                    <span>{t('clearSearch')}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-2.5 sm:gap-3 md:gap-3.5">
                                {browseFiltered.map((game) => (
                                    <Link
                                        key={game.name}
                                        href={`/store/game/${encodeURIComponent(game.name)}`}
                                        title={game.name}
                                        aria-label={game.name}
                                        className="group relative aspect-[1.12/1] sm:aspect-square rounded-xl sm:rounded-2xl border border-white/10 bg-[#161224] hover:bg-[#1f1833] hover:border-[#9d7cff]/70 flex items-center justify-center p-2.5 sm:p-3 md:p-3.5 transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2 select-none overflow-hidden"
                                    >
                                        <GameLogo name={game.name} imageUrl={game.image_url} />
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Full Catalog Navigation Target */}
                        <div className="mt-10 flex justify-center">
                            <Link
                                href="/store"
                                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-[#9d7cff] hover:border-[#9d7cff] hover:text-[#0d0914] font-['Trebuchet_MS',sans-serif] text-xs font-black uppercase tracking-wider text-white transition-all duration-200 group focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2"
                            >
                                <span>{t('viewAllCatalog')}</span>
                                <Icon name="arrow-right" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}