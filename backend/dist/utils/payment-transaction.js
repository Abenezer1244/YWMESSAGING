import { withSerializableTransaction, logTransactionStart, logTransactionComplete, logTransactionError } from './transactions.js';
import { DatabaseError } from './errors/DatabaseError.js';
/**
 * Payment Transaction Utilities
 *
 * All payment operations MUST use SERIALIZABLE isolation level to prevent:
 * - Double-billing
 * - Lost updates
 * - Phantom reads
 * - Race conditions during concurrent payment processing
 */
/**
 * Execute a payment operation with SERIALIZABLE isolation
 *
 * This ensures:
 * - No other transactions can read data being modified
 * - No phantom reads (new rows created/deleted mid-transaction)
 * - Consistent billing ledger
 */
export async function executePaymentTransaction(paymentId, churchId, callback) {
    const transactionName = `Payment:${paymentId}:Church:${churchId}`;
    logTransactionStart(transactionName, 'Serializable');
    try {
        const result = await withSerializableTransaction(async (tx) => {
            return await callback(tx);
        });
        logTransactionComplete(transactionName);
        return result;
    }
    catch (error) {
        logTransactionError(transactionName, error);
        // Check for specific Prisma transaction errors
        if (error instanceof Error) {
            if (error.message.includes('Transaction conflict')) {
                throw new DatabaseError('Payment processing failed due to concurrent request. Please retry.', { transactionName, cause: 'concurrent_conflict' });
            }
            if (error.message.includes('Transaction timeout')) {
                throw new DatabaseError('Payment processing timeout. Please contact support.', { transactionName, cause: 'timeout' });
            }
        }
        throw error;
    }
}
/**
 * Execute a subscription update with SERIALIZABLE isolation
 * Ensures subscription status updates are atomic and prevent race conditions
 */
export async function executeSubscriptionTransaction(subscriptionId, churchId, callback) {
    const transactionName = `Subscription:${subscriptionId}:Church:${churchId}`;
    logTransactionStart(transactionName, 'Serializable');
    try {
        const result = await withSerializableTransaction(async (tx) => {
            return await callback(tx);
        });
        logTransactionComplete(transactionName);
        return result;
    }
    catch (error) {
        logTransactionError(transactionName, error);
        throw error;
    }
}
/**
 * Example: Process payment with SERIALIZABLE isolation
 *
 * Usage:
 * ```
 * const result = await executePaymentTransaction(paymentId, churchId, async (tx) => {
 *   // 1. Check current balance
 *   const church = await tx.church.findUniqueOrThrow({ where: { id: churchId } });
 *
 *   // 2. Verify sufficient credits
 *   if (church.credits < amount) {
 *     throw new Error('Insufficient credits');
 *   }
 *
 *   // 3. Deduct credits
 *   await tx.church.update({
 *     where: { id: churchId },
 *     data: { credits: { decrement: amount } }
 *   });
 *
 *   // 4. Create transaction record
 *   return await tx.transaction.create({
 *     data: {
 *       churchId,
 *       amount,
 *       type: 'DEBIT',
 *       status: 'COMPLETED',
 *     }
 *   });
 * });
 * ```
 */
//# sourceMappingURL=payment-transaction.js.map