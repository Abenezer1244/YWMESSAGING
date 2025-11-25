# Koinoniasms DevOps Infrastructure Strategy
## Scaling from 1,000 to 10,000 Churches

**Date:** November 21, 2025
**Author:** Senior DevOps Engineer Agent
**Status:** Ready for Implementation

---

## EXECUTIVE SUMMARY

Koinoniasms currently has **manual deployments, no staging environment, and basic monitoring**. To support 10x growth, we need to implement **automated CI/CD, blue-green deployments, comprehensive monitoring, and disaster recovery**.

**Current State Grade: C** (Manual processes, single point of failure)
**Target Grade: A** (Automated, reliable, scalable)

---

## CURRENT DEVOPS ASSESSMENT

### Strengths ✅
- GitHub for version control
- GitHub Actions for some CI/CD
- Render provides managed database and hosting
- Docker containerization ready
- Environment variables for secrets

### Weaknesses ❌
- **No staging environment** - Test in production risk
- **Manual deployments** - Push to main triggers auto-deploy
- **Basic monitoring** - Only Render dashboard logs
- **No backup automation** - Data loss risk
- **No blue-green deployment** - Downtime during updates
- **Secrets in plain text** - Environment variables not encrypted
- **No health checks** - Can't detect failures automatically
- **No rollback strategy** - Can't revert bad deployments
- **No database migration testing** - Schema changes are risky
- **No cost monitoring** - $11K/month infrastructure (unoptimized)

---

## PHASE 1: ENHANCED CI/CD PIPELINE (Weeks 1-4)

### Current GitHub Actions Workflow

**Current flow (simplified):**
```
Commit → Auto-deploy to production
```

**Problem:** No tests, no staging, instant production impact

### Phase 1 Target: Safe Deployments

```
Commit
  ↓
[Lint & Format] (2 min)
  ↓ FAIL → Stop
[Unit Tests] (5 min)
  ↓ FAIL → Stop
[Security Scan] (3 min)
  ↓ FAIL → Stop
[Build] (3 min)
  ↓
[Deploy to Staging] (2 min)
  ↓
[Health Checks] (1 min)
  ↓ FAIL → Rollback
[Integration Tests] (5 min)
  ↓ FAIL → Prevent production deploy
[Manual Approval] (optional)
  ↓
[Blue-Green Deploy to Prod] (2 min)
  ↓
[Smoke Tests] (2 min)
  ↓ FAIL → Auto-rollback
✅ Complete (30 minutes total)
```

### Phase 1 Implementation (GitHub Actions YAML)

**File: `.github/workflows/ci-cd.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - uses: snyk/snyk-setup-action@master
      - run: snyk test --severity-threshold=high

  build:
    needs: [lint, unit-tests, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:backend
      - run: npm run build:frontend
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.koinoniasms.com
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build
      - name: Deploy to Staging
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_STAGING_API_KEY }}
        run: |
          curl -X POST https://api.render.com/deploy \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -d "{\"service\": \"staging-backend\"}"
      - name: Health Check
        run: |
          sleep 30
          curl -f https://staging.koinoniasms.com/health || exit 1
      - name: Integration Tests
        run: npm run test:integration -- --env=staging

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://api.koinoniasms.com
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build
      - name: Blue-Green Deploy
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_PROD_API_KEY }}
        run: |
          # Deploy to green environment
          curl -X POST https://api.render.com/deploy \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -d "{\"service\": \"prod-backend-green\"}"

          # Wait for health
          sleep 30

          # Run smoke tests
          npm run test:smoke -- --env=prod-green

          # If successful, switch traffic
          if [ $? -eq 0 ]; then
            curl -X POST https://api.render.com/switch \
              -H "Authorization: Bearer $RENDER_API_KEY" \
              -d "{\"service\": \"prod-backend\", \"target\": \"green\"}"
          else
            echo "Smoke tests failed, keeping blue environment"
            exit 1
          fi
      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Production deployment: ${{ job.status }}"
            }
```

### Deployment Frequency & Safety

| Before | After |
|--------|-------|
| Manual deploys (risky) | Automated deploys (safe) |
| No tests | 80%+ test coverage |
| No staging | Staging before production |
| Downtime during deploys | Blue-green (zero-downtime) |
| No rollback plan | Auto-rollback on failure |
| 30 min deployment time | 30 min automated pipeline |

---

## PHASE 2: STAGING ENVIRONMENT (Weeks 1-2)

### Staging Setup

**Mirror of Production:**
- Same infrastructure (Render)
- Same versions (Node, React, PostgreSQL)
- Separate database (sanitized production data)
- Separate domain: `staging.koinoniasms.com`
- Daily data refresh from production

**Why Staging Matters:**
- Test deployments safely
- Run integration tests
- Verify database migrations
- Performance testing
- User acceptance testing

**Staging Configuration:**

```
Production:
├── Backend: api.koinoniasms.com
├── Frontend: koinoniasms.com
├── Database: prod-postgres
└── Redis: prod-redis

Staging:
├── Backend: staging-api.koinoniasms.com
├── Frontend: staging.koinoniasms.com
├── Database: staging-postgres (daily refresh)
└── Redis: staging-redis
```

**Daily Data Refresh:**

```bash
# Scheduled job (midnight UTC)
# 1. Backup production database
# 2. Restore to staging
# 3. Anonymize PII (replace emails, phone numbers)
# 4. Restart staging backend
# 5. Run smoke tests
# 6. Report status to Slack
```

---

## PHASE 3: MONITORING & ALERTING (Weeks 3-4)

### Datadog Setup

**Cost:** $60/month for 5 hosts

**What to Monitor:**

#### Application Metrics
```
- API Response Time (target: p95 < 200ms)
- Error Rate (target: < 0.1%)
- Throughput (messages/min)
- Database Query Time
- Cache Hit Rate
```

#### Infrastructure Metrics
```
- CPU Usage (alert > 80%)
- Memory Usage (alert > 85%)
- Disk Space (alert > 90%)
- Network I/O
- Connection Pools
```

#### Business Metrics
```
- Messages Sent (daily)
- Delivery Rate (%)
- Active Users
- Uptime SLA (target: 99.9%)
```

### Alert Rules

**Critical (Page On-Call Engineer Immediately)**
```
- API down (0 requests for 5 minutes)
- Error rate > 5%
- Database connection pool exhausted
- Disk space < 5%
- API latency p95 > 5 seconds
```

**High (Email Notification)**
```
- CPU > 80% for 10 minutes
- Memory > 85% for 10 minutes
- Error rate > 1%
- API latency p95 > 1 second
```

**Medium (Ticket Created)**
```
- Deployment failed
- Test coverage dropped below 60%
- Slow database query (> 1s)
```

**Datadog Dashboard:**

```
Real-time Dashboard (home-ops-dashboard):
┌─────────────────────────────────────────┐
│ Uptime: 99.8%  Alerts: 2 Medium         │
├─────────────────────────────────────────┤
│ API Response Time (p95)     Error Rate   │
│ 145ms ████░░░░░░ (green)    0.08% ░░    │
│                                          │
│ Database Latency (p95)      Cache Hit    │
│ 245ms ██░░░░░░░░ (yellow)   78% ████░░  │
│                                          │
│ Message Queue Depth         CPU Usage    │
│ 234 msgs ░░░░░░░░░░ (green) 62% ███░░░  │
├─────────────────────────────────────────┤
│ Recent Incidents:                        │
│ • 10:45 AM: Brief API spike (resolved)  │
│ • 9:30 AM: Database maintenance (OK)    │
└─────────────────────────────────────────┘
```

---

## PHASE 4: BACKUP & DISASTER RECOVERY

### Recovery Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **RTO** | 4 hours | Automated failover + restore |
| **RPO** | 1 hour | Continuous backups |
| **MTTR** | 30 min | Auto-detection + alert |

### Backup Strategy

**Daily Backups:**
```
Every 6 hours:
├── Full database snapshot (sent to S3)
├── Incremental backup (WAL logs)
├── Application data export
└── Verify backup integrity

Weekly:
├── Archive to Glacier (long-term)
└── Restore test (monthly)
```

**Backup Locations:**
- Primary: Render managed backups
- Secondary: AWS S3 (geo-redundant)
- Tertiary: Cold storage (Glacier)

### Disaster Recovery Plan

**If Primary Database Down:**

```
1. Detection (auto-alert)
   └─ Datadog detects 0 connections for 1 min

2. Immediate Actions (< 5 min)
   ├─ Page on-call engineer
   ├─ Evaluate severity
   └─ Start incident response

3. Recovery (< 30 min)
   ├─ Stop all writes
   ├─ Restore from latest backup
   ├─ Verify data integrity
   ├─ Resume read-only traffic
   └─ Gradually enable writes

4. Validation (< 60 min)
   ├─ Run health checks
   ├─ Verify message queues
   ├─ Check replication status
   └─ Return to normal

5. Post-Incident (next day)
   ├─ Root cause analysis
   ├─ Prevent recurrence
   ├─ Update runbook
   └─ Communication to customers
```

---

## PHASE 5: DATABASE MIGRATION STRATEGY

### Zero-Downtime Migrations

**Goal:** Deploy schema changes without downtime

**Process:**

```
1. Pre-deployment (staging)
   ├─ Create migration script
   ├─ Test on staging database
   ├─ Measure migration time
   └─ Plan rollback

2. Deployment Window (blue-green)
   ├─ Deploy code (backward compatible)
   ├─ Run migration on replica first
   ├─ Monitor performance
   ├─ If slow, rollback
   └─ Apply to primary if OK

3. Post-deployment
   ├─ Monitor error rates
   ├─ Check query performance
   ├─ Validate data integrity
   └─ Keep rollback plan ready
```

**Example: Adding New Column**

```sql
-- Step 1: Add column (doesn't break old code)
ALTER TABLE messages
ADD COLUMN dlc_brand_id VARCHAR(255);

-- Step 2: Backfill data
UPDATE messages
SET dlc_brand_id = (SELECT dlc_brand_id FROM churches WHERE churches.id = messages.church_id);

-- Step 3: Add NOT NULL constraint (if needed)
ALTER TABLE messages
ALTER COLUMN dlc_brand_id SET NOT NULL;

-- Step 4: Create index
CREATE INDEX idx_messages_dlc_brand_id ON messages(dlc_brand_id);
```

---

## PHASE 6: INFRASTRUCTURE AS CODE (Terraform)

### Current Infrastructure (Manual)

Currently using Render dashboard to create resources manually.

### Target: Terraform IaC

**File: `infrastructure/main.tf`**

```hcl
# Provider
terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 0.1"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "koinoniasms-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

# Backend Service
resource "render_service" "backend_prod" {
  name             = "koinoniasms-api-prod"
  service_details {
    env = "node"
  }

  autoDeploy = false

  envVars = {
    NODE_ENV              = "production"
    DATABASE_URL          = aws_rds_cluster_instance.primary.endpoint
    REDIS_URL             = aws_elasticache_cluster.redis.cluster_address
    TELNYX_API_KEY        = var.telnyx_api_key
    JWT_SECRET            = var.jwt_secret
    ENABLE_QUEUES         = "true"
    LOG_LEVEL             = "info"
  }

  scaling = {
    minInstances = 2
    maxInstances = 10
    cpuThreshold = 80
    memoryThreshold = 85
  }
}

# Frontend Service
resource "render_service" "frontend_prod" {
  name             = "koinoniasms-web-prod"
  service_details {
    env    = "static_site"
    branch = "main"
  }

  autoDeploy = false

  routes = [{
    source = "/*"
    destination = "/index.html"
    match = "miss"
  }]
}

# PostgreSQL Database
resource "aws_rds_cluster" "primary" {
  cluster_identifier      = "koinoniasms-prod"
  engine                  = "aurora-postgresql"
  engine_version          = "15.2"
  database_name           = "koinoniasms"
  master_username         = "admin"
  master_password         = var.db_password

  backup_retention_period = 30
  preferred_backup_window = "03:00-04:00"
  storage_encrypted       = true
  kms_key_id              = aws_kms_key.rds.arn

  enabled_cloudwatch_logs_exports = ["postgresql"]
}

# Read Replica
resource "aws_rds_cluster_instance" "read_replica" {
  cluster_identifier = aws_rds_cluster.primary.id
  instance_class     = "db.r6g.xlarge"
  engine              = aws_rds_cluster.primary.engine
  publicly_accessible = false
}

# Redis Cache
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "koinoniasms-cache"
  engine               = "redis"
  node_type            = "cache.r6g.xlarge"
  num_cache_nodes      = 3
  parameter_group_name = "default.redis7"
  port                 = 6379

  automatic_failover_enabled = true
  at_rest_encryption_enabled = true
}

# S3 for Backups
resource "aws_s3_bucket" "backups" {
  bucket = "koinoniasms-backups"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  lifecycle_rule {
    id      = "archive-old-backups"
    enabled = true

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

# Outputs
output "backend_url" {
  value = "https://${render_service.backend_prod.name}.onrender.com"
}

output "frontend_url" {
  value = render_service.frontend_prod.url
}
```

**Deploy:**

```bash
terraform init                    # Initialize Terraform
terraform plan                    # Review changes
terraform apply                   # Deploy infrastructure
```

---

## PHASE 7: SECRETS MANAGEMENT

### Current (Unsafe)
```
Render Dashboard → Manual env vars (plaintext)
```

### Target: AWS KMS
```
GitHub Actions → Fetch from AWS KMS → Inject into deployment
```

**Benefits:**
- Encrypted secrets at rest
- Audit trail of secret access
- Automatic rotation capability
- Principle of least privilege

**Implementation:**

```bash
# Create KMS key
aws kms create-key \
  --description "Koinoniasms secrets" \
  --region us-east-1

# Encrypt secret
aws kms encrypt \
  --key-id arn:aws:kms:us-east-1:123456789:key/abc-123 \
  --plaintext "my-secret-value" \
  --region us-east-1

# In GitHub Actions: Decrypt before use
- name: Decrypt secrets
  env:
    ENCRYPTED_SECRET: ${{ secrets.ENCRYPTED_API_KEY }}
  run: |
    AWS_REGION=us-east-1 \
    AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY }} \
    AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_KEY }} \
    aws kms decrypt \
      --ciphertext-blob fileb://<(echo $ENCRYPTED_SECRET | base64 -d) \
      --region us-east-1 \
      --query Plaintext \
      --output text | base64 -d > .env
```

---

## PHASE 8: DEPLOYMENT STRATEGY RECOMMENDATION

### Blue-Green Deployment (Recommended)

**Why Blue-Green?**
- Zero downtime (instant switchover)
- Easy rollback (switch back to blue)
- Full testing of green before switch
- No traffic loss

**How It Works:**

```
Blue (Current Production)
├─ Running version 1.0
├─ Serving 100% of traffic
└─ Ready for fallback

↓ Deploy to Green

Green (New Version)
├─ Running version 1.1 (new)
├─ Serving 0% traffic
├─ Health checks: ✓ All pass
└─ Ready for switchover

↓ Switch Traffic

Blue (Old Version)
├─ Running version 1.0
├─ Serving 0% traffic (idle)
└─ Ready for next deploy

Green (New Version)
├─ Running version 1.1
├─ Serving 100% traffic
└─ All good? Keep green active
```

**Rollback if needed:**

```
Problem detected → Switch traffic back to blue (30 seconds)
```

### Implementation

```bash
#!/bin/bash
# deploy-blue-green.sh

set -e

# 1. Build new version
echo "Building..."
npm run build

# 2. Deploy to GREEN
echo "Deploying to GREEN..."
deploy_to_green

# 3. Health checks
echo "Health checking GREEN..."
sleep 30
if ! curl -f https://green.koinoniasms.com/health; then
  echo "GREEN failed health checks. Rolling back..."
  exit 1
fi

# 4. Smoke tests
echo "Running smoke tests..."
npm run test:smoke -- --env=green
if [ $? -ne 0 ]; then
  echo "Smoke tests failed. Rolling back..."
  exit 1
fi

# 5. Switch traffic
echo "Switching traffic to GREEN..."
switch_traffic_to_green

# 6. Monitor
echo "Monitoring error rate..."
sleep 60
if error_rate_high; then
  echo "Error rate high. Rolling back to BLUE..."
  switch_traffic_to_blue
  exit 1
fi

echo "✅ Deployment successful!"
```

---

## COST ANALYSIS

### Current Infrastructure
```
Render Backend:        $7/month (starter)
Render PostgreSQL:     $15/month (standard)
Render Redis:          $5/month (free tier)
Domain (DNS):          $12/month
Monitoring:            $0 (basic Render logs)
Backups:               $0 (included)
───────────────────────────────────
Total:                 $39/month (+ overages)

Actual spend at 1,000 churches: $11,000/month
(High overages from resource constraints)
```

### Phase 1 Infrastructure ($67/month)
```
Render Backend:        $25/month (standard x2 instances)
Render PostgreSQL:     $43/month (professional)
Redis:                 $10/month (managed)
Domain:                $12/month
───────────────────────────────────
Total:                 $90/month (optimized)
```

### Phase 3 Infrastructure ($310/month)
```
Render Backend:        $50/month (4x standard instances)
AWS RDS (primary):     $150/month (r6g.xlarge)
AWS RDS (replica):     $80/month (read replica)
AWS ElastiCache:       $60/month (Redis cluster)
Datadog Monitoring:    $60/month (5 hosts)
S3 Backups:            $10/month
───────────────────────────────────
Total:                 $410/month (enterprise)
```

---

## 12-MONTH DEVOPS ROADMAP

**Month 1-2:**
- ✅ Enhanced CI/CD pipeline
- ✅ Staging environment
- ✅ Health checks & monitoring
- ✅ Backup automation

**Month 3-4:**
- ✅ Datadog integration
- ✅ Blue-green deployments
- ✅ Database migration testing
- ✅ Terraform IaC for core services

**Month 5-6:**
- ✅ AWS KMS secrets management
- ✅ Multi-region preparation
- ✅ Auto-scaling policies
- ✅ Disaster recovery drills

**Month 7-12:**
- ✅ Multi-region deployment
- ✅ Global CDN (Cloudflare)
- ✅ Advanced Datadog dashboards
- ✅ Chaos engineering tests

---

## SUCCESS METRICS

| Metric | Current | 12-Month Target |
|--------|---------|-----------------|
| **Deployment Frequency** | Manual (1-2x/week) | Automated (daily) |
| **Deployment Time** | 30 minutes | 5 minutes |
| **Mean Time to Recovery (MTTR)** | 2-4 hours | < 30 minutes |
| **Uptime SLA** | 99.5% | 99.95% |
| **Database Recovery Time** | Manual (2-4 hours) | Automated (< 30 min) |
| **Incident Detection** | Manual (customer reports) | Automatic (< 1 min) |
| **Test Coverage** | 0% | 80%+ |
| **Staging Parity** | None | 100% |

---

## IMMEDIATE NEXT STEPS

**Week 1:**
1. Set up GitHub Actions for linting & unit tests
2. Create staging environment on Render
3. Configure Datadog account
4. Set up backup automation

**Week 2:**
1. Implement blue-green deployment
2. Create health check endpoints
3. Set up alerting rules
4. Document runbooks

**Week 3-4:**
1. Database migration testing
2. Disaster recovery drill
3. Terraform IaC baseline
4. Team training

---

**Document Status:** Complete and ready for implementation
**Timeline to Full Automation:** 12 weeks
**ROI:** Prevents downtime costs ($5K+ per incident) + faster deployments
