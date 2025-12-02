/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns: iv:salt:encrypted:tag in hex format
 */
export declare function encrypt(plaintext: string): string;
/**
 * Decrypt encrypted data using AES-256-GCM
 * Input format: iv:salt:encrypted:tag (hex)
 */
export declare function decrypt(encryptedData: string): string;
/**
 * Generate hash of sensitive data for searchable field
 * Uses HMAC-SHA256 for consistency
 */
export declare function hashForSearch(plaintext: string): string;
/**
 * Verify if plaintext matches hash
 */
export declare function verifyHashForSearch(plaintext: string, hash: string): boolean;
/**
 * Safely decrypt phone number, handling both encrypted and plain text formats
 * Some records may have plain text phones (legacy data before encryption was added)
 * Returns the decrypted phone if encrypted, or the original phone if already plain text
 */
export declare function decryptPhoneSafe(phoneData: string): string;
/**
 * Safely decrypt email, handling both encrypted and plain text formats
 * Some records may have plain text emails (legacy data before encryption was added)
 * Returns the decrypted email if encrypted, or the original email if already plain text
 */
export declare function decryptEmailSafe(emailData: string): string;
//# sourceMappingURL=encryption.utils.d.ts.map