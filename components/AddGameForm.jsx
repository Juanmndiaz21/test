'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '../utils/toast';
import { addGame } from '../app/store/actions';
import ImageUploadField from '../app/admin/products/ImageUploadField';

export default function AddGameForm() {
    const { data: session, status } = useSession();
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [mode, setMode] = useState('both');
    const [isPending, startTransition] = useTransition();

    if (status !== 'authenticated' || !session?.user) return null;
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return null;

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
        <form onSubmit={handleSubmit} className="panel-surface rounded-2xl p-5 mb-8 space-y-4 border border-white/10 bg-[#171229]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="new-game" className="eyebrow block mb-2">Admin · Add game</label>
                    <input id="new-game" value={name} onChange={(event) => setName(event.target.value)} required placeholder="e.g. GTA V" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none" />
                </div>
                <div>
                    <label htmlFor="new-game-mode" className="eyebrow block mb-2">Game mode</label>
                    <select id="new-game-mode" value={mode} onChange={(event) => setMode(event.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none">
                        <option value="both">Multiplayer + Singleplayer</option>
                        <option value="multiplayer">Multiplayer</option>
                        <option value="singleplayer">Singleplayer</option>
                    </select>
                </div>
            </div>

            <ImageUploadField
                label="Category / Game Logo"
                value={imageUrl}
                onChange={setImageUrl}
            />

            <button type="submit" disabled={isPending} className="bg-[#9d7cff] hover:bg-white disabled:bg-slate-700 text-[#0d0914] font-black px-6 py-3 rounded-lg transition-colors cursor-pointer">
                {isPending ? 'Adding...' : 'Add game'}
            </button>
        </form>
    );
}