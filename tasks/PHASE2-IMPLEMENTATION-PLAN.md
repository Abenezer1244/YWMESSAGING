# Phase 2: Horizontal Scaling Foundation - Implementation Plan

**Status**: Planning & Preparation
**Target Timeline**: Weeks 5-12 (8 weeks)
**Target Capacity**: 2,000-5,000 concurrent users
**Expected Revenue**: $150K-250K MRR
**Expected Throughput**: 750-1,500 req/sec (3-6x Phase 1)

---

## 📋 PHASE 2 OVERVIEW

### Current State (After Phase 1)
- Single backend server with PM2 clustering (4-8 processes)
- Single PostgreSQL database (30 connection limit)
- Single Redis instance for sessions/caching
- ~1,000 req/sec throughput
- ~5,000 church capacity

### Target State (After Phase 2)
- 3-4 backend servers behind NGINX load balancer
- PgBouncer connection pooling layer
- 1-2 read replicas for analytics queries
- Distributed job locking for cron tasks
- Structured logging and APM monitoring
- ~1,500 req/sec throughput per server (3-4x per server)
- ~10,000+ church capacity

### Key Improvements
| Component | Phase 1 | Phase 2 | Improvement |
|-----------|---------|---------|------------|
| Backend Servers | 1 (multi-process) | 3-4 | 3-4x |
| Concurrent Users | 1,000 | 2,000-5,000 | 2-5x |
| Database Connections | 30 (Prisma) | 300+ (via PgBouncer) | 10x |
| Read Queries | Primary only | Split to replicas | 2x faster reads |
| Job Deduplication | None | Redlock | Prevents duplicates |
| Monitoring | Basic metrics | Full APM + logging | Complete visibility |

---

## 🎯 PHASE 2 TASKS (6 Feature Areas)

### **2.1: PgBouncer Connection Pooling** (6 hours total)
**Goal**: Increase connection capacity from 30 to 300+ concurrent connections

#### 2.1.1: Design PgBouncer Infrastructure (2 hours)
**What**: Plan where PgBouncer will run and how to configure it

**Decisions Needed**:
- [ ] Deployment location: Railway sidecar OR dedicated DigitalOcean droplet OR AWS EC2
  - **Recommendation**: Railway sidecar (cheapest, co-located with DB)
  - **Alternative**: $5/mo DigitalOcean droplet if Railway sidecar unavailable
- [ ] Pool mode: `transaction` mode recommended for Prisma
- [ ] Pool size: 30-50 (based on backend server count)
- [ ] Failover strategy: Primary/backup setup or single instance

**Deliverables**:
- [ ] Decision document on deployment approach
- [ ] Configuration plan with pool calculations
- [ ] Network diagram showing PgBouncer placement

**Success Criteria**:
- [ ] Architecture documented and approved
- [ ] Resource estimates calculated

---

#### 2.1.2: Deploy PgBouncer Instance (2 hours)
**What**: Actually set up and run PgBouncer

**Steps**:
1. Choose deployment platform (Railway/DigitalOcean)
2. Install PgBouncer (apt-get or Railway container)
3. Create `/etc/pgbouncer/pgbouncer.ini` with:
   ```ini
   [databases]
   connect_yw_production = host=dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com port=5432 dbname=connect_yw_production

   [pgbouncer]
   pool_mode = transaction
   max_client_conn = 1000
   default_pool_size = 30
   min_pool_size = 10
   reserve_pool_size = 5
   reserve_pool_timeout = 3
   max_db_connections = 100
   max_user_connections = 100
   server_lifetime = 3600
   ```
4. Create `/etc/pgbouncer/userlist.txt` with database credentials
5. Start PgBouncer service
6. Verify connection: `psql -h localhost -p 6432 -U user connect_yw_production`

**Success Criteria**:
- [ ] PgBouncer running and accessible on port 6432
- [ ] Direct connection works: `psql -h <pgbouncer-host> -p 6432`
- [ ] Can see `SHOW STATS` in admin console

**Files to Create**:
- [ ] `/infrastructure/pgbouncer/pgbouncer.ini` (configuration template)
- [ ] `/infrastructure/pgbouncer/userlist.txt` (credentials)
- [ ] `/infrastructure/pgbouncer/deployment.md` (setup guide)

---

#### 2.1.3: Update Prisma Database URL (1 hour)
**What**: Point backend to PgBouncer instead of PostgreSQL directly

**Changes**:
1. Update `.env` DATABASE_URL:
   ```
   FROM: postgresql://user:pass@dpg-...region-postgres.render.com/db?connection_limit=30&pool_timeout=45
   TO:   postgresql://user:pass@<pgbouncer-host>:6432/connect_yw_production?connection_limit=5&pool_timeout=45&pgbouncer=true
   ```

   **Note**: Set `connection_limit=5` per backend (PgBouncer handles total pooling)

2. Update `/backend/prisma/schema.prisma` datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     // ✅ PHASE 2: Connection pooling via PgBouncer
     // - PgBouncer handles 300+ concurrent connections
     // - Each backend has limited pool (5 connections)
     // - Transaction mode prevents connection reuse issues
   }
   ```

3. Test connection from each backend server:
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

**Success Criteria**:
- [ ] All backend servers connect to PgBouncer without errors
- [ ] Database queries execute normally
- [ ] Connection pool is being reused (check PgBouncer stats)

---

#### 2.1.4: Monitor PgBouncer Performance (1 hour)
**What**: Set up monitoring to ensure PgBouncer is healthy

**Monitoring Tasks**:
1. Create admin console connection:
   ```bash
   psql -h <pgbouncer-host> -p 6432 -U pgbouncer pgbouncer
   ```

2. Run key monitoring commands:
   ```sql
   SHOW POOLS;        -- Connection pool status
   SHOW STATS;        -- Request/query statistics
   SHOW CLIENTS;      -- Connected clients
   SHOW SERVERS;      -- Backend connections
   ```

3. Set up dashboard to track:
   - Total connections (target: 100-300)
   - Connection reuse ratio (target: 95%+)
   - Query latency (should be <5ms more than direct)
   - Failed connections (target: 0)

**Success Criteria**:
- [ ] Can access PgBouncer admin console
- [ ] Connection reuse ratio > 90%
- [ ] No connection errors in logs
- [ ] Query latency unchanged (PgBouncer is transparent)

---

### **2.2: NGINX Load Balancer Setup** (8 hours total)
**Goal**: Distribute traffic across 3-4 backend servers

#### 2.2.1: Plan Load Balancer Infrastructure (2 hours)
**What**: Decide where and how to deploy NGINX

**Decisions Needed**:
- [ ] Deployment: Railway? DigitalOcean? AWS?
  - **Recommendation**: DigitalOcean Load Balancer ($10-20/mo) OR dedicated droplet ($5/mo)
  - **Alternative**: AWS Application Load Balancer
- [ ] DNS setup: Move `api.koinoniasms.com` to NGINX IP
- [ ] High availability: Single NGINX or HA pair?
  - **Recommendation**: Start with single, upgrade to HA if traffic justifies

**Deliverables**:
- [ ] Infrastructure decision document
- [ ] DNS change plan
- [ ] Failover strategy

**Success Criteria**:
- [ ] Architecture approved
- [ ] No DNS cutover until ready

---

#### 2.2.2: Deploy NGINX Server (2 hours)
**What**: Set up NGINX with backend load balancing

**Steps**:
1. Provision server (DigitalOcean 2GB RAM, 2 CPU is sufficient)
2. Install NGINX: `apt-get install nginx`
3. Create `/etc/nginx/conf.d/backend.conf`:
   ```nginx
   upstream backend_servers {
     # Use least_conn to route to server with fewest connections
     least_conn;

     # Backend servers (add more as you scale)
     server backend-1.internal:3000 weight=1 max_fails=3 fail_timeout=30s;
     server backend-2.internal:3000 weight=1 max_fails=3 fail_timeout=30s;
     server backend-3.internal:3000 weight=1 max_fails=3 fail_timeout=30s;
   }

   server {
     listen 80 default_server;
     server_name api.koinoniasms.com;

     # Redirect HTTP to HTTPS
     return 301 https://$server_name$request_uri;
   }

   server {
     listen 443 ssl http2;
     server_name api.koinoniasms.com;

     # SSL certificates (Let's Encrypt)
     ssl_certificate /etc/letsencrypt/live/api.koinoniasms.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/api.koinoniasms.com/privkey.pem;

     # Security headers
     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
     add_header X-Frame-Options "SAMEORIGIN" always;
     add_header X-Content-Type-Options "nosniff" always;

     # Proxy settings
     proxy_connect_timeout 60s;
     proxy_send_timeout 60s;
     proxy_read_timeout 60s;

     location / {
       proxy_pass http://backend_servers;

       # Pass client IP and protocol info
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header Host $host;

       # WebSocket support
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";

       # Timeouts
       proxy_connect_timeout 60s;
       proxy_send_timeout 60s;
       proxy_read_timeout 60s;
     }

     # Health check endpoint
     location /health {
       access_log off;
       proxy_pass http://backend_servers;
     }
   }
   ```

4. Enable NGINX:
   ```bash
   systemctl restart nginx
   systemctl enable nginx
   ```

**Success Criteria**:
- [ ] NGINX starts without errors
- [ ] Can curl `http://localhost` and get response
- [ ] No SSL errors in logs

**Files to Create**:
- [ ] `/infrastructure/nginx/backend.conf` (upstream & server config)
- [ ] `/infrastructure/nginx/ssl-setup.md` (Let's Encrypt setup guide)
- [ ] `/infrastructure/nginx/monitoring.md` (monitoring guide)

---

#### 2.2.3: Configure SSL/TLS Termination (1 hour)
**What**: Set up HTTPS with certificates

**Steps**:
1. Install Certbot: `apt-get install certbot python3-certbot-nginx`
2. Generate certificate:
   ```bash
   certbot certonly --standalone -d api.koinoniasms.com
   ```
3. Configure NGINX to use certificate (already in config above)
4. Set up auto-renewal:
   ```bash
   systemctl enable certbot.timer
   systemctl start certbot.timer
   ```
5. Test SSL: `https://api.koinoniasms.com`

**Success Criteria**:
- [ ] HTTPS works: `curl https://api.koinoniasms.com/health` returns 200
- [ ] No SSL warnings
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal enabled

---

#### 2.2.4: Implement Health Checks (1 hour)
**What**: Create endpoint so NGINX can detect dead backend servers

**Backend Changes**:
1. Create `/backend/src/routes/health.routes.ts`:
   ```typescript
   import { Router, Request, Response } from 'express';
   import { checkDatabaseHealth } from '../lib/prisma.js';

   const router = Router();

   // Simple health check (used by load balancer)
   router.get('/health', (req: Request, res: Response) => {
     return res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });

   // Detailed health check (used for monitoring)
   router.get('/health/detailed', async (req: Request, res: Response) => {
     try {
       const dbHealthy = await checkDatabaseHealth();
       return res.json({
         status: dbHealthy ? 'healthy' : 'degraded',
         database: dbHealthy ? 'ok' : 'error',
         timestamp: new Date().toISOString(),
       });
     } catch (error) {
       return res.status(503).json({
         status: 'unhealthy',
         error: (error as Error).message,
       });
     }
   });

   export default router;
   ```

2. Register in `/backend/src/app.ts`:
   ```typescript
   import healthRoutes from './routes/health.routes.js';
   app.use('/', healthRoutes);  // Not under /api so load balancer can access
   ```

3. NGINX will check `/health` every 30 seconds
4. If 3 consecutive failures, server is marked down

**Success Criteria**:
- [ ] `curl http://localhost:3000/health` returns 200
- [ ] NGINX `SHOW UPSTREAMS` shows all servers up
- [ ] Stopping backend service marks server as down in NGINX

---

#### 2.2.5: Set Up Rate Limiting at NGINX (1 hour)
**What**: Prevent abuse and DDoS attacks

**Configuration**:
```nginx
# In /etc/nginx/nginx.conf (http block)

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

# Per-endpoint limits
server {
  # Auth endpoints: 10 requests/second
  location ~^/api/(auth|login|register) {
    limit_req zone=auth_limit burst=5 nodelay;
    proxy_pass http://backend_servers;
  }

  # General API: 100 requests/second
  location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://backend_servers;
  }

  # Health check: no limit
  location /health {
    proxy_pass http://backend_servers;
  }
}
```

**Success Criteria**:
- [ ] Rate limiting is active
- [ ] Exceeding limit returns 429 Too Many Requests
- [ ] Burst tolerance works as expected

---

#### 2.2.6: Monitor NGINX Performance (1 hour)
**What**: Set up monitoring dashboard for load balancer

**Monitoring Setup**:
1. Enable NGINX status page:
   ```nginx
   server {
     listen 8080;  # Internal monitoring port
     location /nginx_status {
       stub_status on;
       access_log off;
       allow 127.0.0.1;
       allow 10.0.0.0/8;  # Private network
       deny all;
     }
   }
   ```

2. Monitor key metrics:
   - Active connections
   - Requests per second
   - Connection distribution (which backend gets most traffic)
   - Upstream failures (dead backends)

3. Create monitoring script to collect metrics every minute

**Success Criteria**:
- [ ] Can access `http://nginx-server:8080/nginx_status`
- [ ] Connection count increases with load
- [ ] Traffic distributed across all healthy backends

---

### **2.3: Distributed Job Locking** (3 hours total)
**Goal**: Prevent duplicate cron jobs on multiple servers

#### 2.3.1: Implement Redlock-based Job Locking (2 hours)
**What**: Use Redis to ensure only one server runs critical jobs

**Implementation**:
1. Install Redlock: `npm install redlock`

2. Create `/backend/src/services/lock.service.ts`:
   ```typescript
   import Redlock from 'redlock';
   import { redisClient } from '../lib/redis.js';

   const redlock = new Redlock(
     [redisClient],
     {
       driftFactor: 0.01,
       retryCount: 3,
       retryDelay: 200,
       retryJitter: 200,
       automaticExtensionThreshold: 500,
     }
   );

   /**
    * Acquire lock for a distributed job
    * Returns lock object or null if lock failed
    */
   export async function acquireJobLock(
     jobName: string,
     ttlMs: number = 30000  // 30 second lock
   ) {
     try {
       const lock = await redlock.lock(`job:${jobName}`, ttlMs);
       console.log(`✅ Acquired lock for job: ${jobName}`);
       return lock;
     } catch (error) {
       console.log(`⏭️  Job lock in use on another server: ${jobName}`);
       return null;
     }
   }

   /**
    * Release a lock when done
    */
   export async function releaseJobLock(lock: any) {
     try {
       await lock.unlock();
       console.log('✅ Released job lock');
     } catch (error) {
       console.warn('⚠️  Lock was already released or expired');
     }
   }
   ```

3. Update `/backend/src/jobs/recurringMessages.job.ts`:
   ```typescript
   import { acquireJobLock, releaseJobLock } from '../services/lock.service.js';

   export async function processRecurringMessages() {
     let lock = null;
     try {
       // Try to acquire lock (only one server can hold at a time)
       lock = await acquireJobLock('recurring-messages', 60000);

       if (!lock) {
         console.log('Another server is already processing recurring messages');
         return;  // Skip this run
       }

       // ... rest of job logic ...
       console.log('✅ Recurring messages processed');
     } finally {
       if (lock) {
         await releaseJobLock(lock);
       }
     }
   }
   ```

4. Update `/backend/src/jobs/phoneLinkingRecovery.job.ts` similarly

**Success Criteria**:
- [ ] Redlock installed and imported
- [ ] Job lock service created
- [ ] Recurring message job wrapped with lock
- [ ] Phone linking job wrapped with lock

---

#### 2.3.2: Test Distributed Job Execution (1 hour)
**What**: Verify only one server runs the job

**Testing Steps**:
1. Deploy to 2 backend servers
2. Set cron to run every minute: `*/1 * * * *`
3. Monitor logs from both servers:
   ```bash
   # Server 1
   pm2 logs | grep "job:recurring-messages"

   # Server 2
   pm2 logs | grep "job:recurring-messages"
   ```
4. Verify:
   - [ ] Only ONE server shows "✅ Acquired lock"
   - [ ] Other server shows "⏭️  Job lock in use"
5. Kill server 1 process
6. Verify server 2 acquires lock on next run
7. Restart server 1
8. Verify lock automatically transfers

**Success Criteria**:
- [ ] Exactly one server acquires lock per job run
- [ ] Lock transfers correctly on server failure
- [ ] No duplicate job executions in logs

---

### **2.4: Centralized Logging & Monitoring** (7 hours total)
**Goal**: Unified visibility across all backend servers

#### 2.4.1: Implement Structured Logging (3 hours)
**What**: Replace console.log with structured JSON logging

**Implementation**:
1. Install Winston: `npm install winston`

2. Create `/backend/src/lib/logger.ts`:
   ```typescript
   import winston from 'winston';

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     defaultMeta: { service: 'yw-messaging-backend' },
     transports: [
       // Console output (JSON format)
       new winston.transports.Console(),

       // File output for errors
       new winston.transports.File({
         filename: 'logs/error.log',
         level: 'error',
         maxsize: 5242880,  // 5MB
         maxFiles: 5,
       }),

       // File output for all logs
       new winston.transports.File({
         filename: 'logs/combined.log',
         maxsize: 5242880,
         maxFiles: 5,
       }),
     ],
   });

   export default logger;
   ```

3. Create request ID middleware `/backend/src/middleware/request-id.middleware.ts`:
   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { v4 as uuidv4 } from 'uuid';

   export function requestIdMiddleware(
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     req.id = req.headers['x-request-id'] as string || uuidv4();
     res.setHeader('X-Request-ID', req.id);
     next();
   }

   // Extend Express Request type
   declare global {
     namespace Express {
       interface Request {
         id: string;
       }
     }
   }
   ```

4. Add to `/backend/src/app.ts`:
   ```typescript
   import { requestIdMiddleware } from './middleware/request-id.middleware.js';
   app.use(requestIdMiddleware);
   ```

5. Create logging service `/backend/src/services/log.service.ts`:
   ```typescript
   import logger from '../lib/logger.js';

   export function logApiRequest(
     req: Express.Request,
     method: string,
     endpoint: string,
     details?: any
   ) {
     logger.info('API Request', {
       requestId: req.id,
       method,
       endpoint,
       ip: req.ip,
       userId: req.user?.id,
       churchId: req.user?.churchId,
       ...details,
     });
   }

   export function logApiError(
     req: Express.Request,
     error: Error,
     context?: any
   ) {
     logger.error('API Error', {
       requestId: req.id,
       error: error.message,
       stack: error.stack,
       ...context,
     });
   }

   export function logDatabaseQuery(
     query: string,
     duration: number,
     context?: any
   ) {
     if (duration > 100) {  // Only log slow queries
       logger.warn('Slow Database Query', {
         query: query.substring(0, 200),
         duration,
         ...context,
       });
     }
   }
   ```

**Success Criteria**:
- [ ] Winston logger configured
- [ ] Request ID middleware added
- [ ] All major operations log via winston
- [ ] Logs are in JSON format (not console.log strings)
- [ ] Log rotation enabled

---

#### 2.4.2: Set Up Log Aggregation (2 hours)
**What**: Collect logs from all servers into central location

**Option A: CloudWatch (AWS)**
1. Install AWS SDK: `npm install @aws-sdk/client-cloudwatch-logs`
2. Create CloudWatch transport for Winston
3. Logs automatically ship to AWS

**Option B: LogRocket (No infrastructure)**
1. Sign up at logrocket.com
2. Install: `npm install @logrocket/node`
3. Automatic log collection and analysis

**Option C: ELK Stack (Self-hosted)**
1. Requires Elasticsearch + Logstash + Kibana
2. More complex but complete control

**Recommendation**: Start with **LogRocket** (easiest) or **CloudWatch** (if using AWS)

**Setup for LogRocket**:
```typescript
// In /backend/src/app.ts
import LogRocket from '@logrocket/node';

LogRocket.init(process.env.LOGROCKET_ID);
LogRocket.getSessionURL(sessionURL => {
  console.log(`LogRocket session: ${sessionURL}`);
});
```

**Success Criteria**:
- [ ] Logs shipping to aggregation service
- [ ] Can search logs by:
  - [ ] Request ID
  - [ ] Church ID
  - [ ] Error type
  - [ ] Time range
- [ ] Log retention configured (minimum 7 days)

---

#### 2.4.3: Implement APM Monitoring (2 hours)
**What**: Track application performance metrics

**APM Tool Options**:
- **DataDog** (recommended) - $15/host/month
- **New Relic** - $39/month per host
- **Elastic APM** - Self-hosted (free)

**DataDog Setup**:
1. Sign up at datadoghq.com
2. Install agent: `npm install dd-trace`
3. Create `/backend/src/lib/tracing.ts`:
   ```typescript
   import tracer from 'dd-trace';

   tracer.init();
   tracer.setUser({
     id: 'backend-server',
     email: 'backend@koinoniasms.com',
   });

   export default tracer;
   ```
4. Import in `/backend/src/index.ts`:
   ```typescript
   import './lib/tracing.js';  // Must be first import
   ```

**Monitor These Metrics**:
- [ ] Request latency (p50, p95, p99)
- [ ] Error rate
- [ ] Database query performance
- [ ] Cache hit rate
- [ ] Queue processing time
- [ ] Memory usage
- [ ] CPU usage

**Alerts to Set Up**:
- [ ] Error rate > 1%
- [ ] p95 latency > 500ms
- [ ] Database connection pool exhausted
- [ ] Queue backlog > 1000 jobs
- [ ] Memory > 80%

**Success Criteria**:
- [ ] APM dashboard shows all metrics
- [ ] Can see performance by endpoint
- [ ] Can trace individual requests
- [ ] Alerts configured and tested

---

### **2.5: Read Replicas for PostgreSQL** (5 hours total)
**Goal**: Offload analytics queries to separate database

#### 2.5.1: Plan Read Replica Strategy (1 hour)
**What**: Decide how many replicas and where to place them

**Decisions**:
- [ ] Replica count: 1-2 recommended
  - **1 replica**: Good for read scaling
  - **2 replicas**: Better HA, separate endpoints for analytics
- [ ] Placement: Same region as primary (lower latency)
- [ ] Failover: Manual or automatic?

**Topology Options**:

**Option A: Single Replica (Recommended)**
```
┌─────────────────┐
│  Primary DB     │←──writes from app
└────────┬────────┘
         │ streaming replication
         ↓
┌─────────────────┐
│ Read Replica    │←──analytics/bulk queries
└─────────────────┘
```

**Option B: Multiple Replicas**
```
┌─────────────────┐
│  Primary DB     │←──writes
└────────┬────────┘
         │ replication
         ├──→ Replica 1 (analytics)
         └──→ Replica 2 (backups)
```

**Recommendation**: Start with **Option A** (single replica)

**Success Criteria**:
- [ ] Strategy documented
- [ ] Replication plan approved

---

#### 2.5.2: Deploy Read Replica (3 hours)
**What**: Create replica database and test failover

**Steps for Railway** (current provider):
1. Go to Railway dashboard
2. Create new PostgreSQL service from backup
3. Configure as read replica:
   - Select "Promote from backup" option
   - Configure streaming replication
4. Get replica connection string
5. Test replication lag:
   ```bash
   # On primary
   SELECT now();

   # On replica (should be nearly identical)
   SELECT now();
   ```

**Steps for Manual Setup**:
```bash
# 1. Create backup of primary
pg_dump $PRIMARY_DB > backup.sql

# 2. Create replica database
createdb -h replica-host connect_yw_production

# 3. Restore backup
psql -h replica-host connect_yw_production < backup.sql

# 4. Set up streaming replication (requires primary config changes)
# This is complex and usually handled by managed databases
```

**Success Criteria**:
- [ ] Replica database created and accessible
- [ ] Streaming replication active (check logs)
- [ ] Replication lag < 100ms
- [ ] Data matches between primary and replica

---

#### 2.5.3: Implement Read/Write Splitting (2 hours)
**What**: Route reads to replica, writes to primary

**Implementation**:
1. Create `/backend/src/lib/prisma-replica.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client';

   // Primary (reads + writes)
   export const prismaWrite = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,  // Primary
       },
     },
   });

   // Replica (reads only)
   export const prismaRead = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_REPLICA_URL,  // Replica
       },
     },
   });
   ```

2. Create query helper `/backend/src/lib/db-router.ts`:
   ```typescript
   import { prismaWrite, prismaRead } from './prisma-replica.js';

   /**
    * Route queries to appropriate database
    * Analytics and list queries → replica
    * Writes and critical reads → primary
    */
   export const db = {
     // Write operations (primary only)
     write: prismaWrite,

     // Read-only operations (replica)
     read: prismaRead,

     // Analytics queries (definitely replica)
     analytics: prismaRead,
   };
   ```

3. Update services to use read replica for safe queries:
   ```typescript
   // In /backend/src/services/stats.service.ts
   import { db } from '../lib/db-router.js';

   export async function getSummaryStats(churchId: string) {
     // Use read replica for analytics
     const stats = await db.read.church.findUnique({
       where: { id: churchId },
       select: { _count: { select: { members: true } } },
     });
   }

   // In /backend/src/services/member.service.ts
   export async function getMembers(groupId: string) {
     // Use read replica for list queries
     const members = await db.read.groupMember.findMany({
       where: { groupId },
     });
   }
   ```

4. Keep write operations on primary:
   ```typescript
   export async function addMember(groupId: string, data: CreateMemberData) {
     // Use primary for writes
     const member = await db.write.member.create({
       data: { /* ... */ },
     });
   }
   ```

**Success Criteria**:
- [ ] Reads route to replica
- [ ] Writes route to primary
- [ ] Analytics queries use replica
- [ ] No data loss on replica failover

---

#### 2.5.4: Monitor Replication Lag (1 hour)
**What**: Ensure replica stays in sync with primary

**Monitoring Setup**:
1. Create `/backend/src/routes/replication.routes.ts`:
   ```typescript
   router.get('/replication-lag', async (req, res) => {
     try {
       // Check lag on primary
       const primary = await prismaWrite.$queryRaw`
         SELECT
           slot_name,
           restart_lsn,
           confirmed_flush_lsn,
           (write_lsn - confirmed_flush_lsn)::bigint as lag_bytes
         FROM pg_replication_slots
         WHERE slot_type = 'physical';
       `;

       res.json({
         replication_lag_bytes: primary[0]?.lag_bytes,
         replication_lag_mb: (primary[0]?.lag_bytes / 1024 / 1024).toFixed(2),
         status: primary[0]?.lag_bytes < 1000000 ? 'healthy' : 'lagging',
       });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

2. Alert thresholds:
   - **Normal**: < 100MB lag
   - **Warning**: 100-500MB lag
   - **Critical**: > 500MB lag or > 5 second lag

**Success Criteria**:
- [ ] Can monitor replication lag
- [ ] Lag consistently < 100MB
- [ ] Alerts configured for lag > 500MB

---

### **2.6: Multi-Server Deployment Strategy** (5 hours total)
**Goal**: Deploy and coordinate 3-4 backend servers

#### 2.6.1: Scale to 3-4 Backend Servers (3 hours)
**What**: Deploy additional Express instances behind load balancer

**Deployment Steps**:

1. **Provision new servers** (3 additional instances):
   ```bash
   # For each new server:
   - Provision 2GB RAM / 2 CPU droplet (DigitalOcean or Railway)
   - Install Node.js and PM2
   - Clone repository
   - Install dependencies
   - Set environment variables
   ```

2. **Synchronize configuration** across all servers:
   ```bash
   # Same .env file with PgBouncer DATABASE_URL
   DATABASE_URL=postgresql://...pgbouncer-host:6432/...
   REDIS_URL=redis://shared-redis:6379
   ENABLE_QUEUES=true
   ```

3. **Start all servers**:
   ```bash
   # On each server
   npm run build
   npm run start:pm2:prod
   pm2 save  # Persist process list
   ```

4. **Verify in NGINX**:
   ```bash
   # Check upstream status
   curl -s http://nginx:8080/nginx_status | grep upstream

   # Should show all servers as UP
   ```

**Success Criteria**:
- [ ] 4 total servers: 1 NGINX + 3-4 backends
- [ ] NGINX shows all backends as UP
- [ ] Traffic distributed across all servers
- [ ] Each server in separate region (optional, for HA)

---

#### 2.6.2: Implement Health Checks and Auto-Recovery (2 hours)
**What**: Monitor servers and auto-restart failed processes

**Server Health Monitoring**:
1. Set up monitoring service (e.g., DataDog agent):
   ```bash
   # On each backend server
   apt-get install datadog-agent
   systemctl start datadog-agent
   ```

2. Create health check script `/backend/scripts/health-check.sh`:
   ```bash
   #!/bin/bash

   # Check if Express is healthy
   HEALTH=$(curl -s http://localhost:3000/health)

   if [ "$HEALTH" == "" ]; then
     echo "Express crashed! Restarting..."
     pm2 restart all
   fi

   # Check database connectivity
   DB_HEALTH=$(curl -s http://localhost:3000/health/detailed | grep '"database":"ok"')
   if [ "$DB_HEALTH" == "" ]; then
     echo "Database connection failed!"
     # Alert operations team
     curl -X POST https://hooks.slack.com/... -d "Database health check failed on $(hostname)"
   fi
   ```

3. Run health check every 5 minutes:
   ```bash
   */5 * * * * /backend/scripts/health-check.sh
   ```

**Auto-Restart Procedures**:
```bash
# PM2 auto-restart on crash
pm2 restart app

# If PM2 fails, systemd can restart entire service
# Add to /etc/systemd/system/pm2-backend.service
[Unit]
Description=PM2 Backend Service
After=network.target

[Service]
Type=forking
User=ubuntu
ExecStart=/usr/local/bin/pm2 start /home/ubuntu/app/backend/ecosystem.config.js
ExecReload=/usr/local/bin/pm2 reload all
ExecStop=/usr/local/bin/pm2 stop all
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

4. Load balancer auto-removal:
   - NGINX automatically removes dead servers (after 3 failed health checks)
   - No manual intervention needed

**Success Criteria**:
- [ ] Health check script running on each server
- [ ] Failed processes auto-restart within 1 minute
- [ ] NGINX removes dead servers from rotation
- [ ] Alerts sent when critical components fail

---

## 📊 PHASE 2 EXPECTED METRICS

### Before Phase 2 (End of Phase 1)
- 1 server + PM2 clustering: 250-1,000 req/sec
- Single PostgreSQL: 30 connections
- Single Redis: all sessions + cache
- No distributed job locking
- No visibility across servers

### After Phase 2
| Metric | Phase 1 | Phase 2 | Improvement |
|--------|---------|---------|------------|
| **Throughput** | 1,000 req/sec | 1,500-3,000 req/sec | 1.5-3x |
| **Concurrent Users** | 1,000 | 2,000-5,000 | 2-5x |
| **DB Connections** | 30 | 300+ (via PgBouncer) | 10x |
| **Backend Servers** | 1 | 3-4 | 3-4x |
| **Read Query Latency** | 100-200ms | 50-100ms (replica) | 2x faster |
| **Server Availability** | 99% | 99.9% | -0.9% downtime |

---

## 🚀 PHASE 2 DEPLOYMENT CHECKLIST

### Pre-Deployment (Week 1)
- [ ] PgBouncer infrastructure designed
- [ ] NGINX server provisioned
- [ ] Read replica planned
- [ ] Redlock implemented and tested

### Deployment Order (Weeks 2-6)
1. [ ] Deploy PgBouncer (Day 1)
   - Update DATABASE_URL to point to PgBouncer
   - Test all backends connect successfully

2. [ ] Deploy NGINX (Day 2-3)
   - Set up SSL
   - Configure upstreams
   - Test health checks

3. [ ] Deploy 2nd backend server (Day 4)
   - Clone infrastructure from first server
   - Verify traffic distribution
   - Run load test

4. [ ] Deploy 3rd backend server (Day 5)
   - Verify even load distribution
   - Monitor database connection usage

5. [ ] Implement Redlock (Day 6)
   - Add lock service
   - Update cron jobs
   - Test with multiple servers

6. [ ] Deploy read replica (Day 7)
   - Create replica database
   - Test replication lag
   - Implement read/write splitting

### Post-Deployment (Weeks 7-8)
- [ ] Set up logging aggregation
- [ ] Deploy APM monitoring
- [ ] Run 24-hour load test
- [ ] Verify all metrics
- [ ] Document operational runbooks

---

## ⚠️ RISKS & MITIGATION

### Risk: PgBouncer becomes bottleneck
**Mitigation**: Monitor connection reuse ratio, scale PgBouncer pool if needed

### Risk: Replica lags behind primary
**Mitigation**: Set up replication lag monitoring, alert if > 100ms

### Risk: NGINX becomes single point of failure
**Mitigation**: Upgrade to NGINX HA pair or cloud load balancer if business critical

### Risk: Distributed locking fails, duplicate jobs run
**Mitigation**: Implement idempotent job logic, add duplicate detection

### Risk: Log volume explodes, overwhelming aggregation
**Mitigation**: Sample logs (10%) for verbose debug, keep all ERROR logs

---

## 📞 SUPPORT & DOCUMENTATION

Create documentation for operations team:
- [ ] `/infrastructure/PHASE2-DEPLOYMENT-GUIDE.md`
- [ ] `/infrastructure/PHASE2-OPERATIONAL-RUNBOOK.md`
- [ ] `/infrastructure/pgbouncer-monitoring.md`
- [ ] `/infrastructure/nginx-monitoring.md`
- [ ] `/infrastructure/redlock-troubleshooting.md`

---

## ✅ SUCCESS CRITERIA

Phase 2 is **complete** when:
1. ✅ 3-4 backend servers running behind NGINX
2. ✅ PgBouncer pooling all database connections
3. ✅ Read replica handling analytics queries
4. ✅ Distributed job locking prevents duplicates
5. ✅ Centralized logging and APM working
6. ✅ Load testing shows 2-3x throughput
7. ✅ 99.9% uptime maintained
8. ✅ All team members trained on new infrastructure

---

**Phase 2 Target Completion**: Week 12
**Expected Throughput Improvement**: 2-3x (1,000 → 2,000-3,000 req/sec)
**Expected Capacity Growth**: 3-5x (1,500 → 5,000+ churches)
