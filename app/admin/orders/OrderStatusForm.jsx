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
        <form action={formAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={orderId} />
            <select
                name="status"
                defaultValue={currentStatus}
                className="bg-[#171229] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-lime-300 outline-none"
            >
                {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
                ))}
            </select>
            <button
                type="submit"
                disabled={isPending}
                className="bg-lime-300 hover:bg-white disabled:bg-slate-700 text-black font-black text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
                {isPending ? '...' : 'Save'}
            </button>
            {state?.error && <span className="text-xs text-red-300">{state.error}</span>}
        </form>
    );
}