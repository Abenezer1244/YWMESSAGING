import { verifyAccessToken } from '../utils/jwt.utils.js';
import { logPermissionDenied } from '../utils/security-logger.js';
import { isTokenRevoked } from '../services/token-revocation.service.js';
import { getTenantPrisma } from '../lib/tenant-prisma.js';
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
export async function authenticateToken(req, res, next) {
    // ============================================
    // STEP 1: Get token from header or cookie
    // ============================================
    // CRITICAL FIX: Prefer Authorization header over cookies
    // The Authorization header is always fresh from the frontend Zustand store
    // Cookies may contain stale tokens from previous sessions that weren't properly cleared
    // This prevents tenant isolation bugs where User A's cookie persists when User B logs in
    let token = undefined;
    // First, check Authorization header (always fresh from authStore)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // Fall back to cookie only if no Authorization header
    if (!token) {
        token = req.cookies.accessToken;
        // DEBUG: Log when falling back to cookie
        if (token) {
            console.log('🔍 AUTH_MIDDLEWARE - Using cookie token (no Authorization header)');
        }
        else {
            console.log('🔍 AUTH_MIDDLEWARE - No token found', {
                hasAuthHeader: !!authHeader,
                hasCookie: !!req.cookies.accessToken,
                origin: req.get('origin'),
            });
        }
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
        console.log(`[AUTH] ✅ Request authenticated - Admin: ${payload.adminId}, Tenant: ${tenantId}, Role: ${payload.role}`);
        next();
    }
    catch (error) {
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
export function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
            logPermissionDenied(req.user.adminId, req.originalUrl || req.path, roles.join(', '), req.user.role, ipAddress);
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
/**
 * Middleware to check if user owns the resource
 */
export function authorizeChurch(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const churchId = req.params.churchId;
    if (churchId && req.user.churchId !== churchId) {
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
        logPermissionDenied(req.user.adminId, req.originalUrl || req.path, `Church: ${req.user.churchId}`, `Church: ${churchId}`, ipAddress);
        res.status(403).json({ error: 'Unauthorized church access' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map