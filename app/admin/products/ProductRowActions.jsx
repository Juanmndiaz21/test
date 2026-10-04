'use client';

import { useState, useTransition } from 'react';
import { deleteProduct, updateProduct } from './actions';
import { toast } from '../../../utils/toast';
import ConfiguratorEditor from './ConfiguratorEditor';
import ImageUploadField from './ImageUploadField';
import { PlatformFormField } from './PlatformSelector';
import ProductDescriptionEditor from './ProductDescriptionEditor';
import Icon from '../../../components/Icon';
import SwipeRow from '../../../components/SwipeRow';
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive02Icon, Delete02Icon } from '@hugeicons/core-free-icons';

export function ProductDeleteButton({ productId, productName }) {
    const [isPending, startTransition] = useTransition();
    const [confirming, setConfirming] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const res = await deleteProduct(productId);
                if (res?.error) {
                    toast.error(res.error, { title: 'Delete Failed' });
                    return;
                }
                toast.success(`Service "${productName}" deleted successfully`, { title: 'Product Deleted' });
                setConfirming(false);
            } catch (err) {
                toast.error(err.message || 'Failed to delete product');
            }
        });
    };

    if (confirming) {
        return (
            <div className="w-56 shrink-0">
                <SwipeRow
                    actions={[
                        { id: 'delete', label: 'Delete', icon: <HugeiconsIcon icon={Delete02Icon} size={18} /> },
                        { id: 'archive', label: 'Cancel', icon: <HugeiconsIcon icon={Archive02Icon} size={18} />, dismiss: true }
                    ]}
                    onAction={(act) => {
                        if (act.id === 'archive') setConfirming(false);
                    }}
                    onCommit={(act) => {
                        if (act.id === 'delete') handleDelete();
                        else setConfirming(false);
                    }}
                    actionColor="#e5484d"
                    drawerColor="#3f3f46"
                    rowColor="#27272a"
                    textColor="#f5f5f5"
                    height={36}
                    radius={12}
                    actionWidth={68}
                    direction="left"
                    snapBounce={0.2}
                    resistance={0.55}
                    collapseMs={200}
                    commitAt={0.5}
                    fullSwipe
                >
                    <div className="flex items-center justify-between px-3 py-2 text-[11px] font-mono text-red-300">
                        <span className="flex items-center gap-1">
                            <span className="animate-pulse">←</span> Swipe to delete
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirming(false);
                            }}
                            className="text-[10px] text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </SwipeRow>
            </div>
        );
    }

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirming(true)}
            title={`Delete ${productName}`}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
        >
            <Icon name="trash" className="w-4 h-4" />
            <span className="sr-only">Delete</span>
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
                const res = await updateProduct(fd);
                if (res?.error) {
                    toast.error(res.error, { title: 'Update Failed' });
                    return;
                }
                toast.success(`Service "${product.name}" updated successfully!`, { title: 'Changes Saved' });
                setOpen(false);
            } catch (err) {
                toast.error(err.message || 'Failed to update service');
            }
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#120e1c] hover:border-[#9d7cff]/40 text-slate-200 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                title="Edit service content, platforms, and pricing"
            >
                <Icon name="edit" className="w-3.5 h-3.5 text-[#9d7cff]" />
                <span>Edit</span>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => !isPending && setOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-full max-w-2xl bg-[#171229] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 flex flex-col h-full animate-in slide-in-from-right duration-200">
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#120e1c]/80 backdrop-blur-md">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#9d7cff]/10 text-[#9d7cff] border border-[#9d7cff]/20 font-bold">
                                        #{product.id}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">{product.game || 'General'}</span>
                                </div>
                                <h3 className="text-base font-bold text-white truncate max-w-md">
                                    {product.name}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                                aria-label="Close drawer"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Scrollable Content */}
                        <form id={`edit-product-form-${product.id}`} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <input type="hidden" name="id" value={product.id} />

                            {/* Section 1: Basic info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9d7cff] font-bold border-b border-white/5 pb-1.5">
                                    General Information
                                </h4>
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Service Name</label>
                                    <input
                                        name="name"
                                        defaultValue={product.name}
                                        required
                                        className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#9d7cff] outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-300 mb-1.5">Game Category</label>
                                        <input
                                            name="game"
                                            type="text"
                                            required
                                            defaultValue={product.game || ''}
                                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#9d7cff] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-slate-300 mb-1.5">Boost Amount (M) <span className="text-[11px] text-slate-500">(Optional)</span></label>
                                        <input
                                            name="boost_amount"
                                            type="number"
                                            defaultValue={product.boost_amount ?? ''}
                                            placeholder="e.g. 50"
                                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#9d7cff] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Platform Selection (Enhanced) */}
                            <div className="p-4 rounded-2xl bg-[#120e1c] border border-white/10 space-y-3">
                                <PlatformFormField initialPlatform={product.platform} />
                            </div>

                            {/* Section 3: Pricing */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9d7cff] font-bold border-b border-white/5 pb-1.5">
                                    Pricing
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-300 mb-1.5">Price ($ USD)</label>
                                        <input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            defaultValue={product.price}
                                            required
                                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-[#9d7cff] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-slate-300 mb-1.5">Original / Was Price ($) <span className="text-[11px] text-slate-500">(strikethrough)</span></label>
                                        <input
                                            name="original_price"
                                            type="number"
                                            step="0.01"
                                            defaultValue={product.original_price ?? ''}
                                            placeholder="e.g. 35.00"
                                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-[#9d7cff] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Configurator */}
                            <div className="space-y-4">
                                <ConfiguratorEditor initialData={product.configurator_data} />
                            </div>

                            {/* Section 5: Features & Media */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9d7cff] font-bold border-b border-white/5 pb-1.5">
                                    Card Details & Media
                                </h4>
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                                        Card Features / Bullet Points <span className="text-[11px] text-slate-500">(one per line)</span>
                                    </label>
                                    <textarea
                                        name="features"
                                        defaultValue={product.features || ''}
                                        placeholder="Cash Amount Selected&#10;Rank Amount Selected&#10;Fast Run (Optional Addon)"
                                        rows="3"
                                        className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white font-mono text-xs focus:border-[#9d7cff] outline-none"
                                    />
                                </div>

                                <ImageUploadField defaultValue={product.image_url} compact />

                                <ProductDescriptionEditor
                                    defaultValue={product.description || ''}
                                    label="Product Description"
                                />
                            </div>

                            {/* Section 6: Additional Information */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9d7cff] font-bold border-b border-white/5 pb-1.5">
                                    How it Works & Requirements
                                </h4>
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 mb-1.5">How It Works <span className="text-[11px] text-slate-500">(one step per line)</span></label>
                                    <textarea
                                        name="how_it_works"
                                        defaultValue={product.how_it_works || ''}
                                        placeholder="Step 1: Choose package&#10;Step 2: Provide details&#10;Step 3: Fast delivery"
                                        rows="3"
                                        className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white text-xs focus:border-[#9d7cff] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Requirements <span className="text-[11px] text-slate-500">(one requirement per line)</span></label>
                                    <textarea
                                        name="requirements"
                                        defaultValue={product.requirements || ''}
                                        placeholder="Active account on selected platform&#10;Login credentials provided securely"
                                        rows="3"
                                        className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white text-xs focus:border-[#9d7cff] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Frequently Asked Questions <span className="text-[11px] text-slate-500">(Question and Answer per entry)</span></label>
                                    <textarea
                                        name="faqs"
                                        defaultValue={product.faqs || ''}
                                        placeholder="Is it safe? Yes, we use encrypted connections."
                                        rows="3"
                                        className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white text-xs focus:border-[#9d7cff] outline-none"
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Drawer Sticky Footer */}
                        <div className="p-5 border-t border-white/10 bg-[#120e1c] flex items-center justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form={`edit-product-form-${product.id}`}
                                disabled={isPending}
                                className="px-6 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black text-xs font-mono uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-[#0d0914] border-t-transparent rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="check" className="w-3.5 h-3.5" />
                                        <span>Save changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
