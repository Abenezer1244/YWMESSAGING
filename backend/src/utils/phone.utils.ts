import { parsePhoneNumber } from 'libphonenumber-js';

/**
 * Format phone number to E.164 format (+12025550173)
 * Default region: US
 * Handles various formats: (202) 555-0173, 202-555-0173, 2025550173, +1 202 555 0173, etc.
 * ✅ LENIENT: Accepts any valid-looking phone number, not just ones libphonenumber-js validates
 */
export function formatToE164(phone: string): string {
  if (!phone || !phone.trim()) {
    throw new Error('Phone number is required');
  }

  try {
    // First, try parsing with default US region
    const parsed = parsePhoneNumber(phone, 'US');
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164');
    }

    // If libphonenumber-js validation fails, try manual fallback
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

    // FALLBACK: If libphonenumber-js rejects it, but it looks like a valid phone number, accept it
    // This handles cases where libphonenumber-js is too strict (e.g., test/reserved numbers)
    if (normalized.startsWith('+1') && normalized.length === 12) {
      // Already has country code: +1234567890
      return '+' + normalized.slice(1);
    } else if (normalized.startsWith('+') && normalized.length === 11 && !normalized.startsWith('+1')) {
      // International number with different country code
      return normalized;
    } else if (normalized.length === 10 && !normalized.startsWith('+')) {
      // US number without country code (10 digits): 2025550173
      return '+1' + normalized;
    } else if (normalized.length === 11 && normalized.startsWith('1')) {
      // US number with leading 1 (11 digits): 12025550173
      return '+' + normalized;
    }

    // If still doesn't match any pattern, throw error
    throw new Error(`Invalid phone number format. Please use formats like: 2025550173, (202) 555-0173, +1-202-555-0173, or +1 202 555 0173`);
  } catch (error: any) {
    // Don't expose internal error, just show user-friendly message
    if (error.message.includes('format')) {
      throw error;
    }
    throw new Error(`Invalid phone number format. Please use formats like: 2025550173, (202) 555-0173, +1-202-555-0173, or +1 202 555 0173`);
  }
}

/**
 * Validate if phone number is valid
 * ✅ LENIENT: Uses same logic as formatToE164 so validation matches formatting
 */
export function validatePhoneNumber(phone: string): boolean {
  try {
    // Try to format it using the same logic as formatToE164
    // If it doesn't throw, the phone number is valid
    formatToE164(phone);
    return true;
  } catch {
    return false;
  }
}
