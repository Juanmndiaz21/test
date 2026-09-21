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
        <div className="space-y-8">
            {/* 1. TOP STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="panel-surface rounded-2xl p-5 border border-white/10 relative overflow-hidden group hover:border-[#9d7cff]/40 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Total Orders</span>
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                            <Icon name="box" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white display-font tracking-wide">
                        {stats.totalOrders}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Recorded in database</p>
                </div>

                {/* Active in Pipeline */}
                <div className="panel-surface rounded-2xl p-5 border border-white/10 relative overflow-hidden group hover:border-[#9d7cff]/40 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-bold">In Pipeline</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Icon name="bolt" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-amber-300 display-font tracking-wide flex items-center gap-2">
                        {stats.activeCount}
                        {stats.activeCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Queued & in progress</p>
                </div>

                {/* Orders With Addons */}
                <div className="panel-surface rounded-2xl p-5 border border-white/10 relative overflow-hidden group hover:border-[#9d7cff]/40 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-bold">With Addons</span>
                        <div className="w-8 h-8 rounded-lg bg-[#9d7cff]/15 border border-[#9d7cff]/30 flex items-center justify-center text-[#9d7cff]">
                            <Icon name="sparkles" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-[#9d7cff] display-font tracking-wide">
                        {stats.ordersWithAddonsCount}
                    </div>
                    <p className="text-[11px] text-[#c8b4ff]/70 font-mono mt-1">Save 10% addons attached</p>
                </div>

                {/* Total Volume */}
                <div className="panel-surface rounded-2xl p-5 border border-white/10 relative overflow-hidden group hover:border-[#9d7cff]/40 transition-colors">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Gross Volume</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Icon name="wallet" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white display-font tracking-wide">
                        ${stats.totalRevenue}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Total revenue processed</p>
                </div>
            </div>

            {/* 2. SEARCH & FILTER CONTROLS */}
            <div className="panel-surface rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Icon
                        name="search"
                        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order #, customer, email, game or addon..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {[
                        { id: 'all', label: 'All Orders', count: orders.length },
                        { id: 'queued', label: 'Queued', count: orders.filter((o) => o.status === 'queued').length },
                        { id: 'in_progress', label: 'In Progress', count: orders.filter((o) => o.status === 'in_progress').length },
                        { id: 'completed', label: 'Completed', count: orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length },
                        { id: 'with_addons', label: '✨ With Addons', count: stats.ordersWithAddonsCount },
                    ].map((tab) => {
                        const active = statusFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                    active
                                        ? 'bg-[#9d7cff]/20 border-[#9d7cff] text-[#f1ecfb] shadow-[0_0_15px_rgba(157,124,255,0.25)]'
                                        : 'bg-black/20 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                                }`}
                            >
                                {tab.label}{' '}
                                <span
                                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                                        active ? 'bg-[#9d7cff] text-[#0d0914] font-black' : 'bg-white/10 text-slate-300'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. ORDERS TABLE */}
            <div className="panel-surface rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/50 border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                                <th className="p-4 pl-5">Order</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Configured Services & Addons</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Booster</th>
                                <th className="p-4 text-right pr-5">Inspection</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-400">
                                        <div className="max-w-md mx-auto space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                                                <Icon name="search" className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-white font-bold text-base">No matching orders found</h4>
                                            <p className="text-xs text-slate-500">
                                                Try changing your search terms or selecting a different filter tab above.
                                            </p>
                                        </div>
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
                                            className="hover:bg-white/[0.02] transition-colors group align-top"
                                        >
                                            {/* 1. Order ID & Date */}
                                            <td className="p-4 pl-5 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-white px-2 py-0.5 rounded-lg bg-black/40 border border-white/10">
                                                        #{order.id}
                                                    </span>
                                                    <span className="block text-[11px] font-mono text-slate-500">
                                                        {new Date(order.created_at).toLocaleDateString('en', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 2. Customer */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9d7cff]/30 to-[#9d7cff]/10 border border-[#9d7cff]/30 text-[#f1ecfb] font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                                                        {(order.customer_name || 'U').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <strong className="block text-sm font-bold text-white truncate max-w-[150px]">
                                                            {order.customer_name || 'Anonymous'}
                                                        </strong>
                                                        <span className="block text-xs font-mono text-slate-400 truncate max-w-[150px]">
                                                            {order.customer_email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 3. Items, Config, Badges, Addons */}
                                            <td className="p-4 max-w-sm">
                                                {items.length === 0 ? (
                                                    <span className="text-slate-500 text-xs font-mono">—</span>
                                                ) : (
                                                    <div className="space-y-2.5">
                                                        {items.map((item) => {
                                                            const details = item.details || {};
                                                            const addons = Array.isArray(details.addons) ? details.addons : [];
                                                            const platformColor =
                                                                PLATFORM_COLORS[item.platform] ||
                                                                'border-white/10 bg-white/5 text-slate-300';

                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 hover:border-[#9d7cff]/30 transition-colors"
                                                                >
                                                                    {/* Item title */}
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <span className="text-xs font-bold text-white leading-snug">
                                                                            {item.name}
                                                                        </span>
                                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 shrink-0">
                                                                            ×{item.quantity}
                                                                        </span>
                                                                    </div>

                                                                    {/* Badges: Game, Platform, Edition, Package */}
                                                                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                                                                        {item.platform && (
                                                                            <span
                                                                                className={`px-2 py-0.5 rounded border font-bold ${platformColor}`}
                                                                            >
                                                                                {item.platform}
                                                                            </span>
                                                                        )}
                                                                        {details.edition && (
                                                                            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-slate-300 truncate max-w-[140px]">
                                                                                {details.edition}
                                                                            </span>
                                                                        )}
                                                                        {details.package && (
                                                                            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-slate-300">
                                                                                {details.package}
                                                                            </span>
                                                                        )}
                                                                        {item.boost_amount && !details.package && (
                                                                            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-slate-300">
                                                                                {item.boost_amount}M Boost
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Highlighted Addons Section */}
                                                                    {addons.length > 0 && (
                                                                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                                                                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#9d7cff] uppercase">
                                                                                <Icon name="sparkles" className="w-3 h-3 text-[#9d7cff]" />
                                                                                <span>SAVE 10% ADDONS ({addons.length}):</span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {addons.map((addon, aIdx) => (
                                                                                    <span
                                                                                        key={aIdx}
                                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[10px] text-[#f1ecfb] font-mono font-medium"
                                                                                    >
                                                                                        <span className="text-[#9d7cff] font-black">✓</span>
                                                                                        <span className="truncate max-w-[130px]">{addon}</span>
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>

                                            {/* 4. Total */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="space-y-0.5">
                                                    <span className="text-base font-black text-white font-mono tracking-tight block">
                                                        ${Number(order.total).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                                                        USD · demo
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 5. Status */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                                                            STATUS_BADGE[order.status] || STATUS_BADGE.queued
                                                        }`}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                                    </span>
                                                    <div>
                                                        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 6. Booster */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    <span className="block text-xs font-mono text-slate-300">
                                                        {order.booster ? (
                                                            <span className="inline-flex items-center gap-1 text-[#c8b4ff]">
                                                                <Icon name="gamepad" className="w-3.5 h-3.5 text-[#9d7cff]" />
                                                                {order.booster}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                                                        )}
                                                    </span>
                                                    <div>
                                                        <AssignBoosterForm orderId={order.id} currentBooster={order.booster} />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 7. Action: Ver detalles button */}
                                            <td className="p-4 pr-5 text-right whitespace-nowrap">
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

            {/* Footer notice */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2">
                <span>Total records displayed: {filteredOrders.length} of {orders.length}</span>
                <span>Operational pipeline: Queued → In progress → Completed → Delivered</span>
            </div>
        </div>
    );
}
