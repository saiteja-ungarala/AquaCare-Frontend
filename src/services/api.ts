// Axios API configuration

import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
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

const normalizeBaseUrl = (url: string): string => url.trim().replace(/\/+$/, '');

const getApiFallbackBaseUrls = (currentBaseUrl?: string): string[] => {
    const urls = new Set<string>();

    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.location?.hostname) {
            urls.add(`http://${window.location.hostname}:3000/api`);
        }
        urls.add('http://localhost:3000/api');
        urls.add('http://127.0.0.1:3000/api');
    } else {
        const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
        const match = scriptURL?.match(/^https?:\/\/([^/:]+)/i);
        if (match?.[1]) {
            urls.add(`http://${match[1]}:3000/api`);
        }
        urls.add('http://10.0.2.2:3000/api');
        urls.add('http://localhost:3000/api');
    }

    if (currentBaseUrl) {
        const normalizedCurrent = normalizeBaseUrl(currentBaseUrl);
        for (const candidate of Array.from(urls)) {
            if (normalizeBaseUrl(candidate) === normalizedCurrent) {
                urls.delete(candidate);
            }
        }
    }

    return Array.from(urls);
};

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
        const originalConfig = error?.config as any;
        const isNetworkTimeout =
            !error.response &&
            (
                error.code === 'ECONNABORTED' ||
                String(error.message || '').toLowerCase().includes('timeout') ||
                String(error.message || '').toLowerCase().includes('network error')
            );

        if (isNetworkTimeout && originalConfig && !originalConfig._connectionRetryAttempted) {
            originalConfig._connectionRetryAttempted = true;
            const currentBaseUrl = originalConfig.baseURL || api.defaults.baseURL || API_BASE_URL;
            const fallbackBaseUrls = getApiFallbackBaseUrls(currentBaseUrl);

            for (const fallbackBaseUrl of fallbackBaseUrls) {
                try {
                    console.warn('[API] Request timed out. Retrying with fallback base URL:', fallbackBaseUrl);
                    const response = await api.request({
                        ...originalConfig,
                        baseURL: fallbackBaseUrl,
                        _connectionRetryAttempted: true,
                    });
                    api.defaults.baseURL = fallbackBaseUrl;
                    console.log('[API] Switched default base URL to:', fallbackBaseUrl);
                    return response;
                } catch (retryError: any) {
                    if (retryError?.response) {
                        return Promise.reject(retryError);
                    }
                }
            }
        }

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
