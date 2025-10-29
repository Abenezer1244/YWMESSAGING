export interface UpdateChurchInput {
    name?: string;
    email?: string;
    description?: string;
}
/**
 * Update church profile
 */
export declare function updateChurchProfile(churchId: string, input: UpdateChurchInput): Promise<{
    id: string;
    name: string;
    email: string;
    stripeCustomerId: string | null;
    twilioAccountSid: string | null;
    twilioAuthToken: string | null;
    twilioPhoneNumber: string | null;
    twilioVerified: boolean;
    trialEndsAt: Date;
    subscriptionStatus: string;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Get church profile
 */
export declare function getChurchProfile(churchId: string): Promise<{
    email: string;
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    subscriptionStatus: string;
} | null>;
/**
 * Get all co-admins for a church
 */
export declare function getCoAdmins(churchId: string): Promise<{
    role: string;
    email: string;
    id: string;
    firstName: string;
    lastName: string;
    lastLoginAt: Date | null;
    createdAt: Date;
}[]>;
/**
 * Remove a co-admin
 */
export declare function removeCoAdmin(churchId: string, adminId: string): Promise<void>;
/**
 * Log an activity
 */
export declare function logActivity(churchId: string, adminId: string, action: string, details?: Record<string, any>): Promise<{
    churchId: string;
    adminId: string;
    action: string;
    details: string;
    timestamp: Date;
} | undefined>;
/**
 * Get activity logs for a church
 */
export declare function getActivityLogs(churchId: string, limit?: number, offset?: number): Promise<{
    id: string;
    churchId: string;
    action: string;
    details: string;
    timestamp: Date;
    adminEmail: string;
}[]>;
/**
 * Get activity log count
 */
export declare function getActivityLogCount(churchId: string): Promise<number>;
//# sourceMappingURL=admin.service.d.ts.map