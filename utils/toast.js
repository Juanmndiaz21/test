import { useToastStore } from '../store/useToastStore';

export const toast = {
    success: (message) => useToastStore.getState().success(message),
    error: (message) => useToastStore.getState().error(message),
    info: (message) => useToastStore.getState().info(message),
};