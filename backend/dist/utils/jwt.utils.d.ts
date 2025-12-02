export interface AccessTokenPayload {
    adminId: string;
    churchId: string;
    role: string;
}
export interface RefreshTokenPayload {
    adminId: string;
}
export interface MFASessionTokenPayload {
    adminId: string;
    churchId: string;
}
/**
 * Generate access token (short-lived: 15 minutes)
 */
export declare function generateAccessToken(adminId: string, churchId: string, role: string): string;
/**
 * Generate refresh token (long-lived: 7 days)
 */
export declare function generateRefreshToken(adminId: string): string;
/**
 * Verify access token
 */
export declare function verifyAccessToken(token: string): AccessTokenPayload | null;
/**
 * Verify refresh token
 */
export declare function verifyRefreshToken(token: string): RefreshTokenPayload | null;
/**
 * Generate MFA session token (very short-lived: 5 minutes)
 * Used during MFA verification step in login flow
 */
export declare function generateMFASessionToken(adminId: string, churchId: string): string;
/**
 * Verify MFA session token
 */
export declare function verifyMFASessionToken(token: string): MFASessionTokenPayload | null;
/**
 * Decode token without verification (for debugging)
 */
export declare function decodeToken(token: string): any;
//# sourceMappingURL=jwt.utils.d.ts.map