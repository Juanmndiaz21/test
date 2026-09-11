import { create } from 'zustand';

export const useCartStore = create((set) => ({
    cart: [],
    addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
    getTotal: () => {
        return useCartStore.getState().cart.reduce((total, item) => total + item.price, 0);
    },
    clearCart: () => set({ cart: [] }),
}));