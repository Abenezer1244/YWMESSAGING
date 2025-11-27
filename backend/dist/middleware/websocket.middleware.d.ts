/**
 * WebSocket Authentication Middleware
 * Validates JWT tokens and attaches user info to socket
 */
import { Socket } from 'socket.io';
export interface AuthenticatedSocket extends Socket {
    data: {
        userId: string;
        churchId: string;
        email: string;
    };
}
/**
 * Authenticate WebSocket connection via JWT
 * Token can be passed as:
 * 1. Query parameter: ?token=xyz
 * 2. Auth header: Authorization: Bearer xyz
 * 3. Handshake data
 */
export declare function websocketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void;
/**
 * Get church room name for broadcast
 */
export declare function getChurchRoom(churchId: string): string;
/**
 * Get user room name for personal notifications
 */
export declare function getUserRoom(userId: string): string;
//# sourceMappingURL=websocket.middleware.d.ts.map