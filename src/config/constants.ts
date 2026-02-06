// API Configuration
// Uses EXPO_PUBLIC_API_URL environment variable if set, otherwise falls back to local IP

export const API_BASE_URL = 
    process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.8:3000/api';

// Storage keys for SecureStore
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
} as const;
