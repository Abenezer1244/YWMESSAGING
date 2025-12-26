/**
 * Format phone number to E.164 format (+12025550173)
 * Default region: US
 * Handles various formats: (202) 555-0173, 202-555-0173, 2025550173, +1 202 555 0173, etc.
 * ✅ LENIENT: Accepts any valid-looking phone number, not just ones libphonenumber-js validates
 */
export declare function formatToE164(phone: string): string;
/**
 * Validate if phone number is valid
 * ✅ LENIENT: Uses same logic as formatToE164 so validation matches formatting
 */
export declare function validatePhoneNumber(phone: string): boolean;
//# sourceMappingURL=phone.utils.d.ts.map