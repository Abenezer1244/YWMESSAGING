# Alerting Setup Guide - PagerDuty & Uptime Robot

**Purpose**: Multi-layer alerting so you never miss critical issues
**Total Cost**: $9/month (PagerDuty) + Free (Uptime Robot)
**Setup Time**: 1 hour total
**Difficulty**: Easy

---

## Overview: 4 Monitoring Layers

```
Layer 1: Uptime Robot      → Health endpoint every 5 min (FREE)
Layer 2: Sentry            → Error tracking (already setup)
Layer 3: New Relic         → Performance monitoring (see newrelic-setup.md)
Layer 4: PagerDuty         → On-call scheduling + incident management ($9/mo)

Flow: Alert triggered → PagerDuty → On-call engineer → SMS/Slack
```

---

## Part A: PagerDuty Setup (30 minutes)

### Why PagerDuty?

- **On-call Scheduling**: Weekly rotation, coverage gaps, burnout prevention
- **Incident Management**: Track all SEV-1/2 incidents with timeline
- **Escalation**: If on-call doesn't respond in 5 min, escalate to lead
- **Integration**: Sentry, New Relic, Uptime Robot → PagerDuty
- **Mobile App**: Get paged with push notifications + SMS

### Step 1: Create PagerDuty Account (5 minutes)

1. Go to https://www.pagerduty.com/signup
2. Enter company email
3. Set password
4. Choose **Free Tier** (sufficient for small team)
5. Confirm email
6. Log in

### Step 2: Create Your First Team (5 minutes)

1. Go to Teams (left sidebar) → Create Team
2. Name: "YWMESSAGING Engineering"
3. Click "Create"

### Step 3: Add Team Members (5 minutes)

1. Go to Teams → "YWMESSAGING Engineering" → Members
2. Click "Add Members"
3. Add each engineer's email address:
   - Engineer 1 email
   - Engineer 2 email
   - Engineer 3 email
4. Click "Add"
5. Verify invitations sent (they'll get email)

### Step 4: Create On-Call Schedule (10 minutes)

1. Go to **Schedules** (left sidebar) → Create Schedule
2. Name: "Weekly On-Call Rotation"
3. Time Zone: Your timezone
4. Add layers:
   - **Layer 1** (Primary):
     - Rotation: Weekly (every Monday at 9 AM)
     - Add: Engineer 1, Engineer 2, Engineer 3, ...
   - **Layer 2** (Backup) - Optional:
     - Rotation: Weekly
     - Add: Engineering Lead
5. Click "Create"

### Step 5: Create Service (5 minutes)

1. Go to **Services** → Create Service
2. Name: "YWMESSAGING API"
3. Escalation Policy: (skip for now, will set up in Step 7)
4. Click "Create Service"

### Step 6: Get Integration Keys (5 minutes)

1. Go to Services → "YWMESSAGING API" → Integrations
2. Copy:
   - **Integration URL** (for Slack)
   - **API Key** (for Sentry)
3. Save these - you'll need them soon

### Step 7: Create Escalation Policy (10 minutes)

1. Go to **Escalation Policies** → Create Policy
2. Name: "YWMESSAGING Escalation"
3. Add escalation rules:
   ```
   Rule 1: Escalate to "Weekly On-Call Rotation" after 5 minutes
   Rule 2: Escalate to "Engineering Lead" after 10 more minutes
   Rule 3: Escalate to "Engineering Manager" after 10 more minutes
   ```
4. Click "Create"

### Step 8: Update Service with Escalation (5 minutes)

1. Go to Services → "YWMESSAGING API" → Settings
2. Change "Escalation Policy" to "YWMESSAGING Escalation"
3. Click "Save"

### Step 9: Create Incident Response Service (2 minutes)

Repeat Steps 5-8 for other services:
- "YWMESSAGING Database"
- "YWMESSAGING Frontend"

Or use single "YWMESSAGING API" service for all incidents.

### Step 10: Verify On-Call Coverage (2 minutes)

1. Go to **On-Call** (left sidebar)
2. Check:
   - Who's on-call this week?
   - Is anyone on-call 24/7?
   - Are there coverage gaps?
3. Adjust schedule if needed

---

## Part B: Connect Sentry → PagerDuty (10 minutes)

### Prerequisites
- Sentry account set up
- PagerDuty account set up
- Service created in PagerDuty

### Setup Steps

1. **In Sentry**, go to Project → Integrations
2. Search for "PagerDuty"
3. Click "Install"
4. Authorize Sentry to access PagerDuty
5. Select service: "YWMESSAGING API"
6. Configure alert rules:
   - New issue → Immediately create incident
   - Error spike (>100 errors/5 min) → Create incident
7. Click "Save"

**Test it works**:
```
1. Trigger test error in backend code
2. Check Sentry dashboard - error appears
3. Check PagerDuty - incident created automatically
4. Verify on-call engineer receives alert
```

---

## Part C: Connect New Relic → PagerDuty (10 minutes)

### Prerequisites
- New Relic account with 4 alerts created
- PagerDuty account with service

### Setup Steps

1. **In New Relic**, go to Alerts → Notification channels
2. Click "New notification channel"
3. Type: "PagerDuty"
4. Account: (select your account)
5. Paste PagerDuty **Integration Key** from Step 6 Part A
6. Click "Create"

Now edit each alert to use PagerDuty:
1. Go to **Alerts → Alert conditions** → Memory Usage Alert
2. Edit → Notification channel → Select PagerDuty
3. Save
4. Repeat for other 3 alerts

---

## Part D: Uptime Robot Setup (30 minutes)

### Why Uptime Robot?

- **Detects Complete Outages**: Health endpoint checked every 5 minutes
- **FREE**: No cost, unlimited monitors
- **Status Page**: Public status page (https://status.ywmessaging.com)
- **Multiple Alerts**: Slack, Email, SMS, Webhooks
- **Simple**: No complex setup

### Step 1: Create Uptime Robot Account (5 minutes)

1. Go to https://uptimerobot.com/signup
2. Use your company email
3. Confirm email
4. Log in

### Step 2: Add First Monitor (5 minutes)

1. Click **"Add Monitor"**
2. Monitor Type: "HTTP(s)"
3. Friendly Name: "API Health Check"
4. URL: `https://api.ywmessaging.com/health`
5. Monitoring Interval: 5 minutes
6. Alert Contacts: (will add next)
7. Click "Create Monitor"

### Step 3: Add Alert Contact - Slack (10 minutes)

1. Go to **My Settings** → Alert Contacts
2. Click "Add Alert Contact"
3. Type: "Slack"
4. Name: "Ops Slack"
5. Slack Webhook URL:
   - Go to Slack workspace
   - Apps → App Manager → Search "Incoming WebHooks"
   - Create New Webhook for #ops channel
   - Copy Webhook URL
   - Paste into Uptime Robot
6. Click "Save Contact"

### Step 4: Add Alert Contact - Email (5 minutes)

1. Click "Add Alert Contact"
2. Type: "Email"
3. Name: "Ops Team Email"
4. Email: ops@company.com (or your team email)
5. Click "Save Contact"

### Step 5: Add Alert Contact - SMS (Optional, 5 minutes)

1. Click "Add Alert Contact"
2. Type: "SMS"
3. Name: "On-Call SMS"
4. Phone: +1 (XXX) XXX-XXXX (on-call engineer's phone)
5. Click "Save Contact"

### Step 6: Update Monitor with Alerts (5 minutes)

1. Go to **My Monitors** → "API Health Check"
2. Edit Monitor
3. Alert Contacts:
   - Check: "Ops Slack"
   - Check: "Ops Team Email"
   - Check: "On-Call SMS"
4. Save

### Step 7: Add More Monitors (10 minutes)

Create monitors for:

**Monitor 2: Frontend Health**
```
Type: HTTP(s)
URL: https://connect-yw-frontend.onrender.com/
Name: Frontend Health Check
Interval: 5 minutes
Alert Contacts: Slack, Email
```

**Monitor 3: Database Connectivity**
```
Type: TCP Port (requires paid, skip for now)
Or: Use Render's built-in health checks
```

### Step 8: Create Status Page (10 minutes)

1. Go to **Status Pages** → Create Status Page
2. Name: "YWMESSAGING Status"
3. URL: https://status.ywmessaging.com (custom domain)
4. Add monitors:
   - API Health Check
   - Frontend Health Check
5. Branding: Add your logo
6. Click "Create"

Public URL: **https://status.ywmessaging.com**
Share this with customers and team

---

## Part E: Connect Slack to Everything (10 minutes)

### Prerequisites
- Slack workspace
- Channels: #ops, #monitoring, #incidents, #deployments

### Step 1: Create Slack Channels

```
/slack create #ops
/slack create #monitoring
/slack create #incidents
/slack create #deployments
```

### Step 2: Connect Sentry → Slack

1. **In Sentry**, go to Integrations → Slack
2. Authorize with your Slack workspace
3. Configure alert rules:
   - New issue → #ops channel (immediately)
   - High error rate → #ops channel
   - Performance regression → #monitoring channel
4. Save

**Test**: Trigger test error → Should appear in #ops

### Step 3: Connect New Relic → Slack

1. **In New Relic**, go to Alerts → Notification channels
2. Create new: Type "Slack"
3. Channel: Select #ops
4. Update each alert to include Slack notification
5. Save

**Test**: Should show New Relic alerts in #ops

### Step 4: Connect Uptime Robot → Slack

1. Already done in Part D, Step 3
2. Verify alerts working

### Step 5: Connect PagerDuty → Slack

1. **In PagerDuty**, go to Integrations
2. Search for "Slack"
3. Click "Install"
4. Authorize with Slack
5. Select channel: #incidents
6. Save

Now PagerDuty incidents appear in #incidents channel

---

## Monitoring Checklist

### Daily

- [ ] Check #ops Slack channel for any alerts
- [ ] Verify on-call engineer is responding to alerts
- [ ] No unread notifications in PagerDuty

### Weekly

- [ ] Review on-call schedule (next week)
- [ ] Check Uptime Robot status page
- [ ] Monitor New Relic dashboard for trends

### Monthly

- [ ] Test incident response runbook (dry-run)
- [ ] Review all incident reports
- [ ] Update on-call rotations

### Quarterly

- [ ] Review alert thresholds
- [ ] Adjust escalation policy if needed
- [ ] Team training on incident procedures

---

## Testing Your Alerts

### Test Sentry → PagerDuty

```bash
# In backend code, temporarily add:
router.get('/test-error', (req, res) => {
  throw new Error('Sentry test alert')
})

# Deploy and hit: https://api.ywmessaging.com/test-error
# Check:
# 1. Sentry shows error
# 2. PagerDuty creates incident
# 3. On-call engineer receives alert
# 4. Slack #ops shows alert
```

### Test New Relic Alerts

```
1. Deploy code with memory leak (temporary)
2. Monitor New Relic memory usage
3. When >90% for 5 min → Alert triggers
4. Check PagerDuty incident created
5. Revert code change
```

### Test Uptime Robot

```
1. Temporarily take down API:
   Render Dashboard → connect-yw-backend → Restart
2. Wait 5 minutes for Uptime Robot check
3. Should get alert in Slack + Email + SMS
4. Check status page shows down
5. Restart API when done
```

---

## Alert Fatigue Prevention

**Too many alerts = ignore all alerts**

Keep these rules:
- ✅ Alert on critical issues (outage, 10%+ errors, >90% resources)
- ❌ Don't alert on normal variations (100 error spikes if <1% of traffic)
- ✅ Alert on trends (slow degradation = upcoming capacity issue)
- ❌ Don't alert on non-actionable things

**Tuning**:
- If alert fires >5 times per day → threshold too low
- If alert never fires but issue happened → threshold too high
- Adjust quarterly based on actual incidents

---

## Key Integrations Checklist

- [ ] PagerDuty account created
- [ ] On-call schedule configured (2+ engineers)
- [ ] Escalation policy created
- [ ] Sentry → PagerDuty connected
- [ ] New Relic → PagerDuty connected
- [ ] Uptime Robot monitors created
- [ ] Slack channels created (#ops, #incidents, etc)
- [ ] Slack integrations connected
- [ ] Test alerts working (Sentry, New Relic, Uptime Robot)

---

## Contact Information

| Service | Link | Key Info |
|---------|------|----------|
| **PagerDuty** | https://yourcompany.pagerduty.com | Team ID: [ID] |
| **Sentry** | https://sentry.io/organizations/[org] | Project: YWMESSAGING |
| **New Relic** | https://one.newrelic.com | App: YWMESSAGING-API |
| **Uptime Robot** | https://uptimerobot.com | Status: https://status.ywmessaging.com |
| **Slack** | https://[workspace].slack.com | #ops, #incidents, #monitoring |

---

**Version**: 1.0
**Created**: 2025-12-03
**Next Review**: 2025-12-10
