import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}
/**
 * Middleware to authenticate JWT token
 * Checks cookies first, then falls back to Authorization header
 * ✅ SECURITY: Also checks if token has been revoked (prevents use after logout)
 */
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware to check if user has required role
 */
export declare function requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user owns the resource
 */
export declare function authorizeChurch(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map