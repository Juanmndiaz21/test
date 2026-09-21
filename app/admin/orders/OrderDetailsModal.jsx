'use client';

import { useState, useEffect } from 'react';
import Icon from '../../../components/Icon';
import { ORDER_STATUS_LABELS } from '../../../lib/orders';
import { toast } from '../../../utils/toast';

const STATUS_BADGE = {
    queued: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
    in_progress: 'border-[#9d7cff]/40 text-[#9d7cff] bg-[#9d7cff]/10',
    completed: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
    delivered: 'border-sky-500/40 text-sky-300 bg-sky-950/40',
    cancelled: 'border-rose-500/40 text-rose-300 bg-rose-950/40',
};

const PLATFORM_BADGE_STYLE = {
    PlayStation: 'border-[#9d7cff]/40 bg-[#9d7cff]/15 text-[#c8b4ff]',
    Xbox: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    PC: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
};

export default function OrderDetailsModal({ order, items = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const totalAddonsCount = items.reduce((sum, item) => {
        const addons = item.details?.addons;
        return sum + (Array.isArray(addons) ? addons.length : 0);
    }, 0);

    const handleCopySummary = async () => {
        try {
            const lines = [
                `=======================================`,
                `ROWMODZ // ORDER #${order.id} SUMMARY`,
                `=======================================`,
                `Date: ${new Date(order.created_at).toLocaleString('en')}`,
                `Customer: ${order.customer_name} (${order.customer_email})`,
                `Status: ${ORDER_STATUS_LABELS[order.status] || order.status}`,
                `Booster: ${order.booster || 'Unassigned'}`,
                `Total: $${Number(order.total).toFixed(2)} USD`,
                `---------------------------------------`,
                `CONFIGURED SERVICES:`,
            ];

            items.forEach((item, idx) => {
                const details = item.details || {};
                const addons = Array.isArray(details.addons) ? details.addons : [];
                lines.push(
                    `\n[Item ${idx + 1}] ${item.name}`,
                    `  Quantity: ${item.quantity} × $${Number(item.unit_price).toFixed(2)}`,
                    `  Platform: ${item.platform || 'N/A'}`,
                    `  Edition/Version: ${details.edition || 'N/A'}`,
                    `  Package: ${details.package || (item.boost_amount ? `${item.boost_amount}M` : 'Standard')}`
                );

                if (addons.length > 0) {
                    lines.push(`  SAVE 10% ADDONS (${addons.length}):`);
                    addons.forEach((addon) => {
                        lines.push(`    - ✓ ${addon}`);
                    });
                }
            });

            lines.push(`=======================================`);

            await navigator.clipboard.writeText(lines.join('\n'));
            setCopied(true);
            toast.success('Order summary copied to clipboard!');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error('Failed to copy to clipboard.');
        }
    };

    return (
        <>
            {/* The Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#9d7cff]/15 hover:bg-[#9d7cff] text-[#f1ecfb] hover:text-[#0d0914] border border-[#9d7cff]/40 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(157,124,255,0.15)] hover:shadow-[0_0_20px_rgba(157,124,255,0.45)] group active:scale-[0.98]"
            >
                <Icon
                    name="eye"
                    className="w-3.5 h-3.5 text-[#9d7cff] group-hover:text-[#0d0914] transition-colors"
                />
                <span>Ver detalles</span>
                {totalAddonsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#9d7cff] group-hover:bg-[#0d0914] text-[#0d0914] group-hover:text-[#9d7cff] text-[10px] font-black tracking-tight transition-colors">
                        <Icon name="sparkles" className="w-2.5 h-2.5" />
                        +{totalAddonsCount}
                    </span>
                )}
            </button>

            {/* The Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                    <div
                        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#1b1531] via-[#140e24] to-[#0c0816] border border-[#9d7cff]/40 rounded-3xl p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Cerrar modal"
                            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>

                        {/* Top Metadata & Live Eyebrow */}
                        <div className="border-b border-white/10 pb-5">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#9d7cff]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9d7cff] opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9d7cff]" />
                                    </span>
                                    Ops Control // Order Dossier
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs font-mono text-slate-400">
                                    {new Date(order.created_at).toLocaleString('en', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
                                <div className="space-y-1">
                                    <h2 className="display-font text-3xl sm:text-4xl uppercase text-white tracking-wide flex items-center gap-3">
                                        <span>Order #{order.id}</span>
                                    </h2>
                                    <p className="text-xs text-slate-400 font-mono">
                                        Full breakdown of client order specifications & added perks
                                    </p>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <span
                                        className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold ${
                                            STATUS_BADGE[order.status] || STATUS_BADGE.queued
                                        }`}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                    </span>
                                    <span className="text-xl sm:text-2xl font-black text-white font-mono px-3 py-1 rounded-xl bg-black/40 border border-white/10">
                                        ${Number(order.total).toFixed(2)}{' '}
                                        <small className="text-xs text-[#9d7cff] font-mono">USD</small>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Executive Summary Cards (Customer, Booster, Payment) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            {/* 1. Customer */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#9d7cff] flex items-center justify-center shrink-0">
                                    <Icon name="users" className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                        Customer
                                    </span>
                                    <strong className="block text-sm font-bold text-white truncate">
                                        {order.customer_name || 'Anonymous'}
                                    </strong>
                                    <span className="block text-xs font-mono text-slate-400 truncate mt-0.5">
                                        {order.customer_email}
                                    </span>
                                </div>
                            </div>

                            {/* 2. Booster */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#9d7cff] flex items-center justify-center shrink-0">
                                    <Icon name="gamepad" className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                        Assigned Booster
                                    </span>
                                    <strong className="block text-sm font-bold text-white truncate">
                                        {order.booster || 'Unassigned'}
                                    </strong>
                                    <span className="block text-[11px] font-mono text-slate-400 truncate mt-0.5">
                                        {order.booster ? 'Active in task' : 'Ready for claim'}
                                    </span>
                                </div>
                            </div>

                            {/* 3. Payment */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                                    <Icon name="wallet" className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                        Payment Method
                                    </span>
                                    <strong className="block text-sm font-bold text-white uppercase truncate">
                                        {order.payment_method || 'demo'}
                                    </strong>
                                    <span className="block text-[11px] font-mono text-emerald-400 truncate mt-0.5">
                                        ✓ Settled / Confirmed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Configured Services List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                    <Icon name="box" className="w-3.5 h-3.5 text-[#9d7cff]" />
                                    <span>
                                        Configured Services ({items.length})
                                    </span>
                                </h3>
                                <span className="text-[11px] font-mono text-[#c8b4ff]">
                                    Inspecting order specifications
                                </span>
                            </div>

                            {items.map((item, index) => {
                                const details = item.details || {};
                                const addons = Array.isArray(details.addons) ? details.addons : [];
                                const platformStyle =
                                    PLATFORM_BADGE_STYLE[item.platform] ||
                                    'border-white/10 bg-white/5 text-slate-300';

                                return (
                                    <div
                                        key={item.id || index}
                                        className="p-5 sm:p-6 rounded-2xl bg-black/50 border border-white/10 space-y-5 hover:border-[#9d7cff]/40 transition-all shadow-inner"
                                    >
                                        {/* Item Title and Price */}
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-white/10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                                        Item {index + 1}
                                                    </span>
                                                    <span className="text-xs font-mono text-slate-400">
                                                        Quantity: {item.quantity}
                                                    </span>
                                                </div>
                                                <strong className="text-base sm:text-lg font-bold text-white leading-snug block">
                                                    {item.name}
                                                </strong>
                                            </div>

                                            <div className="text-left sm:text-right shrink-0">
                                                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                                                    Line Total
                                                </span>
                                                <strong className="text-xl font-black text-[#9d7cff] font-mono">
                                                    ${(Number(item.unit_price) * item.quantity).toFixed(2)}{' '}
                                                    <small className="text-xs text-slate-400">USD</small>
                                                </strong>
                                            </div>
                                        </div>

                                        {/* 4-Item Configuration Matrix */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {/* Game */}
                                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                    Game
                                                </span>
                                                <strong className="text-white text-xs sm:text-sm font-bold block truncate">
                                                    {item.game || 'GTA V'}
                                                </strong>
                                            </div>

                                            {/* Platform */}
                                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                    Platform
                                                </span>
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded border text-xs font-mono font-bold ${platformStyle}`}
                                                >
                                                    {item.platform || 'General'}
                                                </span>
                                            </div>

                                            {/* Edition / Version */}
                                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                    Edition / Version
                                                </span>
                                                <strong className="text-white text-xs sm:text-sm font-bold block truncate">
                                                    {details.edition || 'Standard Edition'}
                                                </strong>
                                            </div>

                                            {/* Package / Tier */}
                                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                    Package / Tier
                                                </span>
                                                <strong className="text-white text-xs sm:text-sm font-bold block truncate">
                                                    {details.package || (item.boost_amount ? `${item.boost_amount}M Boost` : 'Standard')}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* HERO ADDONS SECTION (SAVE 10% WITH ADDONS) */}
                                        {addons.length > 0 ? (
                                            <div className="pt-4 border-t border-white/10 space-y-3">
                                                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#9d7cff]/20 via-[#9d7cff]/10 to-transparent border border-[#9d7cff]/35 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-[#9d7cff] text-[#0d0914] flex items-center justify-center font-black">
                                                            <Icon name="sparkles" className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">
                                                                SAVE 10% WITH ADDONS ({addons.length} ADDONS ATTACHED)
                                                            </span>
                                                            <span className="text-[11px] text-[#c8b4ff] font-mono">
                                                                Customer opted into customized bonus perks
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#9d7cff] text-[#0d0914] font-mono font-black text-[10px] uppercase tracking-wider">
                                                        10% DISCOUNT APPLIED
                                                    </span>
                                                </div>

                                                {/* Addons Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {addons.map((addon, aIdx) => (
                                                        <div
                                                            key={aIdx}
                                                            className="p-3 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/25 flex items-center justify-between gap-3 text-xs text-white hover:border-[#9d7cff]/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="w-5 h-5 rounded-full bg-[#9d7cff] text-[#0d0914] flex items-center justify-center shrink-0">
                                                                    <Icon name="check" className="w-3.5 h-3.5 stroke-[3]" />
                                                                </div>
                                                                <span className="font-bold text-slate-100 truncate">
                                                                    {addon}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-mono font-bold text-[#9d7cff] uppercase shrink-0">
                                                                ACTIVE
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-slate-500">
                                                <Icon name="info" className="w-3.5 h-3.5" />
                                                <span>No extra addons were attached to this item.</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Total & Action Bar */}
                        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="block text-[11px] font-mono uppercase tracking-widest font-bold text-slate-400">
                                    FINAL TOTAL CHARGED
                                </span>
                                <strong className="text-3xl sm:text-4xl font-black text-white data-readout flex items-baseline gap-2">
                                    ${Number(order.total).toFixed(2)}{' '}
                                    <span className="text-sm font-mono text-[#9d7cff]">USD</span>
                                </strong>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleCopySummary}
                                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/15 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <Icon name={copied ? 'check' : 'clipboard'} className="w-4 h-4 text-[#9d7cff]" />
                                    <span>{copied ? 'Copiado!' : 'Copiar resumen'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-[#b69eff] text-[#0d0914] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(157,124,255,0.3)]"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
