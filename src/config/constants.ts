// API Configuration
// Smart URL detection for web vs mobile platforms

import { Platform } from 'react-native';

// Determine the best API URL based on platform
const getApiBaseUrl = (): string => {
    // Check for explicit environment variable first
    const envUrl = process.env.EXPO_PUBLIC_API_URL;

    if (Platform.OS === 'web') {
        // For web browser, always use localhost
        console.log('[Config] Platform: web - using localhost');
        return 'http://localhost:3000/api';
    }

    // For mobile (iOS/Android via Expo Go)
    if (envUrl) {
        console.log('[Config] Platform: mobile - using env URL:', envUrl);
        return envUrl;
    }

    // Fallback to LAN IP for mobile
    // Change this to your laptop's IP address
    const fallbackUrl = 'http://192.168.1.8:3000/api';
    console.log('[Config] Platform: mobile - using fallback URL:', fallbackUrl);
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
