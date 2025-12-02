# API Rate Limiting Enhancements

## Overview

Advanced rate limiting implementation with production-grade features:

- **Per-API-Key Limits**: Different rate limits for different API keys/clients
- **Burst Allowance**: Temporary spike handling without rejecting requests
- **Redis-Backed State**: Distributed state across multiple application instances
- **Adaptive Limiting**: Adjusts based on load and priority
- **Fair Queuing**: Prevents one client from blocking others
- **Analytics & Reporting**: Detailed usage metrics per API key
- **Graceful Degradation**: Works without Redis if necessary

## Current Implementation

The application already has extensive rate limiting:

- `authLimiter`: 5 requests/15 minutes for login
- `passwordResetLimiter`: 3 requests/hour for password resets
- `billingLimiter`: 10 requests/minute for billing operations
- `apiLimiter`: 100 requests/minute for general API
- `messageRateLimiter`: 50 requests/minute for messaging
- `githubWebhookLimiter`: 20 requests/minute for webhooks

## Enhancements

### 1. Per-API-Key Rate Limiting

Different API keys can have different limits based on subscription tier:

```typescript
import { createApiKeyLimiter } from './utils/advanced-rate-limiting.js';

const apiKeyLimiter = createApiKeyLimiter({
  'free-plan': {
    maxRequests: 100,   // 100 requests per minute
    burstSize: 10,      // Allow 10 burst requests
    description: 'Free tier API key'
  },
  'pro-plan': {
    maxRequests: 1000,  // 1000 requests per minute
    burstSize: 100,
    description: 'Pro tier API key'
  },
  'enterprise': {
    maxRequests: 10000, // 10000 requests per minute
    burstSize: 1000,
    priority: 1,        // Higher priority in queue
    description: 'Enterprise tier API key'
  }
});

// Apply to routes
app.get('/api/v1/messages', enforceRateLimit(apiKeyLimiter), handler);
```

**How It Works**:
1. Extracts API key from `X-API-Key` header
2. Looks up configuration for that key
3. Applies appropriate rate limit
4. Returns rate limit headers with response

### 2. Burst Allowance

Allows temporary spikes above the normal rate limit:

```typescript
const limiter = createRateLimiter({
  windowMs: 60000,      // 60 second window
  maxRequests: 100,     // 100 normal requests
  burstSize: 20,        // Allow 20 burst requests
  burstWindow: 5000,    // Within 5 second window
});
```

**Scenario**:
- Normal limit: 100 requests/minute
- Burst allows: 20 additional requests within 5 seconds
- Total capacity: 120 requests if 20 arrive in burst window
- Prevents rejecting legitimate traffic spikes

**Response Headers When Bursting**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Burst: true
X-RateLimit-Reset: 2024-12-02T15:34:12Z
```

### 3. Redis-Backed Distributed State

Works across multiple application instances:

```typescript
import { createRateLimiter } from './utils/advanced-rate-limiting.js';

// Single limiter configuration shared by all instances
const limiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  burstSize: 20
});

// On instance 1: 50 requests made
// On instance 2: Knows about the 50 requests from instance 1
// Shared Redis store tracks across all instances
```

**Benefits**:
- Accurate rate limiting across load-balanced instances
- No per-instance quotas
- Prevents circumventing limits by adding servers
- Real-time visibility into global usage

### 4. Adaptive Rate Limiting

Adjust limits based on application load and user priority:

```typescript
import { createTieredLimiter } from './utils/advanced-rate-limiting.js';

const tieredLimiter = createTieredLimiter();

// Premium users: 1000 requests/minute (priority: 1)
// Standard users: 100 requests/minute (priority: 0)
// Free users: 10 requests/minute (priority: -1)

// During peak load, lower priority requests wait
// Higher priority requests get through
```

## Implementation Guide

### Step 1: Add Advanced Limiter

In `backend/src/app.ts`:

```typescript
import { createRateLimiter, enforceRateLimit } from './utils/advanced-rate-limiting.js';

const advancedLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  burstSize: 20,
  burstWindow: 5000
});
```

### Step 2: Apply to Routes

```typescript
// General API endpoint with advanced limiting
app.get('/api/v1/endpoint', enforceRateLimit(advancedLimiter), handler);

// Or with per-key configuration
const apiKeyLimiter = createApiKeyLimiter({
  'free': { maxRequests: 100, burstSize: 10 },
  'pro': { maxRequests: 1000, burstSize: 100 }
});

app.post('/api/v1/messages', enforceRateLimit(apiKeyLimiter), handler);
```

### Step 3: Get Analytics

```typescript
// In admin dashboard or monitoring endpoint
app.get('/admin/rate-limit/analytics/:apiKey', async (req, res) => {
  const analytics = await limiter.getAnalytics(req.params.apiKey);
  res.json(analytics);
});

// Response:
{
  "apiKey": "key-123",
  "requestsUsed": 45,
  "requestLimit": 100,
  "percentUsed": 45,
  "windowResetAt": "2024-12-02T15:34:12Z",
  "hourlyAverage": 180,
  "hitsSinceReset": 45,
  "blocksSinceReset": 2
}
```

## Rate Limit Headers

All rate-limited responses include standard headers:

```
X-RateLimit-Limit: 100              # Total limit
X-RateLimit-Remaining: 55           # Requests left
X-RateLimit-Reset: 2024-12-02T...  # When limit resets
Retry-After: 45                     # Seconds to wait (on 429)
X-RateLimit-Burst: true             # Optional: in burst mode
```

## Response Format on Limit Exceeded

```json
HTTP/1.1 429 Too Many Requests

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Reset in 45000ms",
  "retryAfter": 45000
}
```

## Configuration Examples

### Example 1: Tiered SaaS Model

```typescript
const tieredLimiter = createApiKeyLimiter({
  'free-tier': {
    maxRequests: 10,
    burstSize: 2,
    priority: -1
  },
  'starter-tier': {
    maxRequests: 100,
    burstSize: 20,
    priority: 0
  },
  'professional-tier': {
    maxRequests: 1000,
    burstSize: 200,
    priority: 0
  },
  'enterprise-tier': {
    maxRequests: 10000,
    burstSize: 2000,
    priority: 1
  }
});
```

### Example 2: Endpoint-Specific Limits

```typescript
// Expensive endpoints get stricter limits
const webhookLimiter = createRateLimiter({
  windowMs: 3600000, // 1 hour
  maxRequests: 1000, // 1000 per hour
  burstSize: 50
});

const messageLimiter = createRateLimiter({
  windowMs: 60000,   // 1 minute
  maxRequests: 100,
  burstSize: 20
});

const analyticLimiter = createRateLimiter({
  windowMs: 86400000, // 1 day
  maxRequests: 10000,
  burstSize: 500
});

app.post('/webhooks/events', enforceRateLimit(webhookLimiter), handler);
app.post('/api/messages', enforceRateLimit(messageLimiter), handler);
app.get('/api/analytics', enforceRateLimit(analyticLimiter), handler);
```

### Example 3: Custom Key Generator

```typescript
const customLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  keyGenerator: (req) => {
    // Limit by user ID instead of IP
    const userId = req.user?.id;
    // Limit by church instead of individual user
    const churchId = req.user?.churchId;
    return `church:${churchId}:user:${userId}`;
  }
});
```

## Monitoring & Alerts

### Get Rate Limit Status

```typescript
import { getRateLimitStatus } from './utils/advanced-rate-limiting.js';

const status = await getRateLimitStatus(limiter, 'api-key-123');
console.log(status);

// Output:
// Rate Limit Status for api-key-123:
//   Requests Used: 45/100
//   Usage: 45.0%
//   Requests Remaining: 55
//   Burst Used: 0/20
//   Window Reset: 2024-12-02T15:34:12Z
//   Retry After: 45.0s
//   In Burst Mode: No
```

### Set Up Alerts

```typescript
// Alert when API key approaches limit
setInterval(async () => {
  const analytics = await limiter.getAnalytics('api-key-123');

  if (analytics.percentUsed > 80) {
    logger.warn(`API key ${analytics.apiKey} at ${analytics.percentUsed}% usage`);
  }

  if (analytics.blocksSinceReset > 10) {
    logger.error(`API key ${analytics.apiKey} blocked ${analytics.blocksSinceReset} times`);
  }
}, 60000); // Check every minute
```

## Best Practices

### 1. Gradual Rollout

```typescript
// Phase 1: Monitor only (log but don't block)
app.use((req, res, next) => {
  limiter.check(req.ip).then(status => {
    if (!status.allowed) {
      logger.info(`Would rate limit ${req.ip}`);
    }
  });
  next();
});

// Phase 2: Enforce after 1 week
app.use(enforceRateLimit(limiter));
```

### 2. Handle Grace Periods

```typescript
// New users get grace period
if (user.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000) {
  // 2x limit for first week
  limitConfig.maxRequests *= 2;
}
```

### 3. Whitelist Critical Paths

```typescript
const publicApiLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  keyGenerator: (req) => {
    // Bypass rate limiting for internal IPs
    if (isInternalIP(req.ip)) {
      return 'internal-bypass';
    }
    return req.ip;
  }
});
```

### 4. Document Limits in API

```typescript
/**
 * Send message to contact
 * @requires authentication
 * @rate-limit 50 requests per minute
 * @rate-limit 1000 requests per day per user
 * @param {string} contactId - Contact ID
 * @returns {Message}
 */
app.post('/api/messages/:contactId', handler);
```

## Troubleshooting

### Requests Being Blocked Unexpectedly

1. **Check current usage**:
   ```typescript
   const status = await limiter.check('user-id');
   console.log(`Used: ${status.requestLimit - status.requestsRemaining}/${status.requestLimit}`);
   ```

2. **Reset limit** (for testing):
   ```typescript
   await limiter.reset('user-id');
   ```

3. **Increase limit** (if needed):
   ```typescript
   limiter.updateConfig({ maxRequests: 200 });
   ```

### Redis Connection Issues

If Redis is unavailable:
- Rate limiting automatically allows all requests
- Logs warning but doesn't break application
- Once Redis recovers, limits re-engage

### Burst Mode Not Working

Check:
1. `burstSize` is configured
2. `burstWindow` is appropriate (< windowMs)
3. Request rate during burst is actually fast enough

## Performance Impact

### Overhead

- Per-request: ~5-10ms (Redis round-trip)
- Memory: ~100 bytes per tracked key
- Redis: ~1KB per active key

### Optimization

1. **Batch requests** to reduce rate limit overhead
2. **Cache responses** to avoid rate limited endpoints
3. **Use burst allowance** for traffic spikes

## Migration Guide

### From Simple Rate Limiting

```typescript
// Before
const limiter = rateLimit({
  windowMs: 60000,
  max: 100
});

// After (with per-key support)
const limiter = createApiKeyLimiter({
  'free': { maxRequests: 100, burstSize: 10 },
  'pro': { maxRequests: 1000, burstSize: 100 }
});
```

### Backward Compatibility

Existing rate limiters continue to work:
- No changes required to existing code
- New advanced features are optional
- Gradual migration path

## Cost Analysis

- **No additional cost**: Uses existing Redis
- **Storage**: ~100 bytes per API key per day
- **Bandwidth**: ~10KB per 1000 requests

## Related Documentation

- [PgBouncer Setup](./PGBOUNCER_SETUP.md)
- [Read Replicas](./READ_REPLICAS_SETUP.md)
- [Query Monitoring](./PHASE_2_COMPLETION_SUMMARY.md#query-monitoring)

