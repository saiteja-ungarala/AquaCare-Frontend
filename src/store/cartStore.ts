import { create } from 'zustand';
import { CartItem, Product, Service } from '../models/types';

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
}

interface CartActions {
    addToCart: (item: Product | Service, type: 'product' | 'service', bookingDetails?: { date: string, time: string }) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
}

type CartStore = CartState & CartActions;

const calculateTotals = (items: CartItem[]) => {
    return items.reduce(
        (acc, item) => {
            const price = item.type === 'product' ? (item.product?.price || 0) : (item.service?.price || 0);
            return {
                totalItems: acc.totalItems + item.quantity,
                totalAmount: acc.totalAmount + price * item.quantity,
            };
        },
        { totalItems: 0, totalAmount: 0 }
    );
};

export const useCartStore = create<CartStore>((set, get) => ({
    // Initial state
    items: [],
    totalItems: 0,
    totalAmount: 0,

    // Actions
    addToCart: (itemData: Product | Service, type: 'product' | 'service', bookingDetails) => {
        set((state) => {
            const itemId = itemData.id;

            // For services, might want to allow multiple of same service? Or just one?
            // Assuming products merge quantity, services might not if different dates.
            // For simplicity, unique by ID for now.

            const existingItem = state.items.find(
                (item) => (item.type === type && (type === 'product' ? item.product?.id === itemId : item.service?.id === itemId))
            );

            let newItems: CartItem[];
            if (existingItem) {
                newItems = state.items.map((item) =>
                    (item.id === existingItem.id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                newItems = [
                    ...state.items,
                    {
                        id: `cart_${type}_${itemId}`,
                        type,
                        product: type === 'product' ? (itemData as Product) : undefined,
                        service: type === 'service' ? (itemData as Service) : undefined,
                        bookingDate: bookingDetails?.date,
                        bookingTime: bookingDetails?.time,
                        quantity: 1
                    },
                ];
            }

            const totals = calculateTotals(newItems);
            return { items: newItems, ...totals };
        });
    },

    removeFromCart: (itemId: string) => {
        set((state) => {
            const newItems = state.items.filter(
                (item) => (item.type === 'product' ? item.product?.id : item.service?.id) !== itemId
            );
            const totals = calculateTotals(newItems);
            return { items: newItems, ...totals };
        });
    },

    updateQuantity: (itemId: string, quantity: number) => {
        set((state) => {
            if (quantity <= 0) {
                const newItems = state.items.filter(
                    (item) => (item.type === 'product' ? item.product?.id : item.service?.id) !== itemId
                );
                const totals = calculateTotals(newItems);
                return { items: newItems, ...totals };
            }

            const newItems = state.items.map((item) =>
                (item.type === 'product' ? item.product?.id === itemId : item.service?.id === itemId) ? { ...item, quantity } : item
            );
            const totals = calculateTotals(newItems);
            return { items: newItems, ...totals };
        });
    },

    clearCart: () => {
        set({ items: [], totalItems: 0, totalAmount: 0 });
    },
}));
