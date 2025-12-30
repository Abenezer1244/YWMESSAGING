import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
/**
 * Execute a transaction with SERIALIZABLE isolation
 * Use for: Financial transactions, payment processing, critical updates
 * Performance: Slower but ensures no anomalies
 * Note: Services using tenantPrisma should call tenantPrisma.$transaction directly
 */
export async function withSerializableTransaction(callback) {
    return (await prisma.$transaction(async (tx) => callback(tx), {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 30000,
        maxWait: 5000,
    }));
}
/**
 * Execute a transaction with REPEATABLE_READ isolation
 * Use for: Group operations, member updates, batch operations
 * Performance: Medium - prevents non-repeatable reads
 * Note: Services using tenantPrisma should call tenantPrisma.$transaction directly
 */
export async function withRepeatableReadTransaction(callback) {
    return (await prisma.$transaction(async (tx) => callback(tx), {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        timeout: 30000,
        maxWait: 5000,
    }));
}
/**
 * Execute a transaction with READ_COMMITTED isolation (default)
 * Use for: Simple operations, single entity updates
 * Performance: Fastest but allows non-repeatable reads
 * Note: Services using tenantPrisma should call tenantPrisma.$transaction directly
 */
export async function withReadCommittedTransaction(callback) {
    return (await prisma.$transaction(async (tx) => callback(tx), {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 30000,
        maxWait: 5000,
    }));
}
/**
 * Log transaction details for monitoring and debugging
 */
export function logTransactionStart(transactionName, isolationLevel) {
    console.log(`📊 [TRANSACTION] Starting: ${transactionName} (${isolationLevel})`);
}
/**
 * Log transaction completion
 */
export function logTransactionComplete(transactionName) {
    console.log(`✅ [TRANSACTION] Completed: ${transactionName}`);
}
/**
 * Log transaction failure
 */
export function logTransactionError(transactionName, error) {
    console.error(`❌ [TRANSACTION] Failed: ${transactionName}`, {
        message: error.message,
        stack: error.stack,
    });
}
/**
 * Helper for safely executing a transaction with error logging
 * Note: Works with registry prisma. Services using tenantPrisma should call tenantPrisma.$transaction directly
 */
export async function executeTransaction(name, isolationLevel, callback) {
    logTransactionStart(name, isolationLevel);
    try {
        let result;
        switch (isolationLevel) {
            case 'Serializable':
                result = await withSerializableTransaction(callback);
                break;
            case 'RepeatableRead':
                result = await withRepeatableReadTransaction(callback);
                break;
            case 'ReadCommitted':
                result = await withReadCommittedTransaction(callback);
                break;
            default:
                result = await withReadCommittedTransaction(callback);
        }
        logTransactionComplete(name);
        return result;
    }
    catch (error) {
        logTransactionError(name, error);
        throw error;
    }
}
//# sourceMappingURL=transactions.js.map