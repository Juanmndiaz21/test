'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '../utils/toast';
import { addGame } from '../app/store/actions';

export default function AddGameForm() {
    const { data: session, status } = useSession();
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [mode, setMode] = useState('both');
    const [isPending, startTransition] = useTransition();

    if (status !== 'authenticated' || !session?.user) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('image_url', imageUrl);
        formData.set('mode', mode);

        startTransition(async () => {
            try {
                await addGame(formData);
                toast.success(`Game added: ${name.trim()}`);
                setName('');
                setImageUrl('');
                setMode('both');
            } catch (error) {
                toast.error(error.message || 'Could not add the game.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="panel-surface rounded-2xl p-4 mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.3fr_0.9fr_1.3fr_auto] gap-3 md:items-end">
            <div className="flex-1">
                <label htmlFor="new-game" className="eyebrow block mb-2">Admin · Add game</label>
                <input id="new-game" value={name} onChange={(event) => setName(event.target.value)} required placeholder="e.g. GTA V" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <div>
                <label htmlFor="new-game-mode" className="eyebrow block mb-2">Game mode</label>
                <select id="new-game-mode" value={mode} onChange={(event) => setMode(event.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none">
                    <option value="both">Multiplayer + Singleplayer</option>
                    <option value="multiplayer">Multiplayer</option>
                    <option value="singleplayer">Singleplayer</option>
                </select>
            </div>
            <div>
                <label htmlFor="new-game-image" className="eyebrow block mb-2">Game image URL</label>
                <input id="new-game-image" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <button type="submit" disabled={isPending} className="bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black px-5 py-3 rounded-lg transition-colors">
                {isPending ? 'Adding...' : 'Add game'}
            </button>
        </form>
    );
}