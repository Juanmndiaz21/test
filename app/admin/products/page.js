import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
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
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">{selectedGame ? `Add service · ${selectedGame}` : 'Service management'}</h1>

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
                                    <td className="p-4 text-lime-300 font-bold">${product.price} USD</td>
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