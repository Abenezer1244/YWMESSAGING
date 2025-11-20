export interface UpdateChurchInput {
    name?: string;
    email?: string;
    description?: string;
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
 * Update church profile
 */
export declare function updateChurchProfile(churchId: string, input: UpdateChurchInput): Promise<{
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
 * Get church profile (including 10DLC fields)
 */
export declare function getChurchProfile(churchId: string): Promise<{
    email: string;
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    dlcStatus: string;
    wantsPremiumDelivery: boolean;
    deliveryRate: number;
    ein: string | null;
    brandPhoneNumber: string | null;
    streetAddress: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    website: string | null;
    entityType: string;
    vertical: string;
    subscriptionStatus: string;
} | null>;
/**
 * Get all co-admins for a church
 */
export declare function getCoAdmins(churchId: string): Promise<{
    role: string;
    email: string;
    id: string;
    firstName: string;
    lastName: string;
    lastLoginAt: Date | null;
    createdAt: Date;
}[]>;
/**
 * Remove a co-admin
 */
export declare function removeCoAdmin(churchId: string, adminId: string): Promise<void>;
/**
 * Log an activity
 */
export declare function logActivity(churchId: string, adminId: string, action: string, details?: Record<string, any>): Promise<{
    churchId: string;
    adminId: string;
    action: string;
    details: string;
    timestamp: Date;
} | undefined>;
/**
 * Get activity logs for a church
 */
export declare function getActivityLogs(churchId: string, limit?: number, offset?: number): Promise<{
    id: string;
    churchId: string;
    action: string;
    details: string;
    timestamp: Date;
    adminEmail: string;
}[]>;
/**
 * Get activity log count
 */
export declare function getActivityLogCount(churchId: string): Promise<number>;
/**
 * Invite a co-admin (create new co-admin account)
 */
export declare function inviteCoAdmin(churchId: string, email: string, firstName: string, lastName: string): Promise<{
    admin: {
        role: string;
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
    };
    tempPassword: string;
}>;
//# sourceMappingURL=admin.service.d.ts.map