import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AddProductForm from './AddProductForm';
import ProductsTableClient from './ProductsTableClient';
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
        <div className="max-w-5xl mx-auto px-5 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold uppercase tracking-wide text-white">
                        Active Services ({products.length})
                    </h2>
                </div>
                <ProductsTableClient products={products} defaultOptions={options} />
            </div>
        </div>
    );
}