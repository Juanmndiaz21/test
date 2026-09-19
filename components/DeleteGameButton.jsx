'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '../utils/toast';
import { deleteGame } from '../app/store/actions';

export default function DeleteGameButton({ game }) {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState('');
    const [isPending, startTransition] = useTransition();

    if (status !== 'authenticated' || !session?.user) return null;
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return null;

    const matches = typed.trim() === game;

    const close = () => {
        setOpen(false);
        setTyped('');
    };

    const confirm = () => {
        if (!matches || isPending) return;
        startTransition(async () => {
            try {
                await deleteGame(game);
                toast.success(`Category deleted: ${game}`);
                close();
            } catch (error) {
                toast.error(error.message || 'Could not delete the category.');
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
                    setOpen(true);
                }}
                aria-label={`Delete category ${game}`}
                title={`Delete category ${game}`}
                className="border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white font-bold text-xs uppercase tracking-wide px-4 py-3 rounded-lg transition-colors"
            >
                Delete category
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) close();
                    }}
                >
                    <div className="panel-surface rounded-2xl p-7 w-full max-w-md" role="dialog" aria-modal="true" aria-label={`Delete category ${game}`}>
                        <p className="eyebrow mb-2">Risk zone</p>
                        <h3 className="display-font text-3xl uppercase text-white mb-3">Delete category</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            You are about to remove <strong className="text-white">{game}</strong> from the Browse games catalog. Its services will move to the{' '}
                            <strong className="text-white">General</strong> category. This action cannot be undone.
                        </p>

                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Type the exact name to confirm
                        </label>
                        <input
                            value={typed}
                            onChange={(event) => setTyped(event.target.value)}
                            disabled={isPending}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') confirm();
                            }}
                            placeholder={`"${game}"`}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none disabled:opacity-50"
                            autoFocus
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={close}
                                disabled={isPending}
                                className="flex-1 border border-white/10 text-slate-300 hover:border-white/40 hover:text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirm}
                                disabled={!matches || isPending}
                                className="flex-1 bg-red-600 enabled:hover:bg-red-500 disabled:opacity-40 text-white font-black py-3 px-4 rounded-lg transition-colors"
                            >
                                {isPending ? 'DELETING...' : 'DELETE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}