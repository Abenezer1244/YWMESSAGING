/**
 * GDPR Service - Handle data export, deletion, and consent management
 * Implements:
 * - GDPR Article 20 (Right to Data Portability)
 * - GDPR Article 17 (Right to be Forgotten)
 * - GDPR Article 7 (Consent Management)
 */
/**
 * Export all church data as JSON
 * Returns the complete data structure ready for download
 */
export declare function exportChurchData(churchId: string): Promise<{
    exportDate: Date;
    church: {
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
    } | null;
    admins: {
        id: string;
        email: string;
        encryptedEmail: string | null;
        emailHash: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: string;
        invitationToken: string | null;
        invitationExpiresAt: Date | null;
        lastLoginAt: Date | null;
        welcomeCompleted: boolean;
        userRole: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
    branches: {
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
    messages: ({
        recipients: {
            id: string;
            messageId: string;
            memberId: string;
            status: string;
            providerMessageId: string | null;
            deliveredAt: Date | null;
            failedAt: Date | null;
            failureReason: string | null;
        }[];
    } & {
        id: string;
        content: string;
        status: string;
        targetType: string;
        targetIds: string;
        totalRecipients: number;
        deliveredCount: number;
        failedCount: number;
        sentAt: Date | null;
        createdAt: Date;
    })[];
    templates: {
        id: string;
        name: string;
        content: string;
        category: string;
        isDefault: boolean;
        usageCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[];
    conversations: ({
        member: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
            phoneHash: string | null;
            email: string | null;
            encryptedEmail: string | null;
            emailHash: string | null;
            optInSms: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        messages: {
            id: string;
            conversationId: string;
            memberId: string;
            content: string;
            direction: string;
            providerMessageId: string | null;
            deliveryStatus: string | null;
            mediaUrl: string | null;
            mediaType: string | null;
            mediaName: string | null;
            mediaSizeBytes: number | null;
            mediaS3Key: string | null;
            mediaMimeType: string | null;
            mediaWidth: number | null;
            mediaHeight: number | null;
            mediaDuration: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        memberId: string;
        lastMessageAt: Date | null;
        status: string;
        unreadCount: number;
        createdAt: Date;
        updatedAt: Date;
    })[];
    subscriptions: {
        id: string;
        stripeSubId: string | null;
        plan: string;
        billingCycle: string;
        status: string;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        cancelledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
}>;
/**
 * Create data export record and return download URL
 */
export declare function createDataExport(churchId: string, adminId: string): Promise<{
    exportId: string;
    downloadUrl: string;
    expiresAt: Date;
    cached: boolean;
}>;
/**
 * Get exported data by export ID
 */
export declare function getExportData(exportId: string): Promise<string | null>;
/**
 * Request account deletion with confirmation token
 * Creates a 30-day grace period before actual deletion
 */
export declare function requestAccountDeletion(churchId: string, adminId: string, reason?: string): Promise<{
    deletionRequestId: string;
    confirmationToken: string;
    scheduledDeletionAt: Date;
    message: string;
}>;
/**
 * Cancel pending account deletion
 */
export declare function cancelAccountDeletion(churchId: string, adminId: string): Promise<{
    message: string;
}>;
/**
 * Confirm and execute account deletion
 * Requires valid confirmation token
 * Deletes all tenant data first, then registry data
 */
export declare function confirmAccountDeletion(churchId: string, confirmationToken: string): Promise<{
    message: string;
    deletedAt: Date;
    churchId: string;
}>;
/**
 * Get consent status for a church
 */
export declare function getConsentStatus(churchId: string): Promise<{
    churchId: string;
    consents: any;
    lastUpdated: Date;
}>;
/**
 * Update consent status
 */
export declare function updateConsent(churchId: string, type: string, status: 'granted' | 'denied' | 'withdrawn', reason?: string): Promise<{
    consentId: string;
    type: string;
    status: "granted" | "denied" | "withdrawn";
    grantedAt: Date;
}>;
/**
 * Get consent history for audit trail
 */
export declare function getConsentHistory(churchId: string, type?: string): Promise<{
    id: string;
    memberId: string | null;
    adminId: string | null;
    type: string;
    status: string;
    reason: string | null;
    source: string;
    createdAt: Date;
}[]>;
/**
 * Clean up expired exports (run periodically per church)
 */
export declare function cleanupExpiredExports(churchId: string): Promise<import(".prisma/client-tenant").Prisma.BatchPayload>;
/**
 * Clean up expired deletion requests (run periodically per church)
 */
export declare function cleanupExpiredDeletionRequests(churchId: string): Promise<number>;
//# sourceMappingURL=gdpr.service.d.ts.map