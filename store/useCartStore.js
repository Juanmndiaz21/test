import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export function getItemKey(product) {
    if (!product) return 'item';
    if (product.key) return String(product.key);
    const id = product.id ?? product.name ?? 'item';
    const platform = product.platform ?? 'all';
    const boost = product.boost_amount ?? 0;
    return `${id}|${platform}|${boost}`;
}

export const useCartStore = create(
    persist(
        (set, get) => ({
            cart: [],

            addToCart: (product, quantity = 1) => {
                const key = getItemKey(product);
                const itemToAdd = { ...product, key };

                set((state) => {
                    const existing = state.cart.find((item) => item.key === key);
                    if (existing) {
                        return {
                            cart: state.cart.map((item) =>
                                item.key === key ? { ...item, quantity: item.quantity + quantity } : item
                            ),
                        };
                    }
                    return { cart: [...state.cart, { ...itemToAdd, quantity }] };
                });
            },

            updateQuantity: (key, quantity) =>
                set((state) => ({
                    cart:
                        quantity <= 0
                            ? state.cart.filter((item) => item.key !== key)
                            : state.cart.map((item) => (item.key === key ? { ...item, quantity } : item)),
                })),

            removeFromCart: (key) =>
                set((state) => ({ cart: state.cart.filter((item) => item.key !== key) })),

            getTotal: () =>
                get().cart.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0),

            getItemCount: () =>
                get().cart.reduce((count, item) => count + item.quantity, 0),

            clearCart: () => set({ cart: [] }),
        }),
        {
            name: 'ogmodz-cart-storage',
        }
    )
);