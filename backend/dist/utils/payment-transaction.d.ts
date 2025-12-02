import { PrismaClient } from '@prisma/client';
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
export declare function executePaymentTransaction<T>(paymentId: string, churchId: string, callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
/**
 * Execute a subscription update with SERIALIZABLE isolation
 * Ensures subscription status updates are atomic and prevent race conditions
 */
export declare function executeSubscriptionTransaction<T>(subscriptionId: string, churchId: string, callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
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
//# sourceMappingURL=payment-transaction.d.ts.map