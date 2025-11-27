/**
 * WebSocket Authentication Middleware
 * Validates JWT tokens and attaches user info to socket
 */
import jwt from 'jsonwebtoken';
/**
 * Authenticate WebSocket connection via JWT
 * Token can be passed as:
 * 1. Query parameter: ?token=xyz
 * 2. Auth header: Authorization: Bearer xyz
 * 3. Handshake data
 */
export function websocketAuthMiddleware(socket, next) {
    try {
        // Get token from query, header, or auth data
        let token;
        // Try query parameter first
        if (socket.handshake.query?.token) {
            token = socket.handshake.query.token;
        }
        // Try Authorization header
        if (!token && socket.handshake.headers?.authorization) {
            const authHeader = socket.handshake.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        // Try handshake auth
        if (!token && socket.handshake?.auth?.token) {
            token = socket.handshake.auth.token;
        }
        if (!token) {
            return next(new Error('Authentication error: Missing token'));
        }
        // Verify JWT signature and decode
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret);
        // Validate required fields
        if (!decoded.userId || !decoded.churchId || !decoded.email) {
            return next(new Error('Authentication error: Invalid token structure'));
        }
        // Attach user data to socket for later use
        socket.data = {
            userId: decoded.userId,
            churchId: decoded.churchId,
            email: decoded.email,
        };
        console.log(`✅ WebSocket authenticated: user=${decoded.userId}, church=${decoded.churchId}`);
        next();
    }
    catch (error) {
        console.error(`❌ WebSocket auth failed: ${error.message}`);
        next(new Error(`Authentication error: ${error.message}`));
    }
}
/**
 * Get church room name for broadcast
 */
export function getChurchRoom(churchId) {
    return `church:${churchId}`;
}
/**
 * Get user room name for personal notifications
 */
export function getUserRoom(userId) {
    return `user:${userId}`;
}
//# sourceMappingURL=websocket.middleware.js.map