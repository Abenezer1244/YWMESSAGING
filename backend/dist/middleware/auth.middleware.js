import { verifyAccessToken } from '../utils/jwt.utils.js';
/**
 * Middleware to authenticate JWT token
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const payload = verifyAccessToken(token);
    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    req.user = payload;
    next();
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
        res.status(403).json({ error: 'Unauthorized church access' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map