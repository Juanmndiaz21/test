import { create } from 'zustand';

const DEFAULT_DURATION = 6500;
const EXIT_MS = 280;

export const useToastStore = create((set, get) => ({
    toasts: [],
    show: (message, type = 'info', duration = DEFAULT_DURATION) => {
        const id = Math.random().toString(36).slice(2);
        set((state) => ({ toasts: [...state.toasts, { id, message, type, leaving: false }] }));
        setTimeout(() => get().dismiss(id), duration);
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
    success: (message) => get().show(message, 'success'),
    error: (message) => get().show(message, 'error'),
    info: (message) => get().show(message, 'info'),
}));