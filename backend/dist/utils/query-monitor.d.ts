/**
 * Database Query Monitoring and Slow Query Detection
 *
 * Monitors Prisma query execution times and logs slow queries for optimization.
 * Slow query threshold: 100ms (configurable)
 *
 * Features:
 * - Automatic query duration tracking
 * - Slow query detection and logging
 * - Query statistics collection
 * - Performance metrics aggregation
 * - Integration with logger for structured output
 */
import { PrismaClient } from '@prisma/client';
interface QueryMetrics {
    totalQueries: number;
    slowQueries: number;
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
    queryDurations: number[];
}
/**
 * Initialize query monitoring for Prisma client
 * Must be called immediately after creating PrismaClient instance
 *
 * Usage:
 * ```typescript
 * const prisma = new PrismaClient();
 * initializeQueryMonitoring(prisma);
 * ```
 */
export declare function initializeQueryMonitoring(prisma: PrismaClient): void;
/**
 * Get current query metrics
 */
export declare function getQueryMetrics(): QueryMetrics;
/**
 * Reset query metrics
 */
export declare function resetQueryMetrics(): void;
/**
 * Get slow query percentage
 */
export declare function getSlowQueryPercentage(): number;
/**
 * Get query performance percentiles
 */
export declare function getQueryPercentiles(): {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
};
/**
 * Get database health status
 * Returns 'healthy' if slow query percentage < 5%
 * Returns 'degraded' if 5-10%
 * Returns 'unhealthy' if > 10%
 */
export declare function getDatabaseHealth(): 'healthy' | 'degraded' | 'unhealthy';
export {};
//# sourceMappingURL=query-monitor.d.ts.map