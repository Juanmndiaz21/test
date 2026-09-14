'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import GameArt from './GameArt';
import Icon from './Icon';

export default function LandingCatalog({ games }) {
    const t = useTranslations('landingCatalog');
    const list = games ?? [];
    const [query, setQuery] = useState('');

    const modeLabel = (mode) => {
        if (mode === 'both') return t('modeBoth');
        if (mode === 'multiplayer') return t('modeMultiplayer');
        if (mode === 'singleplayer') return t('modeSingleplayer');
        return t('modeAll');
    };

    const filtered = list.filter((game) => {
        const text = query.trim().toLowerCase();
        if (text === '') return true;
        return game.name.toLowerCase().includes(text);
    });

    return (
        <section aria-label={t('findGameAria')} className="max-w-7xl mx-auto px-5 py-16 md:py-20">
            <div className="max-w-2xl mx-auto">
                <label htmlFor="landing-search" className="sr-only">{t('searchLabel')}</label>
                <div className="relative">
                    <input
                        id="landing-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl pl-5 pr-14 py-5 data-readout text-base uppercase tracking-wider text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-300 transition-colors"
                    />
                    <Icon name="search" className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="panel-surface rounded-2xl text-center py-16 mt-14">
                    <p className="eyebrow mb-3">{t('noResults')}</p>
                    <p className="text-sm text-slate-400">{t('noGamesMatch', { query: query.trim() })}</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-10 mt-14">
                        <h2 className="display-font text-4xl md:text-5xl uppercase text-white">{t('popularTitle')}</h2>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((game, index) => (
                            <Link
                                key={game.name}
                                href={`/store/game/${encodeURIComponent(game.name)}`}
                                className="animate-ladder-row group panel-surface rounded-2xl overflow-hidden block hover:border-lime-300/70 hover:scale-[1.02] transition-all"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                <div className="relative">
                                    <GameArt name={game.name} image_url={game.image_url} className="w-full aspect-video" />
                                    <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center justify-center h-9 w-9 rounded-full bg-lime-300 text-black opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                        <Icon name="arrow-up-right" className="w-4 h-4" strokeWidth={2.5} />
                                    </span>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-black text-white leading-tight line-clamp-1">{game.name}</h3>
                                    <p className="text-sm text-slate-400 mt-2 group-hover:text-lime-300 transition-colors">
                                        {t('serviceCount', { count: game.services })} · {modeLabel(game.mode)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 mb-10 mt-16">
                        <h2 className="display-font text-4xl md:text-5xl uppercase text-white">{t('browseAllTitle')}</h2>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {filtered.map((game) => (
                            <Link
                                key={game.name}
                                href={`/store/game/${encodeURIComponent(game.name)}`}
                                className="group panel-surface rounded-2xl overflow-hidden relative block aspect-square hover:border-lime-300/70 hover:scale-[1.03] transition-all"
                            >
                                <GameArt name={game.name} image_url={game.image_url} className="w-full h-full" />
                                <span className="pointer-events-none absolute left-1/2 bottom-3 -translate-x-1/2 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all inline-flex items-center gap-1.5 rounded-lg bg-lime-300 px-3.5 py-1.5 shadow-lg shadow-lime-300/25 whitespace-nowrap">
                                    <Icon name="box" className="w-3 h-3" strokeWidth={2.4} />
                                    <strong className="data-readout text-xs font-black text-black uppercase tracking-wider">
                                        {t('productCount', { count: game.services })}
                                    </strong>
                                </span>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}