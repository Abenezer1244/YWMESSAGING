import type { TenantPrismaClient } from '../lib/tenant-prisma.js';
/**
 * Get all conversations for a tenant (sorted by newest)
 * ✅ OPTIMIZED: Cache conversations list for 5 minutes
 * Reduces database load for frequently accessed lists
 */
export declare function getConversations(tenantId: string, tenantPrisma: TenantPrismaClient, options?: {
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
export declare function getConversation(tenantId: string, tenantPrisma: TenantPrismaClient, conversationId: string, options?: {
    page?: number;
    limit?: number;
}): Promise<any>;
/**
 * Create text-only reply message
 * Supports reply threading (replyToId) and send effects (sendEffect)
 */
export declare function createReply(tenantId: string, tenantPrisma: TenantPrismaClient, conversationId: string, content: string, options?: {
    replyToId?: string;
    sendEffect?: string;
}): Promise<any>;
/**
 * Create reply with media attachment
 */
export declare function createReplyWithMedia(tenantId: string, tenantPrisma: TenantPrismaClient, conversationId: string, content: string | undefined, mediaData: {
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
export declare function markAsRead(tenantId: string, tenantPrisma: TenantPrismaClient, conversationId: string): Promise<void>;
/**
 * Update conversation status
 */
export declare function updateStatus(tenantId: string, tenantPrisma: TenantPrismaClient, conversationId: string, status: 'open' | 'closed' | 'archived'): Promise<void>;
/**
 * Delete conversation and all messages
 */
export declare function deleteConversation(tenantId: string, tenantPrisma: TenantPrismaClient, conversationId: string): Promise<void>;
//# sourceMappingURL=conversation.service.d.ts.map