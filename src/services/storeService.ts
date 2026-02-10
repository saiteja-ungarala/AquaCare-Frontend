// Store Service - API calls for Store section

import api from './api';

// Types
export interface StoreCategory {
    id: number;
    name: string;
    slug: string;
    iconKey: string;
}

export interface StoreProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    mrp: number;
    stockQty: number;
    imageUrl: string | null;
    sku: string;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    createdAt: string;
}

export interface ProductsResponse {
    items: StoreProduct[];
    page: number;
    limit: number;
    total: number;
}

export interface ProductQueryParams {
    category?: string;  // slug
    q?: string;         // search query
    sort?: 'popular' | 'new' | 'price_asc' | 'price_desc';
    page?: number;
    limit?: number;
}

// API Methods
export const storeService = {
    /**
     * Get all active product categories
     */
    async getCategories(): Promise<StoreCategory[]> {
        const response = await api.get('/store/categories');
        return response.data.data;
    },

    /**
     * Get products with optional filters
     */
    async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
        const response = await api.get('/store/products', { params });
        return response.data.data;
    },

    /**
     * Get a single product by ID
     */
    async getProductById(id: number): Promise<StoreProduct> {
        const response = await api.get(`/store/products/${id}`);
        return response.data.data;
    },
};

export default storeService;
