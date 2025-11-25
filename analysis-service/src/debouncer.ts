/**
 * Debouncer Service
 *
 * Delays analysis requests and coalesces multiple changes
 * into a single analysis run. Waits for user to stop typing
 * before triggering analysis (default: 2 seconds).
 */

import { logger } from './logger';

/**
 * Debounce callback
 */
export type DebounceCallback = (key: string) => Promise<void>;

/**
 * Debounce entry
 */
interface DebounceEntry {
  timeout: NodeJS.Timeout;
  count: number;
  firstTime: number;
}

/**
 * Debouncer service
 */
export class Debouncer {
  private static instance: Debouncer;
  private pendingCallbacks: Map<string, DebounceEntry> = new Map();
  private readonly delayMs: number;

  /**
   * Constructor
   */
  private constructor(delayMs: number = 2000) {
    this.delayMs = delayMs;
    logger.debug('Debouncer initialized', { delayMs });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(delayMs?: number): Debouncer {
    if (!Debouncer.instance) {
      Debouncer.instance = new Debouncer(delayMs);
    }
    return Debouncer.instance;
  }

  /**
   * Debounce a callback
   */
  public async debounce(key: string, callback: DebounceCallback): Promise<void> {
    try {
      // Clear existing timeout if any
      const existing = this.pendingCallbacks.get(key);
      if (existing) {
        clearTimeout(existing.timeout);
        existing.count++;
      }

      // Create new timeout
      const entry: DebounceEntry = {
        timeout: setTimeout(async () => {
          try {
            logger.debug('Debounce timeout triggered', {
              key,
              changes: existing?.count || 1,
              elapsedMs: Date.now() - (existing?.firstTime || Date.now()),
            });

            // Execute callback
            await callback(key);

            // Remove from pending
            this.pendingCallbacks.delete(key);
          } catch (error) {
            logger.error('Error in debounce callback', error instanceof Error ? error : new Error(String(error)));
            this.pendingCallbacks.delete(key);
          }
        }, this.delayMs),
        count: existing ? existing.count + 1 : 1,
        firstTime: existing?.firstTime || Date.now(),
      };

      this.pendingCallbacks.set(key, entry);

      logger.debug('Debounce scheduled', {
        key,
        delayMs: this.delayMs,
        pending: this.pendingCallbacks.size,
      });
    } catch (error) {
      logger.error('Error in debounce', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Cancel pending debounce
   */
  public cancel(key: string): void {
    try {
      const entry = this.pendingCallbacks.get(key);
      if (entry) {
        clearTimeout(entry.timeout);
        this.pendingCallbacks.delete(key);
        logger.debug('Debounce cancelled', { key });
      }
    } catch (error) {
      logger.error('Error cancelling debounce', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Cancel all pending debounces
   */
  public cancelAll(): void {
    try {
      this.pendingCallbacks.forEach((entry) => {
        clearTimeout(entry.timeout);
      });
      this.pendingCallbacks.clear();
      logger.debug('All debounces cancelled');
    } catch (error) {
      logger.error('Error cancelling all debounces', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Flush all pending debounces immediately
   */
  public async flushAll(callback: (keys: string[]) => Promise<void>): Promise<void> {
    try {
      const keys = Array.from(this.pendingCallbacks.keys());

      // Cancel all timeouts
      this.pendingCallbacks.forEach((entry) => {
        clearTimeout(entry.timeout);
      });
      this.pendingCallbacks.clear();

      if (keys.length > 0) {
        logger.debug('Flushing debounces', { count: keys.length });
        await callback(keys);
      }
    } catch (error) {
      logger.error('Error flushing debounces', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get pending count
   */
  public getPendingCount(): number {
    return this.pendingCallbacks.size;
  }

  /**
   * Get delay in milliseconds
   */
  public getDelayMs(): number {
    return this.delayMs;
  }

  /**
   * Check if key is pending
   */
  public isPending(key: string): boolean {
    return this.pendingCallbacks.has(key);
  }

  /**
   * Get stats
   */
  public getStats(): {
    pending: number;
    delayMs: number;
  } {
    return {
      pending: this.pendingCallbacks.size,
      delayMs: this.delayMs,
    };
  }
}

/**
 * Export singleton
 */
export const debouncer = Debouncer.getInstance();
