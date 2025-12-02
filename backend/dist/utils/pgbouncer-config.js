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
import os from 'os';
import { logger } from './logger.js';
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
export function calculatePoolSize(options) {
    const cpuCores = options.cpuCores || os.cpus().length;
    const memoryMb = options.memoryMb || (os.totalmem() / 1024 / 1024);
    const expectedConcurrency = options.expectedConcurrency || cpuCores * 4;
    let minSize = 0;
    let maxSize = 0;
    switch (options.mode) {
        case 'session':
            // Session mode: 1 connection per user session
            // Conservative: 2x CPU cores for background tasks
            minSize = Math.max(5, cpuCores);
            maxSize = Math.min(cpuCores * 3, Math.floor(memoryMb / 10));
            break;
        case 'transaction':
            // Transaction mode: 1 connection per transaction
            // Recommended formula: (core_count * 2) + effective_spindle_count
            // For cloud: 2x core count is safe baseline
            minSize = Math.max(10, cpuCores * 2);
            maxSize = Math.min(cpuCores * 4, Math.floor(memoryMb / 5), expectedConcurrency);
            break;
        case 'statement':
            // Statement mode: Maximum concurrency, 1 connection per statement
            // Highest overhead, use for very high concurrency (NOT recommended for most apps)
            minSize = Math.max(20, cpuCores * 4);
            maxSize = Math.min(cpuCores * 8, Math.floor(memoryMb / 2), expectedConcurrency * 2);
            break;
        default:
            throw new Error(`Unknown pool mode: ${options.mode}`);
    }
    // Ensure reasonable bounds
    minSize = Math.max(5, Math.min(minSize, 100));
    maxSize = Math.max(minSize + 5, Math.min(maxSize, 500));
    return { min: minSize, max: maxSize };
}
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
export function getPoolConfig(overrides = {}) {
    const poolSize = calculatePoolSize({
        mode: overrides.mode || 'transaction',
    });
    return {
        mode: 'transaction',
        minPoolSize: 10,
        maxPoolSize: 30,
        reservePoolSize: 5,
        reservePoolTimeoutAction: 'RETURN_ERROR',
        serverConnectTimeout: 15,
        serverIdleTimeout: 600, // 10 minutes
        clientIdleTimeout: 300, // 5 minutes
        clientLoginTimeout: 60,
        queryTimeout: 0, // No timeout (use application-level timeout)
        idleInTransactionSessionTimeout: 120, // 2 minutes
        maxClientConnections: 1000,
        maxDbConnections: 100,
        maxUserConnections: 0, // Unlimited
        statementCache: 5,
        connectionString: process.env.DATABASE_URL || '',
        ...overrides,
    };
}
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
export function generatePgbouncerIni(config) {
    const url = new URL(config.connectionString);
    const host = url.hostname;
    const port = url.port || '5432';
    const dbname = url.pathname.slice(1);
    const username = url.username;
    return `
;; PgBouncer Configuration
;; Auto-generated for production use

[databases]
${dbname} = host=${host} port=${port} dbname=${dbname}

[pgbouncer]
pool_mode = ${config.mode}
max_client_conn = ${config.maxClientConnections}
default_pool_size = ${Math.floor((config.minPoolSize + config.maxPoolSize) / 2)}
min_pool_size = ${config.minPoolSize}
reserve_pool_size = ${config.reservePoolSize}
reserve_pool_timeout = 3
max_db_connections = ${config.maxDbConnections}
max_user_connections = ${config.maxUserConnections}

server_lifetime = 3600
server_idle_timeout = ${config.serverIdleTimeout}
server_connect_timeout = ${config.serverConnectTimeout}
query_timeout = ${config.queryTimeout}
idle_in_transaction_session_timeout = ${config.idleInTransactionSessionTimeout}

client_idle_timeout = ${config.clientIdleTimeout}
client_login_timeout = ${config.clientLoginTimeout}

statement_cache_size = ${config.statementCache}

log_connections = 1
log_disconnections = 1
log_pooler_errors = 1

listen_port = 6432
listen_addr = 127.0.0.1

admin_users = ${username}
`;
}
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
export function generateDockerCompose(config, postgresHost) {
    return `
  pgbouncer:
    image: pgbouncer:latest
    environment:
      DATABASES_DEFAULT: "host=${postgresHost} port=5432"
      PGBOUNCER_POOL_MODE: ${config.mode}
      PGBOUNCER_MAX_CLIENT_CONN: ${config.maxClientConnections}
      PGBOUNCER_DEFAULT_POOL_SIZE: ${Math.floor((config.minPoolSize + config.maxPoolSize) / 2)}
      PGBOUNCER_MIN_POOL_SIZE: ${config.minPoolSize}
      PGBOUNCER_RESERVE_POOL_SIZE: ${config.reservePoolSize}
      PGBOUNCER_SERVER_LIFETIME: 3600
      PGBOUNCER_SERVER_IDLE_TIMEOUT: ${config.serverIdleTimeout}
      PGBOUNCER_CLIENT_IDLE_TIMEOUT: ${config.clientIdleTimeout}
    ports:
      - "6432:6432"
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "psql", "-U", "postgres", "-d", "postgres", "-c", "SELECT 1"]
      interval: 10s
      timeout: 5s
      retries: 5
`;
}
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
export function validatePoolHealth(activeConnections, maxPoolSize, idleConnections = 0, waitingConnections = 0) {
    const totalConnections = activeConnections + idleConnections;
    const utilization = (totalConnections / maxPoolSize) * 100;
    let status = 'healthy';
    let recommendedAction;
    if (utilization > 90) {
        status = 'unhealthy';
        recommendedAction = `Critical: Pool at ${utilization.toFixed(1)}% utilization. Increase max_pool_size or reduce concurrent connections.`;
    }
    else if (utilization > 75) {
        status = 'degraded';
        recommendedAction = `Warning: Pool at ${utilization.toFixed(1)}% utilization. Consider increasing max_pool_size.`;
    }
    else if (utilization < 20 && totalConnections > 0) {
        recommendedAction = `Info: Pool at ${utilization.toFixed(1)}% utilization. Consider reducing min_pool_size.`;
    }
    if (waitingConnections > 0) {
        status = 'degraded';
        recommendedAction = `${waitingConnections} clients waiting for connections. Increase pool size or reduce query time.`;
    }
    return {
        status,
        activeConnections,
        idleConnections,
        waitingConnections,
        totalConnections,
        utilization: Math.round(utilization),
        recommendedAction,
    };
}
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
export function getConnectionString(host, port, dbname, username, password, options = {}) {
    const { connectionLimit = 30, poolTimeout = 45 } = options;
    return `postgresql://${username}:${encodeURIComponent(password)}@${host}:${port}/${dbname}?connection_limit=${connectionLimit}&pool_timeout=${poolTimeout}`;
}
/**
 * Log pool configuration for debugging
 */
export function logPoolConfiguration(config) {
    logger.info('Connection Pool Configuration', {
        mode: config.mode,
        minPoolSize: config.minPoolSize,
        maxPoolSize: config.maxPoolSize,
        reservePoolSize: config.reservePoolSize,
        serverIdleTimeout: `${config.serverIdleTimeout}s`,
        clientIdleTimeout: `${config.clientIdleTimeout}s`,
        maxClientConnections: config.maxClientConnections,
        maxDbConnections: config.maxDbConnections,
    });
}
/**
 * Get optimal connection pool configuration for current environment
 */
export function getOptimalPoolConfig() {
    const poolSize = calculatePoolSize({ mode: 'transaction' });
    return getPoolConfig({
        mode: 'transaction',
        minPoolSize: poolSize.min,
        maxPoolSize: poolSize.max,
    });
}
export default {
    calculatePoolSize,
    getPoolConfig,
    generatePgbouncerIni,
    generateDockerCompose,
    validatePoolHealth,
    getConnectionString,
    logPoolConfiguration,
    getOptimalPoolConfig,
};
//# sourceMappingURL=pgbouncer-config.js.map