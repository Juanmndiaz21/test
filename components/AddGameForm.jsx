'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { addGame } from '../app/store/actions';

export default function AddGameForm() {
    const { data: session, status } = useSession();
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isPending, startTransition] = useTransition();

    if (status !== 'authenticated' || !session?.user) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('image_url', imageUrl);

        startTransition(async () => {
            try {
                await addGame(formData);
                toast.success(`Juego agregado: ${name.trim()}`);
                setName('');
                setImageUrl('');
            } catch (error) {
                toast.error(error.message || 'No se pudo agregar el juego.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="panel-surface rounded-2xl p-4 mb-8 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
            <div className="flex-1">
                <label htmlFor="new-game" className="eyebrow block mb-2">Admin · Add game</label>
                <input id="new-game" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ej: GTA V" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <div>
                <label htmlFor="new-game-image" className="eyebrow block mb-2">Game image URL</label>
                <input id="new-game-image" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <button type="submit" disabled={isPending} className="bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black px-5 py-3 rounded-lg transition-colors">
                {isPending ? 'Agregando...' : 'Agregar juego'}
            </button>
        </form>
    );
}