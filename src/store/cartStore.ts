// Cart store using Zustand

import { create } from 'zustand';
import { CartItem, Product } from '../models/types';

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
}

interface CartActions {
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

type CartStore = CartState & CartActions;

const calculateTotals = (items: CartItem[]) => {
    return items.reduce(
        (acc, item) => ({
            totalItems: acc.totalItems + item.quantity,
            totalAmount: acc.totalAmount + item.product.price * item.quantity,
        }),
        { totalItems: 0, totalAmount: 0 }
    );
};

export const useCartStore = create<CartStore>((set, get) => ({
    // Initial state
    items: [],
    totalItems: 0,
    totalAmount: 0,

    // Actions
    addToCart: (product: Product) => {
        set((state) => {
            const existingItem = state.items.find(
                (item) => item.product.id === product.id
            );

            let newItems: CartItem[];
            if (existingItem) {
                newItems = state.items.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                newItems = [
                    ...state.items,
                    { id: `cart_${product.id}`, product, quantity: 1 },
                ];
            }

            const totals = calculateTotals(newItems);
            return { items: newItems, ...totals };
        });
    },

    removeFromCart: (productId: string) => {
        set((state) => {
            const newItems = state.items.filter(
                (item) => item.product.id !== productId
            );
            const totals = calculateTotals(newItems);
            return { items: newItems, ...totals };
        });
    },

    updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
            if (quantity <= 0) {
                const newItems = state.items.filter(
                    (item) => item.product.id !== productId
                );
                const totals = calculateTotals(newItems);
                return { items: newItems, ...totals };
            }

            const newItems = state.items.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            );
            const totals = calculateTotals(newItems);
            return { items: newItems, ...totals };
        });
    },

    clearCart: () => {
        set({ items: [], totalItems: 0, totalAmount: 0 });
    },
}));
