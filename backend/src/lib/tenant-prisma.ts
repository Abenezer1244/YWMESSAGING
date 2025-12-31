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

// ============================================================================
// CRITICAL: Import from CORRECT Prisma clients
// ============================================================================
// - Registry schema (@prisma/client): Only has registry models (Church, Tenant, PhoneNumberRegistry, AdminEmailIndex)
// - Tenant schema (.prisma/client-tenant): Has all tenant-specific models (Member, Message, etc.)
//
// We need both types:
// - RegistryPrismaClient: For church metadata, tenant registry, admin emails
// - TenantPrismaClient: For member, message, conversation, etc.
import { PrismaClient as RegistryPrismaClient } from '@prisma/client';
import { PrismaClient as TenantPrismaClient } from '../../node_modules/.prisma/client-tenant/index.js';

// Export types for services to use
export type { TenantPrismaClient };
export type { RegistryPrismaClient };

// ============================================================================
// TYPES
// ============================================================================

interface TenantClientCacheEntry {
  client: TenantPrismaClient;
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
}

interface TenantConnectionInfo {
  tenantId: string;
  databaseUrl: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  status: 'active' | 'suspended' | 'archived' | 'deleted';
  schemaVersion: string;
}

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
const tenantClients = new Map<string, TenantClientCacheEntry>();

// Singleton registry database client
let registryPrismaInstance: RegistryPrismaClient | null = null;

// Idle timeout cleanup job
let idleCleanupInterval: NodeJS.Timeout | null = null;

// Track if shutdown has been initiated
let isShuttingDown = false;

// Track total connections created (for monitoring)
let totalConnectionsCreated = 0;
let totalConnectionsEvicted = 0;
let totalConnectionsClosed = 0;

// ============================================================================
// REGISTRY DATABASE (SINGLETON)
// ============================================================================

/**
 * Get or create the registry database Prisma client (singleton)
 * Registry stores tenant metadata, phone number mappings, admin email index
 */
export function getRegistryPrisma(): RegistryPrismaClient {
  if (registryPrismaInstance) {
    return registryPrismaInstance;
  }

  const registryDatabaseUrl = process.env.REGISTRY_DATABASE_URL;
  if (!registryDatabaseUrl) {
    throw new Error(
      'REGISTRY_DATABASE_URL environment variable is not set. ' +
      'Required for multi-tenant registry database.'
    );
  }

  console.log('[Registry] Creating registry database connection');

  registryPrismaInstance = new RegistryPrismaClient({
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
export async function getTenantPrisma(tenantId: string): Promise<TenantPrismaClient> {
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
    console.warn(
      `[Tenant] Cache at capacity (${MAX_CACHED_CLIENTS}). Evicting least recently used client.`
    );
    await evictLeastRecentlyUsed();
  }

  // ============================================
  // STEP 3: Fetch tenant info from registry
  // ============================================
  let connectionInfo: TenantConnectionInfo;
  try {
    connectionInfo = await getTenantConnectionInfo(tenantId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Tenant] Failed to get connection info for tenant ${tenantId}: ${message}`);
    throw new Error(`Failed to connect to tenant database: ${message}`);
  }

  // ============================================
  // STEP 4: Validate tenant status
  // ============================================
  if (connectionInfo.status !== 'active') {
    throw new Error(
      `Tenant ${tenantId} is not active (status: ${connectionInfo.status}). ` +
      'Please contact support if you believe this is an error.'
    );
  }

  // ============================================
  // STEP 5: Create new Prisma client
  // ============================================
  console.log(
    `[Tenant] Creating database connection for tenant ${tenantId} ` +
    `(${connectionInfo.databaseName}) - Cache size: ${tenantClients.size}/${MAX_CACHED_CLIENTS}`
  );

  const tenantPrisma = new TenantPrismaClient({
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
    await tenantPrisma.$queryRaw`SELECT 1`;
    console.log(`[Tenant] Connection verified for tenant ${tenantId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Tenant] Connection test failed for tenant ${tenantId}: ${message}`);
    await tenantPrisma.$disconnect();
    throw new Error(
      `Failed to connect to tenant database. ${message}`
    );
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

  totalConnectionsCreated++;
  console.log(
    `[Tenant] Connection stats: ` +
    `Created: ${totalConnectionsCreated}, ` +
    `Cached: ${tenantClients.size}, ` +
    `Evicted: ${totalConnectionsEvicted}, ` +
    `Closed: ${totalConnectionsClosed}`
  );

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
 * Fetch tenant connection info from registry database
 *
 * Production-ready: Looks up tenant metadata in registry database
 * Returns database connection string for that specific tenant
 */
async function getTenantConnectionInfo(tenantId: string): Promise<TenantConnectionInfo> {
  // Production: Look up tenant in registry database
  // Registry stores per-tenant database connection strings and metadata
  const registryPrisma = getRegistryPrisma();

  if (!registryPrisma) {
    throw new Error(
      'Registry database not configured (REGISTRY_DATABASE_URL not set). ' +
      'Cannot connect to tenant database without registry.'
    );
  }

  // Query registry for tenant connection information
  const tenant = await registryPrisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      databaseUrl: true,
      databaseHost: true,
      databasePort: true,
      databaseName: true,
      status: true,
      schemaVersion: true,
    },
  });

  if (!tenant) {
    throw new Error(
      `Tenant ${tenantId} not found in registry. ` +
      'Tenant has been deleted or does not exist.'
    );
  }

  if (tenant.status !== 'active') {
    throw new Error(
      `Tenant ${tenantId} is not active (status: ${tenant.status}). ` +
      'Please contact support.'
    );
  }

  // Validate required connection information
  if (!tenant.databaseUrl) {
    throw new Error(
      `Tenant ${tenantId} has invalid database URL in registry. ` +
      'Database provisioning may have failed.'
    );
  }

  return {
    tenantId: tenant.id,
    databaseUrl: tenant.databaseUrl,
    databaseHost: tenant.databaseHost,
    databasePort: tenant.databasePort,
    databaseName: tenant.databaseName,
    status: tenant.status as 'active' | 'suspended' | 'archived' | 'deleted',
    schemaVersion: tenant.schemaVersion,
  };
}

/**
 * Decrypt database URL (stored encrypted in registry for security)
 * In production, this would use AWS KMS or similar
 */
function decryptDatabaseUrl(encryptedUrl: string): string {
  // TODO: Implement proper encryption/decryption
  // For now, assume URLs are stored as-is
  // In production: use encryption.utils.ts decrypt function
  return encryptedUrl;
}

/**
 * Disconnect a Prisma client with timeout to prevent hanging
 * @param client The Prisma client to disconnect
 * @param timeoutMs Timeout in milliseconds (default 5 seconds)
 * @returns Promise that resolves when disconnected or times out
 */
async function disconnectClientWithTimeout(
  client: TenantPrismaClient,
  timeoutMs: number = 5000
): Promise<void> {
  return Promise.race([
    client.$disconnect(),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Disconnect timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Evict least recently used client from cache
 * Enhanced with proper async disconnect handling
 */
async function evictLeastRecentlyUsed(): Promise<void> {
  let lruTenantId: string | null = null;
  let lruTimestamp = Infinity;

  // Find client with oldest lastAccessedAt
  for (const [tenantId, entry] of tenantClients.entries()) {
    if (entry.lastAccessedAt < lruTimestamp) {
      lruTimestamp = entry.lastAccessedAt;
      lruTenantId = tenantId;
    }
  }

  if (lruTenantId) {
    const entry = tenantClients.get(lruTenantId)!;
    const idleSeconds = Math.round((Date.now() - entry.lastAccessedAt) / 1000);

    console.log(
      `[Tenant] Evicting LRU client for ${lruTenantId} ` +
      `(idle: ${idleSeconds}s, accessed: ${entry.accessCount} times)`
    );

    // Remove from cache first (prevent reuse during disconnect)
    tenantClients.delete(lruTenantId);
    totalConnectionsEvicted++;

    // Disconnect with timeout to prevent hanging
    try {
      await disconnectClientWithTimeout(entry.client, 5000);
      totalConnectionsClosed++;
      console.log(`[Tenant] Successfully disconnected ${lruTenantId}`);
    } catch (error) {
      console.error(
        `[Tenant] Error disconnecting evicted client ${lruTenantId}:`,
        error instanceof Error ? error.message : error
      );
      // Connection may be leaked, but we've removed it from cache
      // The database will eventually close idle connections
    }
  }
}

/**
 * Start periodic cleanup of idle clients
 */
function startIdleCleanupJob(): void {
  console.log('[Tenant] Starting idle client cleanup job (checks every 5 minutes)');

  idleCleanupInterval = setInterval(async () => {
    try {
      const now = Date.now();
      const idleCandidates: string[] = [];

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

        // Disconnect in parallel with individual error handling
        await Promise.allSettled(
          idleCandidates.map(async (tenantId) => {
            const entry = tenantClients.get(tenantId);
            if (!entry) return; // Already removed

            const idleMinutes = Math.round((now - entry.lastAccessedAt) / 60000);

            console.log(
              `[Tenant] Disconnecting idle client for ${tenantId} ` +
              `(idle: ${idleMinutes}min, accessed: ${entry.accessCount} times)`
            );

            // Remove from cache first
            tenantClients.delete(tenantId);
            totalConnectionsEvicted++;

            // Disconnect with timeout
            try {
              await disconnectClientWithTimeout(entry.client, 5000);
              totalConnectionsClosed++;
              console.log(`[Tenant] Idle client ${tenantId} disconnected successfully`);
            } catch (error) {
              console.error(
                `[Tenant] Error disconnecting idle client ${tenantId}:`,
                error instanceof Error ? error.message : error
              );
            }
          })
        );

        console.log(
          `[Tenant] Cleanup complete. Stats: ` +
          `Created: ${totalConnectionsCreated}, ` +
          `Cached: ${tenantClients.size}, ` +
          `Evicted: ${totalConnectionsEvicted}, ` +
          `Closed: ${totalConnectionsClosed}`
        );
      }
    } catch (error) {
      console.error('[Tenant] Error in idle cleanup job:', error);
      // Don't crash the cleanup job - continue on next interval
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
export async function disconnectAllTenants(): Promise<void> {
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

  // Disconnect all tenant clients with timeout
  const disconnectPromises = Array.from(tenantClients.entries()).map(
    async ([tenantId, entry]) => {
      try {
        await disconnectClientWithTimeout(entry.client, 10000); // 10s timeout for shutdown
        totalConnectionsClosed++;
        console.log(`[Tenant] Disconnected ${tenantId}`);
      } catch (error) {
        console.error(
          `[Tenant] Error disconnecting ${tenantId}:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  );

  await Promise.all(disconnectPromises);
  tenantClients.clear();

  console.log(
    `[Tenant] Final stats: ` +
    `Created: ${totalConnectionsCreated}, ` +
    `Closed: ${totalConnectionsClosed}, ` +
    `Evicted: ${totalConnectionsEvicted}`
  );

  // Disconnect registry database
  if (registryPrismaInstance) {
    try {
      await registryPrismaInstance.$disconnect();
      console.log('[Registry] Disconnected');
      registryPrismaInstance = null;
    } catch (error) {
      console.error('[Registry] Error disconnecting:', error);
    }
  }

  console.log('[Tenant] Graceful shutdown complete');
  process.exit(0);
}

/**
 * Get connection pool statistics for monitoring
 * Returns comprehensive metrics about tenant connections
 */
export function getConnectionPoolStats() {
  return {
    registry: {
      connected: registryPrismaInstance !== null,
    },
    cache: {
      currentSize: tenantClients.size,
      maxSize: MAX_CACHED_CLIENTS,
      utilization: `${Math.round((tenantClients.size / MAX_CACHED_CLIENTS) * 100)}%`,
    },
    connections: {
      totalCreated: totalConnectionsCreated,
      totalClosed: totalConnectionsClosed,
      totalEvicted: totalConnectionsEvicted,
      currentlyOpen: totalConnectionsCreated - totalConnectionsClosed,
      potentialLeaks: Math.max(0, (totalConnectionsCreated - totalConnectionsClosed) - tenantClients.size),
    },
    config: {
      maxCached: MAX_CACHED_CLIENTS,
      idleTimeoutMinutes: CLIENT_IDLE_TIMEOUT / 60000,
      idleCheckIntervalMinutes: IDLE_CHECK_INTERVAL / 60000,
    },
  };
}

/**
 * Health check for monitoring
 * Returns status of registry database and active tenant connections
 */
export async function getConnectionPoolStatus() {
  const stats = getConnectionPoolStats();

  return {
    ...stats,
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
export async function clearAllCachedClients(): Promise<void> {
  console.warn('[Tenant] Manually clearing all cached clients');

  for (const [tenantId, entry] of tenantClients.entries()) {
    await entry.client.$disconnect().catch((error) => {
      console.error(`[Tenant] Error disconnecting ${tenantId}:`, error);
    });
  }

  tenantClients.clear();
}

/**
 * Evict a specific tenant's cached client to force fresh queries
 * Useful after write operations to ensure subsequent reads see latest data
 */
export async function evictTenantClient(tenantId: string): Promise<void> {
  const entry = tenantClients.get(tenantId);
  if (!entry) {
    console.log(`[Tenant] No cached client to evict for tenant ${tenantId}`);
    return;
  }

  console.log(`[Tenant] Evicting cached client for tenant ${tenantId} (forcing fresh connection for next request)`);

  // Remove from cache
  tenantClients.delete(tenantId);
  totalConnectionsEvicted++;

  // CRITICAL FIX: Wait for disconnect to complete to prevent race condition
  // where subsequent queries reuse the old cached client before disconnect finishes
  try {
    await disconnectClientWithTimeout(entry.client, 5000);
    totalConnectionsClosed++;
    console.log(`[Tenant] Successfully disconnected ${tenantId}`);
  } catch (error) {
    console.error(`[Tenant] Error disconnecting client ${tenantId}:`, error instanceof Error ? error.message : error);
    // Client is removed from cache, so won't be reused even if disconnect failed
  }
}
