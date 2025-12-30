import type { TenantPrismaClient } from '../lib/tenant-prisma.js';
export interface ResolveRecipientsOptions {
    targetType: 'individual' | 'all';
    targetIds?: string[];
}
export interface CreateMessageData {
    content: string;
    targetType: 'individual' | 'all';
    targetIds?: string[];
}
/**
 * Resolve recipients based on target type
 * Returns unique opted-in members by phone number
 */
export declare function resolveRecipients(tenantId: string, tenantPrisma: TenantPrismaClient, options: ResolveRecipientsOptions): Promise<Array<{
    id: string;
    phone: string;
}>>;
/**
 * Create message record
 */
export declare function createMessage(tenantId: string, tenantPrisma: TenantPrismaClient, data: CreateMessageData): Promise<any>;
/**
 * Get message history with pagination
 */
export declare function getMessageHistory(tenantId: string, tenantPrisma: TenantPrismaClient, options?: {
    page?: number;
    limit?: number;
    status?: string;
}): Promise<{
    data: {
        deliveryRate: number;
        id: string;
        status: string;
        createdAt: Date;
        content: string;
        targetType: string;
        totalRecipients: number;
        deliveredCount: number;
        failedCount: number;
        sentAt: Date | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get single message details with recipients
 */
export declare function getMessageDetails(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string): Promise<any>;
/**
 * Update message delivery stats
 */
export declare function updateMessageStats(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string): Promise<void>;
/**
 * Update recipient delivery status
 * Accepts messageId to avoid redundant database fetch
 */
export declare function updateRecipientStatus(tenantId: string, tenantPrisma: TenantPrismaClient, recipientId: string, status: 'delivered' | 'failed', messageId: string, data?: {
    failureReason?: string;
}): Promise<void>;
//# sourceMappingURL=message.service.d.ts.map