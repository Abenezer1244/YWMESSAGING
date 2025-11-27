/**
 * WebSocket Service
 * Handles real-time message delivery notifications
 *
 * Features:
 * - JWT authentication for security
 * - Per-church room broadcasts (only church members get updates)
 * - Message status event streaming (pending → delivered → read)
 * - Connection lifecycle management
 * - <100ms delivery latency
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { websocketConfig } from '../config/websocket.config.js';
import { websocketAuthMiddleware, getChurchRoom, AuthenticatedSocket } from '../middleware/websocket.middleware.js';

let io: SocketIOServer | null = null;

/**
 * Message status event payload
 */
export interface MessageStatusEvent {
  type: 'message:status_update' | 'message:sent' | 'message:failed' | 'message:delivered' | 'message:read';
  messageId: string;
  conversationId?: string;
  status: 'pending' | 'delivered' | 'failed' | 'read';
  timestamp: string; // ISO8601
  failureReason?: string;
  recipientCount?: number;
  deliveredCount?: number;
}

/**
 * Initialize Socket.io server
 * Must be called once when starting the app with the HTTP server instance
 */
export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  if (io) {
    console.log('⚠️ WebSocket already initialized, returning existing instance');
    return io;
  }

  io = new SocketIOServer(server, websocketConfig);

  // Apply authentication middleware
  io.use(websocketAuthMiddleware);

  // Setup connection handlers
  io.on('connection', handleSocketConnection);

  console.log('🔌 WebSocket server initialized on /socket.io/');
  return io;
}

/**
 * Handle new socket connection
 */
function handleSocketConnection(socket: Socket) {
  const authSocket = socket as AuthenticatedSocket;
  const { userId, churchId, email } = authSocket.data;

  console.log(`📱 Client connected: user=${userId}, church=${churchId}, socket=${socket.id}`);

  // Join user to their church room
  socket.join(getChurchRoom(churchId));
  console.log(`   ✓ Joined room: ${getChurchRoom(churchId)}`);

  // Send welcome message
  socket.emit('connected', {
    status: 'connected',
    userId,
    churchId,
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`📴 Client disconnected: user=${userId}, socket=${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error: any) => {
    console.error(`❌ Socket error (${socket.id}): ${error.message}`);
  });
}

/**
 * Broadcast message status update to church room
 * Called when Telnyx webhook updates delivery status
 */
export function broadcastMessageStatusUpdate(
  churchId: string,
  event: MessageStatusEvent
): void {
  if (!io) {
    console.warn('⚠️ WebSocket not initialized, skipping broadcast');
    return;
  }

  const room = getChurchRoom(churchId);

  console.log(`📢 Broadcasting to ${room}: ${event.type} for message ${event.messageId}`);

  io.to(room).emit(event.type, {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  });
}

/**
 * Broadcast message sent event
 * Called when user sends a message
 */
export function broadcastMessageSent(
  churchId: string,
  messageId: string,
  recipientCount: number
): void {
  broadcastMessageStatusUpdate(churchId, {
    type: 'message:sent',
    messageId,
    status: 'pending',
    timestamp: new Date().toISOString(),
    recipientCount,
  });
}

/**
 * Broadcast message delivery confirmation
 * Called when Telnyx confirms delivery
 */
export function broadcastMessageDelivered(
  churchId: string,
  messageId: string,
  conversationId?: string
): void {
  broadcastMessageStatusUpdate(churchId, {
    type: 'message:delivered',
    messageId,
    conversationId,
    status: 'delivered',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast message delivery failure
 * Called when Telnyx reports failed delivery
 */
export function broadcastMessageFailed(
  churchId: string,
  messageId: string,
  failureReason: string,
  conversationId?: string
): void {
  broadcastMessageStatusUpdate(churchId, {
    type: 'message:failed',
    messageId,
    conversationId,
    status: 'failed',
    timestamp: new Date().toISOString(),
    failureReason,
  });
}

/**
 * Broadcast message read event
 * Called when recipient opens/reads message
 */
export function broadcastMessageRead(
  churchId: string,
  messageId: string,
  conversationId?: string
): void {
  broadcastMessageStatusUpdate(churchId, {
    type: 'message:read',
    messageId,
    conversationId,
    status: 'read',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get current Socket.io instance
 * Useful for accessing io in other modules
 */
export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Get current connected client count
 */
export function getConnectedClientCount(): number {
  if (!io) return 0;
  return io.engine.clientsCount;
}

/**
 * Get clients in a specific room
 */
export function getClientsInRoom(room: string): Set<string> {
  if (!io) return new Set();
  return io.sockets.adapter.rooms.get(room) || new Set();
}

/**
 * Cleanup and shutdown WebSocket server
 */
export async function shutdownWebSocket(): Promise<void> {
  if (!io) {
    console.log('⚠️ WebSocket not initialized, nothing to shutdown');
    return;
  }

  console.log('🛑 Shutting down WebSocket server...');
  await io.close();
  io = null;
  console.log('   ✓ WebSocket shutdown complete');
}
