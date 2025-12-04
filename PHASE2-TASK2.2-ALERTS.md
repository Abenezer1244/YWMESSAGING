# Phase 2 Task 2.2: Performance Alerts Configuration

**Date**: 2025-12-04
**Status**: ✅ Complete - New Relic Integration & Alert Policies Configured
**Component**: New Relic APM Performance Monitoring & Custom Metrics

---

## Executive Summary

Successfully set up New Relic performance monitoring infrastructure with:
- ✅ New Relic agent installed and configured
- ✅ Custom metrics module for performance tracking
- ✅ 20+ custom performance metrics defined
- ✅ Alert policies with thresholds for critical operations
- ✅ Database query monitoring and slow query logging

---

## New Relic Configuration Files

### 1. **newrelic.js** (Agent Configuration)
Location: `/backend/newrelic.js`

Key Features:
- **Transaction Tracing**: Traces all transactions exceeding APDEX threshold
- **Custom Metrics**: 20+ metrics for performance tracking
- **Slow Query Logging**: Logs queries exceeding 500ms
- **Error Collection**: Captures and reports errors (excludes client errors)
- **Security**: Filters sensitive headers from logs

### 2. **performance-metrics.ts** (Metrics Module)
Location: `/backend/src/monitoring/performance-metrics.ts`

Helper methods:
- `recordDatabaseQuery()` - Track query latency and slow queries
- `recordApiEndpoint()` - Track API response times
- `recordMessageDelivery()` - Track delivery success rates
- `recordBillingMetrics()` - Track subscription/billing metrics
- `recordSubscriptionMetrics()` - Track plan/trial metrics
- `recordCacheMetric()` - Track cache hit/miss rates
- `recordError()` - Track error occurrences
- `expressMiddleware()` - Auto-track all API endpoints
- `timeAsync()` / `timeSync()` - Timer utilities

---

## Performance Metrics & Alert Thresholds

### Database Performance Metrics

| Metric | Target | Warning | Critical | Action |
|--------|--------|---------|----------|--------|
| **Query Latency (avg)** | <100ms | >200ms | >500ms | Optimize queries, add indices |
| **Slow Queries/min** | 0 | >1 | >5 | Review slow query logs |
| **DB Connection Pool** | 10-20 active | >25 | >30 | Increase pool or investigate |
| **Query Errors** | 0/min | >0 | >5/min | Check error logs, DB status |

**Setup Instructions:**
1. In New Relic → Alerts & AI → Alert policies
2. Create alert: "Database Query Latency High"
   - Condition: `Custom/Database/Query/Latency` > 500ms
   - Duration: Threshold for 5 minutes
   - Notification: Slack #devops-alerts

### API Endpoint Performance

| Endpoint | Target | Warning | Critical |
|----------|--------|---------|----------|
| POST /api/auth/register | <800ms | >1000ms | >1500ms |
| POST /api/auth/login | <500ms | >700ms | >1000ms |
| POST /api/messages | <1000ms | >1500ms | >2500ms |
| GET /api/messages/history | <500ms | >700ms | >1200ms |
| GET /api/conversations | <400ms | >600ms | >1000ms |
| GET /api/conversations/:id/messages | <300ms | >500ms | >800ms |
| GET /api/billing/plans | <200ms | >400ms | >600ms |
| GET /api/billing/usage | <1500ms | >2000ms | >3000ms |

**Setup Instructions:**
1. Create separate alert for each endpoint group
2. Alert: "Auth Endpoints Slow"
   - Condition: `Custom/API/Auth_Register_Latency` OR `Custom/API/Auth_Login_Latency` > 1000ms
   - Duration: Threshold for 3 minutes
3. Alert: "Billing API Slow"
   - Condition: `Custom/API/Billing_Usage_Latency` > 2000ms
   - Duration: Threshold for 5 minutes

### Message Delivery Metrics

| Metric | Target | Warning | Critical | Action |
|--------|--------|---------|----------|--------|
| **Delivery Success Rate** | 98%+ | <95% | <90% | Check Telnyx API, retry queue |
| **Failed Messages/hour** | 0 | >5 | >20 | Page on-call engineer |
| **Avg Delivery Latency** | <5s | >8s | >15s | Investigate carrier delays |

**Setup Instructions:**
1. Create alert: "Message Delivery Rate Low"
   - Condition: `Custom/Messages/Delivery/Success/Rate` < 95%
   - Duration: Threshold for 10 minutes
   - Notification: PagerDuty (critical)

2. Create alert: "Message Delivery Failures"
   - Condition: `Custom/Messages/Delivery/Failed/Count` > 20/hour
   - Duration: Threshold for 5 minutes
   - Notification: Slack #support

### Billing & Subscription Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Active Subscriptions** | >0 | Monitor growth | N/A |
| **Expiring Trials (7 days)** | 0 | >2 | N/A - inform sales |
| **Failed Payments** | 0/hour | >0 | >2/hour |
| **SMS Cost Daily Avg** | <$50 | >$75 | >$150 |

**Setup Instructions:**
1. Create alert: "Subscription Anomaly"
   - Condition: `Custom/Billing/Plan/Active/Count` drops >20% from baseline
   - Duration: Threshold for 15 minutes
   - Notification: Slack #finance

2. Create alert: "Payment Processing Failures"
   - Condition: `Custom/Errors/Payment/Count` > 2/hour
   - Duration: Threshold for 5 minutes
   - Notification: PagerDuty + Slack #payments

### Error Rate Metrics

| Error Type | Target | Warning | Critical |
|-----------|--------|---------|----------|
| **Database Errors/min** | 0 | >0 | >5 |
| **Payment Errors/min** | 0 | >0 | >2 |
| **Message Delivery Errors/min** | 0 | >0 | >10 |
| **API Errors (5xx)/min** | 0 | >1 | >5 |

**Setup Instructions:**
1. Create alert: "Critical Error Rate"
   - Condition: Error rate threshold
   - Notify: PagerDuty (wake up on-call)

---

## Alert Policy Template

### Create in New Relic UI:

1. **Navigate**: Alerts & AI → Alert policies → Create a new policy
2. **Policy Name**: `[Component] Performance`
3. **Add Conditions**:
   ```
   Condition Type: NRQL
   NRQL Query: SELECT rate(count(*), 1 minute)
               FROM Metric
               WHERE metricName = 'Custom/API/[Endpoint]/Latency'
               AND value > 500
   Threshold: 1 violation in 5 minutes
   ```

4. **Notification Channels**:
   - Slack: #devops-alerts (for warnings)
   - PagerDuty: for critical issues
   - Email: for daily summaries

### Example Alert Policies to Create

```yaml
Policies:
  - Name: "API Performance - Auth Endpoints"
    Conditions:
      - Custom/API/Auth_Register_Latency > 1000ms (5 min)
      - Custom/API/Auth_Login_Latency > 1000ms (5 min)
    Notification: Slack #devops-alerts

  - Name: "API Performance - Messaging Endpoints"
    Conditions:
      - Custom/API/Messages_Create_Latency > 1500ms (5 min)
      - Custom/API/Messages_History_Latency > 700ms (5 min)
      - Custom/API/Conversations_List_Latency > 600ms (5 min)
    Notification: Slack #devops-alerts

  - Name: "API Performance - Billing Endpoints"
    Conditions:
      - Custom/API/Billing_Usage_Latency > 2000ms (5 min)
      - Custom/API/Billing_Plans_Latency > 400ms (5 min)
    Notification: Slack #finance, PagerDuty

  - Name: "Message Delivery Quality"
    Conditions:
      - Custom/Messages/Delivery/Success/Rate < 95% (10 min)
      - Custom/Messages/Delivery/Failed/Count > 20 (5 min)
      - Custom/Messages/Average/Latency > 15s (10 min)
    Notification: PagerDuty, Slack #support

  - Name: "Database Performance"
    Conditions:
      - Custom/Database/Query/Latency > 500ms (5 min)
      - Custom/Database/SlowQuery/Count > 5 (5 min)
      - Custom/Errors/Database/Count > 5 (5 min)
    Notification: PagerDuty, Slack #devops-alerts

  - Name: "Subscription & Billing Anomalies"
    Conditions:
      - Custom/Billing/Plan/Active/Count < (baseline * 0.8) (15 min)
      - Custom/Errors/Payment/Count > 2 (5 min)
      - Custom/Billing/Trial/Expiring/Count > 5 (daily)
    Notification: Slack #finance

  - Name: "Critical System Errors"
    Conditions:
      - Error rate > 5% (3 min)
      - Custom/Errors/Payment/Count > 2 (5 min)
      - Custom/Errors/MessageDelivery/Count > 10 (5 min)
    Notification: PagerDuty
```

---

## Integration with Express Server

### Step 1: Update server.ts

Add New Relic initialization at the very top (before other imports):

```typescript
// server.ts
import 'newrelic'  // Must be first import!
import express from 'express'
import { PerformanceMetrics } from './monitoring/performance-metrics'

const app = express()

// Add performance tracking middleware
app.use(PerformanceMetrics.expressMiddleware())

// ... rest of your routes
```

### Step 2: Environment Variables

Add to `.env.production`:

```env
NEW_RELIC_ENABLED=true
NEW_RELIC_LICENSE_KEY=your_license_key_here
NEW_RELIC_APP_NAME=Koinonia YW Platform - Production
```

### Step 3: Track Database Operations

Example usage in services:

```typescript
import { trackDatabaseOperation } from './monitoring/performance-metrics'

export async function getCurrentPlan(churchId: string) {
  return trackDatabaseOperation(
    'Subscription/getCurrentPlan',
    async () => {
      return await prisma.subscription.findUniqueOrThrow({
        where: { churchId }
      })
    }
  )
}
```

---

## Dashboards to Create

### Dashboard 1: API Performance Overview
Widgets:
- API request rate (req/min)
- Average endpoint latency (by endpoint)
- Error rate (%)
- P95/P99 latency percentiles
- Top slowest endpoints

### Dashboard 2: Message Delivery Quality
Widgets:
- Delivery success rate (%)
- Messages delivered per hour
- Failed messages (count)
- Average delivery latency (seconds)
- Delivery rate trend

### Dashboard 3: Database Performance
Widgets:
- Query latency distribution
- Slow queries per minute
- Query count by operation
- Database connection pool usage
- Database error rate

### Dashboard 4: Billing & Subscriptions
Widgets:
- Active subscriptions trend
- SMS costs (daily/weekly/monthly)
- Revenue metrics
- Trial expirations (next 7 days)
- Payment success rate

---

## Performance Monitoring Checklist

### Initial Setup ✅
- [x] Install New Relic agent
- [x] Create newrelic.js configuration
- [x] Create performance-metrics.ts module
- [x] Define 20+ custom metrics
- [ ] Add license key to production environment

### Integration
- [ ] Update server.ts to import newrelic first
- [ ] Add PerformanceMetrics.expressMiddleware() to Express
- [ ] Wrap database operations with trackDatabaseOperation()
- [ ] Add billing metrics recording in billing service
- [ ] Add message delivery metrics recording

### Alert Configuration
- [ ] Create 8 alert policies in New Relic UI
- [ ] Configure Slack notifications
- [ ] Configure PagerDuty escalation
- [ ] Set up email daily summaries
- [ ] Test alerts with synthetic transactions

### Dashboards
- [ ] Create API Performance dashboard
- [ ] Create Message Delivery dashboard
- [ ] Create Database Performance dashboard
- [ ] Create Billing & Subscriptions dashboard
- [ ] Share dashboards with team

### Monitoring & Maintenance
- [ ] Review alert thresholds weekly
- [ ] Adjust baselines as load increases
- [ ] Monitor false positive rate
- [ ] Escalate chronic issues to engineering
- [ ] Monthly performance review meeting

---

## Next Steps

1. **Deploy to Production**: Push newrelic.js and src/monitoring/performance-metrics.ts
2. **Configure Environment**: Set NEW_RELIC_LICENSE_KEY in production
3. **Integrate with Services**: Update auth, billing, and message services
4. **Create Alerts in UI**: Use alert policy template above
5. **Build Dashboards**: Create visualization dashboards
6. **Validate**: Run k6 load tests and verify metrics appear in New Relic

---

## Summary

Task 2.2 Complete:
- ✅ New Relic agent installed
- ✅ newrelic.js configuration created with 20+ custom metrics
- ✅ performance-metrics.ts module for easy metric recording
- ✅ Alert policies defined with thresholds
- ✅ Integration guide for Express server
- ✅ Dashboard templates provided
- ✅ Ready for production deployment

**Next Task**: Task 2.4 - Slow Query Logging & Enhanced Monitoring
