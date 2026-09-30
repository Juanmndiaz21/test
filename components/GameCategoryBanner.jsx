'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RiTimeLine, RiShieldCheckLine, RiCoinsLine } from 'react-icons/ri';
import AdminActionLink from './AdminActionLink';
import EditGameButton from './EditGameButton';
import DeleteGameButton from './DeleteGameButton';

export default function GameCategoryBanner({ game, count = 0, imageUrl = null, gameMode = 'both' }) {
    const t = useTranslations('gamePage');

    return (
        <section
            aria-label={`${game} banner`}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1430] via-[#140e24] to-[#0f0a1a] border border-[#9d7cff]/25 p-7 sm:p-10 md:p-14 mb-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
            {/* Deep Ambient Atmospheric Glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#9d7cff]/22 blur-[100px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-[#7928ca]/15 blur-[90px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_75%_at_10%_20%,rgba(157,124,255,0.18),transparent_70%)]"
            />

            {/* Faded Game Artwork Silhouette in background */}
            {imageUrl && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -bottom-12 w-[420px] h-[420px] opacity-15 blur-[1px] rounded-full overflow-hidden mix-blend-screen select-none pointer-events-none"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="relative z-10">
                {/* Top Row: Breadcrumbs & Admin Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm font-medium">
                        <Link
                            href="/store"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            {t('home')}
                        </Link>
                        <span className="mx-2.5 text-slate-600 select-none">/</span>
                        <span className="text-[#9d7cff] font-bold truncate max-w-[200px] sm:max-w-none">
                            {game}
                        </span>
                    </nav>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <AdminActionLink game={game} />
                        <EditGameButton game={{ name: game, image_url: imageUrl, mode: gameMode }} />
                        <DeleteGameButton game={game} />
                    </div>
                </div>

                {/* Main Heading: {Game} Boosting Services */}
                <h1 className="display-font text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight leading-none text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
                    <span className="text-[#9d7cff] font-black">
                        {game}
                    </span>{' '}
                    <span className="font-extrabold text-white">
                        {t('boostingServices')}
                    </span>
                </h1>

                {/* Dynamic Subtitle */}
                <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mt-4 leading-relaxed font-normal">
                    {t('bannerSubtitle', { count, game })}
                </p>

                {/* Trust / Value Proposition Badges */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-8 pt-7 border-t border-white/10 text-xs sm:text-sm text-slate-200">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
                        <RiTimeLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#9d7cff] shrink-0" />
                        <span className="font-medium">{t('instantDelivery')}</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
                        <RiShieldCheckLine className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                        <span className="font-medium">{t('orderProtected')}</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
                        <RiCoinsLine className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                        <span className="font-medium">{t('moneyBackGuarantee')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
