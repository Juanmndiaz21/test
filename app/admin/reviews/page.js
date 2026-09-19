import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import ReviewForm from './ReviewForm';
import ReviewsTable from './ReviewsTable';
import { getReviews } from '../../../lib/reviews';
import { getAdminSession } from '../../../lib/guard';
import { ApproveAllButton } from './ReviewRowActions';

export const dynamic = 'force-dynamic';

export default async function AdminReviews({ searchParams }) {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const sp = await searchParams;
    const initialPage = Math.max(1, Number(sp?.page) || 1);

    const sql = neon(process.env.DATABASE_URL);
    const reviews = await getReviews();
    const products = await sql`SELECT id, name FROM products ORDER BY name ASC`;
    const productMap = Object.fromEntries(products.map((p) => [String(p.id), p.name]));
    const pendingReviews = reviews.filter((r) => r.status === 'pending');

    return (
        <div className="max-w-6xl space-y-8">
            <div>
                <p className="eyebrow mb-3">Control room</p>
                <h1 className="display-font text-5xl uppercase mb-4 text-white">Reviews Moderation</h1>
                <p className="text-slate-400 max-w-2xl text-sm">
                    Manage, publish, edit, and moderate reviews left by customers or add new verified reviews for your catalog services.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex flex-wrap gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 data-readout">
                            Total: {reviews.length}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg text-amber-300 data-readout">
                            Pending: {pendingReviews.length}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest bg-lime-300/10 border border-lime-300/20 px-3 py-1.5 rounded-lg text-lime-300 data-readout">
                            Approved: {reviews.filter((r) => r.status === 'approved').length}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg text-red-400 data-readout">
                            Rejected: {reviews.filter((r) => r.status === 'rejected').length}
                        </span>
                    </div>

                    {pendingReviews.length > 0 && (
                        <ApproveAllButton count={pendingReviews.length} />
                    )}
                </div>
            </div>

            {/* Add Review Section */}
            <details className="group panel-surface rounded-2xl border border-lime-300/20 overflow-hidden">
                <summary className="p-5 font-bold text-white text-base cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors">
                    <span className="flex items-center gap-2">
                        <span className="text-lime-300 text-xl font-mono">+</span> Add New Review
                    </span>
                    <span className="text-xs font-semibold text-lime-300 uppercase tracking-widest">Expand</span>
                </summary>
                <div className="p-6 pt-0 border-t border-white/10">
                    <ReviewForm products={products} />
                </div>
            </details>

            {/* Paginated Reviews List */}
            <ReviewsTable
                reviews={reviews}
                products={products}
                productMap={productMap}
                initialPage={initialPage}
            />
        </div>
    );
}
