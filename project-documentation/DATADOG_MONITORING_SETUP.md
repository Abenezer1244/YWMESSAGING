# Datadog APM & Monitoring Setup Guide

**Status**: ✅ Infrastructure ready, awaiting environment variable activation

---

## 🚀 Quick Start (5 minutes)

### Step 1: Enable in Production (Render)

1. Go to your Render backend service
2. Click **Settings** → **Environment**
3. Add these environment variables:
   ```
   DATADOG_ENABLED=true
   DD_AGENT_HOST=0.0.0.0
   DD_TRACE_AGENT_PORT=8126
   NODE_ENV=production
   APP_VERSION=1.0.0
   ```

### Step 2: Restart Application
- Click **Redeploy** on your Render service
- Datadog APM will auto-start collecting traces

### Step 3: View Data in Datadog
- Go to [https://app.datadoghq.com/apm/traces](https://app.datadoghq.com/apm/traces)
- You should see traces from your service within 2-3 minutes

---

## 📊 What Gets Monitored Automatically

Once enabled, Datadog automatically instruments:

### Database Queries
- PostgreSQL query execution times
- Slow query detection (>100ms)
- Connection pool utilization
- Query frequency by endpoint

### HTTP Requests
- Response times (p50, p95, p99)
- Error rates (4xx, 5xx)
- Request volume by endpoint
- Payload sizes

### External APIs
- Stripe API calls (billing)
- Telnyx SMS/MMS sends
- SendGrid email sends
- OpenAI chat completions
- AWS S3 uploads

### Cache Performance
- Redis hit/miss rates
- Cache latency
- Memory usage

---

## 🎯 Critical Metrics to Monitor

### High-Priority Alerts (Set up immediately)

1. **Message Endpoint Latency**
   - Alert if POST `/api/messages/send` > 2 seconds
   - Impact: User sees slow confirmation

2. **Database Connection Pool**
   - Alert if connections > 25/30
   - Impact: New requests will queue/fail

3. **Error Rate**
   - Alert if error rate > 1% (5xx errors)
   - Impact: Users unable to send messages

4. **SMS Delivery**
   - Alert if Telnyx API latency > 3 seconds
   - Impact: Messages delayed or failed

5. **Cache Hit Rate**
   - Alert if cache hit rate < 60%
   - Impact: Database overload, slow responses

### Dashboard Recommendations

Create a dashboard with these tiles:

```
Row 1: Key Metrics
- Requests per minute
- Error rate (%)
- P95 latency (ms)
- Cache hit rate (%)

Row 2: Endpoints
- GET /api/conversations: latency, errors
- POST /api/messages/send: latency, throughput
- POST /api/conversations/:id/reply: latency

Row 3: Database
- Query count (group by table)
- Slow queries (>100ms)
- Connection pool usage

Row 4: External APIs
- Telnyx SMS send latency
- Stripe API response time
- S3 upload latency
```

---

## 🔍 Debugging with Distributed Traces

When a user reports an issue:

1. Ask for the timestamp (e.g., "2025-12-02 14:30:00 UTC")
2. Go to Traces in Datadog
3. Filter by `service:connect-yw-backend`
4. Look for traces around that timestamp
5. Click any trace to see:
   - All database queries made
   - External API calls (Stripe, Telnyx, S3)
   - Cache hits/misses
   - Exact error messages

Example trace for message send:
```
POST /api/messages/send (450ms total)
├─ Check rate limit (2ms) - Redis
├─ Validate input with Zod (1ms)
├─ Resolve recipients (50ms) - Database query
├─ Create message record (30ms) - Database insert
├─ Create message recipients (25ms) - Batch insert
├─ Send SMS to Telnyx (300ms) - HTTP call
└─ Update cache (5ms) - Redis
```

---

## 🚨 Common Issues & Solutions

### "No traces appearing"
- ✅ Check DATADOG_ENABLED=true in environment
- ✅ Wait 2-3 minutes for data to flow
- ✅ Trigger a request: `curl https://yourapp.com/api/conversations`
- ✅ Check application logs for "✅ Datadog APM initialized"

### "Traces are incomplete"
- Ensure all services have dd-trace initialized
- Check that Node.js dependencies are properly instrumented
- Verify DD_AGENT_PORT=8126 is accessible

### "High error rate showing but app seems fine"
- Check actual error details in trace
- May be catching/handling expected errors
- Review error handling in conversation.service.ts

---

## 📈 Performance Baseline (After 1 week)

Monitor these metrics after running for a week:

| Metric | Baseline | Healthy | Alert |
|--------|----------|---------|-------|
| Message Send Latency | 150-200ms | <200ms | >2s |
| Cache Hit Rate | 65-75% | >70% | <50% |
| DB Connection Usage | 8-12 | <20 | >25 |
| Error Rate | 0.1-0.5% | <1% | >2% |
| SMS Delivery Time | 1-2s | <3s | >5s |

---

## 🔐 Security & Privacy

### PII Handling
Datadog APM will NOT capture:
- Request/response bodies (by default)
- Database query parameters (by default)
- API keys or secrets

To verify:
1. Go to Datadog settings
2. Check **Ingestion Settings** → Redaction rules
3. Ensure PII redaction is enabled

### GDPR Compliance
- Datadog EU data center: [https://app.datadoghq.eu](https://app.datadoghq.eu)
- Check organization settings for data residency
- All personal data is retained per GDPR compliance rules

---

## 💡 Advanced: Custom Traces

To trace custom application logic:

```typescript
import tracer from './config/datadog.config.js';

export async function sendMessage(...) {
  const span = tracer.startSpan('message.send');
  span.setTag('church_id', churchId);
  span.setTag('recipient_count', recipients.length);

  try {
    // Your logic here
    span.setTag('status', 'success');
  } catch (error) {
    span.setTag('error', true);
    span.log({ message: error.message });
  } finally {
    span.finish();
  }
}
```

---

## 🎬 Next Steps

1. **Enable Datadog** in Render (see Step 1 above)
2. **Wait 10 minutes** for traces to appear
3. **Create Dashboard** with metrics from above
4. **Set up Alerts** for critical metrics
5. **Document runbook** for common issues
6. **Train team** on using traces for debugging

---

## 📞 Support

- Datadog Documentation: https://docs.datadoghq.com/
- APM Setup: https://docs.datadoghq.com/tracing/setup_overview/
- Troubleshooting: https://docs.datadoghq.com/tracing/troubleshooting/
- Status: Connect with your Datadog account manager for production support

---

**Last Updated**: December 2, 2025
**Infrastructure Status**: ✅ Ready for production monitoring
**Cost**: ~$30-50/month for current traffic levels
