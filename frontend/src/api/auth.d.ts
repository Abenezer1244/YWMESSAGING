export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    churchName: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    success: boolean;
    data: {
        adminId: string;
        churchId: string;
        accessToken: string;
        refreshToken: string;
        admin: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        church: {
            id: string;
            name: string;
            email: string;
            trialEndsAt: string;
        };
    };
}
/**
 * Register a new church
 */
export declare function register(data: RegisterRequest): Promise<AuthResponse>;
/**
 * Login with email and password
 */
export declare function login(data: LoginRequest): Promise<AuthResponse>;
/**
 * Refresh access token via httpOnly cookies
 */
export declare function refreshToken(): Promise<{
    success: boolean;
    data?: {
        accessToken: string;
        refreshToken: string;
    };
}>;
/**
 * Get current user
 */
export declare function getMe(): Promise<{
    success: boolean;
    data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        church: {
            id: string;
            name: string;
            email: string;
            trialEndsAt: string;
        };
    };
}>;
//# sourceMappingURL=auth.d.ts.map