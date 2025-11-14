export interface Conversation {
    id: string;
    churchId: string;
    memberId: string;
    member: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    lastMessageAt: string;
    status: 'open' | 'closed' | 'archived';
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface ConversationMessage {
    id: string;
    conversationId: string;
    content: string;
    direction: 'inbound' | 'outbound';
    memberName?: string;
    deliveryStatus?: 'pending' | 'delivered' | 'failed' | null;
    mediaUrl?: string | null;
    mediaType?: 'image' | 'video' | 'audio' | 'document' | null;
    mediaName?: string | null;
    mediaSizeBytes?: number | null;
    mediaDuration?: number | null;
    createdAt: string;
}
/**
 * Get all conversations for the church
 */
export declare function getConversations(options?: {
    page?: number;
    limit?: number;
    status?: 'open' | 'closed' | 'archived';
}): Promise<{
    data: Conversation[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get single conversation with messages
 */
export declare function getConversation(conversationId: string, options?: {
    page?: number;
    limit?: number;
}): Promise<{
    conversation: Conversation;
    messages: ConversationMessage[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Reply to conversation with text only
 */
export declare function replyToConversation(conversationId: string, content: string): Promise<ConversationMessage>;
/**
 * Reply to conversation with media
 */
export declare function replyWithMedia(conversationId: string, file: File, content?: string): Promise<ConversationMessage>;
/**
 * Mark conversation as read
 */
export declare function markConversationAsRead(conversationId: string): Promise<void>;
/**
 * Update conversation status
 */
export declare function updateConversationStatus(conversationId: string, status: 'open' | 'closed' | 'archived'): Promise<Conversation>;
//# sourceMappingURL=conversations.d.ts.map