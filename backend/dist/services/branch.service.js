import { PrismaClient } from '@prisma/client';
import { getPlanLimits } from '../config/plans.js';
const prisma = new PrismaClient();
/**
 * Get all branches for a church
 */
export async function getBranches(churchId) {
    const branches = await prisma.branch.findMany({
        where: { churchId },
        include: {
            _count: {
                select: {
                    groups: true,
                },
            },
            groups: {
                include: {
                    _count: {
                        select: {
                            members: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
    return branches.map((branch) => ({
        id: branch.id,
        churchId: branch.churchId,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        description: branch.description,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        groupCount: branch._count.groups,
        memberCount: branch.groups.reduce((sum, g) => sum + g._count.members, 0),
    }));
}
/**
 * Create a new branch
 * Checks plan limit first (defaults to STARTER plan for new churches)
 */
export async function createBranch(churchId, input) {
    // Get current branch count
    const currentCount = await prisma.branch.count({
        where: { churchId },
    });
    // Get plan limits (defaulting to STARTER)
    const limits = getPlanLimits('STARTER');
    // Check limit
    if (currentCount >= limits.branches) {
        throw new Error(`Branch limit reached (${limits.branches}). Upgrade your plan to add more branches.`);
    }
    const branch = await prisma.branch.create({
        data: {
            churchId,
            name: input.name,
            address: input.address,
            phone: input.phone,
            description: input.description,
            isActive: true,
        },
    });
    return {
        id: branch.id,
        churchId: branch.churchId,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        description: branch.description,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
    };
}
/**
 * Update a branch
 */
export async function updateBranch(branchId, churchId, input) {
    // Verify branch belongs to church
    const branch = await prisma.branch.findFirst({
        where: { id: branchId, churchId },
    });
    if (!branch) {
        throw new Error('Branch not found');
    }
    const updated = await prisma.branch.update({
        where: { id: branchId },
        data: {
            ...(input.name && { name: input.name }),
            ...(input.address !== undefined && { address: input.address }),
            ...(input.phone !== undefined && { phone: input.phone }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
    });
    return {
        id: updated.id,
        churchId: updated.churchId,
        name: updated.name,
        address: updated.address,
        phone: updated.phone,
        description: updated.description,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
    };
}
/**
 * Delete a branch
 * Cannot delete if it's the only branch
 */
export async function deleteBranch(branchId, churchId) {
    // Verify branch belongs to church
    const branch = await prisma.branch.findFirst({
        where: { id: branchId, churchId },
    });
    if (!branch) {
        throw new Error('Branch not found');
    }
    // Count branches for this church
    const branchCount = await prisma.branch.count({
        where: { churchId },
    });
    if (branchCount <= 1) {
        throw new Error('Cannot delete the only branch. A church must have at least one branch.');
    }
    // Get group and member counts for analytics
    const groups = await prisma.group.findMany({
        where: { branchId },
        include: {
            _count: {
                select: { members: true },
            },
        },
    });
    const groupCount = groups.length;
    const memberCount = groups.reduce((sum, g) => sum + g._count.members, 0);
    // Delete branch (cascade delete groups and group members handled by Prisma)
    await prisma.branch.delete({
        where: { id: branchId },
    });
    return {
        success: true,
        groupsDeleted: groupCount,
        membersDeleted: memberCount,
    };
}
//# sourceMappingURL=branch.service.js.map