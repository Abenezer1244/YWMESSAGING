# 2nd API Instance Deployment - Phase 1

**Status**: READY FOR DEPLOYMENT
**Timeline**: 2-3 days
**Impact**: Horizontal scaling + fault tolerance
**Critical**: YES - Required for 1,500+ churches

---

## 📋 OVERVIEW

### Current Architecture
```
Single API Instance (koinonia-sms-backend on Render)
        ↓
    Internet Traffic
        ↓
  PostgreSQL Database
       Redis Cache
```

### New Architecture (with 2nd Instance)
```
Load Balancer (Render native)
    ↙          ↘
Instance 1    Instance 2
(koinonia-sms-backend-1)  (koinonia-sms-backend-2)
    ↘          ↙
  PostgreSQL Database
     Redis Cache
```

### Benefits
- ✅ **Horizontal Scaling**: 2x capacity
- ✅ **Fault Tolerance**: Service survives instance crash
- ✅ **Zero Downtime Deploys**: Roll updates gradually
- ✅ **Load Distribution**: 50% traffic to each instance
- ✅ **Independent Scaling**: Scale instances separately

---

## Step 1: Understanding Render Deployment

### Current Single Instance Setup
- **Service Name**: `koinonia-sms-backend`
- **Region**: `oregon`
- **Plan**: Standard ($12/month for Render Free tier or paid)
- **Environment**: Uses shared PostgreSQL + Redis

### Render Load Balancing
Render automatically handles:
- ✅ DNS load balancing across instances
- ✅ Health checks (every 30 seconds)
- ✅ Automatic removal of unhealthy instances
- ✅ No additional configuration needed

---

## Step 2: Clone the API Instance

### Option A: Render Dashboard (Recommended)

1. **Go to Services**: https://dashboard.render.com/services
2. **Select API Service**: `koinonia-sms-backend`
3. **Click Menu** (...) → **Duplicate**
4. **Configure Duplicate**:
   - **Name**: `koinonia-sms-backend-2` (or similar)
   - **Region**: `oregon` (same as original)
   - **Branch**: `main` (same as original)
   - **Environment Variables**: Copy from original (auto-populated)
   - **Disk**: Leave empty (same as original)

5. **Click "Create Service"**

### Option B: Terraform (Infrastructure as Code)

Create `infrastructure/main.tf`:

```hcl
resource "render_service" "backend_1" {
  name           = "koinonia-sms-backend"
  plan           = "standard"
  region         = "oregon"
  branch         = "main"
  github_repo    = "your-org/koinoniasms"
  auto_deploy    = true
  environment_variables = {
    DATABASE_URL = var.database_url
    REDIS_URL    = var.redis_url
    NODE_ENV     = "production"
  }
}

resource "render_service" "backend_2" {
  name           = "koinonia-sms-backend-2"
  plan           = "standard"
  region         = "oregon"
  branch         = "main"
  github_repo    = "your-org/koinoniasms"
  auto_deploy    = true
  environment_variables = {
    DATABASE_URL = var.database_url
    REDIS_URL    = var.redis_url
    NODE_ENV     = "production"
  }
}

output "backend_1_url" {
  value = render_service.backend_1.url
}

output "backend_2_url" {
  value = render_service.backend_2.url
}
```

Deploy:
```bash
terraform apply
```

---

## Step 3: Verify Instance Deployment

### Check Instance Status

1. **Navigate**: https://dashboard.render.com/services
2. **Find Both Instances**:
   - `koinonia-sms-backend` (original)
   - `koinonia-sms-backend-2` (new)
3. **Verify Status**: Both show "Live"

### Monitor Deployment Logs

For each instance, check:
- ✅ Build succeeded
- ✅ Deploy succeeded
- ✅ Service running

**Expected Logs**:
```
🔨 Building Docker image...
✅ Build succeeded in 2m 30s
🚀 Deploying to production...
✅ Service is live at https://koinonia-sms-backend-2.onrender.com
🔄 Health checks: Passing
```

### Test Each Instance Independently

```bash
# Test Original Instance
curl https://koinonia-sms-backend.onrender.com/health

# Test New Instance
curl https://koinonia-sms-backend-2.onrender.com/health

# Expected Response
{
  "status": "ok",
  "timestamp": "2024-12-01T10:30:00Z",
  "database": "connected",
  "redis": "connected",
  "environment": "production"
}
```

---

## Step 4: Verify Database & Cache Access

### Check Shared Resource Access

Both instances must access:
- ✅ Same PostgreSQL database
- ✅ Same Redis cache
- ✅ Same environment variables

### Verify in Render Dashboard

For **both** services, check Environment Variables:
```
DATABASE_URL=postgresql://...  ✅ Same for both
REDIS_URL=redis://...          ✅ Same for both
NODE_ENV=production            ✅ Same for both
```

### Test Database Connectivity

```bash
# From any API instance
curl https://koinonia-sms-backend-2.onrender.com/api/health

# Should return
{
  "database": "connected",
  "redis": "connected",
  "uptime": "5m 23s"
}
```

---

## Step 5: Verify Load Balancing

### Render's Automatic Load Balancing

Render automatically balances traffic using:
- **DNS Round-Robin**: Alternates between instances
- **Sticky Sessions**: User requests stay on same instance (if needed)
- **Health Checks**: Removes unhealthy instances

### Monitor Request Distribution

**In Render Dashboard**:
1. **Select Backend Service**: `koinonia-sms-backend`
2. **View Metrics**:
   - **Requests**: Should split between instances
   - **Response Time**: Similar on both
   - **Error Rate**: Consistent

**Expected Metrics**:
```
Total Requests: 1,000/hour
Instance 1: ~500 requests (50%)
Instance 2: ~500 requests (50%)
Avg Response: 150-200ms (both instances)
Error Rate: <0.1% (both instances)
```

### Manual Load Test

```bash
# Send 100 requests and check distribution
for i in {1..100}; do
  curl -s https://koinonia-sms-backend.onrender.com/api/health | \
    grep -o "instance.*" | head -1
done | sort | uniq -c

# Expected Output
#  50 instance-1
#  50 instance-2
```

---

## Step 6: Configure Health Checks

### Render Default Health Checks

Render automatically checks:
- **Endpoint**: `/` (root path)
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Action**: Remove instance after 3 consecutive failures

### Verify Health Endpoint (if custom)

If you have a custom health endpoint:

```typescript
// src/routes/health.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database
    const dbOk = await checkDatabase();

    // Check Redis
    const redisOk = await checkRedis();

    // Check services
    const servicesOk = await checkServices();

    if (dbOk && redisOk && servicesOk) {
      res.status(200).json({
        status: 'ok',
        database: 'connected',
        redis: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'degraded',
        database: dbOk ? 'ok' : 'down',
        redis: redisOk ? 'ok' : 'down',
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
```

Add to main app:
```typescript
import healthRoutes from './routes/health.js';
app.use('/', healthRoutes);
```

---

## Step 7: Test Failover Scenario

### Simulate Instance Failure

1. **Stop First Instance**:
   - **In Render Dashboard**: Select `koinonia-sms-backend` → **Suspend**
   - Render automatically routes all traffic to Instance 2

2. **Verify Service Continues**:
   ```bash
   curl https://koinonia-sms-backend.onrender.com/api/health
   # Should still work, now from Instance 2
   ```

3. **Check Metrics**:
   - All requests → Instance 2
   - No errors or timeouts
   - Response time unchanged (Instance 2 handles load)

4. **Resume First Instance**:
   - **In Render Dashboard**: Select `koinonia-sms-backend` → **Resume**
   - Render re-adds to load balancer
   - Traffic splits 50/50 again

### Expected Behavior
```
Before Suspension:
  Request 1 → Instance 1 ✓
  Request 2 → Instance 2 ✓
  Request 3 → Instance 1 ✓
  Request 4 → Instance 2 ✓

During Suspension (Instance 1 down):
  Request 1 → Instance 2 ✓
  Request 2 → Instance 2 ✓
  Request 3 → Instance 2 ✓
  Request 4 → Instance 2 ✓

After Resume:
  Request 1 → Instance 2 ✓
  Request 2 → Instance 1 ✓ (recovered)
  Request 3 → Instance 2 ✓
  Request 4 → Instance 1 ✓
```

---

## Step 8: Monitor and Optimize

### Metrics to Monitor

In Render Dashboard, watch:
- **CPU Usage**: ~50% each instance (was ~100% on single)
- **Memory**: Stable, no memory leaks
- **Response Time**: Consistent across instances
- **Error Rate**: Maintain <0.1%
- **Request Distribution**: 50/50 split

### Set Up Alerts

1. **High CPU** (>80%): Need to scale to larger instance
2. **Error Rate** (>1%): Check logs for issues
3. **Slow Queries** (>1s): Database optimization needed
4. **Instance Down**: Already handled by Render health checks

### Performance Expected

**Single Instance (Before)**:
```
Max Capacity: ~50 concurrent users
P95 Latency: 300-500ms under load
CPU: 90%+ at peak
```

**Two Instances (After)**:
```
Max Capacity: ~100 concurrent users (2x)
P95 Latency: 150-250ms under load (2x better)
CPU: 45-50% each at peak (distributed)
```

---

## Step 9: Deploy Updates Across Both Instances

### Zero-Downtime Deployments

With 2 instances, you can deploy with zero downtime:

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Render auto-deploys to both instances**:
   - Instance 1: Deploy starts
   - Instance 2: Serves traffic while Instance 1 updates
   - (No downtime!)

3. **Monitor deployment**:
   - Watch Render dashboard logs
   - Both instances should complete deployment
   - No 503 errors during deployment

### Manual Deployment Control (Optional)

If you need to control deployment order:

1. **Deploy to Instance 2 first**:
   - Render Dashboard → `koinonia-sms-backend-2` → **Redeploy**
   - Wait for successful deploy
   - Instance 2 serves traffic while Instance 1 handles requests

2. **Deploy to Instance 1**:
   - Render Dashboard → `koinonia-sms-backend` → **Redeploy**
   - Instance 1 updates while Instance 2 handles traffic

---

## ✅ SIGN-OFF CHECKLIST

Admin (who provisioned instances):
- [ ] 2nd API instance created (`koinonia-sms-backend-2`)
- [ ] Both instances show "Live" status
- [ ] Same environment variables on both
- [ ] Both have access to PostgreSQL and Redis
- [ ] Auto-deployment enabled for both

Developer (who verified):
- [ ] Health check passes on both instances
- [ ] API endpoints work on both instances
- [ ] Failover test successful (one instance down, service continues)
- [ ] Load distribution verified (50/50 split)
- [ ] All 78 tests pass
- [ ] No errors in logs during failover

---

## 📊 SUCCESS CRITERIA

✅ **2nd Instance Deployment is successful when**:

1. **Provisioning**
   - [ ] `koinonia-sms-backend-2` created successfully
   - [ ] Both instances show "Live"
   - [ ] Deployment completed in < 5 minutes
   - [ ] No errors in build logs

2. **Configuration**
   - [ ] Same DATABASE_URL on both
   - [ ] Same REDIS_URL on both
   - [ ] Same NODE_ENV on both
   - [ ] Health checks passing

3. **Functionality**
   - [ ] API endpoints work on both instances
   - [ ] Database queries work from both
   - [ ] Redis cache accessible from both
   - [ ] All 78 tests pass

4. **Load Balancing**
   - [ ] Traffic splits ~50/50
   - [ ] Response time similar on both
   - [ ] No sticky session issues

5. **Failover**
   - [ ] Stop Instance 1: Service continues on Instance 2
   - [ ] Stop Instance 2: Service continues on Instance 1
   - [ ] Resume Instance: Auto-added back to load balancer
   - [ ] No data loss during failover

6. **Performance**
   - [ ] CPU reduced 50% per instance
   - [ ] Response time maintained/improved
   - [ ] 2x concurrent user capacity
   - [ ] Error rate < 0.1%

---

## 🚨 ROLLBACK PROCEDURE

If 2nd instance causes problems:

1. **Delete 2nd Instance**:
   - Render Dashboard → `koinonia-sms-backend-2` → **Delete Service**

2. **Verify Service**:
   - Single instance automatically handles all traffic
   - Service continues without disruption

3. **Root Cause Analysis**:
   - Review logs from Instance 2
   - Check shared resource conflicts
   - Verify environment variables

4. **Redeploy When Ready**:
   - Fix issues
   - Create new instance
   - Test thoroughly before production traffic

---

## Next Steps

After successful deployment:
1. ✅ PostgreSQL upgraded to Standard ($43/month)
2. ✅ 2nd API instance deployed (Render cost unchanged)
3. ⏭️ Configure health check endpoint (if custom)
4. ⏭️ Set up monitoring and alerts
5. ⏭️ Enable database encryption (Phase 1, Security)

---

## Cost Impact

**Monthly Infrastructure**:
```
Before Phase 1:
- Single API Instance: $7/month
- PostgreSQL Free: $0/month
- Redis: $10/month
- Total: $17/month

After Phase 1:
- 2x API Instances: $14/month (Render often bundles)
- PostgreSQL Standard: $43/month
- Redis Standard: $10/month
- Total: ~$60-70/month (+$43-53 for scaling)

At Scale (10,000 churches → $820K MRR):
- Infrastructure: ~$70/month
- Margin: >99%
```

---

**Estimated Deployment Time**: 10-15 minutes
**Scalability Gain**: 2x capacity + fault tolerance
**Downtime Risk**: ZERO (rolling deployment)

---

**Last Updated**: December 2024
**Status**: READY FOR DEPLOYMENT
**Owner**: Infrastructure Team (Render Admin)
