import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
    cart: [],

    addToCart: (product, quantity = 1) =>
        set((state) => {
            const existing = state.cart.find((item) => item.key === product.key);
            if (existing) {
                return {
                    cart: state.cart.map((item) =>
                        item.key === product.key ? { ...item, quantity: item.quantity + quantity } : item
                    ),
                };
            }
            return { cart: [...state.cart, { ...product, quantity }] };
        }),

    updateQuantity: (key, quantity) =>
        set((state) => ({
            cart:
                quantity <= 0
                    ? state.cart.filter((item) => item.key !== key)
                    : state.cart.map((item) => (item.key === key ? { ...item, quantity } : item)),
        })),

    removeFromCart: (key) => set((state) => ({ cart: state.cart.filter((item) => item.key !== key) })),

    getTotal: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),

    getItemCount: () => get().cart.reduce((count, item) => count + item.quantity, 0),

    clearCart: () => set({ cart: [] }),
}));