# Logout Bug Analysis & Resolution Plan

## Current Status: LOGOUT ENDPOINT WORKING, TOKEN REVOCATION BROKEN

**Date:** December 25, 2024
**Severity:** HIGH - Security issue: Users can still access protected endpoints after logout

## Problem Summary

The logout button doesn't actually log users out. After calling the logout endpoint:
- ✅ Endpoint responds with HTTP 200
- ✅ Cookies are cleared
- ❌ Access tokens remain valid and can still access protected endpoints
- ❌ User receives 200 instead of 401 on protected endpoints

## Root Cause Analysis

### Phase 1: Initial Debugging (Resolved)
The logout endpoint was hanging due to axios connection pooling issues:
- **Symptom**: Requests timeout after 15+ seconds
- **Root Cause**: axios default pool settings causing connection reuse issues
- **Fix Applied**: Create axios instances with `httpsAgent: new https.Agent({ keepAlive: false })`
- **Result**: ✅ Endpoint now responds in ~200-300ms

### Phase 2: Current Issue (Active)
After fixing the hang, the endpoint responds but doesn't revoke tokens:
- **Symptom**: Tokens remain valid after logout
- **Expected**: `isTokenRevoked()` in middleware should return 401
- **Actual**: Tokens bypass revocation check and return 200
- **Scope**: Token revocation logic in Redis

## Code Flow Analysis

### Logout Flow:
```
POST /api/auth/logout { Authorization: Bearer <token> }
  ↓
logout() controller [auth.controller.ts:292]
  ├─ Extract token from Authorization header
  ├─ Verify token with verifyAccessToken()
  ├─ Call revokeAccessToken(<token>)
  │  └─ Hash token (first 64 chars)
  │  └─ Store in Redis: token:revoked:access:<hash> = '1' (15min TTL)
  ├─ Clear cookies
  └─ Return 200 { success: true }

Subsequent Request:
GET /api/admin/profile { Authorization: Bearer <token> }
  ↓
authenticateToken middleware [auth.middleware.ts:20]
  ├─ Extract token from header
  ├─ Verify JWT signature (valid)
  ├─ Call isTokenRevoked(<token>, 'access')
  │  ├─ Hash token (same method as revocation)
  │  ├─ Check Redis: EXISTS token:revoked:access:<hash>
  │  └─ Should return: true (revoked)
  ├─ If revoked: Return 401 ✗ NOT HAPPENING
  └─ If not revoked: Continue to controller ✓ HAPPENING
```

## Hypothesis - Why Token Revocation Fails

### Hypothesis 1: Redis Storage Issue
**Theory**: Token is not actually being stored in Redis
**Evidence to Check**:
- Is Redis connected on Render?
- Does `redisClient.setEx()` return success?
- Are tokens actually being stored in Redis?
- Redis logs showing failures?

**Test Needed**:
- Add logging to revokeAccessToken() to confirm Redis write
- Check Redis directly if accessible

### Hypothesis 2: Token Hash Mismatch
**Theory**: Token hash computed differently in revocation vs verification
**Evidence to Check**:
- Both use same `hashToken()` function?
- Token strings identical between requests?
- Character encoding issues?

**Code Review**:
```typescript
// token-revocation.service.ts:212
function hashToken(token: string): string {
  return token.substring(0, 64);  // First 64 characters
}
```

Both `revokeAccessToken()` and `isTokenRevoked()` call this same function, so hashes should match.

### Hypothesis 3: Redis Connection State
**Theory**: Redis check `if (!redisClient.isOpen)` is wrong
**Location**: token-revocation.service.ts:106
**Code**:
```typescript
if (!redisClient.isOpen) {
  console.warn('⚠️  Redis unavailable');
  return false;  // Assumes token not revoked - ALLOWS ACCESS
}
```

**Problem**: If Redis is disconnected, `isTokenRevoked()` returns `false`, allowing tokens through! This is a fallback for availability, but defeats security.

### Hypothesis 4: Wrong Redis Data Type or Key Format
**Theory**: Data being stored but with different key format
**Example**:
- Expected key: `token:revoked:access:abc123...`
- Actual key: `token:revoked:acc:abc123...` (typo)
- Or different separator: `token_revoked_access_abc123...`

**Check**: Review both revoke and verify code for key format

## Critical Findings

### Issue in auth.middleware.ts (Lines 54-58)
```typescript
// ✅ SECURITY: Check if token has been revoked (logged out)
const revoked = await isTokenRevoked(token, 'access');
if (revoked) {
  res.status(401).json({ error: 'Token has been revoked. Please log in again.' });
  return;
}
```

This looks correct. If `isTokenRevoked()` returns true, should return 401.

### Issue in token-revocation.service.ts (Lines 106-109)
```typescript
if (!redisClient.isOpen) {
  console.warn('⚠️  Redis unavailable - skipping token revocation check (security degraded)');
  return false;  // ← SECURITY ISSUE: Allows any token if Redis down!
}
```

**This is the likely culprit**: If Redis is having issues in production, tokens are not being revoked. The system fails open (allows access) instead of failing closed (denies access).

## Next Steps to Debug

1. **Check Redis Availability**
   - Is Redis actually connected on Render?
   - Test with a redis-cli command if possible
   - Check Redis error logs

2. **Add Detailed Logging**
   - Log in `revokeAccessToken()` after Redis write
   - Log in `isTokenRevoked()` showing Redis query results
   - Log token hash values to verify they match

3. **Test Redis Directly**
   - Try storing a test token in Redis
   - Query it back to confirm TTL works
   - Verify key format matches

4. **Alternative: Fail-Secure Logout**
   - If Redis is unreliable, generate a new secret for token verification
   - Include logout timestamp in token verification
   - Tokens issued before logout time = invalid

## Commits Made So Far

| Commit | Change | Issue |
|--------|--------|-------|
| c4e475d | Extract token from Authorization header in logout | ✓ Working (tokens extracted) |
| 44bee24 | Protect logout with authenticateToken middleware | ✗ Reverted: Caused hanging |
| 6bd9a6e | Simplified logout, removed middleware | ✓ Working (no hang) |
| 38143b0 | Separate token revocation calls | ✓ Code simplified |
| 8be0f79 | Disabled revocation for testing | ✓ Confirmed revocation was issue |
| 93ed1c9 | Re-enabled revocation | ✓ But not actually working |

## Files Involved

- **backend/src/controllers/auth.controller.ts** - Logout handler (revokes tokens)
- **backend/src/middleware/auth.middleware.ts** - Checks token revocation (broken)
- **backend/src/services/token-revocation.service.ts** - Redis revocation logic (not working)
- **backend/src/config/redis.config.ts** - Redis client initialization
- **backend/src/routes/auth.routes.ts** - Routes definition

## Summary

The logout endpoint is now **responding correctly** (no hang), but **token revocation is broken**. The most likely cause is that Redis is either:
1. Not connected/available in production
2. Returning errors silently
3. Has a different key format than expected

The secure fix is to ensure either:
- Redis works reliably OR
- System fails closed (denies access) when Redis is unavailable

Current code fails open (allows access when Redis unavailable), which is a security issue.
