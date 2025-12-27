import { PrismaClient } from '@prisma/client';
import { invalidateCache, CACHE_KEYS } from '../services/cache.service.js';

const prisma = new PrismaClient();

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
export async function addMemberToGroup(
  memberId: string,
  groupId: string
) {
  const startTime = Date.now();

  try {
    console.log(`[addMemberToGroup] Starting job - memberId: ${memberId}, groupId: ${groupId}`);

    // Validate both exist
    const [member, group] = await Promise.all([
      prisma.member.findUnique({
        where: { id: memberId },
        select: { id: true, firstName: true, lastName: true }
      }),
      prisma.group.findUnique({
        where: { id: groupId },
        select: { id: true, name: true }
      })
    ]);

    if (!member) {
      throw new Error(`Member not found: ${memberId}`);
    }
    if (!group) {
      throw new Error(`Group not found: ${groupId}`);
    }

    console.log(`[addMemberToGroup] ✅ Validated - Member: ${member.firstName} ${member.lastName}, Group: ${group.name}`);

    // Check if already in group
    console.log(`[addMemberToGroup] Checking if member already linked...`);
    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_memberId: {
          groupId,
          memberId,
        },
      },
    });

    if (existing) {
      console.log(`[addMemberToGroup] ⚠️ Member already in group (ID: ${existing.id}), skipping`);
      return;
    }

    console.log(`[addMemberToGroup] Member not yet linked, creating GroupMember record...`);

    // Create group membership
    console.log(`[addMemberToGroup] Creating GroupMember with groupId="${groupId}" memberId="${memberId}"`);
    let groupMember;
    try {
      groupMember = await prisma.groupMember.create({
        data: {
          groupId,
          memberId,
        },
      });
      console.log(`[addMemberToGroup] ✅ GroupMember created successfully with ID: ${groupMember.id}`);
    } catch (createError) {
      console.error(`[addMemberToGroup] ❌ FAILED to create GroupMember:`, {
        error: (createError as Error).message,
        code: (createError as any).code,
        groupId,
        memberId,
      });
      throw createError;
    }

    console.log(`[addMemberToGroup] ✅ Group membership created:`, {
      groupId,
      memberId,
      joinedAt: groupMember.joinedAt
    });

    // Invalidate cache so next list query reflects the new member
    try {
      await invalidateCache(CACHE_KEYS.groupMembers(groupId));
      console.log(`[addMemberToGroup] ✅ Cache invalidated for group: ${groupId}`);
    } catch (cacheError) {
      console.error(`[addMemberToGroup] ⚠️ Cache invalidation failed (non-blocking):`, (cacheError as Error).message);
      // Continue - cache is secondary to data persistence
    }

    const duration = Date.now() - startTime;
    console.log(`[addMemberToGroup] ✅ Job completed successfully in ${duration}ms`);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[addMemberToGroup] ❌ Job failed after ${duration}ms:`, {
      memberId,
      groupId,
      error: (error as Error).message,
      code: (error as any).code,
      stack: (error as Error).stack?.substring(0, 200)
    });

    // Re-throw so caller can see failure
    throw error;
  }
}

/**
 * Queue the addMemberToGroup job to run asynchronously
 * Uses setTimeout to defer execution after API response
 *
 * @param memberId - The member ID
 * @param groupId - The group ID
 * @param delayMs - Delay before running (default: 0ms = immediate deferred execution)
 */
export async function queueAddMemberToGroupJob(
  memberId: string,
  groupId: string,
  delayMs: number = 0
): Promise<void> {
  console.log(`[queueAddMemberToGroupJob] Queuing job for member ${memberId} to group ${groupId} (delay: ${delayMs}ms)`);

  // Schedule the job to run asynchronously
  // Using setTimeout allows the API response to return immediately
  setTimeout(() => {
    addMemberToGroup(memberId, groupId).catch((error) => {
      console.error('[queueAddMemberToGroupJob] Job execution failed:', {
        memberId,
        groupId,
        error: (error as Error).message
      });
      // Job failures are logged but don't affect the API response
      // The member data is already saved, just the group linking failed
      // In production, you'd want to track this for manual retry
    });
  }, delayMs);

  // Return immediately without waiting for job completion
  // This allows the API to respond quickly to the client
}
