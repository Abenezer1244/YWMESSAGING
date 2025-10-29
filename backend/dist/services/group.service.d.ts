export interface CreateGroupData {
    name: string;
    description?: string;
    welcomeMessageEnabled?: boolean;
    welcomeMessageText?: string;
}
export interface UpdateGroupData {
    name?: string;
    description?: string;
    welcomeMessageEnabled?: boolean;
    welcomeMessageText?: string;
}
/**
 * Get all groups for a branch with member counts
 */
export declare function getGroups(branchId: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    welcomeMessageEnabled: boolean;
    welcomeMessageText: string | null;
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
}[]>;
/**
 * Create new group in a branch
 */
export declare function createGroup(branchId: string, data: CreateGroupData): Promise<{
    id: string;
    name: string;
    description: string | null;
    welcomeMessageEnabled: boolean;
    welcomeMessageText: string | null;
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Update group
 */
export declare function updateGroup(groupId: string, data: UpdateGroupData): Promise<{
    id: string;
    name: string;
    description: string | null;
    welcomeMessageEnabled: boolean;
    welcomeMessageText: string | null;
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Delete group and cascade members
 */
export declare function deleteGroup(groupId: string): Promise<{
    success: boolean;
    deletedMembersCount: number;
}>;
//# sourceMappingURL=group.service.d.ts.map