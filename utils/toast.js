import { useToastStore } from '../store/useToastStore';

export const toast = (message, typeOrOpts = 'info') => {
    if (typeof typeOrOpts === 'string') {
        return useToastStore.getState().show(message, typeOrOpts);
    }
    return useToastStore.getState().show(message, typeOrOpts?.type || 'info', typeOrOpts);
};

toast.success = (message, opts) => useToastStore.getState().success(message, opts);
toast.error = (message, opts) => useToastStore.getState().error(message, opts);
toast.warning = (message, opts) => useToastStore.getState().warning(message, opts);
toast.info = (message, opts) => useToastStore.getState().info(message, opts);
toast.dismiss = (id) => useToastStore.getState().dismiss(id);
toast.clearAll = () => useToastStore.getState().clearAll();