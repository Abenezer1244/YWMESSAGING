import { PrismaClient } from '@prisma/client';
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
export declare function getBranches(tenantId: string, tenantPrisma: PrismaClient): Promise<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
/**
 * Create a new branch
 * Checks plan limit first (defaults to STARTER plan for new churches)
 */
export declare function createBranch(tenantId: string, tenantPrisma: PrismaClient, input: CreateBranchInput): Promise<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Update a branch
 */
export declare function updateBranch(tenantId: string, tenantPrisma: PrismaClient, branchId: string, input: UpdateBranchInput): Promise<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Delete a branch
 * Cannot delete if it's the only branch
 */
export declare function deleteBranch(tenantId: string, tenantPrisma: PrismaClient, branchId: string): Promise<{
    success: boolean;
    membersDeleted: number;
}>;
//# sourceMappingURL=branch.service.d.ts.map