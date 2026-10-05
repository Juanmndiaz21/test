'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from 'next-auth/react';
import { toast } from '../utils/toast';
import { updateGameCategory } from '../app/store/actions';
import ImageUploadField from '../app/admin/products/ImageUploadField';

export default function EditGameButton({ game }) {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(game?.name || '');
    const [mode, setMode] = useState(game?.mode || 'both');
    const [imageUrl, setImageUrl] = useState(game?.image_url || '');
    const [isPending, startTransition] = useTransition();

    if (status !== 'authenticated' || !session?.user) return null;
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return null;

    const openModal = () => {
        setName(game?.name || '');
        setMode(game?.mode || 'both');
        setImageUrl(game?.image_url || '');
        setOpen(true);
    };

    const close = () => setOpen(false);

    const save = (event) => {
        event.preventDefault();
        if (isPending) return;
        const formData = new FormData();
        formData.set('original_name', game?.name || '');
        formData.set('name', name);
        formData.set('mode', mode);
        formData.set('image_url', imageUrl);

        startTransition(async () => {
            try {
                await updateGameCategory(formData);
                toast.success(`Category updated: ${name.trim()}`);
                close();
            } catch (error) {
                toast.error(error.message || 'Could not update the category.');
            }
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openModal();
                }}
                aria-label={`Edit category ${game?.name}`}
                title={`Edit category ${game?.name}`}
                className="border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 font-bold text-xs uppercase tracking-wide px-4 py-3 rounded-lg transition-colors cursor-pointer"
            >
                Edit category
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5"
                        onClick={(event) => {
                            if (event.target === event.currentTarget) close();
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, transform: 'scale(0.96)' }}
                            animate={{ opacity: 1, transform: 'scale(1)' }}
                            exit={{ opacity: 0, transform: 'scale(0.96)' }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="rounded-2xl p-6 sm:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 border border-white/10"
                            role="dialog"
                            aria-modal="true"
                            aria-label={`Edit category ${game?.name}`}
                        >
                            <p className="eyebrow mb-2">Admin · Category editor</p>
                            <h3 className="display-font text-3xl uppercase text-white mb-6">Edit category</h3>

                            <form onSubmit={save} className="space-y-5">
                                <div>
                                    <label htmlFor="edit-game-name" className="block text-sm font-bold text-zinc-300 mb-2">Game name</label>
                                    <input id="edit-game-name" value={name} onChange={(event) => setName(event.target.value)} required placeholder="e.g. GTA V" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="edit-game-mode" className="block text-sm font-bold text-zinc-300 mb-2">Game mode</label>
                                    <select id="edit-game-mode" value={mode} onChange={(event) => setMode(event.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none">
                                        <option value="both">Multiplayer + Singleplayer</option>
                                        <option value="multiplayer">Multiplayer</option>
                                        <option value="singleplayer">Singleplayer</option>
                                    </select>
                                </div>

                                <ImageUploadField
                                    label="Category / Game Logo"
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                />

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={close} disabled={isPending} className="flex-1 border border-white/10 text-zinc-300 hover:border-white/40 hover:text-white font-bold py-3 px-4 rounded-lg transition-colors cursor-pointer">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isPending} className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-black py-3 px-4 rounded-lg transition-colors cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        {isPending ? 'SAVING...' : 'SAVE'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}