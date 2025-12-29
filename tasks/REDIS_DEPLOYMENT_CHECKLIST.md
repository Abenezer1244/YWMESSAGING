# Redis Deployment Checklist - Phase 1

**Status**: READY FOR DEPLOYMENT
**Timeline**: 2-3 days
**Cost**: $10/month (Standard tier on Render)
**Critical**: YES - Required for queues to function

---

## 📋 ADMIN ACTION CHECKLIST (Render Platform)

These steps must be completed by someone with access to Render dashboard.

### Step 1: Provision Redis Instance on Render
- [ ] **Login to Render Dashboard**: https://dashboard.render.com
- [ ] **Create New Service**: Click "New +" → "Redis"
- [ ] **Configure Instance**:
  - [ ] Name: `koinoniasms-redis`
  - [ ] Region: `oregon` (same as database)
  - [ ] Plan: **Standard** ($10/month)
    - 1GB RAM
    - 5000 concurrent connections
    - Auto-backups (RDB snapshots)
  - [ ] Eviction Policy: `noevict` (prevent data loss)
  - [ ] Max Memory: 1GB
  - [ ] Advanced Options:
    - [ ] Disable snapshots if >$20/month (optional)
    - [ ] Enable RDB snapshots (recommended)

- [ ] **Click "Create Service"**
- [ ] **Wait for deployment** (usually 1-2 minutes)
- [ ] **Status shows "Available"** in dashboard

### Step 2: Copy Redis Connection Details
From Render Redis dashboard:
- [ ] Copy **Internal Render URL** (for backend communication)
  - Format: `redis://default:PASSWORD@HOST:PORT`
  - Example: `redis://default:abc123xyz789@redis-koinoniasms.render.com:6379`

- [ ] **IMPORTANT**: Use the full URL including password!

### Step 3: Update Backend Environment Variables
In Render backend service dashboard (`koinonia-sms-backend`):

1. **Navigate**: Settings → Environment Variables
2. **Add/Update**:
   - [ ] Variable: `REDIS_URL`
   - [ ] Value: `redis://default:PASSWORD@HOST:PORT` (from Step 2)

3. **IMPORTANT**: Do NOT add trailing slash or change port

### Step 4: Trigger Backend Redeployment
- [ ] **Click "Redeploy"** in backend service dashboard
- [ ] **Wait for deployment** (usually 2-3 minutes)
- [ ] **Check logs** for success messages:
  - Look for: `✅ Redis connected`
  - Look for: `✅ Queues initialized: SMS, MMS, Mail, Analytics`
- [ ] **Check for errors** (no error about Redis connection)

---

## 🔧 DEVELOPER VERIFICATION STEPS

After Redis is deployed, verify it's working.

### Step 1: Verify Connection (Local Development)

On your local machine:

```bash
# Update .env with production Redis URL (optional, for testing)
# REDIS_URL=redis://default:PASSWORD@HOST:PORT

# Run the test utility
cd backend
npx ts-node src/utils/test-redis.ts
```

**Expected output**:
```
🔍 Redis Connection Test
════════════════════════════════════════════════════════════

📍 Step 1: Connecting to Redis
   URL: redis://default:***@redis-koinoniasms.render.com:6379
   Connecting...
   ✅ Connected successfully

📍 Step 2: Testing PING
   ✅ PING response: PONG

[... more test results ...]

✅ ALL TESTS PASSED!
```

### Step 2: Verify Queue System in Production

Check Render backend logs:

```
[✓] Queue system initialized
[✓] SMS queue connected to Redis
[✓] MMS queue connected to Redis
[✓] Mail queue connected to Redis
[✓] Analytics queue connected to Redis
[✓] Total workers: 4
```

### Step 3: Monitor Redis Metrics

In Render dashboard (Redis service):
- [ ] **Memory Usage**: Should be <200MB (plenty of headroom)
- [ ] **Connection Count**: Should be 5-10 (normal)
- [ ] **Commands/sec**: Should increase when messages are sent
- [ ] **No evictions**: Critical - should always be 0

### Step 4: Test Message Sending

Send a test message via the API:

```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "churchId": "test-church-id",
    "content": "Test message from Redis queue",
    "targetType": "all"
  }'
```

**Check**:
- [ ] API responds immediately (100-300ms, not 2-15 seconds)
- [ ] Message appears in Redis queue
- [ ] Message sends successfully
- [ ] No errors in logs

---

## 📊 PERFORMANCE VERIFICATION

### Throughput Test

Compare before and after Redis deployment:

**Before (Synchronous)**:
```
Time to send 10 messages: ~20 seconds
API latency (p95): 2,000-15,000ms
Throughput: ~1-2 msg/min
```

**After (Queued)**:
```
Time to send 10 messages: <1 second
API latency (p95): 100-300ms
Throughput: 500+ msg/min (when running)
```

### Load Test

For production readiness:

```bash
# Install load testing tool
npm install -g artillery

# Create load-test.yml
cat > load-test.yml << 'EOF'
config:
  target: 'https://koinoniasms.com'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests/sec
scenarios:
  - name: "Send Messages"
    flow:
      - post:
          url: '/api/messages/send'
          headers:
            Authorization: 'Bearer YOUR_TOKEN'
          json:
            churchId: 'test'
            content: 'Load test message'
            targetType: 'all'
EOF

# Run load test
artillery run load-test.yml
```

**Expected Results**:
- [ ] 99% of requests complete in <500ms
- [ ] 0 errors or timeouts
- [ ] Queue depth remains < 1000 jobs

---

## 🚨 CRITICAL CHECKS

Before declaring Redis "ready for production":

### Data Integrity
- [ ] `npx ts-node src/utils/test-redis.ts` passes all checks
- [ ] SET/GET operations work correctly
- [ ] TTL operations expire keys properly
- [ ] No data corruption under load

### Connection Stability
- [ ] REDIS_URL environment variable set correctly
- [ ] Backend can connect without timeouts
- [ ] Connection persists across multiple operations
- [ ] Automatic reconnection works if Redis restarts

### Queue Functionality
- [ ] SMS queue initialized
- [ ] MMS queue initialized
- [ ] Mail queue initialized (if enabled)
- [ ] Analytics queue initialized (if enabled)
- [ ] Jobs are processed in FIFO order
- [ ] Failed jobs are retried with exponential backoff

### Performance
- [ ] API latency improved (300ms → 100-300ms p95)
- [ ] Throughput increased (60 → 500 msg/min)
- [ ] Memory usage stable (<200MB)
- [ ] No connection pool exhaustion
- [ ] No evictions or key eviction warnings

### Monitoring
- [ ] Render Redis metrics page shows data
- [ ] Memory usage trending (not growing unbounded)
- [ ] Connection count stable
- [ ] Backup snapshots running successfully

---

## 🔄 ROLLBACK PROCEDURE

If Redis deployment fails:

### Immediate Recovery
1. **Disable queues** in backend:
   ```
   ENABLE_QUEUES=false
   ```
   - Redeploy backend
   - Messages send synchronously (slower but works)

2. **Delete problematic Redis** instance:
   - Render dashboard → Redis service → Delete
   - Data loss is acceptable (queues are temporary)

### Long-term Fix
1. **Provision new Redis** with different configuration
2. **Test thoroughly** before enabling queues
3. **Monitor closely** for first 24 hours

---

## ✅ SIGN-OFF CHECKLIST

Admin (who provisioned Redis):
- [ ] Redis instance provisioned and running
- [ ] REDIS_URL environment variable updated
- [ ] Backend redeployed with new REDIS_URL
- [ ] Render logs confirm successful queue initialization

Developer (who verified):
- [ ] `test-redis.ts` passes all checks
- [ ] Production logs show queue system working
- [ ] Performance improved (lower API latency, higher throughput)
- [ ] Monitoring alerts configured
- [ ] Documentation updated

---

## 📚 REFERENCE DOCS

- **Full deployment guide**: `backend/docs/REDIS_DEPLOYMENT_GUIDE.md`
- **Queue configuration**: `backend/src/jobs/queue.ts`
- **Redis config**: `backend/src/config/redis.config.ts`
- **Test utility**: `backend/src/utils/test-redis.ts`

---

## 🎯 SUCCESS CRITERIA

✅ **Deployment is successful when**:

1. **Connectivity**
   - [ ] Backend connects to Redis without errors
   - [ ] `test-redis.ts` passes all checks

2. **Functionality**
   - [ ] Queues initialized (SMS, MMS, Mail, Analytics)
   - [ ] Messages placed in queue and processed
   - [ ] No queue backlog under normal load

3. **Performance**
   - [ ] API latency < 300ms p95 (vs 300-2000ms before)
   - [ ] Throughput > 500 msg/min (vs 60 msg/min before)
   - [ ] No timeout errors or connection pool exhaustion

4. **Reliability**
   - [ ] Redis memory usage stable < 200MB
   - [ ] Zero evictions or data loss
   - [ ] Graceful reconnection on temporary failures
   - [ ] Backup snapshots running

5. **Monitoring**
   - [ ] Render metrics dashboard shows data
   - [ ] Alerts configured for memory/connections
   - [ ] Production logs clean (no Redis errors)

---

**Estimated Timeline**: 2-3 days
**Next Task**: PostgreSQL optimization + indexing
**Critical Path**: YES - Required for scaling to 1,500+ churches

---

**Last Updated**: December 2024
**Status**: READY FOR DEPLOYMENT
**Owner**: Infrastructure Team (Render Admin)
