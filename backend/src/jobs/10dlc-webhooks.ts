import { getRegistryPrisma } from '../lib/tenant-prisma.js';
import axios from 'axios';
import { createCampaignAsync } from './10dlc-registration.js';

/**
 * Handle webhook events from Telnyx for 10DLC brand/campaign status updates
 * These webhooks are triggered automatically when approval status changes
 */
export async function handleTelnyx10DLCWebhook(payload: any): Promise<void> {
  try {
    // Payload structure is flat (from Telnyx webhook JSON at top level)
    const eventType = payload.eventType || payload.type;
    const type = payload.type;
    console.log(`📨 Received Telnyx webhook: ${eventType} (type: ${type})`);

    // Check for campaign suspension first (it's a special type of campaign event)
    if (payload.type === 'TELNYX_EVENT' && payload.status === 'DORMANT') {
      // Campaign suspension notification
      await handleCampaignSuspension(payload);
    } else if (type === 'TCR_BRAND_UPDATE') {
      await handleBrandUpdate(payload);
    } else if (type === 'TCR_CAMPAIGN_UPDATE') {
      await handleCampaignUpdate(payload);
    } else if (type === 'TCR_PHONE_NUMBER_UPDATE') {
      await handlePhoneNumberUpdate(payload);
    } else {
      console.log(`⚠️ Unknown event type: ${type}`);
    }
  } catch (error: any) {
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
async function handleBrandUpdate(payload: any): Promise<void> {
  try {
    // Payload structure is flat at top level - VALIDATE ALL INPUTS
    const brandId = payload?.brandId;
    const brandIdentityStatus = payload?.brandIdentityStatus; // Only in BRAND_IDENTITY_STATUS_UPDATE events
    const brandName = payload?.brandName;
    const tcrBrandId = payload?.tcrBrandId;
    const eventType = payload?.eventType; // BRAND_ADD, BRAND_IDENTITY_STATUS_UPDATE, BRAND_IDENTITY_VET_UPDATE, etc.

    // ENTERPRISE: Validate required fields
    if (!brandId || typeof brandId !== 'string') {
      console.error('❌ Brand webhook missing or invalid brandId:', { brandId });
      throw new Error('Missing required field: brandId');
    }

    console.log(`🏷️  Brand Update: brandId=${brandId}, status=${brandIdentityStatus || 'N/A'}, eventType=${eventType}`);

    // Find church with this brand - handle not found gracefully
    const registryPrisma = getRegistryPrisma();
    const church = await registryPrisma.church.findFirst({
      where: { dlcBrandId: brandId },
      select: { id: true, name: true, dlcStatus: true },
    });

    if (!church) {
      console.warn(
        `⚠️ Brand ${brandId} not found in database - webhook may be from another system or user`
      );
      return;
    }

    console.log(`🏪 Church: ${church.name} (${church.id})`);
    console.log(`   Brand Name: ${brandName || 'N/A'}`);
    if (brandIdentityStatus) console.log(`   Identity Status: ${brandIdentityStatus}`);
    if (tcrBrandId) console.log(`   TCR Brand ID: ${tcrBrandId}`);

    // ENTERPRISE: Wrap database operation in try-catch
    try {
      // Handle different event types differently
      if (eventType === 'BRAND_ADD') {
        // Brand just created, awaiting verification
        console.log(`✅ Brand created: ${brandName || 'Unknown'}`);
        await registryPrisma.church.update({
          where: { id: church.id },
          data: {
            dlcStatus: 'pending',
            tcrBrandId: tcrBrandId || undefined,
          },
        });
      } else if (eventType === 'BRAND_IDENTITY_STATUS_UPDATE' && brandIdentityStatus) {
        // Handle verification status changes
        const validStatuses = ['VERIFIED', 'UNVERIFIED', 'FAILED', 'PENDING'];
        if (!validStatuses.includes(brandIdentityStatus)) {
          console.warn(`⚠️ Unknown brand status: ${brandIdentityStatus} - treating as informational`);
        }

        if (brandIdentityStatus === 'VERIFIED') {
          // Brand is fully verified and ready to use
          console.log(`✅ Brand verified and ready! Setting up campaign...`);

          await registryPrisma.church.update({
            where: { id: church.id },
            data: {
              dlcStatus: 'brand_verified',
              tcrBrandId: tcrBrandId || undefined,
            },
          });

          console.log(`📋 Next step: Auto-create campaign for ${church.name}`);

          // Auto-create campaign asynchronously with error tracking
          createCampaignAsync(church.id).catch((error) => {
            console.error(`❌ Failed to auto-create campaign for ${church.name}:`, {
              churchId: church.id,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        } else if (brandIdentityStatus === 'UNVERIFIED') {
          // Brand created but not yet verified
          console.log(`⏳ Brand awaiting verification...`);

          await registryPrisma.church.update({
            where: { id: church.id },
            data: {
              dlcStatus: 'pending',
              tcrBrandId: tcrBrandId || undefined,
            },
          });
        } else if (brandIdentityStatus === 'FAILED') {
          // Brand verification failed
          console.error(`❌ Brand verification failed for ${church.name}`);

          await registryPrisma.church.update({
            where: { id: church.id },
            data: {
              dlcStatus: 'rejected',
              dlcRejectionReason: `Brand verification failed: ${payload?.description || 'Unknown reason'}`,
            },
          });
        } else {
          // Other statuses - log but don't update
          console.log(`ℹ️ Brand status: ${brandIdentityStatus} - no action needed`);
        }
      } else if (eventType === 'BRAND_IDENTITY_VET_UPDATE') {
        // Brand identity vetting update (intermediate status)
        console.log(`🔍 Brand identity vetting update: ${payload?.description || 'Unknown change'}`);
        // Don't update dlcStatus for intermediate events, just log
      } else {
        // Unknown event type - log but don't update
        console.log(`ℹ️ Unknown brand event type: ${eventType} - no action taken`);
      }
    } catch (dbError) {
      console.error(`❌ Database error updating church ${church.id}:`, {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        brandId,
        churchId: church.id,
      });
      throw dbError; // Re-throw for caller to handle
    }
  } catch (error) {
    // ENTERPRISE: Log errors with full context
    console.error(`❌ Error processing brand update webhook:`, {
      error: error instanceof Error ? error.message : String(error),
      payload: { brandId: payload?.brandId, eventType: payload?.eventType },
    });
    throw error; // Let caller handle
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
async function handleCampaignUpdate(payload: any): Promise<void> {
  try {
    // Payload structure is flat at top level - VALIDATE ALL INPUTS
    const campaignId = payload?.campaignId;
    const campaignStatus = payload?.campaignStatus;
    const eventType = payload?.eventType;
    const brandId = payload?.brandId;

    // Use explicit undefined checks, not truthy checks (falsy IDs like 0 are valid)
    if (campaignId === undefined || campaignId === null) {
      console.warn('⚠️ Campaign webhook missing or invalid campaignId');
      return;
    }

    if (brandId === undefined || brandId === null) {
      console.warn('⚠️ Campaign webhook missing or invalid brandId');
      return;
    }

    console.log(
      `📢 Campaign Update: campaignId=${campaignId}, status=${campaignStatus}, eventType=${eventType}`
    );

    // Find church with this brand
    const registryPrisma = getRegistryPrisma();
    const church = await registryPrisma.church.findFirst({
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

      try {
        await registryPrisma.church.update({
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
      } catch (dbError) {
        console.error(`❌ Database error updating church ${church.id} for campaign approval:`, {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          campaignId,
          churchId: church.id,
        });
        throw dbError;
      }
    }

    // Campaign rejected at any stage
    if (campaignStatus === 'TCR_FAILED' || campaignStatus === 'TELNYX_FAILED' || campaignStatus === 'MNO_REJECTED') {
      const reasons = payload.failureReasons || payload.reason || 'Unknown reason';
      console.log(`❌ Campaign rejected at ${campaignStatus} stage: ${reasons}`);

      try {
        await registryPrisma.church.update({
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
      } catch (dbError) {
        console.error(`❌ Database error updating church ${church.id} for campaign rejection:`, {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          campaignId,
          churchId: church.id,
        });
        throw dbError;
      }
    }

    // Campaign pending - waiting for next approval stage (intermediate states)
    if (
      campaignStatus === 'TCR_PENDING' ||
      campaignStatus === 'TCR_ACCEPTED' ||
      campaignStatus === 'TELNYX_ACCEPTED' ||
      campaignStatus === 'MNO_PENDING'
    ) {
      console.log(`⏳ Campaign pending in ${campaignStatus} state`);
      console.log(`   Campaign ID: ${campaignId}`);
      console.log(`   Church: ${church.name} (${church.id})`);
      console.log(`   Progress: Awaiting next approval stage...`);

      try {
        await registryPrisma.church.update({
          where: { id: church.id },
          data: {
            dlcStatus: 'campaign_pending',
            dlcCampaignId: campaignId,
            dlcCampaignStatus: campaignStatus,
          },
        });
      } catch (dbError) {
        console.error(`❌ Database error updating church ${church.id} for campaign pending:`, {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          campaignId,
          churchId: church.id,
        });
        throw dbError;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing campaign update webhook:`, {
      error: error instanceof Error ? error.message : String(error),
      payload: { campaignId: payload?.campaignId, brandId: payload?.brandId, eventType: payload?.eventType },
    });
    throw error;
  }
}

/**
 * Handle campaign suspension notifications (inactivity, T-Mobile fines, etc.)
 * Campaign suspended when:
 * - No activity for 15 days
 * - No active phone numbers assigned
 * - Deployed with T-Mobile
 */
async function handleCampaignSuspension(payload: any): Promise<void> {
  try {
    const campaignId = payload?.campaignId;
    const status = payload?.status; // e.g., "DORMANT"
    const description = payload?.description;
    const brandId = payload?.brandId;

    console.log(`⚠️ Campaign Suspension Alert: ${status}`);
    console.log(`   Campaign: ${campaignId}`);
    console.log(`   Reason: ${description || 'Unknown'}`);

    if (!campaignId) {
      console.warn('⚠️ Campaign suspension webhook missing campaignId');
      return;
    }

    // Find church with this campaign
    const registryPrisma = getRegistryPrisma();
    const church = await registryPrisma.church.findFirst({
      where: { dlcCampaignId: campaignId },
      select: { id: true, name: true, dlcStatus: true },
    });

    if (!church) {
      console.log(`ℹ️ Campaign ${campaignId} not found in local database`);
      return;
    }

    console.log(`🏪 Church: ${church.name} (${church.id})`);

    if (status === 'DORMANT') {
      console.warn(`⚠️ Campaign marked as DORMANT due to inactivity`);
      console.warn(`   Action needed: Re-assign phone number to reactivate`);
      console.warn(`   Note: First assignment might fail, second will succeed`);

      try {
        await registryPrisma.church.update({
          where: { id: church.id },
          data: {
            dlcCampaignSuspended: true,
            dlcCampaignSuspendedAt: new Date(),
            dlcCampaignSuspendedReason: status,
          },
        });

        console.log(`   📊 Database updated: dlcCampaignSuspended=true`);
      } catch (dbError) {
        console.error(`❌ Database error updating church ${church.id} for suspension:`, {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          campaignId,
          churchId: church.id,
        });
        throw dbError;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing campaign suspension webhook:`, {
      error: error instanceof Error ? error.message : String(error),
      payload: { campaignId: payload?.campaignId },
    });
    throw error;
  }
}

/**
 * Handle phone number assignment status updates
 * Triggered when phone numbers are linked to campaigns
 */
async function handlePhoneNumberUpdate(payload: any): Promise<void> {
  try {
    // Payload structure is flat at top level
    const phoneNumber = payload?.phoneNumber;
    const campaignId = payload?.campaignId;
    const status = payload?.status;
    const eventType = payload?.eventType; // ASSIGNMENT, DELETION, STATUS_UPDATE

    console.log(
      `📱 Phone Number Update: number=${phoneNumber}, campaign=${campaignId}, eventType=${eventType}`
    );

    if (!phoneNumber) {
      console.warn('⚠️ Phone number webhook missing phoneNumber');
      return;
    }

    // Find church with this phone number
    const registryPrisma = getRegistryPrisma();
    const church = await registryPrisma.church.findFirst({
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
        console.log(`✅ Phone number ${phoneNumber} successfully assigned to campaign ${campaignId}`);

        try {
          // Update church with phone number assignment details
          await registryPrisma.church.update({
            where: { id: church.id },
            data: {
              dlcNumberAssignedAt: new Date(),
              dlcCampaignId: campaignId || undefined,
              // Clear any previous suspension flags
              dlcCampaignSuspended: false,
              dlcCampaignSuspendedAt: null,
              dlcCampaignSuspendedReason: null,
            },
          });

          console.log(`   ✅ Database updated: dlcNumberAssignedAt, dlcCampaignId=${campaignId}`);
          console.log(`   🎉 Phone number ready for messaging!`);
        } catch (dbError) {
          console.error(`❌ Database error updating church ${church.id} for successful number assignment:`, {
            error: dbError instanceof Error ? dbError.message : String(dbError),
            phoneNumber,
            campaignId,
            churchId: church.id,
          });
          throw dbError;
        }
      } else {
        console.log(`❌ Phone number assignment failed`);
        const reasons = payload.reasons?.join('; ') || payload.reason || 'Unknown error';

        try {
          await registryPrisma.church.update({
            where: { id: church.id },
            data: {
              dlcRejectionReason: `Number assignment failed: ${reasons}`,
            },
          });

          console.log(`   Reason: ${reasons}`);
        } catch (dbError) {
          console.error(`❌ Database error updating church ${church.id} for number assignment failure:`, {
            error: dbError instanceof Error ? dbError.message : String(dbError),
            phoneNumber,
            churchId: church.id,
          });
          throw dbError;
        }
      }
    } else if (eventType === 'DELETION') {
      // Phone number removed from campaign
      console.log(`🗑️ Phone number ${phoneNumber} removed from campaign`);

      try {
        await registryPrisma.church.update({
          where: { id: church.id },
          data: {
            dlcNumberAssignedAt: null,
          },
        });

        console.log(`   Phone number unassigned from campaign`);
      } catch (dbError) {
        console.error(`❌ Database error updating church for number deletion:`, {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          phoneNumber,
          churchId: church.id,
        });
        throw dbError;
      }
    } else if (eventType === 'STATUS_UPDATE') {
      // Phone number status changed
      console.log(`📊 Phone number ${phoneNumber} status update: ${status}`);
      // Just log, no database change needed for status updates
    }
  } catch (error) {
    console.error(`❌ Error processing phone number update webhook:`, {
      error: error instanceof Error ? error.message : String(error),
      payload: { phoneNumber: payload?.phoneNumber, eventType: payload?.eventType },
    });
    throw error;
  }
}

/**
 * Send a notification to the church (email, in-app, etc.)
 * when their 10DLC status changes
 */
async function notifyChurch(churchId: string, message: string, status: string): Promise<void> {
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
  } catch (error: any) {
    console.error('⚠️ Failed to notify church:', error.message);
    // Don't throw - notification failure shouldn't break the flow
  }
}

export { notifyChurch };
