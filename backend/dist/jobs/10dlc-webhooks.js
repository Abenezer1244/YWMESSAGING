import { PrismaClient } from '@prisma/client';
import { createCampaignAsync } from './10dlc-registration.js';
const prisma = new PrismaClient();
/**
 * Handle webhook events from Telnyx for 10DLC brand/campaign status updates
 * These webhooks are triggered automatically when approval status changes
 */
export async function handleTelnyx10DLCWebhook(payload) {
    try {
        const eventType = payload.data?.event_type;
        console.log(`📨 Received Telnyx webhook: ${eventType}`);
        if (eventType === '10dlc.brand.update') {
            await handleBrandUpdate(payload);
        }
        else if (eventType === '10dlc.campaign.update') {
            await handleCampaignUpdate(payload);
        }
        else if (eventType === '10dlc.phone_number.update') {
            await handlePhoneNumberUpdate(payload);
        }
        else {
            console.log(`⚠️ Unknown event type: ${eventType}`);
        }
    }
    catch (error) {
        console.error('❌ Error processing Telnyx webhook:', error.message);
        throw error;
    }
}
/**
 * Handle brand status updates from Telnyx
 * Examples:
 * - Brand created
 * - Brand verification status changed
 * - Brand registration failed
 */
async function handleBrandUpdate(payload) {
    const payloadData = payload.data?.payload;
    const brandId = payloadData?.brandId;
    const status = payloadData?.status;
    const tcrBrandId = payloadData?.tcrBrandId;
    const eventType = payloadData?.type; // REGISTRATION, REVET, TCR_BRAND_WEBHOOK, etc.
    console.log(`🏷️  Brand Update: brandId=${brandId}, status=${status}, eventType=${eventType}`);
    if (!brandId) {
        console.warn('⚠️ Brand webhook missing brandId');
        return;
    }
    // Find church with this brand
    const church = await prisma.church.findFirst({
        where: { dlcBrandId: brandId },
        select: { id: true, name: true, dlcStatus: true },
    });
    if (!church) {
        console.log(`ℹ️ Brand ${brandId} not found in local database (may be from another user)`);
        return;
    }
    console.log(`🏪 Church: ${church.name} (${church.id})`);
    // Handle different event types
    if (eventType === 'REGISTRATION' && status === 'failed') {
        // Brand registration failed
        const reasons = payloadData?.reasons || [];
        const failureReasons = reasons.map((r) => r.description).join('; ');
        console.log(`❌ Brand registration failed: ${failureReasons}`);
        await prisma.church.update({
            where: { id: church.id },
            data: {
                dlcStatus: 'rejected',
                dlcRejectionReason: failureReasons,
            },
        });
    }
    else if (eventType === 'TCR_BRAND_WEBHOOK' && payloadData?.eventType === 'BRAND_ADD') {
        // Brand successfully added to TCR registry
        console.log(`✅ Brand successfully registered with TCR`);
        console.log(`   TCR Brand ID: ${tcrBrandId}`);
        // Store TCR brand ID for reference
        await prisma.church.update({
            where: { id: church.id },
            data: {
                tcrBrandId: tcrBrandId,
            },
        });
        // Note: The brand is now in TCR but still pending verification
        // We'll get another webhook when verification is complete
    }
    // Handle verification status changes
    if (status === 'OK' || payloadData?.identityStatus === 'VERIFIED') {
        // Brand is fully verified and ready to use
        console.log(`✅ Brand verified and ready! Setting up campaign...`);
        // TODO: These fields need to be added to the Church model:
        // - dlcBrandVerifiedAt
        // - dlcCampaignId (for campaign tracking)
        // For now, update dlcStatus to track progress
        await prisma.church.update({
            where: { id: church.id },
            data: {
                dlcStatus: 'brand_verified',
                // dlcBrandVerifiedAt: new Date(), // TODO: Add to schema
            },
        });
        console.log(`📋 Next step: Auto-create campaign for ${church.name}`);
        // Auto-create campaign asynchronously (fire-and-forget)
        createCampaignAsync(church.id).catch((error) => {
            console.error(`⚠️ Error auto-creating campaign for ${church.name}:`, error.message);
        });
    }
}
/**
 * Handle campaign status updates from Telnyx
 * Examples:
 * - Campaign submitted
 * - Campaign approved by TCR
 * - Campaign approved by carriers (MNO_PROVISIONED)
 * - Campaign rejected
 */
async function handleCampaignUpdate(payload) {
    const payloadData = payload.data?.payload;
    const campaignId = payloadData?.campaignId;
    const campaignStatus = payloadData?.campaignStatus;
    const eventType = payloadData?.type;
    const brandId = payloadData?.brandId;
    console.log(`📢 Campaign Update: campaignId=${campaignId}, status=${campaignStatus}, eventType=${eventType}`);
    if (!campaignId || !brandId) {
        console.warn('⚠️ Campaign webhook missing campaignId or brandId');
        return;
    }
    // Find church with this brand
    const church = await prisma.church.findFirst({
        where: { dlcBrandId: brandId },
        select: { id: true, name: true, telnyxPhoneNumber: true },
    });
    if (!church) {
        console.log(`ℹ️ Campaign for brand ${brandId} not found in local database`);
        return;
    }
    console.log(`🏪 Church: ${church.name} (${church.id})`);
    // Campaign fully approved and ready to send!
    if (campaignStatus === 'MNO_PROVISIONED') {
        console.log(`✅ Campaign APPROVED and PROVISIONED! Ready to send messages!`);
        await prisma.church.update({
            where: { id: church.id },
            data: {
                dlcStatus: 'approved',
                dlcApprovedAt: new Date(),
                dlcCampaignId: campaignId,
                dlcCampaignStatus: campaignStatus,
                usingSharedBrand: false, // Switch to personal brand
                deliveryRate: 0.99, // Upgrade delivery rate to 99%
            },
        });
        console.log(`🎉 ${church.name} is now approved for 99% delivery rate!`);
    }
    // Campaign rejected at any stage
    if (campaignStatus === 'TCR_FAILED' || campaignStatus === 'TELNYX_FAILED' || campaignStatus === 'MNO_REJECTED') {
        const reasons = payloadData?.failureReasons || 'Unknown reason';
        console.log(`❌ Campaign rejected at ${campaignStatus} stage: ${reasons}`);
        await prisma.church.update({
            where: { id: church.id },
            data: {
                dlcStatus: 'rejected',
                dlcCampaignId: campaignId,
                dlcCampaignStatus: campaignStatus,
                dlcRejectionReason: `Campaign rejected at ${campaignStatus} stage: ${reasons}`,
            },
        });
        // Log detailed rejection info for debugging
        console.log(`   Campaign ID: ${campaignId}`);
        console.log(`   Church: ${church.name} (${church.id})`);
        console.log(`   Reason: ${reasons}`);
        console.log(`   Recommendation: Review campaign details and resubmit`);
    }
    // Campaign pending - waiting for next approval stage (intermediate states)
    if (campaignStatus === 'TCR_PENDING' ||
        campaignStatus === 'TCR_ACCEPTED' ||
        campaignStatus === 'TELNYX_ACCEPTED' ||
        campaignStatus === 'MNO_PENDING') {
        console.log(`⏳ Campaign pending in ${campaignStatus} state`);
        console.log(`   Campaign ID: ${campaignId}`);
        console.log(`   Church: ${church.name} (${church.id})`);
        console.log(`   Progress: Awaiting next approval stage...`);
        await prisma.church.update({
            where: { id: church.id },
            data: {
                dlcStatus: 'campaign_pending',
                dlcCampaignId: campaignId,
                dlcCampaignStatus: campaignStatus,
            },
        });
    }
}
/**
 * Handle phone number assignment status updates
 * Triggered when phone numbers are linked to campaigns
 */
async function handlePhoneNumberUpdate(payload) {
    const payloadData = payload.data?.payload;
    const phoneNumber = payloadData?.phoneNumber;
    const campaignId = payloadData?.campaignId;
    const status = payloadData?.status;
    const eventType = payloadData?.type; // ASSIGNMENT, DELETION, STATUS_UPDATE
    console.log(`📱 Phone Number Update: number=${phoneNumber}, campaign=${campaignId}, eventType=${eventType}`);
    if (!phoneNumber) {
        console.warn('⚠️ Phone number webhook missing phoneNumber');
        return;
    }
    // Find church with this phone number
    const church = await prisma.church.findFirst({
        where: { telnyxPhoneNumber: phoneNumber },
        select: { id: true, name: true },
    });
    if (!church) {
        console.log(`ℹ️ Phone number ${phoneNumber} not found in local database`);
        return;
    }
    console.log(`🏪 Church: ${church.name} (${church.id})`);
    if (eventType === 'ASSIGNMENT') {
        if (status === 'success') {
            console.log(`✅ Phone number ${phoneNumber} successfully assigned to campaign`);
            // TODO: Add dlcNumberAssignedAt field to Church model
            console.log(`   Campaign: ${campaignId}`);
        }
        else {
            console.log(`❌ Phone number assignment failed`);
            const reasons = payloadData?.reasons?.join('; ') || 'Unknown error';
            await prisma.church.update({
                where: { id: church.id },
                data: {
                    dlcRejectionReason: `Number assignment failed: ${reasons}`,
                },
            });
        }
    }
}
/**
 * Send a notification to the church (email, in-app, etc.)
 * when their 10DLC status changes
 */
async function notifyChurch(churchId, message, status) {
    try {
        console.log(`📧 Notifying church ${churchId}: ${message}`);
        // TODO: Implement actual notification
        // Could be email, push notification, in-app notification, etc.
        // For now, just log it
        // Example:
        // await sendEmail(church.email, {
        //   subject: `10DLC Status Update: ${status}`,
        //   body: message,
        // });
    }
    catch (error) {
        console.error('⚠️ Failed to notify church:', error.message);
        // Don't throw - notification failure shouldn't break the flow
    }
}
export { notifyChurch };
//# sourceMappingURL=10dlc-webhooks.js.map