'use client';

import { useState, useEffect, useTransition, use } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import Icon from '@/components/Icon';
import { trackOrderAction } from './actions';
import { Link } from '@/i18n/navigation';
import { toast } from '@/utils/toast';

export default function TrackOrderPage({ searchParams }) {
    const t = useTranslations('track');
    const resolvedParams = use(searchParams);
    const initialCode = resolvedParams?.code || '';

    const [code, setCode] = useState(initialCode);
    const [result, setResult] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isPending, startTransition] = useTransition();

    const STATUS_STEPS = [
        { key: 'queued', label: t('stepQueued'), sub: t('stepQueuedSub') },
        { key: 'in_progress', label: t('stepInProgress'), sub: t('stepInProgressSub') },
        { key: 'completed', label: t('stepCompleted'), sub: t('stepCompletedSub') },
        { key: 'delivered', label: t('stepDelivered'), sub: t('stepDeliveredSub') },
    ];

    const handleTrack = (searchQuery) => {
        const query = (searchQuery ?? code).trim();
        if (!query) return;

        setError(null);
        setNotFound(false);

        startTransition(async () => {
            const res = await trackOrderAction(query);
            if (res.success && res.order) {
                setResult(res.order);
                setNotFound(false);
            } else if (res.notFound) {
                setResult(null);
                setNotFound(true);
            } else {
                setResult(null);
                setError(res.error || t('notFound'));
            }
        });
    };

    useEffect(() => {
        if (initialCode) {
            handleTrack(initialCode);
        }
    }, [initialCode]);

    const handleCopyCode = () => {
        if (!result?.orderCode) return;
        navigator.clipboard.writeText(result.orderCode);
        setCopied(true);
        toast.success(t('codeCopied'));
        setTimeout(() => setCopied(false), 2500);
    };

    const getStepIndex = (status) => {
        const idx = STATUS_STEPS.findIndex((s) => s.key === status);
        return idx !== -1 ? idx : 0;
    };

    const isCancelled = result?.status === 'cancelled';
    const currentStepIdx = result ? getStepIndex(result.status) : 0;

    const formattedDate = result?.createdAt
        ? new Date(result.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    return (
        <div className="min-h-screen bg-[#0d0914] text-slate-100 pb-28">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                maxWidth="max-w-4xl"
            />

            <div className="max-w-4xl mx-auto px-5 -mt-6 relative z-10">
                {/* Search Terminal */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleTrack();
                    }}
                    className="panel-surface p-3.5 sm:p-5 rounded-2xl border border-[#9d7cff]/25 flex flex-col sm:flex-row gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
                >
                    <div className="relative flex-grow flex items-center">
                        <Icon name="search" className="w-5 h-5 text-[#9d7cff] absolute left-4 pointer-events-none" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={t('inputPlaceholder')}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 font-mono tracking-wider uppercase focus:border-[#9d7cff] focus:ring-2 focus:ring-[#9d7cff]/20 outline-none transition-all text-sm sm:text-base"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || !code.trim()}
                        className="bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black uppercase tracking-wider px-8 py-3.5 rounded-xl transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_4px_16px_rgba(157,124,255,0.25)] hover:shadow-[0_0_24px_rgba(157,124,255,0.45)] text-sm"
                    >
                        {isPending ? (
                            <>
                                <span className="w-4 h-4 border-2 border-[#0d0914] border-t-transparent rounded-full animate-loading-spin" />
                                <span>{t('searching')}</span>
                            </>
                        ) : (
                            <>
                                <Icon name="radar" className="w-4 h-4 text-[#0d0914]" />
                                <span>{t('button')}</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Not Found State */}
                <AnimatePresence>
                    {notFound && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="mt-8 panel-surface p-8 sm:p-10 rounded-2xl border border-rose-500/30 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto mb-4 text-rose-400">
                                <Icon name="alert-circle" className="w-7 h-7" />
                            </div>
                            <h3 className="display-font text-2xl font-black uppercase text-white mb-2 tracking-wide">
                                {t('notFound')}
                            </h3>
                            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-6 font-sans">
                                {t('notFoundDesc')}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    href="/help"
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                                >
                                    <Icon name="message" className="w-4 h-4 text-[#9d7cff]" />
                                    <span>{t('contactSupport')}</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setCode('')}
                                    className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Limpiar búsqueda
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Banner */}
                {error && (
                    <div className="mt-8 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm text-center flex items-center justify-center gap-2">
                        <Icon name="alert-triangle" className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Order Result View */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="mt-8 panel-surface rounded-2xl border border-[#9d7cff]/30 p-6 sm:p-10 space-y-8 shadow-[0_24px_70px_rgba(0,0,0,0.7)]"
                        >
                            {/* Order Header Banner */}
                            <div className="p-5 sm:p-6 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] uppercase font-mono tracking-widest text-[#9d7cff] font-bold block mb-1">
                                        {t('orderCodeLabel')}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                                            {result.orderCode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#9d7cff] text-slate-300 hover:text-[#0d0914] border border-white/10 hover:border-[#9d7cff] transition-[background-color,color,border-color,transform] duration-150 active:scale-95 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                            title={t('copyCode')}
                                        >
                                            <Icon
                                                name={copied ? 'check' : 'clipboard'}
                                                className={`w-3.5 h-3.5 ${copied ? 'text-emerald-400 group-hover:text-[#0d0914]' : ''}`}
                                            />
                                            <span>{copied ? t('codeCopied') : t('copyCode')}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                                    <span className="text-[11px] uppercase text-slate-400 font-semibold mb-1 block">
                                        {t('currentStatus')}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                                            result.status === 'delivered' || result.status === 'completed'
                                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                : result.status === 'cancelled'
                                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                                : 'bg-[#9d7cff]/15 text-[#c8b4ff] border border-[#9d7cff]/30'
                                        }`}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                        {result.statusLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Status Pipeline Stepper */}
                            <div className="py-2">
                                <div className="relative">
                                    {/* Connector Bar Background */}
                                    <div
                                        aria-hidden="true"
                                        className="absolute top-5 left-[12%] right-[12%] h-[3px] bg-white/10 -translate-y-1/2 hidden sm:block rounded-full"
                                    />

                                    {/* Connector Bar Fill */}
                                    <div
                                        aria-hidden="true"
                                        className="absolute top-5 left-[12%] h-[3px] bg-gradient-to-r from-[#9d7cff] to-[#c8b4ff] -translate-y-1/2 hidden sm:block rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(157,124,255,0.5)]"
                                        style={{
                                            width: isCancelled
                                                ? '0%'
                                                : `${Math.min(76, Math.max(0, (currentStepIdx / (STATUS_STEPS.length - 1)) * 76))}%`,
                                        }}
                                    />

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                                        {STATUS_STEPS.map((step, idx) => {
                                            const isDone = !isCancelled && idx < currentStepIdx;
                                            const isCurrent = !isCancelled && idx === currentStepIdx;

                                            return (
                                                <div key={step.key} className="flex flex-col items-center text-center">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-black transition-all duration-200 ${
                                                            isDone
                                                                ? 'bg-[#9d7cff] text-[#0d0914] shadow-[0_0_16px_rgba(157,124,255,0.45)]'
                                                                : isCurrent
                                                                ? 'bg-white text-[#0d0914] ring-4 ring-[#9d7cff]/40 shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-105'
                                                                : 'bg-[#120e1c] border border-white/15 text-slate-500'
                                                        }`}
                                                    >
                                                        {isDone ? (
                                                            <Icon name="check" className="w-5 h-5 stroke-[2.5]" />
                                                        ) : isCurrent ? (
                                                            <span className="relative flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9d7cff] opacity-75" />
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0d0914]" />
                                                            </span>
                                                        ) : (
                                                            idx + 1
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`mt-3 text-xs uppercase font-black tracking-wider ${
                                                            isCurrent
                                                                ? 'text-white'
                                                                : isDone
                                                                ? 'text-[#c8b4ff]'
                                                                : 'text-slate-500'
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    <span className="mt-1 text-[11px] text-slate-400 max-w-[150px] leading-tight hidden sm:block">
                                                        {step.sub}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Overview Tiles */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Assigned Booster Tile */}
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center text-[#9d7cff] shrink-0">
                                        <Icon name="users" className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] uppercase text-slate-400 font-semibold block">
                                            {t('assignedBooster')}
                                        </span>
                                        {result.booster ? (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-sm font-black text-white truncate">
                                                    {result.booster}
                                                </span>
                                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                                                    {t('verifiedBooster')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-300 block truncate">
                                                {t('unassignedQueue')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Order Date Tile */}
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                                        <Icon name="clock" className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] uppercase text-slate-400 font-semibold block">
                                            {t('orderDate')}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-white block truncate">
                                            {formattedDate || '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Total Paid Tile */}
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center text-[#9d7cff] shrink-0 font-mono font-black text-sm">
                                        $
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] uppercase text-slate-400 font-semibold block">
                                            {t('totalPaid')}
                                        </span>
                                        <span className="text-sm font-mono font-black text-[#9d7cff] block">
                                            ${result.total} USD
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Services Included */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold flex items-center gap-2">
                                        <Icon name="box" className="w-4 h-4 text-[#9d7cff]" />
                                        <span>{t('servicesIncluded')}</span>
                                    </h3>
                                    <span className="text-xs font-mono text-slate-500 font-semibold">
                                        {result.items.length} {result.items.length === 1 ? 'item' : 'items'}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {result.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs text-[#0d0914] bg-[#9d7cff] font-black px-2 py-0.5 rounded">
                                                    {item.quantity}x
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white truncate">{item.name}</p>
                                                    {item.game && (
                                                        <span className="text-[11px] text-slate-400 font-semibold">
                                                            {item.game}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                                {item.platform && (
                                                    <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-black/50 text-slate-300 border border-white/10 font-bold">
                                                        {item.platform}
                                                    </span>
                                                )}
                                                {item.boostAmount && (
                                                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#9d7cff]/15 text-[#c8b4ff] border border-[#9d7cff]/30 font-bold">
                                                        +{item.boostAmount} Boost
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Help & Direct Support Footer */}
                            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Icon name="shield" className="w-4 h-4 text-[#9d7cff] shrink-0" />
                                    <span>{t('helpNote')}</span>
                                </div>
                                <Link
                                    href={`/contact?subject=Orden%20${result.orderCode}`}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#9d7cff] text-slate-200 hover:text-[#0d0914] border border-white/10 hover:border-[#9d7cff] font-bold uppercase tracking-wider text-xs transition-[background-color,color,border-color] inline-flex items-center gap-2"
                                >
                                    <span>{t('contactSupport')}</span>
                                    <Icon name="arrow-right" className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Idle Guide State: Shown when no search was performed or result cleared */}
                {!result && !notFound && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mt-10 space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="display-font text-2xl font-black uppercase text-white tracking-wide">
                                {t('howToTrackTitle')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="panel-surface p-6 rounded-2xl border border-white/10 hover:border-[#9d7cff]/40 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center text-[#9d7cff] mb-4 font-mono font-bold text-sm">
                                    01
                                </div>
                                <h3 className="font-bold text-white text-base mb-2">
                                    {t('howToTrackStep1Title')}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                    {t('howToTrackStep1Desc')}
                                </p>
                            </div>

                            <div className="panel-surface p-6 rounded-2xl border border-white/10 hover:border-[#9d7cff]/40 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center text-[#9d7cff] mb-4 font-mono font-bold text-sm">
                                    02
                                </div>
                                <h3 className="font-bold text-white text-base mb-2">
                                    {t('howToTrackStep2Title')}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                    {t('howToTrackStep2Desc')}
                                </p>
                            </div>

                            <div className="panel-surface p-6 rounded-2xl border border-white/10 hover:border-[#9d7cff]/40 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center text-[#9d7cff] mb-4 font-mono font-bold text-sm">
                                    03
                                </div>
                                <h3 className="font-bold text-white text-base mb-2">
                                    {t('howToTrackStep3Title')}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                    {t('howToTrackStep3Desc')}
                                </p>
                            </div>
                        </div>

                        {/* Direct Support Touchpoint */}
                        <div className="panel-surface p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                            <div>
                                <h4 className="font-bold text-white text-sm">
                                    ¿Compraste como invitado o no encuentras tu código?
                                </h4>
                                <p className="text-slate-400 text-xs mt-1">
                                    Indícanos tu email de compra y nuestro equipo te proveerá el acceso inmediato.
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-[#9d7cff] text-slate-200 hover:text-[#0d0914] border border-white/10 hover:border-[#9d7cff] text-xs font-bold uppercase tracking-wider transition-all shrink-0 inline-flex items-center gap-2"
                            >
                                <Icon name="headset" className="w-4 h-4" />
                                <span>{t('contactSupport')}</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
