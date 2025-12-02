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
interface ReplicaHealthStatus {
    url: string;
    healthy: boolean;
    failureCount: number;
    lastChecked: number;
    lastError?: string;
}
interface ReplicaStatus {
    healthyReplicas: number;
    totalReplicas: number;
    replicas: ReplicaHealthStatus[];
    primaryHealthy: boolean;
}
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
export declare function initializeReadReplicas(): {
    primary: string;
    replicas: string[];
    failoverThreshold: number;
    healthCheckInterval: number;
};
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
export declare function getWriteClient(): PrismaClient;
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
export declare function getReadClient(): PrismaClient;
/**
 * Record failed operation on replica
 * Used internally to track replica health
 *
 * @param replicaUrl - Replica URL
 * @param error - Error that occurred
 *
 * @internal
 */
export declare function recordReplicaFailure(replicaUrl: string, error: Error): void;
/**
 * Record successful operation on replica
 * Used internally to track replica health
 *
 * @param replicaUrl - Replica URL
 *
 * @internal
 */
export declare function recordReplicaSuccess(replicaUrl: string): void;
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
export declare function checkReplicaHealth(): Promise<ReplicaStatus>;
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
export declare function getReplicaStatus(): ReplicaStatus;
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
export declare function disconnectAllClients(): Promise<void>;
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
export declare function getReplicaStats(): {
    configured: number;
    healthy: number;
    unhealthy: number;
    readDistribution: string;
    details: ReplicaHealthStatus[];
};
declare const _default: {
    initializeReadReplicas: typeof initializeReadReplicas;
    getWriteClient: typeof getWriteClient;
    getReadClient: typeof getReadClient;
    checkReplicaHealth: typeof checkReplicaHealth;
    getReplicaStatus: typeof getReplicaStatus;
    disconnectAllClients: typeof disconnectAllClients;
    recordReplicaFailure: typeof recordReplicaFailure;
    recordReplicaSuccess: typeof recordReplicaSuccess;
    getReplicaStats: typeof getReplicaStats;
};
export default _default;
//# sourceMappingURL=read-replicas.d.ts.map