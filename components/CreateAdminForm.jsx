'use client';

import { useActionState, useEffect } from 'react';
import { createAdmin } from '../app/login/actions';
import { toast } from '../utils/toast';

const initialState = { success: null, error: null };

export default function CreateAdminForm() {
    const [state, formAction, isPending] = useActionState(createAdmin, initialState);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success, { title: 'Admin Created' });
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form action={formAction} className="panel-surface p-6 rounded-2xl space-y-4">
            <p className="eyebrow">Control room · New administrator</p>

            {state?.error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">{state.error}</div>
            )}
            {state?.success && (
                <div className="bg-lime-900/40 border border-lime-500 text-lime-200 p-3 rounded-lg text-sm">{state.success}</div>
            )}

            <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input name="email" type="email" required placeholder="nuevo.admin@example.com" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-2">Password</label>
                <input name="password" type="password" required minLength={6} placeholder="Min. 6 characters" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
            </div>

            <button type="submit" disabled={isPending} className="w-full bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black py-3 px-6 rounded-lg transition-colors">
                {isPending ? 'CREATING...' : 'CREATE ADMINISTRATOR'}
            </button>
        </form>
    );
}