/**
 * Register a church's own 10DLC brand with Telnyx
 * This runs asynchronously after phone purchase to avoid blocking the user
 */
export declare function registerPersonal10DLCAsync(churchId: string, phoneNumber: string): Promise<void>;
/**
 * Auto-create a campaign for a church after their brand is verified
 * This runs asynchronously when the brand verification webhook arrives
 */
export declare function createCampaignAsync(churchId: string): Promise<void>;
/**
 * Check 10DLC approval status and migrate to per-church brand when approved
 * NOTE: With webhooks enabled, this function is mostly a safety net.
 * Real-time updates come via webhook notifications from Telnyx.
 * This still runs periodically to catch any missed webhooks.
 */
export declare function checkAndMigrateToPer10DLC(): Promise<void>;
/**
 * Export functions that can be called from controllers or scheduled jobs
 */
export { checkAndMigrateToPer10DLC as checkDLCApprovalStatus };
//# sourceMappingURL=10dlc-registration.d.ts.map