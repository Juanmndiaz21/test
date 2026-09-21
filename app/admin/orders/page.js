import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import { getAdminSession } from '../../../lib/guard';
import { ensureOrdersTable, ORDER_STATUS_LABELS } from '../../../lib/orders';
import OrderStatusForm from './OrderStatusForm';
import AssignBoosterForm from './AssignBoosterForm';

export const dynamic = 'force-dynamic';

const STATUS_BADGE = {
    queued: 'border-white/20 text-slate-300',
    in_progress: 'border-lime-300/40 text-lime-300',
    completed: 'border-lime-300/40 bg-lime-900/40 text-lime-200',
    delivered: 'border-white/40 bg-white/10 text-white',
    cancelled: 'border-red-500/40 text-red-300',
};

export default async function AdminOrdersPage() {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const sql = neon(process.env.DATABASE_URL);
    await ensureOrdersTable(sql);

    const orders = await sql`SELECT * FROM orders ORDER BY id DESC`;
    const allItems = await sql`SELECT * FROM order_items ORDER BY id`;
    const itemsByOrder = allItems.reduce((map, item) => {
        if (!map[item.order_id]) map[item.order_id] = [];
        map[item.order_id].push(item);
        return map;
    }, {});

    return (
        <div className="max-w-6xl">
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">Boosting orders</h1>

            <div className="panel-surface rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-300">
                        <tr>
                            <th className="p-4">#</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Order Details & Addons</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Booster</th>
                            <th className="p-4">Placed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-10 text-center text-slate-400">
                                    No orders yet. Place a demo order from the store checkout to manage it here.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const items = itemsByOrder[order.id] ?? [];
                                return (
                                    <tr key={order.id} className="border-t border-white/10 align-top">
                                        <td className="p-4 text-slate-400 font-bold">#{order.id}</td>
                                        <td className="p-4">
                                            <p className="font-medium text-white">{order.customer_name}</p>
                                            <p className="text-xs text-slate-400">{order.customer_email}</p>
                                        </td>
                                        <td className="p-4 text-sm max-w-md">
                                            {items.length === 0 ? (
                                                <span className="text-slate-500">—</span>
                                            ) : (
                                                <div className="space-y-3">
                                                    {items.map((item) => {
                                                        const details = item.details || {};
                                                        const addons = Array.isArray(details.addons) ? details.addons : [];
                                                        return (
                                                            <div key={item.id} className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-2">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <strong className="text-white font-bold leading-snug block text-xs sm:text-sm">
                                                                        {item.name}
                                                                    </strong>
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 shrink-0">
                                                                        ×{item.quantity}
                                                                    </span>
                                                                </div>

                                                                {/* Badges: Game, Platform, Edition, Package */}
                                                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                                                                    {item.game && (
                                                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                                                                            {item.game}
                                                                        </span>
                                                                    )}
                                                                    {item.platform && (
                                                                        <span className="px-2 py-0.5 rounded bg-[#9d7cff]/15 border border-[#9d7cff]/30 text-[#9d7cff] font-bold">
                                                                            {item.platform}
                                                                        </span>
                                                                    )}
                                                                    {details.edition && (
                                                                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                                                                            {details.edition}
                                                                        </span>
                                                                    )}
                                                                    {details.package && (
                                                                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                                                                            {details.package}
                                                                        </span>
                                                                    )}
                                                                    {item.boost_amount && !details.package && (
                                                                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                                                                            {item.boost_amount}M Boost
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* ADDONS / SAVE 10% WITH ADDONS */}
                                                                {addons.length > 0 && (
                                                                    <div className="pt-2 border-t border-white/5 space-y-1">
                                                                        <span className="block text-[10px] font-mono uppercase tracking-wider text-[#9d7cff] font-bold">
                                                                            Addons (10% OFF applied):
                                                                        </span>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {addons.map((addon, aIdx) => (
                                                                                <span
                                                                                    key={aIdx}
                                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[11px] text-slate-200"
                                                                                >
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cff]" />
                                                                                    {addon}
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
                                        <td className="p-4 text-lime-300 font-bold whitespace-nowrap">${Number(order.total).toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`inline-block border rounded-full px-3 py-1 data-readout text-[11px] uppercase tracking-widest ${STATUS_BADGE[order.status] || STATUS_BADGE.queued}`}>
                                                {ORDER_STATUS_LABELS[order.status] || order.status}
                                            </span>
                                            <div className="mt-3">
                                                <OrderStatusForm orderId={order.id} currentStatus={order.status} />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-300 mb-2">{order.booster ? `→ ${order.booster}` : 'Unassigned'}</p>
                                            <AssignBoosterForm orderId={order.id} currentBooster={order.booster} />
                                        </td>
                                        <td suppressHydrationWarning className="p-4 text-sm text-slate-400 whitespace-nowrap">{new Date(order.created_at).toLocaleString('en')}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-slate-400 mt-6">
                Workflow: queued → in progress → completed → delivered. Orders can also be cancelled at any point.
            </p>
        </div>
    );
}