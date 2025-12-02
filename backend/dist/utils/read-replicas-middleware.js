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
import { getWriteClient, getReadClient } from './read-replicas.js';
import { logger } from './logger.js';
const WRITE_OPERATIONS = [
    'create',
    'update',
    'delete',
    'upsert',
    'createMany',
    'updateMany',
    'deleteMany',
];
/**
 * Determine if operation is a read or write
 *
 * @param operation - Prisma operation name
 * @returns 'read' or 'write'
 */
function getOperationType(operation) {
    return WRITE_OPERATIONS.includes(operation) ? 'write' : 'read';
}
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
export function createReplicaProxyClient() {
    return new Proxy({}, {
        get: (target, modelName) => {
            return new Proxy({}, {
                get: (_, operation) => {
                    const operationType = getOperationType(operation);
                    const client = operationType === 'write' ? getWriteClient() : getReadClient();
                    return async (...args) => {
                        try {
                            const result = await client[modelName][operation](...args);
                            // Record success for replica tracking
                            if (operationType === 'read') {
                                // Try to record success (replica info not available, but will be tracked internally)
                            }
                            return result;
                        }
                        catch (error) {
                            if (operationType === 'read') {
                                logger.debug(`Read operation failed on replica`, {
                                    model: modelName,
                                    operation,
                                    error: error.message,
                                });
                            }
                            throw error;
                        }
                    };
                },
            });
        },
    });
}
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
export function createInstrumentedReplicaClient() {
    return new Proxy({}, {
        get: (target, modelName) => {
            return new Proxy({}, {
                get: (_, operation) => {
                    const operationType = getOperationType(operation);
                    const client = operationType === 'write' ? getWriteClient() : getReadClient();
                    return async (...args) => {
                        const startTime = Date.now();
                        const operationName = `${modelName}.${operation}`;
                        try {
                            const result = await client[modelName][operation](...args);
                            const duration = Date.now() - startTime;
                            logger.debug(`Database operation completed`, {
                                operation: operationName,
                                type: operationType,
                                duration,
                            });
                            return result;
                        }
                        catch (error) {
                            const duration = Date.now() - startTime;
                            logger.error(`Database operation failed`, error, {
                                operation: operationName,
                                type: operationType,
                                duration,
                            });
                            throw error;
                        }
                    };
                },
            });
        },
    });
}
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
export function getPrimaryClient() {
    return getWriteClient();
}
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
export function getReplicaClientDirect() {
    return getReadClient();
}
export default {
    createReplicaProxyClient,
    createInstrumentedReplicaClient,
    getPrimaryClient,
    getReplicaClientDirect,
};
//# sourceMappingURL=read-replicas-middleware.js.map