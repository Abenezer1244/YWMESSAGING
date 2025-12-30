import type { TenantPrismaClient } from '../lib/tenant-prisma.js';
export interface CreateRecurringMessageData {
    name: string;
    content: string;
    targetType: 'branches' | 'all';
    targetIds?: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    timeOfDay: string;
}
export declare function getRecurringMessages(tenantId: string, tenantPrisma: TenantPrismaClient): Promise<{
    id: string;
    name: string;
    content: string;
    targetType: string;
    targetIds: string;
    frequency: string;
    dayOfWeek: number | null;
    timeOfDay: string | null;
    nextSendAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createRecurringMessage(tenantId: string, tenantPrisma: TenantPrismaClient, data: CreateRecurringMessageData): Promise<{
    id: string;
    name: string;
    content: string;
    targetType: string;
    targetIds: string;
    frequency: string;
    dayOfWeek: number | null;
    timeOfDay: string | null;
    nextSendAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateRecurringMessage(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string, data: Partial<CreateRecurringMessageData>): Promise<{
    id: string;
    name: string;
    content: string;
    targetType: string;
    targetIds: string;
    frequency: string;
    dayOfWeek: number | null;
    timeOfDay: string | null;
    nextSendAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteRecurringMessage(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string): Promise<{
    id: string;
    name: string;
    content: string;
    targetType: string;
    targetIds: string;
    frequency: string;
    dayOfWeek: number | null;
    timeOfDay: string | null;
    nextSendAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function toggleRecurringMessage(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string, isActive: boolean): Promise<{
    id: string;
    name: string;
    content: string;
    targetType: string;
    targetIds: string;
    frequency: string;
    dayOfWeek: number | null;
    timeOfDay: string | null;
    nextSendAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateNextSendAt(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string, frequency: string, timeOfDay: string, dayOfWeek?: number): Promise<{
    id: string;
    name: string;
    content: string;
    targetType: string;
    targetIds: string;
    frequency: string;
    dayOfWeek: number | null;
    timeOfDay: string | null;
    nextSendAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=recurring.service.d.ts.map