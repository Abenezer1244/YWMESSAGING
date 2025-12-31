# Production Fix - Missing REGISTRY_DATABASE_URL

**Date**: 2025-12-30
**Issue**: Registration failing with 400 error
**Root Cause**: `REGISTRY_DATABASE_URL` environment variable missing in Render
**Priority**: CRITICAL - Blocking all registrations

---

## The Problem

**Error from Render logs**:
```
Error: REGISTRY_DATABASE_URL environment variable is not set.
Required for multi-tenant registry database.
    at getRegistryPrisma (file:///opt/render/project/src/backend/dist/lib/tenant-prisma.js:75:15)
    at registerChurch (file:///opt/render/project/src/backend/dist/services/auth.service.js:37:28)
```

**What's happening**:
- Registration code tries to get `getRegistryPrisma()`
- This function requires `REGISTRY_DATABASE_URL` environment variable
- Variable is missing in Render environment
- Registration fails immediately

---

## The Fix (5 Minutes)

### Step 1: Add REGISTRY_DATABASE_URL to Render

1. Go to: https://dashboard.render.com/
2. Open service: **connect-yw-backend**
3. Click: **"Environment"** tab
4. Click: **"Add Environment Variable"**
5. Add this variable:

**Key**:
```
REGISTRY_DATABASE_URL
```

**Value** (copy exactly):
```
postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com/connect_yw_production?sslmode=require&connection_limit=95&pool_timeout=45
```

6. Click: **"Save Changes"**

### Step 2: Verify DATABASE_URL is Correct

While you're in the Environment tab, also verify:

**Variable**: `DATABASE_URL`
**Should be**:
```
postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com/connect_yw_production?sslmode=require&connection_limit=95&pool_timeout=45
```

**Check for**: `connection_limit=95` (NOT 30)

### Step 3: Wait for Automatic Restart

- Render will automatically restart your service
- Wait 2-3 minutes for restart to complete
- Watch the logs to see startup messages

---

## Why This Happened

**Database-per-tenant architecture** requires TWO database URLs:

1. **DATABASE_URL**: Default connection (fallback, used for registry)
2. **REGISTRY_DATABASE_URL**: Specific registry database connection

**In your local `.env`**:
- Both variables are set ✅
- Both have `connection_limit=95` ✅

**In Render production**:
- DATABASE_URL was updated ✅
- REGISTRY_DATABASE_URL was missing ❌ ← **THIS IS THE BUG**

**How it happened**:
- When you updated connection_limit, you only updated DATABASE_URL
- REGISTRY_DATABASE_URL was either never added or got removed
- Without it, registration can't access the registry database

---

## Verification Steps

### After Adding Variable

**1. Check Render Logs** (2 minutes):
```
1. Go to Render dashboard → connect-yw-backend
2. Click "Logs" tab
3. Wait for service to restart
4. Look for: "Server listening on port 3000" or similar
5. Should NOT see: "REGISTRY_DATABASE_URL environment variable is not set"
```

**2. Test Registration** (1 minute):
```bash
node test-production-register.js
```

**Expected Output**:
```
✅ REGISTRATION SUCCESSFUL!
   Tenant ID: [generated-id]
   Church Name: [church name]
   Email: [email]

✅ CONNECTION LIMIT FIX VERIFIED - Registrations working again!
```

**3. Test via Browser** (2 minutes):
1. Go to: https://koinoniasms.com/register
2. Fill out registration form
3. Submit
4. Should redirect to dashboard ✅

---

## What This Fixes

### Before Fix
```
❌ Registration: Fails with 400 error
❌ Error message: "Registration failed. Please try again later..."
❌ Actual error: "REGISTRY_DATABASE_URL environment variable is not set"
❌ User experience: Silent failure, confusing
```

### After Fix
```
✅ Registration: Works correctly
✅ Database provisioning: Creates new tenant database
✅ User creation: Adds admin to tenant database
✅ Tokens generated: User logged in automatically
✅ Redirects to dashboard: Smooth onboarding
```

---

## Complete Environment Variables Checklist

Make sure these are all set in Render:

- ✅ `DATABASE_URL` (with `connection_limit=95`)
- ✅ `REGISTRY_DATABASE_URL` (with `connection_limit=95`) ← **ADD THIS**
- ✅ `PORT` (usually 3000)
- ✅ `NODE_ENV` (production)
- ✅ `FRONTEND_URL` (https://koinoniasms.com)
- ✅ `JWT_ACCESS_SECRET`
- ✅ `JWT_REFRESH_SECRET`
- ✅ `ENCRYPTION_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `TELNYX_API_KEY`
- ✅ All other API keys from your local `.env`

---

## After Registration Works

Once registration is fixed, we'll complete the E2E test:

1. ✅ **Registration**: Create account ← **FIXING THIS NOW**
2. ⏸️ **Login**: Verify authentication
3. ⏸️ **Dashboard**: Check page loads
4. ⏸️ **Create Branch**: Add "Main Campus"
5. ⏸️ **Add Members**: Add 3 members manually
6. ⏸️ **Import Members**: Upload CSV with 20 members
7. ⏸️ **Verification**: Confirm all data saved

---

## Technical Details

### Code Location

**File**: `backend/src/lib/tenant-prisma.ts`
**Function**: `getRegistryPrisma()`
**Line**: ~75

**Code**:
```typescript
export function getRegistryPrisma(): PrismaClient {
  const registryUrl = process.env.REGISTRY_DATABASE_URL;

  if (!registryUrl) {
    throw new Error('REGISTRY_DATABASE_URL environment variable is not set. Required for multi-tenant registry database.');
  }

  // ... create Prisma client with registryUrl
}
```

### Why Both URLs Are Needed

**DATABASE_URL**:
- Used as default/fallback
- Some code may reference it directly
- Backwards compatibility

**REGISTRY_DATABASE_URL**:
- Specifically for registry database
- More explicit and clear
- Allows different connection settings if needed

**In your case**: Both point to the same PostgreSQL database (`connect_yw_production`) but having both allows for future flexibility.

---

## Summary

**Problem**: Missing `REGISTRY_DATABASE_URL` in Render environment
**Solution**: Add the variable with connection_limit=95
**Time**: 5 minutes to fix
**Impact**: Unblocks all registrations, E2E test can continue

**Action Required**: Add REGISTRY_DATABASE_URL to Render NOW

---

**Created**: 2025-12-30 17:40 PST
**Status**: READY TO FIX
**Estimated Fix Time**: 5 minutes
