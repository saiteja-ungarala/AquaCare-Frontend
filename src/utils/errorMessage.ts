import axios from 'axios';

export type FieldErrors = Record<string, string>;

export interface NormalizedErrorMessage {
    title?: string;
    message: string;
    fieldErrors?: FieldErrors;
}

type ErrorDetailsItem = {
    path?: string | string[];
    field?: string;
    param?: string;
    message?: string;
    msg?: string;
};

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const AUTH_MESSAGE_MAP: Array<{ match: RegExp; message: string }> = [
    { match: /(credentials not found|user not found|account not found|no .* account found)/i, message: 'Account not found. Please sign up.' },
    { match: /(invalid password|wrong credentials|incorrect password|invalid credentials)/i, message: 'Incorrect password. Please try again.' },
    { match: /(email already exists|email already registered|already registered|already exists)/i, message: 'This email is already registered. Please log in.' },
    { match: /(phone.*(already|registered))/i, message: 'This phone number is already registered. Please log in.' },
    { match: /(invalid otp|wrong otp)/i, message: 'Invalid OTP. Please try again.' },
    { match: /(otp expired|expired otp|otp has expired)/i, message: 'OTP expired. Request a new one.' },
    { match: /(otp not found)/i, message: 'OTP not found. Please request a new one.' },
    { match: /(too many attempts|too many otp)/i, message: 'Too many attempts. Please wait and try again.' },
    { match: /(too many login|too many signup|too many password)/i, message: 'Too many attempts. Please wait a few minutes and try again.' },
    { match: /(too many otp requests)/i, message: 'Too many OTP requests. Please wait a while and try again.' },
    { match: /(otp login not yet implemented|otp not yet implemented)/i, message: 'OTP login is not available yet.' },
    { match: /(invalid or expired reset)/i, message: 'This reset link is invalid or has expired. Please request a new one.' },
];

const normalizeFieldName = (field: string): string => {
    const normalized = field.trim().replace(/^body\./, '').replace(/^query\./, '').replace(/^params\./, '');

    if (normalized === 'full_name') return 'name';
    return normalized;
};

const getIssueField = (issue: ErrorDetailsItem): string | null => {
    if (Array.isArray(issue.path) && issue.path.length > 0) {
        const filtered = issue.path.filter(Boolean).map(String).filter((part) => part !== 'body' && part !== 'query' && part !== 'params');
        if (filtered.length > 0) {
            return normalizeFieldName(filtered[filtered.length - 1]);
        }
    }
    if (typeof issue.path === 'string' && issue.path.trim()) {
        return normalizeFieldName(issue.path);
    }
    if (issue.field) return normalizeFieldName(issue.field);
    if (issue.param) return normalizeFieldName(issue.param);
    return null;
};

const getIssueMessage = (issue: ErrorDetailsItem): string | null => {
    if (typeof issue.message === 'string' && issue.message.trim()) return issue.message.trim();
    if (typeof issue.msg === 'string' && issue.msg.trim()) return issue.msg.trim();
    return null;
};

const getMappedAuthMessage = (message: string): string | null => {
    const trimmed = message.trim();
    if (!trimmed) return null;

    for (const mapping of AUTH_MESSAGE_MAP) {
        if (mapping.match.test(trimmed)) {
            return mapping.message;
        }
    }
    return null;
};

const inferFieldErrorsFromMessage = (message: string): FieldErrors | undefined => {
    const trimmed = message.trim();
    if (!trimmed) return undefined;

    if (/(credentials not found|user not found|account not found|no .* account found)/i.test(trimmed)) {
        return { email: 'No account found with this email.' };
    }

    if (/(invalid password|incorrect password|wrong password|incorrect email or password)/i.test(trimmed)) {
        return { password: 'Incorrect password. Please try again.' };
    }

    if (/(email already exists|email already registered|email is already registered)/i.test(trimmed)) {
        return { email: 'This email is already registered.' };
    }

    if (/(phone.*(already|registered))/i.test(trimmed)) {
        return { phone: 'This phone number is already registered.' };
    }

    if (/(no account found for this phone)/i.test(trimmed)) {
        return { phone: 'No account found for this phone number.' };
    }

    if (/(invalid otp|otp expired|otp not found|request a new one)/i.test(trimmed)) {
        return { otp: trimmed };
    }

    if (/(too many attempts.*otp|too many otp)/i.test(trimmed)) {
        return { otp: 'Too many attempts. Please request a new OTP.' };
    }

    return undefined;
};

const isNormalizedErrorMessage = (value: unknown): value is NormalizedErrorMessage => {
    if (!value || typeof value !== 'object') return false;
    const maybeError = value as NormalizedErrorMessage;
    return typeof maybeError.message === 'string';
};

const toFieldErrors = (details: unknown): FieldErrors | undefined => {
    if (!Array.isArray(details)) return undefined;

    const fieldErrors: FieldErrors = {};
    for (const rawItem of details) {
        const issue = rawItem as ErrorDetailsItem;
        const field = getIssueField(issue);
        const message = getIssueMessage(issue);
        if (field && message && !fieldErrors[field]) {
            fieldErrors[field] = message;
        }
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

const isTimeoutError = (err: any): boolean => {
    const code = String(err?.code || '').toUpperCase();
    const message = String(err?.message || '').toLowerCase();
    return code === 'ECONNABORTED' || message.includes('timeout');
};

const getStatusFallbackError = (statusCode: number): NormalizedErrorMessage | null => {
    switch (statusCode) {
        case 400:
            return { message: 'Please check your input and try again.' };
        case 401:
            return {
                message: 'Incorrect email or password. Please try again.',
                fieldErrors: { password: 'Incorrect password. Please try again.' },
            };
        case 403:
            return { message: 'Access denied. You don\'t have permission for this action.' };
        case 404:
            return {
                message: 'Account not found. Please sign up.',
                fieldErrors: { email: 'No account found with this email.' },
            };
        case 409:
            return {
                message: 'This email is already registered. Please log in.',
                fieldErrors: { email: 'This email is already registered.' },
            };
        case 429:
            return { message: 'Too many attempts. Please wait a few minutes and try again.' };
        case 500:
            return { message: 'Something went wrong on our end. Please try again later.' };
        case 502:
        case 503:
        case 504:
            return { message: 'Server is temporarily unavailable. Please try again in a moment.' };
        default:
            return null;
    }
};

/**
 * Ensures the final message is never a raw status code or technical jargon.
 * This is the last line of defence before the user sees the message.
 */
const sanitizeForUser = (result: NormalizedErrorMessage, statusCode?: number): NormalizedErrorMessage => {
    const msg = result.message;
    // Catch any Axios-style "Request failed with status code NNN" that slipped through
    if (/^request failed with status code \d+$/i.test(msg)) {
        const code = Number(msg.match(/\d+/)?.[0] || statusCode || 0);
        const fallback = getStatusFallbackError(code);
        return fallback
            ? { ...result, message: fallback.message, fieldErrors: result.fieldErrors || fallback.fieldErrors }
            : { ...result, message: FALLBACK_ERROR_MESSAGE };
    }
    // Catch other technical messages that shouldn't reach the user
    if (/^(network error|timeout|econnaborted|econnrefused|enotfound)/i.test(msg)) {
        return { ...result, message: 'Network error. Check your internet.' };
    }
    return result;
};

export const getApiErrorMessage = (err: unknown): NormalizedErrorMessage => {
    if (isNormalizedErrorMessage(err)) {
        const result: NormalizedErrorMessage = {
            title: err.title,
            message: err.message,
            fieldErrors: err.fieldErrors || inferFieldErrorsFromMessage(err.message),
        };
        return sanitizeForUser(result);
    }

    if (axios.isAxiosError(err)) {
        if (isTimeoutError(err)) {
            return { message: 'Request timed out. Try again.' };
        }

        const statusCode = Number(err.response?.status || 0);

        if (!err.response || statusCode === 0) {
            return { message: 'Network error. Check your internet.' };
        }

        const data = err.response.data as any;
        const responseMessage =
            typeof data === 'string'
                ? data
                : String(data?.message || data?.error || '').trim();
        const rawMessage = String(responseMessage || err.message || '').trim();
        const details = data?.errors ?? data?.details;
        const fieldErrors = toFieldErrors(details);
        const mappedMessage = getMappedAuthMessage(rawMessage);
        const inferredFieldErrors = inferFieldErrorsFromMessage(rawMessage);
        const looksLikeAxiosStatusMessage = /^request failed with status code \d+$/i.test(rawMessage);
        const statusFallback = getStatusFallbackError(statusCode);

        if (mappedMessage) {
            return sanitizeForUser({ message: mappedMessage, fieldErrors: fieldErrors || inferredFieldErrors }, statusCode);
        }

        if (fieldErrors) {
            return sanitizeForUser({
                title: 'Validation Error',
                message: rawMessage && !/validation error/i.test(rawMessage)
                    ? rawMessage
                    : 'Please fix the highlighted fields and try again.',
                fieldErrors,
            }, statusCode);
        }

        if ((!rawMessage || looksLikeAxiosStatusMessage) && statusFallback) {
            return statusFallback;
        }

        if (rawMessage && !looksLikeAxiosStatusMessage) {
            return sanitizeForUser({ message: rawMessage, fieldErrors: inferredFieldErrors }, statusCode);
        }

        // Last resort: use status-based fallback or generic message
        return statusFallback || { message: FALLBACK_ERROR_MESSAGE };
    }

    const maybeObject = (err || {}) as any;
    if (isTimeoutError(maybeObject)) {
        return { message: 'Request timed out. Try again.' };
    }

    if (Number(maybeObject?.statusCode || 0) === 0 && !maybeObject?.message) {
        return { message: 'Network error. Check your internet.' };
    }

    const rawMessage = String(maybeObject?.message || '').trim();
    const mappedMessage = getMappedAuthMessage(rawMessage);
    const inferredFieldErrors = inferFieldErrorsFromMessage(rawMessage);

    if (mappedMessage) {
        return sanitizeForUser({ message: mappedMessage, fieldErrors: maybeObject?.fieldErrors || inferredFieldErrors });
    }

    if (rawMessage) {
        return sanitizeForUser({ message: rawMessage, fieldErrors: maybeObject?.fieldErrors || inferredFieldErrors });
    }

    return { message: FALLBACK_ERROR_MESSAGE };
};
