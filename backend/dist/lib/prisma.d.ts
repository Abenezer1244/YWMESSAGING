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
/**
 * Get or create the Prisma singleton instance
 * Ensures only ONE database connection pool for the entire application
 */
export declare function getPrismaClient(): PrismaClient;
/**
 * Singleton instance - use this import everywhere
 * ✅ Single connection pool: prevents exhaustion
 * ✅ Proper lifecycle: handles disconnect gracefully
 * ✅ Type-safe: full TypeScript support
 */
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * Graceful shutdown handler
 * Called on app termination to close database connections
 */
export declare function disconnectPrisma(): Promise<void>;
/**
 * Health check for database connectivity
 * Returns true if database is accessible
 */
export declare function checkDatabaseHealth(): Promise<boolean>;
/**
 * Export type for use in service/controller definitions
 */
export type { PrismaClient };
//# sourceMappingURL=prisma.d.ts.map