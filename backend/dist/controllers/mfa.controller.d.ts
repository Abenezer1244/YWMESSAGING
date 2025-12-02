import { Request, Response } from 'express';
/**
 * MFA Controller - Multi-Factor Authentication endpoints
 * All endpoints require authentication (admin login)
 * ✅ All inputs validated with Zod schemas
 */
/**
 * GET /api/mfa/status
 * Get current MFA status for authenticated admin
 */
export declare function getMFAStatus(req: Request, res: Response): Promise<void>;
/**
 * POST /api/mfa/enable/initiate
 * Start MFA setup - generate secret and QR code
 * ✅ Input validated with MFAInitiateSchema
 */
export declare function initiateMFASetup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/mfa/enable/verify
 * Verify setup code and enable MFA
 * ✅ Input validated with MFAVerifySchema
 * Body: { secret: string, code: string, email: string }
 */
export declare function verifyMFASetup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/mfa/disable
 * Disable MFA (requires verification with current code)
 * ✅ Input validated with MFADisableSchema
 * Body: { code: string }
 */
export declare function disableMFA(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/mfa/recovery-codes
 * Get recovery code status (how many remaining)
 */
export declare function getRecoveryCodeStatus(req: Request, res: Response): Promise<void>;
/**
 * POST /api/mfa/regenerate-recovery-codes
 * Generate new recovery codes (requires verification)
 * ✅ Input validated with RegenerateRecoveryCodesSchema
 * Body: { code: string }
 */
export declare function regenerateRecoveryCodes(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=mfa.controller.d.ts.map