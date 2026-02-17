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
    { match: /(credentials not found|user not found|account not found)/i, message: 'Account not found. Please sign up.' },
    { match: /(invalid password|wrong credentials|incorrect password|invalid credentials)/i, message: 'Incorrect password. Please try again.' },
    { match: /(email already exists|already registered|already exists)/i, message: 'This email is already registered. Please log in.' },
    { match: /(invalid otp|wrong otp)/i, message: 'Invalid OTP. Please try again.' },
    { match: /(otp expired|expired otp|otp has expired)/i, message: 'OTP expired. Request a new one.' },
    { match: /(otp login not yet implemented|otp not yet implemented)/i, message: 'OTP login is not available yet.' },
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

export const getApiErrorMessage = (err: unknown): NormalizedErrorMessage => {
    if (axios.isAxiosError(err)) {
        if (isTimeoutError(err)) {
            return { message: 'Request timed out. Try again.' };
        }

        if (!err.response || Number(err.response?.status || 0) === 0) {
            return { message: 'Network error. Check your internet.' };
        }

        const data = err.response.data as any;
        const rawMessage = String(data?.message || data?.error || err.message || '').trim();
        const details = data?.errors ?? data?.details;
        const fieldErrors = toFieldErrors(details);
        const mappedMessage = getMappedAuthMessage(rawMessage);

        if (mappedMessage) {
            return { message: mappedMessage, fieldErrors };
        }

        if (fieldErrors) {
            return {
                title: 'Validation Error',
                message: rawMessage && !/validation error/i.test(rawMessage)
                    ? rawMessage
                    : 'Please fix the highlighted fields and try again.',
                fieldErrors,
            };
        }

        if (rawMessage) {
            return { message: rawMessage };
        }

        return { message: FALLBACK_ERROR_MESSAGE };
    }

    const maybeObject = (err || {}) as any;
    if (isTimeoutError(maybeObject)) {
        return { message: 'Request timed out. Try again.' };
    }

    if (Number(maybeObject?.statusCode || 0) === 0) {
        return { message: 'Network error. Check your internet.' };
    }

    const rawMessage = String(maybeObject?.message || '').trim();
    const mappedMessage = getMappedAuthMessage(rawMessage);

    if (mappedMessage) {
        return { message: mappedMessage };
    }

    if (rawMessage) {
        return { message: rawMessage };
    }

    return { message: FALLBACK_ERROR_MESSAGE };
};

