# Debug Production Registration Issue

**Problem**: Registration failing on production with 400 Bad Request
**Error**: "Registration failed. Please try again later or contact support."
**API**: https://api.koinoniasms.com/api/auth/register

---

## Test Results

### ✅ Local Registration (localhost:3000)
- Status: **Working**
- Test passed successfully
- Database provisioning working

### ❌ Production Registration (api.koinoniasms.com)
- Status: **Failing** with 400 Bad Request
- Generic error message returned
- Actual error hidden for security

---

## Possible Causes

### 1. ⚠️ Render Service Not Restarted After ENV Update

**Most Likely Issue**: You updated the `DATABASE_URL` connection limit in Render dashboard, but the service may not have fully restarted.

**Solution**:
1. Go to Render Dashboard: https://dashboard.render.com/
2. Find service: `connect-yw-backend`
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Wait 3-5 minutes for full redeploy

### 2. ⚠️ Environment Variable Mismatch

**Check These Variables**:
- `DATABASE_URL` - Should have `connection_limit=95`
- `REGISTRY_DATABASE_URL` - Should have `connection_limit=95`
- `NODE_ENV` - Should be `production`
- `FRONTEND_URL` - Should be `https://koinoniasms.com`

### 3. ⚠️ Connection Pool Still Exhausted

Even with connection_limit=95, if there are stale connections:
- Old connections may not have been cleaned up
- Service restart needed to reset connection pool

**Fix**: Force restart the service

### 4. ⚠️ CORS or API Gateway Issue

Cloudflare is caching the response (header: `cf-cache-status: DYNAMIC`)

**Check**:
- Cloudflare DNS settings
- API route configuration
- CORS settings in backend

### 5. ⚠️ Database Provisioning Timeout

Production database provisioning might be taking longer than expected.

**Current timeout**: 90 seconds
**May need**: Longer timeout or better error handling

---

## Debug Steps

### Step 1: Check Render Logs

1. Go to Render Dashboard
2. Open `connect-yw-backend` service
3. Click "Logs" tab
4. Look for registration errors around **2025-12-31 01:27:20 GMT**
5. Check for:
   - Connection errors
   - Validation errors
   - Database provisioning errors
   - Timeout errors

### Step 2: Verify Environment Variables

1. In Render Dashboard → `connect-yw-backend`
2. Go to "Environment" tab
3. Verify `DATABASE_URL` contains: `connection_limit=95`
4. Verify `REGISTRY_DATABASE_URL` contains: `connection_limit=95`

### Step 3: Force Full Restart

1. In Render Dashboard → `connect-yw-backend`
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for deployment to complete (3-5 minutes)

### Step 4: Test Again

After restart, run:
```bash
node test-production-register.js
```

---

## Quick Fix Commands

### Check Render Service Status
```bash
# If you have Render CLI installed
render services list
render logs connect-yw-backend --tail
```

### Test Production API
```bash
# Test registration
node test-production-register.js

# Test basic health check
curl https://api.koinoniasms.com/api/health
```

---

## What We Know

**✅ Working**:
- Local backend (localhost:3000) - Registration works
- Database connection (Render Postgres) - Verified
- Connection limit updated - Local .env has 95
- Frontend form - Sending correct data

**❌ Not Working**:
- Production API (api.koinoniasms.com) - 400 error
- Actual error hidden in logs

**🔍 Need to Check**:
- Render service logs (see actual error)
- Render environment variables (verify connection_limit=95)
- Service restart status (may need manual restart)

---

## Expected Logs (if working)

When registration works, you should see:
```
🔍 REGISTER - Cookie Configuration: {
  hostname: 'api.koinoniasms.com',
  isProduction: true,
  cookieDomain: '.koinoniasms.com',
  sameSite: 'none'
}
```

## Expected Logs (if failing)

When registration fails, you might see:
```
Registration validation failed: { errors: [...] }
```
OR
```
Registration error: [actual error message]
```

---

## Next Actions

**IMMEDIATE**:
1. ✅ Check Render logs for actual error
2. ✅ Verify environment variables
3. ✅ Force restart service if needed

**IF RESTART DOESN'T FIX**:
4. Check database connection from Render
5. Review recent deployments
6. Check for database migration issues
7. Verify Prisma schema synchronization

---

## Contact Points

- **Render Dashboard**: https://dashboard.render.com/
- **Backend Service**: connect-yw-backend
- **Database**: connect_yw_db (Pro-4gb)
- **API Domain**: api.koinoniasms.com

---

**Created**: 2025-12-30
**Status**: Needs Render logs to diagnose
**Priority**: HIGH - Production registration broken
