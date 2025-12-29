import { PrismaClient } from '@prisma/client';
import { getPlan } from '../config/plans.js';

export interface CreateBranchInput {
  name: string;
  address?: string;
  phone?: string;
  description?: string;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  phone?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Get all branches for a tenant
 */
export async function getBranches(tenantId: string, tenantPrisma: PrismaClient) {
  const branches = await tenantPrisma.branch.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    description: branch.description,
    isActive: branch.isActive,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  }));
}

/**
 * Create a new branch
 * Checks plan limit first (defaults to STARTER plan for new churches)
 */
export async function createBranch(
  tenantId: string,
  tenantPrisma: PrismaClient,
  input: CreateBranchInput
) {
  // Get current branch count
  const currentCount = await tenantPrisma.branch.count();

  // Get plan limits (defaulting to starter)
  const limits = getPlan('starter');

  // Check limit
  if (currentCount >= limits.branches) {
    throw new Error(
      `Branch limit reached (${limits.branches}). Upgrade your plan to add more branches.`
    );
  }

  const branch = await tenantPrisma.branch.create({
    data: {
      name: input.name,
      address: input.address,
      phone: input.phone,
      description: input.description,
      isActive: true,
    },
  });

  return {
    id: branch.id,
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
export async function updateBranch(
  tenantId: string,
  tenantPrisma: PrismaClient,
  branchId: string,
  input: UpdateBranchInput
) {
  // Verify branch exists
  const branch = await tenantPrisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    throw new Error('Branch not found');
  }

  const updated = await tenantPrisma.branch.update({
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
export async function deleteBranch(tenantId: string, tenantPrisma: PrismaClient, branchId: string) {
  // Verify branch exists
  const branch = await tenantPrisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    throw new Error('Branch not found');
  }

  // Count branches for this tenant
  const branchCount = await tenantPrisma.branch.count();

  if (branchCount <= 1) {
    throw new Error('Cannot delete the only branch. A church must have at least one branch.');
  }

  // Delete branch (cascade handled by Prisma)
  await tenantPrisma.branch.delete({
    where: { id: branchId },
  });

  return {
    success: true,
    membersDeleted: 0, // Member count removed - members don't have branchId anymore
  };
}
