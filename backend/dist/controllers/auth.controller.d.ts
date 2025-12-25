import { Request, Response } from 'express';
/**
 * POST /api/auth/register
 */
export declare function register(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/login
 */
export declare function loginHandler(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/refresh
 */
export declare function refreshToken(req: Request, res: Response): Promise<void>;
/**
 * GET /api/auth/me
 */
export declare function getMe(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/logout
 * ✅ SECURITY: Revoke tokens from BOTH cookies and Authorization header
 * Frontend may send token in Authorization header instead of cookies
 */
export declare function logout(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/verify-mfa
 * Verify MFA code (TOTP or recovery code) and complete login
 * Body: { mfaSessionToken: string, code: string }
 */
export declare function verifyMFAHandler(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/complete-welcome
 * Mark user's welcome modal as completed and store their role
 */
export declare function completeWelcome(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map