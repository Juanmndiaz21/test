'use client';

import { useActionState, useEffect } from 'react';
import { updateOrderStatus } from './actions';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../../lib/orders';
import { toast } from '../../../utils/toast';

const initialState = { success: null, error: null };

export default function OrderStatusForm({ orderId, currentStatus }) {
    const [state, formAction, isPending] = useActionState(updateOrderStatus, initialState);

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
            <select
                name="status"
                defaultValue={currentStatus}
                className="bg-black/40 border border-white/10 hover:border-[#9d7cff]/40 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 focus:border-[#9d7cff] outline-none transition-colors"
            >
                {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status} className="bg-[#171229] text-white">
                        {ORDER_STATUS_LABELS[status]}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                disabled={isPending}
                className="bg-[#9d7cff]/15 hover:bg-[#9d7cff] text-[#9d7cff] hover:text-[#0d0914] border border-[#9d7cff]/30 disabled:opacity-50 font-mono font-bold text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
            >
                {isPending ? '...' : 'Save'}
            </button>
            {state?.error && <span className="text-[10px] text-red-300 font-mono">{state.error}</span>}
        </form>
    );
}