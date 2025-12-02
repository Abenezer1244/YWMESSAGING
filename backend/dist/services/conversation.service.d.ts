/**
 * Get all conversations for a church (sorted by newest)
 * ✅ OPTIMIZED: Cache conversations list for 5 minutes
 * Reduces database load for frequently accessed lists
 */
export declare function getConversations(churchId: string, options?: {
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get single conversation with all messages
 */
export declare function getConversation(conversationId: string, churchId: string, options?: {
    page?: number;
    limit?: number;
}): Promise<any>;
/**
 * Create text-only reply message
 */
export declare function createReply(conversationId: string, churchId: string, content: string): Promise<any>;
/**
 * Create reply with media attachment
 */
export declare function createReplyWithMedia(conversationId: string, churchId: string, content: string | undefined, mediaData: {
    s3Url: string;
    s3Key: string;
    type: 'image' | 'video' | 'audio' | 'document';
    name: string;
    sizeBytes: number;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
}): Promise<any>;
/**
 * Mark conversation as read
 */
export declare function markAsRead(conversationId: string, churchId: string): Promise<void>;
/**
 * Update conversation status
 */
export declare function updateStatus(conversationId: string, churchId: string, status: 'open' | 'closed' | 'archived'): Promise<void>;
/**
 * Delete conversation and all messages
 */
export declare function deleteConversation(conversationId: string, churchId: string): Promise<void>;
//# sourceMappingURL=conversation.service.d.ts.map