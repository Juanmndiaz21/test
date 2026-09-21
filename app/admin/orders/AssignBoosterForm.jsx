'use client';

import { useActionState, useEffect } from 'react';
import { assignBooster } from './actions';
import { toast } from '../../../utils/toast';

const initialState = { success: null, error: null };

export default function AssignBoosterForm({ orderId, currentBooster }) {
    const [state, formAction, isPending] = useActionState(assignBooster, initialState);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success);
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form action={formAction} className="flex items-center gap-1.5">
            <input type="hidden" name="id" value={orderId} />
            <input
                name="booster"
                type="text"
                defaultValue={currentBooster || ''}
                placeholder="Booster name"
                className="bg-black/40 border border-white/10 hover:border-[#9d7cff]/40 rounded-lg px-2.5 py-1 text-xs font-mono text-white placeholder:text-slate-500 focus:border-[#9d7cff] outline-none w-28 sm:w-32 transition-colors"
            />
            <button
                type="submit"
                disabled={isPending}
                className="bg-white/5 hover:bg-[#9d7cff] text-slate-300 hover:text-[#0d0914] border border-white/10 hover:border-[#9d7cff] disabled:opacity-50 font-mono font-bold text-xs px-2 py-1 rounded-lg transition-all cursor-pointer"
            >
                {isPending ? '...' : 'Set'}
            </button>
            {state?.error && <span className="text-[10px] text-red-300 font-mono">{state.error}</span>}
        </form>
    );
}