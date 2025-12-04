# Phase 2 Deployment Checklist
## Pre-Deployment Validation & Infrastructure Setup

**Status**: Ready for Deployment
**Created**: December 4, 2025
**Target Timeline**: 8 weeks (see PHASE2-IMPLEMENTATION-PLAN.md for detailed timeline)

---

## 📋 PRE-DEPLOYMENT VALIDATION

### Code Validation ✅
- [x] Health check endpoints implemented (`/backend/src/routes/health.routes.ts`)
  - [x] `/health` - Simple fast check (< 1ms)
  - [x] `/health/detailed` - Comprehensive dependency checks
  - [x] `/health/ready` - Readiness probe for orchestration
  - [x] `/health/live` - Liveness probe (no dependency checks)

- [x] Distributed lock service implemented (`/backend/src/services/lock.service.ts`)
  - [x] `acquireJobLock()` - Basic lock acquisition
  - [x] `releaseJobLock()` - Safe lock release
  - [x] `withJobLock()` - Convenience wrapper for simple jobs
  - [x] `isJobLockHeld()` - Status checking for monitoring
  - [x] `forceReleaseJobLock()` - Emergency unlock
  - [x] `getActiveJobLocks()` - List active locks

- [x] Health routes properly imported in app.ts (line 29)
  - Import: `import healthRoutes from './routes/health.routes.js';`

- [x] Redlock dependency added to package.json
  - `"redlock": "^5.0.1"`

- [x] Infrastructure templates created
  - [x] PgBouncer configuration (`/infrastructure/pgbouncer/pgbouncer.ini`)
  - [x] NGINX configuration (`/infrastructure/nginx/backend.conf`)

### Development Environment ✅
- [x] All TypeScript files compile cleanly
- [x] No import path errors
- [x] No type errors in health routes or lock service
- [x] Redis client integration working (health check uses it)
- [x] Database client integration working (health check uses it)

---

## 🚀 INFRASTRUCTURE DEPLOYMENT PHASES

### Phase 2.1: Database Connection Pooling (Week 1)

#### Step 1: PgBouncer Provisioning
- [ ] **Choose PgBouncer Hosting Option**:
  - Option A: Railway sidecar (recommended for Render backend)
    - Cost: ~$5-7/month
    - Setup: Add sidecar to backend service
    - Benefit: Auto-scales with backend
  - Option B: DigitalOcean droplet
    - Cost: $4-6/month (smallest droplet)
    - Setup: Manual deployment using provided config
    - Benefit: Full control, reusable for other projects
  - Option C: AWS EC2 t4g.micro
    - Cost: Free tier if available, ~$5-10/month otherwise
    - Setup: Manual deployment with security groups

- [ ] **Provision the instance/sidecar**
  - Record: PgBouncer host, port, internal IP address
  - Verify: Instance has network access to PostgreSQL

- [ ] **Deploy PgBouncer Configuration**
  - Copy `/infrastructure/pgbouncer/pgbouncer.ini` to `/etc/pgbouncer/pgbouncer.ini`
  - Create `/etc/pgbouncer/userlist.txt` with database credentials:
    ```
    "db_user" "md5-password-hash-here"
    ```
  - Set proper permissions:
    ```bash
    sudo chmod 600 /etc/pgbouncer/userlist.txt
    sudo chown pgbouncer:pgbouncer /etc/pgbouncer/userlist.txt
    ```

- [ ] **Start PgBouncer Service**
  - `sudo systemctl start pgbouncer`
  - `sudo systemctl enable pgbouncer` (auto-start on reboot)
  - Verify: `sudo systemctl status pgbouncer`

- [ ] **Test PgBouncer Connectivity**
  ```bash
  # Test from backend server or locally
  psql -h pgbouncer-host -p 6432 -U db_user -d connect_yw_production

  # Should connect without errors
  # Run: SELECT version();
  # Run: SHOW POOLS;
  ```

#### Step 2: Update Backend Configuration
- [ ] **Update DATABASE_URL** to point to PgBouncer
  - Old: `postgresql://user:pass@db.example.com:5432/connect_yw_production`
  - New: `postgresql://user:pass@pgbouncer-host:6432/connect_yw_production`
  - Update in: `.env` file (or environment variables on Render)

- [ ] **Verify Connection Works**
  - Build backend: `npm run build`
  - Test: `npm run dev` and check for connection errors
  - Verify: Can run database queries successfully

- [ ] **Monitor Connection Pooling**
  - Connect to PgBouncer admin interface:
    ```bash
    psql -h pgbouncer-host -p 6432 -U pgbouncer pgbouncer
    ```
  - Run monitoring commands:
    ```sql
    SHOW STATS;      -- Connection statistics
    SHOW POOLS;      -- Current pool status
    SHOW CLIENTS;    -- Connected clients
    SHOW SERVERS;    -- Backend connections
    ```
  - Expected: `default_pool_size = 30`, high reuse ratio (90%+)

---

### Phase 2.2: Load Balancer Setup (Week 2-3)

#### Step 1: NGINX Provisioning
- [ ] **Choose NGINX Hosting Option**:
  - Option A: Railway deployment
    - Cost: $7-10/month
    - Setup: Deploy using provided config as Docker environment
  - Option B: DigitalOcean App Platform
    - Cost: $12/month (shared CPU)
    - Setup: Docker container with Nginx
  - Option C: AWS EC2 t4g.small
    - Cost: Free tier if available, ~$10-15/month otherwise
    - Setup: Manual deployment with security groups
  - **Recommended**: DigitalOcean or Railway for simplicity

- [ ] **Provision the NGINX Server**
  - Record: NGINX public IP, internal IP
  - Verify: Has public internet access for Let's Encrypt
  - Verify: Can reach all 3 backend servers on port 3000

- [ ] **Deploy NGINX Configuration**
  - Copy `/infrastructure/nginx/backend.conf` to `/etc/nginx/conf.d/backend.conf`
  - Update backend server addresses in upstream block:
    ```nginx
    upstream backend_servers {
      server backend-1.internal:3000;
      server backend-2.internal:3000;
      server backend-3.internal:3000;
    }
    ```
  - Update SSL certificate paths (see Let's Encrypt setup below)
  - Update `server_name` if domain is different

- [ ] **Install & Start NGINX**
  - `sudo apt-get install nginx-full` (includes check_http module)
  - Test syntax: `sudo nginx -t`
  - Start: `sudo systemctl start nginx`
  - Enable: `sudo systemctl enable nginx`
  - Verify: `sudo systemctl status nginx`

- [ ] **Configure Let's Encrypt SSL**
  - Install certbot: `sudo apt-get install certbot python3-certbot-nginx`
  - Get certificate:
    ```bash
    sudo certbot certonly --standalone -d api.koinoniasms.com
    ```
  - Certificate paths:
    - Full chain: `/etc/letsencrypt/live/api.koinoniasms.com/fullchain.pem`
    - Private key: `/etc/letsencrypt/live/api.koinoniasms.com/privkey.pem`
  - Auto-renew: `sudo systemctl enable certbot.timer`
  - Verify: `sudo systemctl status certbot.timer`

- [ ] **Test NGINX Health Checks**
  ```bash
  # Check NGINX status page (requires curl access from private network)
  curl http://localhost:8080/nginx_status

  # Expected output:
  # Active connections: X
  # server accepts handled requests
  ```

#### Step 2: Backend Server Registration
- [ ] **Update DNS Records**
  - Current: Points to single backend server
  - New: Points to NGINX load balancer IP
  - Verify: `nslookup api.koinoniasms.com` returns NGINX IP
  - Allow 5-10 minutes for DNS propagation

- [ ] **Verify Backend Health Checks**
  - Each backend server has `/health` endpoint running
  - Test: `curl http://backend-1.internal:3000/health` (from NGINX)
  - Test: `curl http://backend-2.internal:3000/health` (from NGINX)
  - Test: `curl http://backend-3.internal:3000/health` (from NGINX)
  - Expected: All return `{"status":"ok",...}`

- [ ] **Test Load Balancer Traffic Distribution**
  ```bash
  # From client, make multiple requests and check response headers
  for i in {1..10}; do
    curl -i https://api.koinoniasms.com/health | grep -E "Via|Server"
  done

  # Should see traffic distributed across servers
  ```

---

### Phase 2.3: Distributed Job Locking (Week 2-3)

#### Step 1: Integrate Lock Service into Cron Jobs
- [ ] **Update Recurring Messages Job**
  - File: `/backend/src/jobs/recurringMessages.job.ts`
  - Add: Import lock service
    ```typescript
    import { withJobLock } from '../services/lock.service.js';
    ```
  - Wrap job execution:
    ```typescript
    const result = await withJobLock('recurring-messages', async () => {
      // Existing job logic here
    });
    if (!result) {
      console.log('Another server already processing recurring messages');
      return;
    }
    ```

- [ ] **Update Phone Linking Recovery Job**
  - File: `/backend/src/jobs/phoneLinkingRecovery.job.ts`
  - Same pattern as above with job name: `'phone-linking-recovery'`

- [ ] **Update Any Other Cron Jobs** (as applicable)
  - Search for: `node-cron` schedule calls
  - Pattern: Wrap each with `withJobLock()`
  - Job names should be descriptive and unique

#### Step 2: Verify Lock Behavior
- [ ] **Test with Single Server**
  - Run backend with: `npm run dev`
  - Trigger job manually (if available) or wait for scheduled execution
  - Verify: Lock is acquired and released
  - Logs should show: `✅ Acquired lock for job: ...` and `✅ Released job lock`

- [ ] **Test with Multi-Server Setup**
  - Start backend on server 1: `npm start` (on production server 1)
  - Start backend on server 2: `npm start` (on production server 2)
  - Trigger job execution
  - Server 1 logs: `✅ Acquired lock for job: ...`
  - Server 2 logs: `⏭️  Job lock held by another server: ...`
  - Expected: Only one server runs job, other skips

- [ ] **Create Monitoring Endpoint** (Optional but recommended)
  - Add admin route to check active locks:
    ```typescript
    router.get('/admin/locks', async (req, res) => {
      const locks = await getActiveJobLocks();
      res.json({ active_locks: locks });
    });
    ```
  - Verify: Can see current lock status at startup

---

### Phase 2.4: Health Check Validation (Week 1-2)

#### Step 1: Local Testing
- [ ] **Start Backend Server**
  ```bash
  cd backend
  npm run build
  npm run dev
  ```

- [ ] **Test Simple Health Endpoint**
  ```bash
  curl http://localhost:3000/health

  # Expected: 200 OK
  # Response: {"status":"ok","timestamp":"2025-12-04T..."}
  ```

- [ ] **Test Detailed Health Endpoint**
  ```bash
  curl http://localhost:3000/health/detailed

  # Expected: 200 OK (if DB and Redis healthy)
  # Response: {
  #   "status": "healthy",
  #   "checks": {
  #     "database": "ok",
  #     "redis": "ok",
  #     "application": "ok"
  #   },
  #   "timestamp": "2025-12-04T..."
  # }
  ```

- [ ] **Test Readiness Endpoint**
  ```bash
  curl http://localhost:3000/health/ready

  # Expected: 200 OK if DB and Redis are ready
  # Expected: 503 if not ready (startup scenario)
  ```

- [ ] **Test Liveness Endpoint**
  ```bash
  curl http://localhost:3000/health/live

  # Expected: 200 OK (always, as long as process is alive)
  # Response includes process uptime
  ```

#### Step 2: Production Testing (Post-NGINX deployment)
- [ ] **Test Through NGINX**
  ```bash
  curl https://api.koinoniasms.com/health
  curl https://api.koinoniasms.com/health/detailed
  ```

- [ ] **Verify NGINX Health Check Configuration**
  - NGINX checks `/health` endpoint every 10 seconds
  - Verify: Server status in `curl http://nginx-host:8080/nginx_status`
  - All 3 backends should show as: "check_http_status: 0" (healthy)

- [ ] **Test Graceful Shutdown**
  - Stop Redis: `redis-cli shutdown`
  - Call detailed health: Should return 503 with redis=failed
  - Restart Redis: Should recover
  - This tests NGINX can remove backend on health check failure

---

### Phase 2.5: Rate Limiting Validation (Week 2)

#### Step 1: Verify NGINX Rate Limiting
- [ ] **Test Auth Rate Limit** (10 req/s)
  ```bash
  # Rapid fire requests to auth endpoint
  for i in {1..15}; do
    curl -s https://api.koinoniasms.com/api/auth/login -X POST \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"test"}' \
      -w "Status: %{http_code}\n" &
    sleep 0.05
  done
  wait

  # Expected: First 10-11 succeed (burst=5), rest get 429 Too Many Requests
  ```

- [ ] **Test API Rate Limit** (100 req/s)
  ```bash
  # Less strict for general API
  for i in {1..150}; do
    curl -s https://api.koinoniasms.com/api/conversations \
      -H "Authorization: Bearer token" \
      -w "Status: %{http_code}\n" &
    sleep 0.01
  done
  wait

  # Expected: More requests allowed before 429
  ```

---

### Phase 2.6: Multi-Server Scaling (Week 3-4)

#### Step 1: Scale to 3-4 Backend Servers
- [ ] **Server 1 Already Running** (existing production server)
  - Health check passing: `curl http://backend-1:3000/health` = 200
  - Registered in NGINX upstream

- [ ] **Provision Server 2**
  - Same instance type as Server 1
  - Same NODE_ENV = production
  - Same code version (use git tags for consistency)
  - Same environment variables (.env or Render config)
  - UPDATE: Database_URL points to PgBouncer (not direct DB)
  - Run: `npm run build && npm start`
  - Register hostname as: `backend-2.internal:3000` in NGINX

- [ ] **Provision Server 3**
  - Identical setup to Server 2
  - Register hostname as: `backend-3.internal:3000` in NGINX

- [ ] **Test Traffic Distribution**
  ```bash
  # Make 100 requests and check which backend responded
  for i in {1..100}; do
    curl -s https://api.koinoniasms.com/health \
      -H "X-Forwarded-For: 192.168.1.$((RANDOM % 254 + 1))" \
      -w "Server: %{remote_ip}\n"
  done | sort | uniq -c

  # Expected: Traffic roughly evenly distributed across 3 servers
  # ~33-34 requests each
  ```

- [ ] **Test Graceful Failover**
  - Stop Server 1: `kill $(pgrep -f "node dist/index.js")`
  - Make requests to API endpoint
  - Verify: NGINX removes Server 1 after 5 failed health checks (~50 seconds)
  - Verify: Traffic routes to Servers 2 and 3 only
  - Restart Server 1
  - Verify: NGINX re-adds it after 3 successful health checks (~30 seconds)

---

## 📊 PERFORMANCE VALIDATION

### Expected Metrics After Phase 2
| Metric | Target | Validation Method |
|--------|--------|-------------------|
| **Throughput** | 1,500-2,000 req/sec | Load test with k6 |
| **Connection Pooling** | 30 DB → 300+ concurrent | `SHOW POOLS` in PgBouncer |
| **Load Distribution** | Equal across 3 servers | Monitor NGINX status |
| **Health Check Latency** | < 5ms | `curl -w @curl-format.txt` |
| **Availability** | 99.9% uptime | Monitor for 24 hours |
| **Job Duplication** | Zero duplicates | Check logs across servers |

### Load Testing with k6
```bash
# Run smoke test (baseline)
npm run loadtest:smoke

# Run load test (1,500 req/sec target)
npm run loadtest:load

# Run spike test (sudden traffic spike)
npm run loadtest:spike

# Run long-running test (stability)
npm run loadtest:soak

# Run message-focused test
npm run loadtest:conversation
```

---

## 🔒 SECURITY VALIDATION

### TLS/SSL Certificate
- [ ] Certificate is valid: `openssl s_client -connect api.koinoniasms.com:443`
- [ ] Certificate not self-signed
- [ ] Certificate includes correct domain
- [ ] HSTS header present: `Strict-Transport-Security: max-age=31536000`

### Rate Limiting
- [ ] Auth endpoints have strict limits (10 req/s)
- [ ] API endpoints have reasonable limits (100 req/s)
- [ ] Webhook endpoints have moderate limits (50 req/s)
- [ ] Rate limit headers present in response

### Security Headers
- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Content-Security-Policy` header present
- [ ] HSTS enabled and set to 1 year

---

## 📝 DEPLOYMENT SIGN-OFF

- [ ] All pre-deployment validation passed
- [ ] All infrastructure deployed and tested
- [ ] All health checks passing
- [ ] All security checks passed
- [ ] Load testing shows expected improvement
- [ ] Team trained on new infrastructure
- [ ] Runbooks created and available
- [ ] Monitoring and alerting configured

**Sign-off Date**: __________
**Deployed By**: __________
**Reviewed By**: __________

---

## 🎯 SUCCESS CRITERIA

Phase 2 deployment is **COMPLETE** when:
1. ✅ 3 backend servers running behind NGINX load balancer
2. ✅ PgBouncer pooling 30 DB connections to 300+ concurrent users
3. ✅ Distributed job locking prevents duplicate execution
4. ✅ Health checks working correctly and available to load balancer
5. ✅ Load testing shows 1.5-3x improvement in throughput
6. ✅ 99.9% availability maintained during testing
7. ✅ All team members trained on new infrastructure

---

## 🚀 NEXT STEPS (After Successful Deployment)

1. **Continue to Phase 2.4-2.6** (Optional, per timeline):
   - Implement centralized logging (DataDog, ELK, or CloudWatch)
   - Set up read replicas for analytics queries
   - Complete full multi-server hardening

2. **Monitor Metrics** for 2-4 weeks:
   - Track throughput improvement
   - Monitor error rates
   - Watch for any anomalies

3. **Proceed to Phase 3** when ready:
   - Database partitioning for 50K+ churches
   - Message archiving to S3
   - API standardization and OpenAPI docs
   - See: `/PHASE3-IMPLEMENTATION-PLAN.md`
