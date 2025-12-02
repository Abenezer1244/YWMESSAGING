/**
 * Read Replicas Configuration & Routing
 *
 * Implements intelligent database routing for read/write separation:
 * - Write operations route to primary database
 * - Read operations distribute across replicas (round-robin)
 * - Automatic failover to primary if replica unavailable
 * - Connection health monitoring
 * - Transparent failover with zero application changes
 * - Backward compatible with single-database setup
 *
 * Environment Setup:
 * ```
 * DATABASE_URL=postgresql://user:pass@primary-host/db?connection_limit=30
 * DATABASE_READ_REPLICAS=postgresql://user:pass@replica1-host/db?connection_limit=30,postgresql://user:pass@replica2-host/db?connection_limit=30
 * DATABASE_REPLICA_FAILOVER_THRESHOLD=3   # Failed attempts before marking unhealthy
 * DATABASE_REPLICA_HEALTH_CHECK_INTERVAL=30000  # Health check interval in ms
 * ```
 *
 * Usage:
 * ```typescript
 * import { getWriteClient, getReadClient } from '../utils/read-replicas.js';
 *
 * // Write operations - always uses primary
 * await getWriteClient().user.create({ data: { ... } });
 *
 * // Read operations - distributes across replicas
 * const user = await getReadClient().user.findUnique({ where: { id: '123' } });
 *
 * // Health check
 * const status = await checkReplicaHealth();
 * console.log(`Active replicas: ${status.healthyReplicas}/${status.totalReplicas}`);
 * ```
 */
import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
// Singleton instances
let primaryClient = null;
let readClients = new Map();
let replicaHealth = new Map();
let currentReadIndex = 0;
// Configuration
const FAILOVER_THRESHOLD = parseInt(process.env.DATABASE_REPLICA_FAILOVER_THRESHOLD || '3');
const HEALTH_CHECK_INTERVAL = parseInt(process.env.DATABASE_REPLICA_HEALTH_CHECK_INTERVAL || '30000');
/**
 * Initialize read replicas from environment configuration
 * Must be called once during application startup
 *
 * Environment variables:
 * - DATABASE_URL: Primary database URL (writes)
 * - DATABASE_READ_REPLICAS: Comma-separated replica URLs (reads)
 * - DATABASE_REPLICA_FAILOVER_THRESHOLD: Failure attempts before marking unhealthy (default: 3)
 * - DATABASE_REPLICA_HEALTH_CHECK_INTERVAL: Health check interval in ms (default: 30000)
 *
 * @returns Configuration summary
 *
 * @example
 * const config = initializeReadReplicas();
 * console.log(`Primary: ${config.primary}`);
 * console.log(`Read replicas: ${config.replicas.length}`);
 */
export function initializeReadReplicas() {
    const primaryUrl = process.env.DATABASE_URL;
    if (!primaryUrl) {
        throw new Error('DATABASE_URL is required');
    }
    // Initialize primary client
    primaryClient = new PrismaClient({
        log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
    });
    // Parse replica URLs
    const replicaUrls = (process.env.DATABASE_READ_REPLICAS || '')
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    // Initialize replica clients
    for (const replicaUrl of replicaUrls) {
        const client = new PrismaClient({
            datasources: {
                db: {
                    url: replicaUrl,
                },
            },
            log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
        });
        readClients.set(replicaUrl, client);
        replicaHealth.set(replicaUrl, {
            url: replicaUrl,
            healthy: true,
            failureCount: 0,
            lastChecked: Date.now(),
        });
    }
    logger.info(`Read replicas initialized`, {
        primary: primaryUrl,
        replicas: replicaUrls.length,
        failoverThreshold: FAILOVER_THRESHOLD,
        healthCheckInterval: HEALTH_CHECK_INTERVAL,
    });
    // Start health monitoring if replicas exist
    if (replicaUrls.length > 0) {
        startHealthMonitoring();
    }
    return {
        primary: primaryUrl,
        replicas: replicaUrls,
        failoverThreshold: FAILOVER_THRESHOLD,
        healthCheckInterval: HEALTH_CHECK_INTERVAL,
    };
}
/**
 * Get write client (always primary)
 *
 * @returns Prisma client connected to primary database
 *
 * @example
 * const user = await getWriteClient().user.create({
 *   data: { email: 'user@example.com' }
 * });
 */
export function getWriteClient() {
    if (!primaryClient) {
        throw new Error('Read replicas not initialized. Call initializeReadReplicas() first.');
    }
    return primaryClient;
}
/**
 * Get read client (round-robin across healthy replicas)
 * Falls back to primary if no replicas available
 *
 * @returns Prisma client connected to a read replica (or primary if no replicas)
 *
 * @example
 * const user = await getReadClient().user.findUnique({
 *   where: { id: '123' }
 * });
 */
export function getReadClient() {
    if (!primaryClient) {
        throw new Error('Read replicas not initialized. Call initializeReadReplicas() first.');
    }
    // If no replicas configured, return primary
    if (readClients.size === 0) {
        return primaryClient;
    }
    // Get list of healthy replicas
    const replicaUrls = Array.from(readClients.keys());
    const healthyReplicas = replicaUrls.filter((url) => {
        const status = replicaHealth.get(url);
        return status?.healthy ?? true;
    });
    // If all replicas unhealthy, return primary
    if (healthyReplicas.length === 0) {
        logger.warn('All read replicas unhealthy, falling back to primary');
        return primaryClient;
    }
    // Round-robin across healthy replicas
    const selectedUrl = healthyReplicas[currentReadIndex % healthyReplicas.length];
    currentReadIndex++;
    const client = readClients.get(selectedUrl);
    if (!client) {
        return primaryClient;
    }
    return client;
}
/**
 * Record failed operation on replica
 * Used internally to track replica health
 *
 * @param replicaUrl - Replica URL
 * @param error - Error that occurred
 *
 * @internal
 */
export function recordReplicaFailure(replicaUrl, error) {
    const status = replicaHealth.get(replicaUrl);
    if (!status) {
        return;
    }
    status.failureCount++;
    status.lastError = error.message;
    // Mark unhealthy if failures exceed threshold
    if (status.failureCount >= FAILOVER_THRESHOLD) {
        status.healthy = false;
        logger.warn(`Replica marked unhealthy after ${status.failureCount} failures`, {
            replica: replicaUrl,
            error: error.message,
        });
    }
}
/**
 * Record successful operation on replica
 * Used internally to track replica health
 *
 * @param replicaUrl - Replica URL
 *
 * @internal
 */
export function recordReplicaSuccess(replicaUrl) {
    const status = replicaHealth.get(replicaUrl);
    if (!status) {
        return;
    }
    // Reset failure count on success
    if (status.failureCount > 0) {
        status.failureCount = 0;
        logger.info(`Replica recovery detected`, { replica: replicaUrl });
    }
    status.lastChecked = Date.now();
}
/**
 * Check health of all replicas
 * Performs connectivity test to each replica
 *
 * @returns Health status of all replicas
 *
 * @example
 * const status = await checkReplicaHealth();
 * if (status.healthyReplicas < status.totalReplicas) {
 *   console.warn('Some replicas are unhealthy');
 * }
 */
export async function checkReplicaHealth() {
    const replicas = Array.from(replicaHealth.values());
    let primaryHealthy = true;
    // Check primary
    if (primaryClient) {
        try {
            await primaryClient.$queryRaw `SELECT 1`;
            primaryHealthy = true;
        }
        catch (error) {
            primaryHealthy = false;
            logger.error('Primary database unhealthy', error);
        }
    }
    // Check replicas
    for (const [replicaUrl, client] of readClients.entries()) {
        try {
            await client.$queryRaw `SELECT 1`;
            const status = replicaHealth.get(replicaUrl);
            if (status) {
                status.healthy = true;
                status.lastChecked = Date.now();
                status.failureCount = 0;
            }
        }
        catch (error) {
            recordReplicaFailure(replicaUrl, error);
        }
    }
    const healthyCount = Array.from(replicaHealth.values()).filter((s) => s.healthy).length;
    return {
        healthyReplicas: healthyCount,
        totalReplicas: replicaHealth.size,
        replicas: Array.from(replicaHealth.values()),
        primaryHealthy,
    };
}
/**
 * Get current replica status
 * Returns cached status without performing health checks
 *
 * @returns Current replica status
 *
 * @example
 * const status = getReplicaStatus();
 * console.log(`Health: ${status.healthyReplicas}/${status.totalReplicas}`);
 */
export function getReplicaStatus() {
    const healthyCount = Array.from(replicaHealth.values()).filter((s) => s.healthy).length;
    return {
        healthyReplicas: healthyCount,
        totalReplicas: replicaHealth.size,
        replicas: Array.from(replicaHealth.values()),
        primaryHealthy: true, // Assumed healthy if we're running
    };
}
/**
 * Gracefully disconnect all database clients
 * Must be called during application shutdown
 *
 * @returns Promise that resolves when all clients are disconnected
 *
 * @example
 * process.on('SIGTERM', async () => {
 *   await disconnectAllClients();
 *   process.exit(0);
 * });
 */
export async function disconnectAllClients() {
    try {
        if (primaryClient) {
            await primaryClient.$disconnect();
            logger.info('Primary client disconnected');
        }
        for (const [url, client] of readClients.entries()) {
            await client.$disconnect();
        }
        logger.info(`All ${readClients.size} read clients disconnected`);
    }
    catch (error) {
        logger.error('Error disconnecting clients', error);
    }
}
/**
 * Start periodic health monitoring of replicas
 * Automatically detects failures and recoveries
 *
 * @internal
 */
function startHealthMonitoring() {
    // Check health periodically
    setInterval(async () => {
        try {
            await checkReplicaHealth();
        }
        catch (error) {
            logger.debug('Health check error', { error: error.message });
        }
    }, HEALTH_CHECK_INTERVAL);
    logger.info(`Replica health monitoring started`, {
        interval: HEALTH_CHECK_INTERVAL,
    });
}
/**
 * Get detailed replica statistics
 * Useful for monitoring and debugging
 *
 * @returns Detailed replica information
 *
 * @example
 * const stats = getReplicaStats();
 * console.log(`Read distribution: ${stats.readDistribution}`);
 */
export function getReplicaStats() {
    const replicas = Array.from(replicaHealth.values());
    const healthy = replicas.filter((r) => r.healthy).length;
    const unhealthy = replicas.filter((r) => !r.healthy).length;
    return {
        configured: replicas.length,
        healthy,
        unhealthy,
        readDistribution: `${healthy} healthy / ${unhealthy} unhealthy`,
        details: replicas,
    };
}
export default {
    initializeReadReplicas,
    getWriteClient,
    getReadClient,
    checkReplicaHealth,
    getReplicaStatus,
    disconnectAllClients,
    recordReplicaFailure,
    recordReplicaSuccess,
    getReplicaStats,
};
//# sourceMappingURL=read-replicas.js.map