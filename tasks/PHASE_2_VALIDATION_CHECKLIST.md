# Phase 2 Post-Deployment Validation Checklist

**Project**: YWMESSAGING SaaS Platform
**Purpose**: Verify Phase 2 features are working correctly after each weekly deployment
**Audience**: DevOps Engineers, QA Team, Engineering Lead

---

## Week 1-2 Validation: Logging & Monitoring Foundation

**Deployment Window**: Monday-Friday, Week 1-2
**Validation Window**: Friday EOD - Monday AM, Week 2-3
**Owner**: DevOps + Backend Engineer
**Expected Time**: 30 minutes

### Pre-Deployment Baseline (Friday AM before deployment)

Measure these metrics **BEFORE** deploying Week 1-2:

```bash
# 1. CPU usage on primary database
# Record: current CPU %
# Command:
watch -n 1 'top -b -n 1 | grep postgres | head -5'
# Baseline: [___]%

# 2. Memory usage
# Command:
free -h | grep Mem
# Baseline: [___]MB used

# 3. Response latency (p95)
# Command:
curl -s https://api.ywmessaging.com/metrics/queries | jq '.statistics.p95'
# Baseline: [___]ms

# 4. Error rate
# Command:
tail -100 /var/log/application.log | grep ERROR | wc -l
# Baseline: [___] errors per 100 lines
```

### Post-Deployment Validation Checklist

- [ ] **Application Deployment Successful**
  ```bash
  # 1. Check application is running
  curl -s https://api.ywmessaging.com/health
  # Expected: 200 OK, status: healthy

  # 2. Check application version includes Winston logging
  curl -s https://api.ywmessaging.com/version
  # Expected: version includes "phase2" or current date

  # 3. No critical errors in logs
  tail -20 /var/log/application.log | grep CRITICAL
  # Expected: No output
  ```

- [ ] **Structured Logging Enabled**
  ```bash
  # 1. Check logs are JSON formatted
  tail -5 /var/log/application.log | jq
  # Expected: Valid JSON output (not plain text)

  # 2. Verify correlation IDs are present
  tail -10 /var/log/application.log | grep -i "correlation"
  # Expected: Every log entry has correlationId

  # 3. Verify sensitive data is masked
  tail -100 /var/log/application.log | grep -i "password\|token\|apikey"
  # Expected: No actual passwords/tokens in logs (should be masked)
  ```

- [ ] **Query Monitoring Active**
  ```bash
  # 1. Check metrics endpoint is available
  curl -s https://api.ywmessaging.com/metrics/queries | jq
  # Expected: Returns JSON with statistics, slowQueries, health

  # 2. Verify queries are being tracked
  curl -s https://api.ywmessaging.com/metrics/queries | jq '.statistics.total_queries'
  # Expected: > 0 (queries have been tracked)

  # 3. Check health status
  curl -s https://api.ywmessaging.com/metrics/queries | jq '.health'
  # Expected: "healthy" or "degraded" (not missing)
  ```

- [ ] **APM Integration Active** (if Datadog configured)
  ```bash
  # 1. Check Datadog agent is running
  datadog-agent status
  # Expected: "Agent (v7.x.x) is running"

  # 2. Verify traces are being sent
  # In Datadog UI, check:
  # - APM > Services showing "ywmessaging-api"
  # - Service showing traces from last 5 minutes
  # Expected: Active traces visible
  ```

- [ ] **Performance Not Degraded**
  ```bash
  # 1. CPU usage on primary (compare to baseline)
  watch -n 1 'top -b -n 1 | grep postgres | head -5'
  # Expected: Within 5% of baseline (logging overhead minimal)

  # 2. Memory usage (compare to baseline)
  free -h | grep Mem
  # Expected: Within 50MB of baseline

  # 3. Response latency (compare to baseline)
  curl -s https://api.ywmessaging.com/metrics/queries | jq '.statistics.p95'
  # Expected: Within 10% of baseline (±25ms typical)

  # 4. Error rate (compare to baseline)
  tail -100 /var/log/application.log | grep ERROR | wc -l
  # Expected: Similar to baseline (no new errors from logging)
  ```

- [ ] **Application Features Working**
  ```bash
  # 1. Test core APIs
  # Login:
  curl -X POST https://api.ywmessaging.com/auth/login \
    -d '{"email":"test@test.com","password":"test"}' \
    -H "Content-Type: application/json"
  # Expected: 200 or 401 (not 500)

  # 2. Test message sending
  curl -X POST https://api.ywmessaging.com/api/messages \
    -d '{"to":"1234567890","body":"test"}' \
    -H "Authorization: Bearer [token]" \
    -H "Content-Type: application/json"
  # Expected: 200 or 400 (not 500)

  # 3. Test dashboard loading
  curl -s https://ywmessaging.com/dashboard | grep -q "dashboard"
  # Expected: HTML contains "dashboard"
  ```

- [ ] **Backward Compatibility Verified**
  ```bash
  # 1. Old API endpoints still work
  curl -s https://api.ywmessaging.com/api/v1/users | jq
  # Expected: Returns valid JSON (not 404 or 500)

  # 2. Database queries still functional
  # Check critical tables
  psql -h primary -U postgres -d ywmessaging -c "SELECT COUNT(*) FROM users;"
  # Expected: Returns row count without error
  ```

### Issues Found?

| Issue | Action |
|-------|--------|
| Logging not working | Check logger.ts is imported in app.ts, verify env var LOGGING_ENABLED=true |
| APM not sending data | Check Datadog agent is running and API key is set |
| Performance degraded | Reduce logging verbosity, disable debug-level logging in production |
| Errors in application.log | Check error logs for specific issues, may need to adjust logging configuration |

### Sign-Off

- [ ] **DevOps Engineer** verified all infrastructure checks: ______ Time: ______
- [ ] **Backend Engineer** verified all feature checks: ______ Time: ______
- [ ] **Engineering Lead** approved: ______ Time: ______

---

## Week 3-4 Validation: Read Replicas Deployment

**Deployment Window**: Monday-Friday, Week 3-4
**Validation Window**: Same day + 24 hour monitoring
**Owner**: DBA + DevOps
**Expected Time**: 45 minutes (initial) + 24h monitoring

### Pre-Deployment Baseline (Thursday before deployment)

```bash
# 1. Baseline query latency
curl -s https://api.ywmessaging.com/metrics/queries | jq '.statistics | {p50, p95, p99}'
# Record: {p50: ___ms, p95: ___ms, p99: ___ms}

# 2. Baseline connection count
psql -U postgres -h primary -d ywmessaging -c "
  SELECT count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"
# Record: ___ connections

# 3. Baseline primary database load
watch -n 1 'top -b -n 1 | grep postgres | head -5'
# Record CPU: ___%
```

### Post-Deployment Validation Checklist

- [ ] **Replicas Are Connected**
  ```bash
  # 1. Check replication status on primary
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT slot_name, slot_type, active FROM pg_replication_slots;"
  # Expected: 2 rows, both active=true

  # 2. Verify data is being replicated
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT * FROM pg_stat_replication;"
  # Expected: 2 rows with state='streaming'

  # 3. Check replication lag
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT write_lag, flush_lag, replay_lag FROM pg_stat_replication;"
  # Expected: All < 1000ms (all three should be small)
  ```

- [ ] **Replicas Are Healthy**
  ```bash
  # 1. Can connect to replica-1
  psql -U postgres -h replica-1.internal -d ywmessaging -c "SELECT 1;"
  # Expected: 1 (success)

  # 2. Can connect to replica-2
  psql -U postgres -h replica-2.internal -d ywmessaging -c "SELECT 1;"
  # Expected: 1 (success)

  # 3. Data is consistent
  # Run on both replica and primary, compare:
  psql -U postgres -h primary -d ywmessaging -c "SELECT COUNT(*) FROM users;"
  psql -U postgres -h replica-1.internal -d ywmessaging -c "SELECT COUNT(*) FROM users;"
  # Expected: Counts match within 1 second
  ```

- [ ] **Read Routing Working**
  ```bash
  # 1. Check application is routing reads to replicas
  # Monitor query logs on replicas for SELECT statements
  ssh replica-1.internal
  tail -20 /var/log/postgresql/postgresql.log | grep SELECT
  # Expected: See SELECT queries being executed

  # 2. Verify primary sees WRITE operations
  ssh primary
  tail -20 /var/log/postgresql/postgresql.log | grep INSERT
  # Expected: See INSERT/UPDATE/DELETE operations
  ```

- [ ] **Performance Improved**
  ```bash
  # 1. Query latency improved (compare to baseline)
  curl -s https://api.ywmessaging.com/metrics/queries | jq '.statistics | {p50, p95, p99}'
  # Expected: No change in p95/p99 (reads go to replicas, not primary)
  # Network latency added: ~5-15ms (replica in same region)

  # 2. Primary load decreased (compare to baseline)
  # SSH to primary
  watch -n 1 'top -b -n 1 | grep postgres | head -5'
  # Expected: CPU % decreased 20-40% (reads offloaded)

  # 3. Connection count on primary decreased
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"
  # Expected: Decreased by 20-40% (read connections on replicas)
  ```

- [ ] **Failover Behavior Tested**
  ```bash
  # 1. Simulate replica failure
  # SSH to replica-1
  sudo systemctl stop postgresql

  # 2. App should still work (failover to primary or other replica)
  curl -s https://api.ywmessaging.com/health
  # Expected: 200 OK (no downtime)

  # 3. Verify app is still responsive
  curl -s https://api.ywmessaging.com/api/v1/users | jq | head -5
  # Expected: Valid JSON response

  # 4. Restart replica
  sudo systemctl start postgresql

  # 5. Verify recovery
  # Wait 30 seconds
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT * FROM pg_stat_replication WHERE slot_name LIKE 'replica_1%';"
  # Expected: state='streaming' (replication re-established)
  ```

- [ ] **Health Check Reflects Status**
  ```bash
  # 1. Check detailed health
  curl -s https://api.ywmessaging.com/health/detailed | jq '.services.database.replicas'
  # Expected: Shows both replicas as connected with lag < 1000ms

  # 2. When replica is down
  # Stop one replica, check health
  curl -s https://api.ywmessaging.com/health/detailed | jq '.status'
  # Expected: "degraded" (if one replica down, still healthy overall)
  ```

### Issues Found?

| Issue | Action |
|-------|--------|
| Replicas not streaming | Check network connectivity, verify WAL archiving, rebuild replica (RB-3) |
| High replication lag | Check network, check replica resources, consider reducing write load |
| Reads still going to primary | Check replica routing middleware is enabled, verify pool is using replicas |
| Failover taking too long | Check health check interval (should be 30s), verify timeout settings |

### 24-Hour Post-Deployment Monitoring

After initial validation, monitor for 24 hours:

```bash
# Every 4 hours, verify:
# 1. Replication lag < 1000ms
psql -U postgres -h primary -d ywmessaging -c "
  SELECT max(replay_lag) FROM pg_stat_replication;"

# 2. No errors in replication
tail -50 /var/log/postgresql/postgresql.log | grep -i error

# 3. Application error rate stable
curl -s https://api.ywmessaging.com/metrics/errors | jq '.error_rate'
```

### Sign-Off

- [ ] **DBA** verified replication: ______ Time: ______
- [ ] **DevOps** verified routing and failover: ______ Time: ______
- [ ] **24-hour monitoring** completed without issues: ______ Time: ______
- [ ] **Engineering Lead** approved: ______ Time: ______

---

## Week 5-6 Validation: PgBouncer Connection Pooling

**Deployment Window**: Wednesday-Thursday, Week 5-6
**Validation Window**: Same day + 24 hour monitoring
**Owner**: DevOps + DBA
**Expected Time**: 45 minutes (initial) + 24h monitoring

### Pre-Deployment Baseline (Tuesday before deployment)

```bash
# 1. Direct connection count (before PgBouncer)
psql -U postgres -h primary -d ywmessaging -c "
  SELECT count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"
# Record: ___ connections

# 2. Connection setup time (measure 10 connections)
time for i in {1..10}; do
  psql -U postgres -h primary -d ywmessaging -c "SELECT 1;" > /dev/null
done
# Record total time: ___ seconds
# Per-connection: ___ ms average

# 3. Query throughput (count queries per minute)
psql -U postgres -h primary -d ywmessaging -c "
  SELECT extract(epoch from (now() - pg_postmaster_start_time())) as uptime_seconds,
         count(*) as total_queries
  FROM pg_stat_statements;"
# Record QPS: ___ queries/second
```

### Post-Deployment Validation Checklist

- [ ] **PgBouncer Is Running**
  ```bash
  # 1. Check PgBouncer is running
  systemctl status pgbouncer
  # Expected: active (running)

  # 2. Can connect to PgBouncer
  psql -U pgbouncer -d pgbouncer -h localhost -p 6432
  # Expected: psql connects successfully

  # 3. Check pool configuration
  psql -U pgbouncer -d pgbouncer -c "SHOW config;" | grep pool_mode
  # Expected: pool_mode = transaction
  ```

- [ ] **Connection Pooling Working**
  ```bash
  # 1. Check pool status
  psql -U pgbouncer -d pgbouncer -c "SHOW pools;"
  # Expected output:
  # database    | user       | cl_active | cl_waiting | sv_active | sv_idle
  # ywmessaging | app_user   | 30-50     | 0          | 30-50     | 5-15

  # 2. Verify no waiting clients
  psql -U pgbouncer -d pgbouncer -c "SHOW pools;" | grep cl_waiting
  # Expected: 0 (no clients waiting)

  # 3. Check connection count on actual database
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"
  # Expected: 30-50 (matches PgBouncer pool size, NOT hundreds)
  ```

- [ ] **Performance Improved**
  ```bash
  # 1. Connection setup time (compare to baseline)
  time for i in {1..10}; do
    psql -U postgres -h localhost -p 6432 -U pguser -d ywmessaging -c "SELECT 1;" > /dev/null
  done
  # Expected: Total time reduced by 95%
  # Baseline was: ~100ms per connection (1000ms total)
  # After PgBouncer: ~1-5ms per connection (10-50ms total)

  # 2. Query throughput increased
  # Measure same query repeated:
  time for i in {1..1000}; do
    psql -U postgres -h localhost -p 6432 -U pguser -d ywmessaging -c "SELECT 1;" > /dev/null
  done
  # Expected: Significantly faster than direct connections

  # 3. Primary database load decreased
  watch -n 1 'top -b -n 1 | grep postgres | head -5'
  # Expected: CPU reduced due to lower connection overhead
  ```

- [ ] **Application Works with PgBouncer**
  ```bash
  # 1. Test core API still works
  curl -s https://api.ywmessaging.com/health
  # Expected: 200 OK

  # 2. Database queries functional
  curl -s https://api.ywmessaging.com/api/v1/users | jq | head -5
  # Expected: Valid JSON response

  # 3. No connection timeout errors
  tail -100 /var/log/application.log | grep -i "connection\|timeout"
  # Expected: No timeout errors
  ```

- [ ] **PgBouncer Statistics Healthy**
  ```bash
  # 1. Check server connections detail
  psql -U pgbouncer -d pgbouncer -c "SHOW servers;"
  # Expected:
  # - state: 'active' or 'idle'
  # - connect_time: Recent (within last hour)
  # - No disconnected servers

  # 2. Monitor connection errors
  psql -U pgbouncer -d pgbouncer -c "SHOW clients;" | grep -i error
  # Expected: No error entries

  # 3. Check stats (if stats available)
  # Average request time should be low
  # Eviction rate should be 0
  ```

- [ ] **Failover Behavior**
  ```bash
  # 1. Stop primary database
  ssh primary
  sudo systemctl stop postgresql

  # 2. Application attempts should fail gracefully
  curl -s https://api.ywmessaging.com/health
  # Expected: Eventually 500 (database unreachable)
  # Should NOT hang for > 30 seconds

  # 3. Restart primary
  sudo systemctl start postgresql

  # 4. Verify PgBouncer reconnects
  # Wait 10 seconds
  psql -U pgbouncer -d pgbouncer -c "SHOW servers;"
  # Expected: state back to 'active'
  ```

### Issues Found?

| Issue | Action |
|-------|--------|
| Connection pool exhausted (cl_waiting > 0) | Increase pool_size in pgbouncer.ini (RB-6) |
| Application connects to wrong database | Verify pgbouncer.ini mapping, check connection string in app |
| Timeout errors in logs | Increase server_idle_timeout, check for long-running queries |
| Performance not improved | Verify pool_mode=transaction, check reserve_pool_size |

### 24-Hour Post-Deployment Monitoring

```bash
# Monitor PgBouncer health every 4 hours:
psql -U pgbouncer -d pgbouncer -c "
  SELECT
    sum(cl_active) as total_active,
    sum(cl_waiting) as total_waiting,
    sum(sv_active) as total_servers,
    max(cast(extracted['bytes_sent'] as int)) as max_bytes
  FROM (
    SELECT extract(database FROM poolname)::text as database,
           cl_active, cl_waiting, sv_active,
           null::text as extracted
    FROM pgbouncer.SHOW pools
  ) subquery;"
```

### Sign-Off

- [ ] **DevOps** verified PgBouncer setup: ______ Time: ______
- [ ] **DBA** verified connection pooling: ______ Time: ______
- [ ] **24-hour monitoring** completed without issues: ______ Time: ______
- [ ] **Engineering Lead** approved: ______ Time: ______

---

## Week 7 Validation: Redis Caching & Rate Limiting

**Deployment Window**: Monday-Friday, Week 7
**Validation Window**: Same day + 24 hour monitoring
**Owner**: Backend Engineer + DevOps
**Expected Time**: 45 minutes (initial) + 24h monitoring

### Pre-Deployment Baseline

```bash
# 1. Database query count (baseline load)
psql -U postgres -h primary -d ywmessaging -c "
  SELECT count(*) as total_queries
  FROM pg_stat_statements
  WHERE query NOT LIKE '%pg_stat%';"
# Record: ___ queries

# 2. Query latency (p95)
curl -s https://api.ywmessaging.com/metrics/queries | jq '.statistics.p95'
# Record: ___ms

# 3. Error rate from rate limiting
tail -1000 /var/log/application.log | grep "Too Many Requests" | wc -l
# Record: ___ errors
```

### Post-Deployment Validation Checklist

- [ ] **Redis Connection Working**
  ```bash
  # 1. Check Redis is available
  redis-cli PING
  # Expected: PONG

  # 2. Check Redis memory usage
  redis-cli INFO memory | grep used_memory_human
  # Expected: Used memory < 100MB

  # 3. Check no connection errors
  tail -20 /var/log/application.log | grep -i "redis\|cache"
  # Expected: No error messages
  ```

- [ ] **Cache Warming Completed**
  ```bash
  # 1. Check cache keys were created
  redis-cli --scan --pattern "*" | wc -l
  # Expected: > 100 keys (should have warmed on startup)

  # 2. Verify specific cache keys exist
  redis-cli --scan --pattern "users:*" | head -5
  # Expected: See user cache keys

  # 3. Check cache warming duration (in logs)
  tail -100 /var/log/application.log | grep -i "cache warming"
  # Expected: "Cache warming completed in Xms"
  ```

- [ ] **Cache Hit Rate Healthy**
  ```bash
  # 1. Check cache hit rate
  redis-cli INFO stats | grep keyspace
  # Calculate: hits / (hits + misses) * 100
  # Expected: > 70% hit rate

  # 2. Monitor hit rate over time
  # Check every 5 minutes for first 30 minutes
  redis-cli INFO stats | grep keyspace
  # Expected: Hit rate increases toward 70-90%
  ```

- [ ] **Rate Limiting Active**
  ```bash
  # 1. Check rate limit middleware is working
  # Make rapid requests
  for i in {1..120}; do
    curl -s -o /dev/null -w "%{http_code}" https://api.ywmessaging.com/api/test
  done
  # Expected: Mostly 200s, then 429s when limit exceeded

  # 2. Verify rate limit headers present
  curl -s -i https://api.ywmessaging.com/api/test | grep "X-RateLimit"
  # Expected: See X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

  # 3. Check rate limit errors logged appropriately
  tail -50 /var/log/application.log | grep "Rate limit"
  # Expected: No errors, just info/debug messages
  ```

- [ ] **Database Load Decreased**
  ```bash
  # 1. Compare query count (should be lower due to caching)
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT count(*) as total_queries
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%';"
  # Expected: Reduced by 30-50% from baseline

  # 2. Query latency stayed same or improved
  curl -s https://api.ywmessaging.com/metrics/queries | jq '.statistics.p95'
  # Expected: Similar to baseline (no degradation)

  # 3. Primary CPU usage lower
  watch -n 1 'top -b -n 1 | grep postgres | head -5'
  # Expected: CPU % reduced (fewer queries to execute)
  ```

- [ ] **Cache Invalidation Working**
  ```bash
  # 1. Verify cascade invalidation on data update
  # Create a new user via API
  curl -X POST https://api.ywmessaging.com/api/users \
    -d '{"name":"test","email":"test@test.com"}' \
    -H "Authorization: Bearer [token]"

  # 2. Check user cache was invalidated
  redis-cli GET "users:list:all"
  # Expected: nil (cache cleared after new user)

  # 3. Verify cache is re-populated on next request
  curl -s https://api.ywmessaging.com/api/users
  # Check cache was created again
  redis-cli EXISTS "users:list:all"
  # Expected: 1 (exists)
  ```

- [ ] **Per-Tier Rate Limits Enforced**
  ```bash
  # 1. Test free tier limit (10 req/min)
  # Use API key with free tier, send 12 requests
  for i in {1..12}; do
    curl -s -X GET https://api.ywmessaging.com/api/test \
      -H "X-API-Key: free_key_123" \
      -o /dev/null -w "%{http_code}"
  done
  # Expected: First 10 return 200, last 2 return 429

  # 2. Test professional tier (1000 req/min)
  # Use API key with professional tier, send 1002 requests
  # Expected: First 1000 return 200, last 2 return 429
  ```

### 24-Hour Post-Deployment Monitoring

```bash
# Monitor cache health every 2 hours:
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses|expired_keys"

# Monitor rate limiting every 4 hours:
curl -s https://api.ywmessaging.com/admin/rate-limit/analytics | jq '.blocked_count'
```

### Issues Found?

| Issue | Action |
|-------|--------|
| Cache not warming | Check cache warming configuration, verify Redis is accessible from app |
| Low hit rate | Check TTL values, increase cache warmup scope |
| Rate limiting too aggressive | Increase burst allowance, adjust tier limits |
| Cache invalidation not working | Check cascade invalidation setup, verify Redis patterns |

### Sign-Off

- [ ] **Backend Engineer** verified caching: ______ Time: ______
- [ ] **DevOps** verified rate limiting: ______ Time: ______
- [ ] **24-hour monitoring** completed without issues: ______ Time: ______
- [ ] **Engineering Lead** approved: ______ Time: ______

---

## Week 8 Validation: Table Partitioning (Critical)

**Deployment Window**: Saturday 2 AM - 6 AM (4-hour maintenance window)
**Validation Window**: Saturday 6 AM - Sunday 6 AM
**Owner**: DBA + DevOps + Engineering Lead
**Expected Time**: 2 hours initial + 24h continuous monitoring

⚠️ **CRITICAL**: This validation runs during maintenance window and immediately after

### Pre-Maintenance Baseline (Friday PM)

```bash
# 1. Record final pre-partition table sizes
psql -U postgres -h primary -d ywmessaging -c "
  SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
  FROM pg_tables
  WHERE tablename IN ('conversation_message', 'message', 'message_recipient', 'conversation')
  ORDER BY pg_total_relation_size DESC;"
# Record sizes for comparison

# 2. Baseline query times (critical queries)
# Test query from application
time psql -U postgres -h primary -d ywmessaging -c "
  SELECT * FROM conversation_message
  WHERE conversation_id = 'abc123'
  ORDER BY created_at DESC
  LIMIT 50;"
# Record time: ___ms

# 3. Backup full database
pg_dump -Fc -f backup-$(date +%Y%m%d).dump postgresql://...
# Verify file size: ___MB
```

### Post-Partitioning Validation Checklist

**Immediately After Switchover (First 30 minutes)**:

- [ ] **Application Is Up**
  ```bash
  # 1. Check HTTP 200 response
  curl -s -w "%{http_code}" https://api.ywmessaging.com/health
  # Expected: 200

  # 2. Check no SQL errors in logs
  tail -100 /var/log/application.log | grep -i "error\|exception"
  # Expected: No SQL-related errors

  # 3. Test key user flows
  # Login
  curl -X POST https://api.ywmessaging.com/auth/login ...
  # Expected: Works as before

  # Message loading
  curl -s https://api.ywmessaging.com/api/messages
  # Expected: Works as before
  ```

- [ ] **Partitioned Tables Created Correctly**
  ```bash
  # 1. Verify partition exists and is primary table
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT tablename FROM pg_tables
    WHERE tablename = 'conversation_message';"
  # Expected: conversation_message (parent partition table)

  # 2. Check all child partitions exist
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT tablename FROM pg_tables
    WHERE tablename LIKE 'conversation_message_%'
    ORDER BY tablename;"
  # Expected: 24-26 partitions (monthly for 24 months)
  # Example output:
  # conversation_message_2022_12
  # conversation_message_2023_01
  # ... (continuing monthly)
  # conversation_message_2024_12
  # conversation_message_2025_01
  # conversation_message_2025_02 (future)

  # 3. Verify row count matches
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT count(*) FROM conversation_message;"
  # Expected: Matches row count from before partitioning
  ```

- [ ] **Data Integrity Verified**
  ```bash
  # 1. Run data validation query
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT
      (SELECT count(*) FROM conversation_message) as total_rows,
      (SELECT count(DISTINCT id) FROM conversation_message) as distinct_ids,
      (SELECT count(*) FROM conversation_message WHERE id IS NULL) as null_ids;
    "
  # Expected: total_rows == distinct_ids, null_ids = 0

  # 2. Check specific conversation's messages (spot check)
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT count(*) FROM conversation_message
    WHERE conversation_id = 'abc123';"
  # Expected: Returns count without error

  # 3. Verify replicas also partitioned (if they exist)
  psql -U postgres -h replica-1.internal -d ywmessaging -c "
    SELECT count(DISTINCT tablename) FROM pg_tables
    WHERE tablename LIKE 'conversation_message_%';"
  # Expected: Same number of partitions as primary
  ```

- [ ] **Query Performance Improved**
  ```bash
  # 1. Re-run baseline query (compare to pre-partition time)
  time psql -U postgres -h primary -d ywmessaging -c "
    SELECT * FROM conversation_message
    WHERE conversation_id = 'abc123'
    ORDER BY created_at DESC
    LIMIT 50;"
  # Expected: 3-4x faster than before (850ms → 200ms)

  # 2. Run explain plan to verify partition pruning
  psql -U postgres -h primary -d ywmessaging -c "
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT * FROM conversation_message
    WHERE conversation_id = 'abc123'
      AND created_at > '2024-11-01'
    ORDER BY created_at DESC
    LIMIT 50;"
  # Expected: Shows "Partition Pruned X partitions"

  # 3. Test range queries (analytics use case)
  time psql -U postgres -h primary -d ywmessaging -c "
    SELECT date_trunc('day', created_at) as day, count(*) as count
    FROM conversation_message
    WHERE created_at > '2024-11-01' AND created_at < '2024-12-01'
    GROUP BY day;"
  # Expected: Much faster (seconds instead of minutes)
  ```

- [ ] **Indexes Created Successfully**
  ```bash
  # 1. Verify indexes exist on partitioned table
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'conversation_message'
    ORDER BY indexname;"
  # Expected: See indexes like:
  # - idx_conversation_message_conv_created
  # - idx_conversation_message_created

  # 2. Check index sizes
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT indexname, pg_size_pretty(pg_relation_size(indexrelid))
    FROM pg_stat_user_indexes
    WHERE relname = 'conversation_message';"
  # Expected: Indexes are smaller than before (due to partitioning)
  ```

- [ ] **Storage Savings Verified**
  ```bash
  # 1. Compare new partition table size vs old
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
    FROM pg_tables
    WHERE tablename IN ('conversation_message')
    ORDER BY pg_total_relation_size DESC;"
  # Expected: Same total size (no storage saved yet, will save on deletion)

  # 2. Check index sizes (should be smaller)
  # Before: ~5-10GB of indexes
  # After: ~2-3GB of indexes (60-80% savings on indexes)
  ```

**24-Hour Continuous Monitoring (Saturday 6 AM - Sunday 6 AM)**:

- [ ] **Hourly Application Health Check**
  ```bash
  # Every hour, verify:
  curl -s https://api.ywmessaging.com/health | jq '.status'
  # Expected: "healthy"

  # Record: Time, Status, Any errors
  ```

- [ ] **Query Performance Stable**
  ```bash
  # Every 4 hours, run performance tests
  # Load test with concurrent users (100+ simultaneous)
  ab -n 1000 -c 100 https://api.ywmessaging.com/api/messages

  # Expected:
  # - Requests per second: > 100
  # - Error rate: < 1%
  # - Avg response time: < 1000ms
  ```

- [ ] **No Slow Queries** Introduced
  ```bash
  # Every 4 hours, check metrics
  curl -s https://api.ywmessaging.com/metrics/queries | jq '.health'
  # Expected: "healthy" (not degraded)

  # Check slow query count
  curl -s https://api.ywmessaging.com/metrics/queries | jq '.slowQueries | length'
  # Expected: < 5
  ```

- [ ] **Replication Still Working** (if applicable)
  ```bash
  # Every 6 hours, verify replica lag
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT max(replay_lag) FROM pg_stat_replication;"
  # Expected: < 1000ms
  ```

- [ ] **Data Consistency Over Time**
  ```bash
  # Every 12 hours, run spot check
  psql -U postgres -h primary -d ywmessaging -c "
    SELECT count(*) FROM conversation_message;"
  # Should match previous count (no data loss)
  ```

### Issues Found During Maintenance?

| Issue | Action | Rollback |
|-------|--------|----------|
| Partitioning failed | Stop process immediately | Atomic rollback (RB-20) |
| Data didn't copy | Investigate copy process | Restore from backup |
| Old table still exists | Delete old table manually | (safe to delete) |
| Performance degraded | Re-create old index | Investigate query plan |
| Replicas out of sync | Rebuild replica | Full resync from primary |

### Rollback Procedure (If needed within 24 hours)

```bash
# Only if critical issues found:
BEGIN;
ALTER TABLE conversation_message RENAME TO conversation_message_new;
ALTER TABLE conversation_message_old RENAME TO conversation_message;
COMMIT;

# Downtime: < 1 second
# Verify application resumed normal operation
curl -s https://api.ywmessaging.com/health
```

### Sign-Off

- [ ] **DBA** verified partitioning success: ______ Time: ______
- [ ] **DevOps** verified no downtime/errors: ______ Time: ______
- [ ] **24-hour monitoring** completed successfully: ______ Time: ______
- [ ] **Engineering Lead** approved for permanent: ______ Time: ______

**Note**: If any critical issue found during 24-hour window, escalate to engineering lead immediately.

---

## Overall Phase 2 Deployment Sign-Off

After all 8 weeks completed:

- [ ] **All weeks 1-8 validations completed successfully**
- [ ] **No production incidents during rollout**
- [ ] **All performance targets achieved**:
  - Query latency improved 20-50%
  - Cache hit rate 70%+
  - Connection pool utilization 60-80%
  - Read throughput +100%
  - Error rate < 0.1%
- [ ] **Team trained on new systems**
- [ ] **Runbooks documented and tested**
- [ ] **Monitoring dashboards active**
- [ ] **On-call procedures in place**

### Final Sign-Off

- [ ] **VP Engineering**: ______ (Signature) Date: ______
- [ ] **CTO/Tech Lead**: ______ (Signature) Date: ______
- [ ] **Product Manager**: ______ (Signature) Date: ______

---

**Document Version**: 1.0
**Last Updated**: December 2, 2024
**Status**: READY FOR PHASE 2 DEPLOYMENT ✅

**Next Steps**: Print this checklist and keep it accessible during entire 8-week Phase 2 rollout. Update with actual results as each week completes.
