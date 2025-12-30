import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../utils/jwt.utils.js';
import { TenantPrismaClient } from '../lib/tenant-prisma.js';
declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
            tenantId?: string;
            prisma?: TenantPrismaClient;
        }
    }
}
/**
 * Middleware to authenticate JWT token and attach tenant context
 *
 * Flow:
 * 1. Get token from httpOnly cookie or Authorization header
 * 2. Verify token signature
 * 3. Check token revocation status
 * 4. Extract tenant ID from token (churchId)
 * 5. Get tenant-specific Prisma client
 * 6. Attach user, tenantId, and prisma to request
 *
 * ✅ SECURITY: Also checks if token has been revoked (prevents use after logout)
 * ✅ MULTI-TENANT: Attaches tenant-specific database client to every request
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