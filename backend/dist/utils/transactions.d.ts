import { PrismaClient } from '@prisma/client';
/**
 * Transaction Isolation Levels
 *
 * PostgreSQL supports multiple isolation levels. Prisma abstracts these through isolationLevel parameter.
 *
 * READ_UNCOMMITTED: Not supported by PostgreSQL (treated as READ_COMMITTED)
 * READ_COMMITTED: Default. Can read committed data from other transactions.
 * REPEATABLE_READ: Prevents dirty and non-repeatable reads. Good for operations with multiple SELECT statements.
 * SERIALIZABLE: Prevents all anomalies. Slowest but most consistent. Use for critical financial transactions.
 */
export type IsolationLevel = 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
/**
 * Execute a transaction with SERIALIZABLE isolation
 * Use for: Financial transactions, payment processing, critical updates
 * Performance: Slower but ensures no anomalies
 */
export declare function withSerializableTransaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
/**
 * Execute a transaction with REPEATABLE_READ isolation
 * Use for: Group operations, member updates, batch operations
 * Performance: Medium - prevents non-repeatable reads
 */
export declare function withRepeatableReadTransaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
/**
 * Execute a transaction with READ_COMMITTED isolation (default)
 * Use for: Simple operations, single entity updates
 * Performance: Fastest but allows non-repeatable reads
 */
export declare function withReadCommittedTransaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
/**
 * Log transaction details for monitoring and debugging
 */
export declare function logTransactionStart(transactionName: string, isolationLevel: IsolationLevel): void;
/**
 * Log transaction completion
 */
export declare function logTransactionComplete(transactionName: string): void;
/**
 * Log transaction failure
 */
export declare function logTransactionError(transactionName: string, error: Error): void;
/**
 * Helper for safely executing a transaction with error logging
 */
export declare function executeTransaction<T>(name: string, isolationLevel: IsolationLevel, callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
//# sourceMappingURL=transactions.d.ts.map