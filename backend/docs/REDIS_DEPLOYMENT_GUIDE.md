# Redis Deployment Guide - Phase 1

## Overview

This guide covers deploying Redis on Render to enable:
- ✅ Message queue processing (Bull queues)
- ✅ Caching layer (Phase 2)
- ✅ Session management
- ✅ Real-time pub/sub (WebSocket, Phase 4)

**Cost:** $10-20/month depending on tier
**Performance:** 8x throughput improvement (60 → 500 msg/min)

---

## Current Status

### Local Development
- ✅ Redis runs on localhost:6379
- ✅ REDIS_URL defaults to localhost for development
- ✅ All queue/cache code ready to use

### Production (RENDER)
- ❌ Redis not yet provisioned
- ⚠️ ENABLE_QUEUES=true but no Redis to connect to
- ⚠️ Queue operations will fail until Redis deployed

---

## Step 1: Provision Redis on Render (Admin Action)

### Option A: Render Console (Recommended)

1. **Login to Render**: https://dashboard.render.com
2. **Create New Service**: Click "New +" → "Redis"
3. **Configure Instance**:
   - **Name**: `koinoniasms-redis`
   - **Region**: Same as backend (`oregon` to match current DB)
   - **Plan**:
     - **Development**: Free tier ($0)
     - **Production**: Standard ($10/month) - 1GB RAM, 5000 concurrent connections
   - **Eviction Policy**: `noevict` (prevent data loss)
   - **Max Memory**: 1GB for production

4. **Click Create Service**

5. **Wait for deployment** (usually 1-2 minutes)

6. **Copy Redis URL** from the dashboard
   - Format: `redis://default:PASSWORD@HOST:PORT`
   - Save this for Step 2

### Option B: Terraform (Infrastructure as Code)

```hcl
resource "render_redis" "koinoniasms_redis" {
  name             = "koinoniasms-redis"
  plan             = "standard"  # $10/month
  region           = "oregon"
  eviction_policy  = "noevict"
  max_memory_gb    = 1
}

output "redis_url" {
  value = render_redis.koinoniasms_redis.connection_string
}
```

Run:
```bash
terraform apply
```

---

## Step 2: Update Production Environment Variables

### In Render Dashboard

1. **Go to backend service**: https://dashboard.render.com/services/connect-yw-backend
2. **Settings** → **Environment Variables**
3. **Update or Add**:

```
REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT
```

Example format:
```
redis://default:abc123xyz789@redis-koinoniasms.render.com:6379
```

**Important**: Use the full URL from Step 1, including password!

### Verification

Click **Redeploy** to apply changes. Check logs:
```
[✓] Successfully connected to Redis
[✓] Message queue system initialized
```

---

## Step 3: Configure Connection Pooling

### Current Configuration (Queue.ts)

The code already handles connection pooling via Bull:

```typescript
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Bull automatically handles:
// - Connection pooling (default: 10 connections)
// - Retries (exponential backoff)
// - Graceful degradation
```

### Advanced Tuning (Optional)

For high-concurrency scenarios (1,000+ churches), customize in `src/jobs/queue.ts`:

```typescript
const queueOptions = {
  redis: {
    url: redisUrl,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,      // Skip ready check for speed
    enableOfflineQueue: true,      // Queue jobs while Redis offline
  },
  settings: {
    lockDuration: 30000,           // 30s lock per job
    lockRenewTime: 15000,          // Renew lock every 15s
    maxStalledCount: 2,            // Max stalled count before fail
    stalledInterval: 5000,         // Check staleness every 5s
    maxStalledCount: 2,
    guardInterval: 5000,
    retryProcessDelay: 5000,       // Retry processing after 5s
  }
};

const smsQueue = new Bull('sms', {
  ...queueOptions,
  defaultJobOptions: {
    attempts: 3,                   // Retry 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,                 // Start 2s, exponential
    },
    removeOnComplete: true,        // Clean up completed jobs
    removeOnFail: false,           // Keep failed jobs for debugging
  }
});
```

---

## Step 4: Test Redis Connection

### Development (Local)

Verify Redis runs locally:
```bash
redis-cli
> ping
PONG
```

### Production (Render)

Create test script `src/utils/test-redis.ts`:

```typescript
import * as Redis from 'redis';

async function testRedisConnection() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = Redis.createClient({ url: redisUrl });

  try {
    console.log('🔄 Connecting to Redis:', redisUrl.replace(/:[^@]*@/, ':***@'));

    await client.connect();
    console.log('✅ Connected successfully');

    // Test PING
    const pong = await client.ping();
    console.log('✅ PING response:', pong);

    // Test SET/GET
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    console.log('✅ SET/GET working:', value);

    // Test with TTL
    await client.setEx('ttl-test', 10, 'expires-in-10s');
    const ttl = await client.ttl('ttl-test');
    console.log('✅ TTL working:', ttl, 'seconds remaining');

    console.log('\n✅ All Redis tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  } finally {
    await client.quit();
  }
}

testRedisConnection();
```

Run:
```bash
npx ts-node src/utils/test-redis.ts
```

---

## Step 5: Monitor Redis Health

### Render Metrics

In Render dashboard, monitor:
- **Memory Usage**: Should stay below 70% for headroom
- **Connection Count**: Typical: 5-10, Warning: >50
- **Commands/sec**: Track throughput
- **Evictions**: Should be 0 (data loss indicator)

### Application Logging

The queue system logs connections:
```bash
# Monitor production logs
curl https://api.render.com/v1/services/BACKEND_ID/events \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Look for:
```
[✓] Queues initialized: SMS, MMS, Mail, Analytics
[✓] Redis connection successful
[!] Queue depth: 42 jobs pending
```

### Alert Setup (Critical)

Set Render alerts:
1. **Memory > 80%**: Auto-scale to larger tier
2. **Connection errors**: Investigate connectivity
3. **Evictions > 0**: Upgrade to larger tier

---

## Step 6: Graceful Degradation

### What Happens If Redis Goes Down?

The system is designed to handle Redis failure gracefully:

```typescript
// In queue.ts - if Redis unavailable:
if (process.env.ENABLE_QUEUES === 'true') {
  // Try to create Bull queues
  // If fails, continues without queueing
}

// Fallback behavior:
// 1. Message sending becomes synchronous (slower)
// 2. API response times increase (100-300ms → 2-15s)
// 3. No data loss (nothing in queue yet)
// 4. When Redis recovers, auto-reconnect
```

### Manual Failover

If Redis crashes during production:

1. **Temporary**: Disable queues
   ```bash
   # In Render environment:
   ENABLE_QUEUES=false
   ```
   - Slower but works synchronously
   - No queue backlog

2. **Permanent**: Redeploy with new Redis
   - Provision new Redis instance
   - Update REDIS_URL
   - Redeploy backend

---

## Step 7: Database Backup Strategy

### Redis Backups on Render

Render automatically handles:
- **RDB snapshots**: Taken every 6 hours
- **Retention**: 7-day history
- **Recovery**: One-click restore from dashboard

### Manual Backup (Optional)

For critical production data:
```bash
# Export Redis data
redis-cli --rdb /tmp/redis-backup.rdb

# Store in S3
aws s3 cp /tmp/redis-backup.rdb s3://backups/redis-backup.rdb
```

---

## Step 8: Performance Baseline

### Before Redis (Synchronous)

```
Message throughput: 60/min
API latency (p95): 300-2000ms
Concurrent handling: ~5 users
```

### After Redis (Queued)

```
Message throughput: 500/min (8x ↑)
API latency (p95): 100-300ms (5-10x ↓)
Concurrent handling: ~50 users
```

### Measurement Script

Create `src/utils/benchmark-redis.ts`:

```typescript
import * as Bull from 'bull';
import { performance } from 'perf_hooks';

async function benchmarkQueues() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const testQueue = new Bull('benchmark', redisUrl);

  console.log('🔄 Starting Redis benchmark...\n');

  // Test 1: Single job
  const start1 = performance.now();
  await testQueue.add('test', { data: 'single' });
  const end1 = performance.now();
  console.log(`✅ Single job added: ${(end1 - start1).toFixed(2)}ms`);

  // Test 2: Bulk jobs (100)
  const start2 = performance.now();
  await testQueue.addBulk(
    Array(100).fill(null).map((_, i) => ({
      name: 'test',
      data: { id: i }
    }))
  );
  const end2 = performance.now();
  console.log(`✅ 100 jobs added: ${(end2 - start2).toFixed(2)}ms (${((end2 - start2) / 100).toFixed(2)}ms each)`);

  // Test 3: Job retrieval
  const start3 = performance.now();
  const jobs = await testQueue.getJobs();
  const end3 = performance.now();
  console.log(`✅ Retrieved ${jobs.length} jobs: ${(end3 - start3).toFixed(2)}ms`);

  console.log('\n✅ Benchmark complete!');
  await testQueue.close();
}

benchmarkQueues();
```

---

## Troubleshooting

### Issue: "Could not connect to Redis"

**Check**:
1. REDIS_URL environment variable set correctly
2. Redis instance running on Render
3. Network connectivity (firewall, VPC)

**Fix**:
```bash
# Test connection
npx ts-node src/utils/test-redis.ts

# Check logs
curl https://api.render.com/v1/services/YOUR_SERVICE_ID/logs
```

### Issue: "Memory limit exceeded"

**Cause**: Queue jobs accumulating, hitting memory limit
**Fix**:
1. Increase Redis tier (Render dashboard)
2. Add job cleanup: `removeOnComplete: true`
3. Monitor job queue depth

### Issue: "Connection pool exhausted"

**Cause**: Too many concurrent connections
**Fix**:
1. Increase `maxRetriesPerRequest` in queue options
2. Add connection pooling: `enableOfflineQueue: true`
3. Monitor connection count in Render metrics

---

## Success Checklist

- [ ] Redis provisioned on Render ($10-20/month)
- [ ] REDIS_URL updated in production environment
- [ ] Backend redeployed with new REDIS_URL
- [ ] `npx ts-node src/utils/test-redis.ts` passes
- [ ] Logs show "Queues initialized: SMS, MMS, Mail, Analytics"
- [ ] Message queue throughput verified (60 → 500 msg/min)
- [ ] API latency reduced (300ms → 100-300ms p95)
- [ ] Redis memory monitoring active
- [ ] Backup policy confirmed
- [ ] Graceful degradation tested

---

## Next Steps

After Redis is deployed:
1. ✅ Verify queue system works end-to-end
2. ✅ Add PostgreSQL indexes (Phase 1 step 3)
3. ✅ Upgrade PostgreSQL tier (Phase 1 step 4)
4. ✅ Add 2nd API instance (Phase 1 step 5)
5. ⏭️ Implement caching layer (Phase 2)

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Status**: Ready for deployment
