// Orders Service - API calls for Orders and Checkout

import api from './api';

// Types
export interface CheckoutRequest {
    addressId: number;
    paymentMethod: 'cod' | 'wallet';
    referralCode?: string;
}

export interface CheckoutResponse {
    orderId: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    referred_by_agent_id?: number | null;
    referral_code_used?: string | null;
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: number;
    status: string;
    paymentStatus: string;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    createdAt: string;
    items?: OrderItem[];
}

// API Methods
export const ordersService = {
    /**
     * Checkout cart and create order
     */
    async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
        const payload: Record<string, unknown> = {
            address_id: data.addressId,
            payment_method: data.paymentMethod,
        };

        if (data.referralCode) {
            payload.referral_code = data.referralCode;
        }

        const response = await api.post('/orders/checkout', payload);
        return response.data.data;
    },

    /**
     * Get user's orders
     */
    async getOrders(): Promise<Order[]> {
        const response = await api.get('/orders');
        return response.data.data;
    },

    /**
     * Get order details by ID
     */
    async getOrderById(id: number): Promise<Order> {
        const response = await api.get(`/orders/${id}`);
        return response.data.data;
    },
};

export default ordersService;
