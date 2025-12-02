export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    churchName: string;
}
export interface RegisterResponse {
    adminId: string;
    churchId: string;
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
    adminId: string;
    churchId: string;
    accessToken: string;
    refreshToken: string;
    admin: any;
    church: any;
}
/**
 * Register a new church and admin
 */
export declare function registerChurch(input: RegisterInput): Promise<RegisterResponse>;
/**
 * Login with email and password
 */
export declare function login(input: LoginInput): Promise<LoginResponse>;
/**
 * Refresh access token
 */
export declare function refreshAccessToken(adminId: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
/**
 * Get admin by ID (cached for 30 minutes)
 */
export declare function getAdmin(adminId: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    welcomeCompleted: boolean;
    userRole: string | null;
    church: {
        id: string;
        name: string;
        email: string;
        trialEndsAt: Date;
    };
} | null>;
//# sourceMappingURL=auth.service.d.ts.map