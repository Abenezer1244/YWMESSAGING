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
import { Server as SocketIOServer } from 'socket.io';
/**
 * Message status event payload
 */
export interface MessageStatusEvent {
    type: 'message:status_update' | 'message:sent' | 'message:failed' | 'message:delivered' | 'message:read';
    messageId: string;
    conversationId?: string;
    status: 'pending' | 'delivered' | 'failed' | 'read';
    timestamp: string;
    failureReason?: string;
    recipientCount?: number;
    deliveredCount?: number;
}
/**
 * Initialize Socket.io server
 * Must be called once when starting the app with the HTTP server instance
 */
export declare function initializeWebSocket(server: HTTPServer): SocketIOServer;
/**
 * Broadcast message status update to church room
 * Called when Telnyx webhook updates delivery status
 */
export declare function broadcastMessageStatusUpdate(churchId: string, event: MessageStatusEvent): void;
/**
 * Broadcast message sent event
 * Called when user sends a message
 */
export declare function broadcastMessageSent(churchId: string, messageId: string, recipientCount: number): void;
/**
 * Broadcast message delivery confirmation
 * Called when Telnyx confirms delivery
 */
export declare function broadcastMessageDelivered(churchId: string, messageId: string, conversationId?: string): void;
/**
 * Broadcast message delivery failure
 * Called when Telnyx reports failed delivery
 */
export declare function broadcastMessageFailed(churchId: string, messageId: string, failureReason: string, conversationId?: string): void;
/**
 * Broadcast message read event
 * Called when recipient opens/reads message
 */
export declare function broadcastMessageRead(churchId: string, messageId: string, conversationId?: string): void;
/**
 * RCS typing indicator event payload
 */
export interface RCSTypingEvent {
    type: 'rcs:typing';
    conversationId: string;
    isTyping: boolean;
    timestamp: string;
}
/**
 * RCS read receipt event payload
 */
export interface RCSReadReceiptEvent {
    type: 'rcs:read_receipt';
    messageId: string;
    conversationId: string;
    readAt: string;
}
/**
 * Broadcast RCS typing indicator to church room
 * Called when member starts/stops typing (RCS feature)
 */
export declare function broadcastRCSTyping(churchId: string, conversationId: string, isTyping: boolean): void;
/**
 * Broadcast RCS read receipt to church room
 * Called when member reads message (RCS feature)
 */
export declare function broadcastRCSReadReceipt(churchId: string, messageId: string, conversationId: string, readAt: string): void;
/**
 * Generic broadcast to a tenant/church room
 * Used for custom events like RCS typing/read receipts
 */
export declare function broadcastToTenant(churchId: string, eventType: string, payload: Record<string, any>): void;
/**
 * Get current Socket.io instance
 * Useful for accessing io in other modules
 */
export declare function getIO(): SocketIOServer | null;
/**
 * Get current connected client count
 */
export declare function getConnectedClientCount(): number;
/**
 * Get clients in a specific room
 */
export declare function getClientsInRoom(room: string): Set<string>;
/**
 * Cleanup and shutdown WebSocket server
 */
export declare function shutdownWebSocket(): Promise<void>;
//# sourceMappingURL=websocket.service.d.ts.map