import { create } from 'zustand';

const DEFAULT_DURATION = 5000;
const EXIT_MS = 300;

export const useToastStore = create((set, get) => ({
    toasts: [],
    show: (message, type = 'info', opts = {}) => {
        const id = Math.random().toString(36).slice(2);
        const duration = typeof opts === 'number' ? opts : (opts?.duration || DEFAULT_DURATION);
        const title = typeof opts === 'object' ? opts?.title : null;
        set((state) => ({
            // Keep at most 4 toasts visible at a time to keep UI crisp
            toasts: [...state.toasts.filter((t) => !t.leaving).slice(-3), {
                id,
                message,
                type,
                title,
                duration,
                leaving: false,
            }],
        }));
        return id;
    },
    dismiss: (id) => {
        const target = get().toasts.find((toast) => toast.id === id);
        if (!target || target.leaving) return;
        set((state) => ({
            toasts: state.toasts.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
        }));
        setTimeout(() => get().remove(id), EXIT_MS);
    },
    remove: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
    clearAll: () => set({ toasts: [] }),
    success: (message, opts) => get().show(message, 'success', opts),
    error: (message, opts) => get().show(message, 'error', opts),
    warning: (message, opts) => get().show(message, 'warning', opts),
    info: (message, opts) => get().show(message, 'info', opts),
}));