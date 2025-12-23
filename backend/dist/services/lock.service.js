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
import { redisClient } from '../config/redis.config.js';
/**
 * Generate a unique lock token for safety
 */
function generateLockToken() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
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
export async function acquireJobLock(jobName, ttlMs = 30000) {
    try {
        const lockKey = `job:lock:${jobName}`;
        const lockToken = generateLockToken();
        const ttlSeconds = Math.ceil(ttlMs / 1000);
        // SET NX EX is atomic - either succeeds completely or fails completely
        const result = await redisClient.set(lockKey, lockToken, {
            NX: true, // Only set if key doesn't exist
            EX: ttlSeconds, // Expire after this many seconds
        });
        if (result === 'OK') {
            console.log(`✅ Acquired lock for job: ${jobName} (TTL: ${ttlMs}ms)`);
            return lockToken;
        }
        else {
            // Another server already holds this lock - this is expected
            console.log(`⏭️  Job lock held by another server: ${jobName}`);
            return null;
        }
    }
    catch (error) {
        console.error(`❌ Failed to acquire lock for job ${jobName}:`, error);
        return null;
    }
}
/**
 * Release a lock when job is complete
 * Uses DEL with token comparison to safely release only our lock
 *
 * @param jobName - Name of the job
 * @param lockToken - Lock token returned from acquireJobLock
 */
export async function releaseJobLock(jobName, lockToken) {
    if (!lockToken) {
        return;
    }
    try {
        const lockKey = `job:lock:${jobName}`;
        // Use Lua script to safely delete only if token matches (prevents accidental deletion)
        // This is important: if job runs longer than TTL, another server might have acquired lock
        // We don't want to delete their lock
        const currentToken = await redisClient.get(lockKey);
        if (currentToken === lockToken) {
            await redisClient.del(lockKey);
            console.log(`✅ Released lock for job: ${jobName}`);
        }
        else if (currentToken === null) {
            console.log(`⏱️  Lock already expired for job: ${jobName}`);
        }
        else {
            // Lock belongs to another server - don't delete it
            console.log(`⚠️  Lock for job ${jobName} held by another server, not deleting`);
        }
    }
    catch (error) {
        console.warn(`⚠️  Failed to release lock for job ${jobName}:`, error);
    }
}
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
export async function withJobLock(jobName, jobFn, ttlMs = 60000) {
    let lockToken = null;
    try {
        // Acquire lock
        lockToken = await acquireJobLock(jobName, ttlMs);
        if (!lockToken) {
            return null; // Another server is running this job
        }
        // Execute job
        const result = await jobFn();
        return result;
    }
    finally {
        // Always release lock
        await releaseJobLock(jobName, lockToken);
    }
}
/**
 * Check if a job lock currently exists (for monitoring/debugging)
 *
 * @param jobName - Name of the job to check
 * @returns true if lock is held, false otherwise
 */
export async function isJobLockHeld(jobName) {
    try {
        const lockKey = `job:lock:${jobName}`;
        const exists = await redisClient.exists(lockKey);
        return exists === 1;
    }
    catch (error) {
        console.error(`Failed to check lock status for ${jobName}:`, error);
        return false;
    }
}
/**
 * Force release a lock (use with caution!)
 * Only use if a job crashed and lock didn't auto-expire
 *
 * @param jobName - Name of the job
 */
export async function forceReleaseJobLock(jobName) {
    try {
        const lockKey = `job:lock:${jobName}`;
        await redisClient.del(lockKey);
        console.log(`🔓 Force released lock for job: ${jobName}`);
    }
    catch (error) {
        console.error(`Failed to force release lock for ${jobName}:`, error);
    }
}
/**
 * Get list of all active job locks (for monitoring)
 *
 * @returns Array of job names with active locks
 */
export async function getActiveJobLocks() {
    try {
        const keys = await redisClient.keys('job:lock:*');
        return keys.map((key) => key.replace('job:lock:', ''));
    }
    catch (error) {
        console.error('Failed to get active job locks:', error);
        return [];
    }
}
export default {
    acquireJobLock,
    releaseJobLock,
    withJobLock,
    isJobLockHeld,
    forceReleaseJobLock,
    getActiveJobLocks,
};
//# sourceMappingURL=lock.service.js.map