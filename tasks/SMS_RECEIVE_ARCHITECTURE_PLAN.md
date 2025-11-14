# SMS Receive-First Architecture Plan
## Church SMS Hub - Conversations Model

**Objective:** Transform Koinonia Connect from a **broadcast SMS system** to a **receive-first SMS conversation system**

---

## CURRENT STATE ANALYSIS

### ✅ What Exists
- Telnyx integration (phone number purchase, send SMS)
- Database schema with Church.telnyxPhoneNumber
- Webhook infrastructure (Stripe webhooks already implemented)
- SMS queue system (Bull)
- Telnyx service with `sendSMS()` function
- Authentication/authorization framework

### ❌ What's Missing
- **Inbound SMS webhook handler** - No endpoint to receive SMS from congregation
- **Conversation model** - No way to store two-way conversations
- **Reply functionality** - No way for leaders to reply
- **Conversation UI** - Dashboard doesn't show conversations
- **Phone number resolution** - How to match incoming SMS to Members
- **Analytics** - No metrics for conversations

---

## IMPLEMENTATION PHASES

### PHASE 0: MEDIA SHARING FOUNDATION (Optional but Recommended)

**See:** `PHASE1_MEDIA_SHARING_PLAN.md`

Add image/document sharing to SMS conversations via Cloudinary:
- Leaders upload images from dashboard
- System auto-compresses and stores on Cloudinary
- SMS sent with short link to image
- Members click link → view in browser
- Works on any phone, even SMS-only devices
- Supports: Images (JPG, PNG, GIF), Documents (PDF, DOCX, XLSX)
- Max 5MB per file

**Why Phase 0?**
- Adds to Core Architecture immediately
- Uses existing Cloudinary account
- Extends SMS with media capability
- Zero new services needed

**Timeline:** +4 hours development
**Cost:** $0-99/month (Cloudinary)

---

### PHASE 1: DATABASE SCHEMA (Schema Changes)

**New Tables to Create:**

#### 1. **Conversation** Model
Represents a conversation between congregation member and church

```prisma
model Conversation {
  id                String   @id @default(cuid())
  churchId          String
  memberId          String
  lastMessageAt     DateTime?
  status            String   @default("open")  // open, closed, archived
  unreadCount       Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  church            Church   @relation(fields: [churchId], references: [id], onDelete: Cascade)
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  messages          ConversationMessage[]

  @@unique([churchId, memberId])
  @@index([churchId])
  @@index([lastMessageAt])
  @@index([status])
}

model ConversationMessage {
  id              String   @id @default(cuid())
  conversationId  String
  memberId        String   // Who sent it (congregation or leader via system)
  content         String
  direction       String   // "inbound" (from congregation), "outbound" (from leader)

  // Telnyx tracking
  providerMessageId String?  // Telnyx message ID for outbound
  deliveryStatus  String?    // pending, delivered, failed (for outbound)

  createdAt       DateTime @default(now())

  // Relations
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  member          Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([createdAt])
  @@index([direction])
}

model Member {
  // Add to existing Member model:
  conversations     Conversation[]
  conversationMessages ConversationMessage[]
  phoneHash         String?  // Update: will be used for inbound SMS matching
}

model Church {
  // Add to existing Church model:
  conversations     Conversation[]
}
```

**Migration Steps:**
1. Create `Conversation` model
2. Create `ConversationMessage` model
3. Add relations to `Member` and `Church`
4. Run `prisma migrate dev`
5. Run `prisma generate` to update client

---

### PHASE 2: BACKEND - INBOUND SMS HANDLING

#### New File: `backend/src/services/conversation.service.ts`

**Functions:**
```typescript
// Find or create conversation
async findOrCreateConversation(churchId, memberId)

// Create inbound message from SMS
async createInboundMessage(conversationId, memberId, content)

// Update last message timestamp
async updateLastMessageAt(conversationId)

// Mark messages as read
async markAsRead(conversationId)

// Get conversation with messages (paginated)
async getConversation(conversationId, page, limit)

// Get all conversations for church (sorted by lastMessageAt)
async getConversations(churchId, status, page, limit)
```

#### Update: `backend/src/services/telnyx.service.ts`

**Add Function:**
```typescript
// Match phone number to member
async findMemberByPhone(churchId: string, phone: string): Promise<Member | null>
  // 1. Try exact match on phoneHash
  // 2. Log if found/not found
  // 3. For unknown callers: create new Member with phone

// Handle inbound SMS
async handleInboundSMS(churchId, senderPhone, messageContent)
  // 1. Find/create member by phone
  // 2. Find/create conversation
  // 3. Create inbound message
  // 4. Return conversation ID
```

#### New File: `backend/src/controllers/conversation.controller.ts`

**Endpoints:**
```typescript
// GET /api/conversations
getConversations(churchId, status, page, limit)

// GET /api/conversations/:conversationId
getConversation(conversationId)

// POST /api/conversations/:conversationId/reply
replyToConversation(conversationId, content)
  // 1. Get conversation with member details
  // 2. Create outbound ConversationMessage
  // 3. Add SMS job to smsQueue
  // 4. Return message with pending status

// PATCH /api/conversations/:conversationId/read
markAsRead(conversationId)

// PATCH /api/conversations/:conversationId/status
updateStatus(conversationId, status)
```

#### Update: `backend/src/controllers/message.controller.ts`

**Add Function:**
```typescript
// Handle Telnyx inbound SMS webhook
handleTelnyxInbound(req: Request, res: Response)
  // 1. Parse webhook: type, from, to, body
  // 2. Extract church ID from Telnyx number
  // 3. Call telnyxService.handleInboundSMS()
  // 4. Return 200 OK to acknowledge
```

#### Update: `backend/src/routes/message.routes.ts`

**Add Routes:**
```
POST   /api/webhooks/telnyx/inbound    → handleTelnyxInbound
GET    /api/conversations              → getConversations (new file)
GET    /api/conversations/:id          → getConversation
POST   /api/conversations/:id/reply    → replyToConversation
PATCH  /api/conversations/:id/read     → markAsRead
PATCH  /api/conversations/:id/status   → updateStatus
```

#### Update: `backend/src/jobs/queue.ts`

**SMS Job Processor:**
```typescript
// When smsQueue receives job:
smsQueue.process(async (job) => {
  const { conversationMessageId, content, phone, churchId } = job.data

  try {
    // 1. Send SMS via Telnyx
    const result = await telnyxService.sendSMS(phone, content, churchId)

    // 2. Update ConversationMessage with providerMessageId
    await prisma.conversationMessage.update({
      where: { id: conversationMessageId },
      data: {
        providerMessageId: result.messageSid,
        deliveryStatus: 'pending'
      }
    })

    // 3. Mark job complete
    return { success: true, messageSid: result.messageSid }
  } catch (error) {
    // 4. Retry or mark as failed
    throw error
  }
})
```

---

### PHASE 3: FRONTEND - CONVERSATION UI

#### New File: `frontend/src/pages/dashboard/ConversationsPage.tsx`

**Features:**
```
┌─────────────────────────────────────────────────────┐
│ Conversations                    [Search] [Filter]  │
├─────────────────────────────────────────────────────┤
│ ┌─ John Doe                          [Unread: 2]   │
│ │ "Hi pastor, can I volunteer?"      2h ago        │
│ │                                                    │
│ ├─ Jane Smith                        [Unread: 1]   │
│ │ "Thank you for the service"        5h ago        │
│ │                                                    │
│ └─ Bob Johnson                       [Read]        │
│   "Amen"                              1d ago        │
└─────────────────────────────────────────────────────┘
```

**Components:**
1. ConversationsList - List all conversations
2. ConversationDetail - Open conversation thread
3. MessageThread - Show inbound/outbound messages
4. ReplyComposer - Text input + send button
5. ConversationHeader - Member info, status, actions

#### Update: `frontend/src/api/conversations.ts` (NEW)

```typescript
// Get conversations
getConversations(page, limit, status)

// Get single conversation
getConversation(conversationId)

// Send reply
replyToConversation(conversationId, content)

// Mark as read
markAsRead(conversationId)

// Update status
updateStatus(conversationId, status)
```

#### Update: Dashboard Navigation

**Remove:**
- SendMessagePage (broadcast not needed)
- TemplatesPage (broadcast)
- RecurringMessagesPage (broadcast)

**Add:**
- ConversationsPage (main SMS feature)

---

### PHASE 4: ANALYTICS & REPORTING

#### Update: `frontend/src/pages/dashboard/AnalyticsPage.tsx`

**New Metrics:**
```
SMS Conversations
├── Total conversations: 42
├── Unread conversations: 5
├── Average response time: 2.3 hours
├── Most active members: [list]
└── Engagement chart (messages/day)
```

#### Update: `backend/src/services/analytics.service.ts`

**New Functions:**
```typescript
// Get conversation metrics
getConversationMetrics(churchId, dateRange)

// Get member engagement
getMemberEngagement(churchId)

// Get response times
getAverageResponseTime(churchId)
```

---

## TELNYX WEBHOOK CONFIGURATION

**What to Configure in Telnyx Dashboard:**

1. **Inbound SMS Webhook**
   - Endpoint: `https://api.koinoniasms.com/api/webhooks/telnyx/inbound`
   - Event: `message.received`
   - Format: JSON

2. **Outbound SMS Webhook** (Already configured)
   - Endpoint: `https://api.koinoniasms.com/api/messages/webhooks/telnyx/status`
   - Event: `message.dlr` (delivery receipt)

3. **Test Webhook**
   - Send SMS to church's Telnyx number from test phone
   - Verify webhook received in logs

---

## PHONE NUMBER RESOLUTION STRATEGY

### Challenge
Incoming SMS only has sender phone number. How to match to Member?

### Solution

**Step 1: Try Exact Match**
```
incoming phone → search Member.phoneHash → found? ✅
```

**Step 2: Create Unknown Member**
```
incoming phone → not found → create Member with:
  - phone (encrypted)
  - phoneHash (for future matching)
  - firstName: "" (empty - to be filled later)
  - lastName: "Congregation Member"
  - email: null
  - optInSms: true
```

**Step 3: Manual Matching (Admin)**
```
Dashboard shows: "Unknown member from +1-555-0123"
Admin clicks: "Link to existing member"
System updates: conversationMessage.memberId = correct Member
```

---

## DATA FLOW DIAGRAM

### Inbound SMS
```
Congregation texts church number
        ↓
Telnyx receives SMS
        ↓
Telnyx sends webhook to /api/webhooks/telnyx/inbound
        ↓
Controller: handleTelnyxInbound()
        ↓
Service: telnyxService.handleInboundSMS()
  1. Find/create Member by phone
  2. Find/create Conversation
  3. Create ConversationMessage (direction: inbound)
        ↓
Frontend: ConversationsPage refreshes
        ↓
Leader sees new message in conversation
```

### Outbound SMS (Reply)
```
Leader types reply in dashboard
        ↓
Frontend: POST /api/conversations/:id/reply
        ↓
Controller: replyToConversation()
  1. Create ConversationMessage (direction: outbound)
  2. Add job to smsQueue
  3. Return message with "pending" status
        ↓
Queue processor receives job
        ↓
Service: telnyxService.sendSMS()
  1. Call Telnyx API
  2. Get messageSid back
        ↓
Update ConversationMessage:
  - providerMessageId = messageSid
  - deliveryStatus = pending
        ↓
Telnyx sends webhook to /api/messages/webhooks/telnyx/status
        ↓
Update ConversationMessage:
  - deliveryStatus = delivered/failed
        ↓
Frontend shows updated status
```

---

## IMPLEMENTATION CHECKLIST

### Database (Week 1)
- [ ] Create Conversation model
- [ ] Create ConversationMessage model
- [ ] Update Member relations
- [ ] Update Church relations
- [ ] Run migrations
- [ ] Test schema with sample queries

### Backend Services (Week 1-2)
- [ ] Create conversation.service.ts
- [ ] Update telnyx.service.ts with inbound handling
- [ ] Create conversation.controller.ts
- [ ] Update message.controller.ts with inbound webhook
- [ ] Update message.routes.ts with new endpoints
- [ ] Add SMS job processor
- [ ] Test all endpoints with Postman

### Frontend (Week 2-3)
- [ ] Create ConversationsPage.tsx
- [ ] Create conversation components (List, Detail, Thread, Composer)
- [ ] Create api/conversations.ts client
- [ ] Update dashboard navigation
- [ ] Remove broadcast pages
- [ ] Test conversation flow

### Integration & Testing (Week 3)
- [ ] Configure Telnyx webhooks
- [ ] Send test SMS from phone
- [ ] Verify message appears in dashboard
- [ ] Test reply flow
- [ ] Verify SMS delivered
- [ ] Check delivery status updates
- [ ] Load test with bulk conversations

### Analytics (Week 4)
- [ ] Update analytics page
- [ ] Add conversation metrics
- [ ] Add engagement tracking
- [ ] Test analytics queries

---

## SECURITY CONSIDERATIONS

✅ **Already in place:**
- JWT authentication on all endpoints
- Church ownership verification
- Phone encryption in database
- HTTPS only webhooks

⚠️ **To implement:**
- [ ] Telnyx webhook signature validation
- [ ] Rate limit conversation creation
- [ ] Rate limit reply sending
- [ ] Audit logging for conversations
- [ ] Member consent (optInSms check before storing)
- [ ] Data retention policy (delete old conversations after 90 days?)

---

## ROLLBACK PLAN (If Issues)

If something breaks during rollback:
1. Disable /api/webhooks/telnyx/inbound in Telnyx dashboard
2. Keep old broadcast pages in `/pages/dashboard/` (don't delete)
3. Revert ConversationsPage navigation entry
4. Database tables can stay (won't cause issues)
5. Revert conversation routes if needed

---

## PERFORMANCE CONSIDERATIONS

- **Conversation pagination:** Load 20 conversations per page
- **Message pagination:** Load 50 messages per scroll
- **Unread count:** Cache in Redis, invalidate on new message
- **Analytics:** Use aggregation pipeline for metrics
- **Indexes:** Already planned (churchId, lastMessageAt, status)

---

## ESTIMATED TIMELINE

| Phase | Component | Effort | Timeline |
|-------|-----------|--------|----------|
| **0** | **Media sharing** | **16 hours** | **Day 1 (Optional)** |
| 1 | Database schema | 4 hours | Day 1-2 |
| 2 | Backend services | 16 hours | Days 2-3 |
| 3 | Frontend UI | 20 hours | Days 4-5 |
| 4 | Integration testing | 8 hours | Day 6 |
| 5 | Analytics | 8 hours | Day 7 |
| **Total (w/o Media)** | | **56 hours** | **1 week** |
| **Total (with Media)** | | **72 hours** | **1.5 weeks** |

**Recommended approach:** Do Phase 0 (Media) in parallel with Phases 1-2, don't do them sequentially.

---

## SUCCESS CRITERIA

✅ **Phase 1 Complete When:**
- Conversations table stores data
- ConversationMessage table tracks direction
- Migrations run successfully

✅ **Phase 2 Complete When:**
- SMS from phone arrives in database
- Reply from dashboard sends via Telnyx
- Delivery status updates via webhook
- All endpoints return correct data

✅ **Phase 3 Complete When:**
- ConversationsPage loads and displays conversations
- Click conversation opens message thread
- Reply composer appears and sends
- Message appears in thread

✅ **Phase 4 Complete When:**
- Webhook signature validation works
- Rate limiting prevents abuse
- Audit logs track all SMS activity

---

## NEXT STEPS FOR APPROVAL

Please review and confirm:

1. **Architecture:** Does this match your vision?
2. **Priority:** Start with Phase 1 (Database) immediately?
3. **Testing:** Use your actual Telnyx number for testing?
4. **Timeline:** Is 1 week realistic for your needs?
5. **Analytics:** Any specific metrics you want to track?

Once approved, we'll start with database schema design.
