import Link from 'next/link';
import { neon } from '@neondatabase/serverless';
import { ensureOrdersTable, ORDER_STATUS_LABELS } from '../../lib/orders';
import Icon from '../../components/Icon';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const sql = neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, price DECIMAL(10, 2) NOT NULL, game VARCHAR(120))`;
    await ensureOrdersTable(sql);

    const ordersTotal = await sql`SELECT COUNT(*)::int AS total FROM orders`;
    const revenue = await sql`SELECT COALESCE(SUM(total), 0)::numeric AS total FROM orders WHERE status <> 'cancelled'`;
    const queued = await sql`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'queued'`;
    const inProgress = await sql`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'in_progress'`;
    const products = await sql`SELECT COUNT(*)::int AS total FROM products`;
    const games = await sql`SELECT COUNT(*)::int AS total FROM games`;

    const recent = await sql`SELECT * FROM orders ORDER BY id DESC LIMIT 5`;
    const allItems = await sql`SELECT * FROM order_items ORDER BY id`;
    const itemsByOrder = allItems.reduce((map, item) => {
        if (!map[item.order_id]) map[item.order_id] = [];
        map[item.order_id].push(item);
        return map;
    }, {});

const metrics = [
    { label: 'Total orders', value: String(ordersTotal[0]?.total ?? 0), icon: 'clipboard' },
    { label: 'Revenue (open)', value: `$${Number(revenue[0]?.total ?? 0).toFixed(2)}`, icon: 'trending-up' },
    { label: 'Queued', value: String(queued[0]?.total ?? 0), icon: 'clock' },
    { label: 'In progress', value: String(inProgress[0]?.total ?? 0), icon: 'bolt' },
    { label: 'Services', value: String(products[0]?.total ?? 0), icon: 'box' },
    { label: 'Games', value: String(games[0]?.total ?? 0), icon: 'gamepad' },
];

    return (
        <div className="max-w-5xl">
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {metrics.map((metric) => (
                    <div key={metric.label} className="panel-surface rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-widest text-slate-400">{metric.label}</p>
                            <Icon name={metric.icon} className="w-4 h-4 text-lime-300/70" />
                        </div>
                        <p className="display-font text-3xl text-lime-300 mt-2">{metric.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 mb-6">
                <h2 className="display-font text-3xl uppercase text-white">Latest orders</h2>
                <div className="h-px bg-white/10 flex-1" />
                <Link href="/admin/orders" className="text-sm text-lime-300 hover:text-white font-bold transition-colors">
                    Manage all →
                </Link>
            </div>

            <div className="panel-surface rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-300">
                        <tr>
                            <th className="p-4">#</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recent.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-slate-400">
                                    No orders yet. Place a demo order from the store to see it here.
                                </td>
                            </tr>
                        ) : (
                            recent.map((order) => (
                                <tr key={order.id} className="border-t border-white/10">
                                    <td className="p-4 text-slate-400">#{order.id}</td>
                                    <td className="p-4">
                                        <p className="font-medium text-white">{order.customer_name}</p>
                                        <p className="text-xs text-slate-400">{order.customer_email}</p>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {(itemsByOrder[order.id] ?? []).map((item) => item.name).join(', ') || '—'}
                                    </td>
                                    <td className="p-4 text-lime-300 font-bold">${Number(order.total).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className="data-readout text-[11px] uppercase tracking-widest text-slate-300">
                                            {ORDER_STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}