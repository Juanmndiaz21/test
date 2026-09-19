'use client';

import { useState, useMemo, useDeferredValue } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import AddGameForm from './AddGameForm';
import GameLogo from './GameLogo';
import Icon from './Icon';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

export default function ProductList({ products, games: catalogGames = [] }) {
    const t = useTranslations('store');
    const [searchQuery, setSearchQuery] = useState('');
    const deferredQuery = useDeferredValue(searchQuery);
    const [activeLetter, setActiveLetter] = useState('ALL');

    const { games, gameImages } = useMemo(() => {
        const grouped = (products || []).reduce((groups, product) => {
            const game = product.game || 'General';
            if (!groups[game]) groups[game] = [];
            groups[game].push(product);
            return groups;
        }, {});

        const images = {};
        catalogGames.forEach(({ name, image_url: imageUrl }) => {
            images[name] = imageUrl;
            if (!grouped[name]) grouped[name] = [];
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
                        className="w-full bg-[#171229] border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-['Trebuchet_MS',sans-serif] text-white placeholder:text-slate-400 focus:border-[#9d7cff] focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-2 transition-colors shadow-inner"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Icon name="search" className="w-4 h-4" />
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label={t('clearSearch')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#9d7cff] cursor-pointer"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Jump To Letter Filter */}
            <div className="panel-surface rounded-2xl p-4 md:p-5 mb-10 flex flex-col md:flex-row md:items-center gap-4 border border-white/10 bg-[#171229]">
                <span className="eyebrow md:w-32 shrink-0 text-slate-300">{t('jumpTo')}</span>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveLetter('ALL')}
                        className={`min-h-[36px] min-w-[36px] px-3.5 rounded-lg border text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9d7cff] ${
                            activeLetter === 'ALL'
                                ? 'bg-[#9d7cff] text-[#0d0914] border-[#9d7cff] font-black'
                                : 'border-white/10 text-slate-300 hover:border-[#9d7cff]/50 hover:text-white bg-white/5'
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
                                className={`min-h-[36px] min-w-[36px] px-2.5 rounded-lg border text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#9d7cff] ${
                                    activeLetter === letter
                                        ? 'bg-[#9d7cff] text-[#0d0914] border-[#9d7cff] font-black cursor-pointer'
                                        : enabled
                                        ? 'border-white/10 text-slate-300 hover:border-[#9d7cff]/50 hover:text-white bg-white/5 cursor-pointer'
                                        : 'border-white/5 text-slate-600 bg-white/[0.02] cursor-not-allowed opacity-40'
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
                    <span className="data-readout text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {visibleGames.length}
                    </span>
                </div>
                <div className="h-px bg-white/10 flex-1 hidden sm:block" />
            </div>

            {/* Game Grid or Empty State */}
            {visibleGames.length === 0 ? (
                <div className="panel-surface rounded-2xl text-center py-16 border border-white/10 bg-[#171229]">
                    <p className="text-base text-slate-300 mb-2">
                        {searchQuery ? t('noGamesMatch', { query: searchQuery.trim() }) : t('noGamesLetter')}
                    </p>
                    {(searchQuery || activeLetter !== 'ALL') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveLetter('ALL');
                            }}
                            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:border-[#9d7cff] hover:text-[#9d7cff] text-xs font-mono font-bold tracking-wider text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#9d7cff] cursor-pointer"
                        >
                            <Icon name="x" className="w-3.5 h-3.5" />
                            <span>{t('clearSearch')}</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {visibleGames.map(([game, gameProducts], index) => (
                        <Link
                            key={game}
                            href={`/store/game/${encodeURIComponent(game)}`}
                            className="animate-ladder-row text-left group relative overflow-hidden panel-surface rounded-2xl p-4.5 border border-white/10 bg-[#171229] transition-all duration-200 hover:border-[#9d7cff]/60 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.4)] focus-visible:outline-2 focus-visible:outline-[#9d7cff] focus-visible:outline-offset-[-2px]"
                            style={{ animationDelay: `${index * 25}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#14101e] border border-white/10 p-1 flex items-center justify-center shrink-0 group-hover:border-[#9d7cff]/50 transition-colors">
                                    <GameLogo name={game} imageUrl={gameImages[game]} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <strong className="block text-white text-base font-bold leading-tight truncate group-hover:text-[#9d7cff] transition-colors">
                                        {game}
                                    </strong>
                                    <span className="block text-slate-400 uppercase tracking-wider mt-1.5 inline-flex items-center gap-1.5 text-xs font-mono">
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#9d7cff]" aria-hidden="true" />
                                        <span className="data-readout">{t('serviceCount', { count: gameProducts.length })}</span>
                                    </span>
                                </div>
                                <span className="w-8 h-8 rounded-full border border-white/15 bg-white/5 text-slate-300 flex items-center justify-center group-hover:bg-[#9d7cff] group-hover:text-[#0d0914] group-hover:border-[#9d7cff] group-hover:scale-105 transition-all duration-150 shrink-0">
                                    <Icon name="arrow-right" className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}