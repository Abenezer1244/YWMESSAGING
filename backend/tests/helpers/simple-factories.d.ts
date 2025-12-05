/**
 * Simplified Test Factories - Matched to actual Prisma schema
 * Creates test data that actually works with the current schema
 */
import { PrismaClient } from '@prisma/client';
export declare class SimpleFactories {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Create a test church with admin
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
     * Create test admin
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
     * Clean up all test data
     */
    cleanup(): Promise<void>;
}
/**
 * Get factories instance
 */
export declare function getSimpleFactories(prisma: PrismaClient): SimpleFactories;
//# sourceMappingURL=simple-factories.d.ts.map