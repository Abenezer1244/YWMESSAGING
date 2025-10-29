export interface Member {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    optInSms: boolean;
    createdAt: string;
}
export interface CreateMemberData {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    optInSms?: boolean;
}
export interface MembersResponse {
    data: Member[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
/**
 * Get all members in a group with pagination
 */
export declare function getMembers(groupId: string, options?: {
    page?: number;
    limit?: number;
    search?: string;
}): Promise<MembersResponse>;
/**
 * Add a single member to a group
 */
export declare function addMember(groupId: string, data: CreateMemberData): Promise<Member>;
/**
 * Import members from CSV file
 */
export declare function importMembers(groupId: string, file: File): Promise<{
    imported: number;
    failed: number;
    failedDetails?: Array<{
        member: any;
        error: string;
    }>;
}>;
/**
 * Update a member
 */
export declare function updateMember(memberId: string, data: Partial<CreateMemberData>): Promise<Member>;
/**
 * Remove a member from a group
 */
export declare function removeMember(groupId: string, memberId: string): Promise<any>;
//# sourceMappingURL=members.d.ts.map