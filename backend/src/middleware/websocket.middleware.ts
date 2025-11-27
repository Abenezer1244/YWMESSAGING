/**
 * WebSocket Authentication Middleware
 * Validates JWT tokens and attaches user info to socket
 */

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

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
export function websocketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    // Get token from query, header, or auth data
    let token: string | undefined;

    // Try query parameter first
    if (socket.handshake.query?.token) {
      token = socket.handshake.query.token as string;
    }

    // Try Authorization header
    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Try handshake auth
    if (!token && (socket.handshake as any)?.auth?.token) {
      token = (socket.handshake as any).auth.token;
    }

    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }

    // Verify JWT signature and decode
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;

    // Validate required fields
    if (!decoded.userId || !decoded.churchId || !decoded.email) {
      return next(new Error('Authentication error: Invalid token structure'));
    }

    // Attach user data to socket for later use
    (socket as AuthenticatedSocket).data = {
      userId: decoded.userId,
      churchId: decoded.churchId,
      email: decoded.email,
    };

    console.log(`✅ WebSocket authenticated: user=${decoded.userId}, church=${decoded.churchId}`);
    next();
  } catch (error: any) {
    console.error(`❌ WebSocket auth failed: ${error.message}`);
    next(new Error(`Authentication error: ${error.message}`));
  }
}

/**
 * Get church room name for broadcast
 */
export function getChurchRoom(churchId: string): string {
  return `church:${churchId}`;
}

/**
 * Get user room name for personal notifications
 */
export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}
