'use client';

import { useState, useTransition } from 'react';
import { updateReviewStatus, deleteReview, updateReview, approveAllReviews } from './actions';
import { toast } from '../../../utils/toast';

export function ReviewStatusButtons({ review }) {
    const [isPending, startTransition] = useTransition();

    const handleStatus = (status) => {
        startTransition(async () => {
            try {
                const fd = new FormData();
                fd.append('id', review.id);
                fd.append('status', status);
                await updateReviewStatus(fd);
                if (status === 'approved') {
                    toast.success(`Review #${review.id} approved and live!`, { title: 'Approved' });
                } else {
                    toast.warning(`Review #${review.id} marked as rejected`, { title: 'Rejected' });
                }
            } catch (err) {
                toast.error(err.message || 'Failed to update review status');
            }
        });
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        startTransition(async () => {
            try {
                const fd = new FormData();
                fd.append('id', review.id);
                await deleteReview(fd);
                toast.error(`Review #${review.id} deleted from database`, { title: 'Deleted' });
            } catch (err) {
                toast.error(err.message || 'Failed to delete review');
            }
        });
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {review.status !== 'approved' && (
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatus('approved')}
                    className="bg-lime-300/10 border border-lime-300/30 text-lime-300 hover:bg-lime-300 hover:text-black font-bold text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                    Approve
                </button>
            )}
            {review.status !== 'rejected' && (
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatus('rejected')}
                    className="bg-amber-300/10 border border-amber-300/30 text-amber-300 hover:bg-amber-300 hover:text-black font-bold text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                    Reject
                </button>
            )}
            <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
                Delete
            </button>
        </div>
    );
}

export function ReviewEditDrawer({ review, products }) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await updateReview(fd);
                toast.success(`Review #${review.id} updated successfully!`, { title: 'Updated' });
                setOpen(false);
            } catch (err) {
                toast.error(err.message || 'Failed to update review');
            }
        });
    };

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="text-xs text-lime-300 hover:text-white font-bold cursor-pointer inline-flex items-center gap-1"
            >
                <span>✏️</span> {open ? 'Close editor' : 'Edit review'}
            </button>

            {open && (
                <form onSubmit={handleSubmit} className="mt-3 p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
                    <input type="hidden" name="id" value={review.id} />
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Product</label>
                        <select
                            name="product_id"
                            defaultValue={review.product_id}
                            required
                            className="w-full bg-[#171229] border border-white/10 rounded-lg p-2 text-white text-xs"
                        >
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Author</label>
                            <input
                                name="author"
                                defaultValue={review.author}
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Rating</label>
                            <select
                                name="rating"
                                defaultValue={review.rating}
                                className="w-full bg-[#171229] border border-white/10 rounded-lg p-2 text-white text-xs"
                            >
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>
                                        {n} Star{n === 1 ? '' : 's'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                            <input
                                name="title"
                                defaultValue={review.title}
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                            <select
                                name="status"
                                defaultValue={review.status}
                                className="w-full bg-[#171229] border border-white/10 rounded-lg p-2 text-white text-xs"
                            >
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Review text</label>
                        <textarea
                            name="content"
                            defaultValue={review.content}
                            rows={3}
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-xs"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-lime-300 hover:bg-white text-black font-black px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export function ApproveAllButton({ count }) {
    const [isPending, startTransition] = useTransition();

    const handleApproveAll = () => {
        if (!confirm(`Are you sure you want to approve all ${count} pending review(s)? They will appear immediately on the homepage.`)) {
            return;
        }
        startTransition(async () => {
            try {
                const res = await approveAllReviews();
                toast.success(`All ${res?.count || count} reviews approved and published live!`, { title: 'All Approved' });
            } catch (err) {
                toast.error(err.message || 'Failed to approve all reviews');
            }
        });
    };

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleApproveAll}
            className="inline-flex items-center gap-1.5 bg-lime-300 hover:bg-white text-black font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 uppercase tracking-wider font-mono shadow-sm"
        >
            {isPending ? (
                <>
                    <svg className="animate-spin h-3.5 w-3.5 text-black" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Approving…</span>
                </>
            ) : (
                <>
                    <span className="text-sm leading-none font-black">✓</span>
                    <span>Approve All Pending ({count})</span>
                </>
            )}
        </button>
    );
}

