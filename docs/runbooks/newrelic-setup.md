# New Relic APM Setup Guide

**Purpose**: Application Performance Monitoring with 4 default alerts
**Cost**: Free tier (100GB/month), $99/month for paid
**Setup Time**: 1 hour
**Difficulty**: Easy

---

## Why New Relic?

- **Visibility**: See every API request, database query, external call
- **Performance**: P50, P95, P99 latency metrics
- **Errors**: Track error rate and types
- **Alerts**: Page engineers when thresholds exceeded
- **Dashboard**: Real-time team visibility

---

## Step 1: Create New Relic Account (5 minutes)

1. Go to https://newrelic.com/signup
2. Sign up with your company email
3. Choose **Free Tier** (100GB/month = plenty for small app)
4. Confirm email
5. Log in to dashboard

---

## Step 2: Install New Relic Agent in Backend (10 minutes)

```bash
cd /path/to/backend

# Install New Relic Node.js agent
npm install newrelic

# Verify installation
npm list newrelic
# Output: newrelic@9.x.x
```

---

## Step 3: Create New Relic Configuration File (10 minutes)

Create `backend/newrelic.js`:

```javascript
'use strict'
/**
 * New Relic APM Configuration
 * See https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration
 */
exports.config = {
  // Application name as displayed in New Relic dashboard
  app_name: ['YWMESSAGING-API'],

  // License key (will come from NEWRELIC_LICENSE_KEY environment variable)
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  },

  // Allow tracking request parameters for debugging
  capture_params: true,

  // Custom attributes to include in all events
  attributes: {
    enabled: true,
    // Don't capture sensitive headers
    exclude: ['request.headers.authorization', 'request.headers.cookie']
  },

  // Distributed tracing (see requests across services)
  distributed_tracing: {
    enabled: true
  },

  // Enable custom instrumentation
  transaction_naming: {
    rules: [
      // Define custom transaction naming if needed
    ]
  },

  // Capture application version from environment
  process_host: {
    display_name: process.env.RENDER_SERVICE_NAME || 'connect-yw-backend'
  }
}
```

---

## Step 4: Add to Backend Startup (5 minutes)

Edit `backend/src/index.ts` - **MUST BE FIRST IMPORT**:

```typescript
// ⚠️ CRITICAL: New Relic MUST be imported first, before any other imports
require('newrelic')

import 'dotenv/config'
import { config } from './config/env.js'
// ... rest of imports ...
```

**IMPORTANT**: The `require('newrelic')` line MUST come before all other imports. This is non-negotiable for proper instrumentation.

---

## Step 5: Get License Key from New Relic (10 minutes)

1. Log into https://one.newrelic.com/
2. Click your account name (top right) → Account settings
3. Copy **License Key** (or click "Show" if needed)
4. It looks like: `nr76b1f14c0a1d1a2b3c4d5e6f7g8h9i0j`

---

## Step 6: Add License Key to Render (5 minutes)

1. Go to Render Dashboard → Settings → Environment Variables
2. Add new variable:
   - **Key**: `NEW_RELIC_LICENSE_KEY`
   - **Value**: (paste the license key from Step 5)
   - **Sync**: false (so it doesn't expose in code)
3. Click "Save"

---

## Step 7: Update render.yaml (5 minutes)

Add New Relic to backend environment variables in `render.yaml`:

```yaml
services:
  - type: web
    name: connect-yw-backend
    env: node
    envVars:
      # ... existing env vars ...
      - key: NEW_RELIC_LICENSE_KEY
        sync: false
      # ... rest of vars ...
```

---

## Step 8: Deploy and Verify (10 minutes)

```bash
# Push changes to main (triggers GitHub Actions)
git add backend/src/index.ts backend/newrelic.js
git commit -m "Add New Relic APM monitoring"
git push origin main

# Wait for Render deployment (2-3 minutes)

# Check New Relic dashboard after deployment
# https://one.newrelic.com/
# You should see:
# - "YWMESSAGING-API" appears in Applications list
# - Data flowing in within 5 minutes
# - Transactions appearing
```

---

## Step 9: Configure 4 Default Alerts (15 minutes)

Go to https://one.newrelic.com/ and create alerts:

### Alert 1: High Memory Usage

```
1. Click "Alerts & AI" (left sidebar) → Alerts → Alert Conditions → New Alert
2. Name: "Memory Usage Critical"
3. Condition:
   - Target: YWMESSAGING-API application
   - Metric: Memory > 90%
   - Duration: > 5 minutes
   - Severity: Critical
4. Notification: PagerDuty (setup in Step 11)
5. Save
```

### Alert 2: Low Apdex Score (User Satisfaction)

```
1. Click "Alerts & AI" → Alerts → New Alert
2. Name: "User Experience Degrading"
3. Condition:
   - Target: YWMESSAGING-API
   - Metric: Apdex < 0.5
   - Duration: > 5 minutes
   - Severity: Warning
4. Apdex measures: Satisfied (< 100ms) vs Frustrated (> 400ms)
5. Notification: PagerDuty
6. Save
```

### Alert 3: High Error Rate

```
1. Click "Alerts & AI" → Alerts → New Alert
2. Name: "High Error Rate"
3. Condition:
   - Target: YWMESSAGING-API
   - Metric: Error rate > 10% of transactions
   - Duration: > 2 minutes
   - Severity: Critical
4. Notification: PagerDuty
5. Save
```

### Alert 4: High CPU Usage

```
1. Click "Alerts & AI" → Alerts → New Alert
2. Name: "CPU Usage Critical"
3. Condition:
   - Target: YWMESSAGING-API
   - Metric: CPU > 90%
   - Duration: > 5 minutes
   - Severity: Warning
4. Notification: PagerDuty
5. Save
```

---

## Step 10: Create Custom Dashboard (Optional, 15 minutes)

1. Go to New Relic → Dashboards → Create New Dashboard
2. Name: "YWMESSAGING Monitoring"
3. Add widgets:
   - **API Response Time (P95)**: Chart
     - Query: `SELECT percentile(duration, 95) FROM Transaction`
   - **Error Rate**: Number
     - Query: `SELECT percentage(count(*), WHERE error IS true) FROM Transaction`
   - **Database Query Time**: Chart
     - Query: `SELECT percentile(duration, 95) FROM Span WHERE span.kind = 'db'`
   - **Request Volume**: Number
     - Query: `SELECT count(*) FROM Transaction SINCE 1 hour ago`
   - **Memory Usage**: Line Chart
     - Query: `SELECT latest(host.memoryUsagePercent) FROM SystemSample FACET hostname TIMESERIES`

---

## Step 11: Connect New Relic → PagerDuty (10 minutes)

**Prerequisites**: PagerDuty account already set up (see `pagerduty-setup.md`)

1. Go to New Relic → Integrations → PagerDuty
2. Click "Connect"
3. Authorize New Relic to access PagerDuty
4. Select PagerDuty service: "YWMESSAGING-API"
5. Save

Now when alerts trigger:
- New Relic sends to PagerDuty
- PagerDuty pages on-call engineer
- SMS + Slack notification sent

---

## Step 12: Verify Everything Works (5 minutes)

### Check Dashboard

```
1. Go to https://one.newrelic.com/
2. Applications → YWMESSAGING-API
3. You should see:
   - Green status (healthy)
   - Request rate (requests/minute)
   - Response time (P95 latency)
   - Error rate (% of failed requests)
   - Database query time
```

### Trigger Test Alert (optional)

```
1. In backend code, trigger a test error:
   // In any route handler, add:
   throw new Error('New Relic test alert')
2. Deploy and hit that endpoint
3. Wait 5 minutes
4. Should see error in New Relic dashboard
5. Alert should trigger to PagerDuty
```

---

## Key Metrics to Watch

### Healthy Baseline
```
API Response Time (P95):     <200ms
Error Rate:                  <1%
Apdex Score:                 >0.95
Database Query Time (P95):   <100ms
Memory Usage:                <70%
CPU Usage:                   <60%
```

### Alert Thresholds
```
Memory:  >90% for 5 min   → Page engineer
Apdex:   <0.5             → Warning (users frustrated)
Errors:  >10% for 2 min   → Page engineer
CPU:     >90% for 5 min   → Warning (scaling needed)
```

---

## Troubleshooting

### New Relic not receiving data

```bash
# Check that require('newrelic') is FIRST import in index.ts
# Check that NEW_RELIC_LICENSE_KEY is in Render environment
# Wait 5-10 minutes after deployment for data to appear
# Check backend logs for New Relic initialization message
```

### License key not working

```
1. Go to New Relic Account Settings
2. Copy license key again (might have changed)
3. Update in Render environment
4. Redeploy backend
```

### Alerts not triggering

```
1. Check alert conditions are saved
2. Check PagerDuty integration is connected
3. Manually trigger error to test flow
4. Check New Relic → Incident Intelligence for blockages
```

---

## Additional Resources

- **New Relic Documentation**: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/
- **NRQL Queries**: https://docs.newrelic.com/docs/nrql/nrql-syntax-clauses-functions/
- **Alert Best Practices**: https://docs.newrelic.com/docs/alerts-applied-intelligence/

---

**Version**: 1.0
**Created**: 2025-12-03
**Next Review**: 2025-12-10
