/**
 * Check for recurring messages that are due and send them
 * Run periodically (every 1-5 minutes)
 * ✅ PHASE 2: Uses distributed lock to prevent duplicate execution on multi-server setup
 */
export declare function processRecurringMessages(): Promise<void>;
/**
 * Start recurring message scheduler
 * Runs every 5 minutes
 */
export declare function startRecurringMessageScheduler(): NodeJS.Timeout;
//# sourceMappingURL=recurringMessages.job.d.ts.map