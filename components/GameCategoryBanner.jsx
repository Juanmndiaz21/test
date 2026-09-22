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
            className="relative overflow-hidden rounded-3xl bg-[#171229] border border-[#9d7cff]/20 p-6 sm:p-10 md:p-12 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
            {/* Ambient violet glow on the top-left matching page design system */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#9d7cff]/20 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_8%_15%,rgba(157,124,255,0.18),transparent_65%)]"
            />

            {/* Optional faded artwork in background */}
            {imageUrl && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -bottom-10 w-96 h-96 opacity-10 blur-sm rounded-full overflow-hidden mix-blend-screen"
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
                {/* Top Row: Breadcrumbs & Admin Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    {/* Breadcrumbs: Home / {game} */}
                    <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm font-medium">
                        <Link
                            href="/store"
                            className="text-slate-400 hover:text-[#9d7cff] transition-colors"
                        >
                            {t('home')}
                        </Link>
                        <span className="mx-2 text-slate-600 select-none">/</span>
                        <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
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
                <h1 className="display-font text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-none text-white">
                    <span className="text-[#9d7cff] font-black">
                        {game}
                    </span>{' '}
                    <span className="font-extrabold text-white">
                        {t('boostingServices')}
                    </span>
                </h1>

                {/* Dynamic Subtitle */}
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed font-normal">
                    {t('bannerSubtitle', { count, game })}
                </p>

                {/* Trust / Value Proposition Badges */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-7 pt-6 border-t border-white/5 text-xs sm:text-sm text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                        <RiTimeLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#9d7cff] shrink-0" />
                        <span>{t('instantDelivery')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <RiShieldCheckLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#9d7cff] shrink-0" />
                        <span>{t('orderProtected')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <RiCoinsLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#9d7cff] shrink-0" />
                        <span>{t('moneyBackGuarantee')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
