'use client';

import { useState, useMemo } from 'react';
import Icon from '../../../components/Icon';
import { ORDER_STATUS_LABELS } from '../../../lib/orders';
import OrderStatusForm from './OrderStatusForm';
import AssignBoosterForm from './AssignBoosterForm';
import OrderDetailsModal from './OrderDetailsModal';

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

export default function OrdersTableClient({ orders = [], itemsByOrder = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Aggregate statistics
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let activeCount = 0;
        let completedCount = 0;
        let ordersWithAddonsCount = 0;

        for (const order of orders) {
            totalRevenue += Number(order.total) || 0;
            if (order.status === 'queued' || order.status === 'in_progress') {
                activeCount++;
            }
            if (order.status === 'completed' || order.status === 'delivered') {
                completedCount++;
            }
            const items = itemsByOrder[order.id] || [];
            const hasAddons = items.some(
                (item) => Array.isArray(item.details?.addons) && item.details.addons.length > 0
            );
            if (hasAddons) {
                ordersWithAddonsCount++;
            }
        }

        return {
            totalOrders: orders.length,
            totalRevenue: totalRevenue.toFixed(2),
            activeCount,
            completedCount,
            ordersWithAddonsCount,
        };
    }, [orders, itemsByOrder]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return orders.filter((order) => {
            const matchesStatus =
                statusFilter === 'all'
                    ? true
                    : statusFilter === 'with_addons'
                    ? (itemsByOrder[order.id] || []).some(
                          (item) => Array.isArray(item.details?.addons) && item.details.addons.length > 0
                      )
                    : order.status === statusFilter;

            if (!matchesStatus) return false;
            if (!query) return true;

            const idMatch = String(order.id).includes(query);
            const nameMatch = String(order.customer_name || '').toLowerCase().includes(query);
            const emailMatch = String(order.customer_email || '').toLowerCase().includes(query);
            const boosterMatch = String(order.booster || '').toLowerCase().includes(query);
            const itemsMatch = (itemsByOrder[order.id] || []).some(
                (item) =>
                    String(item.name || '').toLowerCase().includes(query) ||
                    String(item.game || '').toLowerCase().includes(query) ||
                    String(item.platform || '').toLowerCase().includes(query) ||
                    (item.details?.addons || []).some((a) => String(a).toLowerCase().includes(query))
            );

            return idMatch || nameMatch || emailMatch || boosterMatch || itemsMatch;
        });
    }, [orders, itemsByOrder, searchTerm, statusFilter]);

    return (
        <div className="space-y-6">
            {/* 1. STATS RESUMEN */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="panel-surface rounded-xl p-4 border border-white/10">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                        Total Órdenes
                    </span>
                    <strong className="text-2xl font-black text-white font-mono">
                        {stats.totalOrders}
                    </strong>
                </div>

                <div className="panel-surface rounded-xl p-4 border border-white/10">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                        En Proceso / Cola
                    </span>
                    <strong className="text-2xl font-black text-amber-300 font-mono">
                        {stats.activeCount}
                    </strong>
                </div>

                <div className="panel-surface rounded-xl p-4 border border-white/10">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                        Con Addons (+10% Off)
                    </span>
                    <strong className="text-2xl font-black text-[#9d7cff] font-mono">
                        {stats.ordersWithAddonsCount}
                    </strong>
                </div>

                <div className="panel-surface rounded-xl p-4 border border-white/10">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                        Total Facturado
                    </span>
                    <strong className="text-2xl font-black text-white font-mono">
                        ${stats.totalRevenue} <small className="text-xs text-slate-400">USD</small>
                    </strong>
                </div>
            </div>

            {/* 2. BARRA DE BÚSQUEDA Y FILTROS */}
            <div className="panel-surface rounded-xl p-3 sm:p-4 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Icon
                        name="search"
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por #orden, cliente, juego o addon..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                        { id: 'all', label: 'Todas' },
                        { id: 'queued', label: 'En Cola' },
                        { id: 'in_progress', label: 'En Proceso' },
                        { id: 'completed', label: 'Completadas' },
                        { id: 'with_addons', label: 'Con Addons' },
                    ].map((tab) => {
                        const active = statusFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                                    active
                                        ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-white shadow-sm'
                                        : 'bg-black/20 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. TABLA DE ÓRDENES */}
            <div className="panel-surface rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/10 text-slate-400 font-mono text-xs uppercase tracking-wider">
                                <th className="p-3.5 pl-4"># Orden</th>
                                <th className="p-3.5">Cliente</th>
                                <th className="p-3.5">Servicio</th>
                                <th className="p-3.5">Total</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5">Booster</th>
                                <th className="p-3.5 text-right pr-4">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        No se encontraron órdenes con esos criterios.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const items = itemsByOrder[order.id] ?? [];
                                    const totalAddons = items.reduce((sum, item) => {
                                        const addons = item.details?.addons;
                                        return sum + (Array.isArray(addons) ? addons.length : 0);
                                    }, 0);

                                    return (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-white/[0.02] transition-colors align-top"
                                        >
                                            {/* 1. Orden & Fecha */}
                                            <td className="p-3.5 pl-4 whitespace-nowrap">
                                                <strong className="font-mono text-white text-sm block">
                                                    #{order.id}
                                                </strong>
                                                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                                    {new Date(order.created_at).toLocaleDateString('es', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </td>

                                            {/* 2. Cliente */}
                                            <td className="p-3.5">
                                                <p className="font-bold text-white leading-snug">
                                                    {order.customer_name || 'Sin nombre'}
                                                </p>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[170px]">
                                                    {order.customer_email}
                                                </p>
                                            </td>

                                            {/* 3. Servicio & Resumen de Addons */}
                                            <td className="p-3.5 max-w-sm">
                                                {items.length === 0 ? (
                                                    <span className="text-slate-500 text-xs">—</span>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {items.map((item) => {
                                                            const details = item.details || {};
                                                            const addons = Array.isArray(details.addons) ? details.addons : [];
                                                            const platformColor =
                                                                PLATFORM_COLORS[item.platform] ||
                                                                'border-white/10 bg-white/5 text-slate-300';

                                                            return (
                                                                <div key={item.id} className="space-y-1">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="font-semibold text-white text-xs leading-snug">
                                                                            {item.name}
                                                                        </span>
                                                                        {item.quantity > 1 && (
                                                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/10 text-slate-300">
                                                                                ×{item.quantity}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Badges de soporte */}
                                                                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                                                                        {item.platform && (
                                                                            <span className={`px-1.5 py-0.2 rounded border font-bold ${platformColor}`}>
                                                                                {item.platform}
                                                                            </span>
                                                                        )}
                                                                        {details.edition && (
                                                                            <span className="px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-slate-300">
                                                                                {details.edition}
                                                                            </span>
                                                                        )}
                                                                        {details.package && (
                                                                            <span className="px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-slate-300">
                                                                                {details.package}
                                                                            </span>
                                                                        )}
                                                                        {addons.length > 0 && (
                                                                            <span className="px-1.5 py-0.2 rounded bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#9d7cff] font-bold">
                                                                                ✨ {addons.length} Addons
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>

                                            {/* 4. Total */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <strong className="text-white font-mono font-bold block">
                                                    ${Number(order.total).toFixed(2)}
                                                </strong>
                                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                                    USD
                                                </span>
                                            </td>

                                            {/* 5. Estado */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <div className="space-y-1.5">
                                                    <span
                                                        className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                                                            STATUS_BADGE[order.status] || STATUS_BADGE.queued
                                                        }`}
                                                    >
                                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                                    </span>
                                                    <OrderStatusForm orderId={order.id} currentStatus={order.status} />
                                                </div>
                                            </td>

                                            {/* 6. Booster */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <div className="space-y-1.5">
                                                    <span className="block text-xs font-mono text-slate-300">
                                                        {order.booster ? (
                                                            <span className="text-[#c8b4ff]">→ {order.booster}</span>
                                                        ) : (
                                                            <span className="text-slate-500 italic text-[11px]">Sin asignar</span>
                                                        )}
                                                    </span>
                                                    <AssignBoosterForm orderId={order.id} currentBooster={order.booster} />
                                                </div>
                                            </td>

                                            {/* 7. Acción: Ver detalle */}
                                            <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                                                <OrderDetailsModal order={order} items={items} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
