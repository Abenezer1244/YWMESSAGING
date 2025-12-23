/**
 * Distributed Lock Service using Redis SET NX
 * ✅ PHASE 2: Prevents duplicate job execution on multiple servers
 *
 * Use this for critical cron jobs that should run on only one server:
 * - Recurring message jobs
 * - Phone linking recovery
 * - Data archival
 * - Billing cycles
 *
 * Flow:
 * 1. Try to acquire lock on Redis using SET NX (atomic)
 * 2. If successful, run job
 * 3. If failed (another server holds lock), skip this run
 * 4. Release lock when done
 *
 * Implementation: Simple Redis SET NX (Not eXists) with expiration
 * This is more reliable than Redlock with modern node-redis clients
 */
/**
 * Acquire a distributed lock for a job
 * Uses Redis SET NX (atomic compare-and-set) for safety
 * Returns lock token if successful, null if another server holds lock
 *
 * Usage:
 * ```typescript
 * const lockToken = await acquireJobLock('recurring-messages', 30000);
 * if (!lockToken) {
 *   console.log('Another server is processing this job');
 *   return;
 * }
 * try {
 *   // Run your job logic
 * } finally {
 *   await releaseJobLock('recurring-messages', lockToken);
 * }
 * ```
 *
 * @param jobName - Unique name for the job (e.g., 'recurring-messages')
 * @param ttlMs - Lock TTL in milliseconds (default: 30 seconds)
 * @returns Lock token if acquired, null if failed
 */
export declare function acquireJobLock(jobName: string, ttlMs?: number): Promise<string | null>;
/**
 * Release a lock when job is complete
 * Uses DEL with token comparison to safely release only our lock
 *
 * @param jobName - Name of the job
 * @param lockToken - Lock token returned from acquireJobLock
 */
export declare function releaseJobLock(jobName: string, lockToken: string | null): Promise<void>;
/**
 * Convenience wrapper for simple jobs that don't need manual lock management
 *
 * Usage:
 * ```typescript
 * await withJobLock('daily-report', async () => {
 *   // Job logic here - lock automatically acquired and released
 *   console.log('Generating daily report...');
 * });
 * ```
 *
 * @param jobName - Unique name for the job
 * @param jobFn - Async function to execute
 * @param ttlMs - Lock TTL in milliseconds (default: 60 seconds for safety)
 * @returns Result of jobFn, or null if lock failed
 */
export declare function withJobLock<T>(jobName: string, jobFn: () => Promise<T>, ttlMs?: number): Promise<T | null>;
/**
 * Check if a job lock currently exists (for monitoring/debugging)
 *
 * @param jobName - Name of the job to check
 * @returns true if lock is held, false otherwise
 */
export declare function isJobLockHeld(jobName: string): Promise<boolean>;
/**
 * Force release a lock (use with caution!)
 * Only use if a job crashed and lock didn't auto-expire
 *
 * @param jobName - Name of the job
 */
export declare function forceReleaseJobLock(jobName: string): Promise<void>;
/**
 * Get list of all active job locks (for monitoring)
 *
 * @returns Array of job names with active locks
 */
export declare function getActiveJobLocks(): Promise<string[]>;
declare const _default: {
    acquireJobLock: typeof acquireJobLock;
    releaseJobLock: typeof releaseJobLock;
    withJobLock: typeof withJobLock;
    isJobLockHeld: typeof isJobLockHeld;
    forceReleaseJobLock: typeof forceReleaseJobLock;
    getActiveJobLocks: typeof getActiveJobLocks;
};
export default _default;
//# sourceMappingURL=lock.service.d.ts.map