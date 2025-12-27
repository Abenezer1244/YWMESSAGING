/**
 * Background job: Link a member to a group
 * Called after member creation to ensure group membership is established
 *
 * This is a background job (not blocking) so:
 * - API returns immediately to user
 * - Member linking happens asynchronously
 * - If linking fails, it can be retried independently
 * - Frontend can poll/refresh to see the member once linking completes
 *
 * @param memberId - The member ID to link
 * @param groupId - The group ID to link to
 */
export declare function addMemberToGroup(memberId: string, groupId: string): Promise<void>;
/**
 * Queue the addMemberToGroup job to run asynchronously
 * Uses setTimeout to defer execution after API response
 *
 * @param memberId - The member ID
 * @param groupId - The group ID
 * @param delayMs - Delay before running (default: 0ms = immediate deferred execution)
 */
export declare function queueAddMemberToGroupJob(memberId: string, groupId: string, delayMs?: number): Promise<void>;
//# sourceMappingURL=addMemberToGroup.job.d.ts.map