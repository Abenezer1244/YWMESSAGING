export interface CreateMemberData {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    optInSms?: boolean;
}
export interface UpdateMemberData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    optInSms?: boolean;
}
/**
 * Get members for a group with pagination and search
 * Note: Search results are not cached (search is dynamic)
 */
export declare function getMembers(groupId: string, options?: {
    page?: number;
    limit?: number;
    search?: string;
}): Promise<{
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Add single member to group
 */
export declare function addMember(groupId: string, data: CreateMemberData): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    optInSms: boolean;
    createdAt: Date;
}>;
/**
 * Bulk import members to group
 * ✅ OPTIMIZED: Batch operations instead of per-member queries
 * Before: 500 queries (2-5 per member in loop)
 * After: 5 queries (1 for fetch existing, 1 for create members, 1 for check existing groupMembers, 1 for create groupMembers, multiple queueWelcomeMessage)
 */
export declare function importMembers(groupId: string, membersData: Array<{
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
}>): Promise<{
    imported: number;
    failed: number;
    failedDetails: {
        member: any;
        error: string;
    }[];
}>;
/**
 * Update member
 */
export declare function updateMember(memberId: string, data: UpdateMemberData): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    optInSms: boolean;
    createdAt: Date;
}>;
/**
 * Remove member from group
 */
export declare function removeMemberFromGroup(groupId: string, memberId: string): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=member.service.d.ts.map