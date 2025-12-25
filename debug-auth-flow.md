# Auth Loading Debug Checklist

## 1. Check Which Environment You're Testing

Are you testing on:
- [ ] **Local** (http://localhost:5173) - Local frontend + local backend
- [ ] **Production** (https://koinoniasms.com) - Production site
- [ ] **Staging** - Staging environment

## 2. If Testing Locally (localhost:5173)

The backend code changes we made are NOT deployed yet. To test locally:

```bash
# 1. Pull the latest code
git pull origin main

# 2. Stop any running dev servers
# Ctrl+C in the terminal

# 3. Start fresh
npm run dev

# 4. The backend should restart with the new cookie domain fix
```

## 3. Check Your API Base URL

**Frontend is using**: Look at your browser's Network tab
- Should see requests to `http://localhost:3000/api` (local)
- Or `https://api.koinoniasms.com/api` (production)

**Check in code**: `frontend/src/api/client.ts` line 4

## 4. What to Check When You Sign In

Open DevTools (F12) and:

### Console Tab
Look for:
- Any red error messages
- Token-related errors
- CORS errors

### Network Tab
1. Find the `/api/auth/login` request
   - Check **Response** tab - should have `accessToken` and `refreshToken`
   - Check **Cookies** tab - should show `accessToken` and `refreshToken` cookies being set

2. Find the `/api/auth/me` request that's failing with 401
   - **Request Headers** - look for `Cookie:` header
   - It should contain `accessToken=...` and `refreshToken=...`
   - If the Cookie header is MISSING, that's the issue

3. If Cookie header is missing:
   - Check the cookie on the login response - was it actually set?
   - Check cookie domain in DevTools Application → Cookies

## 5. Expected Cookie Settings

After login, you should see cookies:
- Name: `accessToken`
  - Domain: `.koinoniasms.com` (if production) or blank (if localhost)
  - Path: `/`
  - HttpOnly: ✓
  - Secure: (depends on environment)
  - SameSite: `none` (production) or `lax` (localhost)

- Name: `refreshToken`
  - Same settings as accessToken

## 6. If Cookies Are Set But Not Sent

This could be:
1. **SameSite=none issue** - Requires Secure flag and HTTPS
2. **Domain mismatch** - Cookie domain doesn't match request domain
3. **Path issue** - Cookie path doesn't match request path
4. **CORS issue** - withCredentials not set (but we have it)

## 7. Quick Test

In DevTools Console (after login), run:
```javascript
console.log('Cookies:', document.cookie)
console.log('Auth state:', localStorage.getItem('authState'))
```

If `document.cookie` is empty but auth succeeded, HTTPOnly cookies are working but not being sent to API.

