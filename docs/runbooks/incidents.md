# Incident Response Runbook - Koinonia YW Platform

**Last Updated**: 2025-12-03
**Owner**: DevOps Team
**Review Frequency**: Quarterly

---

## Severity Levels & Response Times

| Severity | Definition | Examples | Response Time | Resolution Time |
|----------|-----------|----------|----------------|-----------------|
| **SEV-1** | Complete outage, all users affected | API down, database crash, region failure | <15 minutes | <1 hour |
| **SEV-2** | Degraded performance, significant user impact | 50% slower API, memory leak, cascading errors | <1 hour | <4 hours |
| **SEV-3** | Feature broken, limited users affected | One endpoint broken, email delivery failed | <4 hours | <1 business day |
| **SEV-4** | Minor issue, no immediate user impact | Typo in error message, slow query not urgent | Next sprint | Flexible |

---

## SEV-1: Complete Outage (Immediate Response)

**Target**: Page on-call engineer within 5 minutes, restore within 30 minutes

### Step 1: IMMEDIATE TRIAGE (0-5 minutes)

```bash
# 1.1 Verify the issue is real
curl https://api.ywmessaging.com/health
# Expected: 200 OK with {"status": "healthy"}
# If timeout or 5xx: CONFIRMED OUTAGE

# 1.2 Check frontend
curl https://connect-yw-frontend.onrender.com
# Expected: 200 OK
# If timeout: Frontend also down

# 1.3 Check status page (if available)
# https://status.ywmessaging.com (Uptime Robot)
# Should already show red status
```

### Step 2: PAGE ON-CALL ENGINEER (immediately)

**Auto-triggered by**: Sentry or Uptime Robot → PagerDuty
**Manual trigger**: If auto-alerting fails
```
1. Go to PagerDuty
2. Trigger incident: SEV-1 Complete Outage
3. Select on-call engineer
4. Add context: "API down - check Render dashboard"
```

### Step 3: DIAGNOSIS (5-15 minutes)

**Check in this order**:

#### 3.1 Render Deployment Status
```
1. Go to Render Dashboard → Services
2. Check backend (connect-yw-backend):
   - Green status = running
   - Yellow status = deploying
   - Red status = crashed
3. Check recent deployments:
   - If recent deploy failed: Rollback immediately
   - If stable: Check logs below
4. Check database (connect-yw-db):
   - Green = healthy
   - Red = crashed
```

#### 3.2 Backend Logs
```
Render Dashboard → connect-yw-backend → Logs
Look for:
- ERROR: Database connection failed
- ERROR: Port 3000 already in use
- Out of memory (OOM) errors
- Unhandled exception stack trace
```

#### 3.3 Error Tracking (Sentry)
```
1. Go to Sentry Dashboard
2. Check error rate spike:
   - Normal: <1 error per minute
   - Spike: >100 errors per minute = CONFIRMED
3. Check top errors:
   - What's the common pattern?
   - Is it database? API? External service?
```

#### 3.4 Performance Metrics (New Relic)
```
1. Go to New Relic Dashboard
2. Check API latency:
   - Normal: <200ms p95
   - Degraded: 1000ms+ = Performance issue
3. Check transaction errors:
   - Error rate >10% = Many failures
4. Check infrastructure:
   - CPU >95% = Resource exhaustion
   - Memory >90% = Memory leak
   - Disk >90% = Storage full
```

### Step 4: ROOT CAUSE & RESOLUTION (15-30 minutes)

**Scenario A: Recent Deployment Caused Issue**
```
Action: Immediate Rollback
1. Render Dashboard → connect-yw-backend → Deploys
2. Find previous successful deploy
3. Click "Redeploy" on previous version
4. Wait 2-3 minutes for deployment
5. Verify: curl https://api.ywmessaging.com/health → 200
6. Monitor Sentry/New Relic for 5 min
7. If stable: Proceed to Post-Incident (Step 6)
8. If still down: Escalate to team lead
```

**Scenario B: Database Connection Failed**
```
Action: Restart Database Service
1. Render Dashboard → connect-yw-db
2. Click "Restart" button
3. Wait for database to come back online (30-60 seconds)
4. Verify connection: Check backend logs
5. If still failing: Contact Render support
```

**Scenario C: Memory Leak / Out of Memory**
```
Action: Restart Backend Service
1. Render Dashboard → connect-yw-backend
2. Click "Restart" button
3. Wait for service to start (30-60 seconds)
4. Monitor memory in New Relic
5. If memory usage immediately climbs: Code bug
   - Escalate to backend engineers
   - Deploy code fix ASAP
```

**Scenario D: API Degradation (Not Fully Down)**
```
Action: Check Slow Queries
1. New Relic → Database → Slow Queries
2. Identify query taking >1000ms
3. Check if recent code change introduced N+1 queries
4. Fix code and deploy immediately
5. OR temporarily disable feature if not critical
```

**Scenario E: External Service Failure (Stripe, Twilio, SendGrid)**
```
Action: Failover/Degradation Mode
1. Check which service is down: https://status.stripe.com
2. If critical (Stripe): Disable billing for now, restore later
3. If non-critical (email): Queue and retry automatically
4. Add note in incident: "Waiting for [service] to recover"
5. Continue monitoring external service status
6. Resume functionality when service recovers
```

### Step 5: VERIFICATION (30-35 minutes)

```bash
# 5.1 Health check passes
curl https://api.ywmessaging.com/health
# Expected: 200 {"status": "healthy"}

# 5.2 API endpoints responding
curl https://api.ywmessaging.com/api/auth/refresh
# Expected: 200 or 401 (auth failure is OK, connection is OK)

# 5.3 Frontend loads
curl https://connect-yw-frontend.onrender.com
# Expected: 200 HTML response

# 5.4 Sentry error rate normalized
# Go to Sentry → Error rate should drop to <1/min

# 5.5 New Relic metrics normal
# Go to New Relic → API latency <200ms p95, Error rate <1%

# 5.6 Uptime Robot shows green
# Status page should show green within 2 minutes
```

### Step 6: INCIDENT RESOLUTION & POST-MORTEM (35-60 minutes)

```
1. Close PagerDuty incident: Mark as resolved
2. Post Slack message in #incidents:
   """
   ✅ INCIDENT RESOLVED - SEV-1
   Duration: [X minutes]
   Root cause: [Database crash / Deploy error / etc]
   Fix: [Rollback / Restart / Code fix]
   Post-mortem: Scheduled for [Date/Time] - all hands required
   """
3. Create incident post-mortem document:
   - What happened
   - Root cause analysis
   - Why alerts didn't catch it
   - Preventative measures for future
4. Schedule post-mortem meeting within 24 hours
5. Update runbook if procedures were unclear
```

---

## SEV-2: Degraded Performance (High Priority)

**Target**: Acknowledge within 1 hour, restore within 4 hours

### Symptoms
- API response time >500ms p95
- Error rate 2-10%
- Database query time >200ms
- CPU/Memory >80%

### Response Steps

#### Step 1: Assess Impact (15 minutes)
```bash
# 1.1 Check New Relic dashboard
- API latency: current p95 latency
- Error rate: % of failed requests
- User count: how many affected?
- Affected endpoints: which features broken?

# 1.2 Check Sentry for error patterns
- Error spike: is it concentrated?
- Root cause: database? API? External service?

# 1.3 Notify team in #ops
"SEV-2 Performance Degradation
- API p95 latency: 800ms (target: <200ms)
- Error rate: 5% (target: <1%)
- Affected: Message sending, Analytics dashboard
- ETA to resolution: 30 minutes"
```

#### Step 2: Diagnose Bottleneck (15-30 minutes)

**Is it Database?**
```
Check in New Relic → Database:
- Slow queries (>200ms)
- Query frequency: Is one query running 1000x?
- Lock contention: Multiple queries blocking each other?

Action:
- Kill long-running query (if safe)
- Add index if missing (if safe)
- Restart database if hung process
```

**Is it API?**
```
Check in New Relic → Transactions:
- Which endpoints are slowest?
- CPU usage: spinning CPU?
- Memory: growing memory leak?
- External calls: Waiting on Stripe/Twilio?

Action:
- Check recent code changes
- Look for N+1 queries
- Add caching if appropriate
- Optimize algorithm if needed
```

**Is it Infrastructure?**
```
Check Render Dashboard → Metrics:
- CPU >90%: Need to scale up
- Memory >90%: Need to restart or scale up
- Disk >90%: Database growth, clean up

Action:
- Restart service to clear memory
- Upgrade plan if at capacity
- Clean up old data if possible
```

#### Step 3: Implement Fix (30-60 minutes)

**Option A: Deploy Code Fix** (if identified bug)
```
1. Git pull latest, create branch
2. Implement fix (N+1 query, cache, etc)
3. Test locally
4. Push to main (CI/CD deploys automatically)
5. Wait for deployment (2-3 min)
6. Verify in New Relic: Latency should drop within 5 min
```

**Option B: Scale Resources** (if at capacity)
```
1. Render Dashboard → connect-yw-backend → Scaling
2. Increase plan: Standard → Pro (or add replicas)
3. Wait for scale up (1-2 minutes)
4. Verify in New Relic: CPU/Memory should normalize
```

**Option C: Disable Non-Critical Feature** (temporary)
```
1. If one feature causing issue: Disable it temporarily
2. Deploy feature flag: Send feature_disabled: true
3. Fix the feature
4. Re-enable after fix deployed
```

#### Step 4: Verify Recovery (5-10 minutes)

```
- API p95 latency: <200ms (target)
- Error rate: <1% (target)
- No more errors in Sentry
- New Relic showing normal metrics
```

---

## SEV-3: Feature Broken (Standard Priority)

**Target**: Acknowledge within business hours, fix same day

### Examples
- One API endpoint returns 500 errors
- Email sending broken for one customer
- One webhook not processing
- Analytics page not loading

### Response Steps

```
1. Triage: Which users affected? How critical?
2. Temporary workaround (if available):
   - Direct users to alternate feature
   - Manually process if needed
   - Set expectations for fix timeline
3. Identify root cause:
   - Check logs for error
   - Check Sentry for error pattern
   - Check recent code changes
4. Implement fix:
   - Write code change
   - Test locally
   - Deploy when ready
5. Verify fix works
6. Communicate to affected users
```

---

## SEV-4: Minor Issue (Low Priority)

**Target**: Fix next sprint

### Examples
- Typo in error message
- Slow query not affecting users
- Log message formatting wrong
- Unused code warnings

### Response
```
1. Log in issue tracking system
2. Add to backlog
3. Fix in next sprint with other changes
4. No urgency
```

---

## Critical Contacts

| Role | Name | Phone | Email | Status |
|------|------|-------|-------|--------|
| **On-Call Lead** | TBD | +1 (XXX) XXX-XXXX | oncall@company.com | Check PagerDuty |
| **Engineering Lead** | TBD | +1 (XXX) XXX-XXXX | lead@company.com | Available |
| **DevOps Engineer** | TBD | +1 (XXX) XXX-XXXX | devops@company.com | Escalation |
| **Render Support** | N/A | N/A | support@render.com | Enterprise SLA |
| **Sentry Support** | N/A | N/A | support@sentry.io | Chat |

---

## Communication Protocol

### During Incident

**Slack Channels**:
- `#incidents`: All incident updates and decisions
- `#ops`: Real-time alerts and diagnostics
- `#engineering`: Technical deep dives if needed

**Message Format**:
```
SEV-[1-4] [Service]: [Brief description]
Duration: [X minutes]
Status: [Investigating / Identified / Fixing / Monitoring / Resolved]
ETA: [Time estimate for resolution]
Impact: [Number of users affected]
Next update: [5 minutes]
```

### Post-Incident

**Within 24 hours**: Schedule post-mortem meeting
**Template**:
```
What happened:
[Clear description of incident]

Timeline:
- 15:30 UTC: Issue detected
- 15:35 UTC: Root cause identified
- 15:40 UTC: Fix deployed
- 15:45 UTC: Verified resolved

Root cause:
[Why did this happen?]

What went well:
[Good things we did]

What could improve:
[Gaps in process/monitoring]

Action items:
- [ ] Fix code issue by [date]
- [ ] Add monitoring/alert by [date]
- [ ] Update runbook by [date]
- [ ] Team training by [date]
```

---

## Testing the Runbook

**Monthly Drill** (1st Monday of each month):

```
1. Trigger test incident in PagerDuty
2. Page on-call engineer
3. Follow this runbook exactly
4. Measure response time and gap areas
5. Document what worked and what didn't
6. Update runbook based on learnings
```

---

## Key Metrics to Track

| Metric | Target | Current |
|--------|--------|---------|
| **Incident Detection** | <5 minutes (automated) | TBD |
| **MTTR (SEV-1)** | <30 minutes | TBD |
| **MTTR (SEV-2)** | <1 hour | TBD |
| **Alert Accuracy** | >95% (no false alarms) | TBD |
| **Post-mortem Completion** | Within 24 hours | TBD |

---

## Escalation Policy

```
SEV-1 Incident Escalation:
├─ 0-5 min: Page on-call engineer (Slack + SMS)
├─ 15 min: If not acknowledged, page team lead
├─ 30 min: If not resolved, page engineering manager
└─ 60 min: All-hands investigation required

SEV-2 Incident Escalation:
├─ 0-60 min: Notify team in Slack #ops
├─ 60 min: If not resolved, page engineering lead
└─ 4 hours: If not resolved, escalate to manager
```

---

## Additional Resources

- **Render Status**: https://status.render.com
- **Sentry Dashboard**: https://sentry.io/organizations/your-org/
- **New Relic Dashboard**: https://one.newrelic.com/
- **PagerDuty**: https://yourcompany.pagerduty.com/
- **Uptime Robot Status**: https://status.ywmessaging.com

---

**Version**: 1.0
**Last Review**: 2025-12-03
**Next Review**: 2025-03-03 (Quarterly)
