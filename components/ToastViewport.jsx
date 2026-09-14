'use client';

import { useToastStore } from '../store/useToastStore';
import Icon from './Icon';

const ICON_NAME = {
    success: 'check-circle',
    error: 'alert-circle',
    info: 'info',
};

const accent = {
    success: 'text-lime-300',
    error: 'text-red-400',
    info: 'text-lime-300',
};

const lifeBar = {
    success: 'bg-lime-300',
    error: 'bg-red-400',
    info: 'bg-lime-300/60',
};

export default function ToastViewport() {
    const toasts = useToastStore((state) => state.toasts);
    const dismiss = useToastStore((state) => state.dismiss);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-20 right-5 z-[100] flex flex-col gap-3 pointer-events-none" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="status"
                    className={`pointer-events-auto w-80 max-w-[calc(100vw-2.5rem)] panel-surface rounded-xl px-4 py-3 pt-3.5 shadow-xl relative overflow-hidden ${toast.leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
                >
                    <span className={`absolute inset-y-0 left-0 w-1 ${lifeBar[toast.type]}`} aria-hidden="true" />
                    <div className="flex items-center gap-3">
                        <span className={`shrink-0 h-7 w-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center ${accent[toast.type]}`}>
                            <Icon name={ICON_NAME[toast.type]} className="w-4 h-4" strokeWidth={2.2} />
                        </span>
                        <p className="flex-1 text-sm text-slate-200 leading-snug break-words">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            aria-label="Close notification"
                            className="shrink-0 text-slate-400 hover:text-white transition-colors"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    </div>
                    {!toast.leaving && toast.type !== 'info' && (
                        <span className={`absolute bottom-0 left-0 h-0.5 animate-toast-life ${lifeBar[toast.type]}`} aria-hidden="true" />
                    )}
                </div>
            ))}
        </div>
    );
}