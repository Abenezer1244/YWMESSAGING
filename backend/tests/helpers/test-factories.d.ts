/**
 * Test Data Factories
 * Creates consistent test data for unit and integration tests
 */
import { PrismaClient } from '@prisma/client';
export declare class TestFactories {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Create a test church
     */
    createTestChurch(overrides?: {
        name?: string;
        email?: string;
        stripeCustomerId?: string;
        telnyxPhoneNumber?: string;
        trialEndsAt?: Date;
        subscriptionStatus?: string;
    }): Promise<{
        admins: {
            id: string;
            churchId: string;
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
    } & {
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
     * Create a test church with active subscription
     */
    createTestChurchWithSubscription(overrides?: {
        subscriptionTier?: string;
    }): Promise<{
        admins: {
            id: string;
            churchId: string;
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
    } & {
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
     * Create a test church with expired trial
     */
    createTestChurchWithExpiredTrial(): Promise<{
        admins: {
            id: string;
            churchId: string;
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
    } & {
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
     * Create a test admin user
     */
    createTestAdmin(churchId: string, overrides?: {
        email?: string;
        firstName?: string;
        lastName?: string;
        password?: string;
    }): Promise<{
        id: string;
        churchId: string;
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
    }>;
    /**
     * Create a test member
     * Note: Members don't have churchId directly. They are linked to churches through groups/conversations.
     */
    createTestMember(churchId: string, overrides?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<{
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
    }>;
    /**
     * Create a test message with recipients
     */
    createTestMessage(churchId: string, overrides?: {
        content?: string;
        status?: string;
        targetType?: string;
        memberIds?: string[];
    }): Promise<{
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
        churchId: string;
        content: string;
        status: string;
        targetType: string;
        targetIds: string;
        totalRecipients: number;
        deliveredCount: number;
        failedCount: number;
        sentAt: Date | null;
        createdAt: Date;
    }>;
    /**
     * Create a test conversation
     */
    createTestConversation(churchId: string, memberId: string, overrides?: {
        status?: string;
    }): Promise<{
        id: string;
        churchId: string;
        memberId: string;
        lastMessageAt: Date | null;
        status: string;
        unreadCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Create a test conversation message
     */
    createTestConversationMessage(conversationId: string, overrides?: {
        content?: string;
        direction?: string;
        memberId?: string;
    }): Promise<{
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
    }>;
    /**
     * Clean up test data - delete all records
     */
    cleanup(): Promise<void>;
}
/**
 * Get test factories instance
 */
export declare function getTestFactories(prisma: PrismaClient): TestFactories;
//# sourceMappingURL=test-factories.d.ts.map