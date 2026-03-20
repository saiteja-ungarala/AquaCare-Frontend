/**
 * Validation utilities for IONORA CARE
 */

/**
 * Validates an Indian mobile number.
 * Rule: Exactly 10 digits, starting with 6, 7, 8, or 9.
 */
export function isValidIndianMobile(phone: string): boolean {
    const regex = /^[6-9][0-9]{9}$/;
    return regex.test(phone.trim());
}

/**
 * Normalizes a phone number for entry (e.g. removing spaces).
 */
export function normalizePhoneInput(phone: string): string {
    return phone.replace(/\s/g, '').slice(0, 10);
}

/**
 * Cleans a phone number by removing all non-numeric characters.
 */
export function cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(0, 10);
}
