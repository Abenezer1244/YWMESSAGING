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
// ============================================================================
// CACHE CONFIGURATION
// ============================================================================
// Maximum number of tenant database connections to keep in memory
// Set conservatively to prevent OOM issues
const MAX_CACHED_CLIENTS = 100;
// How long to keep a client cached after last access (30 minutes)
const CLIENT_IDLE_TIMEOUT = 30 * 60 * 1000;
// Check for idle clients every 5 minutes
const IDLE_CHECK_INTERVAL = 5 * 60 * 1000;
// ============================================================================
// GLOBAL STATE
// ============================================================================
// Cache of Prisma clients per tenant (tenantId -> PrismaClient)
const tenantClients = new Map();
// Singleton registry database client
let registryPrismaInstance = null;
// Idle timeout cleanup job
let idleCleanupInterval = null;
// Track if shutdown has been initiated
let isShuttingDown = false;
// ============================================================================
// REGISTRY DATABASE (SINGLETON)
// ============================================================================
/**
 * Get or create the registry database Prisma client (singleton)
 * Registry stores tenant metadata, phone number mappings, admin email index
 */
export function getRegistryPrisma() {
    if (registryPrismaInstance) {
        return registryPrismaInstance;
    }
    const registryDatabaseUrl = process.env.REGISTRY_DATABASE_URL;
    if (!registryDatabaseUrl) {
        throw new Error('REGISTRY_DATABASE_URL environment variable is not set. ' +
            'Required for multi-tenant registry database.');
    }
    console.log('[Registry] Creating registry database connection');
    registryPrismaInstance = new PrismaClient({
        datasources: {
            db: {
                url: registryDatabaseUrl,
            },
        },
        log: process.env.NODE_ENV === 'production'
            ? ['error', 'warn']
            : ['query', 'error', 'warn', 'info'],
    });
    // Set up graceful shutdown
    process.on('SIGTERM', disconnectAllTenants);
    process.on('SIGINT', disconnectAllTenants);
    return registryPrismaInstance;
}
// ============================================================================
// TENANT PRISMA CLIENT FACTORY
// ============================================================================
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
export async function getTenantPrisma(tenantId) {
    // Validate input
    if (!tenantId || typeof tenantId !== 'string') {
        throw new Error(`Invalid tenantId: ${tenantId}`);
    }
    if (isShuttingDown) {
        throw new Error('Application is shutting down. Cannot create new tenant connections.');
    }
    // ============================================
    // STEP 1: Check cache
    // ============================================
    const cached = tenantClients.get(tenantId);
    if (cached) {
        // Update access metadata for LRU eviction
        cached.lastAccessedAt = Date.now();
        cached.accessCount += 1;
        return cached.client;
    }
    // ============================================
    // STEP 2: Evict old clients if cache is full
    // ============================================
    if (tenantClients.size >= MAX_CACHED_CLIENTS) {
        console.warn(`[Tenant] Cache at capacity (${MAX_CACHED_CLIENTS}). Evicting least recently used client.`);
        evictLeastRecentlyUsed();
    }
    // ============================================
    // STEP 3: Fetch tenant info from registry
    // ============================================
    let connectionInfo;
    try {
        connectionInfo = await getTenantConnectionInfo(tenantId);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Tenant] Failed to get connection info for tenant ${tenantId}: ${message}`);
        throw new Error(`Failed to connect to tenant database: ${message}`);
    }
    // ============================================
    // STEP 4: Validate tenant status
    // ============================================
    if (connectionInfo.status !== 'active') {
        throw new Error(`Tenant ${tenantId} is not active (status: ${connectionInfo.status}). ` +
            'Please contact support if you believe this is an error.');
    }
    // ============================================
    // STEP 5: Create new Prisma client
    // ============================================
    console.log(`[Tenant] Creating database connection for tenant ${tenantId} ` +
        `(${connectionInfo.databaseName}) - Cache size: ${tenantClients.size}/${MAX_CACHED_CLIENTS}`);
    const tenantPrisma = new PrismaClient({
        datasources: {
            db: {
                url: connectionInfo.databaseUrl,
            },
        },
        log: process.env.NODE_ENV === 'production'
            ? ['error', 'warn']
            : ['query', 'error', 'warn', 'info'],
    });
    // ============================================
    // STEP 6: Test connection
    // ============================================
    try {
        // Simple query to verify connection works
        await tenantPrisma.$queryRaw `SELECT 1`;
        console.log(`[Tenant] Connection verified for tenant ${tenantId}`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Tenant] Connection test failed for tenant ${tenantId}: ${message}`);
        await tenantPrisma.$disconnect();
        throw new Error(`Failed to connect to tenant database. ${message}`);
    }
    // ============================================
    // STEP 7: Cache client
    // ============================================
    const now = Date.now();
    tenantClients.set(tenantId, {
        client: tenantPrisma,
        createdAt: now,
        lastAccessedAt: now,
        accessCount: 1,
    });
    // Start idle cleanup job if not already running
    if (!idleCleanupInterval) {
        startIdleCleanupJob();
    }
    return tenantPrisma;
}
// ============================================================================
// INTERNAL HELPERS
// ============================================================================
/**
 * Fetch tenant connection info from registry database (MVP: uses default database)
 */
async function getTenantConnectionInfo(tenantId) {
    // MVP: Uses default DATABASE_URL for all tenants
    // In production, registry database would store per-tenant connection strings
    const registryPrisma = getRegistryPrisma();
    // Validate tenant exists
    const tenant = await registryPrisma.church.findUnique({
        where: { id: tenantId },
        select: {
            id: true,
        },
    });
    if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
    }
    return {
        tenantId: tenant.id,
        databaseUrl: process.env.DATABASE_URL || '',
        databaseHost: process.env.DATABASE_HOST || 'localhost',
        databasePort: parseInt(process.env.DATABASE_PORT || '5432'),
        databaseName: process.env.DATABASE_NAME || 'koinonia',
        status: 'active',
        schemaVersion: '1.0.0',
    };
}
/**
 * Decrypt database URL (stored encrypted in registry for security)
 * In production, this would use AWS KMS or similar
 */
function decryptDatabaseUrl(encryptedUrl) {
    // TODO: Implement proper encryption/decryption
    // For now, assume URLs are stored as-is
    // In production: use encryption.utils.ts decrypt function
    return encryptedUrl;
}
/**
 * Evict least recently used client from cache
 */
function evictLeastRecentlyUsed() {
    let lruTenantId = null;
    let lruTimestamp = Infinity;
    // Find client with oldest lastAccessedAt
    for (const [tenantId, entry] of tenantClients.entries()) {
        if (entry.lastAccessedAt < lruTimestamp) {
            lruTimestamp = entry.lastAccessedAt;
            lruTenantId = tenantId;
        }
    }
    if (lruTenantId) {
        const entry = tenantClients.get(lruTenantId);
        console.log(`[Tenant] Evicting client for ${lruTenantId} ` +
            `(last accessed ${Math.round((Date.now() - entry.lastAccessedAt) / 1000)}s ago)`);
        // Disconnect client
        entry.client.$disconnect().catch((error) => {
            console.error(`[Tenant] Error disconnecting evicted client ${lruTenantId}:`, error);
        });
        tenantClients.delete(lruTenantId);
    }
}
/**
 * Start periodic cleanup of idle clients
 */
function startIdleCleanupJob() {
    console.log('[Tenant] Starting idle client cleanup job (checks every 5 minutes)');
    idleCleanupInterval = setInterval(async () => {
        const now = Date.now();
        const idleCandidates = [];
        // Find clients that haven't been accessed recently
        for (const [tenantId, entry] of tenantClients.entries()) {
            const idleTime = now - entry.lastAccessedAt;
            if (idleTime > CLIENT_IDLE_TIMEOUT) {
                idleCandidates.push(tenantId);
            }
        }
        // Disconnect idle clients
        if (idleCandidates.length > 0) {
            console.log(`[Tenant] Cleaning up ${idleCandidates.length} idle clients`);
            for (const tenantId of idleCandidates) {
                const entry = tenantClients.get(tenantId);
                const idleMinutes = Math.round((now - entry.lastAccessedAt) / 60000);
                console.log(`[Tenant] Disconnecting idle client for ${tenantId} ` +
                    `(idle for ${idleMinutes} minutes, accessed ${entry.accessCount} times)`);
                await entry.client.$disconnect().catch((error) => {
                    console.error(`[Tenant] Error disconnecting idle client ${tenantId}:`, error);
                });
                tenantClients.delete(tenantId);
            }
        }
    }, IDLE_CHECK_INTERVAL);
    // Don't keep the process alive just for cleanup
    idleCleanupInterval.unref();
}
// ============================================================================
// SHUTDOWN & CLEANUP
// ============================================================================
/**
 * Disconnect all tenant database clients (graceful shutdown)
 * Called on SIGTERM/SIGINT signals
 */
export async function disconnectAllTenants() {
    if (isShuttingDown) {
        return; // Already shutting down
    }
    isShuttingDown = true;
    console.log('[Tenant] Initiating graceful shutdown...');
    // Stop accepting new connections
    console.log(`[Tenant] Disconnecting ${tenantClients.size} tenant clients`);
    // Clear idle cleanup job
    if (idleCleanupInterval) {
        clearInterval(idleCleanupInterval);
        idleCleanupInterval = null;
    }
    // Disconnect all tenant clients
    const disconnectPromises = Array.from(tenantClients.entries()).map(async ([tenantId, entry]) => {
        try {
            await entry.client.$disconnect();
            console.log(`[Tenant] Disconnected ${tenantId}`);
        }
        catch (error) {
            console.error(`[Tenant] Error disconnecting ${tenantId}:`, error);
        }
    });
    await Promise.all(disconnectPromises);
    tenantClients.clear();
    // Disconnect registry database
    if (registryPrismaInstance) {
        try {
            await registryPrismaInstance.$disconnect();
            console.log('[Registry] Disconnected');
            registryPrismaInstance = null;
        }
        catch (error) {
            console.error('[Registry] Error disconnecting:', error);
        }
    }
    console.log('[Tenant] Graceful shutdown complete');
    process.exit(0);
}
/**
 * Health check for monitoring
 * Returns status of registry database and active tenant connections
 */
export async function getConnectionPoolStatus() {
    return {
        registry: registryPrismaInstance ? 'connected' : 'disconnected',
        cachedTenants: tenantClients.size,
        maxTenants: MAX_CACHED_CLIENTS,
        tenants: Array.from(tenantClients.entries()).map(([tenantId, entry]) => ({
            tenantId,
            cachedSince: new Date(entry.createdAt).toISOString(),
            lastAccessed: new Date(entry.lastAccessedAt).toISOString(),
            accessCount: entry.accessCount,
            idleSeconds: Math.round((Date.now() - entry.lastAccessedAt) / 1000),
        })),
    };
}
/**
 * Clear all cached clients (for testing or manual cleanup)
 */
export async function clearAllCachedClients() {
    console.warn('[Tenant] Manually clearing all cached clients');
    for (const [tenantId, entry] of tenantClients.entries()) {
        await entry.client.$disconnect().catch((error) => {
            console.error(`[Tenant] Error disconnecting ${tenantId}:`, error);
        });
    }
    tenantClients.clear();
}
//# sourceMappingURL=tenant-prisma.js.map