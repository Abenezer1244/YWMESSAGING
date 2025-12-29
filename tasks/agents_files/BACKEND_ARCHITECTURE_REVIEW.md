# Backend Architecture Review & Upgrade Plan
## Koinoniasms Enterprise SMS Platform

**Review Date:** November 23, 2025
**Reviewed By:** Senior Backend Engineer
**Current Version:** 0.1.0
**Technology Stack:** Node.js + Express + PostgreSQL + Prisma + Telnyx

---

## Executive Summary

Koinoniasms is a mature church messaging platform with solid fundamentals but requires strategic upgrades to support Product Manager's roadmap (Email integration, Link tracking, API access, Mobile app). Current architecture handles SMS/MMS well with proper security patterns. Key strengths: type-safe TypeScript, comprehensive error handling, encryption, webhook reliability. Critical gaps: no caching layer, no message queue (Redis disabled), limited API documentation, no rate limiting tiers.

**Architecture Grade:** B+ (Production-Ready, Room for Scale)

---

## 1. Current State Assessment

### 1.1 Technology Stack

```
Backend Framework:    Express.js 4.21.2
Runtime:              Node.js 18+ (ES Modules)
Database:             PostgreSQL (via Prisma ORM 5.3.1)
Message Queue:        Bull 4.10.0 (DISABLED - synchronous sending)
Cache:                Redis 4.6.7 (configured but not utilized)
SMS Provider:         Telnyx API v2
Email:                SendGrid 8.1.6 (basic integration)
Storage:              AWS S3 (media files)
Payment:              Stripe 12.16.0
Security:             Helmet 7.0.0, CSRF, Rate Limiting
Authentication:       JWT (access + refresh tokens)
Job Scheduling:       node-cron 3.0.2
```

### 1.2 Service Architecture (21 Services)

**Core Services:**
- `auth.service.ts` - JWT authentication with refresh tokens
- `admin.service.ts` - Admin user management
- `billing.service.ts` - Subscription management
- `stripe.service.ts` - Payment processing

**Messaging Services:**
- `message.service.ts` - SMS message creation and recipient resolution
- `telnyx.service.ts` - Telnyx SMS/phone number management (1051 lines)
- `telnyx-mms.service.ts` - MMS with media attachments
- `conversation.service.ts` - Two-way SMS conversations (499 lines)
- `recurring.service.ts` - Scheduled recurring messages

**Data Services:**
- `member.service.ts` - Contact management with encryption
- `group.service.ts` - Group management
- `branch.service.ts` - Multi-location support
- `template.service.ts` - Message templates

**Media & Communication:**
- `s3-media.service.ts` - AWS S3 file uploads (images/videos)
- `sendgrid.service.ts` - Email notifications (basic)
- `openai.service.ts` - AI chat integration

**Analytics & Support:**
- `analytics.service.ts` - Event tracking
- `stats.service.ts` - Dashboard statistics
- `invoice.service.ts` - Billing invoices
- `chat.service.ts` - AI-powered support chat
- `phone-linking-recovery.service.ts` - Enterprise-level phone number verification

### 1.3 Database Schema Analysis

**23 Tables, Well-Normalized, Strong Relationships**

**Core Entities:**
```prisma
Church (16 core fields + 28 10DLC fields + 9 phone management fields)
├── Branches (multi-location support)
├── Groups (ministry groups within branches)
├── Members (encrypted phone numbers + HMAC hashing)
├── Messages (broadcast messages with delivery tracking)
├── RecurringMessages (scheduled/recurring broadcasts)
├── Conversations (two-way SMS threads)
└── Subscriptions (Stripe billing)
```

**Key Indexes (13 indexes):**
- ✅ `Church.subscriptionStatus`
- ✅ `Church.trialEndsAt`
- ✅ `Church.telnyxPhoneNumber`
- ✅ `Church.telnyxPhoneLinkingStatus`
- ✅ `Church.dlcStatus`
- ✅ `Message.churchId, status, sentAt`
- ✅ `Conversation.lastMessageAt, status`
- ✅ `Member.phoneHash` (searchable encrypted phone)

**Encryption Strategy:**
- Phone numbers: AES-256-GCM encryption at rest
- Phone lookup: HMAC-SHA256 hashing for searchable index
- Secure key management via environment variables

### 1.4 API Endpoints (13 Route Modules)

```
/api/auth          - Login, register, refresh, password reset
/api/admin         - Admin management, invitations
/api/branches      - Multi-location management
/api/groups        - Group creation and member assignment
/api/messages      - Message sending and history
/api/templates     - Message template CRUD
/api/recurring     - Scheduled message management
/api/analytics     - Usage statistics
/api/billing       - Subscription and payment
/api/numbers       - Phone number purchase/management
/api/webhooks      - Telnyx delivery status callbacks
/api/chat          - AI support chat
/api/scheduler     - AWS CloudWatch cron triggers
```

### 1.5 Scheduled Jobs (3 Active Jobs)

```typescript
// Recurring messages (every 5 minutes)
processRecurringMessages()

// Phone number linking recovery (every 5 minutes)
verifyAndRecoverPhoneLinkings()

// 10DLC approval checks (every 30 minutes)
check10DLCApprovalStatus()
```

### 1.6 Security Posture

**✅ Strong Security Patterns:**
- Helmet CSP headers (Stripe whitelisted)
- CSRF protection (csurf middleware)
- Rate limiting (express-rate-limit)
  - Auth endpoints: 5 req/15min (production)
  - Password reset: 3 req/hour
  - Billing: 30 req/15min
  - General API: 100 req/15min
- HTTP-only cookies for refresh tokens
- Webhook signature verification (ED25519)
- Structured security logging
- Input validation on all endpoints

**⚠️ Security Gaps:**
- No API key management for developer access
- No rate limiting tiers for different subscription plans
- No audit logging for sensitive operations
- No data retention policies implemented
- GDPR compliance (right to be forgotten) not automated

---

## 2. Performance Audit

### 2.1 Database Query Analysis

**✅ Good Patterns Found:**
- Parallel queries with `Promise.all()` (conversation.service.ts)
- Pagination on all list endpoints (default 20-50 items)
- Select-only necessary fields (reducing payload size)
- Proper use of includes for relationships

**❌ N+1 Query Risks Identified:**

**Location:** `conversation.service.ts` (Line 252-258)
```typescript
// ISSUE: Broadcasts message to all members (N queries)
for (const member of uniqueMembers) {
  const decryptedPhone = decryptPhoneSafe(member.phone);
  await telnyxService.sendSMS(decryptedPhone, messageText, churchId);
}
```
**Impact:** 100 members = 100 sequential Telnyx API calls (~10-15 seconds)
**Solution:** Batch API calls (Telnyx supports batching up to 1000 recipients)

**Location:** `message.service.ts` (Line 132-140)
```typescript
// ISSUE: Creates MessageRecipient records one-by-one
for (const recipient of recipients) {
  await prisma.messageRecipient.create({ ... });
}
```
**Impact:** 500 recipients = 500 database INSERTs
**Solution:** Use `prisma.messageRecipient.createMany()` (single query)

**Location:** `recurringMessages.job.ts` (Line 27-51)
```typescript
// ISSUE: Processes recurring messages sequentially
for (const recMessage of dueMessages) {
  await messageService.createMessage(...);
}
```
**Impact:** 50 recurring messages = 50 sequential operations
**Solution:** Process in parallel batches (Promise.all with concurrency limit)

### 2.2 Missing Indexes

**Recommended Additional Indexes:**
```sql
-- High-frequency queries not indexed
CREATE INDEX idx_message_church_created ON "Message"("churchId", "createdAt" DESC);
CREATE INDEX idx_conversation_church_last_message ON "Conversation"("churchId", "lastMessageAt" DESC);
CREATE INDEX idx_member_optin ON "Member"("optInSms") WHERE "optInSms" = true;
CREATE INDEX idx_recurring_active_next_send ON "RecurringMessage"("isActive", "nextSendAt") WHERE "isActive" = true;
```

**Impact:** 20-40% query performance improvement on list endpoints

### 2.3 Caching Strategy (Currently None)

**Redis is configured but not utilized.** Opportunities:

**High-Value Cache Targets:**
```typescript
// Cache church configuration (10min TTL)
GET /api/churches/:id → Cache church settings

// Cache group members list (5min TTL)
GET /api/groups/:id/members → Cache member list

// Cache message templates (15min TTL)
GET /api/templates → Cache frequently used templates

// Cache analytics dashboard (1min TTL)
GET /api/analytics/dashboard → Cache stats calculations

// Cache plan limits (30min TTL)
GET /api/billing/limits → Cache subscription tier limits
```

**Expected Impact:**
- 70% reduction in database queries for dashboard loads
- 50% faster API response times on cached endpoints
- Database connection pool freed for write operations

### 2.4 API Response Time Targets

**Current State (Estimated):**
```
POST /api/messages/send     →  2-15 seconds (depends on recipient count)
GET /api/messages/history   →  200-500ms (paginated)
GET /api/analytics          →  500-1000ms (aggregate queries)
GET /api/conversations      →  300-600ms (includes last message)
POST /api/auth/login        →  150-300ms (bcrypt + DB)
```

**Target Benchmarks:**
```
POST /api/messages/send     →  < 500ms (queued, async processing)
GET /api/messages/history   →  < 100ms (cached)
GET /api/analytics          →  < 200ms (cached)
GET /api/conversations      →  < 150ms (cached)
POST /api/auth/login        →  < 200ms (optimized bcrypt rounds)
```

---

## 3. Scalability Assessment

### 3.1 Current Architecture Limits

**Database Connection Pooling:**
```typescript
// Prisma default: 10 connections
// Under load: 100 req/sec × 200ms query time = 20 concurrent queries
// Result: Connection pool exhaustion at ~50-100 req/sec
```

**Message Sending (Synchronous):**
```typescript
// Current: Sequential sending (1 recipient/second with Telnyx latency)
// Limit: 60 messages/minute per church
// Issue: Large broadcasts (500+ recipients) take 8-10 minutes
```

**Webhook Processing:**
```typescript
// Current: Express handles webhooks synchronously
// Limit: 100-200 webhooks/sec before blocking
// Issue: During mass send (10k messages), delivery webhooks flood server
```

**Estimated Throughput:**
- **Single Instance:** ~50-100 requests/sec (API endpoints)
- **Message Broadcasting:** ~60 messages/min (synchronous Telnyx calls)
- **Database Writes:** ~200 INSERTs/sec (before connection pool exhaustion)
- **Webhook Processing:** ~100-200 webhooks/sec (synchronous processing)

### 3.2 Bottlenecks for 10x Growth

**Scenario:** 1000 churches → 10,000 churches (10x growth)

**Bottleneck 1: Database Connections**
- Current: Prisma default pool (10 connections)
- At 10x: Need 100+ connections
- Solution: Connection pool tuning + read replicas

**Bottleneck 2: Message Sending**
- Current: Synchronous, sequential sending
- At 10x: 600 messages/min → 6000 messages/min needed
- Solution: Message queue (Bull + Redis) with parallel workers

**Bottleneck 3: Webhook Processing**
- Current: Synchronous Express endpoints
- At 10x: 1000 webhooks/sec during peak sends
- Solution: Webhook queue with background workers

**Bottleneck 4: Storage Costs**
- Current: S3 media files (no expiration)
- At 10x: $500-1000/month S3 costs
- Solution: Lifecycle policies (90-day expiration on media)

**Bottleneck 5: API Rate Limits**
- Current: Fixed rate limits (no tier differentiation)
- At 10x: Premium customers hit same limits as free tier
- Solution: Plan-based rate limiting (Starter: 100/15min, Pro: 500/15min)

### 3.3 Message Queue Requirements

**Why Re-Enable Redis Queue:**

Current synchronous sending is a production risk:
- Large broadcasts block HTTP requests (8-10 min for 500 recipients)
- No retry mechanism for transient Telnyx failures
- No visibility into send progress
- Database writes not batched

**Proposed Bull Queue Architecture:**

```typescript
// Message Broadcast Queue
smsQueue.add({
  messageId,
  recipients: [...],  // Batch of 100 recipients
  churchId,
  content,
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
});

// Webhook Processing Queue
webhookQueue.add({
  payload,
  signature,
  timestamp,
}, {
  attempts: 5,
  priority: 2,  // Higher priority than broadcasts
});

// Analytics Event Queue
analyticsQueue.add({
  event,
  churchId,
  metadata,
}, {
  removeOnComplete: true,
  removeOnFail: 1000,
});
```

**Worker Configuration:**
```typescript
// 5 SMS workers (parallel sending)
smsQueue.process(5, async (job) => { ... });

// 10 webhook workers (high throughput)
webhookQueue.process(10, async (job) => { ... });

// 2 analytics workers (low priority)
analyticsQueue.process(2, async (job) => { ... });
```

**Expected Impact:**
- 10x throughput (600 msg/min → 6000 msg/min)
- API response times: 2-15 sec → 100-300ms
- Retry logic for failed sends
- Progress tracking via Bull dashboard

### 3.4 Webhook Delivery Reliability

**Current State:**
- Telnyx sends delivery webhooks synchronously
- No acknowledgment timeout handling
- No dead letter queue for failed webhook processing

**Enterprise Requirements:**
```typescript
// Webhook verification with timeout
const verified = await verifyWebhookSignature(payload, signature, { timeout: 5000 });

// Queue webhook for async processing
await webhookQueue.add(payload, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
});

// Respond immediately to Telnyx (200 OK)
res.status(200).json({ received: true });

// Process in background worker
webhookQueue.process(async (job) => {
  await updateMessageDeliveryStatus(job.data);
});
```

### 3.5 Database Connection Pooling

**Current Configuration:**
```typescript
// Prisma defaults
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
// Default pool size: 10 connections
```

**Recommended Configuration:**
```typescript
// For 10x scale
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// .env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=50&pool_timeout=20"
```

**Advanced: PgBouncer for Connection Pooling**
```
Application (100 workers) → PgBouncer (pool: 50) → PostgreSQL (max: 100)
```

---

## 4. New Feature Architecture

### 4.1 Email Service Integration

**Product Requirement:** Unified SMS + Email platform

**Current State:**
- SendGrid integrated (basic transactional emails only)
- No email templates
- No email delivery tracking
- No unified contact preferences

**Proposed Architecture:**

```typescript
// New service: unified-messaging.service.ts
export async function sendUnifiedMessage(
  churchId: string,
  options: {
    recipients: string[];  // Email or phone
    content: string;
    channel: 'sms' | 'email' | 'auto';  // Auto = prefer SMS, fallback email
    template?: string;
  }
) {
  const results = await Promise.all(
    recipients.map(async (recipient) => {
      const contact = await resolveContact(recipient);

      if (options.channel === 'auto') {
        if (contact.phone && contact.optInSms) {
          return await sendSMS(contact.phone, options.content, churchId);
        } else if (contact.email) {
          return await sendEmail(contact.email, options.content, churchId);
        }
      }

      // Direct channel selection
      if (options.channel === 'sms') {
        return await sendSMS(contact.phone, options.content, churchId);
      } else {
        return await sendEmail(contact.email, options.content, churchId);
      }
    })
  );

  return results;
}
```

**Database Schema Changes:**

```prisma
model Member {
  // Existing fields
  phone         String?
  email         String?
  optInSms      Boolean @default(true)

  // New fields
  optInEmail    Boolean @default(true)
  emailVerified Boolean @default(false)
  preferredChannel String @default("sms")  // sms, email, both
}

model Message {
  // Existing fields
  content       String
  targetType    String

  // New fields
  channel       String @default("sms")  // sms, email, unified
  emailSubject  String?
  emailHtmlBody String?
  emailDeliveredCount Int @default(0)
  emailFailedCount    Int @default(0)
}

model MessageRecipient {
  // Existing fields
  status        String

  // New fields
  channel       String?  // Which channel was used
  emailOpened   Boolean @default(false)
  emailOpenedAt DateTime?
}
```

**API Changes:**

```typescript
// POST /api/messages/send (updated)
{
  "content": "Service this Sunday at 10am",
  "channel": "unified",  // NEW: sms, email, unified
  "emailSubject": "Sunday Service Reminder",  // NEW
  "targetType": "groups",
  "targetIds": ["group123"]
}

// New endpoints
GET  /api/messages/:id/email-analytics  // Open rate, click rate
POST /api/templates/email               // Email template CRUD
GET  /api/members/:id/preferences       // Communication preferences
PUT  /api/members/:id/preferences       // Update opt-in settings
```

**Email Service Provider Options:**

| Provider | Cost | Features | Recommendation |
|----------|------|----------|----------------|
| SendGrid | $15-100/mo | API, templates, analytics | ✅ Current (upgrade to Marketing Campaigns) |
| Resend | $20-80/mo | Developer-friendly, React emails | ✅ Consider (modern, great DX) |
| AWS SES | $0.10/1000 | Cheapest, requires setup | ⚠️ Low-level, more work |
| Mailgun | $35-90/mo | Enterprise features | ❌ Expensive for scale |

**Recommendation:** Upgrade SendGrid or migrate to Resend (better developer experience, React email templates)

### 4.2 Message Scheduling System (At-Scale)

**Product Requirement:** One-time + recurring message scheduling

**Current State:**
- Recurring messages: ✅ Working (node-cron every 5 min)
- One-time scheduled: ❌ Not implemented
- Timezone handling: ❌ Not implemented

**Proposed Architecture:**

```prisma
model ScheduledMessage {
  id              String   @id @default(cuid())
  churchId        String
  type            String   // one-time, recurring, campaign
  content         String
  channel         String   @default("sms")  // sms, email, unified

  // Scheduling
  scheduledFor    DateTime
  timezone        String   @default("America/Los_Angeles")
  frequency       String?  // daily, weekly, monthly
  recurrenceRule  String?  // iCal RRULE format

  // Targeting
  targetType      String
  targetIds       String

  // Status
  status          String   @default("pending")  // pending, processing, sent, failed, cancelled
  processedAt     DateTime?
  nextRunAt       DateTime?

  // Relations
  church          Church   @relation(fields: [churchId], references: [id])
  executions      ScheduledMessageExecution[]

  @@index([status, scheduledFor])
  @@index([churchId, status])
}

model ScheduledMessageExecution {
  id                   String   @id @default(cuid())
  scheduledMessageId   String
  executedAt           DateTime @default(now())
  status               String   // success, failed
  messageId            String?  // Link to Message table
  recipientCount       Int      @default(0)
  errorMessage         String?

  scheduledMessage     ScheduledMessage @relation(fields: [scheduledMessageId], references: [id])

  @@index([scheduledMessageId])
}
```

**Scheduling Job (Every 1 Minute):**

```typescript
// New file: jobs/scheduledMessages.job.ts
import { scheduleJob } from 'node-schedule';
import { PrismaClient } from '@prisma/client';
import * as messageService from '../services/message.service.js';

const prisma = new PrismaClient();

export function startScheduledMessageProcessor() {
  // Run every minute
  scheduleJob('* * * * *', async () => {
    const now = new Date();

    // Find messages due in next 60 seconds
    const dueMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: 'pending',
        scheduledFor: {
          lte: new Date(now.getTime() + 60000),  // Next 60 sec
        },
      },
    });

    for (const scheduled of dueMessages) {
      try {
        // Adjust for timezone
        const localTime = convertToTimezone(scheduled.scheduledFor, scheduled.timezone);
        const now = new Date();

        if (localTime <= now) {
          // Mark as processing
          await prisma.scheduledMessage.update({
            where: { id: scheduled.id },
            data: { status: 'processing' },
          });

          // Send message
          const message = await messageService.createMessage(scheduled.churchId, {
            content: scheduled.content,
            targetType: scheduled.targetType as any,
            targetIds: JSON.parse(scheduled.targetIds),
          });

          // Record execution
          await prisma.scheduledMessageExecution.create({
            data: {
              scheduledMessageId: scheduled.id,
              messageId: message.id,
              recipientCount: message.totalRecipients,
              status: 'success',
            },
          });

          // Update status
          if (scheduled.type === 'one-time') {
            await prisma.scheduledMessage.update({
              where: { id: scheduled.id },
              data: { status: 'sent', processedAt: now },
            });
          } else {
            // Calculate next run
            const nextRun = calculateNextRun(scheduled.recurrenceRule, scheduled.timezone);
            await prisma.scheduledMessage.update({
              where: { id: scheduled.id },
              data: {
                status: 'pending',
                processedAt: now,
                nextRunAt: nextRun,
                scheduledFor: nextRun,
              },
            });
          }
        }
      } catch (error: any) {
        // Record failure
        await prisma.scheduledMessageExecution.create({
          data: {
            scheduledMessageId: scheduled.id,
            status: 'failed',
            errorMessage: error.message,
            recipientCount: 0,
          },
        });

        await prisma.scheduledMessage.update({
          where: { id: scheduled.id },
          data: { status: 'failed' },
        });
      }
    }
  });
}
```

**Timezone Handling:**

```typescript
// Use date-fns-tz for timezone conversion
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

function convertToTimezone(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone);
}

function calculateNextRun(rrule: string, timezone: string): Date {
  // Use rrule library for recurrence calculation
  const rule = RRule.fromString(rrule);
  const nextOccurrence = rule.after(new Date(), true);
  return zonedTimeToUtc(nextOccurrence, timezone);
}
```

**API Endpoints:**

```typescript
// POST /api/messages/schedule
{
  "content": "Service reminder",
  "channel": "sms",
  "scheduledFor": "2025-12-25T10:00:00",
  "timezone": "America/New_York",
  "targetType": "groups",
  "targetIds": ["group123"]
}

// POST /api/messages/schedule/recurring
{
  "content": "Weekly reminder",
  "channel": "email",
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=SU",
  "timezone": "America/Los_Angeles",
  "targetType": "all"
}

// GET /api/messages/scheduled
// GET /api/messages/scheduled/:id
// PUT /api/messages/scheduled/:id
// DELETE /api/messages/scheduled/:id (cancel)
```

### 4.3 Link Click Tracking

**Product Requirement:** Track link clicks in SMS/Email messages

**Architecture:**

```prisma
model TrackedLink {
  id              String   @id @default(cuid())
  messageId       String
  churchId        String
  originalUrl     String
  shortCode       String   @unique  // 8-char unique code
  clickCount      Int      @default(0)
  createdAt       DateTime @default(now())

  message         Message  @relation(fields: [messageId], references: [id])
  clicks          LinkClick[]

  @@index([shortCode])
  @@index([messageId])
}

model LinkClick {
  id              String   @id @default(cuid())
  trackedLinkId   String
  memberId        String?
  ipAddress       String?
  userAgent       String?
  clickedAt       DateTime @default(now())

  trackedLink     TrackedLink @relation(fields: [trackedLinkId], references: [id])

  @@index([trackedLinkId])
  @@index([clickedAt])
}
```

**Link Shortening Service:**

```typescript
// services/link-tracking.service.ts
export async function createTrackedLink(
  messageId: string,
  churchId: string,
  originalUrl: string
): Promise<string> {
  const shortCode = generateShortCode(8);  // Random 8-char alphanumeric

  await prisma.trackedLink.create({
    data: {
      messageId,
      churchId,
      originalUrl,
      shortCode,
    },
  });

  return `https://koinoniasms.com/l/${shortCode}`;
}

// Replace links in message content
export function replaceLinksWithTracked(
  content: string,
  messageId: string,
  churchId: string
): Promise<string> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = content.match(urlRegex) || [];

  let updatedContent = content;

  for (const url of links) {
    const trackedUrl = await createTrackedLink(messageId, churchId, url);
    updatedContent = updatedContent.replace(url, trackedUrl);
  }

  return updatedContent;
}
```

**Click Tracking Endpoint:**

```typescript
// routes/link-tracking.routes.ts
import express from 'express';

const router = express.Router();

router.get('/l/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  const trackedLink = await prisma.trackedLink.findUnique({
    where: { shortCode },
  });

  if (!trackedLink) {
    return res.status(404).send('Link not found');
  }

  // Record click
  await prisma.linkClick.create({
    data: {
      trackedLinkId: trackedLink.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Increment click count
  await prisma.trackedLink.update({
    where: { id: trackedLink.id },
    data: { clickCount: { increment: 1 } },
  });

  // Redirect to original URL
  res.redirect(trackedLink.originalUrl);
});

export default router;
```

**Analytics API:**

```typescript
// GET /api/analytics/links/:messageId
export async function getLinkAnalytics(messageId: string) {
  const links = await prisma.trackedLink.findMany({
    where: { messageId },
    include: {
      clicks: {
        select: {
          clickedAt: true,
          ipAddress: true,
        },
      },
    },
  });

  return links.map(link => ({
    url: link.originalUrl,
    shortUrl: `https://koinoniasms.com/l/${link.shortCode}`,
    totalClicks: link.clickCount,
    uniqueClicks: new Set(link.clicks.map(c => c.ipAddress)).size,
    clicksByDay: groupClicksByDay(link.clicks),
  }));
}
```

### 4.4 Read Receipt Tracking

**Product Requirement:** Track when SMS/Email messages are read

**Implementation Strategy:**

**For SMS (Limited):**
- Telnyx provides delivery confirmations (delivered, not "read")
- True "read receipts" not supported by SMS protocol
- Alternative: Track link clicks as engagement proxy

**For Email (Full Support):**
- 1x1 pixel tracking image
- Embedded in email HTML

**Database Schema:**

```prisma
model MessageRecipient {
  // Existing fields
  deliveredAt     DateTime?

  // New fields
  readAt          DateTime?
  readCount       Int       @default(0)  // Email: multiple opens
  readDevice      String?   // desktop, mobile, unknown
}
```

**Email Pixel Tracking:**

```typescript
// services/email-tracking.service.ts
export function injectTrackingPixel(
  emailHtml: string,
  recipientId: string
): string {
  const trackingUrl = `${process.env.BACKEND_URL}/api/track/email/${recipientId}/open`;
  const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" alt="" />`;

  // Inject before </body> tag
  return emailHtml.replace('</body>', `${trackingPixel}</body>`);
}

// Track email opens
router.get('/track/email/:recipientId/open', async (req, res) => {
  const { recipientId } = req.params;

  await prisma.messageRecipient.update({
    where: { id: recipientId },
    data: {
      readAt: new Date(),
      readCount: { increment: 1 },
      readDevice: detectDevice(req.headers['user-agent']),
    },
  });

  // Return 1x1 transparent GIF
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.set('Content-Type', 'image/gif');
  res.send(pixel);
});
```

### 4.5 Mobile App API Support

**Product Requirement:** API endpoints for iOS/Android apps

**Changes Needed:**

**1. API Versioning:**

```typescript
// Current: /api/messages
// Mobile-friendly: /api/v1/messages

// app.ts
app.use('/api/v1', apiV1Routes);
```

**2. Mobile-Specific Endpoints:**

```typescript
// Mobile authentication (Firebase tokens)
POST /api/v1/auth/mobile/login
{
  "firebaseToken": "...",
  "deviceId": "...",
  "platform": "ios"
}

// Push notification registration
POST /api/v1/devices/register
{
  "deviceToken": "...",
  "platform": "ios",
  "appVersion": "1.0.0"
}

// Lightweight endpoints (smaller payloads)
GET /api/v1/messages/recent?limit=20  // Paginated, mobile-optimized
GET /api/v1/conversations/unread      // Only unread conversations
GET /api/v1/notifications/unread      // Push notification metadata
```

**3. Push Notification Service:**

```prisma
model Device {
  id            String   @id @default(cuid())
  churchId      String
  adminId       String
  deviceToken   String   @unique
  platform      String   // ios, android
  appVersion    String
  lastActiveAt  DateTime @default(now())
  createdAt     DateTime @default(now())

  @@index([adminId])
}
```

```typescript
// services/push-notification.service.ts
import admin from 'firebase-admin';

export async function sendPushNotification(
  adminId: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }
) {
  const devices = await prisma.device.findMany({
    where: { adminId },
  });

  const messages = devices.map(device => ({
    token: device.deviceToken,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data || {},
  }));

  await admin.messaging().sendAll(messages);
}
```

**4. Real-Time Updates (WebSocket):**

```typescript
// For live conversation updates
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: [...corsOrigins, 'capacitor://localhost'],  // Mobile app
  },
});

io.on('connection', (socket) => {
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('mark-read', async (conversationId) => {
    await conversationService.markAsRead(conversationId, socket.data.churchId);
    io.to(`conversation:${conversationId}`).emit('conversation-updated', { unreadCount: 0 });
  });
});

// Emit when new message arrives (from webhook)
io.to(`conversation:${conversationId}`).emit('new-message', message);
```

### 4.6 Developer API Access

**Product Requirement:** Public API for third-party integrations

**Architecture:**

**1. API Key Management:**

```prisma
model ApiKey {
  id          String   @id @default(cuid())
  churchId    String
  name        String   // "Production Server", "Staging", etc.
  key         String   @unique  // hashed
  keyPrefix   String   // First 8 chars for identification
  scopes      String   // JSON array: ["messages:read", "messages:send"]
  rateLimit   Int      @default(100)  // Requests per 15 min
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  expiresAt   DateTime?

  church      Church   @relation(fields: [churchId], references: [id])

  @@index([churchId])
  @@index([key])
}
```

**2. API Key Authentication Middleware:**

```typescript
// middleware/api-key.middleware.ts
export function validateApiKey(requiredScopes?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // Hash and lookup
    const hashedKey = hashApiKey(apiKey);
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: { church: true },
    });

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check expiration
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }

    // Check scopes
    const scopes = JSON.parse(keyRecord.scopes);
    if (requiredScopes && !requiredScopes.every(s => scopes.includes(s))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Rate limiting (per API key)
    const rateLimitKey = `api:${keyRecord.id}`;
    const requestCount = await redisClient.incr(rateLimitKey);
    if (requestCount === 1) {
      await redisClient.expire(rateLimitKey, 15 * 60);  // 15 min window
    }

    if (requestCount > keyRecord.rateLimit) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    // Attach to request
    req.apiKey = keyRecord;
    req.churchId = keyRecord.churchId;
    next();
  };
}
```

**3. API Key Generation:**

```typescript
// services/api-key.service.ts
import crypto from 'crypto';

export async function generateApiKey(
  churchId: string,
  options: {
    name: string;
    scopes: string[];
    rateLimit?: number;
    expiresIn?: number;  // Days
  }
): Promise<{ key: string; keyPrefix: string }> {
  const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
  const hashedKey = hashApiKey(rawKey);
  const keyPrefix = rawKey.substring(0, 12);

  await prisma.apiKey.create({
    data: {
      churchId,
      name: options.name,
      key: hashedKey,
      keyPrefix,
      scopes: JSON.stringify(options.scopes),
      rateLimit: options.rateLimit || 100,
      expiresAt: options.expiresIn
        ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000)
        : null,
    },
  });

  return { key: rawKey, keyPrefix };
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
```

**4. Developer API Endpoints:**

```typescript
// Public API (with API key auth)
app.use('/api/v1/public', validateApiKey(['public:access']), publicApiRoutes);

// POST /api/v1/public/messages/send
router.post('/messages/send', validateApiKey(['messages:send']), async (req, res) => {
  const { content, targetType, targetIds } = req.body;

  const message = await messageService.createMessage(req.churchId, {
    content,
    targetType,
    targetIds,
  });

  res.json({
    id: message.id,
    status: 'queued',
    recipientCount: message.totalRecipients,
    estimatedDelivery: new Date(Date.now() + 60000),  // 1 min
  });
});

// GET /api/v1/public/messages/:id
router.get('/messages/:id', validateApiKey(['messages:read']), async (req, res) => {
  const message = await messageService.getMessageDetails(req.params.id);

  res.json({
    id: message.id,
    content: message.content,
    status: message.status,
    recipientCount: message.totalRecipients,
    deliveredCount: message.deliveredCount,
    failedCount: message.failedCount,
    sentAt: message.sentAt,
  });
});
```

**5. API Documentation (OpenAPI/Swagger):**

```typescript
// npm install swagger-ui-express swagger-jsdoc

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Koinoniasms API',
      version: '1.0.0',
      description: 'Church messaging platform API',
    },
    servers: [
      { url: 'https://api.koinoniasms.com', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],  // JSDoc annotations in route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
```

**6. Rate Limiting Tiers:**

```typescript
// Plan-based rate limits
const RATE_LIMITS = {
  starter: 100,   // 100 req / 15 min
  growth: 500,    // 500 req / 15 min
  pro: 2000,      // 2000 req / 15 min
  enterprise: -1, // Unlimited
};

// Dynamic rate limit based on subscription plan
export async function getChurchRateLimit(churchId: string): Promise<number> {
  const subscription = await prisma.subscription.findUnique({
    where: { churchId },
  });

  return RATE_LIMITS[subscription?.plan || 'starter'];
}
```

### 4.7 Zapier/Webhook Platform

**Product Requirement:** Outbound webhooks for integrations

**Architecture:**

```prisma
model Webhook {
  id              String   @id @default(cuid())
  churchId        String
  url             String
  events          String   // JSON array: ["message.sent", "member.created"]
  secret          String   // For signature verification
  isActive        Boolean  @default(true)
  failureCount    Int      @default(0)
  lastTriggeredAt DateTime?
  createdAt       DateTime @default(now())

  church          Church   @relation(fields: [churchId], references: [id])
  deliveries      WebhookDelivery[]

  @@index([churchId])
}

model WebhookDelivery {
  id              String   @id @default(cuid())
  webhookId       String
  event           String
  payload         String   // JSON
  status          String   // pending, sent, failed
  attempts        Int      @default(0)
  responseStatus  Int?
  responseBody    String?
  sentAt          DateTime?
  createdAt       DateTime @default(now())

  webhook         Webhook  @relation(fields: [webhookId], references: [id])

  @@index([webhookId, status])
}
```

**Webhook Delivery Service:**

```typescript
// services/webhook-delivery.service.ts
import crypto from 'crypto';
import axios from 'axios';

export async function triggerWebhook(
  churchId: string,
  event: string,
  payload: any
) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      churchId,
      isActive: true,
    },
  });

  for (const webhook of webhooks) {
    const events = JSON.parse(webhook.events);
    if (!events.includes(event)) continue;

    // Create delivery record
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: JSON.stringify(payload),
        status: 'pending',
      },
    });

    // Queue for async delivery
    await webhookQueue.add({
      deliveryId: delivery.id,
      webhookId: webhook.id,
      url: webhook.url,
      event,
      payload,
      secret: webhook.secret,
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}

// Webhook worker
webhookQueue.process(async (job) => {
  const { deliveryId, url, event, payload, secret } = job.data;

  try {
    // Generate signature
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Send webhook
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Koinonia-Event': event,
        'X-Koinonia-Signature': signature,
        'User-Agent': 'Koinoniasms-Webhook/1.0',
      },
      timeout: 10000,
    });

    // Record success
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        attempts: job.attemptsMade,
        responseStatus: response.status,
        responseBody: JSON.stringify(response.data).substring(0, 1000),
      },
    });

    // Reset failure count
    await prisma.webhook.update({
      where: { id: job.data.webhookId },
      data: {
        failureCount: 0,
        lastTriggeredAt: new Date(),
      },
    });

  } catch (error: any) {
    // Record failure
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'failed',
        attempts: job.attemptsMade,
        responseStatus: error.response?.status,
        responseBody: error.message,
      },
    });

    // Increment failure count
    const webhook = await prisma.webhook.update({
      where: { id: job.data.webhookId },
      data: {
        failureCount: { increment: 1 },
      },
    });

    // Disable webhook after 10 consecutive failures
    if (webhook.failureCount >= 10) {
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { isActive: false },
      });

      // TODO: Notify church admin
    }

    throw error;  // Trigger Bull retry
  }
});
```

**Trigger Points:**

```typescript
// After message sent
await triggerWebhook(churchId, 'message.sent', {
  messageId: message.id,
  content: message.content,
  recipientCount: message.totalRecipients,
  sentAt: message.sentAt,
});

// After member created
await triggerWebhook(churchId, 'member.created', {
  memberId: member.id,
  firstName: member.firstName,
  lastName: member.lastName,
  createdAt: member.createdAt,
});

// After conversation message received
await triggerWebhook(churchId, 'conversation.message.received', {
  conversationId: conversation.id,
  messageId: message.id,
  content: message.content,
  from: member.phone,
  receivedAt: message.createdAt,
});
```

**Zapier Integration:**

Zapier requires:
1. REST API with authentication
2. Webhook subscription endpoints
3. Sample data for field mapping

```typescript
// Zapier endpoints
POST /api/v1/zapier/hooks      // Subscribe to webhook
DELETE /api/v1/zapier/hooks/:id  // Unsubscribe
GET /api/v1/zapier/samples/message.sent  // Sample data
GET /api/v1/zapier/samples/member.created
```

### 4.8 Planning Center Integration

**Product Requirement:** Sync members from Planning Center

**Integration Strategy:**

Planning Center API: https://api.planningcenteronline.com

**Authentication:**
- OAuth 2.0 (user consent flow)
- Personal Access Token (simpler, for admin-only)

**Sync Flow:**

```typescript
// services/planning-center.service.ts
import axios from 'axios';

const PC_API_BASE = 'https://api.planningcenteronline.com/people/v2';

export async function syncMembersFromPlanningCenter(
  churchId: string,
  accessToken: string
) {
  const church = await prisma.church.findUnique({ where: { id: churchId } });

  // Fetch all people from Planning Center
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(`${PC_API_BASE}/people`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { per_page: limit, offset },
    });

    const people = response.data.data;

    for (const person of people) {
      const phone = person.attributes.phone_numbers?.[0]?.number;
      const email = person.attributes.email_addresses?.[0]?.address;

      if (!phone && !email) continue;

      // Upsert member
      await memberService.upsertMember(churchId, {
        firstName: person.attributes.first_name,
        lastName: person.attributes.last_name,
        phone,
        email,
        externalId: person.id,  // Planning Center ID
        source: 'planning_center',
      });
    }

    hasMore = response.data.links.next !== null;
    offset += limit;
  }
}
```

**Database Changes:**

```prisma
model Member {
  // Existing fields
  firstName   String

  // New fields
  externalId  String?  // Planning Center ID
  source      String   @default("manual")  // manual, planning_center, csv
  syncedAt    DateTime?

  @@index([externalId])
}

model Integration {
  id              String   @id @default(cuid())
  churchId        String
  provider        String   // planning_center, zapier, webhook
  accessToken     String?  // Encrypted
  refreshToken    String?  // Encrypted
  isActive        Boolean  @default(true)
  lastSyncAt      DateTime?
  createdAt       DateTime @default(now())

  church          Church   @relation(fields: [churchId], references: [id])

  @@unique([churchId, provider])
}
```

**API Endpoints:**

```typescript
// POST /api/integrations/planning-center/connect
router.post('/planning-center/connect', authenticate, async (req, res) => {
  const { accessToken } = req.body;

  // Store integration
  await prisma.integration.create({
    data: {
      churchId: req.churchId,
      provider: 'planning_center',
      accessToken: encrypt(accessToken),
      isActive: true,
    },
  });

  // Trigger initial sync
  await syncMembersFromPlanningCenter(req.churchId, accessToken);

  res.json({ success: true });
});

// POST /api/integrations/planning-center/sync
router.post('/planning-center/sync', authenticate, async (req, res) => {
  const integration = await prisma.integration.findUnique({
    where: {
      churchId_provider: {
        churchId: req.churchId,
        provider: 'planning_center',
      },
    },
  });

  if (!integration) {
    return res.status(404).json({ error: 'Planning Center not connected' });
  }

  const accessToken = decrypt(integration.accessToken);
  await syncMembersFromPlanningCenter(req.churchId, accessToken);

  res.json({ success: true });
});
```

---

## 5. Security & Compliance

### 5.1 Data Encryption (At-Rest & In-Transit)

**Current State:**

**✅ At-Rest Encryption:**
- Phone numbers: AES-256-GCM (encryption.utils.ts)
- HMAC-SHA256 hashing for searchable phone index
- Database encryption handled by PostgreSQL (provider-level)

**✅ In-Transit Encryption:**
- HTTPS enforced via Helmet CSP headers
- Telnyx API calls over HTTPS
- S3 presigned URLs with expiration (7 days)

**⚠️ Gaps:**
- API keys not encrypted in database (plain text)
- Webhook secrets not encrypted
- Integration tokens not encrypted

**Recommended Fix:**

```typescript
// Encrypt sensitive fields before storing
await prisma.apiKey.create({
  data: {
    key: encrypt(hashedKey),  // Double encryption: hash + encrypt
    secret: encrypt(secret),
  },
});

await prisma.integration.create({
  data: {
    accessToken: encrypt(accessToken),
    refreshToken: encrypt(refreshToken),
  },
});
```

### 5.2 Rate Limiting Strategy

**Current Implementation:**

```typescript
// Fixed rate limits (no tier differentiation)
Auth endpoints:    5 req / 15 min (production), 50 (dev)
Password reset:    3 req / hour
Billing:          30 req / 15 min
General API:     100 req / 15 min
```

**Proposed Tiered Rate Limiting:**

```typescript
// Plan-based limits
const RATE_LIMITS = {
  starter: {
    api: 100,        // 100 req / 15 min
    messages: 500,   // 500 messages / day
    members: 500,    // Max 500 members
  },
  growth: {
    api: 500,
    messages: 5000,
    members: 5000,
  },
  pro: {
    api: 2000,
    messages: 50000,
    members: 50000,
  },
  enterprise: {
    api: -1,         // Unlimited
    messages: -1,
    members: -1,
  },
};

// Middleware
export function planBasedRateLimit(resource: 'api' | 'messages' | 'members') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const church = await prisma.church.findUnique({
      where: { id: req.churchId },
      include: { subscriptions: true },
    });

    const plan = church.subscriptions[0]?.plan || 'starter';
    const limit = RATE_LIMITS[plan][resource];

    if (limit === -1) return next();  // Unlimited

    const key = `ratelimit:${plan}:${req.churchId}:${resource}`;
    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, resource === 'messages' ? 86400 : 900);
    }

    if (count > limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        plan,
        limit,
        resetIn: await redisClient.ttl(key),
      });
    }

    next();
  };
}
```

### 5.3 GDPR Compliance (Right to be Forgotten)

**Current State:**
- ❌ No automated data deletion
- ❌ No data export functionality
- ❌ No consent tracking

**Recommended Implementation:**

```prisma
model DataDeletionRequest {
  id              String   @id @default(cuid())
  churchId        String
  memberId        String?
  requestedBy     String   // Admin ID
  status          String   @default("pending")  // pending, processing, completed
  scheduledFor    DateTime
  completedAt     DateTime?
  deletedData     String?  // JSON: ["messages", "conversations", "analytics"]
  createdAt       DateTime @default(now())

  @@index([status, scheduledFor])
}

model ConsentLog {
  id              String   @id @default(cuid())
  memberId        String
  consentType     String   // sms, email, data_processing
  granted         Boolean
  grantedAt       DateTime @default(now())
  ipAddress       String?

  member          Member   @relation(fields: [memberId], references: [id])

  @@index([memberId])
}
```

**GDPR Deletion Service:**

```typescript
// services/gdpr.service.ts
export async function requestDataDeletion(
  churchId: string,
  memberId: string,
  requestedBy: string
): Promise<void> {
  // 30-day waiting period (GDPR allows reasonable delay)
  const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.dataDeletionRequest.create({
    data: {
      churchId,
      memberId,
      requestedBy,
      scheduledFor,
    },
  });
}

export async function processPendingDeletions(): Promise<void> {
  const pending = await prisma.dataDeletionRequest.findMany({
    where: {
      status: 'pending',
      scheduledFor: { lte: new Date() },
    },
  });

  for (const request of pending) {
    await prisma.dataDeletionRequest.update({
      where: { id: request.id },
      data: { status: 'processing' },
    });

    try {
      const deletedData = [];

      // Delete messages sent to this member
      await prisma.messageRecipient.deleteMany({
        where: { memberId: request.memberId },
      });
      deletedData.push('message_recipients');

      // Delete conversation messages
      await prisma.conversationMessage.deleteMany({
        where: { memberId: request.memberId },
      });
      deletedData.push('conversation_messages');

      // Delete conversations
      await prisma.conversation.deleteMany({
        where: { memberId: request.memberId },
      });
      deletedData.push('conversations');

      // Anonymize member (keep record for analytics, remove PII)
      await prisma.member.update({
        where: { id: request.memberId },
        data: {
          firstName: 'Deleted',
          lastName: 'User',
          phone: encrypt('DELETED'),
          phoneHash: null,
          email: null,
        },
      });
      deletedData.push('member_pii');

      await prisma.dataDeletionRequest.update({
        where: { id: request.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          deletedData: JSON.stringify(deletedData),
        },
      });
    } catch (error: any) {
      console.error('GDPR deletion failed:', error);
    }
  }
}
```

**API Endpoints:**

```typescript
// POST /api/admin/gdpr/delete-member
router.post('/gdpr/delete-member', authenticate, async (req, res) => {
  const { memberId } = req.body;

  await gdprService.requestDataDeletion(
    req.churchId,
    memberId,
    req.adminId
  );

  res.json({
    success: true,
    message: 'Data deletion scheduled for 30 days from now',
  });
});

// GET /api/admin/gdpr/export-member-data
router.get('/gdpr/export-member-data/:memberId', authenticate, async (req, res) => {
  const { memberId } = req.params;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      groups: true,
      messageRecipients: { include: { message: true } },
      conversations: { include: { messages: true } },
    },
  });

  res.json({
    personalInfo: {
      firstName: member.firstName,
      lastName: member.lastName,
      phone: decryptPhoneSafe(member.phone),
      email: member.email,
    },
    groups: member.groups.map(g => g.group.name),
    messagesReceived: member.messageRecipients.length,
    conversations: member.conversations.length,
    createdAt: member.createdAt,
  });
});
```

### 5.4 Audit Logging

**Current State:**
- ✅ Structured security logging (security-logger.ts)
- ✅ Rate limit logging
- ❌ No audit trail for sensitive operations

**Recommended Implementation:**

```prisma
model AuditLog {
  id            String   @id @default(cuid())
  churchId      String?
  adminId       String?
  action        String   // "member.created", "message.sent", "phone.purchased"
  resourceType  String   // "member", "message", "phone"
  resourceId    String?
  changes       String?  // JSON: {"before": {...}, "after": {...}}
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())

  @@index([churchId, createdAt])
  @@index([adminId, createdAt])
  @@index([action, createdAt])
}
```

**Audit Logging Service:**

```typescript
// utils/audit-logger.ts
export async function logAudit(
  action: string,
  resourceType: string,
  resourceId: string,
  options?: {
    churchId?: string;
    adminId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  await prisma.auditLog.create({
    data: {
      action,
      resourceType,
      resourceId,
      churchId: options?.churchId,
      adminId: options?.adminId,
      changes: options?.changes ? JSON.stringify(options.changes) : null,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    },
  });
}

// Usage
await logAudit('phone.purchased', 'phone', phoneNumber, {
  churchId,
  adminId: req.adminId,
  changes: { phoneNumber, cost: '$2.00' },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### 5.5 API Key Management

**Recommended Implementation:**

```typescript
// API key generation with scopes
export async function generateApiKey(
  churchId: string,
  adminId: string,
  options: {
    name: string;
    scopes: string[];
    rateLimit?: number;
    expiresIn?: number;  // days
  }
): Promise<{ key: string; keyId: string }> {
  const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
  const hashedKey = hashApiKey(rawKey);
  const keyPrefix = rawKey.substring(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: {
      churchId,
      name: options.name,
      key: encrypt(hashedKey),  // Encrypted storage
      keyPrefix,
      scopes: JSON.stringify(options.scopes),
      rateLimit: options.rateLimit || 100,
      expiresAt: options.expiresIn
        ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000)
        : null,
    },
  });

  // Log API key creation
  await logAudit('api_key.created', 'api_key', apiKey.id, {
    churchId,
    adminId,
    changes: { name: options.name, scopes: options.scopes },
  });

  return { key: rawKey, keyId: apiKey.id };
}

// API key rotation
export async function rotateApiKey(keyId: string): Promise<string> {
  const oldKey = await prisma.apiKey.findUnique({ where: { id: keyId } });

  const newRawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
  const newHashedKey = hashApiKey(newRawKey);

  await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      key: encrypt(newHashedKey),
      keyPrefix: newRawKey.substring(0, 12),
    },
  });

  // Log rotation
  await logAudit('api_key.rotated', 'api_key', keyId, {
    churchId: oldKey.churchId,
  });

  return newRawKey;
}
```

---

## 6. Developer Experience

### 6.1 API Documentation (OpenAPI/Swagger)

**Current State:**
- ❌ No API documentation
- ❌ No interactive API explorer

**Recommended Implementation:**

```typescript
// Install: npm install swagger-ui-express swagger-jsdoc

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Koinoniasms API',
      version: '1.0.0',
      description: 'Enterprise church messaging platform',
      contact: {
        name: 'API Support',
        email: 'support@koinoniasms.com',
      },
    },
    servers: [
      { url: 'https://api.koinoniasms.com', description: 'Production' },
      { url: 'https://api-staging.koinoniasms.com', description: 'Staging' },
      { url: 'http://localhost:3000', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }',
}));
```

**JSDoc Annotations:**

```typescript
/**
 * @swagger
 * /api/v1/messages/send:
 *   post:
 *     summary: Send SMS message
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - targetType
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Service reminder: Sunday at 10am"
 *               channel:
 *                 type: string
 *                 enum: [sms, email, unified]
 *                 default: sms
 *               targetType:
 *                 type: string
 *                 enum: [individual, groups, branches, all]
 *               targetIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Message queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 recipientCount:
 *                   type: integer
 *       401:
 *         description: Invalid API key
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/send', ...);
```

### 6.2 SDK Generation

**Recommended Tools:**
- OpenAPI Generator (auto-generate SDKs from OpenAPI spec)
- TypeScript SDK for JavaScript/Node.js
- Python SDK for data science/automation

```bash
# Generate TypeScript SDK
npx @openapitools/openapi-generator-cli generate \
  -i swagger.json \
  -g typescript-axios \
  -o ./sdks/typescript

# Generate Python SDK
npx @openapitools/openapi-generator-cli generate \
  -i swagger.json \
  -g python \
  -o ./sdks/python
```

**SDK Usage Example:**

```typescript
// TypeScript SDK
import { KoinoniasmsClient } from '@koinoniasms/sdk';

const client = new KoinoniasmsClient({
  apiKey: 'sk_...',
  baseURL: 'https://api.koinoniasms.com',
});

const message = await client.messages.send({
  content: 'Service reminder',
  targetType: 'all',
});

console.log(`Message sent to ${message.recipientCount} recipients`);
```

### 6.3 Webhook Delivery Guarantees

**Current State:**
- ✅ Telnyx webhook signature verification (ED25519)
- ⚠️ Synchronous processing (blocks response)
- ❌ No delivery guarantees for outbound webhooks

**Recommended Implementation:**

**Inbound Webhooks (Telnyx):**
```typescript
// Current: Synchronous processing
router.post('/webhooks/telnyx/status', async (req, res) => {
  await processWebhook(req.body);
  res.status(200).send('OK');
});

// Improved: Queue-based processing
router.post('/webhooks/telnyx/status', async (req, res) => {
  // Verify signature immediately
  const verified = verifyWebhookSignature(req.body, req.headers['x-telnyx-signature']);

  if (!verified) {
    return res.status(401).send('Invalid signature');
  }

  // Queue for async processing
  await webhookQueue.add(req.body, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
  });

  // Respond immediately (200 OK within 3 seconds)
  res.status(200).json({ received: true });
});
```

**Outbound Webhooks (to customers):**
- Implement retry logic (5 attempts)
- Exponential backoff (2s, 4s, 8s, 16s, 32s)
- Signature verification (HMAC-SHA256)
- Delivery status tracking
- Automatic disable after 10 consecutive failures

### 6.4 Error Handling Standards

**Current State:**
- ✅ Structured error responses
- ⚠️ Inconsistent error codes

**Recommended Standard:**

```typescript
// Centralized error types
export enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'invalid_credentials',
  EXPIRED_TOKEN = 'expired_token',
  INVALID_API_KEY = 'invalid_api_key',

  // Authorization
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  PLAN_LIMIT_EXCEEDED = 'plan_limit_exceeded',

  // Validation
  INVALID_PHONE_NUMBER = 'invalid_phone_number',
  INVALID_EMAIL = 'invalid_email',
  MISSING_REQUIRED_FIELD = 'missing_required_field',

  // Resources
  RESOURCE_NOT_FOUND = 'resource_not_found',
  DUPLICATE_RESOURCE = 'duplicate_resource',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',

  // External Services
  TELNYX_API_ERROR = 'telnyx_api_error',
  STRIPE_API_ERROR = 'stripe_api_error',
  S3_UPLOAD_ERROR = 's3_upload_error',
}

// Standard error response format
export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    retryable?: boolean;
    retryAfter?: number;  // seconds
  };
}

// Error handler middleware
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || ErrorCode.INTERNAL_ERROR;

  const response: ApiErrorResponse = {
    error: {
      code: errorCode,
      message: err.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      retryable: err.retryable || false,
      retryAfter: err.retryAfter,
    },
  };

  // Log error
  console.error('[API_ERROR]', JSON.stringify({
    code: errorCode,
    message: err.message,
    path: req.path,
    method: req.method,
    statusCode,
    churchId: req.churchId,
  }));

  res.status(statusCode).json(response);
}
```

---

## 7. Deployment & Infrastructure

### 7.1 Current Deployment (Render)

**Configuration:**
```yaml
# render.yaml
services:
  - type: web
    name: koinonia-sms-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        value: redis://localhost:6379  # ISSUE: No Redis on Render
```

**Issues:**
- Redis not available (queue disabled)
- Single region deployment (no CDN)
- No auto-scaling
- Limited logging/monitoring

### 7.2 Recommended Infrastructure Upgrades

**Option 1: Render + Managed Services (Low Effort)**

```yaml
services:
  - type: web
    name: backend
    env: node
    plan: standard  # $25/mo

  - type: redis
    name: redis
    plan: starter  # $10/mo

  - type: pserv
    name: worker
    env: node
    buildCommand: npm install && npm run build
    startCommand: node dist/workers/index.js  # Queue workers
```

**Benefits:**
- Easy migration (stay on Render)
- Redis available for caching + queues
- Background workers for message processing

**Costs:** $50-100/month

**Option 2: AWS (Production-Grade)**

```
Architecture:
┌─────────────────┐
│   CloudFront    │  CDN for static assets
│   (Global CDN)  │
└────────┬────────┘
         │
┌────────▼────────┐
│   Application   │  ECS Fargate (auto-scaling)
│   Load Balancer │  2-10 containers
└────────┬────────┘
         │
┌────────▼────────┐
│   RDS Postgres  │  Multi-AZ, automated backups
│   (Primary +    │  Read replicas for analytics
│    Read Replica)│
└─────────────────┘
         │
┌────────▼────────┐
│  ElastiCache    │  Redis cluster (caching + queues)
│  (Redis)        │
└─────────────────┘
         │
┌────────▼────────┐
│      S3         │  Media files with lifecycle policies
│  (Media Storage)│
└─────────────────┘
```

**Benefits:**
- Auto-scaling (handle traffic spikes)
- Multi-region support
- CDN for global latency < 100ms
- Managed database backups
- CloudWatch monitoring

**Costs:** $200-500/month (scales with usage)

**Option 3: Hybrid (Vercel + Render + AWS)**

```
Frontend → Vercel (global CDN, auto-deploy)
Backend  → Render (API + workers)
Database → AWS RDS (managed Postgres)
Cache    → AWS ElastiCache (Redis)
Media    → AWS S3 (presigned URLs)
```

**Benefits:**
- Best developer experience (Vercel deploys)
- Lower costs than full AWS
- Managed services reduce ops burden

**Costs:** $100-200/month

### 7.3 Database Migration Strategy

**Current State:**
- Prisma migrations (auto-run on startup)
- No rollback strategy
- No blue-green deployment

**Recommended Strategy:**

**Zero-Downtime Migrations:**

```typescript
// Step 1: Add new column (nullable)
await prisma.$executeRaw`
  ALTER TABLE "Member" ADD COLUMN "preferredChannel" TEXT;
`;

// Step 2: Deploy new code (uses new column if exists)
// Old code ignores new column

// Step 3: Backfill data
await prisma.$executeRaw`
  UPDATE "Member" SET "preferredChannel" = 'sms' WHERE "preferredChannel" IS NULL;
`;

// Step 4: Add NOT NULL constraint
await prisma.$executeRaw`
  ALTER TABLE "Member" ALTER COLUMN "preferredChannel" SET NOT NULL;
`;
```

**Rollback Plan:**

```typescript
// migrations/rollback.ts
export async function rollbackMigration(version: string) {
  const rollbackFile = `./prisma/migrations/${version}/rollback.sql`;
  const sql = fs.readFileSync(rollbackFile, 'utf-8');

  await prisma.$executeRawUnsafe(sql);

  console.log(`Rolled back to version ${version}`);
}
```

### 7.4 Monitoring & Alerting

**Recommended Stack:**

**Logging:**
- **Datadog** (APM + Logs) - $15/host/mo
- **CloudWatch** (AWS native) - Pay-as-you-go
- **Logtail** (Cheap alternative) - $5-25/mo

**Metrics to Track:**

```typescript
// Application metrics
api.response_time (p50, p95, p99)
api.error_rate
api.requests_per_second

// Message metrics
messages.sent_per_minute
messages.delivery_rate
messages.failed_count

// Database metrics
db.query_duration
db.connection_pool_usage
db.slow_queries (> 1 second)

// Queue metrics (when re-enabled)
queue.pending_jobs
queue.processing_time
queue.failed_jobs

// Business metrics
churches.active_count
churches.trial_expiring_soon
subscriptions.churn_rate
```

**Alerts:**

```yaml
# Datadog alert configuration
alerts:
  - name: High Error Rate
    condition: api.error_rate > 5%
    window: 5 minutes
    notify: [email, slack]

  - name: Slow API Response
    condition: api.response_time.p95 > 2000ms
    window: 10 minutes

  - name: Message Delivery Failure
    condition: messages.delivery_rate < 90%
    window: 15 minutes

  - name: Database Connection Pool Exhausted
    condition: db.connection_pool_usage > 90%
    window: 5 minutes
```

**Uptime Monitoring:**
- **UptimeRobot** (Free for 50 monitors)
- **Pingdom** ($10-100/mo)

---

## 8. Top 5 Optimization Opportunities

### Priority 1: Re-Enable Message Queue (High Impact)

**Problem:** Synchronous message sending blocks API responses (2-15 seconds)

**Solution:** Re-enable Bull + Redis queue with parallel workers

**Impact:**
- 10x throughput (600 msg/min → 6000 msg/min)
- API response times: 2-15 sec → 100-300ms
- Retry logic for failed sends
- Progress tracking

**Effort:** Medium (3-5 days)

**Files to modify:**
- `backend/src/jobs/queue.ts` (remove ENABLE_QUEUES check)
- `backend/src/controllers/message.controller.ts` (queue instead of direct send)
- `backend/src/index.ts` (start queue workers)

### Priority 2: Implement Caching Layer (High Impact, Low Effort)

**Problem:** Database queries on every request, slow dashboard loads

**Solution:** Redis caching for frequently accessed data

**Impact:**
- 70% reduction in database load
- 50% faster API response times
- Database connection pool freed for writes

**Effort:** Low (2-3 days)

**Implementation:**

```typescript
// Cache church settings (10 min TTL)
const cached = await redisClient.get(`church:${churchId}`);
if (cached) return JSON.parse(cached);

const church = await prisma.church.findUnique({ ... });
await redisClient.setEx(`church:${churchId}`, 600, JSON.stringify(church));
```

### Priority 3: Database Query Optimization (Medium Impact)

**Problem:** N+1 queries, missing indexes, sequential operations

**Solution:**
1. Add missing indexes (4 new indexes)
2. Batch operations (`createMany` instead of loops)
3. Parallel processing (Promise.all)

**Impact:**
- 20-40% faster list endpoints
- 50% reduction in database round-trips
- Better scalability under load

**Effort:** Low (1-2 days)

**Files to modify:**
- `backend/prisma/schema.prisma` (add indexes)
- `backend/src/services/message.service.ts` (batch recipient creation)
- `backend/src/services/conversation.service.ts` (batch SMS sends)

### Priority 4: API Documentation (High Value for Developers)

**Problem:** No API docs, hard for developers to integrate

**Solution:** OpenAPI/Swagger documentation

**Impact:**
- Faster developer onboarding
- Self-service integration
- Reduced support burden
- SDK auto-generation

**Effort:** Low (2-3 days)

**Implementation:**
- Install swagger-ui-express
- Add JSDoc annotations to routes
- Generate docs at `/api/docs`

### Priority 5: Outbound Webhooks (Strategic Feature)

**Problem:** No way for customers to integrate with their own systems

**Solution:** Webhook platform for events (message.sent, member.created, etc.)

**Impact:**
- Unlock Zapier integration
- Enable custom integrations
- Competitive advantage vs. Twilio
- Increase customer retention

**Effort:** Medium (5-7 days)

**Implementation:**
- Database schema (Webhook, WebhookDelivery)
- Webhook delivery service (retry logic, signatures)
- API endpoints (create/update/delete webhooks)
- Zapier app integration

---

## 9. 6-Month Technical Roadmap

### Month 1: Performance & Reliability

**Week 1-2: Message Queue**
- Re-enable Redis/Bull queue
- Implement parallel workers (5 SMS, 10 webhook, 2 analytics)
- Add queue dashboard (Bull Board)
- Deploy and monitor

**Week 3-4: Caching Layer**
- Implement Redis caching for church/group/member data
- Add cache invalidation logic
- Monitor cache hit rate (target 70%+)

**Deliverables:**
- 10x message throughput
- 50% faster API responses
- Queue monitoring dashboard

### Month 2: Database Optimization

**Week 1-2: Query Optimization**
- Add 4 missing indexes
- Batch operations (createMany)
- Optimize N+1 queries
- Database performance testing

**Week 3-4: Connection Pooling**
- Tune Prisma connection pool
- Add PgBouncer (if needed)
- Monitor connection usage

**Deliverables:**
- 40% faster queries
- 50% reduction in database load
- Connection pool metrics

### Month 3: Email Integration

**Week 1-2: Email Service**
- Upgrade SendGrid or migrate to Resend
- Implement email templates
- Email delivery tracking

**Week 3-4: Unified Messaging**
- Database schema changes (optInEmail, preferredChannel)
- Unified messaging service
- API updates (channel selection)

**Deliverables:**
- SMS + Email unified platform
- Email open/click tracking
- Template management

### Month 4: Developer Platform

**Week 1-2: API Documentation**
- OpenAPI/Swagger setup
- JSDoc annotations for all routes
- Interactive API explorer at /api/docs

**Week 3-4: API Keys & Authentication**
- API key management (generation, rotation, scopes)
- Rate limiting tiers (plan-based)
- Audit logging

**Deliverables:**
- Complete API documentation
- Public API v1 (/api/v1/public)
- Developer portal

### Month 5: Advanced Features

**Week 1-2: Link Tracking**
- Link shortening service
- Click tracking database
- Analytics dashboard

**Week 3-4: Message Scheduling**
- One-time scheduled messages
- Timezone handling (date-fns-tz)
- Recurrence rules (rrule)

**Deliverables:**
- Link click analytics
- Advanced scheduling system
- Timezone support

### Month 6: Integrations & Webhooks

**Week 1-2: Outbound Webhooks**
- Webhook platform (create, delivery, retry)
- Signature verification (HMAC-SHA256)
- Zapier integration prep

**Week 3-4: Planning Center Integration**
- OAuth setup
- Member sync service
- Integration management UI

**Deliverables:**
- Webhook platform (events: message.sent, member.created, etc.)
- Zapier app (beta)
- Planning Center sync

---

## 10. Success Metrics

### Performance Metrics

| Metric | Current | Target (6 Months) |
|--------|---------|-------------------|
| API Response Time (p95) | 500-1000ms | < 200ms |
| Message Send Time | 2-15 seconds | < 500ms (queued) |
| Dashboard Load Time | 1-2 seconds | < 500ms |
| Database Query Time (p95) | 200-500ms | < 100ms |
| Throughput (req/sec) | ~50-100 | 500+ |
| Message Throughput (msg/min) | 60 | 6000 |

### Reliability Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Uptime | 99.5% | 99.9% |
| Message Delivery Rate | 90-95% | 98%+ |
| API Error Rate | 2-3% | < 1% |
| Webhook Delivery Success | N/A | 95%+ |

### Developer Experience

| Metric | Current | Target |
|--------|---------|--------|
| API Documentation Coverage | 0% | 100% |
| SDK Availability | None | TypeScript + Python |
| Webhook Events | 0 | 10+ |
| Public API Endpoints | 0 | 15+ |

### Business Impact

| Metric | Current | Target |
|--------|---------|--------|
| Supported Channels | SMS only | SMS + Email |
| Integrations | 0 | Zapier + Planning Center |
| API Customers | 0 | 10+ beta users |
| Developer Signups | 0 | 100+ |

---

## 11. Risk Assessment

### Technical Risks

**High Risk:**
1. **Redis Queue Downtime** - If Redis fails, messages don't send
   - Mitigation: Implement fallback to synchronous sending

2. **Database Connection Pool Exhaustion** - Under high load, API becomes unavailable
   - Mitigation: PgBouncer + connection pool tuning

**Medium Risk:**
3. **Third-Party API Failures** (Telnyx, Stripe, SendGrid)
   - Mitigation: Retry logic, circuit breakers, fallback providers

4. **Data Migration Errors** - Schema changes break production
   - Mitigation: Zero-downtime migrations, rollback scripts

**Low Risk:**
5. **Cache Invalidation Bugs** - Stale data shown to users
   - Mitigation: Conservative TTLs, cache invalidation testing

### Security Risks

**High Risk:**
1. **API Key Leakage** - Compromised keys allow unauthorized access
   - Mitigation: Key rotation, scopes, audit logging

2. **GDPR Non-Compliance** - Fines up to 4% of revenue
   - Mitigation: Implement data deletion, consent tracking

**Medium Risk:**
3. **Webhook Signature Bypass** - Fake webhooks trigger actions
   - Mitigation: HMAC-SHA256 verification, IP whitelisting

---

## 12. Conclusion & Recommendations

### Current State Summary

Koinoniasms has a **solid foundation** with:
- ✅ Type-safe TypeScript codebase
- ✅ Well-structured Prisma database
- ✅ Strong security patterns (encryption, CSRF, rate limiting)
- ✅ Enterprise-grade phone number linking with automatic recovery
- ✅ Webhook reliability (ED25519 verification)

**Critical Gaps:**
- ❌ No message queue (Redis disabled)
- ❌ No caching layer (slow API responses)
- ❌ Limited scalability (single synchronous process)
- ❌ No developer API/documentation
- ❌ Missing strategic features (Email, Webhooks, Scheduling)

### Immediate Actions (Next 30 Days)

1. **Re-enable Redis Queue** (Week 1-2)
   - Set up managed Redis on Render
   - Enable Bull queue processing
   - Deploy with monitoring

2. **Implement Caching** (Week 3)
   - Cache church/group/member data
   - 10-minute TTL for configuration
   - Monitor cache hit rate

3. **Add Missing Indexes** (Week 4)
   - 4 new indexes (Message, Conversation, Member, RecurringMessage)
   - Database performance testing
   - Deploy to production

### Strategic Priorities (6 Months)

**Focus Areas:**
1. **Performance** - Message queue + caching (Month 1-2)
2. **Email Integration** - Unified SMS+Email platform (Month 3)
3. **Developer Platform** - API docs + public API (Month 4)
4. **Advanced Features** - Scheduling + link tracking (Month 5)
5. **Integrations** - Webhooks + Zapier + Planning Center (Month 6)

**Investment Required:**
- Engineering: 1-2 developers (6 months)
- Infrastructure: $100-200/month (Render + managed Redis)
- Optional: AWS migration ($200-500/month for production-grade)

### Expected Outcomes

**After 6 Months:**
- 10x message throughput (60 → 6000 msg/min)
- 50% faster API responses
- Unified SMS + Email platform
- Complete developer API with documentation
- Zapier integration + webhook platform
- Planning Center sync
- Production-ready for enterprise customers

**Business Impact:**
- Unlock enterprise market (API access, integrations)
- Reduce support burden (self-service docs)
- Increase customer retention (webhook platform)
- Competitive advantage vs. Twilio/Pushpay
- Foundation for mobile app launch

---

## Appendix A: File Structure Reference

```
backend/
├── src/
│   ├── controllers/       # 13 controllers (auth, message, billing, etc.)
│   ├── services/          # 21 services (core business logic)
│   ├── routes/            # 13 route modules
│   ├── middleware/        # Auth, CSRF, rate limiting
│   ├── jobs/              # Scheduled jobs (recurring, recovery, 10DLC)
│   ├── utils/             # Encryption, JWT, phone, security logging
│   ├── config/            # Plans, Redis config
│   ├── app.ts             # Express app configuration
│   └── index.ts           # Server startup
├── prisma/
│   ├── schema.prisma      # Database schema (23 models)
│   └── migrations/        # Migration history
├── dist/                  # Compiled TypeScript output
└── package.json           # Dependencies
```

## Appendix B: Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
TELNYX_API_KEY=...
STRIPE_SECRET_KEY=...
JWT_SECRET=...
ENCRYPTION_KEY=...  # AES-256-GCM key

# Optional (but recommended)
REDIS_URL=redis://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SENDGRID_API_KEY=...
OPENAI_API_KEY=...

# Production
NODE_ENV=production
BACKEND_URL=https://api.koinoniasms.com
FRONTEND_URL=https://koinoniasms.com
```

## Appendix C: Database Diagram (Simplified)

```
Church (1) ─────< (N) Branches (1) ─────< (N) Groups
   │                                          │
   │                                          │
   │                                          ▼
   │                                   GroupMember (M:N)
   │                                          │
   │                                          │
   │                                          ▼
   │                                      Member (N)
   │                                          │
   │                                          │
   ├──< (N) Messages ──< (N) MessageRecipient─┤
   │
   ├──< (N) RecurringMessages
   │
   ├──< (N) Conversations ──< (N) ConversationMessages
   │
   └──< (1) Subscription
```

---

**Review Complete. Backend Architecture Grade: B+ → A- (After Roadmap Implementation)**

**Critical Next Steps:**
1. Re-enable Redis queue (Priority 1)
2. Implement caching layer (Priority 2)
3. Add missing database indexes (Priority 3)
4. Begin email integration planning (Month 3 prep)

**Questions? Contact:** Senior Backend Engineer Team
