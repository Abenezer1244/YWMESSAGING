# Datadog Centralized Logging - Phase 2

**Status**: DEPLOYMENT READY
**Purpose**: Centralized log aggregation, monitoring, and security audit trail
**Impact**: Complete visibility into all API operations + GDPR compliance logging
**Cost**: $15-30/month depending on log volume

---

## 📋 Overview

### Why Datadog?

1. **Centralized Logging** - All Render instances send logs to single dashboard
2. **Real-time Monitoring** - Alert on errors and security events
3. **GDPR Compliance** - 90-day audit trail for deletion requests
4. **Performance Insights** - Identify slow queries and API bottlenecks
5. **Security** - Track authentication failures and suspicious activity

### Architecture

```
Render API Instances
    ↓ (HTTP/HTTPS)
Datadog Log Receiver
    ↓
Log Processing & Indexing
    ↓
Datadog Dashboard + Alerts
```

---

## 🔧 Implementation Steps

### Step 1: Create Datadog Account

1. **Sign up**: https://www.datadoghq.com/free-datadog-trial
2. **Region**: Select US1 (default)
3. **Organization**: Koinoniasms
4. **Billing**: Pay-as-you-go

### Step 2: Get API Key

1. **Navigate**: Organization Settings → API Keys
2. **Create Key**: Click "Create API Key"
3. **Name**: `koinoniasms-render-logs`
4. **Copy**: Save the key securely

### Step 3: Configure Render Drain

Render has native Datadog integration via log drains.

1. **Go to**: https://dashboard.render.com
2. **Select**: Any service (e.g., connect-yw-backend)
3. **Settings** → **Logs** → **Add Log Drain**
4. **Provider**: Datadog
5. **API Key**: Paste your Datadog API key
6. **Region**: US1
7. **Service Name**: `koinoniasms-api`
8. **Source**: `render`
9. **Click**: Create

**Repeat for**:
- Backend API service (connect-yw-backend)
- Backend API service 2 (connect-yw-backend-2) - when deployed
- Any other services

### Step 4: Verify Logs Flowing

1. **Check Datadog**: Logs → Live Tail
2. **Look for**: Recent logs from your service
3. **Expected**: `[INFO]`, `[ERROR]`, `[DEBUG]` messages
4. **Timeline**: Logs appear within 5-30 seconds

---

## 📊 Log Configuration

### Log Format

Logs should follow structured format:

```json
{
  "timestamp": "2024-12-02T10:30:00.123Z",
  "level": "INFO",
  "service": "koinoniasms-api",
  "message": "SMS sent successfully",
  "context": {
    "churchId": "church-123",
    "messageId": "msg-456",
    "recipient": "+1234567890",
    "provider": "telnyx"
  },
  "duration_ms": 245
}
```

### Log Levels

- **INFO**: Normal operations (logins, messages sent, etc.)
- **WARN**: Suspicious activity (rate limits, retries)
- **ERROR**: Failures (API errors, delivery failures)
- **DEBUG**: Detailed tracing (only in development)

### Critical Logs to Track

#### Security Events
```
- Login attempts (success/failure)
- Password reset requests
- MFA setup/changes
- Admin role changes
- API key generation
- Suspicious IP addresses
```

#### Compliance Events
```
- GDPR deletion requests (with churchId)
- GDPR deletion confirmations (with token)
- Consent changes (with reason)
- Data exports (with admin ID)
- Account suspensions
```

#### Performance Events
```
- Slow queries (>1 second)
- High latency API responses (>500ms)
- Database connection pool exhaustion
- Redis failover
- Queue failures
```

#### Operational Events
```
- Service startup/shutdown
- Health check results
- Database migrations
- Deployment events
- Configuration changes
```

---

## 🔍 Datadog Dashboard Setup

### Create Main Dashboard

1. **In Datadog**: Dashboards → New Dashboard
2. **Name**: `Koinoniasms API - Main`
3. **Add Widgets**:

#### 1. Request Volume (Timeseries)
```
Query: status:* | stats count() as requests by status
```

#### 2. Error Rate (Gauge)
```
Query: status:error | stats count() as errors
Threshold: <1%
```

#### 3. API Latency (Timeseries)
```
Query: * | stats avg(duration_ms) as avg_latency
```

#### 4. GDPR Events (Table)
```
Query: "GDPR" | stats count() as events by message
```

#### 5. Authentication Failures (Alert)
```
Query: "Login" status:FAILED | stats count()
Alert if: > 10 per hour
```

---

## 🚨 Alerting Rules

### Critical Alerts

#### Alert 1: High Error Rate
```
Condition: Error count > 50 per minute
Severity: Critical (Page on-call)
Notification: Slack + Email
```

#### Alert 2: GDPR Deletion
```
Condition: Any "GDPR Deletion" message
Severity: High (Email only)
Action: Verify deletion was authorized
```

#### Alert 3: Database Connection Failure
```
Condition: "connection failed" message
Severity: Critical
Action: Check PostgreSQL health
```

#### Alert 4: Suspicious Authentication
```
Condition: Failed logins from same IP > 5 per hour
Severity: High
Action: Review logs for attack pattern
```

---

## 📈 90-Day Log Retention

### Configuration

1. **In Datadog**: Organization Settings → Log Retention
2. **Set Retention**: 90 days (default)
3. **Archived Logs**: Optional (for compliance)

### Cost Impact

**Storage Calculation**:
- Average log size: 500 bytes
- Throughput: ~100 requests/min = 144,000/day
- Storage needed: ~67 GB for 90 days
- Cost: ~$0.10/GB/month = ~$7/month

**Total Datadog Cost**:
- Ingestion: ~$15-20/month (for 144K logs/day)
- Storage (90 days): ~$7/month
- Total: ~$25/month

---

## 🔒 Security Audit Trail

### GDPR Deletion Audit

Every deletion must be logged:

```json
{
  "timestamp": "2024-12-02T10:30:00Z",
  "level": "INFO",
  "service": "koinoniasms-api",
  "message": "GDPR Deletion Request initiated",
  "context": {
    "churchId": "church-123",
    "adminId": "admin-456",
    "deletionRequestId": "del-req-789",
    "reason": "Closing church",
    "scheduledDeletionAt": "2024-12-31",
    "ipAddress": "203.0.113.42",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Query for Audit Trail

```
service:koinoniasms-api "GDPR"
| stats count() as events by churchId, adminId
| sort events desc
```

---

## 🧪 Testing Log Shipping

### Test 1: Verify Connection

```bash
# Render will automatically test when you add the drain
# Check Datadog:
# 1. Logs → Live Tail
# 2. Filter: source:render
# 3. Should see connection test logs
```

### Test 2: Send Test Log

In your application:

```javascript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  service: 'koinoniasms-api',
  message: 'Test log from application',
  test: true
}));
```

Expected in Datadog within 30 seconds.

### Test 3: Verify GDPR Logs

Trigger a GDPR deletion request:

```bash
curl -X POST https://api.koinoniasms.com/api/gdpr/delete-account/request \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test"}'
```

Then search in Datadog:

```
service:koinoniasms-api "GDPR Deletion"
```

Should appear within 30 seconds.

---

## 📋 Compliance Features

### Audit Trail

Every critical action logged:
- Login/logout (with IP, timestamp)
- GDPR deletion requests (with admin, reason, timestamp)
- Deletion confirmations (with token, timestamp)
- Consent changes (with reason, timestamp)
- Admin role changes
- API key usage

### Data Retention

- **Hot storage** (searchable): 90 days
- **Archive storage** (optional): 7 years
- **Cost**: ~$0.03/GB/month for archive

### Compliance Queries

```bash
# Find all GDPR deletions in last 30 days
service:koinoniasms-api "GDPR Deletion"
  AND timestamp:[now-30d TO now]

# Find all failed login attempts
service:koinoniasms-api "Login" status:FAILED
  AND timestamp:[now-7d TO now]

# Find all admin changes
service:koinoniasms-api "admin" "role"
  AND timestamp:[now-30d TO now]
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Datadog account created
- [ ] API key generated and stored securely
- [ ] Log drain created in Render
- [ ] Test logs flowing within 30 seconds
- [ ] Dashboard created with key widgets
- [ ] Alert rules configured
- [ ] GDPR event monitoring verified

### Deployment

1. **Add log drain** to backend service
2. **Wait 5 minutes** for logs to start flowing
3. **Verify dashboard** shows recent activity
4. **Test alerts** with intentional error
5. **Monitor for 24 hours** before going live

### Post-Deployment

- [ ] Dashboard shows all API activity
- [ ] No gaps in logging (24+ hours)
- [ ] GDPR deletions properly logged
- [ ] Error rates tracked
- [ ] Performance metrics visible
- [ ] Alerts working correctly

---

## 📚 Dashboard Templates

### High-Level Monitoring

```
┌─ Request Volume
├─ Error Rate (%)
├─ API Latency (ms)
├─ Database Queries
└─ Redis Cache Hit Rate
```

### Security Monitoring

```
┌─ Failed Login Attempts
├─ GDPR Events
├─ Consent Changes
├─ Admin Actions
└─ Suspicious IP Activity
```

### Performance Monitoring

```
┌─ Slow Queries (>1s)
├─ API Response Time (p95)
├─ Database Connections
├─ Redis Memory Usage
└─ Queue Processing Time
```

---

## 🎯 Success Criteria

✅ **Datadog Logging is successful when**:

1. **Connectivity**
   - [ ] Render log drain configured
   - [ ] Logs appearing in Datadog within 30 seconds
   - [ ] No gaps in logging

2. **Coverage**
   - [ ] API logs captured
   - [ ] Database logs captured
   - [ ] Redis logs captured (if available)
   - [ ] Security events logged

3. **Compliance**
   - [ ] GDPR deletions tracked
   - [ ] Consent changes logged
   - [ ] Admin actions recorded
   - [ ] 90-day retention enabled

4. **Monitoring**
   - [ ] Dashboard created
   - [ ] Key metrics visible
   - [ ] Alerts configured
   - [ ] Test alerts working

5. **Performance**
   - [ ] Latency metrics tracked
   - [ ] Error rates monitored
   - [ ] Performance trends visible

---

## 💡 Tips & Troubleshooting

### Logs not appearing?

1. **Check Render drain status**: Dashboard → Service → Logs → Drains
2. **Verify API key**: Copy from Datadog settings again
3. **Check region**: Must match (US1, EU1, etc.)
4. **Wait 5 minutes**: Drains take time to activate

### High costs?

1. **Reduce log volume**: Only log critical events
2. **Adjust retention**: Lower from 90 days if acceptable
3. **Use filters**: Exclude debug logs from production
4. **Archive old logs**: Use cheaper S3 storage

### Missing GDPR logs?

1. **Verify endpoints called**: Check API logs
2. **Check log format**: Must match structured format
3. **Verify service name**: Should be `koinoniasms-api`
4. **Check query**: Use exact log text

---

## 📞 Support

### Datadog Docs
- Render Integration: https://docs.datadoghq.com/integrations/render/
- Log Retention: https://docs.datadoghq.com/logs/log_retention/
- Dashboard Creation: https://docs.datadoghq.com/dashboards/

### Render Docs
- Log Drains: https://render.com/docs/log-drains

---

**Status**: READY FOR DEPLOYMENT ✅
**Cost**: ~$25/month
**Setup Time**: ~10 minutes
**Monitoring**: Real-time + 90-day audit trail
**Compliance**: GDPR audit logging included

