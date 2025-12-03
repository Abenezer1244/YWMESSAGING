# Production Deployment Checklist

**System**: YWMESSAGING Backend API
**Last Updated**: December 2, 2024
**Audience**: DevOps, SRE, Engineering Leads

---

## Phase 0: Pre-Deployment Planning (2-3 days before)

### [ ] Team Preparation
- [ ] Assign on-call engineer for deployment window
- [ ] Brief the on-call engineer on changes being deployed
- [ ] Ensure SRE/DevOps team is available (minimum 2 people)
- [ ] Set up communication channel (Slack #incident-response)
- [ ] Review rollback procedures and test in staging

### [ ] Stakeholder Communication
- [ ] Notify customer success team of deployment window
- [ ] If major changes: notify support team and create support docs
- [ ] Prepare status page update (maintenance window notification)
- [ ] Have incident response contacts ready (list at bottom of document)

### [ ] Final Code Review
- [ ] All PRs merged to main have 2 approvals
- [ ] Security review completed for auth/payment changes
- [ ] Performance review completed for database/API changes
- [ ] All tests passing in CI/CD pipeline
- [ ] Code coverage maintained at >85% for critical paths

---

## Phase 1: Pre-Deployment Verification (1 hour before)

### [ ] Staging Environment Validation
- [ ] Run full test suite: `npm run test:coverage`
- [ ] Build completes without errors: `npm run build`
- [ ] E2E tests pass in staging: `npm run test:e2e`
- [ ] Load test baseline achieved: `npm run loadtest:smoke`
- [ ] No TypeScript compilation errors
- [ ] No ESLint/formatting errors

### [ ] Database Readiness
- [ ] Database backups completed and verified
- [ ] Database migrations tested in staging environment
- [ ] Database connection string validated (non-production verified in env)
- [ ] Database user permissions reviewed
- [ ] Disk space available: >10GB free on database server

### [ ] Infrastructure Readiness
- [ ] All servers healthy and ready
- [ ] Load balancer tested and responding
- [ ] SSL certificates valid (not expiring within 30 days)
- [ ] DNS records point to correct servers (verified in staging first)
- [ ] CDN cache cleared for asset files
- [ ] All secrets/credentials available in production environment

### [ ] Monitoring & Alerting
- [ ] APM (Datadog) dashboards loaded and verified
- [ ] Alert thresholds configured:
  - [ ] Error rate > 1%
  - [ ] API latency p95 > 1000ms
  - [ ] Database connection pool > 80%
  - [ ] Redis connection failures
  - [ ] Memory usage > 85%
- [ ] PagerDuty/incident management configured
- [ ] Log aggregation (CloudWatch/Datadog) streaming
- [ ] Uptime monitoring (StatusPage) active

---

## Phase 2: Deployment (0 minute - go live)

### [ ] Pre-Deployment Snapshot
- [ ] Screenshot current metrics (latency, error rate, etc.)
- [ ] Record baseline numbers:
  - API latency (p50, p95, p99): ___ms, ___ms, ___ms
  - Error rate: ___%
  - Active users: ___
  - Request rate: ___ req/s

### [ ] Deployment Process
- [ ] Trigger deployment in CI/CD pipeline
- [ ] Monitor deployment logs in real-time
- [ ] Verify health check endpoint returns 200:
  ```bash
  curl -s https://api.ywmessaging.com/health | jq '.status'
  ```
- [ ] Verify detailed health check:
  ```bash
  curl -s https://api.ywmessaging.com/health/detailed | jq
  ```

### [ ] Immediate Post-Deployment Checks (First 2 minutes)
- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Redis connection successful (or fallback working)
- [ ] All critical services responding
- [ ] No spike in error rate (should be < 0.1%)
- [ ] Latency within expected range (< 500ms p95)

### [ ] Smoke Testing (First 5 minutes)
- [ ] Auth endpoints working: POST /api/auth/login
- [ ] Message endpoints working: POST /api/v1/messages
- [ ] Conversation listing working: GET /api/v1/conversations
- [ ] WebSocket connections working
- [ ] Webhooks (Telnyx, Stripe) handling correctly

### [ ] Feature Validation (First 15 minutes)
- [ ] Login/logout flow complete
- [ ] Send SMS functionality working
- [ ] Conversation replies working
- [ ] Admin dashboard loading without errors
- [ ] Billing operations functioning
- [ ] File uploads working (S3 integration)

---

## Phase 3: Monitoring & Validation (First hour)

### [ ] Metrics Monitoring (Every 5 minutes for first 30 minutes, then every 15 minutes)

#### Performance Metrics
- [ ] API Latency:
  - p50: ___ ms (target: <200ms)
  - p95: ___ ms (target: <500ms)
  - p99: ___ ms (target: <1000ms)
- [ ] Error Rate: ___% (target: <0.1%)
- [ ] Request Rate: ___ req/s (expected baseline: ___)
- [ ] Cache Hit Rate: __% (target: >70% for Redis)

#### Database Metrics
- [ ] Connection Pool Usage: __% (target: <60%)
- [ ] Query Performance: ___ ms (p95)
- [ ] Replication Lag: ___ ms (target: <1000ms if using replicas)
- [ ] Slow Query Count: ___ (target: 0)
- [ ] Disk Usage: __% (target: <70%)

#### Infrastructure Metrics
- [ ] CPU Usage: __% (target: <70%)
- [ ] Memory Usage: __% (target: <80%)
- [ ] Disk I/O: ___ ops/s
- [ ] Network Throughput: ___ Mbps

### [ ] Log Analysis
- [ ] Check application logs for errors:
  ```bash
  tail -100 /var/log/application.log | grep ERROR
  ```
- [ ] Check for any exceptions or stack traces
- [ ] Monitor correlation IDs in logs match expected requests
- [ ] Verify no sensitive data leaked in logs

### [ ] User Impact Assessment
- [ ] No spike in support tickets
- [ ] No major bugs reported
- [ ] API response times acceptable to users
- [ ] Feature functionality as expected

### [ ] Comparative Analysis (If Applicable)
- [ ] Metrics better than pre-deployment? ☐ Yes ☐ No ☐ Similar
- [ ] Error rate improved? ☐ Yes ☐ No ☐ Similar
- [ ] Latency improved? ☐ Yes ☐ No ☐ Similar
- [ ] If metrics degraded, document why (expected behavior vs issue)

---

## Phase 4: Extended Monitoring (1 hour - 24 hours)

### [ ] Hourly Checks (First 8 hours)
- [ ] Error rate remains stable (<0.1%)
- [ ] No degradation in performance
- [ ] Database health normal
- [ ] No spike in specific error types
- [ ] Webhook processing normal

### [ ] Health Metrics (Every 6 hours for 24 hours)
- [ ] API latency stable: p95 < 500ms
- [ ] Error rate < 0.1%
- [ ] Cache hit rate > 70%
- [ ] Connection pool healthy
- [ ] No memory leaks detected

### [ ] Business Metrics (Daily for 1 week)
- [ ] Successful login rate normal
- [ ] Message delivery success rate > 99%
- [ ] Conversation creation working
- [ ] Billing operations normal
- [ ] Webhook delivery success > 99.5%

### [ ] Rollback Decision Point (8 hours post-deployment)
- [ ] All critical systems functioning? ☐ Yes ☐ No
- [ ] Performance acceptable? ☐ Yes ☐ No
- [ ] Error rates within threshold? ☐ Yes ☐ No
- [ ] **Decision**: ☐ Keep ☐ Rollback (if No to any above)

---

## Phase 5: Rollback Procedures (If Needed)

### [ ] Emergency Rollback Decision
- [ ] Is system in critical failure? ☐ Yes ☐ No
- [ ] Can it be fixed without rollback in < 30 minutes? ☐ Yes ☐ No
- [ ] Authorized to rollback? (Engineering Lead sign-off required)

### [ ] Rollback Execution
```bash
# 1. Notify team
echo "ROLLBACK INITIATED - $(date)" | tee /tmp/rollback.log

# 2. Scale down new version
kubectl set replicas deployment/backend-api 0

# 3. Scale up previous version
kubectl set replicas deployment/backend-api-previous 3

# 4. Verify health
curl -s https://api.ywmessaging.com/health | jq '.status'

# 5. Monitor metrics
# Watch for error rate, latency returning to normal (5-10 minutes)

# 6. If successful, delete new deployment
kubectl delete deployment backend-api
```

### [ ] Post-Rollback Communication
- [ ] Notify team in Slack
- [ ] Update status page
- [ ] Create incident report
- [ ] Schedule post-mortem (within 24 hours)
- [ ] Document root cause
- [ ] Identify fixes needed

### [ ] Post-Rollback Action Items
- [ ] Fix underlying issue in staging
- [ ] Re-test in staging thoroughly
- [ ] Get additional code reviews
- [ ] Plan re-deployment within 24-48 hours

---

## Phase 6: Post-Deployment Sign-Off (24 hours after)

### [ ] Final Validation
- [ ] All critical features working
- [ ] Performance metrics maintained or improved
- [ ] No degradation in user experience
- [ ] All alerts resolved
- [ ] Documentation updated for any config changes

### [ ] Incident Analysis
- [ ] Any incidents occurred? ☐ Yes ☐ No
- [ ] If yes, severity: ☐ Critical ☐ Major ☐ Minor
- [ ] Root cause documented
- [ ] Resolution time: ___ minutes
- [ ] Improvement action items created

### [ ] Team Sign-Off
- [ ] Engineering Lead: ________________ Date: _______
- [ ] On-Call Engineer: ________________ Date: _______
- [ ] DevOps/SRE: ________________ Date: _______

### [ ] Documentation Updates
- [ ] Runbooks updated with any new procedures
- [ ] Configuration changes documented
- [ ] Known issues documented
- [ ] Lessons learned captured

---

## Critical Commands Reference

### Health & Status
```bash
# Health check
curl -s https://api.ywmessaging.com/health | jq

# Detailed health
curl -s https://api.ywmessaging.com/health/detailed | jq

# Ready probe
curl -s https://api.ywmessaging.com/ready | jq
```

### Logs
```bash
# Last 50 error lines
tail -100 /var/log/application.log | grep ERROR | tail -50

# All errors from last hour
grep "ERROR" /var/log/application.log | grep "$(date '+%Y-%m-%d %H' --date='1 hour ago')"

# Specific service logs
journalctl -u backend-api -n 100 --no-pager
```

### Database
```bash
# Connection count
psql -h primary -U postgres -d ywmessaging -c "SELECT count(*) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"

# Slow queries
psql -h primary -U postgres -d ywmessaging -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Cache hit ratio
psql -h primary -U postgres -d ywmessaging -c "SELECT sum(heap_blks_hit)/(sum(heap_blks_hit)+sum(heap_blks_read)) as ratio FROM pg_statio_user_tables;"
```

### Cache/Redis
```bash
# Check Redis connection
redis-cli PING

# Memory usage
redis-cli INFO memory | grep used_memory_human

# Key count
redis-cli DBSIZE

# Flush if needed (CAUTION!)
redis-cli FLUSHDB  # Only in emergency
```

---

## Incident Response Contacts

| Role | Name | Phone | Slack | Email |
|------|------|-------|-------|-------|
| Engineering Lead | ____________ | ____________ | ____________ | ____________ |
| On-Call Engineer | ____________ | ____________ | ____________ | ____________ |
| Database Admin | ____________ | ____________ | ____________ | ____________ |
| DevOps/SRE Lead | ____________ | ____________ | ____________ | ____________ |
| VP Engineering | ____________ | ____________ | ____________ | ____________ |

---

## Escalation Path
1. On-call engineer attempts fix (first 30 minutes)
2. If unresolved, page engineering lead
3. If unresolved, page VP Engineering
4. Critical issues: all hands on deck

---

## Pre-Deployment Checklist Template (Print & Fill)

**Deployment Date**: _______________
**Release**: Version _______________
**Deployed By**: _______________
**Reviewed By**: _______________

### Code Changes
- Total commits: ___
- Files changed: ___
- Key features: _________________________________________________

### Deployment Window
- Start time: ___ (UTC)
- Expected duration: ___ minutes
- Maintenance window required? ☐ Yes ☐ No
- Users notified? ☐ Yes ☐ No

### Sign-Off
- Code review complete? ☐ Yes
- Security review complete? ☐ Yes
- Performance review complete? ☐ Yes
- All tests passing? ☐ Yes
- Staging verified? ☐ Yes

**Authorized to Deploy**: _________________ Date: _______

---

## Monitoring Dashboard Links

- **Datadog APM**: https://app.datadoghq.com/apm/services
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/
- **PostgreSQL Logs**: `/var/log/postgresql/postgresql.log`
- **Application Logs**: `/var/log/application.log`
- **Status Page**: https://status.ywmessaging.com

---

**Document Version**: 1.0
**Last Review**: December 2, 2024
**Next Review**: December 2, 2025

For questions or updates, contact the Engineering Lead.
