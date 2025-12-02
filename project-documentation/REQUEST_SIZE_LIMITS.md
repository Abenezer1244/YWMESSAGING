# Request Size Limits Configuration

**Status**: ✅ Implemented across all API endpoints

---

## Overview

Request size limits prevent Denial-of-Service (DoS) attacks where attackers send extremely large payloads to:
- Exhaust server memory
- Consume bandwidth
- Cause application crashes
- Disrupt service for legitimate users

---

## Current Limits

| Endpoint | Limit | Use Case | Typical Size |
|----------|-------|----------|--------------|
| JSON API (`/api/*`) | 10 MB | Conversations, messages, bulk operations | < 1 MB |
| Webhooks (`/api/webhooks/*`) | 10 MB | Telnyx, Stripe, SendGrid events | < 100 KB |
| URL-encoded forms | 10 MB | Form submissions (rare in this app) | < 10 KB |
| File uploads (Multer) | 500 MB | Media files (images, videos, documents) | 100 KB - 300 MB |

---

## How It Works

When a request exceeds the size limit:

```javascript
// Request too large
POST /api/messages/send
Content-Type: application/json
Content-Length: 15000000  // 15 MB > 10 MB limit

// Response (413 Payload Too Large)
{
  "error": "Payload too large"
}
```

**Status Code**: 413 (Payload Too Large)
**Error Handling**: Automatically caught by Express parser, returns error before reaching route handler

---

## Typical Request Sizes (Reference)

### Send Message (10 recipients)
```json
{
  "content": "Hello everyone!",
  "recipientIds": [
    "uuid-1", "uuid-2", ..., "uuid-10"
  ]
}
```
**Size**: ~800 bytes
**Status**: ✅ Well under 10 MB limit

### Bulk Message Send (1,000 recipients)
```json
{
  "content": "Announcement",
  "recipientIds": [
    // 1,000 UUIDs (36 bytes each)
  ]
}
```
**Size**: ~36 KB
**Status**: ✅ Well under 10 MB limit

### Large Media Upload
```
POST /api/messages/conversations/{id}/reply-with-media
Content-Type: multipart/form-data

file: [binary data]  // 300 MB video
```
**Size**: 300 MB
**Limit**: 500 MB (Multer)
**Status**: ✅ Under Multer limit (different from JSON limit)

### Webhook from Telnyx (Inbound MMS)
```json
{
  "data": {
    "event_type": "message.received",
    "payload": {
      "from": "+12025551234",
      "to": "+12025555678",
      "text": "Message content",
      "media": [
        { "url": "https://s3.../file.jpg", "size": 125000 }
      ]
    }
  }
}
```
**Size**: ~2 KB
**Limit**: 10 MB
**Status**: ✅ Well under limit

---

## Why 10 MB?

### Conservative Choice
- 10 MB is sufficient for all legitimate API use cases
- No legitimate client should send > 10 MB JSON
- Provides safety margin without impacting functionality

### DOS Protection
- Prevents attackers from overwhelming server memory
- Stops bandwidth exhaustion attacks
- Reduces attack surface significantly

### Comparison
| Limit | Rationale | Blocking |
|-------|-----------|----------|
| No limit | Vulnerable | Unlimited payload attacks |
| 1 MB | Too restrictive | Legitimate bulk operations |
| **10 MB** | **Balanced** | **Prevents abuse, allows legitimate use** |
| 100 MB | Too permissive | Allows memory exhaustion |

---

## File Upload Limits (Different from Request Limits)

File uploads use Multer, which has separate configuration:

```typescript
// app.ts - For media routes
const upload = multer({
  dest: path.join(process.cwd(), 'temp'),
  limits: {
    fileSize: 500 * 1024 * 1024  // 500 MB for media files
  }
});
```

**Why different limits?**
- JSON payloads: 10 MB (typical API data)
- Media files: 500 MB (images, videos, documents)
- File upload is a separate code path with different memory handling

---

## Testing Request Size Limits

### Test 1: Normal Request (Passes)
```bash
# ~1 KB JSON (well under 10 MB limit)
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"Hello","recipientIds":["uuid-1"]}'

# ✅ Response: 200 OK
```

### Test 2: Oversized Request (Blocked)
```bash
# Create 15 MB payload
python3 << 'EOF'
import json
payload = {"data": "x" * (15 * 1024 * 1024)}
with open('large.json', 'w') as f:
    f.write(json.dumps(payload))
EOF

# Send it
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @large.json

# ❌ Response: 413 Payload Too Large
```

### Test 3: Webhook Within Limit
```bash
# ~2 KB webhook (under 10 MB limit)
curl -X POST http://localhost:3000/api/webhooks/telnyx/mms \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "message.received",
    "payload": {
      "from": "+12025551234",
      "text": "Test message"
    }
  }'

# ✅ Response: 200 OK
```

---

## Monitoring & Alerts

### What to Monitor

Check application logs for:
```
[Express] Error: Payload too large
```

If you see this frequently, it could indicate:
1. **Client bug**: Frontend sending excessive data
2. **Attack**: DoS attempt with large payloads
3. **Misconfiguration**: Legitimate case that needs larger limit

### Legitimate Cases Requiring Larger Limit

If you need larger limits, update in `app.ts`:

```typescript
app.use(express.json({
  limit: '50 mb'  // Only if you have legitimate use case
}));
```

**Document the reason**:
- [ ] What data requires > 10 MB?
- [ ] How frequently is this needed?
- [ ] Can the request be split into multiple API calls?

---

## Security Implications (OWASP)

This addresses **OWASP A05: Broken Access Control** indirectly:
- Prevents resource exhaustion attacks
- Ensures fair resource allocation
- Protects against abusive clients

---

## Implementation Details (Code)

### app.ts Configuration
```typescript
// ✅ SECURITY: Request size limits (DoS protection)
app.use(express.json({
  limit: '10 mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10 mb'
}));
app.use('/api/webhooks/', express.raw({
  type: 'application/json',
  limit: '10 mb'
}));
```

### Multer Configuration (message.routes.ts)
```typescript
const upload = multer({
  dest: path.join(process.cwd(), 'temp'),
  limits: {
    fileSize: 500 * 1024 * 1024  // 500 MB
  }
});
```

---

## Adjustment Checklist

If you need to change limits:

- [ ] Identify legitimate use case requiring larger limit
- [ ] Calculate actual maximum needed size
- [ ] Update documentation (this file)
- [ ] Test with new limit
- [ ] Monitor for impact
- [ ] Notify team of change

---

## Related Security Measures

| Measure | Purpose | Limit |
|---------|---------|-------|
| **Request Size** | Prevent payload exhaustion | 10 MB |
| **Rate Limiting** | Prevent request floods | 100 req/15 min |
| **File Upload** | Prevent storage exhaustion | 500 MB |
| **Message Length** | Prevent SMS oversizing | 160 characters |
| **Webhook IP** | Verify trusted sources | Whitelist only |

---

**Last Updated**: December 2, 2025
**Status**: Production-ready
**Impact**: Prevents DoS attacks via oversized payloads
**Performance**: Minimal overhead (checks Content-Length header)
