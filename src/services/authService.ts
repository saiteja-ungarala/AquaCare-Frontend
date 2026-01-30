import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User, LoginCredentials, SignupData, UserRole } from '../models/types';

// Storage helper functions
const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    deleteItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    }
};

// Mock user data for demo
const mockUsers: Record<string, User> = {
    'customer@test.com': {
        id: 'U001',
        email: 'customer@test.com',
        name: 'John Customer',
        phone: '+91 98765 43210',
        role: 'customer',
        referralCode: 'JOHN100',
        createdAt: '2026-01-01T00:00:00Z',
    },
    'agent@test.com': {
        id: 'U002',
        email: 'agent@test.com',
        name: 'Rajesh Agent',
        phone: '+91 98765 43211',
        role: 'agent',
        createdAt: '2026-01-01T00:00:00Z',
    },
    'dealer@test.com': {
        id: 'U003',
        email: 'dealer@test.com',
        name: 'Suresh Dealer',
        phone: '+91 98765 43212',
        role: 'dealer',
        referralCode: 'DEALER50',
        createdAt: '2026-01-01T00:00:00Z',
    },
};

export const authService = {
    // Login with email and password
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo: accept any email with password "password123"
        // In production, this would call your backend API
        if (credentials.password !== 'password123') {
            throw new Error('Invalid email or password');
        }

        const user = mockUsers[credentials.email] || {
            id: `U${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            phone: '+91 00000 00000',
            role: credentials.role,
            referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
            createdAt: new Date().toISOString(),
        };

        // Override role with selected role
        user.role = credentials.role;

        const token = `mock_token_${Date.now()}`;

        // Store token and user in secure storage
        await storage.setItem('authToken', token);
        await storage.setItem('user', JSON.stringify(user));

        return { user, token };
    },

    // Signup new user
    async signup(data: SignupData): Promise<{ user: User; token: string }> {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For demo: create new user
        const user: User = {
            id: `U${Date.now()}`,
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: data.role,
            referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
            referredBy: data.referralCode,
            createdAt: new Date().toISOString(),
        };

        const token = `mock_token_${Date.now()}`;

        // Store token and user in secure storage
        await storage.setItem('authToken', token);
        await storage.setItem('user', JSON.stringify(user));

        return { user, token };
    },

    // Logout
    async logout(): Promise<void> {
        await storage.deleteItem('authToken');
        await storage.deleteItem('user');
    },

    // Check if user is logged in
    async checkAuth(): Promise<{ user: User; token: string } | null> {
        try {
            const token = await storage.getItem('authToken');
            const userJson = await storage.getItem('user');

            if (token && userJson) {
                const user = JSON.parse(userJson) as User;
                return { user, token };
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        }
        return null;
    },

    // Request OTP (placeholder)
    async requestOTP(phone: string): Promise<boolean> {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('OTP sent to:', phone);
        return true;
    },

    // Verify OTP (placeholder)
    async verifyOTP(phone: string, otp: string, role: UserRole): Promise<{ user: User; token: string }> {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (otp !== '123456') {
            throw new Error('Invalid OTP');
        }

        const user: User = {
            id: `U${Date.now()}`,
            email: `${phone}@phone.local`,
            name: 'Phone User',
            phone: phone,
            role: role,
            referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
            createdAt: new Date().toISOString(),
        };

        const token = `mock_token_${Date.now()}`;

        await storage.setItem('authToken', token);
        await storage.setItem('user', JSON.stringify(user));

        return { user, token };
    },
};
