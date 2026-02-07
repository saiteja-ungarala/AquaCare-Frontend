// Axios API configuration

import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Log API base URL at startup
console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Storage helper for cross-platform token retrieval
const getStoredToken = async (): Promise<string | null> => {
    try {
        if (Platform.OS === 'web') {
            return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        }
        return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        console.error('[API] Error getting auth token:', error);
        return null;
    }
};

// Storage helper for clearing tokens
const clearStoredTokens = async (): Promise<void> => {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        } else {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
        }
    } catch (error) {
        console.error('[API] Error clearing tokens:', error);
    }
};

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await getStoredToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Token attached:', token ? 'Yes' : 'No');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage and redirect to login
            await clearStoredTokens();
            console.log('[API] 401 received - tokens cleared');
            // Navigation to login will be handled by auth state change
        }
        return Promise.reject(error);
    }
);

export default api;
