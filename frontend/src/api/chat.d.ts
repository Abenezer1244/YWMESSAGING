export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}
export interface ChatConversation {
    conversationId: string;
}
export interface ChatResponse {
    conversationId: string;
    message: string;
}
/**
 * Send a chat message and get AI response
 */
export declare function sendChatMessage(message: string, conversationId?: string, visitorId?: string): Promise<ChatResponse>;
/**
 * Get conversation history
 */
export declare function getChatHistory(conversationId: string): Promise<ChatMessage[]>;
/**
 * Create a new conversation
 */
export declare function createConversation(visitorId?: string): Promise<ChatConversation>;
//# sourceMappingURL=chat.d.ts.map