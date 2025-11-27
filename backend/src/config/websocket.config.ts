/**
 * WebSocket Configuration
 * Socket.io settings for real-time notifications
 */

import { ServerOptions } from 'socket.io';

export const websocketConfig: Partial<ServerOptions> = {
  cors: {
    origin: [
      // Development
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      // Production
      'https://koinoniasms.com',
      'https://www.koinoniasms.com',
      // Render deployments
      'https://connect-yw-frontend.onrender.com',
      'https://connect-yw-backend.onrender.com',
      // Environment-based fallback
      process.env.FRONTEND_URL || 'https://koinoniasms.com',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'] as any,
  path: '/socket.io/',
  pingInterval: 25000,
  pingTimeout: 60000,
};
