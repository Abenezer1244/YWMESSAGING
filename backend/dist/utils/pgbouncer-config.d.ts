/**
 * PgBouncer Connection Pool Configuration
 *
 * Implements intelligent connection pooling strategies with automatic sizing
 * and performance monitoring for production database connections.
 *
 * Connection Pooling Modes:
 * - session: One connection per client session (default, simplest)
 * - transaction: One connection per transaction (recommended for high concurrency)
 * - statement: One connection per statement (maximum concurrency, requires AUTOCOMMIT)
 *
 * Usage:
 * ```typescript
 * import { getPoolConfig, calculatePoolSize, validatePoolHealth } from '../utils/pgbouncer-config.js';
 *
 * // Get recommended pool configuration
 * const config = getPoolConfig({
 *   mode: 'transaction',
 *   minPoolSize: 5,
 *   maxPoolSize: 30
 * });
 *
 * // Calculate optimal pool size based on system resources
 * const poolSize = calculatePoolSize({ mode: 'transaction' });
 *
 * // Monitor pool health
 * const health = await validatePoolHealth();
 * ```
 */
interface PoolConfig {
    mode: 'session' | 'transaction' | 'statement';
    minPoolSize: number;
    maxPoolSize: number;
    reservePoolSize: number;
    reservePoolTimeoutAction: 'RETURN_ERROR' | 'WAIT';
    serverConnectTimeout: number;
    serverIdleTimeout: number;
    clientIdleTimeout: number;
    clientLoginTimeout: number;
    queryTimeout: number;
    idleInTransactionSessionTimeout: number;
    maxClientConnections: number;
    maxDbConnections: number;
    maxUserConnections: number;
    statementCache: number;
    connectionString: string;
}
interface PoolHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    activeConnections: number;
    idleConnections: number;
    waitingConnections: number;
    totalConnections: number;
    utilization: number;
    recommendedAction?: string;
}
interface PoolSizeOptions {
    mode: 'session' | 'transaction' | 'statement';
    cpuCores?: number;
    memoryMb?: number;
    expectedConcurrency?: number;
}
/**
 * Calculate optimal connection pool size based on system resources
 * Uses industry standard formulas for different pooling modes
 *
 * @param options - Configuration for pool size calculation
 * @returns Recommended pool size
 *
 * @example
 * const poolSize = calculatePoolSize({
 *   mode: 'transaction',
 *   cpuCores: 8
 * });
 * // Returns: 16-32 connections for high concurrency
 */
export declare function calculatePoolSize(options: PoolSizeOptions): {
    min: number;
    max: number;
};
/**
 * Get production-ready PgBouncer configuration
 *
 * @param overrides - Override default configuration
 * @returns Complete pool configuration
 *
 * @example
 * const config = getPoolConfig({
 *   mode: 'transaction',
 *   maxPoolSize: 50
 * });
 */
export declare function getPoolConfig(overrides?: Partial<PoolConfig>): PoolConfig;
/**
 * Generate PgBouncer configuration INI format
 * For use with external PgBouncer service
 *
 * @param config - Pool configuration
 * @returns INI format configuration string
 *
 * @example
 * const iniConfig = generatePgbouncerIni(config);
 * fs.writeFileSync('/etc/pgbouncer/pgbouncer.ini', iniConfig);
 */
export declare function generatePgbouncerIni(config: PoolConfig): string;
/**
 * Generate Docker Compose configuration for PgBouncer
 * Useful for containerized deployments
 *
 * @param config - Pool configuration
 * @param postgresHost - PostgreSQL host address
 * @returns Docker Compose YAML section
 *
 * @example
 * const dockerConfig = generateDockerCompose(config, 'postgres.example.com');
 */
export declare function generateDockerCompose(config: PoolConfig, postgresHost: string): string;
/**
 * Validate connection pool health
 * Checks pool utilization and provides recommendations
 *
 * @param activeConnections - Number of active connections
 * @param maxPoolSize - Maximum pool size
 * @returns Health status with recommendations
 *
 * @example
 * const health = validatePoolHealth(25, 30);
 * if (health.status === 'degraded') {
 *   console.warn(health.recommendedAction);
 * }
 */
export declare function validatePoolHealth(activeConnections: number, maxPoolSize: number, idleConnections?: number, waitingConnections?: number): PoolHealth;
/**
 * Get environment variables for connection pooling
 * Recommended DATABASE_URL configuration
 *
 * @param host - Database host
 * @param port - Database port
 * @param dbname - Database name
 * @param username - Database username
 * @param password - Database password
 * @returns Properly formatted DATABASE_URL
 *
 * @example
 * const dbUrl = getConnectionString(
 *   'postgres.render.com',
 *   5432,
 *   'mydb',
 *   'user',
 *   'password'
 * );
 * // postgresql://user:password@postgres.render.com:5432/mydb?connection_limit=30&pool_timeout=45
 */
export declare function getConnectionString(host: string, port: number, dbname: string, username: string, password: string, options?: {
    connectionLimit?: number;
    poolTimeout?: number;
}): string;
/**
 * Connection pool statistics
 * For monitoring and alerting
 */
export interface PoolStats {
    timestamp: number;
    activeConnections: number;
    idleConnections: number;
    totalConnections: number;
    maxConnections: number;
    utilization: number;
    queriesPerSecond: number;
    averageQueryTime: number;
    slowQueries: number;
}
/**
 * Log pool configuration for debugging
 */
export declare function logPoolConfiguration(config: PoolConfig): void;
/**
 * Get optimal connection pool configuration for current environment
 */
export declare function getOptimalPoolConfig(): PoolConfig;
declare const _default: {
    calculatePoolSize: typeof calculatePoolSize;
    getPoolConfig: typeof getPoolConfig;
    generatePgbouncerIni: typeof generatePgbouncerIni;
    generateDockerCompose: typeof generateDockerCompose;
    validatePoolHealth: typeof validatePoolHealth;
    getConnectionString: typeof getConnectionString;
    logPoolConfiguration: typeof logPoolConfiguration;
    getOptimalPoolConfig: typeof getOptimalPoolConfig;
};
export default _default;
//# sourceMappingURL=pgbouncer-config.d.ts.map