// API Configuration
// Smart URL detection for web vs mobile platforms

import { NativeModules, Platform } from 'react-native';

const normalizeApiUrl = (url: string): string => {
    const trimmed = url.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getWebHost = (): string => {
    if (typeof window !== 'undefined' && window.location?.hostname) {
        return window.location.hostname;
    }
    return 'localhost';
};

const getMetroHost = (): string | null => {
    try {
        const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
        if (!scriptURL) return null;
        const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
        return match?.[1] || null;
    } catch {
        return null;
    }
};

// Determine the best API URL based on platform
const getApiBaseUrl = (): string => {
    if (Platform.OS === 'web') {
        // On web, prefer same-host backend to avoid stale LAN env values.
        const webUrl = `http://${getWebHost()}:3000/api`;
        console.log('[Config] Platform: web - using same-host URL:', webUrl);
        return webUrl;
    }

    // Check explicit env variable for native platforms
    const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (envUrl) {
        const normalized = normalizeApiUrl(envUrl);
        console.log('[Config] Using EXPO_PUBLIC_API_URL:', normalized);
        return normalized;
    }

    // Mobile dev default: infer host from Metro bundler (works for Expo Go physical devices).
    const metroHost = getMetroHost();
    if (metroHost) {
        const metroDerivedUrl = `http://${metroHost}:3000/api`;
        console.log('[Config] Platform: mobile - using Metro host fallback:', metroDerivedUrl);
        return metroDerivedUrl;
    }

    // Last-resort fallback for local emulator/simulator.
    const fallbackUrl = Platform.OS === 'android'
        ? 'http://10.0.2.2:3000/api'
        : 'http://localhost:3000/api';
    console.log('[Config] Platform: mobile - using final fallback URL:', fallbackUrl);
    return fallbackUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Log the final URL at module load
console.log('[Config] Final API_BASE_URL:', API_BASE_URL);

// Storage keys for SecureStore
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
} as const;
