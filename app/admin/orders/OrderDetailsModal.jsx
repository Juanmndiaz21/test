'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

const PLATFORM_COLORS = {
    PlayStation: 'border-[#9d7cff]/40 bg-[#9d7cff]/15 text-[#c8b4ff]',
    Xbox: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    PC: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
};

export default function OrderDetailsModal({ order, items = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle Escape key and body scroll lock
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
                `ROWMODZ // DETALLES DE LA ORDEN #${order.id}`,
                `=======================================`,
                `Fecha: ${new Date(order.created_at).toLocaleString()}`,
                `Cliente: ${order.customer_name} (${order.customer_email})`,
                `Estado: ${ORDER_STATUS_LABELS[order.status] || order.status}`,
                `Booster: ${order.booster || 'No asignado'}`,
                `Total: $${Number(order.total).toFixed(2)} USD`,
                `---------------------------------------`,
                `SERVICIOS CONTRATADOS:`,
            ];

            items.forEach((item, idx) => {
                const details = item.details || {};
                const addons = Array.isArray(details.addons) ? details.addons : [];
                lines.push(
                    `\n[${idx + 1}] ${item.name}`,
                    `  Cantidad: ${item.quantity} × $${Number(item.unit_price).toFixed(2)}`,
                    `  Plataforma: ${item.platform || 'N/A'}`,
                    `  Versión/Edición: ${details.edition || 'N/A'}`,
                    `  Paquete: ${details.package || (item.boost_amount ? `${item.boost_amount}M` : 'Seleccionado')}`
                );

                if (addons.length > 0) {
                    lines.push(`  SAVE 10% WITH ADDONS (${addons.length} agregados):`);
                    addons.forEach((addon) => {
                        lines.push(`    - ✓ ${addon}`);
                    });
                }
            });

            lines.push(`=======================================`);

            await navigator.clipboard.writeText(lines.join('\n'));
            setCopied(true);
            toast.success('Resumen copiado al portapapeles');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error('No se pudo copiar al portapapeles');
        }
    };

    return (
        <>
            {/* Botón Ver detalles */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9d7cff]/15 hover:bg-[#9d7cff] text-[#f1ecfb] hover:text-[#0d0914] border border-[#9d7cff]/40 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(157,124,255,0.35)] active:scale-[0.98]"
            >
                <Icon name="search" className="w-3.5 h-3.5 text-[#9d7cff] group-hover:text-[#0d0914]" />
                <span>Ver detalle</span>
                {totalAddonsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-[#9d7cff] text-[#0d0914] text-[10px] font-black">
                        +{totalAddonsCount}
                    </span>
                )}
            </button>

            {/* Modal montado en el root (document.body) mediante createPortal */}
            {isOpen && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative w-full max-w-2xl bg-[#171229] border border-[#9d7cff]/40 rounded-2xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botón Cerrar */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Cerrar modal"
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>

                        {/* Cabecera del Modal */}
                        <div className="border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff]">
                                    Detalles de la Orden
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs font-mono text-slate-400">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                                <h2 className="display-font text-3xl uppercase text-white tracking-wide">
                                    Orden #{order.id}
                                </h2>

                                <span
                                    className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold ${
                                        STATUS_BADGE[order.status] || STATUS_BADGE.queued
                                    }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {ORDER_STATUS_LABELS[order.status] || order.status}
                                </span>
                            </div>
                        </div>

                        {/* Ficha Cliente & Booster */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                                    Cliente
                                </span>
                                <strong className="text-white text-sm font-bold block">
                                    {order.customer_name || 'Sin nombre'}
                                </strong>
                                <span className="text-slate-400 font-mono block">
                                    {order.customer_email}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                                    Booster & Pago
                                </span>
                                <strong className="text-slate-200 text-sm font-medium block">
                                    {order.booster ? `Asignado a: ${order.booster}` : 'Sin booster asignado'}
                                </strong>
                                <span className="text-slate-400 font-mono uppercase block">
                                    Método: {order.payment_method || 'demo'}
                                </span>
                            </div>
                        </div>

                        {/* Lista de Servicios */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                                Servicios Incluidos ({items.length})
                            </h3>

                            {items.map((item, index) => {
                                const details = item.details || {};
                                const addons = Array.isArray(details.addons) ? details.addons : [];
                                const platformColor =
                                    PLATFORM_COLORS[item.platform] || 'border-white/10 bg-white/5 text-slate-300';

                                return (
                                    <div
                                        key={item.id || index}
                                        className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3"
                                    >
                                        {/* Nombre y Precio */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <strong className="text-white text-sm font-bold block leading-snug">
                                                    {item.name}
                                                </strong>
                                                <span className="text-xs text-slate-400 font-mono">
                                                    Cantidad: {item.quantity} × ${Number(item.unit_price).toFixed(2)} USD
                                                </span>
                                            </div>

                                            <strong className="text-base font-bold text-white font-mono shrink-0">
                                                ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                                            </strong>
                                        </div>

                                        {/* Badges de configuración */}
                                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                                            {item.game && (
                                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                                                    {item.game}
                                                </span>
                                            )}
                                            {item.platform && (
                                                <span className={`px-2 py-0.5 rounded border font-bold ${platformColor}`}>
                                                    {item.platform}
                                                </span>
                                            )}
                                            {details.edition && (
                                                <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-slate-300">
                                                    {details.edition}
                                                </span>
                                            )}
                                            {details.package && (
                                                <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-slate-300">
                                                    {details.package}
                                                </span>
                                            )}
                                            {item.boost_amount && !details.package && (
                                                <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-slate-300">
                                                    {item.boost_amount}M Boost
                                                </span>
                                            )}
                                        </div>

                                        {/* SECCIÓN DE ADDONS (SAVE 10% WITH ADDONS) */}
                                        {addons.length > 0 ? (
                                            <div className="mt-3 p-3.5 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/25 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff] flex items-center gap-1.5">
                                                        <Icon name="check" className="w-4 h-4 text-[#9d7cff]" />
                                                        SAVE 10% WITH ADDONS ({addons.length} agregados)
                                                    </span>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9d7cff]/20 text-[#c8b4ff] font-bold">
                                                        10% OFF APLICADO
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                                    {addons.map((addon, aIdx) => (
                                                        <div
                                                            key={aIdx}
                                                            className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs text-white"
                                                        >
                                                            <span className="w-4 h-4 rounded-full bg-[#9d7cff] text-[#0d0914] flex items-center justify-center text-[10px] font-black shrink-0">
                                                                ✓
                                                            </span>
                                                            <span className="font-medium truncate">{addon}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 font-mono italic pt-1">
                                                Sin addons agregados a este pedido.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total y Botones de acción */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                            <div>
                                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                    Total del pedido
                                </span>
                                <strong className="text-2xl font-black text-white font-mono">
                                    ${Number(order.total).toFixed(2)}{' '}
                                    <small className="text-xs text-slate-400">USD</small>
                                </strong>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopySummary}
                                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    <Icon name={copied ? 'check' : 'clipboard'} className="w-3.5 h-3.5 text-[#9d7cff]" />
                                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-5 py-2 rounded-xl bg-[#9d7cff] hover:bg-[#b69eff] text-[#0d0914] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
