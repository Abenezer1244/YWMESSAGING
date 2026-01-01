# Settings Page Showing Wrong Church Data - Bug Fix Plan

**Date**: January 1, 2026
**Status**: 🔴 AWAITING USER APPROVAL

## Problem Summary

User logged into "ALLMIGHTY GOD CHURCH" sees:
- **Sidebar**: Shows "ALLMIGHTY GOD CHURCH" (CORRECT - from authStore)
- **Settings page**: Shows "yesuway" data (WRONG - from API)
- **Phone Numbers tab**: Shows "No phone number" (WRONG - phone IS linked in database)

## Root Cause Analysis

### Data Flow
1. **Sidebar** gets data from `authStore.church` (set on login via frontend Zustand state)
2. **Settings page** gets data from `getProfile()` API call which uses JWT token
3. The JWT token comes from:
   - HTTPOnly cookie (PREFERRED by backend - line 39)
   - OR Authorization header (FALLBACK - line 55)

### The Bug (auth.middleware.ts:39-56)

```javascript
// Current: Cookie is PREFERRED
let token = req.cookies.accessToken;
if (!token) {
  const authHeader = req.headers['authorization'];
  token = authHeader && authHeader.split(' ')[1];
}
```

**What happens:**
1. User A (yesuway) logs in → cookie set with User A's token
2. User B (ALLMIGHTY) logs in on same browser:
   - Frontend authStore updated correctly with User B data
   - Cookie SHOULD be updated but may not clear properly
3. API calls use the COOKIE (User A's old token) instead of Authorization header (User B's correct token)
4. Backend returns User A's data to User B!

### Why the cookie isn't being updated:
- The `res.clearCookie()` may not match the original cookie attributes exactly
- Or there's a timing issue with cookie domain/path

## Solution: Prefer Authorization Header

Change auth middleware to prefer the **Authorization header** when present:

```javascript
// NEW: Authorization header is PREFERRED (always fresh from authStore)
let token = null;
const authHeader = req.headers['authorization'];
if (authHeader && authHeader.startsWith('Bearer ')) {
  token = authHeader.split(' ')[1]; // Prefer explicit header
}
if (!token) {
  token = req.cookies.accessToken; // Fallback to cookie
}
```

**Why this works:**
- The Authorization header is always set from `authStore.accessToken`
- The authStore is properly cleared on login/logout (we fixed this earlier)
- Cookies become a fallback (useful if header is missing)

## Implementation Plan

- [ ] 1. Update auth middleware to prefer Authorization header
- [ ] 2. Test with both accounts to verify isolation
- [ ] 3. Deploy fix

## Code Change

**File**: `backend/src/middleware/auth.middleware.ts`
**Lines**: 39-56
**Change**: Reverse the order of token preference

## Risk Assessment

**Low Risk**:
- The Authorization header already works (tested in earlier audit)
- This just changes the ORDER of preference
- No new code paths introduced
- Cookies still work as fallback

## Success Criteria

- [ ] User A sees only User A's data
- [ ] User B sees only User B's data
- [ ] Phone number shows correctly for each account
- [ ] Settings page shows correct church profile
