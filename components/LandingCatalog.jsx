'use client';
import { useState, useMemo, useDeferredValue, useCallback, memo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import { gameToSlug } from '@/lib/gameSlugs';
import GameArt from './GameArt';
import GameLogo from './GameLogo';
import Icon from './Icon';

const PopularGameCard = memo(function PopularGameCard({ game, index, t }) {
    const shouldReduceMotion = useReducedMotion();
    const gameSlug = gameToSlug(game.name);

    return (
        <motion.div
            initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(12px)' }}
            whileInView={{ opacity: 1, transform: 'translateY(0)' }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{
                duration: shouldReduceMotion ? 0.15 : 0.25,
                delay: shouldReduceMotion ? 0 : index * 0.04,
                ease: [0.23, 1, 0.32, 1],
            }}
            className="w-full"
        >
            <Link
                href={`/store/game/${gameSlug}`}
                className="group relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 bg-[#141022] block transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-white/25 hover:shadow-lg hover:shadow-black/50 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2 motion-reduce:transition-none select-none"
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

                {/* Gradient Scrim for Readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0914]/90 via-[#0d0914]/30 to-transparent" />

                {/* Content: Title, Services Count & Action Indicator */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="display-font text-xl sm:text-2xl uppercase text-white leading-tight tracking-wide line-clamp-1 group-hover:text-[#9d7cff] transition-colors duration-200">
                            {game.name}
                        </h3>
                        <p className="mt-1 text-xs font-mono text-slate-300">
                            {t('serviceCount', { count: game.services })}
                        </p>
                    </div>

                    <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-slate-300 flex items-center justify-center group-hover:bg-[#9d7cff] group-hover:text-black group-hover:border-[#9d7cff] transition-colors duration-200 shrink-0">
                        <Icon name="arrow-up-right" className="w-4 h-4" strokeWidth={2.2} />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
});

const BrowseGameCard = memo(function BrowseGameCard({ game, t }) {
    return (
        <Link
            href={`/store/game/${gameToSlug(game.name)}`}
            title={game.name}
            aria-label={game.name}
            className="group relative aspect-[1.12/1] sm:aspect-square rounded-xl sm:rounded-2xl border border-white/10 bg-[#161224] hover:bg-[#1f1833] hover:border-[#9d7cff]/80 flex items-center justify-center p-2.5 sm:p-3 md:p-3.5 transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-1 active:scale-[0.97] hover:shadow-[0_12px_28px_rgba(0,0,0,0.7),0_0_20px_rgba(157,124,255,0.25)] focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2 select-none overflow-hidden"
        >
            {/* Background Game Logo (dims and scales smoothly on hover) */}
            <div className="w-full h-full flex items-center justify-center transition-[transform,opacity] duration-200 ease-out group-hover:scale-105 group-hover:opacity-20">
                <GameLogo name={game.name} imageUrl={game.image_url} />
            </div>

            {/* Inside-Card Hover Overlay matching reference design with brand colors */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[#0d0914]/85 backdrop-blur-[2px] p-2 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 ease-out z-10 pointer-events-none select-none">
                <span className="font-['Trebuchet_MS',sans-serif] font-black text-xs text-white uppercase tracking-wider leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2 px-1">
                    {game.name}
                </span>
                <span className="mt-1 sm:mt-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#9d7cff]/25 border border-[#9d7cff]/70 text-white font-mono font-bold text-[11px] uppercase tracking-wider shadow-[0_0_10px_rgba(157,124,255,0.3)]">
                    {t('productCount', { count: game.services || 0 })}
                </span>
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
                            <motion.div
                                initial={{ opacity: 0, transform: 'translateY(10px)' }}
                                whileInView={{ opacity: 1, transform: 'translateY(0)' }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                className="flex items-center gap-4 mb-8 mt-14"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[#9d7cff]">
                                        <Icon name="sparkles" className="w-5 h-5 animate-logo-pulse" />
                                    </span>
                                    <h2 className="display-font text-3xl md:text-4xl uppercase text-white">{t('popularTitle')}</h2>
                                </div>
                                <div className="h-px bg-white/10 flex-1" />
                            </motion.div>
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
                                            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold transition-[background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-1 ${
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
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-2.5 sm:gap-3 md:gap-3.5 pt-4 content-auto">
                                {browseFiltered.map((game) => (
                                    <BrowseGameCard key={game.name} game={game} t={t} />
                                ))}
                            </div>
                        )}

                        {/* Full Catalog Navigation Target */}
                        <div className="mt-10 flex justify-center">
                            <Link
                                href="/store"
                                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-[#9d7cff] hover:border-[#9d7cff] hover:text-[#0d0914] font-['Trebuchet_MS',sans-serif] text-xs font-black uppercase tracking-wider text-white transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.98] group focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2"
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