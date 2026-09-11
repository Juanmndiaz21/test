'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { updateProductSection } from '../app/admin/products/actions';

export default function EditableContentSection({ productId, section, title, initialItems, renderItem }) {
    const { data: session } = useSession();
    const [items, setItems] = useState(initialItems);
    const [editingIndex, setEditingIndex] = useState(null);
    const [draft, setDraft] = useState('');
    const [isPending, startTransition] = useTransition();
    const isAdmin = Boolean(session?.user);

    const save = (nextItems) => {
        setItems(nextItems);
        startTransition(async () => {
            try {
                await updateProductSection(productId, section, nextItems);
                toast.success('Contenido actualizado.');
            } catch (error) {
                toast.error(error.message || 'No se pudo guardar.');
            }
        });
    };

    const addItem = () => {
        setItems([...items, '']);
        setEditingIndex(items.length);
        setDraft('');
    };

    const editItem = (index) => {
        setEditingIndex(index);
        setDraft(items[index]);
    };

    const commitEdit = () => {
        if (!draft.trim()) return;
        const nextItems = items.map((item, index) => index === editingIndex ? draft.trim() : item);
        setEditingIndex(null);
        save(nextItems);
    };

    const removeItem = (index) => save(items.filter((_, itemIndex) => itemIndex !== index));

    return (
        <section className="mt-12">
            <div className="flex items-center gap-4 mb-5">
                <h2 className="display-font text-4xl uppercase text-white">{title}</h2>
                {isAdmin && <button type="button" onClick={addItem} disabled={isPending} aria-label={`Agregar ${title}`} className="w-10 h-10 rounded-lg border border-white bg-white text-black text-2xl leading-none hover:bg-lime-300 transition-colors">+</button>}
                <div className="h-px bg-white/10 flex-1" />
            </div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={`${section}-${index}`} className="relative group">
                        {editingIndex === index ? (
                            <div className="panel-surface rounded-xl p-4 flex gap-3">
                                <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && commitEdit()} className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-lime-300" />
                                <button type="button" onClick={commitEdit} className="bg-lime-300 text-black font-bold px-3 rounded-lg">Save</button>
                            </div>
                        ) : (
                            <div className="panel-surface rounded-xl p-4 pr-24 text-slate-400">{renderItem ? renderItem(item) : item}</div>
                        )}
                        {isAdmin && editingIndex !== index && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 transition-opacity"><button type="button" onClick={() => editItem(index)} aria-label="Editar" className="w-8 h-8 rounded-lg border border-red-500 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white">✎</button><button type="button" onClick={() => removeItem(index)} aria-label="Eliminar" className="w-8 h-8 rounded-lg border border-red-500 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white">×</button></div>}
                    </div>
                ))}
            </div>
        </section>
    );
}