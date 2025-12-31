import crypto from 'crypto';
/**
 * SECURITY: Encryption utilities for sensitive data (PII)
 * Uses AES-256-GCM for authenticated encryption
 *
 * Environment Variable Required:
 * ENCRYPTION_KEY - 32-byte hex string (generated via: openssl rand -hex 32)
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits for GCM authentication tag
// Validate encryption key at startup
if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required for data encryption');
}
if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}
// Type assertion - validated above
const KEY = ENCRYPTION_KEY;
/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns: iv:salt:encrypted:tag in hex format
 */
export function encrypt(plaintext) {
    try {
        // Generate random IV (initialization vector) - 12 bytes for GCM
        const iv = crypto.randomBytes(12);
        // Generate random salt - for additional security
        const salt = crypto.randomBytes(SALT_LENGTH);
        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
        // Encrypt
        const encrypted = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final()
        ]);
        // Get authentication tag (proves data hasn't been tampered with)
        const tag = cipher.getAuthTag();
        // Return format: iv:salt:encrypted:tag (all hex)
        return `${iv.toString('hex')}:${salt.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
    }
    catch (error) {
        throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Decrypt encrypted data using AES-256-GCM
 * Input format: iv:salt:encrypted:tag (hex)
 */
export function decrypt(encryptedData) {
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const salt = Buffer.from(parts[1], 'hex');
        const encrypted = Buffer.from(parts[2], 'hex');
        const tag = Buffer.from(parts[3], 'hex');
        // Validate sizes
        if (iv.length !== 12)
            throw new Error('Invalid IV size');
        if (tag.length !== TAG_LENGTH)
            throw new Error('Invalid authentication tag size');
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
        // Set authentication tag (for verification)
        decipher.setAuthTag(tag);
        // Decrypt
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
        return decrypted.toString('utf8');
    }
    catch (error) {
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Generate hash of sensitive data for searchable field
 * Uses HMAC-SHA256 for consistency
 */
export function hashForSearch(plaintext) {
    return crypto
        .createHmac('sha256', KEY)
        .update(plaintext)
        .digest('hex');
}
/**
 * Verify if plaintext matches hash
 */
export function verifyHashForSearch(plaintext, hash) {
    const computed = hashForSearch(plaintext);
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}
/**
 * Safely decrypt phone number, handling both encrypted and plain text formats
 * Some records may have plain text phones (legacy data before encryption was added)
 * Returns the decrypted phone if encrypted, or the original phone if already plain text
 */
export function decryptPhoneSafe(phoneData) {
    try {
        // Check if it looks encrypted: format is iv:salt:encrypted:tag (4 parts separated by colons)
        const parts = phoneData.split(':');
        if (parts.length === 4) {
            // Try to decrypt assuming it's in encrypted format
            return decrypt(phoneData);
        }
        // Not encrypted - return as-is (plain text phone like +12064664353)
        return phoneData;
    }
    catch (error) {
        // If decryption fails for any reason, assume it's plain text
        return phoneData;
    }
}
/**
 * Safely decrypt email, handling both encrypted and plain text formats
 * Some records may have plain text emails (legacy data before encryption was added)
 * Returns the decrypted email if encrypted, or the original email if already plain text
 */
export function decryptEmailSafe(emailData) {
    try {
        // Check if it looks encrypted: format is iv:salt:encrypted:tag (4 parts separated by colons)
        const parts = emailData.split(':');
        if (parts.length === 4) {
            // Try to decrypt assuming it's in encrypted format
            return decrypt(emailData);
        }
        // Not encrypted - return as-is (plain text email like user@example.com)
        return emailData;
    }
    catch (error) {
        // If decryption fails for any reason, assume it's plain text
        return emailData;
    }
}
/**
 * Generate token for various purposes (invitations, password resets, etc)
 */
export function generateToken(lengthBytes = 32) {
    return crypto.randomBytes(lengthBytes).toString('hex');
}
/**
 * Create HMAC signature for webhook verification
 */
export function createSignature(message, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');
}
/**
 * Verify HMAC signature with constant-time comparison
 */
export function verifySignature(message, signature, secret) {
    try {
        const expectedSignature = createSignature(message, secret);
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    catch {
        return false;
    }
}
/**
 * ============================================================================
 * EIN-SPECIFIC ENCRYPTION UTILITIES
 * ============================================================================
 *
 * SECURITY: EIN (Employer Identification Number) is highly sensitive PII
 * - 9-digit federal tax ID used by IRS
 * - Can be used for identity theft, fraudulent tax returns, credit fraud
 * - Must be encrypted at rest and masked in UI
 * - Access must be audited
 */
/**
 * Encrypt EIN for secure storage
 * Uses existing AES-256-GCM encryption
 */
export function encryptEIN(ein) {
    // Validate EIN format before encryption
    const cleanEIN = ein.replace(/\D/g, ''); // Remove non-digits
    if (cleanEIN.length !== 9) {
        throw new Error('EIN must be exactly 9 digits');
    }
    return encrypt(cleanEIN);
}
/**
 * Decrypt EIN from database
 * Uses existing AES-256-GCM decryption
 */
export function decryptEIN(encryptedEIN) {
    return decrypt(encryptedEIN);
}
/**
 * Create searchable hash of EIN (for validation without decryption)
 * Uses SHA-256 hash for consistency checking
 */
export function hashEIN(ein) {
    const cleanEIN = ein.replace(/\D/g, '');
    if (cleanEIN.length !== 9) {
        throw new Error('EIN must be exactly 9 digits');
    }
    return crypto
        .createHash('sha256')
        .update(cleanEIN)
        .digest('hex');
}
/**
 * Safely decrypt EIN, handling both encrypted and plain text formats
 * Legacy data may have plain text EINs before encryption was added
 */
export function decryptEINSafe(einData) {
    try {
        // Check if it looks encrypted: format is iv:salt:encrypted:tag (4 parts)
        const parts = einData.split(':');
        if (parts.length === 4) {
            // Encrypted format - decrypt it
            return decryptEIN(einData);
        }
        // Plain text format (legacy data) - return as-is
        // Validate it's 9 digits
        const cleanEIN = einData.replace(/\D/g, '');
        if (cleanEIN.length === 9) {
            return cleanEIN;
        }
        throw new Error('Invalid EIN format');
    }
    catch (error) {
        throw new Error(`Failed to decrypt EIN: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Mask EIN for display in logs/UI
 * Shows only last 4 digits: XX-XXX5678
 */
export function maskEIN(ein) {
    const cleanEIN = ein.replace(/\D/g, '');
    if (cleanEIN.length !== 9) {
        return 'XX-XXXXXXX'; // Completely masked if invalid
    }
    const lastFour = cleanEIN.slice(-4);
    return `XX-XXX${lastFour}`;
}
//# sourceMappingURL=encryption.utils.js.map