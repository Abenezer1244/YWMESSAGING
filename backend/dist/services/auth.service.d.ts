/**
 * Authentication Service (Multi-Tenant)
 *
 * Handles:
 * - Church registration (creates Tenant in registry, provisions database, creates Admin)
 * - Admin login (finds tenant via registry, accesses tenant database)
 * - Token management
 */
export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    churchName: string;
}
export interface RegisterResponse {
    tenantId: string;
    adminId: string;
    accessToken: string;
    refreshToken: string;
    admin: any;
    church: any;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface LoginResponse {
    tenantId: string;
    adminId: string;
    accessToken: string;
    refreshToken: string;
    admin: any;
    church: any;
}
/**
 * Register a new church and admin
 * Uses single-database setup for MVP
 */
export declare function registerChurch(input: RegisterInput): Promise<RegisterResponse>;
/**
 * Login with email and password
 * 1. Find tenant via email hash in AdminEmailIndex (registry)
 * 2. Get admin from tenant database
 * 3. Verify password
 * 4. Generate tokens
 */
export declare function login(input: LoginInput): Promise<LoginResponse>;
/**
 * Refresh access token
 * Generates new tokens with existing tenantId
 */
export declare function refreshAccessToken(adminId: string, tenantId: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
/**
 * Get admin by ID
 * Cached for 30 minutes
 */
export declare function getAdmin(adminId: string, tenantId: string): Promise<any>;
//# sourceMappingURL=auth.service.d.ts.map