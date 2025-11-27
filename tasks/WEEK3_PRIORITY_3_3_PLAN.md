# Week 3 Priority 3.3: Real-time Notifications (WebSocket)

## Overview
Replace polling-based message status updates with real-time WebSocket notifications using Socket.io. Enable live delivery status updates (pending → delivered, failed, read) without clients continuously polling the API.

## Problem Statement
**Current Pain Points:**
- Clients poll `/api/messages/history` every 5-10 seconds for delivery status updates
- 80%+ of polling requests return no new data (wasteful)
- High server load from redundant polling requests
- 1-10 second delay before users see delivery confirmation

**Expected Outcome:**
- Instant delivery status updates (< 100ms)
- 80%+ reduction in polling requests
- Reduced server CPU/bandwidth consumption
- Better user experience with real-time feedback

## Architecture

### WebSocket Flow
```
1. Client connects → authenticate with JWT
2. Server joins client to church room (e.g., "church:123abc")
3. Message sent → broadcast to room members
4. Telnyx webhook received → update DB + emit real-time event
5. All connected clients see instant status update
6. Client disconnects → cleanup
```

### Room Structure
- **Per-Church Rooms**: `church:{churchId}` - Only users of that church see each other's updates
- **Per-User Rooms**: `user:{userId}` - Optional for personal notifications (optional feature)

### Message Status Events
```typescript
interface MessageStatusEvent {
  type: 'message:status_update' | 'message:sent' | 'message:failed' | 'message:delivered';
  messageId: string;
  conversationId?: string;
  status: 'pending' | 'delivered' | 'failed' | 'read';
  timestamp: ISO8601;
  failureReason?: string; // Only for failed status
  recipientCount?: number; // Total recipients
  deliveredCount?: number; // For broadcast progress
}
```

## Implementation Plan

### 1. Installation & Setup
- ✅ Install socket.io and @types/socket.io
- ✅ Create WebSocket server configuration
- ✅ Integrate with Express HTTP server
- ✅ Setup CORS for WebSocket (production domain)

### 2. WebSocket Service (`websocket.service.ts`)
**Location**: `backend/src/services/websocket.service.ts`
**Responsibility**: Core WebSocket handling

Functions:
- `initializeWebSocket(server)` - Setup Socket.io server
- `authenticateSocket(socket)` - JWT authentication middleware
- `joinChurchRoom(socket, churchId)` - Add user to church room
- `leaveChurchRoom(socket, churchId)` - Remove from room
- `broadcastMessageUpdate(churchId, event)` - Send status update to room
- `handleDisconnect(socket)` - Cleanup

### 3. WebSocket Middleware (`websocket.middleware.ts`)
**Location**: `backend/src/middleware/websocket.middleware.ts`
**Responsibility**: Authentication and authorization

- Extract JWT from query parameter (`?token=xyz`)
- Validate token structure and signature
- Extract `userId`, `churchId` from token
- Attach to socket.data for later use
- Reject invalid/expired tokens

### 4. Integration Points

#### A. Webhook Handler Updates
**File**: `backend/src/controllers/conversation.controller.ts`
**Change**: After updating message status in DB, emit WebSocket event
```typescript
// After prisma update
await io.to(`church:${churchId}`).emit('message:status_update', {
  messageId,
  status: newStatus,
  timestamp: new Date().toISOString()
});
```

#### B. Message Controller Updates
**File**: `backend/src/controllers/message.controller.ts`
**Change**: When message sent, emit event
```typescript
// After creating message
await io.to(`church:${churchId}`).emit('message:sent', {
  messageId: message.id,
  timestamp: new Date().toISOString()
});
```

### 5. Express Server Integration
**File**: `backend/src/index.ts`
**Change**: Initialize WebSocket when starting server
```typescript
import { initializeWebSocket } from './services/websocket.service.js';

const server = http.createServer(app);
const io = initializeWebSocket(server);

// Export for use in controllers/webhooks
export { io };
```

### 6. Configuration
**Location**: `backend/src/config/websocket.config.ts`
**Settings**:
```typescript
export const websocketConfig = {
  cors: {
    origin: ['https://koinoniasms.com', 'https://www.koinoniasms.com', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Websocket primary, polling fallback
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
};
```

## Testing Strategy

### Unit Tests
1. Socket authentication (valid/invalid tokens)
2. Room join/leave operations
3. Message broadcasting
4. Event emission format

### Integration Tests
1. End-to-end: Client connect → Auth → Join room → Receive update
2. Multi-user: Multiple clients in same church see same update
3. Isolation: Users in different churches don't see each other's updates
4. Disconnection: Client disconnects, room cleanup works

### Manual Testing
1. Open two browser windows as different users from same church
2. Send message in one window
3. Verify instant status update in both windows (no polling)
4. Send from Telnyx test webhook
5. Verify delivery status appears instantly

### Performance Testing
1. Measure message update latency (should be < 100ms)
2. Monitor WebSocket connections memory usage
3. Test with 100+ concurrent users
4. Verify no CPU spikes on broadcast

## Files to Create/Modify

### New Files
1. `backend/src/services/websocket.service.ts` (120 lines)
2. `backend/src/middleware/websocket.middleware.ts` (80 lines)
3. `backend/src/config/websocket.config.ts` (40 lines)
4. `WEEK3_PRIORITY_3_3_TEST.js` (300+ lines, test suite)

### Modified Files
1. `backend/package.json` - Add socket.io dependency
2. `backend/src/index.ts` - Initialize WebSocket
3. `backend/src/controllers/conversation.controller.ts` - Emit on webhook
4. `backend/src/controllers/message.controller.ts` - Emit on send
5. `backend/src/app.ts` - Add WebSocket CORS if needed

## Success Criteria
- [ ] WebSocket server initializes without errors
- [ ] JWT authentication works (valid/invalid tokens)
- [ ] Clients successfully join church rooms
- [ ] Message status updates broadcast instantly
- [ ] Event format matches specification
- [ ] Multiple concurrent clients receive updates
- [ ] Delivery latency < 100ms
- [ ] No memory leaks on client disconnect
- [ ] All tests passing
- [ ] Production deployment successful

## Dependencies
- socket.io: ^4.7.0
- @types/socket.io: ^3.0.2

## Rollback Plan
1. If WebSocket service fails, clients fallback to polling
2. Disable Socket.io in websocket.config.ts if needed
3. Remove event emissions from controllers if causing issues
4. Can continue using HTTP polling as before

## Notes
- Keep WebSocket service simple and focused on delivery
- Don't implement complex logic in WebSocket handlers
- Use Redis adapter if scaling to multiple server instances (future)
- Security: Always validate JWT before allowing room access
