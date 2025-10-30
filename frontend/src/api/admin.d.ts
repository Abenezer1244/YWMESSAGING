export interface ChurchProfile {
    id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
    createdAt: string;
    updatedAt: string;
}
export interface CoAdmin {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    lastLoginAt: string | null;
    createdAt: string;
}
export interface ActivityLog {
    id: string;
    churchId: string;
    action: string;
    details: string;
    timestamp: string;
    adminEmail: string;
}
export interface ActivityLogsResponse {
    logs: ActivityLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
/**
 * Get church profile
 */
export declare function getProfile(): Promise<ChurchProfile>;
/**
 * Update church profile
 */
export declare function updateProfile(data: {
    name?: string;
    email?: string;
    description?: string;
}): Promise<{
    success: boolean;
    profile: ChurchProfile;
}>;
/**
 * Get all co-admins
 */
export declare function getCoAdmins(): Promise<CoAdmin[]>;
/**
 * Invite a new co-admin
 */
export declare function inviteCoAdmin(data: {
    email: string;
    firstName: string;
    lastName: string;
}): Promise<{
    success: boolean;
    data: {
        admin: CoAdmin;
        tempPassword: string;
    };
}>;
/**
 * Remove a co-admin
 */
export declare function removeCoAdmin(adminId: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Get activity logs
 */
export declare function getActivityLogs(page?: number, limit?: number): Promise<ActivityLogsResponse>;
/**
 * Log an activity
 */
export declare function logActivity(action: string, details: Record<string, any>): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=admin.d.ts.map