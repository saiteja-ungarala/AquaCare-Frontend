// Error Mapper Utility for Auth
// Maps API errors to user-friendly messages

import { AxiosError } from 'axios';

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
    code?: string;
    message?: string;
}

/**
 * Maps authentication errors to user-friendly messages
 */
export function mapAuthError(error: ApiError | AxiosError | Error | unknown): string {
    // Handle Axios errors with response
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as ApiError;
        const status = axiosError.response?.status;
        const message = axiosError.response?.data?.message?.toLowerCase() || '';

        // Network timeout
        if (axiosError.code === 'ECONNABORTED' || message.includes('timeout')) {
            return 'Network timeout. Please check your connection and try again.';
        }

        // User not found
        if (status === 404 || message.includes('not found')) {
            return 'Account not found. Please sign up.';
        }

        // Wrong password
        if (status === 401) {
            if (message.includes('password')) {
                return 'Invalid password. Please try again.';
            }
            return 'Invalid credentials. Please check and try again.';
        }

        // Email already exists (signup)
        if (status === 409 || message.includes('already exists') || message.includes('already registered')) {
            return 'Email already registered. Please login.';
        }

        // Validation errors (400)
        if (status === 400) {
            // Return the backend message if available
            if (axiosError.response?.data?.message) {
                return axiosError.response.data.message;
            }
            return 'Please check your input and try again.';
        }

        // Server error
        if (status && status >= 500) {
            return 'Server error. Please try again later.';
        }
    }

    // Handle network errors (no response)
    if (error && typeof error === 'object') {
        if ('code' in error) {
            const code = (error as any).code;
            if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED') {
                return 'Network error. Please check your connection and try again.';
            }
        }
        if ('message' in error) {
            const msg = (error as Error).message.toLowerCase();
            if (msg.includes('network') || msg.includes('connection')) {
                return 'Network error. Please check your connection and try again.';
            }
        }
    }

    // Default fallback
    return 'Something went wrong. Please try again.';
}

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Form validation for login
 */
export function validateLoginForm(email: string, password: string): { isValid: boolean; error: string | null } {
    if (!email.trim()) {
        return { isValid: false, error: 'Email is required' };
    }
    if (!isValidEmail(email)) {
        return { isValid: false, error: 'Enter a valid email address' };
    }
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    return { isValid: true, error: null };
}

/**
 * Form validation for signup
 */
export function validateSignupForm(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
): { isValid: boolean; error: string | null } {
    if (!name.trim()) {
        return { isValid: false, error: 'Full name is required' };
    }
    if (name.trim().length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters' };
    }
    if (!email.trim()) {
        return { isValid: false, error: 'Email is required' };
    }
    if (!isValidEmail(email)) {
        return { isValid: false, error: 'Enter a valid email address' };
    }
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    if (password !== confirmPassword) {
        return { isValid: false, error: 'Passwords do not match' };
    }
    return { isValid: true, error: null };
}
