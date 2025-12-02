import { withRepeatableReadTransaction, logTransactionStart, logTransactionComplete, logTransactionError } from './transactions.js';
import { DatabaseError } from './errors/DatabaseError.js';
/**
 * Group Transaction Utilities
 *
 * Group operations use REPEATABLE_READ isolation to prevent:
 * - Dirty reads (reading uncommitted changes)
 * - Non-repeatable reads (same row returns different values)
 * - Phantom reads (conditional logic based on row counts)
 *
 * Typical operations:
 * - Add/remove members from group
 * - Update group properties
 * - Batch member operations
 */
/**
 * Execute a group member operation with REPEATABLE_READ isolation
 *
 * Ensures consistent group membership during:
 * - Member additions
 * - Member removals
 * - Bulk operations
 */
export async function executeGroupTransaction(groupId, churchId, operationType, callback) {
    const transactionName = `Group:${operationType}:${groupId}:Church:${churchId}`;
    logTransactionStart(transactionName, 'RepeatableRead');
    try {
        const result = await withRepeatableReadTransaction(async (tx) => {
            return await callback(tx);
        });
        logTransactionComplete(transactionName);
        return result;
    }
    catch (error) {
        logTransactionError(transactionName, error);
        if (error instanceof Error) {
            if (error.message.includes('Transaction conflict')) {
                throw new DatabaseError('Group operation failed due to concurrent modification. Please retry.', { transactionName, cause: 'concurrent_conflict' });
            }
            if (error.message.includes('Transaction timeout')) {
                throw new DatabaseError('Group operation timeout. Please try again.', { transactionName, cause: 'timeout' });
            }
        }
        throw error;
    }
}
/**
 * Execute a member batch import with REPEATABLE_READ isolation
 * Ensures all members added to group are visible and prevents race conditions
 */
export async function executeBatchMemberImport(groupId, churchId, callback) {
    return executeGroupTransaction(groupId, churchId, 'bulk_operation', callback);
}
/**
 * Example: Add members to group with REPEATABLE_READ isolation
 *
 * Usage:
 * ```
 * const result = await executeGroupTransaction(groupId, churchId, 'add_members', async (tx) => {
 *   // 1. Verify group exists and get member count
 *   const group = await tx.group.findUniqueOrThrow({
 *     where: { id: groupId },
 *     include: { members: { select: { id: true } } }
 *   });
 *
 *   // 2. Find members to add
 *   const membersToAdd = await tx.member.findMany({
 *     where: { id: { in: memberIds }, churchId }
 *   });
 *
 *   // 3. Add members to group (prevents duplicates via unique constraint)
 *   const updated = await tx.group.update({
 *     where: { id: groupId },
 *     data: {
 *       members: {
 *         connect: membersToAdd.map(m => ({ id: m.id }))
 *       }
 *     }
 *   });
 *
 *   return { added: membersToAdd.length, totalMembers: updated.members.length };
 * });
 * ```
 */
/**
 * Example: Remove members from group with REPEATABLE_READ isolation
 *
 * Usage:
 * ```
 * const result = await executeGroupTransaction(groupId, churchId, 'remove_members', async (tx) => {
 *   // Disconnect members from group
 *   const updated = await tx.group.update({
 *     where: { id: groupId },
 *     data: {
 *       members: {
 *         disconnect: memberIds.map(id => ({ id }))
 *       }
 *     }
 *   });
 *
 *   return { removed: memberIds.length, remainingMembers: updated.members.length };
 * });
 * ```
 */
//# sourceMappingURL=group-transaction.js.map