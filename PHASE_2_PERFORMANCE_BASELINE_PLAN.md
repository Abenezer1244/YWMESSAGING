# Phase 2 Performance Baseline & Benchmarking Plan

**Project**: YWMESSAGING SaaS Platform
**Purpose**: Establish performance metrics before Phase 2 deployment for before/after comparison
**Timeline**: 2 weeks (Week 0, before Phase 1 deployment)
**Owner**: Backend Engineer + DevOps
**Status**: READY FOR EXECUTION

---

## Executive Summary

To prove Phase 2 optimizations work, we must measure the current system thoroughly before deployment. This document defines:

1. **Current State Metrics** - What to measure NOW (before Phase 2)
2. **Measurement Procedures** - How to capture clean data
3. **Baseline Report** - What to record for comparison
4. **Success Thresholds** - What improvements count as "success"
5. **Capacity Analysis** - Growth headroom before scaling needed

---

## Part 1: Metrics to Measure

### 1.1 Database Performance

**Query Latency** (most critical)
```sql
-- Measure query response times across all queries
-- What to capture:
-- - p50, p90, p95, p99 percentiles
-- - Min, max, average
-- - By query type (SELECT, INSERT, UPDATE, DELETE)
-- - By table (users, conversations, messages, etc.)

-- Recording method:
-- Run 1000 representative queries, record execution time for each
-- Use EXPLAIN ANALYZE to understand query plans
```

**Specific Slow Queries**
```sql
-- Identify which queries are slowest
-- What to capture:
-- - Query text
-- - Execution time (current)
-- - Row count returned
-- - Index used (or full scan)

-- Commands:
SELECT query, mean_time, stddev_time, calls
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_time DESC
LIMIT 20;
```

**Connection Count**
```bash
# Current baseline
psql -h primary -U postgres -d ywmessaging -c "
  SELECT count(*) as active_connections
  FROM pg_stat_activity
  WHERE pid <> pg_backend_pid();"

# Record: ___ active connections (typical peak)
```

**Index Usage & Size**
```sql
-- Current index efficiency
SELECT
  schemaname, tablename, indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- What to record:
-- - Total index size: ___ GB
-- - Average scan efficiency
-- - Unused indexes (idx_scan = 0)
```

**Lock Contention**
```sql
-- Check for lock waits
SELECT
  locktype, database, relation::regclass,
  mode, granted, count(*) as count
FROM pg_locks
GROUP BY locktype, database, relation, mode, granted
HAVING count(*) > 1
ORDER BY count DESC;

-- What to record:
-- - Lock wait count
-- - Lock wait duration
-- - Most contended tables
```

### 1.2 Application Performance

**Request Latency** (end-to-end)
```bash
# Measure actual HTTP response time
# Method 1: Load test with ApacheBench
ab -n 1000 -c 10 https://api.ywmessaging.com/api/v1/users

# Method 2: Curl timing
curl -w "@curl-format.txt" -o /dev/null -s https://api.ywmessaging.com/api/v1/users
# Format: time_namelookup, time_connect, time_appconnect, time_pretransfer,
#         time_redirect, time_starttransfer, time_total

# What to record:
# - Response time: p50, p95, p99 (milliseconds)
# - Requests per second (throughput)
# - Success rate (% 200 responses)
```

**Error Rate**
```bash
# Current error frequency
tail -10000 /var/log/application.log | grep ERROR | wc -l
# Record: ___ errors per 10,000 logs

# By error type:
tail -10000 /var/log/application.log | grep ERROR | cut -d' ' -f1-3 | sort | uniq -c

# Critical errors (500s):
tail -10000 /var/log/application.log | grep "HTTP 500" | wc -l
# Record: ___ 500 errors
```

**Memory Usage**
```bash
# Application memory footprint
ps aux | grep "node\|java\|python" | grep -v grep
# Record:
# - RSS (resident memory): ___ MB
# - VSZ (virtual memory): ___ MB

# Memory over time (with sample)
# Run for 1 hour, record memory usage every 5 minutes
watch -n 300 'ps aux | grep [n]ode >> memory-baseline.log'
```

**CPU Usage**
```bash
# Current CPU load
top -b -n 1 | grep "Cpu(s)"
# Record: ___ % user, ___ % system, ___ % idle

# Peak CPU usage pattern:
# Monitor during typical business hours
# Record max CPU seen
```

### 1.3 Database Resource Usage

**Disk I/O**
```bash
# Current read/write volume
iostat -x 1 5
# What to record:
# - Reads per second: ___ IOPS
# - Writes per second: ___ IOPS
# - I/O utilization: ___ %

# Total database size
du -sh /var/lib/postgresql/
# Record: ___ GB
```

**Cache Effectiveness**
```sql
-- PostgreSQL buffer cache hit rate
SELECT
  sum(heap_blks_read) as disk_reads,
  sum(heap_blks_hit) as cache_hits,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_ratio
FROM pg_statio_user_tables;

-- What to record:
-- - Cache hit rate: ___%
-- - Disk reads: ___ per hour
-- - Cache hits: ___ per hour
```

**Active Connections Over Time**
```bash
# Capture connection pattern throughout day
# Every 5 minutes for 24 hours:
for i in {1..288}; do
  psql -h primary -U postgres -d ywmessaging -c \
    "SELECT now(), count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();" \
    >> connections-baseline.log
  sleep 300
done

# Record:
# - Minimum connections: ___
# - Average connections: ___
# - Peak connections: ___
# - Peak time: ___
```

### 1.4 Business Metrics

**Request Rate Over Time**
```bash
# Current traffic volume
# Analyze application logs
tail -100000 /var/log/application.log | \
  grep "HTTP" | \
  cut -d' ' -f1 | \
  cut -d'T' -f2 | \
  cut -d':' -f1 | \
  sort | uniq -c

# What to record:
# - Requests per minute (average): ___
# - Requests per minute (peak): ___
# - Peak hour: ___
```

**User Concurrency**
```bash
# Active users at any given time
# Infer from active sessions
psql -h primary -U postgres -d ywmessaging -c "
  SELECT count(DISTINCT user_id) as active_users
  FROM active_sessions
  WHERE created_at > now() - interval '5 minutes';"

# Record: ___ concurrent users
```

**Data Volume**
```sql
-- Current row counts
SELECT 'users' as table_name, count(*) as row_count FROM users
UNION ALL
SELECT 'conversations', count(*) FROM conversations
UNION ALL
SELECT 'messages', count(*) FROM messages
UNION ALL
SELECT 'conversation_messages', count(*) FROM conversation_message
UNION ALL
SELECT 'message_recipients', count(*) FROM message_recipient;

-- What to record (one row per table):
-- - users: ___
-- - conversations: ___
-- - messages: ___
-- - conversation_messages: ___
-- - message_recipients: ___
```

---

## Part 2: Measurement Procedures

### Procedure 1: Clean System Measurement

**Prerequisites**:
- Production database with 0 load (or minimum traffic)
- No batch jobs running
- Disk cache cleared
- All connections reset

**Steps**:

```bash
# 1. Clear disk cache (Linux, requires sudo)
# WARNING: This affects performance temporarily
sync
echo 3 > /proc/sys/vm/drop_caches

# 2. Reset PostgreSQL stats
psql -U postgres -h primary -d ywmessaging -c "
  SELECT pg_stat_statements_reset();"

# 3. Wait 30 seconds for system to stabilize
sleep 30

# 4. Run measurement query
# Record output to baseline.txt
psql -U postgres -h primary -d ywmessaging -c \
  "SELECT pg_stat_statements.query, mean_time, stddev_time, calls
   FROM pg_stat_statements
   WHERE query NOT LIKE '%pg_stat%'
   ORDER BY mean_time DESC LIMIT 50;" > baseline.txt

# 5. Restore normal operation (no further actions needed)
```

### Procedure 2: Representative Workload Test

**Purpose**: Measure system under typical load

**Setup**:
```bash
# 1. Create load test script (load-test.sh)
#!/bin/bash

# Simulate realistic traffic
for i in {1..100}; do
  # User list
  curl -s https://api.ywmessaging.com/api/v1/users > /dev/null &

  # Conversation list
  curl -s https://api.ywmessaging.com/api/v1/conversations > /dev/null &

  # Message fetch
  curl -s https://api.ywmessaging.com/api/v1/messages > /dev/null &

  # Dashboard (expensive query)
  curl -s https://api.ywmessaging.com/api/v1/analytics > /dev/null &

  wait
done

# 2. Run test and measure
time bash load-test.sh

# What to record:
# - Real time to complete: ___ seconds
# - Requests completed: ___
# - Requests per second: ___
# - Errors during test: ___
```

### Procedure 3: Peak Load Test

**Purpose**: Understand system behavior at peak capacity

**Setup**:
```bash
# Use Apache Bench for concurrent load
ab -n 10000 -c 100 https://api.ywmessaging.com/api/v1/users

# What to record:
# - Requests per second: ___
# - Min response time: ___ ms
# - Max response time: ___ ms
# - Mean response time: ___ ms
# - Failed requests: ___
# - 50% time: ___ ms
# - 95% time: ___ ms
# - 99% time: ___ ms
```

### Procedure 4: Sustained Load Test (1 hour)

**Purpose**: Measure system stability under sustained load

**Setup**:
```bash
# Measure for 1 hour with 10 concurrent users
for i in {1..3600}; do
  # Send 10 concurrent requests per second
  for j in {1..10}; do
    curl -s https://api.ywmessaging.com/api/v1/users > /dev/null &
  done

  # Wait 1 second for next batch
  sleep 1

  # Every 60 seconds, record metrics
  if [ $((i % 60)) -eq 0 ]; then
    echo "Time: $((i/60)) min" >> sustained-load.log
    psql -U postgres -h primary -d ywmessaging -c \
      "SELECT mean_time FROM pg_stat_statements
       WHERE query LIKE 'SELECT%users%' LIMIT 1;" >> sustained-load.log
    ps aux | grep node >> sustained-load.log
  fi
done

# What to record:
# - Query latency over time (should stay stable)
# - Memory usage growth (should be minimal)
# - Error rate (should be 0)
# - Requests completed: ___
```

---

## Part 3: Baseline Report Template

Create a file `PERFORMANCE_BASELINE.txt` with this structure:

```
=== YWMESSAGING PERFORMANCE BASELINE ===
Date: December 2, 2024
Measurement Duration: 2 weeks (Week 0, before Phase 2 deployment)
Environment: Production database (Read-only measurements, no load)

SECTION 1: DATABASE METRICS
===============================

Query Latency:
  p50:  ___ ms
  p90:  ___ ms
  p95:  ___ ms
  p99:  ___ ms

Slow Queries (top 5):
  1. [query name]      [execution time] ms
  2. [query name]      [execution time] ms
  3. [query name]      [execution time] ms
  4. [query name]      [execution time] ms
  5. [query name]      [execution time] ms

Connection Metrics:
  Active connections (baseline): ___ connections
  Active connections (peak):     ___ connections
  Connection setup time:         ___ ms
  Max allowed connections:       ___ (PostgreSQL max_connections setting)

Index Metrics:
  Total index size:     ___ GB
  Unused indexes:       ___ (idx_scan = 0)
  Largest index:        ___ (name)  [size: ___ GB]
  Cache hit rate:       ___%

Lock Contention:
  Lock waits per hour:  ___
  Most contended table: ___ (table_name)

SECTION 2: APPLICATION METRICS
================================

Request Latency (end-to-end):
  p50:  ___ ms
  p95:  ___ ms
  p99:  ___ ms

Error Rate:
  5XX errors per hour: ___
  Error rate: ___%

Memory Usage:
  Application RSS: ___ MB
  Application VSZ: ___ MB

CPU Usage:
  User CPU:   ___%
  System CPU: ___%
  Idle:       ___%

SECTION 3: INFRASTRUCTURE METRICS
==================================

Disk I/O:
  Read IOPS:      ___ ops/sec
  Write IOPS:     ___ ops/sec
  I/O util:       ___%
  Database size:  ___ GB

Network:
  Requests/sec:   ___ req/sec
  Peak requests:  ___ req/sec at ___:___ AM/PM
  Bandwidth peak: ___ MB/s

SECTION 4: BUSINESS METRICS
=============================

Data Volume:
  Users:                  ___ rows
  Conversations:          ___ rows
  Messages:               ___ rows
  Conversation messages:  ___ rows
  Message recipients:     ___ rows

Traffic Volume:
  Avg requests/min:  ___
  Peak requests/min: ___ (at ___:___ AM/PM)
  Concurrent users:  ___

SECTION 5: SYSTEM CAPACITY HEADROOM
====================================

Current Utilization:
  CPU:    __%
  Memory: __%
  Disk:   __%
  Connections: ___ / ___ (usage/limit)

Headroom Before Scaling Needed:
  CPU headroom:    ___ % until 80% utilization
  Memory headroom: ___ % until 80% utilization
  Query latency headroom: ___ ms until p95 > 500ms
  Connection headroom: ___ until max_connections

Growth Projection:
  At current growth rate of __% per month:
  - CPU max in ___ months
  - Memory max in ___ months
  - Connections max in ___ months
  - Storage max in ___ months

SECTION 6: COMPARISON TARGETS (PHASE 2)
=========================================

Expected Improvements After Phase 2:
  Query latency (p95):     ___ ms → 250 ms (-50%)
  Cache hit rate:          _% → 70% (+70%)
  Connection count:        ___ → <50 (-80%)
  Database load:           ___ → -30% (fewer queries)
  Error rate:              _% (should stay same)

Success Definition:
  - Query latency p95 improved 20-50%
  - Cache hit rate reaches 70%+
  - Connection count reduced 50%+
  - No increase in error rate
  - System stays within capacity

SECTION 7: SPECIFIC SLOW QUERIES TO OPTIMIZE
==============================================

Query 1: [ConversationMessage loading]
  Current: ___ ms
  Target after Phase 2: ___ ms
  Optimization: Table partitioning + caching
  Status: PENDING

Query 2: [Message delivery stats]
  Current: ___ ms
  Target: ___ ms
  Optimization: Query optimization + read replicas
  Status: PENDING

Query 3: [User conversation list]
  Current: ___ ms
  Target: ___ ms
  Optimization: Redis caching
  Status: PENDING

SECTION 8: MEASUREMENT NOTES
=============================

Assumptions:
- Production database with realistic data
- No load testing (clean measurements)
- Single connection per query
- Standard network latency (no congestion)
- All cache cold at start

Limitations:
- Does not reflect concurrent load
- Does not show query interactions
- Cold cache may not be realistic for sustained use

Caveats:
- [Any special circumstances during measurement]
- [Any known issues during baseline]
- [Any system changes that affect validity]

Measured By: ___________________
Date: ___________________
```

---

## Part 4: Success Thresholds

### Phase 2 Success Criteria

After Phase 2 is fully deployed (8 weeks), we measure:

```
METRIC                      | BEFORE | TARGET    | SUCCESS IF
---------------------------|--------|-----------|-------------------
Query latency p95           | ___ms  | -20-50%   | < 250ms AND -20%+
Cache hit rate              | ___% * | 70-90%    | > 70%
Connection count            | ___ *  | <50       | Reduced by 50%+
Database CPU load           | ___% * | -30%      | Down 20%+
Request error rate          | ___%   | <0.1%     | Same or lower
System capacity headroom    | ___% * | +30%      | More headroom
```

* = Measured during Phase 2 deployment

### Individual Week Targets

| Week | Component | Before | Target | Success |
|------|-----------|--------|--------|---------|
| 1-2 | Logging overhead | <5% | <2% | No degradation |
| 3-4 | Read latency | ___ms | Same | No increase |
| 5-6 | Connection setup | ___ms | <5ms | -95% |
| 7 | Cache hit rate | ___% | >70% | Improves over 24h |
| 8 | Query latency | ___ms | <200ms | -76% |

---

## Part 5: Capacity Analysis

### Calculate Current Headroom

```sql
-- Connection headroom
SELECT
  current_setting('max_connections')::int - count(*)
  as connections_remaining
FROM pg_stat_activity;
-- If < 50, connection pool may help significantly

-- Disk space headroom
SELECT
  pg_size_pretty(pg_tablespace_size('pg_default')) as used,
  -- Calculate remaining from mount point
  _calculate_disk_free() as remaining;
-- If < 20% free, may need cleanup or storage expansion

-- Query complexity headroom
SELECT count(*) as total_queries
FROM pg_stat_statements
WHERE mean_time > 100;  -- Slow queries
-- If > 50 slow queries, Phase 2 optimizations critical
```

### Growth Projections

Based on current data volume growth rate:

```
Assuming ___ rows/month growth in ConversationMessage table:
- Current size: ___ GB
- Projected in 6 months: ___ GB (growth: ___ GB)
- Projected in 12 months: ___ GB (growth: ___ GB)
- Query time impact: ___

Indexing will become problematic when:
- Table > ___ GB (index size > 10GB)
- Row count > ___ million (scan time > 1s)
- This will occur in approximately ___ months

Action: Table partitioning (Phase 2 Week 8) will address this.
```

---

## Part 6: Execution Timeline

### Week 1: Measurement Preparation

**Monday-Tuesday**:
- [ ] Set up measurement scripts
- [ ] Configure monitoring dashboards
- [ ] Create baseline report template
- [ ] Schedule measurement windows

**Wednesday-Friday**:
- [ ] Run clean system measurement (database metrics)
- [ ] Run representative workload test
- [ ] Capture 24-hour traffic pattern
- [ ] Document any issues

### Week 2: Analysis & Reporting

**Monday-Tuesday**:
- [ ] Analyze measurement results
- [ ] Compile baseline report
- [ ] Create before/after comparison template
- [ ] Identify critical slow queries

**Wednesday-Friday**:
- [ ] Present baseline to engineering team
- [ ] Get sign-off on targets
- [ ] Create Phase 2 success scorecard
- [ ] Finalize capacity projections

**Friday EOD**:
- [ ] Baseline locked in (no changes allowed)
- [ ] Phase 2 deployment can proceed next week

---

## Part 7: Baseline Sign-Off

**This baseline is locked in. Any changes to targets require re-measurement.**

```
Baseline Report Created: ___________________
Database State: ___________________
Measurement Duration: ___________________
Conditions: ___________________

Approved By:
  Backend Lead: __________________ (Date: ______)
  DevOps Lead: __________________ (Date: ______)
  Engineering Lead: __________________ (Date: ______)

Locked For Comparison:
  This baseline will be used for all Phase 2 before/after comparisons.
  No changes allowed after sign-off.

  Baseline Date: December 2, 2024
  Deployment Begins: December 9, 2024 (Week 1-2)
```

---

## Files to Generate

1. **PERFORMANCE_BASELINE.txt** - Filled in with actual measurements
2. **baseline-queries.sql** - SQL commands that were run
3. **baseline-scripts.sh** - Bash scripts used for measurement
4. **capacity-analysis.txt** - Growth projections and headroom
5. **slow-queries-report.txt** - Top 50 slowest queries from pg_stat_statements

---

## Next Steps

Once this baseline is complete:

1. **Week 1 Deployment begins** (per PHASE_2_DEPLOYMENT_PLAN.md)
2. **Each week measures same metrics** (see PHASE_2_VALIDATION_CHECKLIST.md)
3. **Week 9 compares to baseline** (calculate % improvements)
4. **Create success report** (document all improvements)

---

**Status**: READY FOR EXECUTION
**Prerequisites Completed**: Yes (Phase 2 code written, deployment plan created)
**Next Action**: Execute measurements in Week 0 (before Phase 2 deployment)
