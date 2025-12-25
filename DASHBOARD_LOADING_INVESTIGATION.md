# Dashboard Loading Investigation Report

**Date**: 2025-12-24
**Issue**: Dashboard shows continuous loading/spinner after successful sign-in
**Investigation Method**: Playwright automated testing with network monitoring

---

## Initial Findings from Debug Test

### 1. Signup Page Issue (Preliminary Discovery)

When navigating to `https://koinoniasms.com/signup`:
- **Result**: Blank white page (see screenshot: `debug-01-signup-page.png`)
- **Note**: Correct route is `/register` (not `/signup`)
- **API Calls Made**:
  - `GET /api/csrf-token` - **200 OK** ✅
  - `GET /api/auth/me` - **401 Unauthorized** ✅ (Expected - not logged in)
  - `POST /api/auth/refresh` - **400 Bad Request** ❌ (Suspicious)

### 2. Suspicious Behavior: Refresh Token Call on Non-Authenticated Page

**Issue**: The app is making a `POST /api/auth/refresh` call even when the user is NOT logged in (on signup/register page).

**Why This is Problematic**:
- Refresh endpoint should only be called when there's an existing session
- Getting a 400 error suggests the app is trying to refresh non-existent tokens
- This could be causing issues with the auth flow

**Likely Source**: `App.tsx` lines 128-169
```typescript
.catch(async (error) => {
  // getMe() failed - try refreshing token to extend session
  try {
    const refreshResponse = await refreshToken(); // ← This is being called
    // ...
  }
})
```

The app's initialization sequence:
1. Tries to restore auth from sessionStorage
2. Calls `getMe()` to check current session
3. If `getMe()` fails (401), it automatically tries `refreshToken()`
4. **PROBLEM**: This happens even on public pages where user has never logged in

---

## Next Steps for Investigation

### Step 1: Test Login Flow with Real Credentials

I've created a detailed debug script: `debug-login-only.js`

**To run it**:
```bash
node debug-login-only.js
```

**IMPORTANT**: Update lines 175-176 with your test credentials:
```javascript
const testEmail = 'your-email@example.com';  // ← UPDATE THIS
const testPassword = 'your-password';  // ← UPDATE THIS
```

**What it will do**:
1. Navigate to login page
2. Fill in credentials
3. Click sign in
4. Monitor ALL network activity
5. Track cookies (especially `refreshToken` and `accessToken`)
6. Check for loading indicators on dashboard
7. Capture screenshots at each step
8. Generate comprehensive report

### Step 2: Key Things to Look For

When the script runs, watch for:

1. **Authentication Cookies**
   - Is `refreshToken` cookie being set?
   - Is it `HttpOnly`, `Secure`, `SameSite=Strict`?
   - Is it being sent with subsequent requests?

2. **Failed API Calls**
   - Any 401 errors after login?
   - Any 400/500 errors?
   - Which specific endpoint is failing?

3. **Stuck Loading State**
   - Which component/section shows the spinner?
   - Does it timeout or loop forever?
   - Are requests being retried continuously?

4. **Network Request Pattern**
   - Is there a request that never completes?
   - Is the same request being made repeatedly?
   - Are there CORS errors?

---

## Hypotheses for Dashboard Loading Issue

Based on App.tsx code analysis:

### Hypothesis 1: getMe() Failing in Loop
**Theory**: After successful login, the dashboard calls `getMe()` which fails (401), triggers refresh, which also fails, causing continuous loading.

**Evidence Needed**:
- Check if `getMe()` returns 401 after signin
- Check if refresh token cookie exists but is invalid
- Check if app is stuck in refresh loop

### Hypothesis 2: Missing/Invalid Refresh Token Cookie
**Theory**: Login succeeds but refresh token cookie is not properly set (wrong domain, path, or sameSite attribute).

**Evidence Needed**:
- Inspect cookies after successful login
- Check if `refreshToken` cookie domain matches API domain
- Verify cookie is sent with `/api/auth/me` request

### Hypothesis 3: Branch Loading Failing
**Theory**: Dashboard waits for branches to load (lines 172-180 in App.tsx), but `getBranches()` is failing or hanging.

**Evidence Needed**:
- Check if `GET /api/churches/{churchId}/branches` is being called
- Check if it returns data or errors
- Check if dashboard is waiting for this response

### Hypothesis 4: CSRF Token Issue
**Theory**: After login, CSRF token becomes invalid or missing, causing subsequent API calls to fail.

**Evidence Needed**:
- Check if `_csrf` cookie exists after login
- Check if it's being sent with API requests
- Check for 403 Forbidden responses

### Hypothesis 5: DashboardPage Component Issue
**Theory**: The DashboardPage itself has a loading state that never resolves (useState stuck in loading).

**Evidence Needed**:
- Check DashboardPage.tsx for useState hooks with loading state
- Check for useEffect hooks that might not be completing
- Check for conditional rendering based on loading state

---

## Files to Investigate

1. **`frontend/src/App.tsx`** (lines 128-180)
   - Authentication restoration logic
   - Refresh token retry logic

2. **`frontend/src/pages/DashboardPage.tsx`**
   - Component loading states
   - Data fetching logic

3. **`frontend/src/api/auth.ts`**
   - `getMe()` implementation
   - `refreshToken()` implementation

4. **`frontend/src/components/ProtectedRoute.tsx`**
   - Route guard logic
   - Redirect behavior

5. **`backend/src/controllers/auth.controller.ts`**
   - `/auth/me` endpoint
   - `/auth/refresh` endpoint
   - Cookie configuration

---

## Debug Artifacts

All screenshots and logs are saved to: `./screenshots/`

### Generated Files:
- `debug-login-report.json` - Full network log, cookies, errors
- `login-01-page.png` - Login page initial state
- `login-03-credentials-filled.png` - Form with credentials
- `login-04-after-click.png` - Immediately after clicking Sign In
- `login-05-after-wait.png` - After waiting for navigation
- `login-06-dashboard-after-10sec.png` - Dashboard 10 seconds after load
- `login-07-dashboard-after-20sec.png` - Dashboard 20 seconds after load

---

## Recommended Actions

1. **Run the debug script** with real credentials
2. **Review the generated report** (`debug-login-report.json`)
3. **Check screenshots** for visual confirmation of loading state
4. **Analyze failed requests** to identify the root cause
5. **Fix the unnecessary refresh call** on public pages (App.tsx lines 128-169)

---

## Additional Tools

If Playwright approach doesn't provide enough detail:

1. **Browser DevTools Manual Test**:
   - Open https://koinoniasms.com/login
   - Open DevTools (F12) → Network tab
   - Sign in
   - Watch for failed requests
   - Check Application → Cookies

2. **Backend Logs**:
   - Check server logs for errors during signin
   - Look for failed database queries
   - Check for missing environment variables

3. **Curl Test**:
   ```bash
   # Test login endpoint directly
   curl -X POST https://api.koinoniasms.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}' \
     -v -c cookies.txt

   # Test me endpoint with cookies
   curl https://api.koinoniasms.com/api/auth/me \
     -b cookies.txt \
     -v
   ```

---

## Status

- [x] Initial investigation completed
- [x] Suspicious refresh token behavior identified
- [ ] **NEXT**: Run login debug script with real credentials
- [ ] Analyze detailed network logs
- [ ] Identify exact failing API call
- [ ] Fix root cause
- [ ] Test fix
- [ ] Deploy

