import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.utils.js';
import { logPermissionDenied } from '../utils/security-logger.js';
import { isTokenRevoked } from '../services/token-revocation.service.js';
import { getTenantPrisma, TenantPrismaClient } from '../lib/tenant-prisma.js';

// ============================================================================
// EXTEND EXPRESS REQUEST TYPE FOR MULTI-TENANCY
// ============================================================================
// Extend Express Request type to include user, tenant context, and tenant-specific database
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      tenantId?: string; // Tenant identifier (churchId from JWT)
      prisma?: TenantPrismaClient; // Tenant-specific Prisma client
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
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  // ============================================
  // STEP 1: Get token from cookie or header
  // ============================================
  let token = req.cookies.accessToken;

  // DEBUG: Log cookie situation
  if (!token) {
    console.log('🔍 AUTH_MIDDLEWARE - No token in cookies', {
      cookiesReceived: req.cookies,
      cookieHeader: req.headers['cookie'],
      allCookies: Object.keys(req.cookies),
      origin: req.get('origin'),
      referer: req.get('referer'),
      host: req.get('host'),
    });
  }

  // Fall back to Authorization header
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  }

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  // ============================================
  // STEP 2: Verify token signature
  // ============================================
  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // ============================================
  // STEP 3: Check token revocation
  // ============================================
  const revoked = await isTokenRevoked(token, 'access');
  console.log(`[AUTH] Token revocation check - token: ${token.substring(0, 20)}..., revoked: ${revoked}`);
  if (revoked) {
    console.error(`[AUTH] ❌ TOKEN REVOKED - User: ${payload?.adminId}, Token hash: ${token.substring(0, 20)}`);
    res.status(401).json({ error: 'Token has been revoked. Please log in again.' });
    return;
  }
  console.log(`[AUTH] ✅ Token revocation check passed for user: ${payload?.adminId}`);

  // ============================================
  // STEP 4: Extract tenant ID from token
  // ============================================
  const tenantId = payload.churchId;
  if (!tenantId) {
    console.error(`[AUTH] ❌ INVALID TOKEN - No churchId in payload:`, payload);
    res.status(401).json({ error: 'Invalid token: missing tenant information' });
    return;
  }

  // ============================================
  // STEP 5: Get tenant-specific Prisma client
  // ============================================
  try {
    console.log(`[AUTH] Getting tenant database connection for tenant: ${tenantId}`);
    const tenantPrisma = await getTenantPrisma(tenantId);

    // ============================================
    // STEP 6: Attach to request
    // ============================================
    req.user = payload;
    req.tenantId = tenantId;
    req.prisma = tenantPrisma;

    console.log(
      `[AUTH] ✅ Request authenticated - Admin: ${payload.adminId}, Tenant: ${tenantId}, Role: ${payload.role}`
    );
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AUTH] ❌ Failed to connect to tenant database: ${message}`);
    res.status(503).json({
      error: 'Database connection unavailable',
      message: 'Unable to connect to your database. Please try again later.',
    });
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
      logPermissionDenied(
        req.user.adminId,
        req.originalUrl || req.path,
        roles.join(', '),
        req.user.role,
        ipAddress
      );
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user owns the resource
 */
export function authorizeChurch(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const churchId = req.params.churchId;
  if (churchId && req.user.churchId !== churchId) {
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
    logPermissionDenied(
      req.user.adminId,
      req.originalUrl || req.path,
      `Church: ${req.user.churchId}`,
      `Church: ${churchId}`,
      ipAddress
    );
    res.status(403).json({ error: 'Unauthorized church access' });
    return;
  }

  next();
}
