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
//# sourceMappingURL=auth.controller.d.ts.map