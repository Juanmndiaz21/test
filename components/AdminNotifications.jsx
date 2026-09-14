'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { ORDER_STATUS_LABELS } from '../lib/orders';

const POLL_MS = 30000;

function timeAgo(value) {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    return `${Math.floor(hours / 24)} d ago`;
}

const STATUS_DOT = {
    queued: 'bg-lime-300',
    in_progress: 'bg-lime-400',
    completed: 'bg-lime-200',
    delivered: 'bg-white',
    cancelled: 'bg-red-400',
};

export default function AdminNotifications() {
    const [data, setData] = useState({ queued: 0, inProgress: 0, recent: [] });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const panelRef = useRef(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const response = await fetch('/api/admin/notifications');
                if (!response.ok) {
                    if (response.status === 401) {
                        window.location.href = '/login';
                        return;
                    }
                    return;
                }
                const json = await response.json();
                if (active) {
                    setData(json);
                }
            } catch {
                /* keep the last known state */
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        const interval = setInterval(load, POLL_MS);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!open) return;
        const closeOnOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutside);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOnOutside);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open]);

    const badge = data.queued;

    return (
        <div className="relative" ref={panelRef}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={`Notifications, ${badge} ${badge === 1 ? 'order' : 'orders'} waiting`}
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-lime-300/40 hover:text-lime-300 transition-colors"
            >
                <Icon name="bell" className="w-4.5 h-4.5" />
                {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-lime-300 text-black text-[11px] font-black flex items-center justify-center">
                        {badge}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Order notifications"
                    className="absolute left-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] panel-surface rounded-xl overflow-hidden z-50 border-lime-300/20"
                >
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <p className="font-bold text-white flex items-center gap-2">
                            <Icon name="bell" className="w-4 h-4 text-lime-300" />
                            Notifications
                        </p>
                        <span className="text-xs text-slate-400">
                            {data.queued} queued · {data.inProgress} active
                        </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading && data.recent.length === 0 ? (
                            <div className="flex items-center gap-3 px-4 py-4 text-sm text-slate-400">
                                <span className="h-4 w-4 rounded-full border-2 border-lime-300/40 border-t-lime-300 animate-spin" />
                                Loading…
                            </div>
                        ) : data.recent.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-slate-400">No orders yet.</p>
                        ) : (
                            data.recent.map((order) => (
                                <Link
                                    key={order.id}
                                    href="/admin/orders"
                                    onClick={() => setOpen(false)}
                                    className="flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[order.status] || 'bg-slate-400'}`} aria-hidden="true" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-white truncate">
                                            #{order.id} · {order.customer_name}
                                        </span>
                                        <span className="block text-xs text-slate-400 truncate">
                                            {ORDER_STATUS_LABELS[order.status] || order.status} · ${Number(order.total).toFixed(2)}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-xs text-slate-500">{timeAgo(order.created_at)}</span>
                                </Link>
                            ))
                        )}
                    </div>

                    <Link
                        href="/admin/orders"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center px-4 py-3 text-sm font-bold text-lime-300 hover:bg-lime-300 hover:text-black transition-colors"
                    >
                        Manage all orders
                    </Link>
                </div>
            )}
        </div>
    );
}