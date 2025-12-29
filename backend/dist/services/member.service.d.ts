import { PrismaClient } from '@prisma/client';
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
 * Get all members with pagination and search
 */
export declare function getMembers(tenantId: string, tenantPrisma: PrismaClient, options?: {
    page?: number;
    limit?: number;
    search?: string;
}): Promise<{
    data: {
        phone: string;
        id: string;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        optInSms: boolean;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Add single member
 */
export declare function addMember(tenantId: string, tenantPrisma: PrismaClient, data: CreateMemberData): Promise<{
    id: any;
    firstName: any;
    lastName: any;
    phone: string;
    phoneHash: string;
    email: string | undefined;
    optInSms: boolean;
    createdAt: any;
}>;
/**
 * Bulk import members
 * ✅ OPTIMIZED: Batch operations instead of per-member queries
 * Before: 500 queries (2-5 per member in loop)
 * After: 3 queries (1 for fetch existing, 1 for create members, 1 for success)
 */
export declare function importMembers(tenantId: string, tenantPrisma: PrismaClient, membersData: Array<{
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
export declare function updateMember(tenantId: string, tenantPrisma: PrismaClient, memberId: string, data: UpdateMemberData): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    optInSms: boolean;
    createdAt: Date;
}>;
/**
 * Delete a member
 */
export declare function deleteMember(tenantId: string, tenantPrisma: PrismaClient, memberId: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    phoneHash: string | null;
    email: string | null;
    encryptedEmail: string | null;
    emailHash: string | null;
    optInSms: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=member.service.d.ts.map