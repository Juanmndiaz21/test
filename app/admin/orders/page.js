import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import { getAdminSession } from '../../../lib/guard';
import { ensureOrdersTable } from '../../../lib/orders';
import OrdersTableClient from './OrdersTableClient';
import Icon from '../../../components/Icon';

export const dynamic = 'force-dynamic';

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
        <div className="max-w-7xl space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="eyebrow text-[#9d7cff]">Control room // Ops command</span>
                        <span className="text-slate-600">•</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[10px] font-mono text-[#c8b4ff] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cff] animate-pulse" />
                            Live Feed
                        </span>
                    </div>
                    <h1 className="display-font text-5xl sm:text-6xl uppercase text-white tracking-wide leading-none">
                        Boosting orders
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 max-w-xl">
                        Monitor live boosting queues, assign verified boosters, inspect customer requirements, and audit active addons.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300">
                        <Icon name="shield" className="w-4 h-4 text-[#9d7cff]" />
                        <span>Logged as Admin</span>
                    </span>
                </div>
            </div>

            {/* Client Interactive Table & Stats */}
            <OrdersTableClient orders={orders} itemsByOrder={itemsByOrder} />
        </div>
    );
}