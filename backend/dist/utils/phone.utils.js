import { parsePhoneNumber } from 'libphonenumber-js';
/**
 * Format phone number to E.164 format (+12025550173)
 * Default region: US
 * Handles various formats: (202) 555-0173, 202-555-0173, 2025550173, +1 202 555 0173, etc.
 */
export function formatToE164(phone) {
    if (!phone || !phone.trim()) {
        throw new Error('Phone number is required');
    }
    try {
        // First, try parsing with default US region
        const parsed = parsePhoneNumber(phone, 'US');
        if (parsed && parsed.isValid()) {
            return parsed.format('E.164');
        }
        // If parsing fails, try to normalize manually
        // Remove all non-digit and non-plus characters
        const normalized = phone.replace(/[^\d+]/g, '');
        if (!normalized) {
            throw new Error('Phone number must contain at least one digit');
        }
        // Try parsing the normalized version
        const parsedNormalized = parsePhoneNumber(normalized, 'US');
        if (parsedNormalized && parsedNormalized.isValid()) {
            return parsedNormalized.format('E.164');
        }
        // If still invalid, throw error
        throw new Error(`Invalid phone number format. Please use formats like: 2025550173, (202) 555-0173, +1-202-555-0173, or +1 202 555 0173`);
    }
    catch (error) {
        // Don't expose internal error, just show user-friendly message
        if (error.message.includes('format')) {
            throw error;
        }
        throw new Error(`Invalid phone number format. Please use formats like: 2025550173, (202) 555-0173, +1-202-555-0173, or +1 202 555 0173`);
    }
}
/**
 * Validate if phone number is valid
 */
export function validatePhoneNumber(phone) {
    try {
        const parsed = parsePhoneNumber(phone, 'US');
        return parsed !== undefined && parsed.isValid();
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=phone.utils.js.map