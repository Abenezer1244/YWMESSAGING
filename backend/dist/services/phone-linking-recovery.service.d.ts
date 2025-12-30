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
import { LinkingResult } from './telnyx.service.js';
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
export declare function verifyAndRecoverPhoneLinkings(): Promise<RecoveryResult[]>;
/**
 * Get recovery status for a specific church
 * Useful for frontend/admin dashboard showing linking health
 */
export declare function getPhoneLinkingStatus(churchId: string): Promise<{
    status: string;
    lastAttempt: Date | null;
    retryCount: number;
    error: string | null;
    canRetry: boolean;
}>;
/**
 * Manual retry trigger (for admin panel or support team)
 * Resets retry count so recovery job will attempt immediately
 */
export declare function manuallyRetryPhoneLinking(churchId: string): Promise<void>;
/**
 * Scheduled job trigger - call this from your cron/scheduler
 * Example (with node-cron):
 * import cron from 'node-cron';
 * cron.schedule('* /5 * * * *', verifyAndRecoverPhoneLinkings); // Every 5 minutes
 */
export declare function startPhoneLinkingRecoveryScheduler(): Promise<void>;
export {};
//# sourceMappingURL=phone-linking-recovery.service.d.ts.map