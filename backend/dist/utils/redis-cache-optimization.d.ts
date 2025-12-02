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
export declare function prefixCacheKey(namespace: string, id: string, suffix?: string): string;
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
export declare function withCache<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T>;
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
export declare function createCachedFunction<T, Args extends any[]>(fetcher: (...args: Args) => Promise<T>, keyBuilder: (...args: Args) => string, options?: CacheOptions): (...args: Args) => Promise<T>;
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
export declare function setupCacheWarming<T>(key: string, fetcher: () => Promise<T>, options?: {
    interval?: number;
    ttl?: number;
    namespace?: string;
}): (() => void) | null;
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
export declare function cascadeInvalidate(key: string, dependentKeys?: string[]): Promise<void>;
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
export declare function broadcastInvalidate(pattern: string, channel?: string): Promise<void>;
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
export declare function subscribeCacheInvalidation(channel: string, handler: (pattern: string) => Promise<void>): Promise<() => Promise<void>>;
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
export declare function getCacheStatistics(): Promise<CacheStats>;
declare const _default: {
    prefixCacheKey: typeof prefixCacheKey;
    withCache: typeof withCache;
    createCachedFunction: typeof createCachedFunction;
    setupCacheWarming: typeof setupCacheWarming;
    cascadeInvalidate: typeof cascadeInvalidate;
    broadcastInvalidate: typeof broadcastInvalidate;
    subscribeCacheInvalidation: typeof subscribeCacheInvalidation;
    getCacheStatistics: typeof getCacheStatistics;
};
export default _default;
//# sourceMappingURL=redis-cache-optimization.d.ts.map