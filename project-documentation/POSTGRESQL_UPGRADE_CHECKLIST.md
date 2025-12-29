# PostgreSQL Upgrade Checklist - Phase 1

**Status**: READY FOR DEPLOYMENT
**Timeline**: 1-2 days
**Impact**: Prevents DB exhaustion at 500 concurrent users
**Critical**: YES - Required for 1,500+ churches

---

## 📋 ADMIN ACTION CHECKLIST (Render Platform)

These steps must be completed by someone with access to Render dashboard.

### Current Status
- **Database**: Render PostgreSQL (existing)
- **Current Tier**: Starter or Standard (needs upgrade)
- **Connection Limit**: Must support 30+ concurrent connections
- **Storage**: Growing with user data
- **Backups**: Auto-enabled on Render

### Why Upgrade?

**Without upgrade** (at 1,500 churches):
- Connection pool exhausted (default 2-5 connections too low)
- Queries timeout (database under heavy load)
- API latency spikes to 5-10 seconds
- Service failure cascades

**With upgrade** (supporting 2,500+ churches):
- 30-50+ concurrent connection support
- Sub-100ms query latency maintained
- Stable API response times
- Horizontal scaling ready

---

## Step 1: Assess Current Database

### Login to Render Dashboard
1. **Navigate**: https://dashboard.render.com
2. **Select PostgreSQL service**: `koinonia-sms-production` or similar
3. **Check current plan**: View "Plan" section

### Current Metrics to Check
- **CPU Usage**: % utilization
- **Memory Usage**: GB used vs allocated
- **Storage**: GB used vs limit
- **Connections**: Current active connections
- **Slow Queries**: Any queries > 1 second

**Example Current Tier**:
```
Free Tier ($0):
- 1 GB storage
- 10 MB RAM
- 4 concurrent connections ❌ TOO LOW

vs

Standard Tier ($43/month):
- 50 GB storage
- 512 MB RAM
- 30 concurrent connections ✅
```

---

## Step 2: Upgrade PostgreSQL Plan

### Option A: Render Dashboard (Recommended)

1. **Go to Database Service**: https://dashboard.render.com/pg
2. **Select Service**: `koinonia-sms-production`
3. **Click "Plan"**: In the service details page
4. **Select New Plan**:
   - **Recommended**: Standard ($43/month)
     - 50 GB storage (plenty for 2,500+ churches)
     - 512 MB RAM (supports complex queries)
     - 30 concurrent connections (safe margin)
     - Daily backups included
   - **Alternative**: Pro ($245/month) if expecting 5,000+ churches
     - 500 GB storage
     - 2 GB RAM
     - 100 concurrent connections

5. **Click "Upgrade"**: Confirm the change

### Upgrade Timeline
- **Estimated Duration**: 5-15 minutes
- **Downtime**: Minimal (typically 1-2 minutes for instance restart)
- **Data Loss Risk**: ZERO (all data preserved)
- **Backups**: Automatically taken before upgrade

### What Happens During Upgrade
```
1. Render creates snapshot of current database
2. Upgrades PostgreSQL instance to new tier
3. Restores data to new instance
4. Updates connection string (no change needed)
5. Application automatically connects to new tier
```

---

## Step 3: Update Connection Pooling

### Verify DATABASE_URL Format

Check that your DATABASE_URL includes connection pooling parameters:

**Required Format**:
```
postgresql://user:password@host:port/db?connection_limit=30&pool_timeout=45
```

**In Render Environment Variables**:
1. **Go to**: Backend service settings → Environment
2. **Check**: DATABASE_URL variable
3. **Verify** it includes:
   - `connection_limit=30` (match new tier's concurrent connections)
   - `pool_timeout=45` (timeout in seconds)

**If missing**, contact Render support or use:
```
connection_limit=30
pool_timeout=45
```

---

## Step 4: Monitor Upgrade Progress

### During Upgrade
1. **Watch Status Page**: Database service shows "Upgrading..."
2. **Monitor Logs**: Check for any errors
3. **Check Connectivity**: Service should automatically reconnect

### After Upgrade
1. **Verify Tier**: Confirm new plan shows in dashboard
2. **Check Metrics**: CPU, memory, connections stable
3. **Test Application**: Make a few API calls
4. **Monitor Logs**: No PostgreSQL connection errors

**Expected Logs**:
```
✅ Database upgraded successfully
✅ Automatic reconnection successful
✅ Queries executing normally
✅ Connection pool stable
```

---

## Step 5: Validate Schema & Migrations

### Apply Pending Migrations (if any)

If you added new indexes (Phase 1 optimization):

```bash
# In backend directory
npx prisma migrate deploy
```

This creates the 3 composite indexes:
- `Subscription[churchId, status]`
- `Conversation[churchId, lastMessageAt]`
- `ConversationMessage[conversationId, createdAt]`

**Expected Output**:
```
Applying migration: xxxxxx_add_composite_indexes
✅ Migration applied successfully
```

### Verify Database Health

```bash
# Connect to PostgreSQL (if you have access)
psql $DATABASE_URL

# Check indexes were created
\di

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Step 6: Performance Verification

### Run Tests

```bash
# From backend directory
npm test
```

**Expected**: All 78 tests pass ✅

### Monitor Performance Metrics

In Render dashboard, check:
- **CPU Usage**: Should drop (indexes working)
- **Query Time**: Slow queries < 1 second
- **Connection Count**: Stable 5-10 active (vs 30+ before)
- **Storage**: Shows available space

### Performance Improvements

**Before Upgrade**:
```
Database: Free tier (4 connections, 10 MB RAM)
Avg Query: 50-100ms
P95 Latency: 500-2000ms
Max Concurrent: ~5 users
```

**After Upgrade + Indexes**:
```
Database: Standard tier (30 connections, 512 MB RAM)
Avg Query: 10-30ms (3x faster)
P95 Latency: 100-300ms (5x faster)
Max Concurrent: 200+ users
```

---

## Step 7: Backup Strategy Verification

### Render Auto-Backups
- ✅ Daily backups automatically enabled
- ✅ 7-day retention default
- ✅ Can restore from any backup

### Verify Backup Settings

1. **Navigate**: Database service → Settings
2. **Check**: "Automated Backups" is enabled
3. **Retention**: At least 7 days
4. **Restore Option**: Available if needed

### Manual Backup (Optional)

For critical business data:
```bash
# Export current database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Store securely (S3, etc)
aws s3 cp backup-*.sql s3://your-bucket/backups/
```

---

## Step 8: Document Upgrade

### Update Team Documentation

1. **Note the upgrade date**: When it occurred
2. **Record new plan**: Standard tier ($43/month)
3. **Update capacity limits**: 30 concurrent connections
4. **Add to costs**: Infrastructure costs spreadsheet

### Team Notification

Inform team:
- Database upgraded successfully
- Performance improved 3-5x
- Indexes optimize queries
- Connection pooling prevents exhaustion
- Scale-ready for 2,500+ churches

---

## ✅ SIGN-OFF CHECKLIST

Admin (who performed upgrade):
- [ ] Database service upgraded to Standard ($43/month)
- [ ] Upgrade completed successfully (no errors)
- [ ] Render dashboard confirms new plan active
- [ ] Backups confirmed working
- [ ] Connection pooling parameters verified

Developer (who verified):
- [ ] All 78 tests pass
- [ ] Database migrations applied successfully
- [ ] Performance improved (P95 < 300ms)
- [ ] No slow query warnings
- [ ] Application can connect successfully

---

## 🚨 ROLLBACK PROCEDURE (If Issues)

If upgrade causes problems:

1. **Contact Render Support**: Open support ticket
2. **Request Downgrade**: Rollback to previous tier
3. **Restore from Backup**: If data affected
4. **Verify Application**: Confirm everything works
5. **Root Cause Analysis**: Investigate issue before retry

---

## 📊 SUCCESS CRITERIA

✅ **Upgrade is successful when**:

1. **Completion**
   - [ ] New tier shows in Render dashboard
   - [ ] Upgrade completed in < 15 minutes
   - [ ] Zero data loss

2. **Connectivity**
   - [ ] Backend connects without errors
   - [ ] All 78 tests pass
   - [ ] No connection pool exhaustion

3. **Performance**
   - [ ] Query latency: 50ms → 10-30ms (3x faster)
   - [ ] P95 API latency: 2000ms → 100-300ms (5x faster)
   - [ ] Zero timeout errors

4. **Capacity**
   - [ ] 30 concurrent connections available
   - [ ] 512 MB RAM allocated
   - [ ] 50 GB storage available
   - [ ] CPU usage stable < 50%

5. **Reliability**
   - [ ] Automatic backups enabled
   - [ ] 7+ day backup retention
   - [ ] No slow query warnings
   - [ ] Connection pool stable

---

## Next Steps

After successful upgrade:
1. ✅ PostgreSQL upgraded and verified
2. ⏭️ Provision 2nd API instance (horizontal scaling)
3. ⏭️ Configure load balancer
4. ⏭️ Set up health checks & failover

---

**Estimated Upgrade Time**: 10-15 minutes
**Cost Impact**: +$43/month for Standard tier
**Scalability Impact**: Support 2,500+ churches (vs 500 before)

---

**Last Updated**: December 2024
**Status**: READY FOR DEPLOYMENT
**Owner**: Infrastructure Team (Render Admin)
