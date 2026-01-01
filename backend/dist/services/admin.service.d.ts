import { TenantPrismaClient } from '../lib/tenant-prisma.js';
export interface UpdateChurchInput {
    name?: string;
    email?: string;
    wantsPremiumDelivery?: boolean;
    ein?: string;
    brandPhoneNumber?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    website?: string;
    entityType?: string;
    vertical?: string;
}
/**
 * Update church profile (registry)
 */
export declare function updateChurchProfile(tenantId: string, input: UpdateChurchInput): Promise<{
    id: string;
    name: string;
    email: string;
    stripeCustomerId: string | null;
    telnyxPhoneNumber: string | null;
    telnyxNumberSid: string | null;
    telnyxWebhookId: string | null;
    telnyxVerified: boolean;
    telnyxPurchasedAt: Date | null;
    telnyxPhoneLinkingStatus: string;
    telnyxPhoneLinkingLastAttempt: Date | null;
    telnyxPhoneLinkingRetryCount: number;
    telnyxPhoneLinkingError: string | null;
    telnyxNumberStatus: string;
    telnyxNumberDeletedAt: Date | null;
    telnyxNumberDeletedBy: string | null;
    telnyxNumberRecoveryDeadline: Date | null;
    dlcBrandId: string | null;
    tcrBrandId: string | null;
    dlcStatus: string;
    dlcRegisteredAt: Date | null;
    dlcApprovedAt: Date | null;
    dlcRejectionReason: string | null;
    dlcNextCheckAt: Date | null;
    dlcCampaignId: string | null;
    dlcCampaignStatus: string | null;
    dlcNumberAssignedAt: Date | null;
    dlcCampaignSuspended: boolean;
    dlcCampaignSuspendedAt: Date | null;
    dlcCampaignSuspendedReason: string | null;
    usingSharedBrand: boolean;
    wantsPremiumDelivery: boolean;
    deliveryRate: number;
    ein: string | null;
    einHash: string | null;
    einEncryptedAt: Date | null;
    einAccessedAt: Date | null;
    einAccessedBy: string | null;
    brandPhoneNumber: string | null;
    streetAddress: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    website: string | null;
    entityType: string;
    vertical: string;
    trialEndsAt: Date;
    subscriptionStatus: string;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Get church profile (registry) - cached for 1 hour
 */
export declare function getChurchProfile(tenantId: string): Promise<{} | null>;
/**
 * Get all co-admins for a tenant - cached for 30 minutes
 */
export declare function getCoAdmins(tenantId: string, tenantPrisma: TenantPrismaClient): Promise<{}>;
/**
 * Remove a co-admin
 */
export declare function removeCoAdmin(tenantId: string, tenantPrisma: TenantPrismaClient, adminId: string): Promise<void>;
/**
 * Log an activity
 */
export declare function logActivity(tenantId: string, adminId: string, action: string, details?: Record<string, any>): Promise<{
    tenantId: string;
    adminId: string;
    action: string;
    details: string;
    timestamp: Date;
} | undefined>;
/**
 * Get activity logs for a tenant
 */
export declare function getActivityLogs(tenantId: string, limit?: number, offset?: number): Promise<{
    id: string;
    tenantId: string;
    action: string;
    details: string;
    timestamp: Date;
    adminEmail: string;
}[]>;
/**
 * Get activity log count
 */
export declare function getActivityLogCount(tenantId: string): Promise<number>;
/**
 * Invite a co-admin (create new co-admin account)
 */
export declare function inviteCoAdmin(tenantId: string, tenantPrisma: TenantPrismaClient, email: string, firstName: string, lastName: string): Promise<{
    admin: {
        id: string;
        email: string;
        role: string;
        createdAt: Date;
        firstName: string;
        lastName: string;
    };
    tempPassword: string;
}>;
//# sourceMappingURL=admin.service.d.ts.map