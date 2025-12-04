/**
 * Distributed Lock Service using Redis Redlock
 * ✅ PHASE 2: Prevents duplicate job execution on multiple servers
 *
 * Use this for critical cron jobs that should run on only one server:
 * - Recurring message jobs
 * - Phone linking recovery
 * - Data archival
 * - Billing cycles
 *
 * Flow:
 * 1. Try to acquire lock on Redis
 * 2. If successful, run job
 * 3. If failed (another server holds lock), skip this run
 * 4. Release lock when done
 */

import Redlock from 'redlock';
import { redisClient } from '../config/redis.config.js';

/**
 * Initialize Redlock with Redis client
 * Configuration tuned for job locking (not high-frequency operations)
 * Using Redlock 4.x (compatible with Redis 4.6.7)
 */
const redlock = new Redlock([redisClient], {
  // Recommended retries for job locking: none needed (we're OK to skip a run)
  retryCount: 0,
  retryDelay: 0,
  retryJitter: 0,

  // Drift factor: accounts for time synchronization issues
  driftFactor: 0.01,

  // Automatically extend lock if job still running (500ms before expiration)
  automaticExtensionThreshold: 500,
});

/**
 * Acquire a distributed lock for a job
 * Returns lock object if successful, null if another server holds lock
 *
 * Usage:
 * ```typescript
 * const lock = await acquireJobLock('recurring-messages', 30000);
 * if (!lock) {
 *   console.log('Another server is processing this job');
 *   return;
 * }
 * try {
 *   // Run your job logic
 * } finally {
 *   await releaseJobLock(lock);
 * }
 * ```
 *
 * @param jobName - Unique name for the job (e.g., 'recurring-messages')
 * @param ttlMs - Lock TTL in milliseconds (default: 30 seconds)
 * @returns Lock object if acquired, null if failed
 */
export async function acquireJobLock(
  jobName: string,
  ttlMs: number = 30000
): Promise<any> {
  try {
    const lock = await redlock.lock(`job:${jobName}`, ttlMs);
    console.log(`✅ Acquired lock for job: ${jobName} (TTL: ${ttlMs}ms)`);
    return lock;
  } catch (error) {
    if ((error as any).code === 'LOCK_FAILED') {
      // Another server already holds this lock - this is expected
      console.log(`⏭️  Job lock held by another server: ${jobName}`);
      return null;
    }
    // Log actual errors
    console.error(`❌ Failed to acquire lock for job ${jobName}:`, error);
    return null;
  }
}

/**
 * Release a lock when job is complete
 * Handles cases where lock already expired or was released
 *
 * @param lock - Lock object returned from acquireJobLock
 */
export async function releaseJobLock(lock: any): Promise<void> {
  if (!lock) {
    return;
  }

  try {
    await lock.unlock();
    console.log('✅ Released job lock');
  } catch (error) {
    // Lock might already be expired or released - this is OK
    if ((error as any).code === 'LOCK_EXPIRED') {
      console.log('⏱️  Lock already expired (job took longer than TTL)');
    } else if ((error as any).code === 'LOCK_NOT_FOUND') {
      console.log('⏱️  Lock already released');
    } else {
      console.warn('⚠️  Failed to release lock:', error);
    }
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
export async function withJobLock<T>(
  jobName: string,
  jobFn: () => Promise<T>,
  ttlMs: number = 60000
): Promise<T | null> {
  let lock = null;

  try {
    // Acquire lock
    lock = await acquireJobLock(jobName, ttlMs);
    if (!lock) {
      return null;  // Another server is running this job
    }

    // Execute job
    const result = await jobFn();
    return result;
  } finally {
    // Always release lock
    if (lock) {
      await releaseJobLock(lock);
    }
  }
}

/**
 * Check if a job lock currently exists (for monitoring/debugging)
 *
 * @param jobName - Name of the job to check
 * @returns true if lock is held, false otherwise
 */
export async function isJobLockHeld(jobName: string): Promise<boolean> {
  try {
    const exists = await redisClient.exists(`job:${jobName}`);
    return exists === 1;
  } catch (error) {
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
export async function forceReleaseJobLock(jobName: string): Promise<void> {
  try {
    await redisClient.del(`job:${jobName}`);
    console.log(`🔓 Force released lock for job: ${jobName}`);
  } catch (error) {
    console.error(`Failed to force release lock for ${jobName}:`, error);
  }
}

/**
 * Get list of all active job locks (for monitoring)
 *
 * @returns Array of job names with active locks
 */
export async function getActiveJobLocks(): Promise<string[]> {
  try {
    const keys = await redisClient.keys('job:*');
    return keys.map((key: string) => key.replace('job:', ''));
  } catch (error) {
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
