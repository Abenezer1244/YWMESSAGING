import { logPermissionDenied } from '../utils/security-logger.js';
/**
 * Middleware to check if user is an admin
 */
export function isAdmin(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    if (req.user.role !== 'admin') {
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
        logPermissionDenied(req.user.adminId, req.originalUrl || req.path, 'admin', req.user.role || 'unknown', ipAddress);
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}
//# sourceMappingURL=admin.middleware.js.map