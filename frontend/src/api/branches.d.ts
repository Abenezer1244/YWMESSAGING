import { Branch } from '../stores/branchStore';
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
export declare function getBranches(churchId: string): Promise<Branch[]>;
/**
 * Create a new branch
 */
export declare function createBranch(churchId: string, data: CreateBranchInput): Promise<Branch>;
/**
 * Update an existing branch
 */
export declare function updateBranch(branchId: string, data: UpdateBranchInput): Promise<Branch>;
/**
 * Delete a branch
 */
export declare function deleteBranch(branchId: string): Promise<{
    success: boolean;
    groupsDeleted: number;
    membersDeleted: number;
}>;
//# sourceMappingURL=branches.d.ts.map