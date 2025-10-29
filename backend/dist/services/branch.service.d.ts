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
 * Get all branches for a church
 */
export declare function getBranches(churchId: string): Promise<{
    id: string;
    churchId: string;
    name: string;
    address: string | null;
    phone: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    groupCount: number;
    memberCount: number;
}[]>;
/**
 * Create a new branch
 * Checks plan limit first (defaults to STARTER plan for new churches)
 */
export declare function createBranch(churchId: string, input: CreateBranchInput): Promise<{
    id: string;
    churchId: string;
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
export declare function updateBranch(branchId: string, churchId: string, input: UpdateBranchInput): Promise<{
    id: string;
    churchId: string;
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
export declare function deleteBranch(branchId: string, churchId: string): Promise<{
    success: boolean;
    groupsDeleted: number;
    membersDeleted: number;
}>;
//# sourceMappingURL=branch.service.d.ts.map