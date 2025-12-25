/**
 * ✅ SECURITY: Token Revocation Service
 *
 * Manages token blacklist to prevent use of revoked tokens
 * Prevents session hijacking and unauthorized access after logout
 *
 * How it works:
 * 1. User logs out → tokens added to Redis blacklist with TTL
 * 2. Every protected request checks if token is in blacklist
 * 3. Tokens naturally expire from Redis after TTL (matching JWT expiry)
 * 4. No need to manually delete - Redis handles cleanup
 *
 * Performance:
 * - O(1) lookup time (Redis hash)
 * - Minimal memory usage (only stores token hashes)
 * - Automatic cleanup via Redis TTL
 */
/**
 * Revoke an access token (add to blacklist)
 * Called on logout to immediately invalidate the token
 *
 * @param token The JWT access token to revoke
 * @param ttl Time-to-live in seconds (defaults to 15 minutes)
 */
export declare function revokeAccessToken(token: string, ttl?: number): Promise<void>;
/**
 * Revoke a refresh token (add to blacklist)
 * Called on logout to prevent token refresh/reuse
 *
 * @param token The JWT refresh token to revoke
 * @param ttl Time-to-live in seconds (defaults to 7 days)
 */
export declare function revokeRefreshToken(token: string, ttl?: number): Promise<void>;
/**
 * Revoke both access and refresh tokens (full logout)
 * Called from logout endpoint
 *
 * @param accessToken The access token to revoke
 * @param refreshToken The refresh token to revoke
 */
export declare function revokeAllTokens(accessToken: string, refreshToken: string): Promise<void>;
/**
 * Check if a token is revoked
 * Called before allowing access to protected endpoints
 * ✅ Includes timeout to prevent hanging when Redis is unavailable
 *
 * @param token The token to check
 * @param type 'access' or 'refresh'
 * @returns true if token is revoked (blacklisted)
 */
export declare function isTokenRevoked(token: string, type?: 'access' | 'refresh'): Promise<boolean>;
/**
 * Get remaining TTL for a revoked token
 * Useful for debugging and monitoring
 *
 * @param token The revoked token
 * @param type 'access' or 'refresh'
 * @returns TTL in seconds, -1 if not revoked, -2 if Redis error
 */
export declare function getTokenRevocationTTL(token: string, type?: 'access' | 'refresh'): Promise<number>;
/**
 * Clear all revoked tokens from Redis (use with caution!)
 * Useful for testing or clearing blacklist
 *
 * @returns Number of tokens cleared
 */
export declare function clearAllRevokedTokens(): Promise<number>;
/**
 * Get statistics about revoked tokens
 * Returns count of active token revocations
 *
 * @returns { access: number, refresh: number, total: number }
 */
export declare function getRevocationStats(): Promise<{
    access: number;
    refresh: number;
    total: number;
}>;
declare const _default: {
    revokeAccessToken: typeof revokeAccessToken;
    revokeRefreshToken: typeof revokeRefreshToken;
    revokeAllTokens: typeof revokeAllTokens;
    isTokenRevoked: typeof isTokenRevoked;
    getTokenRevocationTTL: typeof getTokenRevocationTTL;
    clearAllRevokedTokens: typeof clearAllRevokedTokens;
    getRevocationStats: typeof getRevocationStats;
};
export default _default;
//# sourceMappingURL=token-revocation.service.d.ts.map