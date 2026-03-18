// API Configuration

const DEFAULT_API_URL = 'https://ioncare-backend-production.up.railway.app/api';

const normalizeApiUrl = (url: string): string => {
    const trimmed = url.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getApiBaseUrl = (): string => {
    console.log('[Config] Using default production API URL:', DEFAULT_API_URL);
    return normalizeApiUrl(DEFAULT_API_URL);
};

export const API_BASE_URL = getApiBaseUrl();
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Log the final URL at module load
console.log('[Config] Final API_BASE_URL:', API_BASE_URL);

// Storage keys for SecureStore
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
} as const;
