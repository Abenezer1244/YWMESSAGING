import { Router } from 'express';
import * as mfaController from '../controllers/mfa.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * MFA Routes - All endpoints require authentication
 * Implements Time-based One-Time Password (TOTP) authentication with recovery codes
 */

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * Status and Information
 */

// GET /api/mfa/status - Get current MFA status
router.get('/status', mfaController.getMFAStatus);

// GET /api/mfa/recovery-codes - Get recovery code status
router.get('/recovery-codes', mfaController.getRecoveryCodeStatus);

/**
 * Enable MFA
 */

// POST /api/mfa/enable/initiate - Start MFA setup (get QR code)
router.post('/enable/initiate', mfaController.initiateMFASetup);

// POST /api/mfa/enable/verify - Complete MFA setup with verification code
router.post('/enable/verify', mfaController.verifyMFASetup);

/**
 * Manage MFA
 */

// POST /api/mfa/disable - Disable MFA (requires verification)
router.post('/disable', mfaController.disableMFA);

// POST /api/mfa/regenerate-recovery-codes - Generate new recovery codes
router.post('/regenerate-recovery-codes', mfaController.regenerateRecoveryCodes);

export default router;
