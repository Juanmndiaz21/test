'use client';

import { useState, useEffect } from 'react';
import Icon from '../../../components/Icon';
import { ORDER_STATUS_LABELS } from '../../../lib/orders';

const STATUS_BADGE = {
    queued: 'border-white/20 text-slate-300 bg-white/5',
    in_progress: 'border-[#9d7cff]/40 text-[#9d7cff] bg-[#9d7cff]/10',
    completed: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    delivered: 'border-white/40 bg-white/10 text-white',
    cancelled: 'border-red-500/40 text-red-300 bg-red-950/40',
};

export default function OrderDetailsModal({ order, items = [] }) {
    const [isOpen, setIsOpen] = useState(false);

    // Close on Escape key
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

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9d7cff]/15 hover:bg-[#9d7cff] text-[#9d7cff] hover:text-[#0d0914] border border-[#9d7cff]/30 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(157,124,255,0.4)]"
            >
                <Icon name="search" className="w-3.5 h-3.5" />
                <span>Ver detalles</span>
                {totalAddonsCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#9d7cff] text-[#0d0914] text-[10px] font-black">
                        +{totalAddonsCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#171229] border border-[#9d7cff]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-6"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Cerrar modal"
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>

                        {/* Modal Header */}
                        <div className="border-b border-white/10 pb-5">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="eyebrow text-[#9d7cff]">Control room · Order inspection</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-xs font-mono text-slate-400">
                                    {new Date(order.created_at).toLocaleString('en')}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="display-font text-3xl uppercase text-white tracking-wide">
                                    Order #{order.id}
                                </h2>

                                <span
                                    className={`inline-block border rounded-full px-3 py-1 data-readout text-[11px] uppercase tracking-widest font-mono font-bold ${
                                        STATUS_BADGE[order.status] || STATUS_BADGE.queued
                                    }`}
                                >
                                    {ORDER_STATUS_LABELS[order.status] || order.status}
                                </span>
                            </div>
                        </div>

                        {/* Customer & Booster Info Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                            <div>
                                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                                    Customer Details
                                </span>
                                <strong className="block text-white text-sm font-bold">
                                    {order.customer_name}
                                </strong>
                                <span className="block text-xs font-mono text-slate-400 mt-0.5">
                                    {order.customer_email}
                                </span>
                            </div>

                            <div>
                                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                                    Booster & Payment
                                </span>
                                <strong className="block text-slate-300 text-sm font-medium">
                                    {order.booster ? `Assigned: ${order.booster}` : 'Unassigned'}
                                </strong>
                                <span className="block text-xs font-mono text-slate-400 mt-0.5 uppercase">
                                    Payment: {order.payment_method || 'demo'}
                                </span>
                            </div>
                        </div>

                        {/* Items & Configuration Breakdown */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                                    Configured Services ({items.length})
                                </h3>
                                <span className="text-[11px] font-mono text-[#9d7cff]">
                                    Detailed Breakdown
                                </span>
                            </div>

                            {items.map((item, index) => {
                                const details = item.details || {};
                                const addons = Array.isArray(details.addons) ? details.addons : [];

                                return (
                                    <div
                                        key={item.id || index}
                                        className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4 hover:border-[#9d7cff]/30 transition-colors"
                                    >
                                        {/* Item Title & Price */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <strong className="text-white text-base font-bold leading-snug block">
                                                    {item.name}
                                                </strong>
                                                <span className="text-xs font-mono text-slate-400 mt-0.5 block">
                                                    Quantity: {item.quantity} × ${Number(item.unit_price).toFixed(2)} USD
                                                </span>
                                            </div>

                                            <strong className="text-lg font-black text-[#9d7cff] font-mono shrink-0">
                                                ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                                            </strong>
                                        </div>

                                        {/* Core Options / Tiers */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase">
                                                    Game
                                                </span>
                                                <strong className="text-white font-bold block truncate">
                                                    {item.game || 'GTA V'}
                                                </strong>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase">
                                                    Platform
                                                </span>
                                                <strong className="text-[#9d7cff] font-bold block truncate">
                                                    {item.platform || 'General'}
                                                </strong>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase">
                                                    Edition / Version
                                                </span>
                                                <strong className="text-white font-bold block truncate">
                                                    {details.edition || 'Standard'}
                                                </strong>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="block text-[10px] font-mono text-slate-400 uppercase">
                                                    Package
                                                </span>
                                                <strong className="text-white font-bold block truncate">
                                                    {details.package || (item.boost_amount ? `${item.boost_amount}M` : 'Selected')}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* ADDONS Breakdown */}
                                        {addons.length > 0 ? (
                                            <div className="pt-3 border-t border-white/10 space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff] flex items-center gap-1.5">
                                                        <Icon name="check" className="w-3.5 h-3.5 text-[#9d7cff]" />
                                                        SAVE 10% WITH ADDONS ({addons.length} ADDED)
                                                    </span>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9d7cff]/15 text-[#9d7cff] font-bold">
                                                        DISCOUNT INCLUDED
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {addons.map((addon, aIdx) => (
                                                        <div
                                                            key={aIdx}
                                                            className="p-2.5 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/25 flex items-center gap-2.5 text-xs text-white"
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-[#9d7cff] text-[#0d0914] flex items-center justify-center shrink-0">
                                                                <Icon name="check" className="w-3 h-3 stroke-[3]" />
                                                            </div>
                                                            <span className="font-semibold leading-tight">
                                                                {addon}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-2 text-[11px] font-mono text-slate-500 italic">
                                                No addons were added to this item.
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Total & Close Action */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <div>
                                <span className="block text-xs font-mono uppercase tracking-widest font-bold text-slate-400">
                                    TOTAL CHARGED
                                </span>
                                <strong className="text-3xl font-black text-white data-readout">
                                    ${Number(order.total).toFixed(2)} <span className="text-sm font-mono text-slate-400">USD</span>
                                </strong>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#0d0914] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

