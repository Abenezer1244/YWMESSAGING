/**
 * ✅ PRODUCTION: PrismaClient Singleton
 *
 * CRITICAL for production:
 * - Single shared instance across all services/controllers
 * - Prevents connection pool exhaustion
 * - Enables proper connection lifecycle management
 * - Implements graceful shutdown
 *
 * Connection Pool Config:
 * - connection_limit=30 (vs default 2-5)
 * - pool_timeout=45 for graceful timeout
 * - Shared across all database operations
 */
import { PrismaClient } from '@prisma/client';
import { initializeQueryMonitoring } from '../utils/query-monitor.js';
// Global variable to hold the singleton
let prismaCacheInstance;
/**
 * Get or create the Prisma singleton instance
 * Ensures only ONE database connection pool for the entire application
 */
export function getPrismaClient() {
    if (prismaCacheInstance) {
        return prismaCacheInstance;
    }
    prismaCacheInstance = new PrismaClient({
        // Enable query logging in development
        log: process.env.NODE_ENV === 'production'
            ? ['error', 'warn']
            : ['query', 'error', 'warn', 'info'],
    });
    // ✅ Initialize query monitoring for slow query detection
    initializeQueryMonitoring(prismaCacheInstance);
    return prismaCacheInstance;
}
/**
 * Singleton instance - use this import everywhere
 * ✅ Single connection pool: prevents exhaustion
 * ✅ Proper lifecycle: handles disconnect gracefully
 * ✅ Type-safe: full TypeScript support
 */
export const prisma = getPrismaClient();
/**
 * Graceful shutdown handler
 * Called on app termination to close database connections
 */
export async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
        console.log('✅ Prisma disconnected gracefully');
    }
}
/**
 * Health check for database connectivity
 * Returns true if database is accessible
 */
export async function checkDatabaseHealth() {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
}
//# sourceMappingURL=prisma.js.map