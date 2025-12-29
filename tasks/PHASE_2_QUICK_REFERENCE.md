# Phase 2 Quick Reference Guide

**Print This** - Keep at your desk during Phase 2 rollout

---

## Emergency Contact & Escalation

| Role | Name | Phone | Slack |
|------|------|-------|-------|
| On-Call Engineer | ____________ | ____________ | ____________ |
| On-Call DBA | ____________ | ____________ | ____________ |
| Engineering Lead | ____________ | ____________ | ____________ |
| VP Engineering | ____________ | ____________ | ____________ |

---

## Week 1-2: Logging & Monitoring

### ✅ Before Deployment
```bash
# Baseline metrics
curl -s https://api.koinoniasms.com/metrics/queries | jq '.statistics.p95'
# Record: ___ms
```

### 🚀 Deploy Week 1-2 Utilities
- [ ] Winston logger
- [ ] Query monitoring
- [ ] APM integration

### ✅ After Deployment
```bash
# Verify logging working
tail -5 /var/log/application.log | jq
# Expected: Valid JSON with correlationId fields

# Check metrics endpoint
curl -s https://api.koinoniasms.com/metrics/queries | jq '.health'
# Expected: "healthy" or "degraded"
```

### 🔴 Emergency Disable
```bash
# Comment out logger initialization in app.ts
# Redeploy
npm run build && pm2 restart app
```

---

## Week 3-4: Read Replicas

### ✅ Before Deployment
```bash
# Replica infrastructure ready?
ping -c 1 replica-1.internal && echo "✅ Replica 1 up"
ping -c 1 replica-2.internal && echo "✅ Replica 2 up"
```

### 🚀 Deploy Week 3-4
- [ ] Configure replicas in .env
- [ ] Restart application

### ✅ After Deployment
```bash
# Check replication status
psql -U postgres -h primary -d koinoniasms -c "
  SELECT slot_name, active FROM pg_replication_slots;"
# Expected: 2 rows, both active=true

# Verify lag < 1 second
psql -U postgres -h primary -d koinoniasms -c "
  SELECT replay_lag FROM pg_stat_replication;"
# Expected: < 1000ms
```

### 🔴 Emergency Failover
```bash
# If primary down, promote replica-1
ssh replica-1.internal
sudo su - postgres
pg_ctl promote -D /var/lib/postgresql/12/main/
# Wait 30 seconds for promotion
# Restart app servers
```

---

## Week 5-6: PgBouncer Connection Pooling

### ✅ Before Deployment
```bash
# PgBouncer running?
systemctl status pgbouncer
# Expected: active (running)
```

### 🚀 Deploy Week 5-6
- [ ] Update connection string to pgbouncer endpoint
- [ ] Restart application

### ✅ After Deployment
```bash
# Check pool status
psql -U pgbouncer -d pgbouncer -c "SHOW pools;"
# Expected: cl_waiting = 0, sv_active = 40-50

# Verify connection count dropped
psql -U postgres -h primary -d koinoniasms -c "
  SELECT count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"
# Expected: Much lower than before (50 instead of 200+)
```

### 🔴 Emergency Bypass PgBouncer
```bash
# Set DATABASE_URL to direct primary connection
DATABASE_URL=postgresql://primary:5432/koinoniasms
# Restart app
pm2 restart app
```

---

## Week 7: Redis Caching & Rate Limiting

### ✅ Before Deployment
```bash
# Redis running?
redis-cli PING
# Expected: PONG

# Check memory
redis-cli INFO memory | grep used_memory_human
# Record: ___MB
```

### 🚀 Deploy Week 7
- [ ] Enable cache warming
- [ ] Enable advanced rate limiting

### ✅ After Deployment
```bash
# Check cache keys created
redis-cli --scan --pattern "*" | wc -l
# Expected: > 100 keys

# Calculate hit rate
redis-cli INFO stats | grep keyspace
# Calculate: hits / (hits + misses) * 100
# Expected: > 70%

# Test rate limiting
for i in {1..15}; do
  curl -s -w "%{http_code}" https://api.koinoniasms.com/api/test
done
# Expected: 10x 200, then 429s
```

### 🔴 Emergency Disable Cache
```bash
redis-cli FLUSHDB
# OR disable caching in .env
CACHE_ENABLED=false
pm2 restart app
```

---

## Week 8: Table Partitioning (CRITICAL)

⚠️ **MAINTENANCE WINDOW: Saturday 2-6 AM**

### 📋 Pre-Maintenance Checklist
- [ ] Backup created and tested (4-6 GB)
- [ ] Staging environment partitioned and tested
- [ ] DBA on-call and ready
- [ ] Engineering lead briefed
- [ ] Customers notified (if needed)

### ✅ Immediate Post-Maintenance (30 min)
```bash
# Application up?
curl -s -w "%{http_code}" https://api.koinoniasms.com/health
# Expected: 200

# Check partitions created
psql -U postgres -h primary -d koinoniasms -c "
  SELECT count(DISTINCT tablename) FROM pg_tables
  WHERE tablename LIKE 'conversation_message_%';"
# Expected: 24+ partitions

# Query performance improved?
time psql -U postgres -h primary -d koinoniasms -c "
  SELECT * FROM conversation_message WHERE conversation_id = 'x' LIMIT 50;"
# Expected: ~200ms (3-4x faster)
```

### 🔴 Emergency Rollback (within 24 hours ONLY)
```bash
BEGIN;
ALTER TABLE conversation_message RENAME TO conversation_message_new;
ALTER TABLE conversation_message_old RENAME TO conversation_message;
COMMIT;
# Downtime: < 1 second
```

---

## Critical Commands Reference

### Check Application Health
```bash
curl -s https://api.koinoniasms.com/health | jq
# Or detailed:
curl -s https://api.koinoniasms.com/health/detailed | jq
```

### Monitor Database
```bash
# Connection count
psql -U postgres -h primary -d koinoniasms -c "
  SELECT count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"

# Query performance
curl -s https://api.koinoniasms.com/metrics/queries | jq '.statistics'

# Replica lag
psql -U postgres -h primary -d koinoniasms -c "
  SELECT max(replay_lag) FROM pg_stat_replication;"

# PgBouncer pool status
psql -U pgbouncer -d pgbouncer -c "SHOW pools;"

# Cache hit rate
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"
```

### Check Logs
```bash
# Application logs (last 50 lines)
tail -50 /var/log/application.log

# Errors only
tail -100 /var/log/application.log | grep ERROR

# Database logs
sudo tail -50 /var/log/postgresql/postgresql.log
```

### Restart Services
```bash
# Application
pm2 restart app

# PostgreSQL
sudo systemctl restart postgresql

# PgBouncer
sudo systemctl restart pgbouncer

# Redis
sudo systemctl restart redis-server
```

---

## Decision Tree: Something's Wrong?

```
Application not responding?
├─→ Check: curl -s https://api.koinoniasms.com/health
├─→ Status: 200 OK?
│   ├─→ Yes: Check error logs (tail /var/log/application.log)
│   └─→ No: Go to "Database Down" below
└─→ Recovery: Restart app (pm2 restart app)

Database is down?
├─→ Check: psql -h primary -U postgres -c "SELECT 1;"
├─→ Works?
│   ├─→ No: Restart PostgreSQL (sudo systemctl restart postgresql)
│   └─→ Yes: Check replication health
└─→ Still down: Failover to replica-1 (see Week 3-4 above)

Slow queries?
├─→ Check: curl -s https://api.koinoniasms.com/metrics/queries | jq
├─→ p95 > 500ms?
│   ├─→ Check cache hit rate (redis-cli INFO stats)
│   ├─→ Check replication lag (SELECT max(replay_lag) FROM pg_stat_replication;)
│   └─→ Check slow query log (SHOW SLOW QUERIES)
└─→ Recovery: Create index on slow query column (RB-9)

Connection pool exhausted?
├─→ Check: psql -U pgbouncer -d pgbouncer -c "SHOW pools;" | grep cl_waiting
├─→ cl_waiting > 0?
│   ├─→ Increase pool size (RB-6) or kill long queries
│   └─→ If critical: Restart PgBouncer (sudo systemctl restart pgbouncer)
└─→ Recovery: Monitor pool, adjust pool_size in pgbouncer.ini

Rate limit blocking legitimate traffic?
├─→ Check: Verify client's API key and tier
├─→ Upgrade tier: UPDATE api_keys SET tier='professional' WHERE key='x';
└─→ Recovery: Increase burst allowance or whitelist IP

Cache not warming?
├─→ Check: redis-cli --scan --pattern "*" | wc -l
├─→ < 100 keys?
│   ├─→ Verify Redis is accessible from app
│   ├─→ Check CACHE_WARMING_ENABLED=true in .env
│   └─→ Manually warm: curl https://api.koinoniasms.com/health/detailed
└─→ Recovery: Manually rebuild cache or flush and restart

Still broken?
├─→ Page on-call engineer (see Emergency Contact above)
├─→ Gather logs: tail -200 /var/log/application.log > /tmp/debug.log
└─→ Prepare: git status, current .env settings
```

---

## Phase 2 Rollout Status

| Week | Feature | Status | Owner |
|------|---------|--------|-------|
| 1-2 | Logging & APM | ☐ Deploy | _______ |
| 3-4 | Read Replicas | ☐ Deploy | _______ |
| 5-6 | PgBouncer | ☐ Deploy | _______ |
| 7 | Caching & Rate Limiting | ☐ Deploy | _______ |
| 8 | Table Partitioning | ☐ Deploy | _______ |

### Deployment Notes
```
Week 1-2: __________________________________________________
Week 3-4: __________________________________________________
Week 5-6: __________________________________________________
Week 7:   __________________________________________________
Week 8:   __________________________________________________
```

---

## Performance Targets

| Metric | Current | Target | Achieved |
|--------|---------|--------|----------|
| Query latency (p95) | ___ms | -20-50% | ☐ |
| Cache hit rate | __% | 70-90% | ☐ |
| Connection pool | __ conns | <50 | ☐ |
| Replication lag | ___ms | <1000ms | ☐ |
| Rate limit accuracy | - | ±1% | ☐ |
| Error rate | __% | <0.1% | ☐ |

---

## Documentation References

| Document | Use For |
|----------|---------|
| PHASE_2_DEPLOYMENT_PLAN.md | 8-week rollout strategy |
| PHASE_2_OPERATIONAL_RUNBOOKS.md | Step-by-step procedures (RB-1 through RB-23) |
| PHASE_2_VALIDATION_CHECKLIST.md | Post-deployment validation |
| This file | Quick reference during deployment |

---

## Useful URLs

| Service | URL |
|---------|-----|
| Health Check | https://api.koinoniasms.com/health |
| Detailed Health | https://api.koinoniasms.com/health/detailed |
| Query Metrics | https://api.koinoniasms.com/metrics/queries |
| Admin Dashboard | https://dashboard.koinoniasms.com/admin |
| Datadog APM | https://app.datadoghq.com/apm/services |
| PgBouncer Stats | `psql -U pgbouncer -d pgbouncer` |
| Redis CLI | `redis-cli` |

---

## Slack Channels

- **#incident-response** - For critical incidents
- **#phase-2-rollout** - Phase 2 specific
- **#database** - Database team
- **#devops** - DevOps team
- **#backend** - Backend team

---

## Pre-Rollout Checklist (Print & Sign)

- [ ] All team members trained
- [ ] Runbooks printed and reviewed
- [ ] Backups verified
- [ ] Staging environment tested
- [ ] Dashboards configured
- [ ] On-call rotation assigned
- [ ] Customers notified (if needed)
- [ ] Rollback procedures tested
- [ ] Communication plan ready

**Sign-off**: _________________ Date: _______

---

**Version**: 1.0 | **Updated**: December 2, 2024 | **Print Date**: _______

**TIP**: Laminate this page for desk reference. Update with actual contact info and links before printing.
