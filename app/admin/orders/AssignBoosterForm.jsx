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
        <form action={formAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={orderId} />
            <input
                name="booster"
                type="text"
                defaultValue={currentBooster || ''}
                placeholder="Booster name"
                className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-lime-300 outline-none w-36"
            />
            <button
                type="submit"
                disabled={isPending}
                className="bg-black/20 border border-white/10 hover:border-lime-300/60 disabled:opacity-60 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
                {isPending ? '...' : 'Assign'}
            </button>
            {state?.error && <span className="text-xs text-red-300">{state.error}</span>}
        </form>
    );
}