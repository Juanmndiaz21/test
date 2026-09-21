'use client';

import { useState, useTransition } from 'react';
import { deleteProduct, updateProduct } from './actions';
import { toast } from '../../../utils/toast';
import ProductOptionsEditor from './ProductOptionsEditor';
import ConfiguratorEditor from './ConfiguratorEditor';

export function ProductDeleteButton({ productId, productName }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
        startTransition(async () => {
            try {
                await deleteProduct(productId);
                toast.error(`Service "${productName}" removed`, { title: 'Product Deleted' });
            } catch (err) {
                toast.error(err.message || 'Failed to delete product');
            }
        });
    };

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 font-bold text-sm cursor-pointer disabled:opacity-50"
        >
            {isPending ? '...' : 'Delete'}
        </button>
    );
}

export function ProductEditDrawer({ product, defaultOptions }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await updateProduct(fd);
                toast.success(`Service "${product.name}" updated successfully!`, { title: 'Saved' });
                setOpen(false);
            } catch (err) {
                toast.error(err.message || 'Failed to update service');
            }
        });
    };

    const effectiveOptions = product.options?.length
        ? product.options
        : (product.boost_options?.length ? product.boost_options : defaultOptions);

    return (
        <div className="text-left mb-3">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="text-lime-300 hover:text-white font-bold text-sm cursor-pointer"
            >
                {open ? 'Close edit' : 'Edit content'}
            </button>

            {open && (
                <form onSubmit={handleSubmit} className="panel-surface mt-3 p-4 rounded-xl space-y-3 min-w-72">
                    <input type="hidden" name="id" value={product.id} />
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Name</label>
                        <input name="name" defaultValue={product.name} required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Game</label>
                        <input name="game" type="text" required defaultValue={product.game || ''} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <ProductOptionsEditor initialOptions={effectiveOptions} compact />
                    <ConfiguratorEditor initialData={product.configurator_data} />
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
                        <input name="price" type="number" step="0.01" defaultValue={product.price} required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Original / Was Price ($) <span className="text-[10px] text-slate-500">(strikethrough)</span></label>
                        <input name="original_price" type="number" step="0.01" defaultValue={product.original_price ?? ''} placeholder="e.g. 35.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Platform</label>
                        <select name="platform" defaultValue={product.platform || 'PlayStation/Xbox'} className="w-full bg-[#171229] border border-white/10 rounded-lg p-2 text-white">
                            <option value="PlayStation/Xbox">PlayStation / Xbox</option>
                            <option value="PlayStation">PlayStation</option>
                            <option value="Xbox">Xbox</option>
                            <option value="PC">PC</option>
                            <option value="PC/PlayStation/Xbox">All (PC / PlayStation / Xbox)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Card Features / Bullet Points <span className="text-[10px] text-slate-500">(one per line)</span></label>
                        <textarea name="features" defaultValue={product.features || ''} placeholder="Cash Amount Selected&#10;Rank Amount Selected&#10;Fast Run (Optional Addon)" rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white font-mono text-xs" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                        <input name="image_url" type="url" defaultValue={product.image_url || ''} placeholder="Image URL" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea name="description" defaultValue={product.description || ''} placeholder="Description" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">How It Works</label>
                        <textarea name="how_it_works" defaultValue={product.how_it_works || ''} placeholder="How It Works" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Requirements</label>
                        <textarea name="requirements" defaultValue={product.requirements || ''} placeholder="Requirements" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">FAQs</label>
                        <textarea name="faqs" defaultValue={product.faqs || ''} placeholder="FAQs" rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-lime-300 text-black font-black py-2 rounded-lg cursor-pointer hover:bg-white transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            )}
        </div>
    );
}

