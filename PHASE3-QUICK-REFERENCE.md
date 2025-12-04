# Phase 3: Quick Reference Guide

**Phase**: Validation & Monitoring (December 2025)
**Status**: Tasks 3.1-3.2 Complete, Tasks 3.3-3.4 Pending
**Overall Progress**: 50% Complete (2/4 tasks)

---

## Quick Navigation

### Task 3.1: Index Verification ✅ COMPLETE
**Purpose**: Verify 7 composite indices deployed and improving queries

**Scripts**:
- `backend/scripts/verify-indices.sql` - SQL verification queries
- `backend/scripts/verify-indices-performance.ts` - Node.js performance tester

**Run Verification**:
```bash
# SQL verification via Render dashboard or psql
psql postgresql://user:pass@host/db < backend/scripts/verify-indices.sql

# Performance testing
npx ts-node backend/scripts/verify-indices-performance.ts
```

**Expected Improvements**:
- Subscription queries: 87% faster
- Conversation list: 20% faster
- Message history: 15% faster
- Message tracking: 30-40% faster

**Documentation**: `PHASE3-IMPLEMENTATION-PLAN.md` (Task 3.1 section)

---

### Task 3.2: Performance Baselines ✅ COMPLETE
**Purpose**: Establish baseline metrics for regression detection

**Scripts**:
- `backend/scripts/k6-baseline.js` - k6 load testing script
- `backend/scripts/run-baseline.sh` - Baseline runner
- `backend/scripts/analyze-baseline.js` - Results analyzer

**Run Baseline**:
```bash
# Quick smoke test (5 minutes)
cd backend
./scripts/run-baseline.sh http://localhost:3000

# Full load test (30 minutes)
cd backend
k6 run scripts/k6-baseline.js --scenario load \
  --env BASE_URL=http://localhost:3000 \
  -o json=benchmarks/k6-baseline-load.json

# Analyze results
node backend/scripts/analyze-baseline.js benchmarks/k6-baseline-*.json
```

**Test Scenarios**:
| Scenario | Duration | VUs | P95 Target | Purpose |
|----------|----------|-----|-----------|---------|
| Smoke | 5m | 5 | <500ms | Quick validation |
| Load | 30m | 0→30 | <600ms | Sustained load |
| Spike | 10m | 5→100 | <800ms | Surge handling |
| Soak | 2h | 10 | <700ms | Long duration |
| Conversation | 30m | 20 | <1000ms | Full workflow |

**Save Baseline Reference**:
```bash
cp benchmarks/baseline-*.json benchmarks/main-baseline.json
```

**Documentation**: `PHASE3-TASK3.2-BASELINES.md`

---

### Task 3.3: New Relic Monitoring (NEXT)
**Purpose**: Deploy performance monitoring and alerting

**What You'll Do**:
1. Configure New Relic agent in production
2. Create 8 alert policies
3. Build 4 performance dashboards
4. Set up Slack/PagerDuty notifications

**Configuration Files** (Already Created):
- `backend/newrelic.js` - Agent configuration
- `backend/src/monitoring/performance-metrics.ts` - Metrics module
- `backend/src/monitoring/slow-query-logger.ts` - Query logging
- `PHASE2-TASK2.2-ALERTS.md` - Alert policy templates

**8 Alert Policies to Create**:
1. Database Query Latency High
2. Auth Endpoints Slow
3. Billing API Slow
4. Message Delivery Rate Low
5. Message Delivery Failures
6. Payment Processing Failures
7. Subscription Anomaly
8. Critical Error Rate

**4 Dashboards to Build**:
1. API Performance Overview
2. Message Delivery Quality
3. Database Performance
4. Billing & Subscriptions

**Integration Checklist**:
- [ ] New Relic license key obtained
- [ ] Agent imported in `backend/src/server.ts` (add `import 'newrelic'` as FIRST import)
- [ ] Metrics appearing in New Relic dashboard
- [ ] 8 alert policies created with thresholds
- [ ] Slack channels configured for notifications
- [ ] Test alerts fire correctly
- [ ] Team trained on dashboard

**Documentation**: `PHASE2-TASK2.2-ALERTS.md` (has all alert templates)

---

### Task 3.4: Continuous Optimization (AFTER 3.3)
**Purpose**: Monitor performance and iteratively optimize

**Daily Checklist**:
```
Every morning:
1. Check New Relic dashboard
2. Review overnight alerts
3. Look at slow query logs (/api/debug/slow-queries)
4. Check message delivery rates
5. Note any anomalies
```

**Weekly Checklist** (Every Monday):
```
1. Generate weekly performance report
2. Compare metrics to baseline
3. Identify new bottlenecks
4. Plan optimizations
5. Share trends with team
```

**Monthly Checklist**:
```
1. Comprehensive performance analysis
2. Capacity planning review
3. Update baselines if needed
4. Optimize identified bottlenecks
5. Execute improvements
6. Measure results
```

**Optimization Workflow**:
```
1. Identify bottleneck (from slow query logs/dashboard)
2. Analyze root cause
3. Implement optimization
4. Measure improvement (benchmarks)
5. Deploy to production
6. Monitor results
7. Update baseline
8. Document learnings
```

**Documentation**: `PHASE3-IMPLEMENTATION-PLAN.md` (Task 3.4 section)

---

## Key Metrics to Monitor

### Database Layer
- Query latency (p95): Target <500ms, Alert >1000ms
- Slow queries: Target 0, Alert >5/min
- Critical queries: Target 0, Alert >1/min
- Connection pool: Target 10-20, Alert >30

### API Endpoints
- Auth: Target <1000ms, Alert >1500ms
- Messages: Target <1500ms, Alert >2500ms
- Conversations: Target <400ms, Alert >1000ms
- Billing: Target <2000ms, Alert >3000ms

### Message Delivery
- Success rate: Target 98%+, Alert <95%
- Delivery latency: Target <5s, Alert >15s
- Failure count: Target 0/hour, Alert >20/hour

### System Health
- Error rate: Target <0.1%, Alert >5%
- Database uptime: Target 99.9%+
- API availability: Target 99.9%+

---

## File Structure

```
backend/
├── scripts/
│   ├── verify-indices.sql ........................ SQL index verification
│   ├── verify-indices-performance.ts ........... Performance tester
│   ├── k6-baseline.js ........................... k6 load tests
│   ├── run-baseline.sh .......................... Baseline runner
│   └── analyze-baseline.js ...................... Results analyzer
├── benchmarks/
│   ├── k6-baseline-{timestamp}.json ............ k6 results
│   ├── baseline-{timestamp}.json .............. Analysis snapshot
│   └── main-baseline.json ....................... Reference baseline
├── newrelic.js ................................. New Relic config (Phase 2)
└── src/monitoring/
    ├── performance-metrics.ts ................... Metrics module (Phase 2)
    ├── slow-query-logger.ts .................... Query logging (Phase 2)
    └── performance-benchmark.ts ............... Benchmarking (Phase 2)
```

---

## Troubleshooting

### Baseline Tests Failing?
1. Check API is running: `curl http://localhost:3000/health`
2. Verify database is connected
3. Ensure indices are deployed (run Task 3.1 verification)
4. Check application logs for errors

### High Latency Detected?
1. Review slow query logs: `curl http://localhost:3000/api/debug/slow-queries`
2. Run index verification to confirm indices used
3. Check database query plans with `verify-indices.sql`
4. Review New Relic transaction traces

### Regression Detected?
1. Compare current metrics vs baseline: `node backend/scripts/analyze-baseline.js`
2. Identify which scenarios regressed
3. Check for recent code changes
4. Review slow query logs for new patterns
5. Implement optimization and re-baseline

---

## Success Criteria Checklist

### Phase 3 Complete When:
- [ ] Task 3.1: Index verification scripts created
- [ ] Task 3.1: Performance improvements documented
- [ ] Task 3.2: k6 baseline tests passing
- [ ] Task 3.2: Baseline snapshot stored as reference
- [ ] Task 3.3: New Relic agent configured
- [ ] Task 3.3: 8 alert policies created
- [ ] Task 3.3: 4 dashboards built
- [ ] Task 3.3: Notifications routing properly
- [ ] Task 3.4: Daily monitoring routine established
- [ ] Task 3.4: Dashboard shared with team
- [ ] All documentation complete and reviewed

---

## Documentation Map

| Document | Purpose | Owner |
|----------|---------|-------|
| `PHASE3-IMPLEMENTATION-PLAN.md` | Full Phase 3 plan (4 tasks, timeline) | DevOps |
| `PHASE3-TASK3.2-BASELINES.md` | Baseline testing guide (k6, analysis) | DevOps |
| `PHASE3-QUICK-REFERENCE.md` | This file - quick navigation | DevOps |
| `PHASE2-TASK2.2-ALERTS.md` | New Relic alert templates | DevOps |
| `PHASE2-COMPLETE-SUMMARY.md` | Phase 2 overview (completed) | DevOps |

---

## Status Summary

| Task | Status | Progress | Owner | ETA |
|------|--------|----------|-------|-----|
| 3.1: Index Verification | ✅ COMPLETE | 100% | DevOps | Done |
| 3.2: Performance Baselines | ✅ COMPLETE | 100% | DevOps | Done |
| 3.3: New Relic Monitoring | 🔄 PENDING | 0% | DevOps | This week |
| 3.4: Continuous Optimization | 🔄 PENDING | 0% | DevOps | Next week |

**Overall Phase 3 Progress**: 50% (2/4 tasks complete)

---

## What's Next?

### Immediate (Next Step)
1. Proceed to **Task 3.3: Set Up New Relic Monitoring**
2. Review `PHASE2-TASK2.2-ALERTS.md` for alert templates
3. Configure New Relic agent in production environment
4. Create 8 alert policies with thresholds

### This Week
- Complete Task 3.3 deployment
- Create 4 performance dashboards
- Set up Slack notifications

### Next Week
- Start Task 3.4: Daily monitoring routine
- Train team on dashboard
- Establish optimization workflow

---

## Contact & Support

**Questions About**:
- Baseline testing → See `PHASE3-TASK3.2-BASELINES.md`
- New Relic setup → See `PHASE2-TASK2.2-ALERTS.md`
- Index verification → See `PHASE3-IMPLEMENTATION-PLAN.md` (Task 3.1)
- Continuous optimization → See `PHASE3-IMPLEMENTATION-PLAN.md` (Task 3.4)
