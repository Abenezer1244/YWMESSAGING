/**
 * PgBouncer Integration & Health Monitoring
 *
 * Runtime management of connection pool with automatic scaling recommendations,
 * health monitoring, and performance tracking.
 *
 * Features:
 * - Real-time connection pool statistics
 * - Automatic scaling recommendations
 * - Connection leak detection
 * - Slow client detection
 * - Pool health tracking
 * - Performance metrics
 *
 * Usage:
 * ```typescript
 * import { initializePoolMonitoring, getPoolMetrics, getHealthStatus } from '../utils/pgbouncer-integration.js';
 *
 * // Start monitoring on application startup
 * initializePoolMonitoring({ interval: 30000 });
 *
 * // Get current pool metrics
 * const metrics = await getPoolMetrics();
 * console.log(`Active connections: ${metrics.activeConnections}/${metrics.maxConnections}`);
 *
 * // Check pool health
 * const health = getHealthStatus();
 * if (health.recommendations.length > 0) {
 *   console.warn(health.recommendations);
 * }
 * ```
 */
interface PoolMetrics {
    timestamp: number;
    activeConnections: number;
    idleConnections: number;
    totalConnections: number;
    maxConnections: number;
    utilization: number;
    waitingRequests: number;
    connectionLeaks: number;
    averageConnectionLifetime: number;
    peakConnections: number;
}
interface PoolHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    metrics: PoolMetrics;
    recommendations: string[];
    timestamp: number;
}
interface MonitoringConfig {
    enabled: boolean;
    interval: number;
    thresholds: {
        utilizationWarning: number;
        utilizationCritical: number;
        connectionLeakThreshold: number;
        idleTimeoutWarning: number;
    };
}
/**
 * Initialize pool monitoring with periodic health checks
 *
 * @param config - Monitoring configuration
 * @returns Cleanup function to stop monitoring
 *
 * @example
 * const cleanup = initializePoolMonitoring({
 *   interval: 60000,
 *   thresholds: { utilizationWarning: 75 }
 * });
 *
 * // Later: cleanup();
 */
export declare function initializePoolMonitoring(config?: Partial<MonitoringConfig>): (() => void);
/**
 * Collect current connection pool metrics
 * Requires active database connection to query statistics
 *
 * @returns Current pool metrics
 *
 * @example
 * const metrics = await collectPoolMetrics();
 * console.log(`Utilization: ${metrics.utilization}%`);
 */
export declare function collectPoolMetrics(): Promise<PoolMetrics>;
/**
 * Get current pool health status with recommendations
 *
 * @returns Health status and recommendations
 *
 * @example
 * const health = getHealthStatus();
 * if (health.status !== 'healthy') {
 *   console.warn(health.recommendations.join('\n'));
 * }
 */
export declare function getHealthStatus(): PoolHealthStatus;
/**
 * Get pool metrics with trend analysis
 *
 * @returns Metrics with historical trend
 *
 * @example
 * const metrics = getPoolMetrics();
 * console.log(`Utilization trend: ${metrics.utilizationTrend}%`);
 */
export declare function getPoolMetrics(): PoolMetrics & {
    utilizationTrend: number;
};
/**
 * Get scaling recommendations based on current metrics
 *
 * @returns Recommended configuration adjustments
 *
 * @example
 * const recommendation = getScalingRecommendation();
 * if (recommendation.action === 'increase') {
 *   console.log(`Recommend increasing pool from ${recommendation.current} to ${recommendation.recommended}`);
 * }
 */
export declare function getScalingRecommendation(): {
    action: 'none' | 'increase' | 'decrease';
    current: number;
    recommended: number;
    reason: string;
};
/**
 * Reset pool monitoring state
 * Useful for testing
 *
 * @internal
 */
export declare function resetPoolMonitoring(): void;
/**
 * Get pool statistics summary
 * Useful for dashboards and alerts
 */
export declare function getPoolStatsSummary(): {
    current: PoolMetrics;
    average: Partial<PoolMetrics>;
    peak: Partial<PoolMetrics>;
    min: Partial<PoolMetrics>;
};
declare const _default: {
    initializePoolMonitoring: typeof initializePoolMonitoring;
    collectPoolMetrics: typeof collectPoolMetrics;
    getHealthStatus: typeof getHealthStatus;
    getPoolMetrics: typeof getPoolMetrics;
    getScalingRecommendation: typeof getScalingRecommendation;
    getPoolStatsSummary: typeof getPoolStatsSummary;
    resetPoolMonitoring: typeof resetPoolMonitoring;
};
export default _default;
//# sourceMappingURL=pgbouncer-integration.d.ts.map