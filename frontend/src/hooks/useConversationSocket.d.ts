/**
 * WebSocket hook for real-time conversation updates
 * Handles RCS-style features:
 * - Typing indicators
 * - Read receipts
 * - Message delivery status
 */
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
export declare function useConversationSocket(options?: UseConversationSocketOptions): {
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
};
export default useConversationSocket;
//# sourceMappingURL=useConversationSocket.d.ts.map