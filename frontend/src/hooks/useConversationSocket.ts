/**
 * WebSocket hook for real-time conversation updates
 * Handles RCS-style features:
 * - Typing indicators
 * - Read receipts
 * - Message delivery status
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

// Event types for RCS features
export interface RCSTypingEvent {
  conversationId: string;
  memberId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface RCSReadReceiptEvent {
  messageId: string;
  conversationId: string;
  readAt: string;
  timestamp: string;
}

export interface MessageStatusEvent {
  type: string;
  messageId: string;
  conversationId?: string;
  status: 'pending' | 'delivered' | 'failed' | 'read';
  timestamp: string;
}

interface UseConversationSocketOptions {
  onTyping?: (event: RCSTypingEvent) => void;
  onReadReceipt?: (event: RCSReadReceiptEvent) => void;
  onMessageStatus?: (event: MessageStatusEvent) => void;
}

/**
 * Hook for WebSocket connection to receive real-time conversation updates
 */
export function useConversationSocket(options: UseConversationSocketOptions = {}) {
  const { onTyping, onReadReceipt, onMessageStatus } = options;
  const auth = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = auth.accessToken;
    if (!token) {
      console.warn('⚠️ No auth token, cannot connect WebSocket');
      return;
    }

    // Connect to WebSocket server
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.koinoniasms.com';
    const wsUrl = apiUrl.replace('/api', ''); // Remove /api suffix for WebSocket

    socketRef.current = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('📴 WebSocket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.warn('⚠️ WebSocket connection error:', error.message);
      setIsConnected(false);
    });

    // Listen for RCS typing events
    socketRef.current.on('rcs:typing', (event: RCSTypingEvent) => {
      console.log('⌨️ Typing event:', event);
      onTyping?.(event);
    });

    // Listen for RCS read receipt events
    socketRef.current.on('rcs:read_receipt', (event: RCSReadReceiptEvent) => {
      console.log('✓✓ Read receipt:', event);
      onReadReceipt?.(event);
    });

    // Listen for message status events
    socketRef.current.on('message:delivered', (event: MessageStatusEvent) => {
      console.log('📬 Message delivered:', event);
      onMessageStatus?.(event);
    });

    socketRef.current.on('message:failed', (event: MessageStatusEvent) => {
      console.log('❌ Message failed:', event);
      onMessageStatus?.(event);
    });

    socketRef.current.on('message:read', (event: MessageStatusEvent) => {
      console.log('👀 Message read:', event);
      onMessageStatus?.(event);
    });
  }, [auth.accessToken, onTyping, onReadReceipt, onMessageStatus]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (auth.accessToken) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [auth.accessToken, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
  };
}

export default useConversationSocket;
