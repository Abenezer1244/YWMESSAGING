/**
 * Read Replicas Middleware
 *
 * Transparent wrapper for automatic read/write routing
 * Wraps Prisma queries to route them to appropriate database
 *
 * Usage:
 * ```typescript
 * import { createReplicaProxyClient } from '../utils/read-replicas-middleware.js';
 *
 * // Creates a proxy that automatically routes reads to replicas
 * const prisma = createReplicaProxyClient();
 *
 * // Reads go to replicas, writes go to primary
 * const user = await prisma.user.findUnique({ where: { id: '123' } });
 * await prisma.user.create({ data: { email: 'user@example.com' } });
 * ```
 */
import { PrismaClient } from '@prisma/client';
/**
 * Create a Prisma proxy client with automatic read/write routing
 * All read queries route to replicas, all writes route to primary
 *
 * @returns Proxy client that behaves like PrismaClient
 *
 * @example
 * const prisma = createReplicaProxyClient();
 * const user = await prisma.user.findUnique({ where: { id } }); // Uses replica
 * await prisma.user.update({ where: { id }, data: { ... } }); // Uses primary
 */
export declare function createReplicaProxyClient(): any;
/**
 * Create a replica-aware client that tracks operations
 * Like createReplicaProxyClient but with detailed operation tracking
 *
 * @returns Instrumented Prisma proxy client
 *
 * @example
 * const prisma = createInstrumentedReplicaClient();
 * // Operations are automatically tracked and routed
 */
export declare function createInstrumentedReplicaClient(): any;
/**
 * Direct access to write client without proxy
 * Use when you need guaranteed primary access
 *
 * @returns Direct Prisma client for writes
 *
 * @example
 * const prisma = getPrimaryClient();
 * await prisma.user.create({ ... }); // Direct primary access
 */
export declare function getPrimaryClient(): PrismaClient;
/**
 * Direct access to read client without proxy
 * Use when you explicitly need replica access
 *
 * @returns Direct Prisma client for reads
 *
 * @example
 * const replica = getReplicaClientDirect();
 * const users = await replica.user.findMany(); // Explicit replica access
 */
export declare function getReplicaClientDirect(): PrismaClient;
declare const _default: {
    createReplicaProxyClient: typeof createReplicaProxyClient;
    createInstrumentedReplicaClient: typeof createInstrumentedReplicaClient;
    getPrimaryClient: typeof getPrimaryClient;
    getReplicaClientDirect: typeof getReplicaClientDirect;
};
export default _default;
//# sourceMappingURL=read-replicas-middleware.d.ts.map