import { Request, Response } from 'express';
import * as mfaService from '../services/mfa.service.js';

/**
 * MFA Controller - Multi-Factor Authentication endpoints
 * All endpoints require authentication (admin login)
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
 */
export async function initiateMFASetup(req: Request, res: Response) {
  try {
    const admin = req.user!;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

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
 * Body: { secret: string, code: string }
 */
export async function verifyMFASetup(req: Request, res: Response) {
  try {
    const adminId = req.user!.adminId;
    const { secret, code, email } = req.body;

    if (!secret || !code) {
      return res.status(400).json({
        success: false,
        error: 'Secret and code are required',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

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
 * Body: { code: string }
 */
export async function disableMFA(req: Request, res: Response) {
  try {
    const adminId = req.user!.adminId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required',
      });
    }

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
 * Body: { code: string }
 */
export async function regenerateRecoveryCodes(req: Request, res: Response) {
  try {
    const adminId = req.user!.adminId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required',
      });
    }

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
