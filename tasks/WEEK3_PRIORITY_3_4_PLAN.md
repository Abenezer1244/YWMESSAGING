# Week 3 Priority 3.4: Rate Limiting & Throttling

## Overview
Implement per-user rate limiting and per-IP throttling to prevent abuse, ensure fair resource usage, and protect against DoS attacks. Add token bucket algorithm for flexible rate control and allowlist for trusted clients.

## Problem Statement
**Current Limitations:**
- Global rate limiting only (same limit for all users)
- No per-user quotas (power users can monopolize resources)
- No request throttling at user level
- No allowlist for trusted clients (webhooks, internal services)
- All endpoints share same rate limit bucket

**Expected Outcome:**
- Fair resource allocation (100 messages/hour per user)
- Prevent single user from consuming all resources
- Graceful degradation with 429 responses
- Faster response times under load
- Better visibility into rate limit usage

## Architecture

### Rate Limit Layers

#### Layer 1: Per-IP Rate Limiting (Already Implemented)
- Auth endpoints: 5 requests/15min (production) or 50 (development)
- API endpoints: 100 requests/15min
- Billing endpoints: 30 requests/15min
- Webhook endpoints: 50 requests/15min

**Status:** ✅ Already working (app.ts has this configured)

#### Layer 2: Per-User Rate Limiting (NEW - Priority 3.4)
Add authenticated user quotas:
- Message sending: 100 messages/hour per user
- API requests: 1000 requests/hour per user
- File uploads: 10 uploads/hour per user
- Webhook creation: 5 webhooks/hour per user

#### Layer 3: Request Throttling (NEW - Priority 3.4)
Token bucket algorithm:
```
bucket_capacity = rate_limit
tokens_per_second = rate_limit / time_window
request_cost = 1 token (1 request)
```

Example: 100 messages/hour = 0.0278 tokens/second
- Users can burst up to 100 messages at once
- Then must wait for tokens to refill
- Smooth distribution over time

### Implementation Strategy

**Redis-Based Storage:**
```
User Key: rate_limit:user:{userId}
Format: {
  tokens_available: number,
  last_refill_time: timestamp,
  total_requests: number (for analytics)
}

IP Key: rate_limit:ip:{ipAddress}
(Already handled by express-rate-limit)
```

## Implementation Plan

### 1. Token Bucket Service (`rate-limit.service.ts`)
**Location:** `backend/src/services/rate-limit.service.ts`
**Responsibility:** Core rate limiting logic

Functions:
- `initializeRateLimit(userId, limit, timeWindow)` - Create new bucket
- `checkRateLimit(userId, cost)` - Check if request allowed
- `consumeTokens(userId, cost)` - Deduct tokens from bucket
- `getRemainingTokens(userId)` - Get tokens available for user
- `resetUserQuota(userId)` - Manual reset for testing
- `recordTokenUsage(userId, tokens)` - Analytics tracking

**Key Algorithm:**
```typescript
function checkRateLimit(userId: string, cost: number = 1): boolean {
  // Get current bucket state
  const bucket = redis.get(`rate_limit:user:${userId}`);

  if (!bucket) {
    // First request - initialize bucket
    bucket = { tokens: LIMIT, refill_time: now() };
    redis.setEx(`rate_limit:user:${userId}`, WINDOW_SECONDS, JSON.stringify(bucket));
    return cost <= LIMIT;
  }

  // Refill tokens based on time elapsed
  const elapsed = (now() - bucket.refill_time) / 1000; // seconds
  const tokensAdded = elapsed * (LIMIT / WINDOW_SECONDS);
  bucket.tokens = Math.min(LIMIT, bucket.tokens + tokensAdded);
  bucket.refill_time = now();

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    redis.setEx(...bucket); // Update
    return true;
  }
  return false;
}
```

### 2. Rate Limit Middleware (`rate-limit.middleware.ts`)
**Location:** `backend/src/middleware/rate-limit.middleware.ts`
**Responsibility:** Express middleware for endpoint protection

Functions:
- `createUserRateLimiter(limit, timeWindow)` - Create middleware for routes
- `createWebSocketRateLimiter()` - Special handler for WebSocket
- `getRateLimitHeaders(userId)` - Return RateLimit-* headers

**Usage Example:**
```typescript
const messageLimiter = createUserRateLimiter(
  100,  // 100 requests
  3600  // per hour
);

router.post('/send',
  authenticateToken,
  messageLimiter,  // Check rate limit first
  messageController.sendMessage
);
```

### 3. Response Headers
Return standard RateLimit headers to clients:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1672531200 (Unix timestamp)
Retry-After: 45 (seconds to wait before retrying)
```

### 4. Allowlist Configuration (`allowlist.config.ts`)
**Location:** `backend/src/config/allowlist.config.ts`

Bypass rate limiting for:
- Telnyx webhooks (webhook signature verification)
- Internal services (CloudWatch scheduler)
- Trusted IPs (specific ranges)

**Format:**
```typescript
export const rateLimitAllowlist = {
  webhooks: [
    'telnyx:*',      // All Telnyx webhooks
    'stripe:*',      // Stripe webhooks
  ],
  services: [
    'cloudwatch-scheduler',
    'manual-import-service',
  ],
  ips: [
    '203.0.113.0/24',   // CIDR range
    '198.51.100.42',    // Specific IP
  ],
};
```

### 5. Analytics & Monitoring
**Track:**
- Per-user usage (for billing/compliance)
- Rate limit violations (for abuse detection)
- Peak usage times
- User quota exhaustion

**Location:** `backend/src/services/rate-limit-analytics.service.ts`

Functions:
- `recordRateLimitViolation(userId, endpoint)` - Log abuse attempt
- `getUserUsageStats(userId, period)` - Get user's usage
- `getTopUsers(limit, period)` - Identify heavy users
- `detectAnomalies()` - Find suspicious patterns

## Integration Points

### 1. Message Controller
```typescript
import { createUserRateLimiter } from '../middleware/rate-limit.middleware.js';

const messageLimiter = createUserRateLimiter(100, 3600); // 100/hour

router.post('/send',
  authenticateToken,
  messageLimiter,  // NEW: Check rate limit
  messageController.sendMessage
);
```

### 2. API Routes
Apply per-user limiting to all protected endpoints:
```typescript
router.use(messageLimiter);  // 100 messages/hour
router.use(apiLimiter);      // 1000 requests/hour
router.use(uploadLimiter);   // 10 uploads/hour
```

### 3. WebSocket
Add rate limiting for WebSocket message events:
```typescript
socket.on('message:send', rateLimitCheck(socket, 100, 3600));
```

### 4. Webhook Allowlist
Skip rate limiting for authorized webhooks:
```typescript
app.post('/api/webhooks/telnyx', (req, res, next) => {
  if (isTelnyxWebhook(req) && verifySignature(req)) {
    // Skip rate limiting for verified webhooks
    return next();
  }
  // Otherwise apply rate limiting
});
```

## Files to Create/Modify

### New Files
1. `backend/src/services/rate-limit.service.ts` (180 lines)
2. `backend/src/middleware/rate-limit.middleware.ts` (120 lines)
3. `backend/src/config/allowlist.config.ts` (50 lines)
4. `backend/src/services/rate-limit-analytics.service.ts` (140 lines)
5. `WEEK3_PRIORITY_3_4_TEST.js` (400+ lines, test suite)

### Modified Files
1. `backend/src/routes/message.routes.ts` - Add messageLimiter
2. `backend/src/routes/auth.routes.ts` - Update auth limiter
3. `backend/src/routes/webhook.routes.ts` - Add allowlist check
4. `backend/src/controllers/webhook.controller.ts` - Allowlist verification
5. `backend/src/app.ts` - Document existing rate limiting

## Testing Strategy

### Unit Tests
1. Token bucket refill calculation
2. Rate limit checks (allowed/denied)
3. Allowlist matching
4. Header generation

### Integration Tests
1. User hitting rate limit
2. Multiple users with independent buckets
3. Webhook bypass (allowlist)
4. Rate limit reset

### Load Tests
1. Burst requests (100+ in 1 second)
2. Sustained load (1000 requests/hour)
3. Multiple concurrent users
4. Performance overhead (<5ms per request)

### Manual Testing
1. Send 100 messages, verify 101st is rejected
2. Check RateLimit headers in response
3. Verify Retry-After header
4. Test allowlist exemption

## Configuration

### Rate Limits (Configurable via ENV)
```
RATE_LIMIT_MESSAGES_PER_HOUR=100
RATE_LIMIT_API_PER_HOUR=1000
RATE_LIMIT_UPLOADS_PER_HOUR=10
RATE_LIMIT_WEBHOOKS_PER_HOUR=5
```

### Allowlist
```
RATE_LIMIT_ALLOWLIST_WEBHOOKS=telnyx,stripe
RATE_LIMIT_ALLOWLIST_SERVICES=cloudwatch-scheduler
RATE_LIMIT_ALLOWLIST_IPS=203.0.113.0/24,198.51.100.42
```

## Success Criteria
- [ ] Per-user rate limiting implemented
- [ ] Token bucket algorithm working
- [ ] Rate limit headers sent to clients
- [ ] Allowlist configuration applied
- [ ] Analytics tracking implemented
- [ ] All tests passing
- [ ] No performance regression (<5ms overhead)
- [ ] Production deployment successful

## Dependencies
No new dependencies required:
- redis: Already installed
- express: Already installed

## Backwards Compatibility
- Existing global rate limiting continues to work
- New per-user limits don't break existing code
- REST API contract unchanged (only adds RateLimit headers)
- Graceful fallback if Redis unavailable

## Rollback Plan
1. Disable per-user rate limiting in app.ts
2. Keep global rate limiting active
3. No code changes required, just config

## Performance Impact
- Token bucket lookups: ~1ms per request (Redis)
- Minimal memory overhead (<1KB per user)
- No impact when user has remaining quota

## Future Enhancements
1. Graduated rate limiting (higher tier = higher limits)
2. Burst allowance (extra tokens for specific events)
3. Rate limit trading (users can trade unused quotas)
4. Predictive throttling (slow down before limit hit)
