// Profile Service - User profile and addresses API
import api from './api';
import { Address } from '../models/types';

// User profile type from API
export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    referral_code?: string;
    created_at: string;
}

// Helper to map backend address to frontend Address type
const mapBackendAddress = (backendAddress: any): Address => {
    return {
        id: String(backendAddress.id),
        street: backendAddress.street || backendAddress.address_line || '',
        city: backendAddress.city || '',
        state: backendAddress.state || '',
        pincode: backendAddress.pincode || backendAddress.postal_code || '',
        landmark: backendAddress.landmark,
        isDefault: backendAddress.is_default || false,
    };
};

export const profileService = {
    // Get user profile
    async getProfile(): Promise<UserProfile | null> {
        try {
            const response = await api.get('/user/profile');
            const { data } = response.data;
            return data;
        } catch (error: any) {
            console.error('Error fetching profile:', error.message);
            return null;
        }
    },

    // Update user profile
    async updateProfile(updates: Partial<{ full_name: string; phone: string }>): Promise<UserProfile | null> {
        try {
            const response = await api.patch('/user/profile', updates);
            const { data } = response.data;
            return data;
        } catch (error: any) {
            console.error('Error updating profile:', error.message);
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    },

    // Get all addresses
    async getAddresses(): Promise<Address[]> {
        try {
            const response = await api.get('/user/addresses');
            const { data } = response.data;
            const list = Array.isArray(data) ? data : (data.addresses || []);
            return list.map(mapBackendAddress);
        } catch (error: any) {
            console.error('Error fetching addresses:', error.message);
            return [];
        }
    },

    // Add new address
    async addAddress(address: Omit<Address, 'id'>): Promise<Address | null> {
        try {
            const response = await api.post('/user/addresses', {
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                landmark: address.landmark,
                is_default: address.isDefault,
            });
            const { data } = response.data;
            return mapBackendAddress(data);
        } catch (error: any) {
            console.error('Error adding address:', error.message);
            throw new Error(error.response?.data?.message || 'Failed to add address');
        }
    },

    // Update address
    async updateAddress(id: string, updates: Partial<Address>): Promise<Address | null> {
        try {
            const payload: any = {};
            if (updates.street !== undefined) payload.street = updates.street;
            if (updates.city !== undefined) payload.city = updates.city;
            if (updates.state !== undefined) payload.state = updates.state;
            if (updates.pincode !== undefined) payload.pincode = updates.pincode;
            if (updates.landmark !== undefined) payload.landmark = updates.landmark;
            if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;

            const response = await api.patch(`/user/addresses/${id}`, payload);
            const { data } = response.data;
            return mapBackendAddress(data);
        } catch (error: any) {
            console.error('Error updating address:', error.message);
            throw new Error(error.response?.data?.message || 'Failed to update address');
        }
    },

    // Delete address
    async deleteAddress(id: string): Promise<boolean> {
        try {
            await api.delete(`/user/addresses/${id}`);
            return true;
        } catch (error: any) {
            console.error('Error deleting address:', error.message);
            throw new Error(error.response?.data?.message || 'Failed to delete address');
        }
    },
};
