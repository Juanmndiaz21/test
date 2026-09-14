'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import AddGameForm from './AddGameForm';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

function getInitials(game) {
    return game.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

export default function ProductList({ products, games: catalogGames = [] }) {
    const t = useTranslations('store');
    const [activeLetter, setActiveLetter] = useState('ALL');

    if ((!products || products.length === 0) && catalogGames.length === 0) {
        return (
            <div className="panel-surface text-center py-20 rounded-2xl">
                <p className="eyebrow mb-3">{t('catalogInProgress')}</p>
                <p className="text-slate-300 text-lg mb-2">{t('noServicesPublished')}</p>
                <p className="text-sm text-slate-400">{t('addProductsFromAdmin')}</p>
            </div>
        );
    }

    const groupedGames = (products || []).reduce((groups, product) => {
        const game = product.game || 'General';
        if (!groups[game]) groups[game] = [];
        groups[game].push(product);
        return groups;
    }, {});

    const gameImages = {};
    catalogGames.forEach(({ name, image_url: imageUrl }) => {
        gameImages[name] = imageUrl;
        if (!groupedGames[name]) groupedGames[name] = [];
    });

    const games = Object.entries(groupedGames).sort(([firstGame], [secondGame]) => firstGame.localeCompare(secondGame));
    const visibleGames = games.filter(([game]) => {
        if (activeLetter === 'ALL') return true;
        if (activeLetter === '#') return !/[A-Z]/i.test(game[0]);
        return game.toUpperCase().startsWith(activeLetter);
    });
    return (
        <section>
            <AddGameForm />
            <div className="panel-surface rounded-2xl p-4 md:p-5 mb-14 flex flex-col md:flex-row md:items-center gap-4">
                <span className="eyebrow md:w-32 shrink-0">{t('jumpTo')}</span>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setActiveLetter('ALL')} className={`h-9 min-w-9 px-3 rounded-lg border text-xs font-bold transition-colors ${activeLetter === 'ALL' ? 'bg-lime-300 text-black border-lime-300' : 'border-white/10 text-slate-400 hover:border-lime-300/50 hover:text-white'}`}>{t('all')}</button>
                    {alphabet.map((letter) => {
                        const enabled = games.some(([game]) => letter === '#' ? !/[A-Z]/i.test(game[0]) : game.toUpperCase().startsWith(letter));
                        return <button key={letter} type="button" disabled={!enabled} onClick={() => setActiveLetter(letter)} className={`h-9 min-w-9 px-2 rounded-lg border text-xs font-bold transition-colors ${activeLetter === letter ? 'bg-lime-300 text-black border-lime-300' : enabled ? 'border-white/10 text-slate-400 hover:border-lime-300/50 hover:text-white' : 'border-white/5 text-slate-700 cursor-not-allowed'}`}>{letter}</button>;
                    })}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6"><h2 className="display-font text-3xl uppercase text-white">{t('featured')}</h2><div className="h-px bg-white/10 flex-1" /></div>
            {visibleGames.length === 0 ? <p className="text-slate-400 py-10">{t('noGamesLetter')}</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {visibleGames.map(([game, gameProducts]) => (
                        <Link key={game} href={`/store/game/${encodeURIComponent(game)}`} className="text-left group panel-surface rounded-2xl p-4 min-h-28 transition-all hover:border-lime-300/50">
                            <div className="flex items-center gap-4">
                                {gameImages[game] ? <img src={gameImages[game]} alt={game} className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-lime-300/50" /> : <span className="w-12 h-12 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-xs font-black text-lime-300 group-hover:border-lime-300/50">{getInitials(game)}</span>}
                                <span className="min-w-0 flex-1"><strong className="block text-white text-lg leading-tight truncate">{game}</strong><small className="block text-slate-400 uppercase tracking-wider mt-2">{t('serviceCount', { count: gameProducts.length })}</small></span>
                                <span className="w-9 h-9 rounded-full border border-lime-300/40 text-lime-300 flex items-center justify-center group-hover:bg-lime-300 group-hover:text-black transition-colors">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </section>
    );
}