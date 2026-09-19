'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createReview } from './actions';
import { toast } from '../../../utils/toast';

export default function ReviewForm({ products = [], onCancel }) {
    const formRef = useRef(null);
    const [state, formAction, isPending] = useActionState(async (prev, formData) => {
        const res = await createReview(prev, formData);
        if (!res?.error) {
            formRef.current?.reset();
            return { error: null, success: true };
        }
        return res;
    }, { error: null, success: false });

    useEffect(() => {
        if (state?.success) {
            toast.success('Review created and published successfully!');
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="panel-surface flex flex-col gap-5 rounded-2xl p-6 border border-lime-300/20">
            <div className="flex items-baseline justify-between gap-4">
                <div>
                    <h2 className="display-font text-2xl uppercase text-white">Add Review</h2>
                    <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">
                        Create and publish a verified review as an administrator
                    </p>
                </div>
                {state?.error && (
                    <p className="max-w-xs text-xs font-semibold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg">{state.error}</p>
                )}
                {state?.success && (
                    <p className="max-w-xs text-xs font-semibold text-lime-300 bg-lime-300/10 px-3 py-1.5 rounded-lg">Review created successfully!</p>
                )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-xs uppercase tracking-widest text-slate-400">
                    Product
                    <select
                        name="product_id"
                        required
                        defaultValue=""
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#171229] px-3 py-2 text-sm text-white focus:border-lime-300 outline-none"
                    >
                        <option value="" disabled>
                            Select a product…
                        </option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block text-xs uppercase tracking-widest text-slate-400">
                    Author
                    <input
                        name="author"
                        placeholder="Customer or Player Name"
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-lime-300 outline-none"
                    />
                </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
                <label className="block text-xs uppercase tracking-widest text-slate-400">
                    Rating
                    <select
                        name="rating"
                        defaultValue="5"
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#171229] px-3 py-2 text-sm text-white focus:border-lime-300 outline-none"
                    >
                        {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                                {n} Star{n === 1 ? '' : 's'}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block text-xs uppercase tracking-widest text-slate-400">
                    Status
                    <select
                        name="status"
                        defaultValue="approved"
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#171229] px-3 py-2 text-sm text-white focus:border-lime-300 outline-none"
                    >
                        <option value="approved">Approved (Live on website)</option>
                        <option value="pending">Pending (Hidden draft)</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </label>

                <label className="block text-xs uppercase tracking-widest text-slate-400">
                    Title
                    <input
                        name="title"
                        required
                        placeholder="Headline (e.g. Fast delivery, worked perfectly!)"
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-lime-300 outline-none"
                    />
                </label>
            </div>

            <label className="block text-xs uppercase tracking-widest text-slate-400">
                Review Content
                <textarea
                    name="content"
                    required
                    rows={3}
                    placeholder="Write the full feedback text..."
                    className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-lime-300 outline-none"
                />
            </label>

            <div className="flex items-center justify-between gap-3 pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-lime-300 px-6 py-2.5 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                    {isPending ? 'Saving…' : 'Publish review'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-xs uppercase tracking-widest text-slate-400 hover:text-white font-bold"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
