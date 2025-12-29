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
const TAG_LENGTH = 16;  // 128 bits for GCM authentication tag

// Validate encryption key at startup
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required for data encryption');
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}

// Type assertion - validated above
const KEY = ENCRYPTION_KEY as string;

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns: iv:salt:encrypted:tag in hex format
 */
export function encrypt(plaintext: string): string {
  try {
    // Generate random IV (initialization vector) - 12 bytes for GCM
    const iv = crypto.randomBytes(12);

    // Generate random salt - for additional security
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(KEY, 'hex'),
      iv
    );

    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);

    // Get authentication tag (proves data hasn't been tampered with)
    const tag = cipher.getAuthTag();

    // Return format: iv:salt:encrypted:tag (all hex)
    return `${iv.toString('hex')}:${salt.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt encrypted data using AES-256-GCM
 * Input format: iv:salt:encrypted:tag (hex)
 */
export function decrypt(encryptedData: string): string {
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
    if (iv.length !== 12) throw new Error('Invalid IV size');
    if (tag.length !== TAG_LENGTH) throw new Error('Invalid authentication tag size');

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(KEY, 'hex'),
      iv
    );

    // Set authentication tag (for verification)
    decipher.setAuthTag(tag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate hash of sensitive data for searchable field
 * Uses HMAC-SHA256 for consistency
 */
export function hashForSearch(plaintext: string): string {
  return crypto
    .createHmac('sha256', KEY)
    .update(plaintext)
    .digest('hex');
}

/**
 * Verify if plaintext matches hash
 */
export function verifyHashForSearch(plaintext: string, hash: string): boolean {
  const computed = hashForSearch(plaintext);
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hash)
  );
}

/**
 * Safely decrypt phone number, handling both encrypted and plain text formats
 * Some records may have plain text phones (legacy data before encryption was added)
 * Returns the decrypted phone if encrypted, or the original phone if already plain text
 */
export function decryptPhoneSafe(phoneData: string): string {
  try {
    // Check if it looks encrypted: format is iv:salt:encrypted:tag (4 parts separated by colons)
    const parts = phoneData.split(':');
    if (parts.length === 4) {
      // Try to decrypt assuming it's in encrypted format
      return decrypt(phoneData);
    }

    // Not encrypted - return as-is (plain text phone like +12064664353)
    return phoneData;
  } catch (error) {
    // If decryption fails for any reason, assume it's plain text
    return phoneData;
  }
}

/**
 * Safely decrypt email, handling both encrypted and plain text formats
 * Some records may have plain text emails (legacy data before encryption was added)
 * Returns the decrypted email if encrypted, or the original email if already plain text
 */
export function decryptEmailSafe(emailData: string): string {
  try {
    // Check if it looks encrypted: format is iv:salt:encrypted:tag (4 parts separated by colons)
    const parts = emailData.split(':');
    if (parts.length === 4) {
      // Try to decrypt assuming it's in encrypted format
      return decrypt(emailData);
    }

    // Not encrypted - return as-is (plain text email like user@example.com)
    return emailData;
  } catch (error) {
    // If decryption fails for any reason, assume it's plain text
    return emailData;
  }
}

/**
 * Generate token for various purposes (invitations, password resets, etc)
 */
export function generateToken(lengthBytes: number = 32): string {
  return crypto.randomBytes(lengthBytes).toString('hex');
}

/**
 * Create HMAC signature for webhook verification
 */
export function createSignature(message: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

/**
 * Verify HMAC signature with constant-time comparison
 */
export function verifySignature(message: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = createSignature(message, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
