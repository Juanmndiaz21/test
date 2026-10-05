'use client';

import { useState, useMemo, useDeferredValue, memo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import { gameToSlug } from '@/lib/gameSlugs';
import AddGameForm from './AddGameForm';
import GameLogo from './GameLogo';
import Icon from './Icon';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

const GameCardItem = memo(function GameCardItem({ game, gameProducts, image, t, index }) {
    // Stagger capped at 10 items (300ms max) to ensure snappiness
    const staggerDelay = Math.min(index, 10) * 30;

    return (
        <div
            className="animate-ladder-row h-full"
            style={{ animationDelay: `${staggerDelay}ms` }}
        >
            <Link
                href={`/store/game/${gameToSlug(game)}`}
                className="h-full flex items-center justify-between text-left group relative overflow-hidden panel-surface rounded-2xl p-4.5 border border-white/10 bg-zinc-900/60 transition-[border-color,box-shadow,background-color,transform] duration-160 ease-[var(--ease-out)] hover:border-[#9225CF]/50 hover:bg-zinc-900/90 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-[0.985] active:duration-100 focus-visible:outline-2 focus-visible:outline-[#9225CF] focus-visible:outline-offset-[-2px] select-none cursor-pointer"
            >
                <div className="flex items-center gap-4 min-w-0 flex-1 mr-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 p-1 flex items-center justify-center shrink-0 group-hover:border-[#9225CF]/40 group-hover:bg-zinc-900 transition-[border-color,background-color] duration-160 ease-[var(--ease-out)]">
                        <GameLogo name={game} imageUrl={image} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <strong className="block text-white text-base font-bold leading-tight truncate group-hover:text-purple-300 transition-colors duration-140">
                            {game}
                        </strong>
                        <span className="block text-zinc-400 uppercase tracking-wider mt-1.5 inline-flex items-center gap-2 text-xs font-mono">
                            <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-40 duration-1000" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-400" />
                            </span>
                            <span className="data-readout">{t('serviceCount', { count: gameProducts.length })}</span>
                        </span>
                    </div>
                </div>
                <span className="w-8 h-8 rounded-full border border-white/15 bg-white/5 text-zinc-300 flex items-center justify-center group-hover:bg-[#9225CF] group-hover:text-white group-hover:border-[#9225CF] group-active:scale-95 transition-[background-color,border-color,color,transform] duration-140 ease-[var(--ease-out)] shrink-0">
                    <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform duration-140 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
                </span>
            </Link>
        </div>
    );
});

export default function ProductList({ products, games: catalogGames = [] }) {
    const t = useTranslations('store');
    const [searchQuery, setSearchQuery] = useState('');
    const deferredQuery = useDeferredValue(searchQuery);
    const [activeLetter, setActiveLetter] = useState('ALL');

    const { games, gameImages } = useMemo(() => {
        const catalogMap = new Map();
        catalogGames.forEach(({ name, image_url: imageUrl }) => {
            catalogMap.set(name.toLowerCase(), { canonicalName: name, imageUrl });
        });

        const grouped = {};
        const images = {};

        // Pre-populate with all registered catalog games so empty ones still appear with their official art
        catalogGames.forEach(({ name, image_url: imageUrl }) => {
            grouped[name] = [];
            images[name] = imageUrl;
        });

        // Group products into canonical game names case-insensitively
        (products || []).forEach((product) => {
            const rawGame = (product.game || 'General').trim();
            const lower = rawGame.toLowerCase();
            const matched = catalogMap.get(lower);
            const targetName = matched ? matched.canonicalName : rawGame;

            if (!grouped[targetName]) {
                grouped[targetName] = [];
            }
            if (matched && !images[targetName]) {
                images[targetName] = matched.imageUrl;
            }
            grouped[targetName].push(product);
        });

        const sortedGames = Object.entries(grouped).sort(([firstGame], [secondGame]) =>
            firstGame.localeCompare(secondGame)
        );

        return { games: sortedGames, gameImages: images };
    }, [products, catalogGames]);

    const visibleGames = useMemo(() => {
        const queryClean = deferredQuery.trim().toLowerCase();

        return games.filter(([game]) => {
            // Text search filter
            if (queryClean && !game.toLowerCase().includes(queryClean)) {
                return false;
            }

            // Letter filter
            if (activeLetter === 'ALL') return true;
            if (activeLetter === '#') return !/[A-Z]/i.test(game[0]);
            return game.toUpperCase().startsWith(activeLetter);
        });
    }, [games, deferredQuery, activeLetter]);

    if ((!products || products.length === 0) && catalogGames.length === 0) {
        return (
            <div className="panel-surface text-center py-20 rounded-2xl">
                <p className="eyebrow mb-3 text-slate-300">{t('catalogInProgress')}</p>
                <p className="text-slate-300 text-lg mb-2">{t('noServicesPublished')}</p>
                <p className="text-sm text-slate-400">{t('addProductsFromAdmin')}</p>
            </div>
        );
    }

    return (
        <section>
            <AddGameForm />

            {/* Dedicated Search Bar */}
            <div className="mb-6 relative">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setSearchQuery('');
                        }}
                        placeholder={t('searchPlaceholder')}
                        aria-label={t('searchLabel')}
                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-['Trebuchet_MS',sans-serif] text-white placeholder:text-zinc-500 focus:border-[#9225CF]/60 focus-visible:outline-2 focus-visible:outline-[#9225CF] focus-visible:outline-offset-2 transition-[border-color,box-shadow] duration-160 ease-[var(--ease-out)] shadow-inner"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <Icon name="search" className="w-4 h-4" />
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label={t('clearSearch')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition-[color,background-color,transform] duration-140 ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-[#9225CF] cursor-pointer animate-in fade-in zoom-in-90"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Jump To Letter Filter */}
            <div className="panel-surface rounded-2xl p-4 md:p-5 mb-10 flex flex-col md:flex-row md:items-center gap-4 border border-white/10 bg-zinc-900/70">
                <span className="eyebrow md:w-32 shrink-0 text-zinc-300">{t('jumpTo')}</span>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveLetter('ALL')}
                        className={`min-h-[36px] min-w-[36px] px-3.5 rounded-lg border text-xs font-bold transition-[color,background-color,border-color,transform] duration-140 ease-[var(--ease-out)] cursor-pointer active:scale-[0.93] focus-visible:outline-2 focus-visible:outline-[#9225CF] ${
                            activeLetter === 'ALL'
                                ? 'bg-[#9225CF] text-white border-[#9225CF] font-black'
                                : 'border-white/10 text-zinc-300 hover:border-[#9225CF]/50 hover:text-white bg-zinc-900/60'
                        }`}
                    >
                        {t('all')}
                    </button>
                    {alphabet.map((letter) => {
                        const enabled = games.some(([game]) =>
                            letter === '#' ? !/[A-Z]/i.test(game[0]) : game.toUpperCase().startsWith(letter)
                        );
                        return (
                            <button
                                key={letter}
                                type="button"
                                disabled={!enabled}
                                onClick={() => setActiveLetter(letter)}
                                className={`min-h-[36px] min-w-[36px] px-2.5 rounded-lg border text-xs font-bold transition-[color,background-color,border-color,transform] duration-140 ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-[#9225CF] ${
                                    activeLetter === letter
                                        ? 'bg-[#9225CF] text-white border-[#9225CF] font-black cursor-pointer active:scale-[0.93]'
                                        : enabled
                                        ? 'border-white/10 text-zinc-300 hover:border-[#9225CF]/50 hover:text-white bg-zinc-900/60 cursor-pointer active:scale-[0.93]'
                                        : 'border-white/5 text-zinc-600 bg-white/[0.02] cursor-not-allowed opacity-40'
                                }`}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results Title & Count */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="display-font text-3xl uppercase text-white">{t('featured')}</h2>
                    <span
                        key={visibleGames.length}
                        className="data-readout text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 transition-all duration-140 animate-in fade-in zoom-in-95"
                    >
                        {visibleGames.length}
                    </span>
                </div>
                <div className="h-px bg-white/10 flex-1 hidden sm:block" />
            </div>

            {/* Game Grid or Empty State */}
            {visibleGames.length === 0 ? (
                <div className="rounded-2xl text-center py-16 border border-white/10 bg-zinc-900">
                    <p className="text-base text-zinc-300 mb-2">
                        {searchQuery ? t('noGamesMatch', { query: searchQuery.trim() }) : t('noGamesLetter')}
                    </p>
                    {(searchQuery || activeLetter !== 'ALL') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveLetter('ALL');
                            }}
                            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:border-[#9225CF] hover:text-purple-300 text-xs font-mono font-bold tracking-wider text-zinc-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#9225CF] cursor-pointer"
                        >
                            <Icon name="x" className="w-3.5 h-3.5" />
                            <span>{t('clearSearch')}</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-auto">
                    {visibleGames.map(([game, gameProducts], index) => (
                        <GameCardItem
                            key={game}
                            game={game}
                            gameProducts={gameProducts}
                            image={gameImages[game]}
                            t={t}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}