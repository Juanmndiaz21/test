'use client';

import { useState, useEffect, useTransition, use } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import Icon from '@/components/Icon';
import { trackOrderAction } from './actions';
import { Link } from '@/i18n/navigation';
import { toast } from '@/utils/toast';

export default function TrackOrderPage({ searchParams }) {
    const t = useTranslations('track');
    const shouldReduceMotion = useReducedMotion();
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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28">
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
                    className="bg-zinc-900 p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 shadow-2xl"
                >
                    <div className="relative flex-grow flex items-center">
                        <Icon name="search" className="w-5 h-5 text-emerald-400 absolute left-4 pointer-events-none" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={t('inputPlaceholder')}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 font-mono tracking-wider uppercase focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all text-sm sm:text-base"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || !code.trim()}
                        className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] text-sm"
                    >
                        {isPending ? (
                            <>
                                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-loading-spin" />
                                <span>{t('searching')}</span>
                            </>
                        ) : (
                            <>
                                <Icon name="radar" className="w-4 h-4 text-zinc-950" />
                                <span>{t('button')}</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Not Found State */}
                <AnimatePresence>
                    {notFound && (
                        <motion.div
                            initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(10px) scale(0.98)' }}
                            animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
                            exit={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(-10px)' }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="mt-8 bg-zinc-900 p-8 sm:p-10 rounded-2xl border border-rose-500/30 text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto mb-4 text-rose-400">
                                <Icon name="alert-circle" className="w-7 h-7" />
                            </div>
                            <h3 className="display-font text-2xl font-black uppercase text-white mb-2 tracking-wide">
                                {t('notFound')}
                            </h3>
                            <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed mb-6 font-sans">
                                {t('notFoundDesc')}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    href="/help"
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                                >
                                    <Icon name="message" className="w-4 h-4 text-emerald-400" />
                                    <span>{t('contactSupport')}</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setCode('')}
                                    className="px-5 py-2.5 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Clear search
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
                            initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(16px)' }}
                            animate={{ opacity: 1, transform: 'translateY(0)' }}
                            exit={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(-16px)' }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="mt-8 bg-zinc-900 rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8 shadow-2xl"
                        >
                            {/* Order Header Banner */}
                            <div className="p-5 sm:p-6 rounded-xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 font-bold block mb-1">
                                        {t('orderCodeLabel')}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                                            {result.orderCode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500 text-zinc-300 hover:text-zinc-950 border border-white/10 hover:border-emerald-500 transition-all duration-150 active:scale-95 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                            title={t('copyCode')}
                                        >
                                            <Icon
                                                name={copied ? 'check' : 'clipboard'}
                                                className={`w-3.5 h-3.5 ${copied ? 'text-emerald-400' : ''}`}
                                            />
                                            <span>{copied ? t('codeCopied') : t('copyCode')}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                                    <span className="text-[11px] uppercase text-zinc-400 font-semibold mb-1 block">
                                        {t('currentStatus')}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                                            result.status === 'delivered' || result.status === 'completed'
                                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                : result.status === 'cancelled'
                                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
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
                                        className="absolute top-5 left-[12%] h-[3px] bg-emerald-500 -translate-y-1/2 hidden sm:block rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
                                                                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_16px_rgba(16,185,129,0.45)]'
                                                                : isCurrent
                                                                ? 'bg-white text-zinc-950 ring-4 ring-emerald-500/40 shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-105'
                                                                : 'bg-zinc-950 border border-white/15 text-zinc-400'
                                                        }`}
                                                    >
                                                        {isDone ? (
                                                            <Icon name="check" className="w-5 h-5 stroke-[2.5]" />
                                                        ) : isCurrent ? (
                                                            <span className="relative flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-950" />
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
                                                                ? 'text-emerald-400'
                                                                : 'text-zinc-400'
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    <span className="mt-1 text-[11px] text-zinc-400 max-w-[150px] leading-tight hidden sm:block">
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
                                <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Icon name="users" className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] uppercase text-zinc-400 font-semibold block">
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
                                            <span className="text-xs font-medium text-zinc-300 block truncate">
                                                {t('unassignedQueue')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Order Date Tile */}
                                <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                                        <Icon name="clock" className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] uppercase text-zinc-400 font-semibold block">
                                            {t('orderDate')}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-white block truncate">
                                            {formattedDate || '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Total Paid Tile */}
                                <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black text-sm">
                                        $
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] uppercase text-zinc-400 font-semibold block">
                                            {t('totalPaid')}
                                        </span>
                                        <span className="text-sm font-mono font-black text-emerald-400 block">
                                            ${result.total} USD
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Services Included */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-300 font-bold flex items-center gap-2">
                                        <Icon name="box" className="w-4 h-4 text-emerald-400" />
                                        <span>{t('servicesIncluded')}</span>
                                    </h3>
                                    <span className="text-xs font-mono text-zinc-400 font-semibold">
                                        {result.items.length} {result.items.length === 1 ? 'item' : 'items'}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {result.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/80 hover:bg-zinc-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs text-zinc-950 bg-emerald-500 font-black px-2 py-0.5 rounded">
                                                    {item.quantity}x
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white truncate">{item.name}</p>
                                                    {item.game && (
                                                        <span className="text-[11px] text-zinc-400 font-semibold">
                                                            {item.game}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                                {item.platform && (
                                                    <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/10 font-bold">
                                                        {item.platform}
                                                    </span>
                                                )}
                                                {item.boostAmount && (
                                                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                                                        +{item.boostAmount} Boost
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Help & Direct Support Footer */}
                            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <Icon name="shield" className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>{t('helpNote')}</span>
                                </div>
                                <Link
                                    href={`/contact?subject=Order%20${result.orderCode}`}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-emerald-500 text-zinc-200 hover:text-zinc-950 border border-white/10 hover:border-emerald-500 font-black uppercase tracking-wider text-xs transition-all inline-flex items-center gap-2 cursor-pointer"
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
                        initial={{ opacity: 0, transform: shouldReduceMotion ? 'none' : 'translateY(12px)' }}
                        animate={{ opacity: 1, transform: 'translateY(0)' }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mt-10 space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="display-font text-2xl font-black uppercase text-white tracking-wide">
                                {t('howToTrackTitle')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 font-mono font-bold text-sm">
                                    01
                                </div>
                                <h3 className="font-bold text-white text-base mb-2">
                                    {t('howToTrackStep1Title')}
                                </h3>
                                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                                    {t('howToTrackStep1Desc')}
                                </p>
                            </div>

                            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 font-mono font-bold text-sm">
                                    02
                                </div>
                                <h3 className="font-bold text-white text-base mb-2">
                                    {t('howToTrackStep2Title')}
                                </h3>
                                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                                    {t('howToTrackStep2Desc')}
                                </p>
                            </div>

                            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 font-mono font-bold text-sm">
                                    03
                                </div>
                                <h3 className="font-bold text-white text-base mb-2">
                                    {t('howToTrackStep3Title')}
                                </h3>
                                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                                    {t('howToTrackStep3Desc')}
                                </p>
                            </div>
                        </div>

                        {/* Direct Support Touchpoint */}
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                            <div>
                                <h4 className="font-bold text-white text-sm">
                                    Purchased as a guest or can&apos;t find your code?
                                </h4>
                                <p className="text-zinc-400 text-xs mt-1">
                                    Send us your purchase email address and our team will grant you instant access.
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-emerald-500 text-zinc-200 hover:text-zinc-950 border border-white/10 hover:border-emerald-500 text-xs font-black uppercase tracking-wider transition-all shrink-0 inline-flex items-center gap-2 cursor-pointer"
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
