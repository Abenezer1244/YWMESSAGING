import { parsePhoneNumber } from 'libphonenumber-js';

/**
 * Format phone number to E.164 format (+12025550173)
 * Default region: US
 */
export function formatToE164(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone, 'US');
    if (!parsed) {
      throw new Error('Invalid phone number');
    }
    return parsed.format('E.164');
  } catch (error) {
    throw new Error(`Invalid phone number: ${phone}`);
  }
}

/**
 * Validate if phone number is valid
 */
export function validatePhoneNumber(phone: string): boolean {
  try {
    const parsed = parsePhoneNumber(phone, 'US');
    return parsed !== undefined && parsed.isValid();
  } catch {
    return false;
  }
}
