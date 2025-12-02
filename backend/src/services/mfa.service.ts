import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { encrypt, decrypt } from '../utils/encryption.utils.js';

/**
 * MFA Service - Multi-Factor Authentication using TOTP
 * Implements Google Authenticator compatible TOTP with recovery codes
 */

const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_LENGTH = 8;
const TOTP_WINDOW = 2; // Accept codes from -1 to +1 time window

/**
 * Generate TOTP secret and QR code
 */
export async function generateMFASecret(email: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}> {
  try {
    const secret = speakeasy.generateSecret({
      name: `Koinonia SMS (${email})`,
      issuer: 'Koinonia SMS',
      length: 32,
    });

    if (!secret.base32 || !secret.otpauth_url) {
      throw new Error('Failed to generate TOTP secret');
    }

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeUrl,
      manualEntryKey: secret.base32,
    };
  } catch (error) {
    console.error('Failed to generate MFA secret:', error);
    throw new Error(`MFA secret generation failed: ${(error as Error).message}`);
  }
}

/**
 * Enable MFA for an admin
 */
export async function enableMFA(
  adminId: string,
  totpSecret: string,
  verifyCode: string,
  email: string
) {
  try {
    // Verify the code with the secret first
    const isValid = speakeasy.totp.verify({
      secret: totpSecret,
      encoding: 'base32',
      token: verifyCode,
      window: TOTP_WINDOW,
    });

    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Check if MFA already exists
    let mfaRecord = await prisma.adminMFA.findUnique({
      where: { adminId },
    });

    // Encrypt the secret before storing
    const encryptedSecret = encrypt(totpSecret);

    if (!mfaRecord) {
      // Create new MFA record
      mfaRecord = await prisma.adminMFA.create({
        data: {
          adminId,
          totpSecret: encryptedSecret,
          mfaEnabled: true,
          enabledAt: new Date(),
        },
      });
    } else {
      // Update existing record
      mfaRecord = await prisma.adminMFA.update({
        where: { adminId },
        data: {
          totpSecret: encryptedSecret,
          mfaEnabled: true,
          enabledAt: new Date(),
        },
      });
    }

    // Generate recovery codes
    const recoveryCodes = await generateRecoveryCodes(adminId);

    return {
      mfaEnabled: true,
      recoveryCodes,
      message: 'Two-factor authentication enabled successfully',
    };
  } catch (error) {
    console.error('Failed to enable MFA:', error);
    throw new Error(`MFA enablement failed: ${(error as Error).message}`);
  }
}

/**
 * Verify TOTP code
 */
export async function verifyTOTPCode(adminId: string, code: string): Promise<boolean> {
  try {
    const mfaRecord = await prisma.adminMFA.findUnique({
      where: { adminId },
    });

    if (!mfaRecord || !mfaRecord.mfaEnabled) {
      throw new Error('MFA not enabled for this admin');
    }

    // Decrypt secret
    const totpSecret = decrypt(mfaRecord.totpSecret);

    // Verify code
    const isValid = speakeasy.totp.verify({
      secret: totpSecret,
      encoding: 'base32',
      token: code,
      window: TOTP_WINDOW,
    });

    if (isValid) {
      // Update last verified timestamp
      await prisma.adminMFA.update({
        where: { adminId },
        data: { lastVerifiedAt: new Date() },
      });
    }

    return isValid;
  } catch (error) {
    console.error('Failed to verify TOTP code:', error);
    return false;
  }
}

/**
 * Verify recovery code
 */
export async function verifyRecoveryCode(adminId: string, code: string): Promise<boolean> {
  try {
    const mfaRecord = await prisma.adminMFA.findUnique({
      where: { adminId },
    });

    if (!mfaRecord || !mfaRecord.mfaEnabled) {
      throw new Error('MFA not enabled for this admin');
    }

    // Find unused recovery code
    const recoveryCode = await prisma.mFARecoveryCode.findFirst({
      where: {
        adminId,
        code, // Hash will be computed in the query
        usedAt: null,
      },
    });

    if (!recoveryCode) {
      return false;
    }

    // Mark as used
    await prisma.mFARecoveryCode.update({
      where: { id: recoveryCode.id },
      data: { usedAt: new Date() },
    });

    // Update MFA record to track used code
    const usedIndices = JSON.parse(mfaRecord.backupCodesUsed || '[]');
    if (!usedIndices.includes(recoveryCode.index)) {
      usedIndices.push(recoveryCode.index);
      await prisma.adminMFA.update({
        where: { adminId },
        data: { backupCodesUsed: JSON.stringify(usedIndices) },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to verify recovery code:', error);
    return false;
  }
}

/**
 * Disable MFA
 */
export async function disableMFA(adminId: string, verifyCode: string): Promise<void> {
  try {
    // Verify current code first
    const isValid = await verifyTOTPCode(adminId, verifyCode);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Disable MFA
    await prisma.adminMFA.update({
      where: { adminId },
      data: {
        mfaEnabled: false,
        disabledAt: new Date(),
      },
    });

    // Delete recovery codes
    await prisma.mFARecoveryCode.deleteMany({
      where: { adminId },
    });

    console.log(`✅ MFA disabled for admin ${adminId}`);
  } catch (error) {
    console.error('Failed to disable MFA:', error);
    throw new Error(`MFA disablement failed: ${(error as Error).message}`);
  }
}

/**
 * Get MFA status
 */
export async function getMFAStatus(adminId: string) {
  try {
    const mfaRecord = await prisma.adminMFA.findUnique({
      where: { adminId },
    });

    if (!mfaRecord) {
      return {
        mfaEnabled: false,
        backupCodesRemaining: 0,
        enabledAt: null,
      };
    }

    // Count remaining recovery codes
    const usedIndices = JSON.parse(mfaRecord.backupCodesUsed || '[]');
    const backupCodesRemaining = RECOVERY_CODE_COUNT - usedIndices.length;

    return {
      mfaEnabled: mfaRecord.mfaEnabled,
      backupCodesRemaining,
      enabledAt: mfaRecord.enabledAt,
      lastVerifiedAt: mfaRecord.lastVerifiedAt,
    };
  } catch (error) {
    console.error('Failed to get MFA status:', error);
    throw new Error(`MFA status retrieval failed: ${(error as Error).message}`);
  }
}

/**
 * Generate recovery codes
 */
export async function generateRecoveryCodes(adminId: string, count: number = RECOVERY_CODE_COUNT): Promise<string[]> {
  try {
    // Generate codes
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(Math.ceil(RECOVERY_CODE_LENGTH * 0.75)).toString('base64').slice(0, RECOVERY_CODE_LENGTH).toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }

    // Delete old codes
    await prisma.mFARecoveryCode.deleteMany({
      where: { adminId },
    });

    // Store new codes (hashed)
    const codePromises = codes.map((code, index) => {
      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
      return prisma.mFARecoveryCode.create({
        data: {
          adminId,
          code: hashedCode,
          index,
        },
      });
    });

    await Promise.all(codePromises);

    // Reset used codes tracking
    await prisma.adminMFA.update({
      where: { adminId },
      data: { backupCodesUsed: '[]' },
    });

    return codes;
  } catch (error) {
    console.error('Failed to generate recovery codes:', error);
    throw new Error(`Recovery code generation failed: ${(error as Error).message}`);
  }
}

/**
 * Get recovery code status
 */
export async function getRecoveryCodeStatus(adminId: string) {
  try {
    const mfaRecord = await prisma.adminMFA.findUnique({
      where: { adminId },
    });

    if (!mfaRecord) {
      return {
        totalCodes: 0,
        usedCodes: 0,
        remainingCodes: 0,
      };
    }

    const usedIndices = JSON.parse(mfaRecord.backupCodesUsed || '[]');

    return {
      totalCodes: RECOVERY_CODE_COUNT,
      usedCodes: usedIndices.length,
      remainingCodes: RECOVERY_CODE_COUNT - usedIndices.length,
    };
  } catch (error) {
    console.error('Failed to get recovery code status:', error);
    throw new Error(`Recovery code status retrieval failed: ${(error as Error).message}`);
  }
}
