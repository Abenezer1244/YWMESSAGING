# Update Render Connection Limit to 95

## Quick Steps

### Option 1: Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Log in to your account

2. **Navigate to Your Web Service**
   - Find your backend service: `connect-yw-backend`
   - Click on it to open the service details

3. **Update Environment Variable**
   - Click on "Environment" in the left sidebar
   - Find the `DATABASE_URL` variable
   - Click "Edit" or the pencil icon
   - Update the connection string:

   **Current**:
   ```
   postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com/connect_yw_production?sslmode=require&connection_limit=30&pool_timeout=45
   ```

   **Change to**:
   ```
   postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com/connect_yw_production?sslmode=require&connection_limit=95&pool_timeout=45
   ```

4. **Update REGISTRY_DATABASE_URL (if separate)**
   - If you have a separate `REGISTRY_DATABASE_URL` variable
   - Update it with the same `connection_limit=95` parameter

5. **Save Changes**
   - Click "Save Changes"
   - Render will automatically restart your service with the new configuration

6. **Wait for Deployment**
   - Wait 2-3 minutes for the service to restart
   - Check the deployment logs to ensure successful restart

### Option 2: Render CLI (Alternative)

If you have the Render CLI installed:

```bash
# Set DATABASE_URL
render env set DATABASE_URL "postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com/connect_yw_production?sslmode=require&connection_limit=95&pool_timeout=45" --service connect-yw-backend

# Set REGISTRY_DATABASE_URL
render env set REGISTRY_DATABASE_URL "postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com/connect_yw_production?sslmode=require&connection_limit=95&pool_timeout=45" --service connect-yw-backend
```

---

## Verification

### After Update, Verify It's Working:

1. **Check Service Logs**
   - Go to your service in Render Dashboard
   - Click "Logs" tab
   - Look for successful startup without connection errors

2. **Test Registration**
   Run this test to verify registrations work:
   ```bash
   cd backend
   node test-registration-fix.js
   ```

   Expected output:
   ```
   ✅ REGISTRATION SUCCESSFUL!
   ✅ CONNECTION LIMIT FIX VERIFIED
   ```

3. **Monitor Connection Usage**
   - In Render Dashboard, go to your PostgreSQL database
   - Click on "Metrics" tab
   - Monitor "Connections" metric
   - Should show healthy usage (well below 95)

---

## What This Does

**Before**:
- Connection limit: 30
- Tenant capacity: ~15 databases
- Registration failures: ❌ Yes (connection exhausted)

**After**:
- Connection limit: 95
- Tenant capacity: ~45 databases
- Registration failures: ✅ Fixed

**Impact**:
- Utilizes your Render Pro-4gb plan's 97 connection capacity
- Leaves 2 connections as safety buffer
- Supports 3x more tenant databases

---

## Important Notes

⚠️ **Production Deployment**
- Updating environment variables will restart your service
- Expect 2-3 minutes of downtime during restart
- Plan the update during low-traffic period if possible

✅ **Local vs Production**
- Local `.env` already updated to 95 ✅
- Render production needs manual update ⚠️
- Both should match for consistency

📊 **Monitoring**
- After update, monitor connection usage for 24 hours
- Set up alerts if connections exceed 85 (90% threshold)
- Review Render metrics regularly

---

## Troubleshooting

### If Service Fails to Start

1. **Check Environment Variable Format**
   - Ensure no typos in the connection string
   - Verify `connection_limit=95` (not `connection_limit=30`)
   - Ensure URL is properly escaped

2. **Check Deployment Logs**
   - Look for Prisma connection errors
   - Check for database connection failures
   - Verify service is connecting to correct database

3. **Rollback If Needed**
   - Change `connection_limit=95` back to `connection_limit=30`
   - Service will restart with previous configuration
   - Then debug the issue separately

### If Registrations Still Fail

1. **Verify the change was applied**
   - Check environment variables in Render dashboard
   - Confirm service restarted after update
   - Look at deployment logs for new connection limit

2. **Check database connections**
   - Monitor active connections in Render database metrics
   - Ensure not exceeding 95 connections
   - Clean up any stale connections if needed

---

## Next Steps After Update

1. ✅ Verify service started successfully
2. ✅ Test new tenant registration
3. ✅ Monitor connection usage
4. ✅ Update frontend deployment if needed (REACT_APP_API_URL)
5. ✅ Document the change in your production runbook

---

**Updated**: 2025-12-30
**Reason**: Connection pool exhaustion fix after Phase 5 testing
**Status**: Ready to apply in production
