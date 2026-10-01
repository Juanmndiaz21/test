import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AddProductForm from './AddProductForm';
import ProductsTableClient from './ProductsTableClient';
import { getAdminSession } from '../../../lib/guard';
import { getServiceOptions } from '../../../lib/settings';
import Icon from '../../../components/Icon';

export const dynamic = 'force-dynamic';

export default async function AdminProducts({ searchParams }) {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const sql = neon(process.env.DATABASE_URL);
    const params = await searchParams;
    const selectedGame = params?.game || '';
    const [products, gamesData] = await Promise.all([
        sql`SELECT * FROM products ORDER BY id DESC`,
        sql`SELECT id, name FROM games ORDER BY name ASC`,
    ]);
    const { options } = await getServiceOptions(sql);

    // Compute key catalog statistics
    const uniqueGames = new Set();
    let totalValue = 0;
    for (const p of products) {
        if (p.game) uniqueGames.add(p.game);
        totalValue += Number(p.price) || 0;
    }
    const avgPrice = products.length > 0 ? (totalValue / products.length).toFixed(2) : '0.00';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Link href="/admin" className="hover:text-white transition-colors">
                    Control Room
                </Link>
                <span>/</span>
                <span className="text-[#9d7cff] font-bold">Services & Products</span>
            </div>

            {/* Header & Quick Action */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
                <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9d7cff]/10 border border-[#9d7cff]/20 text-[11px] font-mono font-bold text-[#9d7cff] uppercase tracking-wider">
                        Catalog Management
                    </span>
                    <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl uppercase text-white tracking-tight">
                        {selectedGame ? `Services · ${selectedGame}` : 'Service Management'}
                    </h1>
                    <p className="text-sm text-slate-300 max-w-2xl">
                        Manage all catalog products, configure multi-platform availability (PC, PlayStation, Xbox), update live pricing, and adjust delivery options.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href="/admin/categories"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#171229] hover:border-[#9d7cff]/50 text-slate-200 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                        <Icon name="layers" className="w-3.5 h-3.5 text-[#9d7cff]" />
                        <span>Categories & Logos</span>
                    </Link>
                    <Link
                        href="/store"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#9d7cff]/30 bg-[#9d7cff]/10 hover:bg-[#9d7cff]/20 text-[#9d7cff] hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all"
                    >
                        <span>View Store ↗</span>
                    </Link>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-[#171229] border border-white/10 space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Services</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                        {products.length}
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#171229] border border-white/10 space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Game Categories</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#9d7cff] tabular-nums">
                        {uniqueGames.size}
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#171229] border border-white/10 space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Average Price</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-lime-300 tabular-nums">
                        ${avgPrice}
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#171229] border border-white/10 space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Supported Platforms</span>
                    <div className="text-sm font-bold font-mono text-slate-200 pt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs">PC</span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">PS</span>
                        <span className="px-2 py-0.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 text-xs">Xbox</span>
                    </div>
                </div>
            </div>

            {/* Create Service Section (Collapsible Accordion Form) */}
            <AddProductForm selectedGame={selectedGame} initialOptions={options} games={gamesData} />

            {/* Services Table Client Component */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                        <span>Active Services Catalog</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-normal text-slate-300">
                            {products.length}
                        </span>
                    </h2>
                </div>
                <ProductsTableClient products={products} defaultOptions={options} />
            </div>
        </div>
    );
}