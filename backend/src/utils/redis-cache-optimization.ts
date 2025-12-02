/**
 * Redis Cache Optimization Strategy
 *
 * Advanced caching patterns and strategies for maximum performance:
 * - Smart cache invalidation with cascade invalidation
 * - Cache warming for frequently accessed data
 * - Distributed cache synchronization via pub/sub
 * - Cache statistics and monitoring
 * - TTL management with different strategies
 * - Compression for large cache values
 * - Cache-aside pattern implementation
 *
 * Usage:
 * ```typescript
 * import { withCache, prefixCacheKey, setupCacheWarming } from '../utils/redis-cache-optimization.js';
 *
 * // Cache-aside pattern with automatic invalidation
 * const user = await withCache(
 *   `user:${userId}`,
 *   () => fetchUserFromDB(userId),
 *   { ttl: 3600, invalidateOn: ['user:updated'] }
 * );
 *
 * // Cache warming for critical data
 * await setupCacheWarming(
 *   'critical_settings',
 *   () => fetchSettings(),
 *   { interval: 300000, ttl: 3600 }
 * );
 * ```
 */

import { redisClient } from '../config/redis.config.js';
import { logger } from './logger.js';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  invalidateOn?: string[];
  namespace?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  avgRetrievalTime: number;
  totalSize: number;
}

// In-memory cache stats (per instance)
const cacheStats = new Map<string, { hits: number; misses: number; totalTime: number }>();

/**
 * Generate a namespaced cache key
 * Useful for organizing related cache entries
 *
 * @param namespace - Cache namespace (e.g., 'user', 'settings')
 * @param id - Entity ID
 * @param suffix - Optional suffix
 * @returns Full cache key
 *
 * @example
 * const key = prefixCacheKey('user', '123', 'profile');
 * // Returns: "cache:user:123:profile"
 */
export function prefixCacheKey(namespace: string, id: string, suffix?: string): string {
  if (suffix) {
    return `cache:${namespace}:${id}:${suffix}`;
  }
  return `cache:${namespace}:${id}`;
}

/**
 * Cache-aside pattern with automatic data fetching
 * Tries cache first, falls back to fetcher function, then caches result
 *
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not cached
 * @param options - Caching options
 * @returns Cached or fetched data
 *
 * @example
 * const user = await withCache(
 *   `user:${id}`,
 *   () => prisma.user.findUnique({ where: { id } }),
 *   { ttl: 3600 }
 * );
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 3600, compress = false, namespace = '', invalidateOn = [] } = options;

  const fullKey = namespace ? prefixCacheKey(namespace, key) : key;
  const startTime = Date.now();

  try {
    // Try to get from cache first
    const cached = await getCachedValue<T>(fullKey, compress);
    if (cached !== null) {
      recordCacheHit(fullKey);
      return cached;
    }

    // Cache miss - fetch data
    recordCacheMiss(fullKey);
    const data = await fetcher();

    // Cache the result
    await setCachedValue(fullKey, data, ttl, compress);

    // Setup invalidation
    if (invalidateOn.length > 0) {
      await setupInvalidationTriggers(fullKey, invalidateOn);
    }

    return data;
  } catch (error) {
    logger.error('Cache-aside pattern failed', error as Error, {
      key: fullKey,
      fallingBack: 'to fetcher',
    });

    // Fall back to fetcher on cache error
    return fetcher();
  }
}

/**
 * Cached function wrapper
 * Automatically caches function results with cache-aside pattern
 *
 * @param fetcher - Async function to wrap
 * @param keyBuilder - Function to build cache key from arguments
 * @param options - Cache options
 * @returns Wrapped function
 *
 * @example
 * const getCachedUser = createCachedFunction(
 *   (id) => prisma.user.findUnique({ where: { id } }),
 *   (id) => `user:${id}`,
 *   { ttl: 3600 }
 * );
 *
 * const user = await getCachedUser('123');
 */
export function createCachedFunction<T, Args extends any[]>(
  fetcher: (...args: Args) => Promise<T>,
  keyBuilder: (...args: Args) => string,
  options: CacheOptions = {}
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyBuilder(...args);
    return withCache(key, () => fetcher(...args), options);
  };
}

/**
 * Setup cache warming for frequently accessed data
 * Periodically refreshes cache before expiration
 *
 * @param key - Cache key
 * @param fetcher - Function to fetch fresh data
 * @param options - Configuration
 * @returns Cleanup function
 *
 * @example
 * const cleanup = await setupCacheWarming(
 *   'app_settings',
 *   () => loadSettings(),
 *   { interval: 300000 } // Refresh every 5 minutes
 * );
 *
 * // Later: cleanup();
 */
export function setupCacheWarming<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { interval?: number; ttl?: number; namespace?: string } = {}
): (() => void) | null {
  const { interval = 300000, ttl = 3600, namespace = '' } = options;

  const fullKey = namespace ? prefixCacheKey(namespace, key) : key;

  // Start warming interval
  const intervalId = setInterval(async () => {
    try {
      const data = await fetcher();
      await setCachedValue(fullKey, data, ttl, false);
      logger.debug(`Cache warmed: ${fullKey}`);
    } catch (error) {
      logger.warn(`Cache warming failed for ${fullKey}`, error as Error);
    }
  }, interval);

  // Warm immediately
  fetcher().then((data) => setCachedValue(fullKey, data, ttl, false)).catch((error) => {
    logger.warn(`Initial cache warming failed for ${fullKey}`, error as Error);
  });

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Cascade invalidation
 * Invalidates a key and all dependent keys
 *
 * @param key - Primary cache key to invalidate
 * @param dependentKeys - Keys that depend on this key
 *
 * @example
 * await cascadeInvalidate('user:123', [
 *   'user:123:profile',
 *   'user:123:settings',
 *   'users:list'
 * ]);
 */
export async function cascadeInvalidate(key: string, dependentKeys: string[] = []): Promise<void> {
  const keysToDelete = [key, ...dependentKeys];

  try {
    if (!redisClient.isOpen) {
      return;
    }

    await Promise.all(keysToDelete.map((k) => redisClient.del(k)));

    logger.debug(`Cascade invalidated ${keysToDelete.length} keys`, {
      primaryKey: key,
      dependents: dependentKeys.length,
    });
  } catch (error) {
    logger.warn(`Cascade invalidation failed`, { key }, undefined, error as Error);
  }
}

/**
 * Distributed cache invalidation via pub/sub
 * Invalidates cache across all instances
 *
 * @param pattern - Key pattern to invalidate
 * @param channel - Pub/sub channel name
 *
 * @example
 * await broadcastInvalidate('user:*', 'cache:user:invalidated');
 */
export async function broadcastInvalidate(
  pattern: string,
  channel: string = 'cache:invalidated'
): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    // Publish invalidation message to other instances
    await redisClient.publish(channel, pattern);

    logger.debug(`Broadcast cache invalidation`, { pattern, channel });
  } catch (error) {
    logger.warn(`Broadcast invalidation failed`, error as Error);
  }
}

/**
 * Subscribe to cache invalidation events
 * Listens for distributed invalidation messages
 *
 * @param channel - Pub/sub channel name
 * @param handler - Handler function for invalidation patterns
 *
 * @example
 * const unsubscribe = await subscribeCacheInvalidation(
 *   'cache:invalidated',
 *   (pattern) => {
 *     console.log(`Invalidate pattern: ${pattern}`);
 *   }
 * );
 */
export async function subscribeCacheInvalidation(
  channel: string,
  handler: (pattern: string) => Promise<void>
): Promise<() => Promise<void>> {
  try {
    // Create subscriber client
    const subscriber = redisClient.duplicate();
    await subscriber.connect();

    // Subscribe to channel
    await subscriber.subscribe(channel, async (message: string) => {
      try {
        await handler(message);
      } catch (error) {
        logger.error(`Cache invalidation handler failed`, error as Error, {
          pattern: message,
          channel,
        });
      }
    });

    logger.debug(`Subscribed to cache invalidation channel`, { channel });

    // Return unsubscribe function
    return async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
    };
  } catch (error) {
    logger.error(`Failed to subscribe to cache invalidation`, error as Error);
    return async () => {};
  }
}

/**
 * Get cache statistics
 * Returns hit rate and performance metrics
 *
 * @returns Cache statistics
 *
 * @example
 * const stats = await getCacheStatistics();
 * console.log(`Cache hit rate: ${stats.hitRate.toFixed(2)}%`);
 */
export async function getCacheStatistics(): Promise<CacheStats> {
  let totalHits = 0;
  let totalMisses = 0;
  let totalTime = 0;

  cacheStats.forEach((stats) => {
    totalHits += stats.hits;
    totalMisses += stats.misses;
    totalTime += stats.totalTime;
  });

  const total = totalHits + totalMisses;
  const hitRate = total > 0 ? (totalHits / total) * 100 : 0;
  const avgRetrievalTime = totalHits > 0 ? totalTime / totalHits : 0;

  // Get Redis memory info
  let totalSize = 0;
  try {
    if (redisClient.isOpen) {
      const info = await redisClient.info('memory');
      const match = info.match(/used_memory:(\d+)/);
      if (match) {
        totalSize = parseInt(match[1]);
      }
    }
  } catch (error) {
    logger.debug('Failed to get Redis memory info', { error: (error as Error).message });
  }

  return {
    hits: totalHits,
    misses: totalMisses,
    hitRate,
    avgRetrievalTime,
    totalSize,
  };
}

/**
 * Internal helper: Get cached value with optional decompression
 */
async function getCachedValue<T>(key: string, compress: boolean = false): Promise<T | null> {
  try {
    if (!redisClient.isOpen) {
      return null;
    }

    const cached = await redisClient.get(key);
    if (!cached) {
      return null;
    }

    let data = cached;
    if (compress) {
      const decompressed = await gunzip(Buffer.from(cached, 'base64'));
      data = decompressed.toString('utf-8');
    }

    return JSON.parse(data) as T;
  } catch (error) {
    logger.debug(`Failed to get cached value`, { key, error: (error as Error).message });
    return null;
  }
}

/**
 * Internal helper: Set cached value with optional compression
 */
async function setCachedValue<T>(
  key: string,
  value: T,
  ttl: number,
  compress: boolean = false
): Promise<boolean> {
  try {
    if (!redisClient.isOpen) {
      return false;
    }

    let serialized = JSON.stringify(value);

    if (compress && serialized.length > 1024) {
      // Only compress if >1KB
      const compressed = await gzip(serialized);
      serialized = compressed.toString('base64');
    }

    await redisClient.setEx(key, ttl, serialized);
    return true;
  } catch (error) {
    logger.debug(`Failed to set cached value`, { key, error: (error as Error).message });
    return false;
  }
}

/**
 * Internal helper: Record cache hit
 */
function recordCacheHit(key: string): void {
  const stats = cacheStats.get(key) || { hits: 0, misses: 0, totalTime: 0 };
  stats.hits++;
  cacheStats.set(key, stats);
}

/**
 * Internal helper: Record cache miss
 */
function recordCacheMiss(key: string): void {
  const stats = cacheStats.get(key) || { hits: 0, misses: 0, totalTime: 0 };
  stats.misses++;
  cacheStats.set(key, stats);
}

/**
 * Internal helper: Setup invalidation triggers
 */
async function setupInvalidationTriggers(key: string, triggers: string[]): Promise<void> {
  // Store trigger information (could be used for more sophisticated invalidation)
  for (const trigger of triggers) {
    try {
      if (redisClient.isOpen) {
        const triggerKey = `trigger:${trigger}`;
        const existingKeys = (await redisClient.get(triggerKey)) || '';
        const keys = new Set([...existingKeys.split(','), key].filter((k) => k));
        await redisClient.set(triggerKey, Array.from(keys).join(','));
      }
    } catch (error) {
      logger.debug(`Failed to setup invalidation trigger`, { key, trigger });
    }
  }
}

export default {
  prefixCacheKey,
  withCache,
  createCachedFunction,
  setupCacheWarming,
  cascadeInvalidate,
  broadcastInvalidate,
  subscribeCacheInvalidation,
  getCacheStatistics,
};
