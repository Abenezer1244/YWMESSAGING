import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const GROUP_LIMIT_PER_BRANCH = 30;
/**
 * Get all groups for a branch with member counts
 */
export async function getGroups(branchId) {
    const groups = await prisma.group.findMany({
        where: { branchId },
        include: {
            _count: {
                select: { members: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        welcomeMessageEnabled: group.welcomeMessageEnabled,
        welcomeMessageText: group.welcomeMessageText,
        memberCount: group._count.members,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
    }));
}
/**
 * Create new group in a branch
 */
export async function createGroup(branchId, data) {
    // Check plan limit
    const existingCount = await prisma.group.count({
        where: { branchId },
    });
    if (existingCount >= GROUP_LIMIT_PER_BRANCH) {
        throw new Error(`Group limit of ${GROUP_LIMIT_PER_BRANCH} reached for this branch`);
    }
    // Validate branch exists
    const branch = await prisma.branch.findUnique({
        where: { id: branchId },
    });
    if (!branch) {
        throw new Error('Branch not found');
    }
    const group = await prisma.group.create({
        data: {
            branchId,
            churchId: branch.churchId,
            name: data.name.trim(),
            description: data.description?.trim(),
            welcomeMessageEnabled: data.welcomeMessageEnabled ?? false,
            welcomeMessageText: data.welcomeMessageText?.trim(),
        },
        include: {
            _count: {
                select: { members: true },
            },
        },
    });
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        welcomeMessageEnabled: group.welcomeMessageEnabled,
        welcomeMessageText: group.welcomeMessageText,
        memberCount: group._count.members,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
    };
}
/**
 * Update group
 */
export async function updateGroup(groupId, data) {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });
    if (!group) {
        throw new Error('Group not found');
    }
    const updated = await prisma.group.update({
        where: { id: groupId },
        data: {
            ...(data.name && { name: data.name.trim() }),
            ...(data.description !== undefined && { description: data.description?.trim() }),
            ...(data.welcomeMessageEnabled !== undefined && { welcomeMessageEnabled: data.welcomeMessageEnabled }),
            ...(data.welcomeMessageText !== undefined && { welcomeMessageText: data.welcomeMessageText?.trim() }),
        },
        include: {
            _count: {
                select: { members: true },
            },
        },
    });
    return {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        welcomeMessageEnabled: updated.welcomeMessageEnabled,
        welcomeMessageText: updated.welcomeMessageText,
        memberCount: updated._count.members,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
    };
}
/**
 * Delete group and cascade members
 */
export async function deleteGroup(groupId) {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: {
                select: { id: true },
            },
        },
    });
    if (!group) {
        throw new Error('Group not found');
    }
    const memberCount = group.members.length;
    // Delete group (Prisma will cascade delete GroupMembers)
    await prisma.group.delete({
        where: { id: groupId },
    });
    return {
        success: true,
        deletedMembersCount: memberCount,
    };
}
//# sourceMappingURL=group.service.js.map