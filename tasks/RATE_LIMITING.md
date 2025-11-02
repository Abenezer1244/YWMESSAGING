# Rate Limiting Configuration Guide

## Overview

Rate limiting is implemented to protect API endpoints from brute-force attacks, DDoS, and abuse. The system uses `express-rate-limit` middleware with IP-based tracking.

---

## Rate Limiting Tiers

### 1. Authentication Endpoints (Strictest)

**Endpoints:** `/api/auth/login`, `/api/auth/register`

**Configuration:**
- **Window:** 15 minutes
- **Limit:** 5 requests per 15 minutes
- **Response:** 429 Too Many Requests
- **Message:** "Too many login/signup attempts. Please try again later."

**Why:** Prevents brute-force password guessing and account enumeration attacks.

**Testing:**
```bash
# This should work (5th attempt)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# This should fail with 429 (6th attempt)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

### 2. Password Reset Endpoint (Very Strict)

**Endpoint:** `/api/auth/password-reset`

**Configuration:**
- **Window:** 1 hour
- **Limit:** 3 requests per hour
- **Response:** 429 Too Many Requests
- **Message:** "Too many password reset attempts. Please try again later."

**Why:** Prevents account takeover via password reset abuse.

---

### 3. Billing/Payment Endpoints (Very Strict)

**Endpoints:** `/api/billing/*` (all billing operations)

**Configuration:**
- **Window:** 15 minutes
- **Limit:** 5 requests per 15 minutes
- **Response:** 429 Too Many Requests
- **Message:** "Too many payment attempts. Please try again later."

**Why:** Prevents payment fraud, duplicate charges, and subscription abuse.

**Affected Operations:**
- Create payment intent
- Activate subscription
- Upgrade/downgrade plan
- Billing history queries
- Invoice generation

---

### 4. General API Endpoints (Moderate)

**Endpoints:**
- `/api/branches/*`
- `/api/groups/*`
- `/api/messages/*`
- `/api/templates/*`
- `/api/recurring/*`
- `/api/analytics/*`
- `/api/admin/*`

**Configuration:**
- **Window:** 15 minutes
- **Limit:** 100 requests per 15 minutes
- **Response:** 429 Too Many Requests

**Why:** Reasonable limit for normal application usage while preventing abuse.

**Calculation:** 100 requests per 15 minutes ≈ 6.7 requests per minute (0.11 req/sec)

---

## How It Works

### IP-Based Tracking

Rate limits are tracked per client IP address:

```typescript
keyGenerator: (req) => {
  // Use IP address for rate limiting
  return (req.ip || req.socket.remoteAddress) as string;
}
```

**Important:** The application is configured with `trust proxy: 1` for Render deployment. This means:
- ✅ X-Forwarded-For header is trusted
- ✅ Correct client IP detected even behind reverse proxy
- ✅ Rate limiting works correctly in production

### Rate Limit Headers

The system returns standard rate limit information in response headers:

```
RateLimit-Limit: 5
RateLimit-Remaining: 3
RateLimit-Reset: 1234567890
```

**Note:** Legacy `X-RateLimit-*` headers are disabled (not needed with modern clients).

---

## Client Behavior

### Handling Rate Limits

When client receives 429 response:

```typescript
// Frontend API client should:
// 1. Show error message to user
// 2. Parse RateLimit-Reset header
// 3. Disable submit button until reset time
// 4. Show countdown timer to user

if (response.status === 429) {
  const resetTime = response.headers.get('RateLimit-Reset');
  const waitSeconds = Math.ceil((parseInt(resetTime) * 1000 - Date.now()) / 1000);

  toast.error(`Too many attempts. Wait ${waitSeconds}s before retrying.`);
  // Disable button for waitSeconds
}
```

### Legitimate High-Volume Scenarios

If your application legitimately needs higher limits:

1. **Contact support** to discuss your use case
2. **Implement request batching** to reduce API calls
3. **Use webhooks** instead of polling for updates
4. **Cache responses** to avoid repeated requests

---

## Production Considerations

### 1. Environment Variables

No additional environment variables needed. Rate limits are hardcoded for security.

If you need to adjust limits:
- Update values in `backend/src/app.ts`
- Test thoroughly
- Deploy through standard CI/CD pipeline

### 2. Monitoring

Monitor rate limit violations:

```typescript
// Optional: Log rate limit hits in production
app.use((req, res, next) => {
  const remaining = res.getHeader('RateLimit-Remaining');
  if (remaining !== undefined && remaining < 2) {
    console.warn(`Low remaining requests for ${req.ip}:`, remaining);
  }
  next();
});
```

### 3. DDoS Protection

Rate limiting alone is not sufficient for DDoS protection. Recommended additional measures:

- **WAF (Web Application Firewall):** Cloudflare, AWS Shield
- **CDN:** Cache static assets, absorb traffic spikes
- **Load Balancing:** Distribute traffic across multiple instances
- **CAPTCHA:** Add on elevated rate limits (optional)

---

## Testing Rate Limits

### Test 1: Auth Endpoint Rate Limit

```bash
#!/bin/bash

# Test auth rate limiting (should fail on 6th attempt)
for i in {1..7}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

**Expected Result:**
- ✅ Attempts 1-5: 200 or 401 (depending on credentials)
- ❌ Attempt 6 onwards: 429 Too Many Requests

---

### Test 2: General API Rate Limit

```bash
#!/bin/bash

# Test API rate limiting (100 requests per 15 minutes)
# This script makes 105 requests to verify cutoff

for i in {1..105}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:3000/api/messages \
    -H "Authorization: Bearer $TOKEN")

  if [ "$STATUS" = "429" ]; then
    echo "Rate limited at request $i"
    break
  fi

  echo "Request $i: $STATUS"
done
```

---

### Test 3: Verify Headers

```bash
# Check rate limit headers
curl -I http://localhost:3000/api/auth/login

# Expected headers:
# RateLimit-Limit: 5
# RateLimit-Remaining: 4
# RateLimit-Reset: 1698765432
```

---

### Test 4: Different IP Addresses

```bash
# Each IP has independent limits
curl -H "X-Forwarded-For: 192.168.1.1" http://localhost:3000/api/auth/login
curl -H "X-Forwarded-For: 192.168.1.2" http://localhost:3000/api/auth/login

# Both should succeed on first attempt (different IPs = independent counters)
```

---

## Troubleshooting

### Issue: Getting 429 on legitimate requests

**Possible Causes:**
1. **Shared IP:** Multiple users behind same proxy/NAT get counted together
   - Solution: Implement user-based rate limiting (see below)

2. **Aggressive client:** Client retrying too quickly
   - Solution: Add exponential backoff on client side

3. **Rate limit too strict for your use case**
   - Solution: Contact to discuss adjusting limits

### Issue: Rate limits not working

**Check:**
1. Middleware applied correctly in app.ts
2. IP address detection: `req.ip` vs `req.socket.remoteAddress`
3. Trust proxy setting: `app.set('trust proxy', 1)`
4. Headers in response: `RateLimit-*` headers present

---

## Advanced: User-Based Rate Limiting

For better control, you can implement user-based rate limiting instead of IP-based:

```typescript
// User-based rate limiter (requires authentication)
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    // Use user ID if authenticated, fallback to IP
    return (req.user?.id || req.ip) as string;
  },
});

// Apply to authenticated routes
app.use('/api/messages', verifyToken, userLimiter, messageRoutes);
```

---

## Security Checklist

Before production deployment:

- [ ] Rate limits configured for all sensitive endpoints
- [ ] Auth endpoints have strict limits (5 per 15 min)
- [ ] Billing endpoints have very strict limits (5 per 15 min)
- [ ] General API endpoints have reasonable limits (100 per 15 min)
- [ ] Trust proxy set for production environment
- [ ] Error messages are user-friendly
- [ ] Frontend handles 429 responses gracefully
- [ ] Rate limit headers returned in responses
- [ ] Monitoring/logging configured for violations
- [ ] WAF/CDN used for additional DDoS protection

---

## Resources

- [express-rate-limit Documentation](https://www.npmjs.com/package/express-rate-limit)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [Render Deployment & Trust Proxy](https://render.com/docs)

---

**Last Updated:** 2024-10-30
**Status:** Implemented & Tested
**Security Level:** ⭐⭐⭐⭐ (High)
