# Week 3: API & Real-time Optimization

**Target Completion**: November 27, 2025
**Production URL**: https://api.koinoniasms.com
**Status**: 🟡 PLANNING

---

## Overview

Week 2 successfully optimized the database layer (connection pooling, N+1 fixes, indexes, caching). Week 3 focuses on optimizing the API layer and adding real-time capabilities to enhance user experience and scalability.

---

## Week 3 Priorities (4 Sequential Phases)

### Priority 3.1: HTTP Response Optimization
**Goal**: Reduce API response payload size and latency through compression, ETag caching, and selective field inclusion

**Objectives**:
1. Implement gzip compression for responses >1KB
2. Add ETag support for cache validation
3. Implement response field filtering (sparse fields)
4. Add HTTP cache headers (Cache-Control, Expires)

**Expected Impact**:
- 60-70% payload reduction on large responses
- Reduced network bandwidth usage
- Better mobile performance
- Client-side cache utilization

**Files to Modify**:
- `backend/src/middleware/response-compression.middleware.ts` (CREATE)
- `backend/src/middleware/etag.middleware.ts` (CREATE)
- `backend/src/utils/response-formatter.ts` (CREATE)
- `backend/src/index.ts` - Add middleware integration

**Success Criteria**:
- ✅ All responses compressed
- ✅ ETag generation and validation working
- ✅ Cache headers properly set
- ✅ No increase in API response time (<100ms overhead)

---

### Priority 3.2: Message Delivery Optimization
**Goal**: Improve message delivery reliability through exponential backoff, circuit breaker pattern, and delivery tracking

**Objectives**:
1. Implement exponential backoff retry logic (3 attempts with 1s, 2s, 4s delays)
2. Add circuit breaker pattern for Telnyx API failures
3. Implement delivery tracking with webhook validation
4. Add Dead Letter Queue (DLQ) for failed messages

**Expected Impact**:
- 95%+ message delivery success rate
- Graceful degradation under Telnyx API outages
- Better visibility into delivery failures
- Reduced support tickets from failed deliveries

**Files to Modify**:
- `backend/src/services/message-delivery.service.ts` (CREATE)
- `backend/src/services/circuit-breaker.service.ts` (CREATE)
- `backend/src/services/telnyx.service.ts` - Integrate retry logic
- `backend/src/services/conversation.service.ts` - Use delivery service

**Success Criteria**:
- ✅ Retries working correctly
- ✅ Circuit breaker preventing cascade failures
- ✅ Delivery tracking accurate
- ✅ DLQ storing failed messages for manual review

---

### Priority 3.3: Real-time Notifications (WebSocket)
**Goal**: Enable live message status updates through WebSocket connections

**Objectives**:
1. Set up Socket.io integration
2. Implement connection authentication
3. Create rooms for each church/user
4. Broadcast message status updates in real-time
5. Add message delivery confirmation events

**Expected Impact**:
- Real-time message status updates (delivered, failed, read)
- Reduced polling requests by 80%+
- Better user experience with live feedback
- Reduced API load from constant polling

**Files to Create**:
- `backend/src/websocket/socket-manager.ts`
- `backend/src/websocket/message-events.ts`
- `backend/src/websocket/room-manager.ts`
- `backend/src/services/notification.service.ts`

**Success Criteria**:
- ✅ WebSocket connections stable
- ✅ Message updates delivered in real-time
- ✅ Proper cleanup on disconnect
- ✅ Load testing shows 80%+ polling reduction

---

### Priority 3.4: Rate Limiting & Request Throttling
**Goal**: Prevent abuse and ensure fair resource allocation through intelligent rate limiting

**Objectives**:
1. Implement per-user rate limiting (e.g., 100 messages/minute)
2. Add per-IP rate limiting for login endpoints
3. Implement token bucket algorithm
4. Add rate limit response headers
5. Create allowlist for trusted clients

**Expected Impact**:
- Prevent brute force attacks
- Fair resource distribution
- Better platform stability
- Reduced cost from API abuse

**Files to Create**:
- `backend/src/middleware/rate-limit.middleware.ts`
- `backend/src/services/rate-limiter.service.ts`

**Success Criteria**:
- ✅ Rate limits enforced correctly
- ✅ Proper error responses (429 Too Many Requests)
- ✅ Rate limit headers present
- ✅ Allowlist functionality working

---

## Implementation Sequence

```
Week 3 Timeline:
├─ Priority 3.1 (HTTP Optimization) - 1 day
│  ├─ Implement compression middleware
│  ├─ Add ETag support
│  ├─ Add response filtering
│  └─ Test and verify <50ms overhead
│
├─ Priority 3.2 (Message Delivery) - 1.5 days
│  ├─ Implement retry logic
│  ├─ Add circuit breaker
│  ├─ Create DLQ service
│  └─ Integration testing
│
├─ Priority 3.3 (WebSocket) - 1.5 days
│  ├─ Set up Socket.io
│  ├─ Implement authentication
│  ├─ Create event handlers
│  └─ Real-time testing
│
└─ Priority 3.4 (Rate Limiting) - 1 day
   ├─ Implement rate limiting
   ├─ Add to middleware chain
   ├─ Configure limits per endpoint
   └─ Security testing
```

---

## Testing Strategy

### Unit Tests
- Test retry logic with mock failures
- Test circuit breaker state transitions
- Test rate limiter algorithm
- Test compression middleware

### Integration Tests
- Test message delivery end-to-end
- Test WebSocket connections and events
- Test rate limiting with multiple requests
- Test ETag validation

### Load Testing
- Verify compression doesn't increase response time
- Test WebSocket with 100+ concurrent connections
- Test rate limiting under load
- Measure polling reduction

### Production Verification
- Real-time smoke tests
- Monitor message delivery success rate
- Track WebSocket connection stability
- Verify rate limiting effectiveness

---

## Success Metrics

| Metric | Current | Week 3 Target | Status |
|--------|---------|---------------|--------|
| **Avg Response Time** | 52ms | <60ms | 🟡 |
| **Response Payload Size** | ~15KB | <5KB | 🟡 |
| **Message Delivery Success** | 85% | 95%+ | 🟡 |
| **API Polling Requests** | 10,000/day | 2,000/day | 🟡 |
| **WebSocket Connections** | 0 | 80%+ users | 🟡 |
| **Rate Limit Breaches** | N/A | <1% | 🟡 |

---

## Risk Mitigation

### Risk 1: WebSocket Connection Stability
- **Mitigation**: Implement reconnection logic with exponential backoff
- **Fallback**: Graceful degradation to polling
- **Testing**: Stress test with network interruptions

### Risk 2: Rate Limiter False Positives
- **Mitigation**: Whitelist for internal/batch operations
- **Fallback**: Manual allowlist override
- **Testing**: Test with realistic traffic patterns

### Risk 3: Delivery Service Complexity
- **Mitigation**: Careful error handling and logging
- **Fallback**: Manual retry interface for support team
- **Testing**: Chaos engineering with Telnyx API failures

---

## Dependencies

- ✅ Socket.io (npm install)
- ✅ Redis (already installed for caching)
- ✅ Compression middleware (npm install compression)
- ⚠️ Telnyx API stability (external)

---

## Rollback Plan

Each priority has an independent rollback path:

1. **HTTP Optimization**: Remove middleware, test API without compression
2. **Message Delivery**: Revert to synchronous sends, disable circuit breaker
3. **WebSocket**: Disable Socket.io, fall back to polling
4. **Rate Limiting**: Disable middleware, remove request tracking

---

## Next Steps (Pending User Approval)

1. ✅ Review this Week 3 plan
2. ⏳ Approve priorities and sequence
3. ⏳ Begin Priority 3.1 implementation
4. ⏳ Proceed with Priority 3.2, 3.3, 3.4 sequentially
5. ⏳ Production deployment and verification testing

---

**Status**: 🟡 AWAITING APPROVAL
**Estimated Completion**: 5 days (following user approval)
**Complexity Level**: MEDIUM (balanced between innovation and stability)

