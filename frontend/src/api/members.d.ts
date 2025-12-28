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
 * Get all members with pagination
 */
export declare function getMembers(options?: {
    page?: number;
    limit?: number;
    search?: string;
}): Promise<MembersResponse>;
/**
 * Add a single member
 */
export declare function addMember(data: CreateMemberData): Promise<Member>;
/**
 * Import members from CSV file
 */
export declare function importMembers(file: File): Promise<{
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
 * Remove a member
 */
export declare function removeMember(memberId: string): Promise<any>;
//# sourceMappingURL=members.d.ts.map