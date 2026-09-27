'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import Icon from '@/components/Icon';
import LoadingWheel from '@/components/LoadingWheel';
import { toast } from '@/utils/toast';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const t = useTranslations('profile');
    const tCommon = useTranslations('common');
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ORDERS_PER_PAGE = 5;

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Fetch user orders when authenticated
    useEffect(() => {
        if (status !== 'authenticated' || !session?.user?.email) {
            if (status === 'unauthenticated') setLoadingOrders(false);
            return;
        }

        let isMounted = true;
        setLoadingOrders(true);

        fetch('/api/user/orders', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && Array.isArray(data?.orders)) {
                    setOrders(data.orders);
                }
            })
            .catch((err) => {
                console.error('Error loading orders in profile:', err);
            })
            .finally(() => {
                if (isMounted) setLoadingOrders(false);
            });

        return () => {
            isMounted = false;
        };
    }, [status, session?.user?.email]);

    const handleCopy = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            toast.success(t('codeCopied'));
            setTimeout(() => {
                setCopiedCode((curr) => (curr === code ? null : curr));
            }, 2500);
        } catch {
            // fallback
        }
    };

    const getStatusBadge = (orderStatus) => {
        switch (orderStatus) {
            case 'queued':
                return {
                    bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
                    label: tCommon('statusQueued'),
                };
            case 'in_progress':
                return {
                    bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
                    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
                    label: tCommon('statusInProgress'),
                };
            case 'completed':
                return {
                    bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
                    label: tCommon('statusCompleted'),
                };
            case 'delivered':
                return {
                    bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
                    label: tCommon('statusDelivered'),
                };
            case 'cancelled':
                return {
                    bg: 'bg-red-500/10 text-red-300 border-red-500/30',
                    dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
                    label: tCommon('statusCancelled'),
                };
            default:
                return {
                    bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
                    dot: 'bg-slate-400',
                    label: orderStatus,
                };
        }
    };

    // Filter orders by query (order code, game name, service name)
    const filteredOrders = orders.filter((order) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = (order.orderCode || '').toLowerCase().includes(q);
        const matchesGame = (order.items || []).some((it) => (it.game || '').toLowerCase().includes(q));
        const matchesName = (order.items || []).some((it) => (it.name || '').toLowerCase().includes(q));
        return matchesCode || matchesGame || matchesName;
    });

    const activeOrdersCount = orders.filter((o) => o.status === 'queued' || o.status === 'in_progress').length;

    // Pagination computations (5 orders per page)
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1;
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safeCurrentPage - 1) * ORDERS_PER_PAGE;
    const endIndex = Math.min(startIndex + ORDERS_PER_PAGE, filteredOrders.length);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const getVisiblePages = (current, total) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    // Loading State
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
                <PageHeaderBanner title={t('title')} subtitle={t('subtitle')} maxWidth="max-w-6xl" />
                <div className="max-w-6xl mx-auto px-5 py-24 flex flex-col items-center justify-center">
                    <LoadingWheel size="xl" showLogo={true} label={t('title')} />
                </div>
            </div>
        );
    }

    // Unauthenticated State
    if (status === 'unauthenticated' || !session?.user) {
        return (
            <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-20">
                <PageHeaderBanner title={t('title')} subtitle={t('subtitle')} maxWidth="max-w-4xl" />
                <div className="max-w-xl mx-auto px-5 py-16 text-center">
                    <div className="panel-surface p-8 sm:p-10 rounded-2xl border border-white/10 space-y-5">
                        <div className="mx-auto w-16 h-16 rounded-full bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center text-[#9d7cff]">
                            <Icon name="shield" className="w-8 h-8" />
                        </div>
                        <h2 className="display-font text-2xl uppercase tracking-wider text-white">
                            {t('title')}
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {t('signInPrompt')}
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 bg-[#9d7cff] hover:bg-white text-[#0d0914] font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-[0_2px_12px_rgba(157,124,255,0.3)]"
                            >
                                <Icon name="users" className="w-4 h-4" />
                                <span>{t('signInBtn')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const email = session.user.email || 'user';
    const avatarUrl = `https://i.pravatar.cc/120?u=${encodeURIComponent(email)}`;
    const initial = email[0].toUpperCase();
    const isAdmin = session.user.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-[#120e1c] text-slate-100 pb-24">
            <PageHeaderBanner
                title={t('title')}
                subtitle={t('subtitle')}
                maxWidth="max-w-6xl"
            />

            <div className="max-w-6xl mx-auto px-5 py-8 sm:py-12 space-y-8">
                {/* User Identity & Stats Header Card */}
                <div className="panel-surface p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#9d7cff]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        {/* Avatar & User Details */}
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className="relative shrink-0">
                                <img
                                    src={avatarUrl}
                                    alt=""
                                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-[#9d7cff]/40 shadow-[0_0_20px_rgba(157,124,255,0.25)]"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                                <span className="hidden h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#9d7cff] to-[#6640d6] text-[#0d0914] font-black text-2xl items-center justify-center">
                                    {initial}
                                </span>
                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#9d7cff] border-2 border-[#120e1c]" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                                        {email}
                                    </h2>
                                    {isAdmin ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#9d7cff] text-[10px] font-mono font-bold uppercase tracking-wider">
                                            <Icon name="crown" className="w-3 h-3" />
                                            {t('admin')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                                            <Icon name="shield" className="w-3 h-3 text-[#9d7cff]" />
                                            {t('customer')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                    <span>{t('verifiedEmail')}</span>
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 shrink-0">
                            <div className="p-3.5 sm:p-4 rounded-xl bg-black/30 border border-white/10 text-center min-w-[130px]">
                                <span className="block text-2xl sm:text-3xl font-black font-mono text-white">
                                    {orders.length}
                                </span>
                                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5 block">
                                    {t('ordersCount')}
                                </span>
                            </div>
                            <div className="p-3.5 sm:p-4 rounded-xl bg-black/30 border border-[#9d7cff]/30 text-center min-w-[130px]">
                                <span className="block text-2xl sm:text-3xl font-black font-mono text-[#9d7cff]">
                                    {activeOrdersCount}
                                </span>
                                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9d7cff] mt-0.5 block font-bold">
                                    {t('activeOrders')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Section: My Purchases & Tracking Codes */}
                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Icon name="package" className="w-5 h-5 text-[#9d7cff]" />
                                <h3 className="display-font text-2xl sm:text-3xl uppercase tracking-wider text-white">
                                    {t('myPurchasesTitle')}
                                </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                {t('myPurchasesSub')}
                            </p>
                        </div>

                        {/* Search Bar for Orders */}
                        {orders.length > 0 && (
                            <div className="relative w-full sm:w-72">
                                <Icon
                                    name="search"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('searchPlaceholder')}
                                    className="w-full bg-[#171229] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 text-xs"
                                    >
                                        <Icon name="x" className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Orders List */}
                    {loadingOrders ? (
                        <div className="panel-surface rounded-2xl border border-white/10 p-14 flex flex-col items-center justify-center shadow-xl">
                            <LoadingWheel size="lg" showLogo={false} label={t('myPurchasesTitle')} />
                        </div>
                    ) : orders.length === 0 ? (
                        /* Empty State: No purchases yet */
                        <div className="panel-surface p-10 sm:p-14 rounded-2xl border border-white/10 text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                                <Icon name="package" className="w-8 h-8" />
                            </div>
                            <h4 className="display-font text-2xl uppercase tracking-wider text-white">
                                {t('noOrdersYet')}
                            </h4>
                            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                                {t('noOrdersSub')}
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/store"
                                    className="inline-flex items-center gap-2 bg-[#9d7cff] hover:bg-white text-[#0d0914] font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-[0_2px_12px_rgba(157,124,255,0.3)]"
                                >
                                    <Icon name="store" className="w-4 h-4" />
                                    <span>{t('exploreCatalog')}</span>
                                </Link>
                            </div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        /* No Search Results */
                        <div className="panel-surface p-8 rounded-2xl border border-white/10 text-center space-y-2">
                            <p className="text-slate-400 text-sm">{t('noOrdersFound')}</p>
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-xs text-[#9d7cff] hover:underline font-semibold"
                            >
                                Limpiar búsqueda
                            </button>
                        </div>
                    ) : (
                        /* Orders Grid */
                        <div className="space-y-4">
                            {paginatedOrders.map((order) => {
                                const isCopied = copiedCode === order.orderCode;
                                const statusInfo = getStatusBadge(order.status);
                                const dateFormatted = order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : null;

                                return (
                                    <div
                                        key={order.id}
                                        className="panel-surface rounded-2xl border border-white/10 hover:border-[#9d7cff]/40 transition-[border-color,box-shadow] duration-200 overflow-hidden shadow-lg group"
                                    >
                                        {/* Card Top Banner: Tracking Code & Status */}
                                        <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                                    {t('orderCode')}:
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-base sm:text-lg font-black tracking-wider text-[#9d7cff] bg-black/40 px-3 py-1 rounded-lg border border-[#9d7cff]/30 select-all">
                                                        {order.orderCode}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(order.orderCode)}
                                                        title={isCopied ? t('codeCopied') : t('copyCode')}
                                                        aria-label={t('copyCode')}
                                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-[#9d7cff]/20 text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer inline-flex items-center gap-1 text-xs"
                                                    >
                                                        <Icon
                                                            name={isCopied ? 'check' : 'copy'}
                                                            className={`w-4 h-4 ${isCopied ? 'text-emerald-400' : ''}`}
                                                        />
                                                        {isCopied && (
                                                            <span className="text-emerald-400 font-bold text-[10px] hidden sm:inline">
                                                                {t('codeCopied')}
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {dateFormatted && (
                                                    <span className="text-xs text-slate-400 font-mono hidden md:inline">
                                                        {dateFormatted}
                                                    </span>
                                                )}
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${statusInfo.bg}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                                                    <span>{statusInfo.label}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body: Items & Details */}
                                        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            {/* Items List */}
                                            <div className="space-y-2 flex-1">
                                                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                                                    {t('services')}
                                                </span>
                                                {order.items && order.items.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {order.items.map((it, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-2 text-xs sm:text-sm text-slate-200"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cff]" />
                                                                <span className="font-bold text-white">{it.name}</span>
                                                                {it.game && (
                                                                    <span className="text-slate-400 text-xs">· {it.game}</span>
                                                                )}
                                                                {it.platform && (
                                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                                                                        {it.platform}
                                                                    </span>
                                                                )}
                                                                {it.quantity > 1 && (
                                                                    <span className="text-xs text-[#9d7cff] font-mono">
                                                                        x{it.quantity}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400">
                                                        Servicio de boost registrado
                                                    </p>
                                                )}
                                            </div>

                                            {/* Total & Action Button */}
                                            <div className="flex items-center md:flex-col md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                                                <div className="text-left md:text-right">
                                                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                                                        {t('total')}
                                                    </span>
                                                    <span className="font-mono text-xl sm:text-2xl font-black text-white">
                                                        ${order.total}{' '}
                                                        <span className="text-xs font-normal text-slate-400">USD</span>
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/track?code=${encodeURIComponent(order.orderCode)}`}
                                                    className="inline-flex items-center gap-2 bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-[background-color,color,transform] duration-150 active:scale-[0.97] shadow-[0_2px_10px_rgba(157,124,255,0.25)] hover:shadow-[0_0_16px_rgba(157,124,255,0.45)]"
                                                >
                                                    <Icon name="radar" className="w-4 h-4" />
                                                    <span>{t('trackOrder')}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Pagination Controls when orders exceed 5 */}
                            {totalPages > 1 && (
                                <div className="panel-surface rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 shadow-md">
                                    <div className="text-xs font-mono text-slate-400">
                                        {t('showingOrders', {
                                            start: startIndex + 1,
                                            end: endIndex,
                                            total: filteredOrders.length,
                                        })}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={safeCurrentPage === 1}
                                            className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Icon name="chevron-left" className="w-3.5 h-3.5" />
                                            <span>{t('prevPage')}</span>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {getVisiblePages(safeCurrentPage, totalPages).map((p, idx) => {
                                                if (p === '...') {
                                                    return (
                                                        <span
                                                            key={`dots-${idx}`}
                                                            className="min-w-[32px] text-center text-xs font-mono text-slate-500"
                                                        >
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                const isActive = p === safeCurrentPage;
                                                return (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setCurrentPage(p)}
                                                        className={`min-w-[34px] h-[34px] px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                                            isActive
                                                                ? 'bg-[#9d7cff] text-[#0d0914] shadow-[0_0_12px_rgba(157,124,255,0.4)]'
                                                                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={safeCurrentPage === totalPages}
                                            className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>{t('nextPage')}</span>
                                            <Icon name="chevron-right" className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Account Security & Support Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {/* Security Card */}
                    <div className="panel-surface p-5 sm:p-6 rounded-2xl border border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                            <Icon name="shield" className="w-4 h-4 text-[#9d7cff]" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                {t('accountSecurity')}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {t('changePasswordDesc')}
                        </p>
                        <div className="pt-1 flex items-center gap-3">
                            <Link
                                href="/reset-password"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                            >
                                <Icon name="edit" className="w-3.5 h-3.5 text-[#9d7cff]" />
                                <span>{t('changePassword')}</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                                <Icon name="logout" className="w-3.5 h-3.5" />
                                <span>{t('signOut')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Tracking Card */}
                    <div className="panel-surface p-5 sm:p-6 rounded-2xl border border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                            <Icon name="radar" className="w-4 h-4 text-[#9d7cff]" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                {t('quickTrack')}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {t('quickTrackDesc')}
                        </p>
                        <div className="pt-1">
                            <Link
                                href="/track"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                            >
                                <Icon name="search" className="w-3.5 h-3.5 text-[#9d7cff]" />
                                <span>{tCommon('trackOrder')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
