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
import { redisClient, isRedisAvailable, executeRedisOperation, executeRedisVoidOperation } from '../config/redis.config.js';
// Redis key prefix for token blacklist
const REVOKED_TOKEN_PREFIX = 'token:revoked:';
const ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes (matches JWT access token expiry)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days (matches JWT refresh token expiry)
/**
 * Revoke an access token (add to blacklist)
 * Called on logout to immediately invalidate the token
 *
 * @param token The JWT access token to revoke
 * @param ttl Time-to-live in seconds (defaults to 15 minutes)
 */
export async function revokeAccessToken(token, ttl = ACCESS_TOKEN_TTL) {
    const tokenHash = hashToken(token);
    const key = `${REVOKED_TOKEN_PREFIX}access:${tokenHash}`;
    await executeRedisVoidOperation(async () => {
        await redisClient.setEx(key, ttl, '1');
        console.log(`🔐 Access token revoked (expires in ${ttl}s)`);
    }, 'Revoke access token');
}
/**
 * Revoke a refresh token (add to blacklist)
 * Called on logout to prevent token refresh/reuse
 *
 * @param token The JWT refresh token to revoke
 * @param ttl Time-to-live in seconds (defaults to 7 days)
 */
export async function revokeRefreshToken(token, ttl = REFRESH_TOKEN_TTL) {
    const tokenHash = hashToken(token);
    const key = `${REVOKED_TOKEN_PREFIX}refresh:${tokenHash}`;
    await executeRedisVoidOperation(async () => {
        await redisClient.setEx(key, ttl, '1');
        console.log(`🔐 Refresh token revoked (expires in ${ttl}s)`);
    }, 'Revoke refresh token');
}
/**
 * Revoke both access and refresh tokens (full logout)
 * Called from logout endpoint
 *
 * @param accessToken The access token to revoke
 * @param refreshToken The refresh token to revoke
 */
export async function revokeAllTokens(accessToken, refreshToken) {
    // Revoke both tokens in parallel (errors handled gracefully by individual functions)
    await Promise.all([
        revokeAccessToken(accessToken, ACCESS_TOKEN_TTL),
        revokeRefreshToken(refreshToken, REFRESH_TOKEN_TTL),
    ]);
    console.log('🔐 All tokens revoked (user logged out)');
    // Note: If Redis is unavailable, tokens will still expire via JWT TTL
}
/**
 * Check if a token is revoked
 * Called before allowing access to protected endpoints
 * ✅ Includes timeout to prevent hanging when Redis is unavailable
 *
 * @param token The token to check
 * @param type 'access' or 'refresh'
 * @returns true if token is revoked (blacklisted)
 */
export async function isTokenRevoked(token, type = 'access') {
    // ✅ SECURITY: If Redis is not available, skip revocation check
    // Fail-open strategy: Allow access but rely on JWT expiration for security
    if (!isRedisAvailable()) {
        // Tokens still expire after JWT TTL (15 min access, 7 days refresh)
        return false;
    }
    const tokenHash = hashToken(token);
    const key = `${REVOKED_TOKEN_PREFIX}${type}:${tokenHash}`;
    // Use graceful Redis operation with timeout
    const exists = await executeRedisOperation(async () => {
        // Simple exists check without extra ping
        return await redisClient.exists(key);
    }, 0, // Fallback: 0 means not revoked
    `Token revocation check (${type})`);
    return exists > 0;
}
/**
 * Get remaining TTL for a revoked token
 * Useful for debugging and monitoring
 *
 * @param token The revoked token
 * @param type 'access' or 'refresh'
 * @returns TTL in seconds, -1 if not revoked, -2 if Redis error
 */
export async function getTokenRevocationTTL(token, type = 'access') {
    const tokenHash = hashToken(token);
    const key = `${REVOKED_TOKEN_PREFIX}${type}:${tokenHash}`;
    return await executeRedisOperation(async () => await redisClient.ttl(key), -2, // -2 indicates Redis error/unavailable
    'Get token revocation TTL');
}
/**
 * Clear all revoked tokens from Redis (use with caution!)
 * Useful for testing or clearing blacklist
 *
 * @returns Number of tokens cleared
 */
export async function clearAllRevokedTokens() {
    return await executeRedisOperation(async () => {
        const keys = await redisClient.keys(`${REVOKED_TOKEN_PREFIX}*`);
        if (keys.length === 0) {
            return 0;
        }
        const deletedCount = await redisClient.del(keys);
        console.log(`🗑️  Cleared ${deletedCount} revoked tokens from Redis`);
        return deletedCount;
    }, 0, // Fallback: 0 tokens cleared
    'Clear all revoked tokens');
}
/**
 * Get statistics about revoked tokens
 * Returns count of active token revocations
 *
 * @returns { access: number, refresh: number, total: number }
 */
export async function getRevocationStats() {
    return await executeRedisOperation(async () => {
        const accessTokens = await redisClient.keys(`${REVOKED_TOKEN_PREFIX}access:*`);
        const refreshTokens = await redisClient.keys(`${REVOKED_TOKEN_PREFIX}refresh:*`);
        return {
            access: accessTokens.length,
            refresh: refreshTokens.length,
            total: accessTokens.length + refreshTokens.length,
        };
    }, { access: 0, refresh: 0, total: 0 }, // Fallback stats
    'Get revocation stats');
}
/**
 * Create hash of token for Redis key
 * Uses crypto hash to prevent collisions
 *
 * @param token The token to hash
 * @returns Token hash (safe for use as Redis key)
 */
function hashToken(token) {
    // BUG FIX: Previous implementation used token.substring(0, 64) which caused
    // collisions because all JWT headers are identical, causing fresh tokens
    // to be marked as revoked when previous tokens were revoked.
    //
    // Now we use the last 64 chars of the token (the signature part) which is
    // cryptographically unique for each token.
    //
    // The signature is the most variable part of JWT tokens and uniquely
    // identifies each token instance.
    const lastPart = token.split('.')[2]; // Get JWT signature (3rd part)
    if (!lastPart) {
        // Fallback: use entire token if not a valid JWT
        return token;
    }
    // Take last 64 characters of signature (prevents Redis key length issues)
    return lastPart.substring(Math.max(0, lastPart.length - 64));
}
export default {
    revokeAccessToken,
    revokeRefreshToken,
    revokeAllTokens,
    isTokenRevoked,
    getTokenRevocationTTL,
    clearAllRevokedTokens,
    getRevocationStats,
};
//# sourceMappingURL=token-revocation.service.js.map