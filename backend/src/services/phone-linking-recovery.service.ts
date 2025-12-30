/**
 * Phase 2: Enterprise Phone Number Linking Recovery Service
 *
 * Automatic background job that:
 * 1. Finds churches with failed phone number linking
 * 2. Automatically retries linking with exponential backoff
 * 3. Logs results for monitoring and alerting
 * 4. Notifies support if linking fails after max retries
 *
 * PHASE 5: Multi-tenant refactoring - uses registryPrisma for church registry lookups
 */

import { getRegistryPrisma } from '../lib/tenant-prisma.js';
import { linkPhoneNumberToMessagingProfile, LinkingResult } from './telnyx.service.js';

// Configuration for linking recovery
const LINKING_RECOVERY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MINUTES: [5, 15, 60], // Delay between retries: 5min, 15min, 60min
  BATCH_SIZE: 10, // Process churches in batches to avoid overwhelming API
  LOG_TAG: '[PHONE_LINKING_RECOVERY]',
};

/**
 * Recovery operation result
 */
interface RecoveryResult {
  churchId: string;
  phoneNumber: string;
  messagingProfileId: string;
  previousStatus: string;
  previousRetryCount: number;
  newStatus: string;
  newRetryCount: number;
  linkingResult: LinkingResult | null;
  error?: string;
}

/**
 * Main background job: Verify and recover failed phone number linkings
 * Run this periodically (e.g., every 5 minutes) via cron or scheduled task
 */
export async function verifyAndRecoverPhoneLinkings(): Promise<RecoveryResult[]> {
  const registryPrisma = getRegistryPrisma();
  const startTime = Date.now();
  const results: RecoveryResult[] = [];

  try {
    console.log(`${LINKING_RECOVERY_CONFIG.LOG_TAG} Starting phone linking recovery job`);

    // Step 1: Find all churches with pending or failed linking status
    const churchesNeedingRecovery = await registryPrisma.church.findMany({
      where: {
        telnyxPhoneNumber: { not: null },
        telnyxPhoneLinkingStatus: {
          in: ['pending', 'failed'],
        },
        telnyxPhoneLinkingRetryCount: {
          lt: LINKING_RECOVERY_CONFIG.MAX_RETRIES,
        },
      },
      select: {
        id: true,
        name: true,
        telnyxPhoneNumber: true,
        telnyxWebhookId: true,
        telnyxPhoneLinkingStatus: true,
        telnyxPhoneLinkingLastAttempt: true,
        telnyxPhoneLinkingRetryCount: true,
        telnyxPhoneLinkingError: true,
      },
      take: LINKING_RECOVERY_CONFIG.BATCH_SIZE,
    });

    console.log(
      `${LINKING_RECOVERY_CONFIG.LOG_TAG} Found ${churchesNeedingRecovery.length} churches needing recovery`
    );

    // Step 2: Check if enough time has passed since last attempt (exponential backoff)
    const churchesToRetry = churchesNeedingRecovery.filter(church => {
      if (!church.telnyxPhoneLinkingLastAttempt) {
        return true; // First attempt
      }

      const retryIndex = Math.min(church.telnyxPhoneLinkingRetryCount, LINKING_RECOVERY_CONFIG.RETRY_DELAY_MINUTES.length - 1);
      const delayMinutes = LINKING_RECOVERY_CONFIG.RETRY_DELAY_MINUTES[retryIndex];
      const timeSinceLastAttempt = Date.now() - church.telnyxPhoneLinkingLastAttempt.getTime();
      const minDelayMs = delayMinutes * 60 * 1000;

      return timeSinceLastAttempt >= minDelayMs;
    });

    console.log(
      `${LINKING_RECOVERY_CONFIG.LOG_TAG} ${churchesToRetry.length} churches ready for retry (respecting backoff)`
    );

    // Step 3: Retry linking for each church
    for (const church of churchesToRetry) {
      try {
        if (!church.telnyxPhoneNumber || !church.telnyxWebhookId) {
          throw new Error('Missing phone number or webhook ID');
        }

        console.log(
          `${LINKING_RECOVERY_CONFIG.LOG_TAG} Retrying link for church ${church.id} (${church.name}): ${church.telnyxPhoneNumber}`
        );

        // Attempt to link
        const linkingResult = await linkPhoneNumberToMessagingProfile(
          church.telnyxPhoneNumber,
          church.telnyxWebhookId,
          church.id
        );

        // Step 4: Update database with result
        const newStatus = linkingResult.success ? 'linked' : 'failed';
        const newRetryCount = linkingResult.success ? 0 : church.telnyxPhoneLinkingRetryCount + 1;

        const updated = await registryPrisma.church.update({
          where: { id: church.id },
          data: {
            telnyxPhoneLinkingStatus: newStatus,
            telnyxPhoneLinkingLastAttempt: new Date(),
            telnyxPhoneLinkingRetryCount: newRetryCount,
            telnyxPhoneLinkingError: linkingResult.success ? null : linkingResult.error?.message || 'Unknown error',
          },
          select: {
            telnyxPhoneLinkingStatus: true,
            telnyxPhoneLinkingRetryCount: true,
          },
        });

        results.push({
          churchId: church.id,
          phoneNumber: church.telnyxPhoneNumber,
          messagingProfileId: church.telnyxWebhookId,
          previousStatus: church.telnyxPhoneLinkingStatus,
          previousRetryCount: church.telnyxPhoneLinkingRetryCount,
          newStatus: updated.telnyxPhoneLinkingStatus,
          newRetryCount: updated.telnyxPhoneLinkingRetryCount,
          linkingResult,
        });

        // Log success/failure
        if (linkingResult.success) {
          console.log(
            `${LINKING_RECOVERY_CONFIG.LOG_TAG} ✅ Successfully recovered linking for church ${church.id} via ${linkingResult.method} method`
          );
        } else {
          console.error(
            `${LINKING_RECOVERY_CONFIG.LOG_TAG} ❌ Recovery failed for church ${church.id}: ${linkingResult.error?.code} - ${linkingResult.error?.message}`
          );
        }

        // Step 5: Alert support if max retries exceeded
        if (!linkingResult.success && newRetryCount >= LINKING_RECOVERY_CONFIG.MAX_RETRIES) {
          console.error(
            `${LINKING_RECOVERY_CONFIG.LOG_TAG} 🚨 ALERT: Church ${church.id} (${church.name}) has exceeded max linking retries. Manual intervention required.`
          );
          // TODO: Send email to support team
          // await sendSupportAlert(church, linkingResult);
        }
      } catch (churchError: any) {
        console.error(
          `${LINKING_RECOVERY_CONFIG.LOG_TAG} Error processing church ${church.id}: ${churchError.message}`
        );

        results.push({
          churchId: church.id,
          phoneNumber: church.telnyxPhoneNumber || 'UNKNOWN',
          messagingProfileId: church.telnyxWebhookId || 'UNKNOWN',
          previousStatus: church.telnyxPhoneLinkingStatus,
          previousRetryCount: church.telnyxPhoneLinkingRetryCount,
          newStatus: church.telnyxPhoneLinkingStatus,
          newRetryCount: church.telnyxPhoneLinkingRetryCount,
          linkingResult: null,
          error: churchError.message,
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `${LINKING_RECOVERY_CONFIG.LOG_TAG} Recovery job completed. Processed: ${results.length} churches. Duration: ${duration}ms`
    );

    // Log summary for monitoring
    const successCount = results.filter(r => r.newStatus === 'linked').length;
    const failureCount = results.filter(r => r.newStatus === 'failed').length;
    const alertCount = results.filter(r => r.newRetryCount >= LINKING_RECOVERY_CONFIG.MAX_RETRIES).length;

    console.log(`${LINKING_RECOVERY_CONFIG.LOG_TAG} Summary: ${successCount} succeeded, ${failureCount} failed, ${alertCount} need manual intervention`);

    return results;
  } catch (error: any) {
    console.error(`${LINKING_RECOVERY_CONFIG.LOG_TAG} Unexpected error in recovery job:`, error.message);
    throw error;
  }
}

/**
 * Get recovery status for a specific church
 * Useful for frontend/admin dashboard showing linking health
 */
export async function getPhoneLinkingStatus(churchId: string): Promise<{
  status: string;
  lastAttempt: Date | null;
  retryCount: number;
  error: string | null;
  canRetry: boolean;
}> {
  const registryPrisma = getRegistryPrisma();
  const church = await registryPrisma.church.findUnique({
    where: { id: churchId },
    select: {
      telnyxPhoneLinkingStatus: true,
      telnyxPhoneLinkingLastAttempt: true,
      telnyxPhoneLinkingRetryCount: true,
      telnyxPhoneLinkingError: true,
    },
  });

  if (!church) {
    throw new Error('Church not found');
  }

  const canRetry = church.telnyxPhoneLinkingRetryCount < LINKING_RECOVERY_CONFIG.MAX_RETRIES;

  return {
    status: church.telnyxPhoneLinkingStatus,
    lastAttempt: church.telnyxPhoneLinkingLastAttempt,
    retryCount: church.telnyxPhoneLinkingRetryCount,
    error: church.telnyxPhoneLinkingError,
    canRetry,
  };
}

/**
 * Manual retry trigger (for admin panel or support team)
 * Resets retry count so recovery job will attempt immediately
 */
export async function manuallyRetryPhoneLinking(churchId: string): Promise<void> {
  const registryPrisma = getRegistryPrisma();
  await registryPrisma.church.update({
    where: { id: churchId },
    data: {
      telnyxPhoneLinkingStatus: 'pending',
      telnyxPhoneLinkingRetryCount: 0,
      telnyxPhoneLinkingLastAttempt: null,
      telnyxPhoneLinkingError: 'Manual retry initiated',
    },
  });

  console.log(`${LINKING_RECOVERY_CONFIG.LOG_TAG} Manual retry initiated for church ${churchId}`);
}

/**
 * Scheduled job trigger - call this from your cron/scheduler
 * Example (with node-cron):
 * import cron from 'node-cron';
 * cron.schedule('* /5 * * * *', verifyAndRecoverPhoneLinkings); // Every 5 minutes
 */
export async function startPhoneLinkingRecoveryScheduler() {
  // This would be called during app initialization
  // For now, this is just a placeholder for integration
  console.log(`${LINKING_RECOVERY_CONFIG.LOG_TAG} Phone linking recovery scheduler ready`);
  console.log(`${LINKING_RECOVERY_CONFIG.LOG_TAG} Max retries: ${LINKING_RECOVERY_CONFIG.MAX_RETRIES}`);
  console.log(`${LINKING_RECOVERY_CONFIG.LOG_TAG} Retry delays: ${LINKING_RECOVERY_CONFIG.RETRY_DELAY_MINUTES.join(', ')} minutes`);
}
