# Phase 3 Task 3.3: Set Up New Relic Monitoring

**Date**: December 4, 2025
**Status**: Implementation Guide & Deployment Checklist
**Objective**: Deploy New Relic APM monitoring and create 8 alert policies

---

## Overview

Task 3.3 takes the monitoring infrastructure built in Phase 2 and deploys it to production with comprehensive alerting and dashboards. This task completes the monitoring stack that enables continuous performance observation.

### What Will Be Accomplished

1. **Configure New Relic Agent** in production environment
2. **Create 8 Alert Policies** with specific thresholds
3. **Build 4 Performance Dashboards** for team visibility
4. **Set Up Notifications** (Slack, PagerDuty, email)
5. **Verify Monitoring Active** with test alerts

---

## Step 1: New Relic Agent Integration

### 1.1 Install New Relic Package (Already Done in Phase 2)

The `newrelic` npm package is already in `package.json`. Verify it's installed:

```bash
cd backend
npm list newrelic
# Should show: newrelic@x.x.x
```

### 1.2 Update Server Configuration

**File**: `backend/src/server.ts`

Add this as the **FIRST import** (before all other imports):

```typescript
// MUST BE FIRST - New Relic agent initialization
import 'newrelic'

// Then all other imports
import express from 'express'
import cors from 'cors'
// ... rest of imports
```

**Critical**: `import 'newrelic'` must be the first line of your entry point. Any code before it will not be monitored.

### 1.3 Set Environment Variables

**For Local Development** (`.env` or `.env.local`):
```bash
# Optional - set to 'false' to disable monitoring
NEW_RELIC_ENABLED=true

# Your New Relic account credentials (leave empty for now if not available)
NEW_RELIC_LICENSE_KEY=
NEW_RELIC_APP_ID=
```

**For Production** (Render dashboard or environment settings):
1. Log in to New Relic account
2. Navigate to: Account Settings → License key
3. Copy your 40-character license key
4. In Render dashboard:
   - Go to Environment → Environment variables
   - Add: `NEW_RELIC_LICENSE_KEY=<your-key>`
   - Redeploy application

### 1.4 Initialize Monitoring Modules

The `performance-metrics.ts` and `slow-query-logger.ts` modules from Phase 2 automatically initialize when the server starts. They are already imported in your codebase via the middleware setup.

**Verify these are imported in** `backend/src/server.ts`:
```typescript
import { initializeSlowQueryLogging } from './monitoring/slow-query-logger'
import { expressMiddleware as metricsMiddleware } from './monitoring/performance-metrics'

// In your Express app setup:
app.use(metricsMiddleware) // Enable automatic endpoint metrics
initializeSlowQueryLogging(prisma) // Enable slow query tracking
```

---

## Step 2: Create 8 Alert Policies

All 8 alert policies are documented in `PHASE2-TASK2.2-ALERTS.md`. Here's the implementation checklist:

### Alert Policy 1: Database Query Latency High

**In New Relic UI**:
1. Go to: Alerts & AI → Alert policies → Create policy
2. Policy Name: `Database - Query Latency Alert`
3. Condition Type: NRQL
4. Query:
```sql
SELECT average(newrelic.timeslice.value) as 'avg_latency'
FROM Metric
WHERE metricTimesliceName = 'Custom/Database/Query/Latency'
FACET appName
```
5. **Thresholds**:
   - Warning: Average > 200ms for 5 minutes
   - Critical: Average > 500ms for 5 minutes
6. **Notification Channels**: #devops-alerts (Slack)

### Alert Policy 2: Auth Endpoints Slow

**In New Relic UI**:
1. Policy Name: `API - Auth Endpoints Performance`
2. Condition Type: NRQL
3. Query:
```sql
SELECT average(newrelic.timeslice.value) as 'latency'
FROM Metric
WHERE metricTimesliceName LIKE 'Custom/API/Auth%'
FACET metricTimesliceName
```
4. **Thresholds**:
   - Warning: Average > 1000ms for 3 minutes
   - Critical: Average > 1500ms for 3 minutes
5. **Notification**: #devops-alerts (Slack)

### Alert Policy 3: Billing API Slow

**In New Relic UI**:
1. Policy Name: `API - Billing Performance`
2. Condition Type: NRQL
3. Query:
```sql
SELECT average(newrelic.timeslice.value) as 'latency'
FROM Metric
WHERE metricTimesliceName LIKE 'Custom/API/Billing%'
FACET metricTimesliceName
```
4. **Thresholds**:
   - Warning: Average > 2000ms for 5 minutes
   - Critical: Average > 3000ms for 5 minutes
5. **Notification**: #devops-alerts, #finance (Slack)

### Alert Policy 4: Message Delivery Rate Low

**In New Relic UI**:
1. Policy Name: `Messaging - Delivery Success Rate Low`
2. Condition Type: NRQL
3. Query:
```sql
SELECT latest(newrelic.timeslice.value) as 'success_rate'
FROM Metric
WHERE metricTimesliceName = 'Custom/Messages/Delivery/Success/Rate'
```
4. **Thresholds**:
   - Warning: < 95% for 10 minutes
   - Critical: < 90% for 5 minutes
5. **Notification**: #support (Slack), PagerDuty (critical only)

### Alert Policy 5: Message Delivery Failures

**In New Relic UI**:
1. Policy Name: `Messaging - Delivery Failures`
2. Condition Type: NRQL
3. Query:
```sql
SELECT rate(count(*), 1 hour)
FROM Metric
WHERE metricTimesliceName = 'Custom/Messages/Delivery/Failed/Count'
```
4. **Thresholds**:
   - Warning: > 5 failures/hour for 10 minutes
   - Critical: > 20 failures/hour for 5 minutes
5. **Notification**: #support (Slack), PagerDuty (critical)

### Alert Policy 6: Payment Processing Failures

**In New Relic UI**:
1. Policy Name: `Billing - Payment Failures`
2. Condition Type: NRQL
3. Query:
```sql
SELECT rate(count(*), 1 hour)
FROM Metric
WHERE metricTimesliceName = 'Custom/Errors/Payment/Count'
```
4. **Thresholds**:
   - Warning: > 0 failures/hour for 5 minutes
   - Critical: > 2 failures/hour for 5 minutes
5. **Notification**: #payments (Slack), PagerDuty (critical)

### Alert Policy 7: Subscription Anomaly

**In New Relic UI**:
1. Policy Name: `Billing - Subscription Anomaly`
2. Condition Type: Baseline (anomaly detection)
3. Query:
```sql
SELECT count(*)
FROM Metric
WHERE metricTimesliceName = 'Custom/Billing/Plan/Active/Count'
```
4. **Thresholds**:
   - Deviation: 20% below baseline for 15 minutes
5. **Notification**: #finance (Slack)

### Alert Policy 8: Critical Error Rate

**In New Relic UI**:
1. Policy Name: `System - Critical Error Rate`
2. Condition Type: NRQL
3. Query:
```sql
SELECT rate(count(*), 1 minute)
FROM TransactionError
WHERE error = true
FACET appName
```
4. **Thresholds**:
   - Warning: > 1% error rate for 5 minutes
   - Critical: > 5% error rate for 2 minutes
5. **Notification**: #devops-alerts (Slack), PagerDuty (critical)

---

## Step 3: Build 4 Performance Dashboards

### Dashboard 1: API Performance Overview

**In New Relic UI**:
1. Go to: Dashboards → Create new dashboard
2. Name: `API Performance Overview`
3. Add Widgets:

**Widget 1 - API Response Times**
```sql
SELECT percentile(duration, 95, 99) as 'p95, p99'
FROM Transaction
WHERE transactionType = 'Web'
FACET name
TIMESERIES
```

**Widget 2 - Throughput by Endpoint**
```sql
SELECT count(*)
FROM Transaction
WHERE transactionType = 'Web'
FACET name
TIMESERIES
```

**Widget 3 - Error Rate Trend**
```sql
SELECT count(*) / count_distinct(guid) * 100 as 'error_rate'
FROM Transaction, TransactionError
WHERE transactionType = 'Web'
TIMESERIES
```

**Widget 4 - Active Transactions**
```sql
SELECT count(*)
FROM Transaction
WHERE transactionType = 'Web'
FACET name
```

### Dashboard 2: Message Delivery Quality

**In New Relic UI**:
1. Name: `Message Delivery Quality`
2. Add Widgets:

**Widget 1 - Delivery Success Rate**
```sql
SELECT latest(newrelic.timeslice.value)
FROM Metric
WHERE metricTimesliceName = 'Custom/Messages/Delivery/Success/Rate'
```

**Widget 2 - Failed Messages Trend**
```sql
SELECT rate(count(*), 1 hour)
FROM Metric
WHERE metricTimesliceName = 'Custom/Messages/Delivery/Failed/Count'
TIMESERIES
```

**Widget 3 - Average Delivery Latency**
```sql
SELECT average(newrelic.timeslice.value)
FROM Metric
WHERE metricTimesliceName = 'Custom/Messages/Delivery/Latency/ms'
TIMESERIES
```

**Widget 4 - Delivery Status Breakdown**
```sql
SELECT count(*)
FROM Metric
WHERE metricTimesliceName LIKE 'Custom/Messages/Delivery%'
FACET metricTimesliceName
```

### Dashboard 3: Database Performance

**In New Relic UI**:
1. Name: `Database Performance`
2. Add Widgets:

**Widget 1 - Query Latency (P95/P99)**
```sql
SELECT percentile(newrelic.timeslice.value, 95, 99)
FROM Metric
WHERE metricTimesliceName = 'Custom/Database/Query/Latency'
TIMESERIES
```

**Widget 2 - Slow Query Count**
```sql
SELECT latest(newrelic.timeslice.value)
FROM Metric
WHERE metricTimesliceName = 'Custom/Database/SlowQuery/Count'
```

**Widget 3 - Connection Pool Usage**
```sql
SELECT latest(newrelic.timeslice.value)
FROM Metric
WHERE metricTimesliceName = 'Custom/Database/Connection/Pool/Active'
TIMESERIES
```

**Widget 4 - Database Errors**
```sql
SELECT rate(count(*), 1 minute)
FROM DatabaseStatement
WHERE error = true
FACET database
TIMESERIES
```

### Dashboard 4: Billing & Subscriptions

**In New Relic UI**:
1. Name: `Billing & Subscriptions`
2. Add Widgets:

**Widget 1 - Active Subscriptions**
```sql
SELECT latest(newrelic.timeslice.value)
FROM Metric
WHERE metricTimesliceName = 'Custom/Billing/Plan/Active/Count'
TIMESERIES
```

**Widget 2 - Payment Processing Success Rate**
```sql
SELECT (count(*) - max(newrelic.timeslice.value)) / count(*) * 100 as 'success_rate'
FROM Metric
WHERE metricTimesliceName = 'Custom/Errors/Payment/Count'
```

**Widget 3 - Trial Conversions**
```sql
SELECT count(*)
FROM Metric
WHERE metricTimesliceName = 'Custom/Billing/Plan/Trial/Count'
FACET appName
TIMESERIES
```

**Widget 4 - SMS Cost Daily Average**
```sql
SELECT average(newrelic.timeslice.value)
FROM Metric
WHERE metricTimesliceName = 'Custom/SMS/Cost/Daily'
TIMESERIES
```

---

## Step 4: Configure Notifications

### Slack Integration

**Setup**:
1. In New Relic: Integrations → Slack
2. Click "Install"
3. Authorize New Relic app in your Slack workspace
4. Add channels:
   - `#devops-alerts` - General performance alerts
   - `#support` - Message/delivery issues
   - `#finance` - Billing/subscription alerts
   - `#payments` - Payment processing alerts

**In Each Alert Policy**:
1. Add Notification Channel
2. Type: Slack
3. Select channel
4. Custom message format (optional):
```
🚨 {{conditionName}} Alert
Service: {{appName}}
Severity: {{severity}}
Details: {{violation.description}}
```

### PagerDuty Integration (Critical Alerts Only)

**Setup**:
1. In New Relic: Integrations → PagerDuty
2. Click "Configure"
3. Enter PagerDuty API key from your account
4. Select escalation policy

**In Critical Alert Policies**:
1. Add PagerDuty as notification channel
2. Configure urgency: "high" for critical alerts
3. Set escalation time: 15 minutes

### Email Notifications (Daily Summary)

**Setup**:
1. In New Relic: Notification channels → Email
2. Add: devops-team@yourdomain.com
3. Enable daily digest

---

## Step 5: Deployment Checklist

### Pre-Deployment Verification

- [ ] New Relic agent package installed (`npm list newrelic`)
- [ ] `import 'newrelic'` added as FIRST line in `backend/src/server.ts`
- [ ] Performance metrics middleware configured
- [ ] Slow query logger initialized
- [ ] License key available and documented
- [ ] Monitoring modules reviewed for correctness

### Production Deployment Steps

1. **Update Environment Variables**
   ```bash
   # In Render dashboard → Environment
   NEW_RELIC_LICENSE_KEY=<your-40-char-key>
   NEW_RELIC_ENABLED=true
   ```

2. **Redeploy Application**
   ```bash
   # Via Render dashboard or git push
   git push origin main
   ```

3. **Verify Agent Connection**
   - Wait 2-3 minutes after deployment
   - Go to New Relic: APM → Applications
   - Look for "Koinonia YW Platform" application
   - Should show as "Reporting" in green

4. **Create Alert Policies** (Use Step 2 guide above)
   - Create all 8 policies
   - Test each with manual alert
   - Verify notifications arrive in channels

5. **Build Dashboards** (Use Step 3 guide above)
   - Create all 4 dashboards
   - Add all recommended widgets
   - Save and share with team

6. **Test Notifications**
   - Trigger manual test alert
   - Verify Slack messages
   - Verify PagerDuty incident
   - Check email notification

### Post-Deployment Verification

- [ ] Application visible in New Relic APM
- [ ] Transactions appearing in New Relic UI
- [ ] Custom metrics showing data
- [ ] 8 alert policies created
- [ ] 4 dashboards built and populated
- [ ] Test alerts firing correctly
- [ ] Slack notifications working
- [ ] PagerDuty incidents created
- [ ] Email summary received
- [ ] Team trained on dashboard usage

---

## Step 6: Team Training & Documentation

### Dashboard Access

**URL Pattern**:
```
https://one.newrelic.com/dashboards/detail/<dashboard-id>
```

### Runbook for Common Issues

**If High Query Latency Alert Fires**:
1. Go to Database Performance dashboard
2. Check "Query Latency (P95/P99)" widget
3. Click on problematic query
4. Review slow query logs: `/api/debug/slow-queries`
5. Consider adding indices or query optimization
6. Reference Task 3.1 verification scripts

**If Message Delivery Fails**:
1. Go to Message Delivery Quality dashboard
2. Check "Failed Messages Trend"
3. Review error details in Slack alert
4. Check Telnyx integration status
5. Verify carrier account has credits

**If Payment Processing Fails**:
1. Go to Billing & Subscriptions dashboard
2. Check payment error trend
3. Verify Stripe webhook integration
4. Review payment logs in application
5. Contact Stripe support if integration issue

**If Subscription Count Anomaly**:
1. Go to Billing & Subscriptions dashboard
2. Check "Active Subscriptions" trend
3. Review recent deployments
4. Analyze subscription data for patterns
5. Notify finance/sales teams

### Team Notification

Create a Slack message to share:
```
📊 New Relic Monitoring Now Live!

Your dashboards:
• API Performance: https://one.newrelic.com/dashboards/[id]
• Message Delivery: https://one.newrelic.com/dashboards/[id]
• Database Performance: https://one.newrelic.com/dashboards/[id]
• Billing: https://one.newrelic.com/dashboards/[id]

Alert channels:
• #devops-alerts - Performance issues
• #support - Message delivery issues
• #finance - Billing/subscription alerts
• #payments - Payment processing

Questions? See PHASE3-TASK3.3-NEWRELIC-SETUP.md
```

---

## Integration with Baseline Targets

Alert thresholds are based on performance baselines from Task 3.2:

| Metric | Baseline Target | Alert Warning | Alert Critical |
|--------|-----------------|---------------|-----------------|
| Database Query Latency | <100ms | >200ms | >500ms |
| Auth Endpoints | <1000ms | >1200ms | >1500ms |
| Message Delivery Success | 98%+ | <95% | <90% |
| Message Delivery Latency | <5s | >8s | >15s |
| Error Rate | <0.1% | >1% | >5% |

**Note**: If baseline metrics differ from actual production, adjust thresholds accordingly using the baseline snapshot data from Task 3.2.

---

## Monitoring Best Practices

### Daily Checks (Morning Routine)
1. Open API Performance Overview dashboard
2. Scan for any red/orange alerts
3. Review overnight alerts in Slack
4. Check Database Performance for slow queries
5. Review Message Delivery Quality for failures

### Weekly Checks (Monday Morning)
1. Generate weekly performance report from New Relic
2. Compare current metrics vs baseline
3. Identify trend patterns (improvements/regressions)
4. Share summary in #devops channel
5. Plan optimizations if needed

### Monthly Review (First Monday)
1. Comprehensive performance analysis
2. Capacity planning assessment
3. Update baselines if improved
4. Analyze recurring issues
5. Plan Q1/Q2 optimizations

---

## Success Criteria

✅ Task 3.3 Complete When:
- [ ] New Relic agent configured and reporting
- [ ] Application visible in New Relic APM
- [ ] All 8 alert policies created
- [ ] All 4 dashboards built and populated
- [ ] Slack notifications working
- [ ] PagerDuty integration tested
- [ ] Team trained on dashboards
- [ ] Runbooks created for common issues
- [ ] Documentation complete and accessible

---

## Related Documentation

- **Phase 2 Alert Templates**: `PHASE2-TASK2.2-ALERTS.md`
- **Phase 3 Baselines**: `PHASE3-TASK3.2-BASELINES.md`
- **Performance Metrics Code**: `backend/src/monitoring/performance-metrics.ts`
- **Slow Query Logger Code**: `backend/src/monitoring/slow-query-logger.ts`
- **New Relic Config**: `backend/newrelic.js`

---

## Next Steps

After Task 3.3 is complete:

1. **Task 3.4**: Continuous Optimization
   - Daily dashboard monitoring
   - Weekly performance reviews
   - Monthly optimization analysis

2. **Maintain Monitoring**:
   - Alert threshold tuning based on data
   - Dashboard refinement as needed
   - Alert fatigue management
   - Performance trend analysis

3. **Plan Optimizations**:
   - Use New Relic data to identify bottlenecks
   - Implement improvements
   - Measure impact with baseline comparison
   - Document lessons learned

---

## Status

✅ **Phase 3 Task 3.3: Setup Guide Complete**

This guide provides everything needed to:
1. Configure New Relic APM
2. Create 8 alert policies
3. Build 4 performance dashboards
4. Set up team notifications
5. Train team on monitoring

**Ready for**: Production deployment and team training
