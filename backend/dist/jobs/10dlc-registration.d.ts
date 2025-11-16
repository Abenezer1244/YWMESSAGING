/**
 * Register a church's own 10DLC brand with Telnyx
 * This runs asynchronously after phone purchase to avoid blocking the user
 */
export declare function registerPersonal10DLCAsync(churchId: string, phoneNumber: string): Promise<void>;
/**
 * Check 10DLC approval status and migrate to per-church brand when approved
 */
export declare function checkAndMigrateToPer10DLC(): Promise<void>;
/**
 * Export functions that can be called from controllers or scheduled jobs
 */
export { checkAndMigrateToPer10DLC as checkDLCApprovalStatus };
//# sourceMappingURL=10dlc-registration.d.ts.map