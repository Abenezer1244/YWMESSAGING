import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

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

export type IsolationLevel =
  | 'ReadUncommitted'
  | 'ReadCommitted'
  | 'RepeatableRead'
  | 'Serializable';

/**
 * Execute a transaction with SERIALIZABLE isolation
 * Use for: Financial transactions, payment processing, critical updates
 * Performance: Slower but ensures no anomalies
 */
export async function withSerializableTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return (await prisma.$transaction(async (tx) => callback(tx as PrismaClient), {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 30000,
    maxWait: 5000,
  })) as T;
}

/**
 * Execute a transaction with REPEATABLE_READ isolation
 * Use for: Group operations, member updates, batch operations
 * Performance: Medium - prevents non-repeatable reads
 */
export async function withRepeatableReadTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return (await prisma.$transaction(async (tx) => callback(tx as PrismaClient), {
    isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    timeout: 30000,
    maxWait: 5000,
  })) as T;
}

/**
 * Execute a transaction with READ_COMMITTED isolation (default)
 * Use for: Simple operations, single entity updates
 * Performance: Fastest but allows non-repeatable reads
 */
export async function withReadCommittedTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return (await prisma.$transaction(async (tx) => callback(tx as PrismaClient), {
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    timeout: 30000,
    maxWait: 5000,
  })) as T;
}

/**
 * Log transaction details for monitoring and debugging
 */
export function logTransactionStart(
  transactionName: string,
  isolationLevel: IsolationLevel
): void {
  console.log(`📊 [TRANSACTION] Starting: ${transactionName} (${isolationLevel})`);
}

/**
 * Log transaction completion
 */
export function logTransactionComplete(transactionName: string): void {
  console.log(`✅ [TRANSACTION] Completed: ${transactionName}`);
}

/**
 * Log transaction failure
 */
export function logTransactionError(transactionName: string, error: Error): void {
  console.error(`❌ [TRANSACTION] Failed: ${transactionName}`, {
    message: error.message,
    stack: error.stack,
  });
}

/**
 * Helper for safely executing a transaction with error logging
 */
export async function executeTransaction<T>(
  name: string,
  isolationLevel: IsolationLevel,
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  logTransactionStart(name, isolationLevel);

  try {
    let result: T;

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
  } catch (error) {
    logTransactionError(name, error as Error);
    throw error;
  }
}
