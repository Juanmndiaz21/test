'use client';

import { useRef, useState, useTransition } from 'react';
import { addProduct } from './actions';
import { toast } from '../../../utils/toast';
import ConfiguratorEditor from './ConfiguratorEditor';
import ImageUploadField from './ImageUploadField';
import { PlatformFormField } from './PlatformSelector';
import Icon from '../../../components/Icon';

export default function AddProductForm({ selectedGame, initialOptions }) {
    const formRef = useRef(null);
    const [isPending, startTransition] = useTransition();
    const [game, setGame] = useState(selectedGame || '');
    const [isOpen, setIsOpen] = useState(Boolean(selectedGame));

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                await addProduct(fd);
                toast.success('Service created successfully!', { title: 'Product Added' });
                formRef.current?.reset();
                setGame(selectedGame || '');
            } catch (err) {
                toast.error(err.message || 'Failed to add service');
            }
        });
    };

    return (
        <div className="panel-surface rounded-2xl border border-white/10 bg-[#171229] overflow-hidden mb-8 transition-all">
            {/* Header Accordion Bar */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-white/5 bg-[#120e1c]/60">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#9d7cff]/10 border border-[#9d7cff]/20 flex items-center justify-center text-[#9d7cff]">
                        <Icon name="plus" className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                            {selectedGame ? `New Service for ${selectedGame}` : 'Create New Service'}
                        </h2>
                        <p className="text-xs text-slate-400">
                            Configure pricing, platform compatibility, and service details
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-[#9d7cff]/40 bg-[#120e1c] text-xs font-mono font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                    <span>{isOpen ? 'Collapse Form' : '+ New Service'}</span>
                    <Icon
                        name="chevron-down"
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {/* Collapsible Form Body */}
            {isOpen && (
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150"
                >
                    {/* Service Name */}
                    <div className="w-full">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Service Name *
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. GTA V 500M Cash + Rank 120"
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    {/* Game Category */}
                    <div className="w-full">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Game Category *
                        </label>
                        <input
                            name="game"
                            type="text"
                            required
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                            readOnly={Boolean(selectedGame)}
                            placeholder="e.g. GTA 5, CS2, BO6..."
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 read-only:text-[#9d7cff] read-only:cursor-not-allowed focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    {/* Platform Selector (Interactive component) */}
                    <div className="w-full md:col-span-2 p-4 rounded-2xl bg-[#120e1c] border border-white/10">
                        <PlatformFormField initialPlatform="PlayStation/Xbox" />
                    </div>

                    {/* Pricing */}
                    <div className="w-full">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Sale Price ($ USD) *
                        </label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            placeholder="29.99"
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Original Was Price ($ USD) <span className="text-slate-500 font-normal lowercase">(strikethrough discount)</span>
                        </label>
                        <input
                            name="original_price"
                            type="number"
                            step="0.01"
                            placeholder="49.99"
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    {/* Configurator Editor */}
                    <div className="w-full md:col-span-2">
                        <ConfiguratorEditor />
                    </div>

                    {/* Card Features */}
                    <div className="w-full md:col-span-2">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Card Bullet Points <span className="text-slate-500 font-normal lowercase">(one per line, shown on store card)</span>
                        </label>
                        <textarea
                            name="features"
                            rows="3"
                            placeholder="Instant Delivery via Safe Method&#10;Includes Free Unlock All&#10;Anti-Ban Warranty Guaranteed"
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white font-mono text-xs placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div className="w-full md:col-span-2">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Full Service Description
                        </label>
                        <textarea
                            name="description"
                            rows="3"
                            placeholder="Detailed explanation of what the customer receives, safety methods, and timeframe..."
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    {/* Image / Logo Upload */}
                    <div className="w-full md:col-span-2">
                        <ImageUploadField label="Service Thumbnail / Cover Art" />
                    </div>

                    {/* How It Works & Requirements */}
                    <div className="w-full">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            How It Works <span className="text-slate-500 font-normal lowercase">(one step per line)</span>
                        </label>
                        <textarea
                            name="how_it_works"
                            rows="3"
                            placeholder="1. Choose your desired package&#10;2. Submit account details securely&#10;3. Sit back while we fulfill the order"
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Account Requirements <span className="text-slate-500 font-normal lowercase">(one per line)</span>
                        </label>
                        <textarea
                            name="requirements"
                            rows="3"
                            placeholder="Clean account without previous bans&#10;2FA temporarily disabled or code provided"
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    <div className="w-full md:col-span-2">
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Frequently Asked Questions
                        </label>
                        <textarea
                            name="faqs"
                            rows="3"
                            placeholder="How long does it take? Most orders complete within 1-2 hours.&#10;Is it safe? Yes, we use tested private methods."
                            className="w-full bg-[#120e1c] border border-white/10 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                        />
                    </div>

                    {/* Submit Bar */}
                    <div className="w-full md:col-span-2 pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black text-xs font-mono uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-[#0d0914] border-t-transparent rounded-full animate-spin" />
                                    <span>Creating Service...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="plus" className="w-4 h-4" />
                                    <span>Create Service</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
