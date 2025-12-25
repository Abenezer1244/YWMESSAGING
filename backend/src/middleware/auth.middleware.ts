import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.utils.js';
import { logPermissionDenied } from '../utils/security-logger.js';
import { isTokenRevoked } from '../services/token-revocation.service.js';

// Extend Express Request type to include user
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
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Try to get token from httpOnly cookie first
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

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // ✅ SECURITY: Check if token has been revoked (logged out)
  const revoked = await isTokenRevoked(token, 'access');
  if (revoked) {
    res.status(401).json({ error: 'Token has been revoked. Please log in again.' });
    return;
  }

  req.user = payload;
  next();
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
