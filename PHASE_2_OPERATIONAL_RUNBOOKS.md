# Phase 2 Operational Runbooks

**Project**: YWMESSAGING SaaS Platform
**Purpose**: Step-by-step procedures for common Phase 2 operations
**Audience**: DevOps Engineers, Database Administrators, On-Call Engineers

---

## Table of Contents

1. [Read Replicas Operations](#read-replicas-operations)
2. [PgBouncer Connection Pooling](#pgbouncer-connection-pooling)
3. [Query Monitoring & Performance](#query-monitoring--performance)
4. [Cache Management](#cache-management)
5. [Rate Limiting Management](#rate-limiting-management)
6. [Table Partitioning Operations](#table-partitioning-operations)
7. [Emergency Procedures](#emergency-procedures)
8. [Health Check Interpretation](#health-check-interpretation)

---

## Read Replicas Operations

### RB-1: Daily Health Check

**When**: Daily, at 9 AM
**Duration**: 5 minutes
**Owner**: DevOps Engineer

**Steps**:
```bash
# 1. SSH to primary database server
ssh postgres-primary.internal

# 2. Check replication status
psql -U postgres -d ywmessaging -c "SELECT * FROM pg_stat_replication;"

# Expected output:
# - Should show 2 rows (one for each replica)
# - state = 'streaming' for both
# - sync_state = 'async' (unless configured for synchronous)
# - write_lag < 1000ms
# - flush_lag < 1000ms
# - replay_lag < 1000ms

# 3. If any replica is NOT streaming:
# ALARM: Page on-call DBA immediately
# This means replication is broken
```

**Success Criteria**:
- ✅ 2 replicas showing "streaming"
- ✅ write_lag < 1000ms for both
- ✅ flush_lag < 1000ms for both
- ✅ replay_lag < 1000ms for both

**If Any Check Fails**:
- [ ] Page DBA: [contact info]
- [ ] Do NOT failover without investigation
- [ ] Check PostgreSQL logs on replica: `/var/log/postgresql/postgresql.log`
- [ ] Look for replication errors

---

### RB-2: Manual Failover to Secondary Replica

**When**: Primary database is down or degraded
**Duration**: 5 minutes (with risk)
**Owner**: DBA + On-Call Engineer (joint decision required)

⚠️ **WARNING**: This causes data loss if primary had uncommitted transactions

**Pre-Failover Checks** (2 minutes):
```bash
# 1. Verify primary is unreachable
ping -c 3 postgres-primary.internal
# Should timeout

# 2. Verify replica is healthy
psql -h replica-1.internal -U postgres -c "SELECT 1;"
# Should succeed

# 3. Check replica lag
psql -h replica-1.internal -U postgres -c "SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();"
# Replay LSN should be very close to receive LSN
```

**Failover Steps** (3 minutes):
```bash
# 1. Promote replica to primary
ssh replica-1.internal
sudo su - postgres
pg_ctl promote -D /var/lib/postgresql/12/main/
# Output: "server promoting"

# 2. Wait for promotion to complete (usually <1 minute)
watch -n 1 'pg_isready -h localhost'
# Should show "accepting connections"

# 3. Update application connection string
# DATABASE_URL=postgresql://replica-1.internal:5432/ywmessaging
# Restart application servers (coordinated restart)

# 4. Start new replica from existing replica-2
# (This is complex, see RB-3 for details)
```

**Post-Failover Validation** (1 minute):
```bash
# 1. Connect to new primary (old replica-1)
psql -h replica-1.internal -U postgres -d ywmessaging

# 2. Run test query
SELECT COUNT(*) FROM users;
# Should return result quickly

# 3. Check application health
curl -H "Content-Type: application/json" https://api.ywmessaging.com/health
# Should return 200 OK
```

**Rollback Procedure** (if primary recovers):
```bash
# If primary comes back online after failover:
# 1. DO NOT immediately switch back (risk of diverging data)
# 2. Let operator decide based on data consistency
# 3. May require pg_rewind or full resync
# 4. Consult with DBA before proceeding
```

---

### RB-3: Rebuild Failed Read Replica

**When**: Read replica is lagging or down
**Duration**: 15-30 minutes
**Owner**: DBA (complex procedure)

**Prerequisites**:
- Primary is healthy
- Network connectivity is available
- pg_basebackup is installed

**Steps**:
```bash
# 1. SSH to the failed replica
ssh replica-1.internal

# 2. Stop PostgreSQL
sudo systemctl stop postgresql

# 3. Backup old data directory
cd /var/lib/postgresql/12/main
sudo mv postgresql postgresql.old

# 4. Create new replication slot on primary
ssh postgres-primary.internal
sudo su - postgres
psql -d ywmessaging -c "SELECT pg_create_physical_replication_slot('replica_1_slot');"

# 5. Run pg_basebackup from replica
ssh replica-1.internal
sudo su - postgres
pg_basebackup -h postgres-primary.internal \
  -D /var/lib/postgresql/12/main \
  -U replication_user \
  -v -P -W -R \
  -S replica_1_slot
# This takes 10-15 minutes depending on database size

# 6. Start PostgreSQL
sudo systemctl start postgresql

# 7. Verify replication started
# Wait 30 seconds, then on primary:
psql -d ywmessaging -c "SELECT * FROM pg_stat_replication WHERE application_name = 'replica_1';"
# Should show "streaming" status

# 8. Verify replica is catching up
# Check write_lag, flush_lag, replay_lag
# Should decrease over time
# Expected: <1 second lag within 5 minutes
```

**Monitoring Recovery**:
```bash
# Every 30 seconds, check:
psql -h replica-1.internal -U postgres -d ywmessaging -c "SELECT now() - pg_last_xact_replay_timestamp();"
# Should show lag decreasing toward 0

# Fully recovered when lag is < 1 second
```

---

### RB-4: Read Replica Failover Test (Monthly)

**When**: First Sunday of each month, during maintenance window
**Duration**: 30 minutes
**Owner**: DevOps Engineer + DBA

**Purpose**: Verify failover procedures work without losing data

**Test Procedure**:
```bash
# 1. Notify team: "Starting planned failover test"

# 2. Put application in maintenance mode
# (Display "briefly unavailable" message)

# 3. Stop primary database
ssh postgres-primary.internal
sudo systemctl stop postgresql

# 4. Manually promote replica-1
ssh replica-1.internal
sudo su - postgres
pg_ctl promote -D /var/lib/postgresql/12/main/

# 5. Wait for promotion
watch -n 1 'pg_isready -h localhost'

# 6. Verify no data loss
psql -h replica-1.internal -U postgres -d ywmessaging -c "SELECT COUNT(*) FROM users;"
# Compare with previous known value

# 7. Restart primary
ssh postgres-primary.internal
sudo systemctl start postgresql

# 8. Verify primary rejoins as replica
# Wait 2 minutes
psql -h postgres-primary.internal -U postgres -d ywmessaging -c "SELECT * FROM pg_stat_replication;"
# Should show it's no longer primary

# 9. Restore original configuration
# Promote replica-1 back to primary
ssh replica-1.internal
pg_ctl promote -D /var/lib/postgresql/12/main/
# Wait 30 seconds

# 10. Application automatic failover
# App should detect primary is back
# Resume normal operation

# 11. Notify team: "Failover test complete, all systems normal"
```

**Success Criteria**:
- ✅ Failover completed without data loss
- ✅ No application errors during failover
- ✅ Service recovered in <5 minutes
- ✅ Replication re-established

**Document Result**:
- Time to complete failover
- Any issues encountered
- Updates needed to procedures
- Next test scheduled

---

## PgBouncer Connection Pooling

### RB-5: Check Pool Status

**When**: Daily or when investigating connection issues
**Duration**: 5 minutes
**Owner**: DevOps Engineer

**Steps**:
```bash
# 1. Connect to PgBouncer admin console
psql -U pgbouncer -d pgbouncer -h localhost -p 6432

# 2. Show current pools
SHOW pools;

# Output should show:
# database    | user         | cl_active | cl_waiting | sv_active | sv_idle | ...
# ywmessaging | app_user     | 45        | 0          | 45        | 5       | ...

# 3. Interpret the results:
# cl_active:  Client connections using pool (should be 45-55 on 50-pool)
# cl_waiting: Clients waiting for available connection (should be 0)
# sv_active:  Server connections in use (should match cl_active)
# sv_idle:    Idle server connections (should be 5-15 for reserve)

# If cl_waiting > 0:
# WARNING: Connection pool exhausted, clients waiting
# Action: Increase pool size (see RB-6)
```

**Healthy Status**:
```
cl_active: 40-60  (on 50-size pool)
cl_waiting: 0     (no waiting clients)
sv_active: 40-50  (matches clients)
sv_idle: 5-15     (reserve connections)
```

---

### RB-6: Increase Connection Pool Size

**When**: cl_waiting > 0 consistently
**Duration**: 10 minutes (requires restart)
**Owner**: DevOps Engineer + approval

**Steps**:
```bash
# 1. Stop accepting new connections
# Edit /etc/pgbouncer/pgbouncer.ini

sudo vim /etc/pgbouncer/pgbouncer.ini

# Find: pool_size = 50
# Change to: pool_size = 75  (increase by 25)

# 2. Reload PgBouncer configuration
sudo systemctl reload pgbouncer
# OR
psql -U pgbouncer -d pgbouncer -c "RELOAD;"

# 3. Verify new pool size took effect
psql -U pgbouncer -d pgbouncer -c "SHOW config;" | grep pool_size

# 4. Monitor for improvements
# Wait 5 minutes, check pool status again
psql -U pgbouncer -d pgbouncer -c "SHOW pools;"

# Expected: cl_waiting back to 0

# 5. Document change
# Log: "Increased pool_size from 50 to 75 due to sustained waiting queue"
```

**Rollback** (if performance degrades):
```bash
# Decrease pool_size back
pool_size = 50
sudo systemctl reload pgbouncer
```

---

### RB-7: Detect Connection Leaks

**When**: sv_idle gradually decreases while cl_active stays high
**Duration**: 30 minutes to diagnose
**Owner**: DBA + Backend Engineer

**Symptoms**:
- Pool size stays at max (e.g., 50/50)
- Clients waiting starts appearing (cl_waiting > 0)
- sv_idle approaches 0
- Over several hours, becoming worse

**Diagnosis Steps**:
```bash
# 1. Check pool status
psql -U pgbouncer -d pgbouncer -c "SHOW pools;"
# If sv_idle = 0 or very low: LEAK DETECTED

# 2. Check active connections detail
psql -U pgbouncer -d pgbouncer -c "SHOW clients;"
# Look for connections that have been active for hours
# Usually shows: idle time, query_time, addr

# 3. Check server connections
psql -U pgbouncer -d pgbouncer -c "SHOW servers;"
# Look for connections with long query_time (usually queries stuck)

# 4. Identify stuck query
# Check application logs for long-running queries
# OR query primary database
psql -U postgres -h postgres-primary.internal -d ywmessaging -c "
  SELECT pid, usename, state, query, now() - query_start as duration
  FROM pg_stat_activity
  WHERE state != 'idle'
  ORDER BY duration DESC
  LIMIT 10;
"

# 5. Kill stuck query if safe
# DO NOT kill without understanding what it does
# SELECT pg_terminate_backend(pid);
```

**Recovery**:
```bash
# Option 1: Kill stuck query (if identified and safe)
psql -U postgres -h postgres-primary.internal -d ywmessaging -c "
  SELECT pg_terminate_backend(12345);  -- Replace 12345 with PID
"

# Option 2: Restart PgBouncer (nuclear option)
sudo systemctl restart pgbouncer
# This kills all pooled connections
# Clients will reconnect, but ongoing transactions lost
# Use only after identifying the leak source

# Option 3: Restart application servers
# Kill long-running connections from app
pm2 restart app
# This closes connection from application side
```

**Prevention**:
- Add query timeout in pgbouncer.ini: `server_lifetime = 600` (10 minutes max)
- Monitor query times regularly
- Set up alerts for queries > 5 minutes

---

## Query Monitoring & Performance

### RB-8: Check Slow Queries

**When**: Daily or when users report slowness
**Duration**: 10 minutes
**Owner**: Backend Engineer or DBA

**Steps**:
```bash
# 1. Access metrics endpoint
curl -s https://api.ywmessaging.com/metrics/queries | jq

# Response format:
# {
#   "slowQueries": [
#     {
#       "query": "SELECT * FROM conversation_message WHERE ...",
#       "duration": 1250,
#       "count": 5,
#       "threshold": 100
#     }
#   ],
#   "statistics": {
#     "p50": 45,
#     "p90": 250,
#     "p95": 500,
#     "p99": 2500,
#     "average": 150,
#     "total_queries": 10000
#   },
#   "health": "healthy"  // or "degraded" / "unhealthy"
# }

# 2. Identify slowest query
# Usually first item in slowQueries array

# 3. Analyze the query
# Check if it uses indexes properly
psql -U postgres -h postgres-primary.internal -d ywmessaging

# EXPLAIN ANALYZE on the slow query
EXPLAIN ANALYZE
SELECT * FROM conversation_message
WHERE conversation_id = 'abc123'
ORDER BY created_at DESC
LIMIT 50;

# Look for:
# - Sequential Scans (usually bad without WHERE filter)
# - High planning time
# - High execution time
# - Buffer cache misses
```

**Common Issues & Fixes**:

| Issue | Signal | Fix |
|-------|--------|-----|
| Missing index | Sequential Scan | Create index on WHERE column |
| Wrong index | Index Scan returns many rows | Create better index |
| N+1 query | Same query repeated | Use batch query in code |
| Large dataset | Query touches millions rows | Add time filter or pagination |
| Memory pressure | Slow even with index | Increase work_mem or paginate |

---

### RB-9: Create Index for Slow Query

**When**: Identified missing index from slow query analysis
**Duration**: 5-60 minutes (depends on table size)
**Owner**: DBA (requires production access)

**Example**: ConversationMessage query is slow

```bash
# 1. Analyze current query plan
psql -U postgres -h postgres-primary.internal -d ywmessaging

EXPLAIN ANALYZE
SELECT * FROM conversation_message
WHERE conversation_id = 'abc123' AND created_at > '2024-11-01'
ORDER BY created_at DESC
LIMIT 50;

# If shows: Sequential Scan on conversation_message
# ISSUE: No index on (conversation_id, created_at)

# 2. Create index (non-blocking)
CREATE INDEX CONCURRENTLY idx_conversation_message_conv_created
ON conversation_message (conversation_id, created_at DESC)
WHERE deleted_at IS NULL;

# CONCURRENTLY = no table lock, allows queries during creation
# Expected time: 5-15 minutes for large table

# 3. Verify index was created
SELECT * FROM pg_indexes
WHERE tablename = 'conversation_message'
AND indexname LIKE '%conv_created%';

# 4. Re-run query with EXPLAIN
EXPLAIN ANALYZE
SELECT * FROM conversation_message
WHERE conversation_id = 'abc123' AND created_at > '2024-11-01'
ORDER BY created_at DESC
LIMIT 50;

# Should now show: Index Scan using idx_conversation_message_conv_created
# Query time should improve 5-10x

# 5. Monitor for improvement
# Check /metrics/queries endpoint
# p95 latency should decrease
```

---

### RB-10: Analyze Query Performance Before/After Change

**When**: Before deploying optimization (e.g., adding cache, changing query)
**Duration**: 30 minutes
**Owner**: Backend Engineer

**Procedure**:
```bash
# 1. Baseline measurement (BEFORE)
# Run query 100 times and measure
time for i in {1..100}; do
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT * FROM conversation_message
    WHERE conversation_id = 'abc123'
    ORDER BY created_at DESC LIMIT 50;
  "
done

# Record results:
# real: 15.234s
# user: 8.234s
# Average per query: 152ms

# 2. Apply optimization
# (e.g., add index, add cache, change query)

# 3. After optimization measurement (AFTER)
time for i in {1..100}; do
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT * FROM conversation_message
    WHERE conversation_id = 'abc123' AND created_at > '2024-11-01'
    ORDER BY created_at DESC LIMIT 50;
  "
done

# Record results:
# real: 3.245s
# user: 1.892s
# Average per query: 32ms

# 4. Calculate improvement
# Before: 152ms
# After: 32ms
# Improvement: (152-32)/152 * 100 = 79% faster

# 5. Document and report
# File: PHASE_2_OPTIMIZATION_RESULTS.md
# Include: Before/after times, query plan, impact estimate
```

---

## Cache Management

### RB-11: Check Cache Hit Rate

**When**: Daily or when investigating slow requests
**Duration**: 5 minutes
**Owner**: Backend Engineer

**Steps**:
```bash
# 1. Access Redis to get cache stats
redis-cli INFO stats

# Output will show:
# total_connections_received:1234
# total_commands_processed:5678
# expired_keys:123
# evicted_keys:0
# keyspace_hits:4500
# keyspace_misses:1000

# 2. Calculate hit rate
# hit_rate = hits / (hits + misses) * 100
# 4500 / (4500 + 1000) * 100 = 81.8% hit rate

# 3. Interpret results:
# Hit rate >= 70%: HEALTHY (target: 70-90%)
# Hit rate 50-70%: ACCEPTABLE but investigate
# Hit rate < 50%: POOR, action needed

# 4. If poor, check which keys are missing
redis-cli --scan --pattern "rl:*" | head -20
# See what's actually cached

# 5. Check if cache was warmed on startup
# Check application logs for "Cache warming started"
# Should see keys being pre-populated
```

**Healthy Baseline**:
- Hit rate: 70-90%
- Memory usage: <100MB
- Expiration rate: <1% of total ops
- Evictions: 0 (if evictions > 0, memory might be full)

---

### RB-12: Debug Cache Issues

**When**: Cache hits are low or specific keys not cached
**Duration**: 15 minutes
**Owner**: Backend Engineer

**Scenario 1: Cache empty after restart**
```bash
# 1. Check if cache warming is running
# In application logs:
tail -f logs/application.log | grep "Cache warming"

# Expected: "Cache warming started for key: users:..."
# If NOT present: Cache warming not configured or failed

# 2. Enable cache warming in config
# .env file should have: CACHE_WARMING_ENABLED=true

# 3. Manually warm cache
# Call health endpoint which triggers warming
curl https://api.ywmessaging.com/health/detailed

# 4. Verify keys are now in cache
redis-cli --scan --pattern "users:*"
# Should show multiple keys

# 5. Re-run application test
# Cache should be hit now
```

**Scenario 2: Specific key not cached**
```bash
# 1. Check if key exists in Redis
redis-cli GET "users:123"
# If nil/empty: NOT in cache

# 2. Check if key is supposed to be cached
# Search application code for key prefix
grep -r "users:123" backend/src/

# If using createCachedFunction:
grep -r "createCachedFunction" backend/src/ | grep "users:"

# 3. Check if cache TTL expired
redis-cli TTL "users:123"
# If -1: No expiration (persistent)
# If -2: Key does not exist
# If > 0: Seconds until expiration

# 4. If TTL is very short (< 60 seconds), consider increasing
# In redis-cache-optimization.ts:
// Change: ttl: 60000,
// To:     ttl: 3600000,  // 1 hour
```

---

### RB-13: Clear Cache Safely

**When**: Corrupted cache data or major deployment
**Duration**: 5 minutes (with considerations)
**Owner**: DevOps Engineer

⚠️ **CAUTION**: Clearing cache increases database load

**Safe Cache Clear Procedure**:
```bash
# 1. Identify what to clear (ALL vs specific keys)

# Option A: Clear all cache (nuclear option)
# Use only during maintenance window
redis-cli FLUSHDB

# Option B: Clear specific namespace (safer)
# Clear only user-related cache
redis-cli --scan --pattern "users:*" | xargs redis-cli DEL

# Option C: Clear by age (specific pattern)
# Clear cache older than 24 hours (if timestamp in key)
redis-cli --scan --pattern "*:20241201*" | xargs redis-cli DEL

# 2. After clearing, monitor database load
# Should see temporary spike in queries
# Watch CPU/query latency
watch -n 2 'curl -s https://api.ywmessaging.com/metrics/queries | jq ".statistics.p95"'

# Expected: Returns to normal within 5-10 minutes

# 3. Verify application is functioning normally
# Run smoke tests
curl https://api.ywmessaging.com/health
# Should return 200 OK

# 4. If issues occur, the cache will re-warm automatically
# No manual recovery needed
```

---

## Rate Limiting Management

### RB-14: Check Rate Limit Status for API Key

**When**: Client reports "too many requests" error
**Duration**: 5 minutes
**Owner**: Backend Support Engineer

**Steps**:
```bash
# 1. Get client's API key from support request
# Example: api_key = "key_prod_abc123def456"

# 2. Query rate limit status
curl -X GET \
  "https://api.ywmessaging.com/admin/rate-limit/status/key_prod_abc123def456" \
  -H "Authorization: Bearer [admin-token]"

# Response:
# {
#   "apiKey": "key_prod_abc123def456",
#   "requestsUsed": 95,
#   "requestLimit": 100,
#   "percentUsed": 95,
#   "windowResetAt": "2024-12-02T16:30:00Z",
#   "hourlyAverage": 180,
#   "blocksSinceReset": 5
# }

# 3. Interpret:
# percentUsed: 95% -> Client is near limit
# blocksSinceReset: 5 -> Already blocked 5 times this window

# 4. Options:
# Option A: Wait for window reset (client should try later)
# Option B: Upgrade to higher tier
# Option C: Grant temporary increase (emergency only)
```

---

### RB-15: Adjust Rate Limit for Client

**When**: Client needs higher limit temporarily or permanently
**Duration**: 5 minutes
**Owner**: DevOps Engineer + authorization from Product

**Steps**:
```bash
# 1. Identify which tier to upgrade to
# Free: 10 req/min
# Standard: 100 req/min
# Professional: 1000 req/min
# Enterprise: 10000 req/min

# 2. Update client's tier in database
psql -U postgres -h postgres-primary.internal -d ywmessaging

UPDATE api_keys
SET tier = 'professional'
WHERE key = 'key_prod_abc123def456';

# 3. Reset client's current window (so new limit applies)
curl -X POST \
  "https://api.ywmessaging.com/admin/rate-limit/reset/key_prod_abc123def456" \
  -H "Authorization: Bearer [admin-token]"

# 4. Verify new limit is in effect
curl -X GET \
  "https://api.ywmessaging.com/admin/rate-limit/status/key_prod_abc123def456" \
  -H "Authorization: Bearer [admin-token]"

# Response should now show: requestLimit: 1000

# 5. Notify client
# Email: "Your API limit has been increased to 1000 requests per minute"
```

---

### RB-16: Investigate Rate Limit Abuse

**When**: Suspicious rate limit block patterns or unusual traffic
**Duration**: 30 minutes
**Owner**: Backend Engineer + Security Team

**Steps**:
```bash
# 1. Identify pattern of blocks
curl -X GET \
  "https://api.ywmessaging.com/admin/rate-limit/analytics" \
  -H "Authorization: Bearer [admin-token]"

# Look for:
# - Multiple keys from same IP address
# - Repeated requests in short bursts
# - Requests to expensive endpoints (query, analytics)

# 2. Check if legitimate (e.g., bulk import)
# Query database:
SELECT * FROM api_audit_log
WHERE api_key = 'key_prod_abc123def456'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

# Expected legitimate patterns:
# - Bulk import task (large # of requests but predictable)
# - Scheduled data sync (same time daily)

# Suspicious patterns:
# - Trying multiple API keys from same IP
# - Random endpoints (scanning)
# - Very fast requests (automated attack)

# 3. If suspicious:
# a) Temporarily block API key
UPDATE api_keys
SET blocked = true, block_reason = 'Potential abuse detected'
WHERE key = 'key_prod_abc123def456';

# b) Alert security team
# c) Review logs for any data leakage
# d) Prepare incident response

# 4. If legitimate issue:
# a) Whitelist the IP address
UPDATE api_keys
SET whitelist_ips = ARRAY_APPEND(whitelist_ips, '192.168.1.1')
WHERE key = 'key_prod_abc123def456';

# b) Increase burst allowance
UPDATE api_keys
SET burst_size = 50  -- Increased from default
WHERE key = 'key_prod_abc123def456';

# c) Document the change
```

---

## Table Partitioning Operations

### RB-17: Monitor Partition Health (After Implementation)

**When**: Weekly (Mondays) after Week 8 deployment
**Duration**: 10 minutes
**Owner**: DBA

**Steps**:
```bash
# 1. Check partition distribution
psql -U postgres -h postgres-primary.internal -d ywmessaging -c "
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE tablename LIKE 'conversation_message_%'
ORDER BY pg_total_relation_size DESC;
"

# Output should show:
# conversation_message_2024_12: 500MB
# conversation_message_2024_11: 480MB
# conversation_message_2024_10: 520MB
# ... (roughly equal distribution)

# 2. Check for missing partitions
# Should have partition for next 2 months

# Expected partitions: Previous 24 months + next 2 months

# 3. If partition is very large (>800MB)
# May need to switch to smaller partition window (daily instead of monthly)
# Document for future optimization

# 4. Check auto-partition creation is working
# Look for most recent partition creation timestamp
SELECT max(create_time) FROM pg_stat_user_tables
WHERE relname LIKE 'conversation_message_%';

# Should be recent (within 24 hours of month-end)
```

**Healthy Status**:
- ✅ Partitions roughly equal size (±10%)
- ✅ No missing partitions
- ✅ Auto-partition created for next month
- ✅ Largest partition < 1GB

---

### RB-18: Archive Old Partition to S3

**When**: Monthly, for partitions >12 months old
**Duration**: 30-60 minutes (depending on partition size)
**Owner**: DBA + DevOps

**Steps**:
```bash
# 1. Identify partition to archive
# Example: conversation_message_2023_12 (now > 12 months old)

# 2. Export partition to CSV
psql -U postgres -h postgres-primary.internal -d ywmessaging \
  -c "COPY (SELECT * FROM conversation_message_2023_12) TO STDOUT" \
  | gzip > conversation_message_2023_12.csv.gz

# File size: Usually 50-200MB compressed

# 3. Upload to S3
aws s3 cp conversation_message_2023_12.csv.gz \
  s3://ywmessaging-backup/partitions/conversation_message_2023_12.csv.gz \
  --sse AES256

# 4. Verify upload
aws s3 ls s3://ywmessaging-backup/partitions/ | grep 2023_12

# 5. Delete partition from database
# (Do NOT do this until backup is confirmed in S3)
psql -U postgres -h postgres-primary.internal -d ywmessaging -c "
  DROP TABLE conversation_message_2023_12;
"

# This frees up ~100-200MB disk space

# 6. Log the archival
# File: /var/log/db-archival.log
# Entry: "2024-12-02 15:30: Archived conversation_message_2023_12, freed 150MB"
```

**Verify Archival**:
```bash
# Confirm partition is gone
psql -U postgres -h postgres-primary.internal -d ywmessaging -c "
  SELECT count(*) FROM pg_tables
  WHERE tablename = 'conversation_message_2023_12';
"

# Should return: 0

# Confirm backup is in S3
aws s3 ls s3://ywmessaging-backup/partitions/conversation_message_2023_12.csv.gz

# Should return file with size > 0
```

---

### RB-19: Restore Archived Partition (if needed)

**When**: Need to access archived data
**Duration**: 30-60 minutes
**Owner**: DBA

**Steps**:
```bash
# 1. Download partition from S3
aws s3 cp \
  s3://ywmessaging-backup/partitions/conversation_message_2023_12.csv.gz \
  conversation_message_2023_12.csv.gz

# 2. Decompress
gunzip conversation_message_2023_12.csv.gz

# 3. Create table structure (must match original)
# Use table definition from schema backup

CREATE TABLE conversation_message_2023_12 (
  -- Schema here
  id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  -- ... other columns
);

# 4. Import data
psql -U postgres -h postgres-primary.internal -d ywmessaging \
  -c "COPY conversation_message_2023_12 FROM STDIN" \
  < conversation_message_2023_12.csv

# 5. Verify restore
SELECT COUNT(*) FROM conversation_message_2023_12;
# Should return original row count (~500K for month of data)

# 6. Re-partition if keeping in live database
# OR keep as read-only archive table
ALTER TABLE conversation_message_2023_12 SET (fillfactor = 100);
# This optimizes for read-only access
```

---

## Emergency Procedures

### RB-20: Emergency: Database Completely Down

**When**: Primary database is unresponsive
**Duration**: Depends on severity
**Owner**: DBA + On-Call Engineer

⚠️ **CRITICAL INCIDENT**

**Immediate Actions** (First 2 minutes):
```bash
# 1. Declare incident
# Notify #incident-response Slack channel
# Page on-call DBA immediately

# 2. Check if database is actually down
ping -c 3 postgres-primary.internal
psql -h postgres-primary.internal -U postgres -c "SELECT 1;"

# 3. If unreachable:
# Option A: Check physical server status
# Option B: Check network connectivity
# Option C: Try read replica as fallback
psql -h replica-1.internal -U postgres -c "SELECT 1;"

# 4. If replica is up:
# Promote replica to primary (see RB-2)
# THIS CAUSES FAILOVER, DECISION REQUIRED

# 5. If no replicas:
# Attempt database recovery
sudo systemctl restart postgresql
# Wait 2-3 minutes for startup

# Check logs for issues
sudo tail -100 /var/log/postgresql/postgresql.log
```

**Recovery Actions** (Next 10 minutes):
```bash
# If restart succeeded:
# 1. Run health check
curl https://api.ywmessaging.com/health

# If still failing:
# 2. Check disk space
df -h /var/lib/postgresql

# If disk full:
# Clear cache/logs to free space
sudo journalctl --vacuum=500M

# 3. Restart again
sudo systemctl restart postgresql

# 4. Monitor startup
watch -n 5 'sudo systemctl status postgresql'
```

**If Recovery Fails** (> 15 minutes):
```bash
# 1. Activate Disaster Recovery Plan
# - Failover to replica
# - Or restore from backup

# 2. Restore from S3 backup (4-6 hour operation)
# See backup restoration documentation

# 3. Notify customers
# Prepare status page update

# 4. Post-Incident
# Schedule post-mortem within 24 hours
# Plan preventive measures
```

---

### RB-21: Emergency: Connection Pool Exhausted

**When**: 429 Too Many Requests errors or clients unable to connect
**Duration**: 5-10 minutes
**Owner**: DevOps Engineer

**Symptoms**:
- Response times: 30000ms+ (timeout)
- Error: "could not translate host name"
- PgBouncer: cl_waiting > 100

**Immediate Actions**:
```bash
# 1. Check pool status
psql -U pgbouncer -d pgbouncer -c "SHOW pools;"

# 2. Check waiting clients
psql -U pgbouncer -d pgbouncer -c "SHOW clients;" | grep waiting | wc -l

# 3. Kill long-running queries
psql -U postgres -h postgres-primary.internal -d ywmessaging -c "
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity
  WHERE state != 'idle' AND query_start < NOW() - INTERVAL '5 minutes';"

# 4. If still exhausted, restart PgBouncer
sudo systemctl restart pgbouncer
# This clears all pooled connections
# Downtime: ~1-2 seconds

# 5. Monitor recovery
watch -n 2 'psql -U pgbouncer -d pgbouncer -c "SHOW pools;"'

# Expected: cl_waiting back to 0 within 30 seconds
```

---

### RB-22: Emergency: Replica Replication Failure

**When**: Replica shows "streaming" as false or lag is > 1 minute
**Duration**: 15-30 minutes to resolve
**Owner**: DBA

**Diagnosis**:
```bash
# 1. Check replication status
psql -U postgres -h postgres-primary.internal -d ywmessaging -c "
  SELECT * FROM pg_stat_replication WHERE slot_name = 'replica_1_slot';"

# If shows: state = 'catchup'
# Replica is catching up from lag, might recover

# If shows: (nothing returned)
# Replication connection lost, needs immediate action

# 2. Check replica PostgreSQL log
ssh replica-1.internal
sudo tail -50 /var/log/postgresql/postgresql.log | grep ERROR

# Look for messages like:
# - "could not connect to replication server"
# - "WAL streaming stopped"
# - "Network error"
```

**Recovery**:
```bash
# Option 1: If network issue
# Restart replica PostgreSQL
sudo systemctl restart postgresql

# Option 2: If connection issue
# Restart replication connection
psql -U postgres -h postgres-primary.internal
SELECT pg_drop_replication_slot('replica_1_slot');
SELECT pg_create_physical_replication_slot('replica_1_slot');

# Then rebuild replica (see RB-3)

# Option 3: If WAL files deleted
# Do full re-sync from primary (see RB-3)
```

---

## Health Check Interpretation

### RB-23: Understand /health/detailed Endpoint

**When**: Troubleshooting cluster health
**Duration**: 5 minutes
**Owner**: DevOps Engineer

**Check endpoint**:
```bash
curl -s https://api.ywmessaging.com/health/detailed | jq

# Response format:
{
  "status": "healthy",
  "timestamp": "2024-12-02T16:30:00Z",
  "services": {
    "database": {
      "status": "healthy",
      "primary": { "connected": true, "latency": 15 },
      "replicas": [
        { "name": "replica-1", "connected": true, "lag": 500 },
        { "name": "replica-2", "connected": true, "lag": 600 }
      ]
    },
    "redis": {
      "status": "healthy",
      "memory": "45MB",
      "keyspace": "12345 keys",
      "evictions": 0
    },
    "pgbouncer": {
      "status": "healthy",
      "active_connections": 45,
      "waiting_clients": 0
    },
    "queries": {
      "status": "healthy",
      "p95_latency": 250,
      "slow_query_percentage": 2.5
    }
  }
}
```

**Interpretation**:

| Field | Healthy | Warning | Critical |
|-------|---------|---------|----------|
| database.primary.connected | true | N/A | false |
| database.replicas[].lag | < 1s | 1-5s | > 5s |
| redis.memory | < 100MB | 100-500MB | > 500MB |
| redis.evictions | 0 | > 0 | > 10000 |
| pgbouncer.waiting_clients | 0 | > 0 | > 10 |
| queries.p95_latency | < 300ms | 300-600ms | > 600ms |
| queries.slow_query_percentage | < 5% | 5-10% | > 10% |

**Action Based on Status**:

```
Status = "healthy" → No action needed
Status = "degraded" → Monitor closely, investigate trending
Status = "unhealthy" → ALARM, page on-call immediately
```

---

## Runbook Index

| RB # | Title | Owner | Duration |
|------|-------|-------|----------|
| RB-1 | Daily Read Replica Health Check | DevOps | 5 min |
| RB-2 | Manual Failover to Secondary | DBA | 5 min |
| RB-3 | Rebuild Failed Read Replica | DBA | 15-30 min |
| RB-4 | Read Replica Failover Test | DevOps+DBA | 30 min |
| RB-5 | Check Pool Status | DevOps | 5 min |
| RB-6 | Increase Connection Pool Size | DevOps | 10 min |
| RB-7 | Detect Connection Leaks | DBA+Backend | 30 min |
| RB-8 | Check Slow Queries | Backend/DBA | 10 min |
| RB-9 | Create Index for Slow Query | DBA | 5-60 min |
| RB-10 | Performance Before/After | Backend | 30 min |
| RB-11 | Check Cache Hit Rate | Backend | 5 min |
| RB-12 | Debug Cache Issues | Backend | 15 min |
| RB-13 | Clear Cache Safely | DevOps | 5 min |
| RB-14 | Check Rate Limit Status | Support | 5 min |
| RB-15 | Adjust Rate Limit | DevOps | 5 min |
| RB-16 | Investigate Rate Limit Abuse | Backend+Security | 30 min |
| RB-17 | Monitor Partition Health | DBA | 10 min |
| RB-18 | Archive Old Partition | DBA+DevOps | 30-60 min |
| RB-19 | Restore Archived Partition | DBA | 30-60 min |
| RB-20 | Emergency: Database Down | DBA+OnCall | Variable |
| RB-21 | Emergency: Pool Exhausted | DevOps | 5-10 min |
| RB-22 | Emergency: Replica Failure | DBA | 15-30 min |
| RB-23 | Understand Health Endpoint | DevOps | 5 min |

---

**Document Version**: 1.0
**Last Updated**: December 2, 2024
**Status**: READY FOR PRODUCTION ✅

**Important**: Before using any runbook, ensure you have:
- [ ] Proper database access credentials
- [ ] Authorization to make changes
- [ ] Backup of critical data
- [ ] On-call team notification (for critical procedures)
- [ ] Monitoring dashboard ready
