# Phase 2: Monitoring & Alerting Setup
## Comprehensive Guide for Infrastructure Observability

**Status**: Ready for Implementation
**Created**: December 4, 2025
**Purpose**: Monitor Phase 2 infrastructure changes and alert on critical issues

---

## 📊 MONITORING ARCHITECTURE

### Components to Monitor

```
┌─────────────────────────────────────────────────────┐
│                  Client Requests                     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│            NGINX Load Balancer                       │
│  - Request rate, latency, error rates               │
│  - Upstream health check status                     │
│  - SSL certificate validity                        │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼──┐      ┌───▼──┐      ┌───▼──┐
│Back- │      │Back- │      │Back- │
│end-1 │      │end-2 │      │end-3 │
└──┬───┘      └──┬───┘      └──┬───┘
   │             │             │
   │  DB Conn.   │ DB Conn.    │ DB Conn.
   │  Pool       │ Pool        │ Pool
   │             │             │
   └─────────────┼─────────────┘
                 │
        ┌────────▼────────┐
        │  PgBouncer      │
        │  Conn Pooling   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  PostgreSQL     │
        │  Primary DB     │
        └─────────────────┘
```

### Monitoring Tiers

| Tier | Component | Frequency | Tool | Alert Threshold |
|------|-----------|-----------|------|-----------------|
| **Critical** | NGINX health | Every 10s | NGINX check module | Down = immediate |
| **Critical** | Database latency | Every 5s | Application metrics | > 100ms |
| **High** | Backend error rate | Every 1m | Application logs | > 5% of requests |
| **High** | PgBouncer pool usage | Every 30s | Admin interface | > 80% capacity |
| **Medium** | Distributed lock conflicts | Every 5m | Application logs | > 2 per hour |
| **Medium** | DNS resolution | Every 1m | Synthetic checks | Fails > 1x |
| **Low** | Request latency p95 | Every 5m | APM tool | > 500ms |
| **Low** | SSL certificate expiry | Daily | Tool like certbot | < 14 days remaining |

---

## 🔍 MONITORING SETUP BY COMPONENT

### 1. NGINX Load Balancer Monitoring

#### Health Check Status (Built-in)

**What to Monitor**: Server availability in upstream block

**How to Check**:
```bash
# SSH to NGINX server
ssh root@nginx-ip

# Check upstream status
curl http://localhost:8080/nginx_status

# Expected output:
# Active connections: 42
# server accepts handled requests
#  1234 1234 5678
# Reading 10 Writing 5 Waiting 27

# Each server should have non-zero 'accepts' and 'handled'
```

**Metrics to Track**:
- `active_connections` - Should scale with traffic
- `accepted_connections` - Total since startup
- `total_requests` - Increasing over time
- `reading` / `writing` / `waiting` - Should be < total active

#### Request Rate and Latency

**Setup with DataDog**:

```bash
# 1. Install DataDog agent on NGINX server
curl -L https://raw.githubusercontent.com/DataDog/datadog-agent/master/cmd/agent/install.sh | bash

# 2. Configure nginx integration
cat > /etc/datadog-agent/conf.d/nginx.d/conf.yaml << 'EOF'
init_config:

instances:
  - nginx_status_url: http://localhost:8080/nginx_status
    collector_type: monitoring
    tags:
      - env:production
      - service:api
EOF

# 3. Restart DataDog agent
systemctl restart datadog-agent
```

**Metrics**:
```
nginx.requests       # Total requests
nginx.connections.active
nginx.connections.waiting
nginx.connections.accepted
nginx.connections.dropped
```

**Create Alert**:
```
Alert when nginx.requests.rate > 1000/sec for 5 minutes
Alert when nginx.connections.active > 500 for 10 minutes
```

#### Rate Limiting (Built-in)

**Monitor via Logs**:
```bash
# Check for rate limit hits
tail -f /var/log/nginx/backend_access.log | grep "429"

# Count 429 errors by IP
grep "429" /var/log/nginx/backend_access.log | awk '{print $1}' | sort | uniq -c
```

**Setup with DataDog**:
```yaml
# Parse rate limit errors from logs
logs:
  service: nginx
  source: nginx
  pattern: '429 Too Many Requests'
```

**Create Alert**:
```
Alert when count(429 errors) > 100 in 5 minutes
Alert when any single IP triggers 429 > 10 times in 1 minute
```

---

### 2. Backend Server Monitoring

#### Application Health Endpoints

**Monitor Health Checks**:
```bash
# Simple health check (should always respond < 5ms)
curl -w "@curl-format.txt" https://api.koinoniasms.com/health

# Detailed health check (should respond < 50ms)
curl -w "@curl-format.txt" https://api.koinoniasms.com/health/detailed

# Expected response:
# {"status":"healthy","checks":{"database":"ok","redis":"ok","application":"ok"},"timestamp":"2025-12-04T..."}
```

**Create curl format file** (`/tmp/curl-format.txt`):
```
    time_namelookup:  %{time_namelookup}
       time_connect:  %{time_connect}
    time_appconnect:  %{time_appconnect}
   time_pretransfer:  %{time_pretransfer}
      time_redirect:  %{time_redirect}
 time_starttransfer:  %{time_starttransfer}
                    ----------
         time_total:  %{time_total}
```

#### Database Query Latency

**Setup with Datadog**:

```typescript
// Already integrated via slow-query-logger.ts
// Tracks queries > 500ms automatically
// Metrics sent to New Relic if available
```

**Monitor via Logs**:
```bash
# Watch backend logs for slow queries
tail -f /var/log/koinoniasms-api/out.log | grep "SLOW QUERY"

# Example:
# [SLOW QUERY] user.findUnique took 1234ms (threshold: 500ms)
```

**Create Alerts**:
```
Alert when:
- Database query latency > 100ms for 5 minutes
- Slow query count > 10 per minute
- Any query > 2000ms (critical)
```

#### Error Rates

**Monitor via Application Logs**:
```bash
# Count errors in real-time
tail -f /var/log/koinoniasms-api/error.log | wc -l

# Count by error type
grep -o 'Error: [^(]*' /var/log/koinoniasms-api/error.log | sort | uniq -c | sort -rn
```

**Setup with DataDog**:
```yaml
logs:
  service: backend
  source: application
  patterns:
    - pattern: '❌|ERROR|Error|error'
      severity: error
```

**Create Alerts**:
```
Alert when:
- Error rate > 5% of total requests for 5 minutes
- Any single error type > 100 occurrences in 1 minute (e.g., Database Connection Error)
- Unhandled exceptions > 1 in 1 minute
```

#### Distributed Lock Conflicts

**Monitor via Logs**:
```bash
# Check for lock contention
grep "Job lock held by another server" /var/log/koinoniasms-api/out.log | wc -l

# See which jobs have conflicts
grep "Job lock held" /var/log/koinoniasms-api/out.log | grep -o "job: [^ ]*" | sort | uniq -c
```

**Expected Behavior**:
- Recurring messages job: One server acquires lock, others skip
- Phone linking recovery job: Only one server runs per cycle
- No job should run on multiple servers simultaneously

**Create Alert**:
```
Alert when:
- Same job shows "lock held" > 2 times in 10-minute window
  (Indicates potential lock failure or job taking too long)
- Job takes > 4 minutes (if normal is 2 minutes) - timeout issue
```

#### PM2 Process Monitoring

**Setup**:
```bash
# SSH to each backend server
ssh ubuntu@backend-1.render.com

# View PM2 status
pm2 status

# Expected:
# ┌─────────────────────────────────────────────────────────────────────┐
# │ id │ name              │ mode │ ↺  │ status  │ ↓ cpu │ ↓ mem       │
# ├────┼──────────────────────────────────────────────────────────────────┤
# │ 0  │ koinoniasms-api  │ cluster │ 0 │ online  │ 2%   │ 256.0 MB   │
# │ 1  │ koinoniasms-api  │ cluster │ 0 │ online  │ 1.2% │ 245.3 MB   │
# │ 2  │ koinoniasms-api  │ cluster │ 0 │ online  │ 3%   │ 267.1 MB   │
# │ 3  │ koinoniasms-api  │ cluster │ 0 │ online  │ 1.5% │ 251.2 MB   │
# └─────────────────────────────────────────────────────────────────────┘

# Monitor logs
pm2 logs koinoniasms-api --lines 100
```

**Create Alerts**:
```
Alert when:
- PM2 status shows 'stopped' or 'errored' for any process
- Restart count (↺) > 0 in 1 hour (indicates crashes)
- Memory usage > 500MB per process
- CPU usage > 80% consistently
```

---

### 3. PgBouncer Connection Pooling Monitoring

#### Pool Status

**Monitor Connection Pooling**:
```bash
# SSH to PgBouncer server
ssh root@pgbouncer-ip

# Connect to admin interface
psql -h localhost -p 6432 -U pgbouncer pgbouncer

# Check stats
SHOW STATS;

# Expected output:
#  database  │ total_requests │ total_received │ total_sent │ total_xact_time
# ────────────┼────────────────┼────────────────┼────────────┼──────────────────
#  connect_yw │       1234567  │        5678901 │   5678901  │   45678900000

# Check pools
SHOW POOLS;

# Expected output:
#  database  │ user │ cl_active │ cl_waiting │ sv_active │ sv_idle │ sv_used
# ────────────┼──────┼───────────┼────────────┼───────────┼─────────┼──────────
#  connect_yw │ db   │     25    │      0     │     25    │    5    │   25

# Check clients
SHOW CLIENTS;
```

**Key Metrics**:
- `cl_active`: Client connections in use (should grow with traffic)
- `cl_waiting`: Clients waiting for pool slot (should be 0)
- `sv_active`: Server connections actively processing
- `sv_idle`: Server connections idle and reusable
- `sv_used`: Total server connections

**Connection Reuse Calculation**:
```
Reuse Ratio = total_requests / total_xact_time
Expected: > 90% (each connection handles multiple transactions)
```

**Create Alerts**:
```
Alert when:
- cl_waiting > 10 (waiting clients indicate pool saturation)
- cl_active / default_pool_size > 0.8 (80% pool usage)
- sv_idle = 0 for > 1 minute (pool completely used)
- Connection reuse ratio < 50% (possible connection leaks)
```

#### PgBouncer Logs

**Monitor Logs**:
```bash
# Watch PgBouncer logs
tail -f /var/log/pgbouncer/pgbouncer.log | grep -E "ERROR|WARN"

# Look for connection issues
grep "no more connections" /var/log/pgbouncer/pgbouncer.log
```

**Create Alerts**:
```
Alert when:
- "no more connections" error appears
- Connection timeout errors > 5 in 5 minutes
- Pool configuration change warnings
```

---

### 4. Database Monitoring

#### PostgreSQL Connection Status

**Monitor via PgBouncer**:
```bash
psql -h pgbouncer-ip -p 6432 -U pgbouncer pgbouncer -c "SHOW SERVERS;"

# Expected: All connections should show 'ok' state
```

**Monitor from Backend**:
```bash
# Check database connectivity
psql postgresql://user:pass@pgbouncer-ip:6432/db -c "SELECT version();"
```

**Create Alert**:
```
Alert when:
- Database connection fails for > 30 seconds
- Query timeout > 5 times in 1 minute
```

#### Slow Queries

**Monitor via Application**:
```bash
# The slow-query-logger.ts tracks this automatically
# Check via API endpoint (if exposed)
curl https://api.koinoniasms.com/metrics/slow-queries

# Expected response:
# {
#   "stats": {
#     "count": 5,
#     "avgDuration": 750,
#     "maxDuration": 2100,
#     "minDuration": 510
#   },
#   "recentQueries": [...]
# }
```

**Create Alerts**:
```
Alert when:
- Slow query count > 10 in 5 minutes
- Average query duration > 100ms
- Any query > 2000ms (critical)
- Max query duration increasing trend (indicates indexing problem)
```

#### Database Size

**Monitor via SQL**:
```bash
psql postgresql://user:pass@pgbouncer-ip:6432/db -c "
SELECT
  pg_size_pretty(pg_database_size(current_database())) AS size,
  (SELECT count(*) FROM message) AS message_count,
  (SELECT count(*) FROM conversation) AS conversation_count;
"
```

**Expected Growth**:
- Phase 1: ~100GB
- Phase 2 (with archival): ~40-80GB
- Should grow < 10GB/month

**Create Alerts**:
```
Alert when:
- Database size grows > 20GB in 1 week
- Disk usage > 80% of available space
```

---

## 📈 ALERTING RULES

### Critical Alerts (Immediate Notification)

| Condition | Action |
|-----------|--------|
| NGINX unavailable or all upstream servers down | Page on-call engineer immediately |
| All 3 backend servers showing 5xx errors | Page on-call engineer |
| Database connection lost for > 30 seconds | Page on-call engineer |
| PgBouncer pool at 100% capacity, clients waiting | Page on-call engineer |
| SSL certificate expires in < 24 hours | Page on-call engineer |

### High Priority Alerts (15-min window)

| Condition | Action |
|-----------|--------|
| Any 2 of 3 backend servers down | Send Slack alert, check status |
| Error rate > 10% of requests | Send Slack alert, investigate logs |
| Database latency > 500ms | Send Slack alert, check slow queries |
| PgBouncer pool at 80%+ capacity | Send Slack alert, may need to scale |
| Distributed lock conflicts > 5 in 1 hour | Send Slack alert, check job duration |

### Medium Priority Alerts (1-hour window)

| Condition | Action |
|-----------|--------|
| Slow query count > 20 in 1 hour | Send Slack alert, monitor |
| Memory usage > 70% on any server | Send Slack alert, consider scaling |
| Network latency p95 > 200ms | Send Slack alert, check connectivity |
| Rate limit hits > 1000 in 1 hour | Send Slack alert, may need to adjust limits |

### Low Priority Alerts (Daily)

| Condition | Action |
|-----------|--------|
| SSL certificate expires in 30 days | Send daily Slack alert |
| Database size growth > 15% in a week | Send daily report |
| Uptime < 99.9% that day | Send daily summary |

---

## 🛠️ ALERTING IMPLEMENTATION

### Option 1: DataDog (Recommended for AWS)

**Setup**:
```bash
# 1. Create DataDog account (free tier available)
# https://www.datadoghq.com/free-trial/

# 2. Install DataDog agent on each server
curl -L https://raw.githubusercontent.com/DataDog/datadog-agent/master/cmd/agent/install.sh | bash

# 3. Configure integrations
cat > /etc/datadog-agent/conf.d/nginx.d/conf.yaml << 'EOF'
init_config:
instances:
  - nginx_status_url: http://localhost:8080/nginx_status
EOF

cat > /etc/datadog-agent/conf.d/postgres.d/conf.yaml << 'EOF'
init_config:
instances:
  - host: pgbouncer-ip
    port: 6432
    username: db_user
    password: db_pass
    database: connect_yw_production
EOF

# 4. Restart agent
systemctl restart datadog-agent

# 5. Create monitors in DataDog dashboard
# Go to: https://app.datadoghq.com/monitors/create
```

### Option 2: Prometheus + Alertmanager (Open Source)

**Setup**:
```bash
# 1. Install Prometheus on monitoring server
apt-get install prometheus

# 2. Configure scrape targets
cat > /etc/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-ip:8080']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend-1-ip:3000', 'backend-2-ip:3000', 'backend-3-ip:3000']
    metrics_path: '/metrics'  # If exposed

  - job_name: 'pgbouncer'
    static_configs:
      - targets: ['pgbouncer-ip:6432']
EOF

# 3. Create alert rules
cat > /etc/prometheus/rules.yml << 'EOF'
groups:
  - name: backend_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: SlowQueries
        expr: database_query_duration_ms > 100
        for: 5m
        annotations:
          summary: "Slow database query detected"
EOF

# 4. Start Prometheus
systemctl start prometheus
```

### Option 3: CloudWatch (AWS)

**Setup**:
```bash
# 1. Install CloudWatch agent on each server
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb

# 2. Configure metrics to collect
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
  "metrics": {
    "namespace": "YWMESSAGING",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          {
            "name": "cpu_usage_idle",
            "rename": "CPU_IDLE",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      },
      "mem": {
        "measurement": [
          {
            "name": "mem_used_percent",
            "rename": "MEM_USED",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
EOF

# 3. Start agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a query -m ec2 -config-location /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -a fetch-config -m ec2 -s

# 4. Create alarms in AWS Console
# Go to: CloudWatch → Alarms → Create Alarm
```

---

## 📋 MONITORING CHECKLIST

### Setup Monitoring System
- [ ] Choose monitoring platform (DataDog/Prometheus/CloudWatch)
- [ ] Install agent/collector on all servers
- [ ] Configure data collection (metrics, logs)
- [ ] Create dashboards for visualization
- [ ] Test metric collection (verify data flowing)

### Setup Alerting
- [ ] Create critical alerts (NGINX, Database, Errors)
- [ ] Create high-priority alerts (Pool usage, Error rate)
- [ ] Create medium-priority alerts (Slow queries, Memory)
- [ ] Configure notification channels (Slack, PagerDuty, SMS)
- [ ] Test alert delivery (trigger test alert)

### Setup Dashboard
- [ ] Real-time request rate graph
- [ ] Upstream server health status
- [ ] Database connection pool usage
- [ ] Error rate over time
- [ ] Average latency trends
- [ ] Slow query count
- [ ] Distributed lock contention

### Documentation
- [ ] Document all alert rules and thresholds
- [ ] Create runbook for each alert
- [ ] Document metric collection intervals
- [ ] Provide access to monitoring dashboard for team

---

## 🔧 DEBUGGING WITH MONITORING DATA

### Common Issues and How to Diagnose

**Issue**: Backend servers showing 502 errors
```bash
# 1. Check NGINX logs
tail -f /var/log/nginx/backend_error.log

# 2. Check backend health
curl http://backend-1-ip:3000/health/detailed
curl http://backend-2-ip:3000/health/detailed
curl http://backend-3-ip:3000/health/detailed

# 3. Check PgBouncer connectivity
SHOW CLIENTS;
SHOW SERVERS;
```

**Issue**: Database queries slower than normal
```bash
# 1. Check slow query log
curl https://api.koinoniasms.com/metrics/slow-queries

# 2. Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

# 3. Check index usage
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan;

# 4. Check connection pool
SHOW STATS;
```

**Issue**: Memory usage high on backend servers
```bash
# 1. Check PM2 memory
pm2 status

# 2. Check process memory details
ps aux | grep node | awk '{print $2, $6}'

# 3. Check for memory leaks
# Monitor memory growth over hours/days
watch -n 5 'free -h && echo && pm2 status'

# 4. Potential cause: Cache growing unbounded
# Check cache size if using Redis or in-process caching
```

---

## 📞 ON-CALL RUNBOOK

When alert fires, follow these steps:

**Critical Alert** (Page immediately):
1. [ ] Acknowledge alert in monitoring system
2. [ ] Check status dashboard
3. [ ] SSH to affected server
4. [ ] Check logs for error messages
5. [ ] Attempt to restart service (if appropriate)
6. [ ] If restart fails, roll back latest deployment
7. [ ] Contact team lead if unable to resolve

**High Priority Alert** (Slack notification):
1. [ ] Investigate root cause
2. [ ] Check if temporary spike or sustained issue
3. [ ] If sustained > 5 min, attempt fix
4. [ ] Document timeline and resolution in Slack

**Medium Priority Alert** (Daily review):
1. [ ] Investigate during next shift
2. [ ] Document findings in issue tracker
3. [ ] Plan preventive measures if recurring

---

## 🎯 SUCCESS METRICS

Phase 2 monitoring is **complete** when:

- [ ] All infrastructure components being monitored
- [ ] Critical alerts configured and tested
- [ ] Dashboard provides clear visibility
- [ ] Team trained on alert response
- [ ] Runbook created for each major component
- [ ] 99.9% uptime maintained
- [ ] < 500ms p95 latency consistently
- [ ] < 1% error rate
- [ ] PgBouncer connection reuse > 90%

---

**Next Step**: Begin Phase 2 deployment using PHASE2-DEPLOYMENT-RUNBOOK.md and monitor with this setup.
