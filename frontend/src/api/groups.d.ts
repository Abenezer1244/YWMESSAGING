import { Group } from '../stores/groupStore';
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
 * Get all groups for a branch
 */
export declare function getGroups(branchId: string): Promise<Group[]>;
/**
 * Create a new group
 */
export declare function createGroup(branchId: string, data: CreateGroupData): Promise<Group>;
/**
 * Update a group
 */
export declare function updateGroup(groupId: string, data: UpdateGroupData): Promise<Group>;
/**
 * Delete a group
 */
export declare function deleteGroup(groupId: string): Promise<any>;
//# sourceMappingURL=groups.d.ts.map