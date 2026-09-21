'use client';

import { useRef, useTransition } from 'react';
import { addProduct } from './actions';
import { toast } from '../../../utils/toast';
import ProductOptionsEditor from './ProductOptionsEditor';

export default function AddProductForm({ selectedGame, initialOptions }) {
    const formRef = useRef(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                await addProduct(fd);
                toast.success('Service created successfully!', { title: 'Product Added' });
                formRef.current?.reset();
            } catch (err) {
                toast.error(err.message || 'Failed to add service');
            }
        });
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="panel-surface p-6 rounded-2xl mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex-grow w-full">
                <label className="block text-sm text-slate-400 mb-2">Service name</label>
                <input name="name" type="text" required placeholder="e.g. GTA V Cash Boost" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <div className="w-full">
                <label className="block text-sm text-slate-400 mb-2">Game</label>
                <input name="game" type="text" required defaultValue={selectedGame} readOnly={Boolean(selectedGame)} placeholder="e.g. GTA V" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white read-only:text-lime-300 read-only:cursor-not-allowed focus:border-lime-300 outline-none" />
            </div>
            <ProductOptionsEditor initialOptions={initialOptions} />
            <div className="w-full">
                <label className="block text-sm text-slate-400 mb-2">Price ($)</label>
                <input name="price" type="number" step="0.01" required placeholder="25.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <div className="w-full">
                <label className="block text-sm text-slate-400 mb-2">Original / Was Price ($) <span className="text-xs text-slate-500">(strikethrough)</span></label>
                <input name="original_price" type="number" step="0.01" placeholder="35.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <div className="w-full">
                <label className="block text-sm text-slate-400 mb-2">Platform</label>
                <select name="platform" defaultValue="PlayStation/Xbox" className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none">
                    <option value="PlayStation/Xbox">PlayStation / Xbox</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="PC">PC</option>
                    <option value="PC/PlayStation/Xbox">All (PC / PlayStation / Xbox)</option>
                </select>
            </div>
            <div className="w-full md:col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Card Features / Bullet Points <span className="text-xs text-slate-500">(one per line, shown on card)</span></label>
                <textarea name="features" rows="3" placeholder="Cash Amount Selected&#10;Rank Amount Selected&#10;Fast Run (Optional Addon)" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-lime-300 outline-none" />
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
            <button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black py-3 px-6 rounded-lg transition-colors cursor-pointer md:col-span-2"
            >
                {isPending ? 'Adding service...' : 'Add service'}
            </button>
        </form>
    );
}

