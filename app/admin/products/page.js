import { neon } from '@neondatabase/serverless';
import { addProduct, deleteProduct, updateProduct } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminProducts({ searchParams }) {
    const sql = neon(process.env.DATABASE_URL);
    const params = await searchParams;
    const selectedGame = params?.game || '';
    const products = await sql`SELECT * FROM products ORDER BY id DESC`;

    return (
        <div className="max-w-5xl mx-auto px-5 py-10">
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">{selectedGame ? `Add service · ${selectedGame}` : 'Service management'}</h1>

            <form action={addProduct} className="panel-surface p-6 rounded-2xl mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex-grow w-full">
                    <label className="block text-sm text-slate-400 mb-2">Service name</label>
                    <input name="name" type="text" required placeholder="e.g. GTA V Cash Boost" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">Game</label>
                    <input name="game" type="text" required defaultValue={selectedGame} readOnly={Boolean(selectedGame)} placeholder="e.g. GTA V" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none read-only:text-lime-300 read-only:cursor-not-allowed" />
                </div>
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">Price ($)</label>
                    <input name="price" type="number" step="0.01" required placeholder="35" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">Platform</label>
                    <select name="platform" defaultValue="PC" className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none">
                        <option>PC</option><option>PlayStation</option><option>Xbox</option><option>All</option>
                    </select>
                </div>
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">Boost amount</label>
                    <select name="boost_amount" defaultValue="100" className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none">
                        <option value="100">100M</option><option value="200">200M</option><option value="500">500M</option>
                    </select>
                </div>
                <div className="w-full md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Description</label>
                    <textarea name="description" rows="3" placeholder="What this service includes and how long it takes..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Service image (URL)</label>
                    <input name="image_url" type="url" placeholder="https://..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">How It Works</label>
                    <textarea name="how_it_works" rows="4" placeholder="One step per line..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">Requirements</label>
                    <textarea name="requirements" rows="4" placeholder="One requirement per line..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Frequently Asked Questions</label>
                    <textarea name="faqs" rows="4" placeholder="Question and answer, one per line..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <button type="submit" className="w-full md:w-auto bg-lime-300 hover:bg-white text-black font-black py-3 px-6 rounded-lg transition-colors cursor-pointer md:col-span-2">
                    Add service
                </button>
            </form>

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
                                        <details className="text-left mb-3">
                                            <summary className="text-lime-300 hover:text-white font-bold text-sm cursor-pointer">Edit content</summary>
                                            <form action={updateProduct} className="panel-surface mt-3 p-4 rounded-xl space-y-3 min-w-72">
                                                <input type="hidden" name="id" value={product.id} />
                                                <input name="name" defaultValue={product.name} required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <input name="game" defaultValue={product.game || 'General'} required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <input name="price" type="number" step="0.01" defaultValue={product.price} required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <select name="platform" defaultValue={product.platform || 'PC'} className="w-full bg-[#171229] border border-white/10 rounded-lg p-2 text-white"><option>PC</option><option>PlayStation</option><option>Xbox</option><option>All</option></select>
                                                <select name="boost_amount" defaultValue={product.boost_amount || '100'} className="w-full bg-[#171229] border border-white/10 rounded-lg p-2 text-white"><option value="100">100M</option><option value="200">200M</option><option value="500">500M</option></select>
                                                <input name="image_url" type="url" defaultValue={product.image_url || ''} placeholder="Image URL" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <textarea name="description" defaultValue={product.description || ''} placeholder="Description" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <textarea name="how_it_works" defaultValue={product.how_it_works || ''} placeholder="How It Works" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <textarea name="requirements" defaultValue={product.requirements || ''} placeholder="Requirements" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <textarea name="faqs" defaultValue={product.faqs || ''} placeholder="FAQs" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                                <button type="submit" className="w-full bg-lime-300 text-black font-black py-2 rounded-lg">Save changes</button>
                                            </form>
                                        </details>
                                        <form action={async () => {
                                            'use server';
                                            await deleteProduct(product.id);
                                        }}>
                                            <button type="submit" className="text-red-400 hover:text-red-300 font-bold text-sm cursor-pointer">Delete</button>
                                        </form>
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