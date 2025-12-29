/**
 * ============================================================================
 * MULTI-TENANT PRISMA CLIENT MANAGER
 * ============================================================================
 *
 * Purpose:
 * - Create and manage Prisma clients for each tenant database
 * - Cache clients to avoid expensive reconnections
 * - Provide singleton registry database client
 * - Handle connection cleanup on shutdown
 *
 * Key Features:
 * - Connection pool per tenant (max 100 cached)
 * - LRU eviction for inactive tenants
 * - Automatic idle timeout (30 minutes)
 * - Graceful shutdown handler
 * - Error handling with retry logic
 *
 * Usage:
 * // In middleware
 * const tenantPrisma = await getTenantPrisma(tenantId);
 * req.prisma = tenantPrisma;
 *
 * // In services
 * export async function getMembers(tenantId: string, tenantPrisma: PrismaClient) {
 *   return tenantPrisma.member.findMany();
 * }
 * ============================================================================
 */
import { PrismaClient } from '@prisma/client';
/**
 * Get or create the registry database Prisma client (singleton)
 * Registry stores tenant metadata, phone number mappings, admin email index
 */
export declare function getRegistryPrisma(): PrismaClient;
/**
 * Get or create a Prisma client for a specific tenant
 *
 * Flow:
 * 1. Check if client is already cached
 * 2. Fetch tenant connection info from registry
 * 3. Create new Prisma client if needed
 * 4. Cache for future requests
 * 5. Update last accessed timestamp
 */
export declare function getTenantPrisma(tenantId: string): Promise<PrismaClient>;
/**
 * Disconnect all tenant database clients (graceful shutdown)
 * Called on SIGTERM/SIGINT signals
 */
export declare function disconnectAllTenants(): Promise<void>;
/**
 * Health check for monitoring
 * Returns status of registry database and active tenant connections
 */
export declare function getConnectionPoolStatus(): Promise<{
    registry: string;
    cachedTenants: number;
    maxTenants: number;
    tenants: {
        tenantId: string;
        cachedSince: string;
        lastAccessed: string;
        accessCount: number;
        idleSeconds: number;
    }[];
}>;
/**
 * Clear all cached clients (for testing or manual cleanup)
 */
export declare function clearAllCachedClients(): Promise<void>;
//# sourceMappingURL=tenant-prisma.d.ts.map