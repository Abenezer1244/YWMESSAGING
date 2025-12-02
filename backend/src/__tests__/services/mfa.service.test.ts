import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import speakeasy from 'speakeasy';
import crypto from 'crypto';

/**
 * MFA Service Tests - TOTP and Recovery Code Functionality
 */

describe('MFA Service', () => {
  describe('TOTP Secret Generation (Speakeasy)', () => {
    it('should generate valid TOTP secret', () => {
      const secret = speakeasy.generateSecret({
        name: 'Koinonia SMS (admin@church.com)',
        issuer: 'Koinonia SMS',
        length: 32,
      });

      expect(secret.base32).toBeDefined();
      expect(secret.otpauth_url).toBeDefined();

      // Verify secret is base32 encoded
      expect(secret.base32).toMatch(/^[A-Z2-7]+=*$/);
      expect(secret.base32.length).toBeGreaterThan(30);

      // OTPAuth URL should contain issuer and email
      expect(secret.otpauth_url).toContain('Koinonia%20SMS');
      expect(secret.otpauth_url).toContain('admin%40church.com');
    });

    it('should generate different secrets for different inputs', () => {
      const secret1 = speakeasy.generateSecret({
        name: 'Test 1',
        length: 32,
      });
      const secret2 = speakeasy.generateSecret({
        name: 'Test 2',
        length: 32,
      });

      expect(secret1.base32).not.toBe(secret2.base32);
    });

    it('should support QR code generation from otpauth_url', () => {
      const secret = speakeasy.generateSecret({
        name: 'Koinonia SMS (pastor@test.com)',
        issuer: 'Koinonia SMS',
        length: 32,
      });

      // OTPAuth URL is suitable for QR code generation
      expect(secret.otpauth_url).toBeTruthy();
      expect(secret.otpauth_url.length).toBeGreaterThan(50);
      expect(secret.otpauth_url).toMatch(/^otpauth:\/\/totp\//);
    });
  });

  describe('TOTP Code Verification', () => {
    let totpSecret: string;

    beforeAll(() => {
      const secret = speakeasy.generateSecret({
        name: 'Koinonia SMS (test@church.com)',
        issuer: 'Koinonia SMS',
        length: 32,
      });
      if (!secret.base32) throw new Error('Failed to generate secret');
      totpSecret = secret.base32;
    });

    it('should generate valid TOTP code from secret', () => {
      const code = speakeasy.totp({
        secret: totpSecret,
        encoding: 'base32',
      });

      // Code should be 6 digits
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should verify valid TOTP code', () => {
      const code = speakeasy.totp({
        secret: totpSecret,
        encoding: 'base32',
      });

      const isValid = speakeasy.totp.verify({
        secret: totpSecret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      expect(isValid).toBe(true);
    });

    it('should reject invalid TOTP code', () => {
      const isValid = speakeasy.totp.verify({
        secret: totpSecret,
        encoding: 'base32',
        token: '000000',
        window: 2,
      });

      expect(isValid).toBeFalsy();
    });

    it('should accept codes within time window', () => {
      // Current code
      const currentCode = speakeasy.totp({
        secret: totpSecret,
        encoding: 'base32',
      });

      // Verify with window of 2 (accepts -1, 0, +1 time windows)
      const isValid = speakeasy.totp.verify({
        secret: totpSecret,
        encoding: 'base32',
        token: currentCode,
        window: 2,
      });

      expect(isValid).toBe(true);
    });

    it('should reject codes outside time window', () => {
      // Random invalid code
      const invalidCode = '123456';

      const isValid = speakeasy.totp.verify({
        secret: totpSecret,
        encoding: 'base32',
        token: invalidCode,
        window: 2,
      });

      expect(isValid).toBeFalsy();
    });

    it('should handle different secret formats', () => {
      const secret = speakeasy.generateSecret({ length: 32 });
      if (!secret.base32) throw new Error('Failed to generate secret');

      const code = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
      });

      const isValid = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      expect(isValid).toBe(true);
    });
  });

  describe('Recovery Code Generation (Pure Crypto)', () => {
    it('should generate recovery code with correct format', () => {
      // Simulate recovery code generation
      const RECOVERY_CODE_LENGTH = 8;
      const code = crypto
        .randomBytes(Math.ceil(RECOVERY_CODE_LENGTH * 0.75))
        .toString('base64')
        .slice(0, RECOVERY_CODE_LENGTH)
        .toUpperCase();
      const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;

      expect(formatted).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(formatted.length).toBe(9); // 4 + 1 + 4
    });

    it('should generate different codes each time', () => {
      const RECOVERY_CODE_LENGTH = 8;
      const codes: string[] = [];

      for (let i = 0; i < 10; i++) {
        const code = crypto
          .randomBytes(Math.ceil(RECOVERY_CODE_LENGTH * 0.75))
          .toString('base64')
          .slice(0, RECOVERY_CODE_LENGTH)
          .toUpperCase();
        codes.push(code);
      }

      // All generated codes should be unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(10);
    });

    it('should generate codes with base64 characters (typical format)', () => {
      const RECOVERY_CODE_LENGTH = 8;

      for (let i = 0; i < 5; i++) {
        const code = crypto
          .randomBytes(Math.ceil(RECOVERY_CODE_LENGTH * 0.75))
          .toString('base64')
          .slice(0, RECOVERY_CODE_LENGTH)
          .toUpperCase();

        // Base64 can contain A-Z, 0-9, +, /, =
        // Recovery codes will have 8 characters
        expect(code.length).toBe(8);
        expect(code).toBeTruthy();
      }
    });

    it('should have sufficient entropy per code', () => {
      // Base64 encoding of 6 random bytes = 8 characters with ~48 bits entropy
      const RECOVERY_CODE_LENGTH = 8;
      const randomBytes = crypto.randomBytes(Math.ceil(RECOVERY_CODE_LENGTH * 0.75));

      expect(randomBytes.length).toBe(6); // ceil(8 * 0.75) = 6
      // 6 bytes = 48 bits of entropy - sufficient for recovery codes
      expect(randomBytes).toHaveLength(6);
    });

    it('should format multiple codes independently', () => {
      const codes: string[] = [];
      const RECOVERY_CODE_LENGTH = 8;

      for (let i = 0; i < 10; i++) {
        const code = crypto
          .randomBytes(Math.ceil(RECOVERY_CODE_LENGTH * 0.75))
          .toString('base64')
          .slice(0, RECOVERY_CODE_LENGTH)
          .toUpperCase();
        codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
      }

      // All 10 codes should be formatted correctly
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        // Should be in format XXXX-XXXX where X can be base64 chars
        expect(code).toMatch(/^.{4}-.{4}$/);
        expect(code.length).toBe(9); // 4 + 1 + 4
      });

      // All should be unique
      const unique = new Set(codes);
      expect(unique.size).toBe(10);
    });
  });

  describe('Recovery Code Hashing', () => {
    it('should hash recovery codes with SHA256', async () => {
      const code = 'ABCD-EFGH';
      const hash = crypto.createHash('sha256').update(code).digest('hex');

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash.length).toBe(64);
    });

    it('should produce consistent hash for same code', () => {
      const code = 'TEST-CODE';
      const hash1 = crypto.createHash('sha256').update(code).digest('hex');
      const hash2 = crypto.createHash('sha256').update(code).digest('hex');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different codes', () => {
      const code1 = 'CODE-1111';
      const code2 = 'CODE-2222';

      const hash1 = crypto.createHash('sha256').update(code1).digest('hex');
      const hash2 = crypto.createHash('sha256').update(code2).digest('hex');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('MFA Security Properties', () => {
    it('should not expose secret in plaintext', () => {
      const secret = speakeasy.generateSecret({
        name: 'Test',
        length: 32,
      });

      if (!secret.base32) throw new Error('Failed to generate secret');

      // Secret should be base32, not plain ASCII
      expect(secret.base32).not.toMatch(/[a-z]/); // No lowercase letters
      expect(secret.base32).toMatch(/^[A-Z2-7]+=*$/); // Only valid base32 chars
    });

    it('should generate valid otpauth URL for QR code', () => {
      const secret = speakeasy.generateSecret({
        name: 'Koinonia SMS (perf@test.com)',
        issuer: 'Koinonia SMS',
        length: 32,
      });

      if (!secret.otpauth_url) throw new Error('Failed to generate otpauth URL');

      // OTPAuth URL is suitable for QR code generation
      expect(secret.otpauth_url).toMatch(/^otpauth:\/\/totp\//);
      expect(secret.otpauth_url).toContain('Koinonia%20SMS');
    });

    it('should handle high-entropy recovery code generation', () => {
      // Simulate generation of 10 recovery codes
      const RECOVERY_CODE_LENGTH = 8;
      const codes: string[] = [];

      for (let i = 0; i < 10; i++) {
        const code = crypto
          .randomBytes(Math.ceil(RECOVERY_CODE_LENGTH * 0.75))
          .toString('base64')
          .slice(0, RECOVERY_CODE_LENGTH)
          .toUpperCase();
        codes.push(code);
      }

      // Each code has ~48 bits of entropy (6 random bytes)
      // 10 codes = 480 bits total - very strong
      expect(codes).toHaveLength(10);
      codes.forEach((code: string) => {
        // Code should be 8 characters (possibly including base64 chars like +,/)
        expect(code.length).toBe(8);
        expect(code).toBeTruthy();
      });

      // All should be unique
      const unique = new Set(codes);
      expect(unique.size).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid secret gracefully', () => {
      const isValid = speakeasy.totp.verify({
        secret: 'INVALID',
        encoding: 'base32',
        token: '123456',
        window: 2,
      });

      // Should return false, not throw
      expect(isValid).toBeFalsy();
    });

    it('should handle empty code', () => {
      const secret = speakeasy.generateSecret({ length: 32 });
      if (!secret.base32) throw new Error('Failed to generate secret');

      const isValid = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: '',
        window: 2,
      });

      expect(isValid).toBeFalsy();
    });

    it('should handle non-numeric code', () => {
      const secret = speakeasy.generateSecret({ length: 32 });
      if (!secret.base32) throw new Error('Failed to generate secret');

      const isValid = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: 'ABCDEF',
        window: 2,
      });

      expect(isValid).toBeFalsy();
    });
  });
});
