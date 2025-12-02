import { Request, Response } from 'express';
import * as mfaService from '../services/mfa.service.js';
import { MFAInitiateSchema, MFAVerifySchema, MFADisableSchema, RegenerateRecoveryCodesSchema } from '../lib/validation/schemas.js';

/**
 * MFA Controller - Multi-Factor Authentication endpoints
 * All endpoints require authentication (admin login)
 * ✅ All inputs validated with Zod schemas
 */

/**
 * GET /api/mfa/status
 * Get current MFA status for authenticated admin
 */
export async function getMFAStatus(req: Request, res: Response) {
  try {
    const adminId = req.user!.adminId;

    const status = await mfaService.getMFAStatus(adminId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Get MFA status error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/mfa/enable/initiate
 * Start MFA setup - generate secret and QR code
 * ✅ Input validated with MFAInitiateSchema
 */
export async function initiateMFASetup(req: Request, res: Response) {
  try {
    // Validate input
    const validationResult = MFAInitiateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.errors[0].message,
      });
    }

    const { email } = validationResult.data;

    const { secret, qrCodeUrl, manualEntryKey } = await mfaService.generateMFASecret(email);

    res.json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        manualEntryKey,
        message: 'Scan this QR code with your authenticator app, or enter the key manually',
      },
    });
  } catch (error) {
    console.error('Initiate MFA setup error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/mfa/enable/verify
 * Verify setup code and enable MFA
 * ✅ Input validated with MFAVerifySchema
 * Body: { secret: string, code: string, email: string }
 */
export async function verifyMFASetup(req: Request, res: Response) {
  try {
    // Validate input
    const validationResult = MFAVerifySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.errors[0].message,
      });
    }

    const adminId = req.user!.adminId;
    const { secret, code, email } = validationResult.data;

    const result = await mfaService.enableMFA(adminId, secret, code, email);

    res.json({
      success: true,
      data: {
        mfaEnabled: result.mfaEnabled,
        recoveryCodes: result.recoveryCodes,
        message: result.message,
        warning: 'Save these recovery codes in a safe place. Each code can only be used once.',
      },
    });
  } catch (error) {
    console.error('Verify MFA setup error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/mfa/disable
 * Disable MFA (requires verification with current code)
 * ✅ Input validated with MFADisableSchema
 * Body: { code: string }
 */
export async function disableMFA(req: Request, res: Response) {
  try {
    // Validate input
    const validationResult = MFADisableSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.errors[0].message,
      });
    }

    const adminId = req.user!.adminId;
    const { code } = validationResult.data;

    await mfaService.disableMFA(adminId, code);

    res.json({
      success: true,
      data: {
        message: 'Two-factor authentication has been disabled',
      },
    });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/mfa/recovery-codes
 * Get recovery code status (how many remaining)
 */
export async function getRecoveryCodeStatus(req: Request, res: Response) {
  try {
    const adminId = req.user!.adminId;

    const status = await mfaService.getRecoveryCodeStatus(adminId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Get recovery code status error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/mfa/regenerate-recovery-codes
 * Generate new recovery codes (requires verification)
 * ✅ Input validated with RegenerateRecoveryCodesSchema
 * Body: { code: string }
 */
export async function regenerateRecoveryCodes(req: Request, res: Response) {
  try {
    // Validate input
    const validationResult = RegenerateRecoveryCodesSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.errors[0].message,
      });
    }

    const adminId = req.user!.adminId;
    const { code } = validationResult.data;

    // Verify current code first
    const isValid = await mfaService.verifyTOTPCode(adminId, code);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    const recoveryCodes = await mfaService.generateRecoveryCodes(adminId);

    res.json({
      success: true,
      data: {
        recoveryCodes,
        message: 'Recovery codes regenerated successfully',
        warning: 'Save these new recovery codes. Old codes are no longer valid.',
      },
    });
  } catch (error) {
    console.error('Regenerate recovery codes error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
