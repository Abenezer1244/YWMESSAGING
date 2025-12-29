# Phase 2 Deployment Runbook
## Step-by-Step Operational Guide for YWMESSAGING Scaling Infrastructure

**Purpose**: Production-ready guide for deploying Phase 2 infrastructure changes
**Audience**: DevOps engineers, infrastructure team
**Status**: Ready for Implementation
**Created**: December 4, 2025

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [PgBouncer Deployment](#pgbouncer-deployment)
3. [NGINX Load Balancer Deployment](#nginx-load-balancer-deployment)
4. [Backend Server Scaling](#backend-server-scaling)
5. [Health Check Verification](#health-check-verification)
6. [Verification and Testing](#verification-and-testing)
7. [Rollback Procedures](#rollback-procedures)
8. [Monitoring and Alerting](#monitoring-and-alerting)

---

## PRE-DEPLOYMENT CHECKLIST

### 1. Infrastructure Readiness
- [ ] All three new servers provisioned (PgBouncer, NGINX, Backend-2, Backend-3)
- [ ] Verify all servers have network access to each other
- [ ] Security groups configured to allow necessary ports:
  - `5432` (PostgreSQL) - Database
  - `6432` (PgBouncer) - Connection pooling
  - `80/443` (NGINX) - HTTP/HTTPS
  - `3000` (Backend) - Application servers
  - `6379` (Redis) - Caching

### 2. Code and Configuration Ready
- [ ] Phase 2 code merged to main branch:
  - Health check endpoints (`/backend/src/routes/health.routes.ts`)
  - Lock service (`/backend/src/services/lock.service.ts`)
  - Cron job updates with locks (recurring messages, phone recovery)
  - Redlock dependency added to package.json

- [ ] Backend built and tested:
  ```bash
  cd backend
  npm run build
  npm run test
  ```
  - All tests passing
  - No TypeScript errors
  - No import path issues

### 3. Backup and Rollback Ready
- [ ] Database backup created
  ```bash
  pg_dump postgresql://user:pass@db.render.com:5432/connect_yw_production > backup-2025-12-04.sql
  ```
  - Verify backup file size > 1MB
  - Store in secure location

- [ ] Current backend code tagged:
  ```bash
  git tag -a phase-1-final -m "Phase 1 stable before Phase 2 deployment"
  git push origin phase-1-final
  ```

- [ ] DNS rollback plan documented
  - Current: API domain points to Backend-1 direct
  - Phase 2: API domain will point to NGINX
  - Rollback: Change DNS back to Backend-1 IP

### 4. Stakeholder Communication
- [ ] Product/Engineering team notified of maintenance window
- [ ] User-facing status page set to "Maintenance in progress"
- [ ] On-call engineer assigned for monitoring
- [ ] Rollback authority identified and on standby

---

## PGBOUNCER DEPLOYMENT

### Step 1: Provision PgBouncer Server

**Estimated Time**: 10 minutes

```bash
# Option A: DigitalOcean
# - Create $4/month droplet (512MB, 1 Core)
# - Ubuntu 22.04 LTS
# - Choose region closest to primary database
# - Enable IPv6
# Record: PgBouncer IP = X.X.X.X

# Option B: Railway
# Add sidecar to backend service with provided config

# Option C: AWS EC2
# - t4g.micro instance (free tier eligible)
# - Ubuntu 22.04 LTS AMI
# Record: PgBouncer IP = X.X.X.X
```

### Step 2: Install PgBouncer

```bash
# SSH into PgBouncer server
ssh root@X.X.X.X

# Update system
apt-get update && apt-get upgrade -y

# Install PgBouncer
apt-get install pgbouncer -y

# Create configuration directory if needed
mkdir -p /etc/pgbouncer
```

### Step 3: Deploy Configuration

```bash
# Copy configuration file from project
scp /infrastructure/pgbouncer/pgbouncer.ini root@X.X.X.X:/etc/pgbouncer/pgbouncer.ini

# Set permissions
sudo chmod 644 /etc/pgbouncer/pgbouncer.ini

# Create userlist.txt with database credentials
cat > /etc/pgbouncer/userlist.txt << 'EOF'
"db_user" "md5_hash_of_password"
"pgbouncer" "md5_hash_of_admin_password"
EOF

# Set proper permissions
sudo chmod 600 /etc/pgbouncer/userlist.txt
sudo chown pgbouncer:pgbouncer /etc/pgbouncer/userlist.txt

# Generate MD5 passwords (use online tool or Python)
# Python: import hashlib; hashlib.md5(b"password").hexdigest()
```

### Step 4: Create Log Directory

```bash
# Create log directory
mkdir -p /var/log/pgbouncer
sudo chown pgbouncer:pgbouncer /var/log/pgbouncer
sudo chmod 755 /var/log/pgbouncer
```

### Step 5: Start PgBouncer

```bash
# Start service
sudo systemctl start pgbouncer

# Enable auto-start
sudo systemctl enable pgbouncer

# Verify status
sudo systemctl status pgbouncer

# Expected output:
# ● pgbouncer.service - PgBouncer - light-weight connection pooler for PostgreSQL
#   Active: active (running)
```

### Step 6: Verify Connectivity

```bash
# Test from PgBouncer server itself
psql -h localhost -p 6432 -U db_user -d connect_yw_production

# Run verification command
SELECT version();
\quit

# Test from Backend-1 server
psql -h pgbouncer-ip:6432 -U db_user -d connect_yw_production
SELECT version();
\quit
```

### Step 7: Monitor Connection Pool

```bash
# Connect to PgBouncer admin interface
psql -h localhost -p 6432 -U pgbouncer pgbouncer

# Run monitoring commands
SHOW STATS;     -- See connection reuse ratio
SHOW POOLS;     -- See current pools
SHOW CLIENTS;   -- See client connections
SHOW SERVERS;   -- See backend connections

# Expected results:
# - default_pool_size = 30
# - max_client_conn = 1000
# - Connection reuse ratio > 90%
```

### Step 8: Update Backend-1 DATABASE_URL

```bash
# SSH into Backend-1 server
ssh ubuntu@backend-1.render.com

# Update .env file or Render environment variables
# Old: postgresql://user:pass@dpg-xxx.postgres.render.com:5432/db
# New: postgresql://user:pass@pgbouncer-ip:6432/db

# If using Render dashboard:
# 1. Go to backend service settings
# 2. Environment → DATABASE_URL
# 3. Update to point to PgBouncer port 6432
# 4. Save and trigger deployment

# Verify connection works
npm run dev
# Should connect without "too many connections" error
```

### Step 9: Verify Health Check

```bash
# Test from local machine
curl http://pgbouncer-ip:6432/health

# Should fail (PgBouncer doesn't have /health endpoint)
# This is OK - we're just testing connectivity

# Better test - verify database can be accessed through PgBouncer
psql -h pgbouncer-ip -p 6432 -U db_user -d connect_yw_production -c "SELECT COUNT(*) FROM church;"
```

---

## NGINX LOAD BALANCER DEPLOYMENT

### Step 1: Provision NGINX Server

**Estimated Time**: 15 minutes

```bash
# Option A: DigitalOcean App Platform (Recommended)
# - Create app with Docker image: nginx:latest
# - 2GB RAM, shared CPU
# - $12/month
# - Enable HTTPS

# Option B: Railway
# - Create service with Nginx Docker image
# - Assign public domain

# Option C: AWS EC2
# - t4g.small instance
# - Ubuntu 22.04 LTS
# - Elastic IP (static IP)
# - Security group allowing 80, 443

# Record: NGINX IP = Y.Y.Y.Y
```

### Step 2: Install NGINX

```bash
# SSH into NGINX server
ssh root@Y.Y.Y.Y

# Update system
apt-get update && apt-get upgrade -y

# Install nginx with health check module
apt-get install nginx-full -y

# Verify installation
nginx -v
# Expected: nginx version: nginx/1.24.0
```

### Step 3: Deploy Configuration

```bash
# Copy NGINX configuration
scp /infrastructure/nginx/backend.conf root@Y.Y.Y.Y:/etc/nginx/conf.d/backend.conf

# Update backend server addresses in configuration
# Edit /etc/nginx/conf.d/backend.conf
# Replace:
#   server backend-1.internal:3000
#   server backend-2.internal:3000
#   server backend-3.internal:3000
# With actual IP addresses or hostnames

vi /etc/nginx/conf.d/backend.conf
```

### Step 4: Configure SSL Certificate

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot certonly --standalone -d api.koinoniasms.com

# Choose email and accept terms
# Certificate saved to: /etc/letsencrypt/live/api.koinoniasms.com/

# Set up auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

# Verify auto-renewal works
certbot renew --dry-run
```

### Step 5: Test NGINX Configuration

```bash
# Test syntax before starting
nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# If there are errors, check:
# - Backend server IP addresses are correct
# - SSL certificate paths are correct
# - All upstream servers are accessible
```

### Step 6: Start NGINX

```bash
# Start service
systemctl start nginx

# Enable auto-start
systemctl enable nginx

# Verify status
systemctl status nginx

# Expected: active (running)
```

### Step 7: Verify Upstream Health Checks

```bash
# Check NGINX status page
curl http://localhost:8080/nginx_status

# Should show:
# Active connections: N
# Server accepts handled requests
# Reading X Writing Y Waiting Z

# Verify backend servers are healthy
curl http://backend-1-ip:3000/health
curl http://backend-2-ip:3000/health
curl http://backend-3-ip:3000/health

# All should return 200 with {"status":"ok",...}
```

### Step 8: Test Load Balancer

```bash
# Test HTTP to HTTPS redirect
curl -I http://api.koinoniasms.com

# Expected: 301 redirect to https

# Test HTTPS connection
curl -I https://api.koinoniasms.com/health

# Expected: 200 OK with health endpoint response
```

---

## BACKEND SERVER SCALING

### Step 1: Provision Backend-2 and Backend-3

**Estimated Time**: 30 minutes total

```bash
# For each new backend server (Backend-2 and Backend-3):

# Option A: Render (Recommended for consistency)
# 1. Clone Backend-1 service
# 2. Name it: koinoniasms-api-2, koinoniasms-api-3
# 3. Point to same GitHub repo and branch
# 4. Use same environment variables
# 5. Update DATABASE_URL to point to PgBouncer
# 6. Deploy

# Option B: DigitalOcean App Platform
# Create new service with same Docker setup

# Option C: AWS EC2
# Launch t4g.medium instance with identical config
```

### Step 2: Verify Code is Identical

```bash
# On Backend-1
git log --oneline -1
# Record commit hash: abc123def456

# On Backend-2
git log --oneline -1
# Should be same: abc123def456

# On Backend-3
git log --oneline -1
# Should be same: abc123def456

# If different, pull latest:
git pull origin main
npm install
npm run build
npm start
```

### Step 3: Register with Load Balancer

```bash
# SSH into NGINX server
ssh root@Y.Y.Y.Y

# Edit NGINX config
vi /etc/nginx/conf.d/backend.conf

# Verify upstream block has all 3 servers:
upstream backend_servers {
  least_conn;
  server backend-1-ip:3000 weight=1;
  server backend-2-ip:3000 weight=1;
  server backend-3-ip:3000 weight=1;
}

# Test configuration
nginx -t

# Reload NGINX (no downtime)
nginx -s reload
```

### Step 4: Verify All Backends Are Healthy

```bash
# Check NGINX health status
curl http://localhost:8080/nginx_status

# Look for upstream section
# All 3 backends should show: check_http_status: 0 (healthy)

# Wait up to 30 seconds for health checks to pass
# (NGINX checks every 10 seconds, needs 3 consecutive passes)
```

### Step 5: Test Load Distribution

```bash
# Make multiple requests and verify distribution
for i in {1..30}; do
  curl -s https://api.koinoniasms.com/health \
    -w "Backend: %{remote_ip}\n" 2>/dev/null
done

# Count responses per backend
# Should see roughly 10 requests each (33.3% distribution)
```

---

## HEALTH CHECK VERIFICATION

### Step 1: Test All Health Endpoints

```bash
# Simple health check (fast)
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"2025-12-04T..."}

# Detailed health check (comprehensive)
curl http://localhost:3000/health/detailed
# Expected: {"status":"healthy","checks":{"database":"ok",...}}

# Readiness check
curl http://localhost:3000/health/ready
# Expected: {"ready":true,"timestamp":"2025-12-04T..."}

# Liveness check
curl http://localhost:3000/health/live
# Expected: {"alive":true,"uptime":1234.56,"timestamp":"2025-12-04T..."}
```

### Step 2: Test Through NGINX

```bash
# Test each endpoint through load balancer
curl https://api.koinoniasms.com/health
curl https://api.koinoniasms.com/health/detailed
curl https://api.koinoniasms.com/health/ready
curl https://api.koinoniasms.com/health/live

# All should return 200 OK
# Verify SSL certificate is valid
openssl s_client -connect api.koinoniasms.com:443
```

### Step 3: Test Graceful Failover

```bash
# Stop one backend server
ssh ubuntu@backend-1.render.com
systemctl stop koinoniasms-api  # Or equivalent restart command

# From NGINX, check status
curl http://localhost:8080/nginx_status

# Backend-1 should show as DOWN after ~50 seconds
# (5 failed checks × 10 second intervals)

# Make requests and verify they go to Backend-2 and Backend-3
for i in {1..30}; do
  curl -s https://api.koinoniasms.com/health
done

# Should all succeed (no errors)
# Verify none go to Backend-1

# Restart Backend-1
systemctl start koinoniasms-api

# Wait for health checks to pass (30 seconds)
# Verify Backend-1 comes back into rotation
```

---

## VERIFICATION AND TESTING

### Step 1: Smoke Test (Basic Functionality)

```bash
# Test user authentication
curl -X POST https://api.koinoniasms.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@church.com","password":"password"}'

# Should return token or error message (not 500)

# Test message creation
curl -X POST https://api.koinoniasms.com/api/messages \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"content":"test","targetType":"group","targetIds":["group-id"]}'

# Should create message successfully
```

### Step 2: Load Test

```bash
# Run smoke test (baseline)
cd backend
npm run loadtest:smoke

# Run load test (target: 1,500 req/sec)
npm run loadtest:load

# Run spike test (sudden traffic)
npm run loadtest:spike

# Verify results:
# - No 5xx errors
# - p95 latency < 500ms
# - Throughput 1,500+ req/sec
```

### Step 3: Verify Distributed Locking

```bash
# Check active locks
curl https://api.koinoniasms.com/admin/locks

# Should return empty array (no jobs currently running)

# Monitor logs during cron execution (5-minute intervals)
# Server-1: "✅ Acquired lock for job: recurring-messages"
# Server-2: "⏭️  Job lock held by another server: recurring-messages"

# Verify only one server processes each job
```

### Step 4: Monitor Metrics

```bash
# Check PgBouncer connection reuse
psql -h pgbouncer-ip -p 6432 -U pgbouncer pgbouncer
SHOW STATS;

# Expected:
# - total_query_count increasing
# - avg_query_time < 50ms
# - Connection reuse ratio > 90%

# Check NGINX load distribution
tail -f /var/log/nginx/backend_access.log | grep "GET /health"

# Should see requests distributed across 3 backends
```

---

## ROLLBACK PROCEDURES

### Quick Rollback (DNS-Based)

**If NGINX has critical issues**: Switch traffic back to Backend-1 direct

```bash
# Current DNS records:
# api.koinoniasms.com → NGINX-IP (Y.Y.Y.Y)

# Rollback command:
# Change DNS to point directly to Backend-1
# api.koinoniasms.com → Backend-1-IP (X.X.X.X)

# Update in Render Dashboard:
# 1. Go to DNS settings
# 2. Change A record for api.koinoniasms.com
# 3. Point to Backend-1 IP instead of NGINX
# 4. Save (DNS propagation: 5-10 minutes)

# Verify rollback
nslookup api.koinoniasms.com
# Should resolve to Backend-1 IP

# All traffic now goes directly to Backend-1 (bypass NGINX)
```

### Database Rollback

**If database schema or data is corrupted**:

```bash
# Restore from backup
psql postgresql://user:pass@db.render.com:5432/connect_yw_production < backup-2025-12-04.sql

# Verify data is restored
psql postgresql://user:pass@db.render.com:5432/connect_yw_production
SELECT COUNT(*) FROM church;
# Should match pre-backup count

# Restart all backend servers
# (They will be disconnected and force-reconnect)
```

### Code Rollback

**If new code has bugs**:

```bash
# Revert to previous version
git checkout phase-1-final
git pull origin main
npm install
npm run build

# Redeploy Backend-1, Backend-2, Backend-3
# In Render Dashboard:
# 1. Select service
# 2. Manual Deploy
# 3. Select previous commit
# 4. Deploy
```

### Disable PgBouncer

**If PgBouncer is causing issues**:

```bash
# Update DATABASE_URL on all backends to point directly to PostgreSQL
# Old: postgresql://user:pass@pgbouncer-ip:6432/db
# New: postgresql://user:pass@db.render.com:5432/db

# Restart all backend servers
# (They will reconnect to database directly)

# Stop PgBouncer
ssh root@pgbouncer-ip
systemctl stop pgbouncer
systemctl disable pgbouncer
```

---

## MONITORING AND ALERTING

### Step 1: Set Up Basic Monitoring

```bash
# Monitor PgBouncer connection pool
watch -n 5 'psql -h pgbouncer-ip -p 6432 -U pgbouncer pgbouncer -c "SHOW STATS;"'

# Monitor NGINX load balancer
watch -n 5 'curl -s http://localhost:8080/nginx_status'

# Monitor backend logs
tail -f /var/log/koinoniasms-api/out.log

# Monitor health checks
watch -n 10 'for i in 1 2 3; do echo "Backend-$i:"; curl -s http://backend-$i:3000/health | jq; done'
```

### Step 2: Create CloudWatch/DataDog Alerts

Create alerts for:
- [ ] PgBouncer connection pool at 80% capacity
- [ ] NGINX upstream health check failures (1+ servers down)
- [ ] Backend server 5xx error rate > 5%
- [ ] Database latency > 100ms
- [ ] Distributed lock contention (same job runs on multiple servers)

### Step 3: Document Runbook Contacts

Update on-call rotation:
- [ ] Database DBA: _________
- [ ] Infrastructure engineer: _________
- [ ] Backend engineer: _________
- [ ] Incident commander: _________

---

## 🎯 DEPLOYMENT COMPLETE CHECKLIST

Phase 2 deployment is **complete** when:

- [ ] PgBouncer deployed and pooling 30 connections to 300+
- [ ] NGINX load balancer running and distributing traffic
- [ ] All 3 backend servers healthy and in rotation
- [ ] Health checks passing on all servers
- [ ] Load testing shows 1.5-3x throughput improvement
- [ ] Distributed locks prevent duplicate job execution
- [ ] 99.9% uptime maintained during testing period
- [ ] Monitoring and alerting configured
- [ ] Team trained on new infrastructure
- [ ] Runbooks and documentation up to date

**Deployment Date**: __________
**Deployed By**: __________
**Verified By**: __________

---

## 📞 SUPPORT

For issues during deployment:
1. Check logs: `tail -f /var/log/*/error.log`
2. Verify connectivity: `psql`, `redis-cli`, `curl`
3. Review health endpoints: `/health`, `/health/detailed`
4. Execute rollback if needed (see Rollback section)
5. Contact on-call engineer

**Emergency Rollback**: Change DNS back to Backend-1 IP (5-minute traffic recovery)
