const DEFAULT_API_URL = 'https://ioncare-backend-production.up.railway.app/api';

const normalizeApiUrl = (url: string): string => {
    const trimmed = url.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const resolveApiBaseUrl = (): string => {
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    const resolved = normalizeApiUrl(configuredUrl || DEFAULT_API_URL);

    if (__DEV__) {
        console.log('[Config] API_BASE_URL:', resolved);
    }

    return resolved;
};

const normalizeOptionalValue = (value?: string): string => String(value || '').trim();

export const API_BASE_URL = resolveApiBaseUrl();
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
export const SUPPORT_CONFIG = {
    phone: normalizeOptionalValue(process.env.EXPO_PUBLIC_SUPPORT_PHONE),
    email: normalizeOptionalValue(process.env.EXPO_PUBLIC_SUPPORT_EMAIL),
    whatsapp: normalizeOptionalValue(process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP).replace(/\D/g, ''),
    hours: normalizeOptionalValue(process.env.EXPO_PUBLIC_SUPPORT_HOURS),
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
} as const;
