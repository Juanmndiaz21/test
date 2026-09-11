import { neon } from '@neondatabase/serverless';
import ProductList from '../../components/ProductList';

export const dynamic = 'force-dynamic';

export default async function Store() {
    const sql = neon(process.env.DATABASE_URL);

    // Obtenemos los productos reales de la base de datos
    const products = await sql`SELECT * FROM products ORDER BY id DESC`;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-white mb-2">Marketplace</h1>
                <p className="text-slate-400">Selecciona el boost o la cuenta que necesitas.</p>
            </div>

            <ProductList products={products} />
        </div>
    );
}