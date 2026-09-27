'use client';

import { useTransition } from 'react';
import { deleteOrder } from './actions';
import { toast } from '../../../utils/toast';
import Icon from '../../../components/Icon';

export default function DeleteOrderButton({ orderId }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to permanently delete order #${orderId}?`)) return;
        startTransition(async () => {
            try {
                const res = await deleteOrder(orderId);
                if (res.success) {
                    toast.success(res.message || `Order #${orderId} deleted`);
                } else {
                    toast.error(res.error || 'Error deleting order');
                }
            } catch (err) {
                toast.error(err.message || 'Error deleting order');
            }
        });
    };

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            title={`Delete order #${orderId}`}
            aria-label={`Delete order #${orderId}`}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer disabled:opacity-40 inline-flex items-center justify-center"
        >
            {isPending ? (
                <span className="text-[10px] font-mono font-bold animate-pulse px-1">...</span>
            ) : (
                <Icon name="trash" className="w-3.5 h-3.5" />
            )}
        </button>
    );
}
