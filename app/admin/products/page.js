import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AddProductForm from './AddProductForm';
import { ProductDeleteButton, ProductEditDrawer } from './ProductRowActions';
import { getAdminSession } from '../../../lib/guard';
import { getServiceOptions } from '../../../lib/settings';

export const dynamic = 'force-dynamic';

export default async function AdminProducts({ searchParams }) {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const sql = neon(process.env.DATABASE_URL);
    const params = await searchParams;
    const selectedGame = params?.game || '';
    const products = await sql`SELECT * FROM products ORDER BY id DESC`;
    const { options } = await getServiceOptions(sql);

    return (
        <div className="max-w-5xl mx-auto px-5 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <p className="eyebrow mb-2">Control room</p>
                    <h1 className="display-font text-4xl sm:text-5xl uppercase text-white">{selectedGame ? `Add service · ${selectedGame}` : 'Service management'}</h1>
                </div>
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#9d7cff]/30 bg-[#171229] hover:border-[#9d7cff] text-[#9d7cff] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                >
                    <span>Manage Categories & Logos →</span>
                </Link>
            </div>

            <AddProductForm selectedGame={selectedGame} initialOptions={options} />

            <div className="panel-surface rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-300">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Configuration</th>
                            <th className="p-4">Price</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-slate-400">No products in the database yet.</td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id} className="border-t border-white/10">
                                    <td className="p-4 text-slate-400">#{product.id}</td>
                                    <td className="p-4 font-medium text-white">{product.name}</td>
                                    <td className="p-4 text-sm text-slate-400">{product.game || 'General'} · {product.platform === 'All' ? 'All platforms' : (product.platform || 'All')} · {product.boost_amount ? `${product.boost_amount}M` : 'Variable'}</td>
                                    <td className="p-4">
                                        <div className="text-lime-300 font-bold">${product.price} USD</div>
                                        {product.original_price ? (
                                            <div className="text-xs text-slate-500 line-through">${product.original_price} USD</div>
                                        ) : null}
                                    </td>
                                    <td className="p-4 text-right">
                                        <ProductEditDrawer product={product} defaultOptions={options} />
                                        <ProductDeleteButton productId={product.id} productName={product.name} />
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