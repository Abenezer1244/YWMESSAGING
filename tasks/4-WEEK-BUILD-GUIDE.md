# Connect YW Church SMS Platform
# 4-Week Feature-Complete MVP Build Guide

**Last Updated:** October 28, 2025
**Timeline:** 20 working days (4 weeks)
**Target:** Production-ready MVP with ALL features

---

## 🚨 CRITICAL SUCCESS FACTORS

### What Makes or Breaks This Timeline

**MUST HAVE:**
- ✅ **60+ hours/week** dedicated development time (8-10 hours/day minimum)
- ✅ **Zero distractions** - no other projects during these 4 weeks
- ✅ **All accounts created** before Day 1 (Twilio, Stripe, PostHog, hosting)
- ✅ **Experience with TypeScript** and React (intermediate level minimum)
- ✅ **Claude Code mastery** - learn keyboard shortcuts, workflows on Day 0
- ✅ **Strong PostgreSQL/SQL** understanding for schema design
- ✅ **Willingness to debug** - expect 20-30% of time spent troubleshooting

**DEALBREAKERS:**
- ❌ Part-time availability (20-40 hours/week) - won't finish in 4 weeks
- ❌ Beginner in React/Node.js - need 6-8 weeks instead
- ❌ Perfectionism - ship MVP, iterate later
- ❌ Scope creep - stick to this exact spec

**REALISTIC ASSESSMENT:**
- This is an **AGGRESSIVE** timeline
- Experienced developers: **Achievable with focus**
- Intermediate developers: **Challenging but possible**
- Beginners: **Unrealistic - allocate 8-12 weeks**

---

## 📋 PRE-WEEK CHECKLIST (Complete Before Day 1)

### Account Creation & Setup

**Twilio Account (30 minutes):**
- [ ] Sign up at https://www.twilio.com/try-twilio
- [ ] Verify your email and phone
- [ ] Note your Account SID and Auth Token
- [ ] Add $20 credit to account
- [ ] **CRITICAL:** Start A2P 10DLC registration (takes 1-2 weeks for approval)
  - Business profile verification
  - Brand registration ($4 one-time fee)
  - Campaign registration ($10/month per campaign)
  - SMS use case: "Church notifications and community updates"
- [ ] For testing: Buy a Twilio phone number ($1/month)

**Stripe Account (20 minutes):**
- [ ] Sign up at https://stripe.com
- [ ] Complete business verification
- [ ] Enable test mode
- [ ] Note your test API keys (publishable and secret)
- [ ] Later: Get live API keys before launch

**PostHog Account (15 minutes):**
- [ ] Sign up at https://posthog.com (free tier available)
- [ ] Create new project "Connect YW"
- [ ] Note your Project API Key
- [ ] Note your instance URL (US or EU)

**Hosting Accounts (30 minutes):**
Option A - Vercel + Railway (Recommended for speed):
- [ ] Vercel account for frontend (https://vercel.com)
- [ ] Railway account for backend + DB (https://railway.app)

Option B - DigitalOcean (More control):
- [ ] DigitalOcean account
- [ ] Create new project

Option C - AWS (Most complex):
- [ ] AWS account
- [ ] Set up IAM user
- [ ] Configure billing alerts

**Development Tools:**
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Git installed and configured
- [ ] VS Code with Claude Code extension
- [ ] Docker Desktop (optional, for local PostgreSQL)
- [ ] PostgreSQL 15+ (local or Docker)
- [ ] Postman or Thunder Client for API testing
- [ ] GitHub account with new repo created

**Environment Setup:**
- [ ] Create GitHub repo: `connect-yw-platform`
- [ ] Clone to local machine
- [ ] Set up .gitignore for Node.js projects
- [ ] Create development branch: `git checkout -b development`

---

## 📊 COMPLETE DATABASE SCHEMA

### Prisma Schema (Copy-Paste Ready)

This is the complete schema for all entities. Save as `/backend/prisma/schema.prisma`:

```prisma
// Connect YW Church SMS Platform - Complete Database Schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum SubscriptionPlan {
  STARTER  // $49/month - 1 branch, 500 members
  GROWTH   // $79/month - 5 branches, 2000 members
  PRO      // $99/month - 10 branches, unlimited members
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  INCOMPLETE
}

enum AdminRole {
  PRIMARY
  CO_ADMIN
}

enum MessageStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
  CANCELED
}

enum DeliveryStatus {
  PENDING
  QUEUED
  SENT
  DELIVERED
  FAILED
  UNDELIVERED
}

enum CommunicationMode {
  ONE_WAY   // Broadcast only, no replies
  TWO_WAY   // Replies enabled
}

// ============================================
// CORE ENTITIES
// ============================================

model Church {
  id                    String              @id @default(cuid())
  name                  String
  email                 String              @unique
  phone                 String?
  address               String?

  // Subscription & Trial
  subscriptionPlan      SubscriptionPlan    @default(STARTER)
  trialEndsAt           DateTime?
  isTrialing            Boolean             @default(true)

  // Communication Settings
  communicationMode     CommunicationMode   @default(ONE_WAY)

  // Twilio Integration
  twilioAccountSid      String?
  twilioAuthToken       String?             // Encrypted in production
  twilioPhoneNumber     String?             @unique
  twilioVerified        Boolean             @default(false)

  // Timestamps
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  branches              Branch[]
  admins                Admin[]
  messages              Message[]
  subscription          Subscription?
  analyticsEvents       AnalyticsEvent[]

  @@index([email])
  @@index([twilioPhoneNumber])
}

model Branch {
  id                    String              @id @default(cuid())
  churchId              String

  name                  String
  address               String?
  phone                 String?
  description           String?

  isActive              Boolean             @default(true)

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  church                Church              @relation(fields: [churchId], references: [id], onDelete: Cascade)
  groups                Group[]

  @@index([churchId])
  @@unique([churchId, name])
}

model Group {
  id                    String              @id @default(cuid())
  branchId              String

  name                  String
  description           String?

  // Welcome Message Settings
  welcomeMessageEnabled Boolean             @default(true)
  welcomeMessageText    String?             @default("Welcome to our church community! We're glad to have you.")

  isActive              Boolean             @default(true)

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  branch                Branch              @relation(fields: [branchId], references: [id], onDelete: Cascade)
  groupMembers          GroupMember[]

  @@index([branchId])
  @@unique([branchId, name])
}

model Member {
  id                    String              @id @default(cuid())

  firstName             String
  lastName              String
  phone                 String              // E.164 format: +1234567890
  email                 String?

  // Opt-in/out Management
  isOptedIn             Boolean             @default(true)
  optedOutAt            DateTime?

  // Member Metadata
  notes                 String?
  tags                  String[]            // JSON array for flexible tagging

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  groupMemberships      GroupMember[]
  messageRecipients     MessageRecipient[]

  @@unique([phone])
  @@index([phone])
  @@index([email])
}

model GroupMember {
  id                    String              @id @default(cuid())
  groupId               String
  memberId              String

  // Welcome message tracking
  welcomeMessageSent    Boolean             @default(false)
  welcomeMessageSentAt  DateTime?

  joinedAt              DateTime            @default(now())

  // Relations
  group                 Group               @relation(fields: [groupId], references: [id], onDelete: Cascade)
  member                Member              @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([groupId, memberId])
  @@index([groupId])
  @@index([memberId])
}

model Message {
  id                    String              @id @default(cuid())
  churchId              String

  // Sender Info
  sentByAdminId         String
  sentByAdminEmail      String

  // Message Content
  content               String
  characterCount        Int

  // Recipient Targeting
  targetType            String              // "individual", "group", "branch", "all"
  targetIds             String[]            // Array of group/branch IDs

  // Scheduling
  status                MessageStatus       @default(DRAFT)
  scheduledFor          DateTime?
  sentAt                DateTime?

  // Delivery Stats (calculated fields)
  totalRecipients       Int                 @default(0)
  deliveredCount        Int                 @default(0)
  failedCount           Int                 @default(0)
  replyCount            Int                 @default(0)

  // Twilio Integration
  twilioMessageSids     String[]            // Array of Twilio message SIDs

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  church                Church              @relation(fields: [churchId], references: [id], onDelete: Cascade)
  recipients            MessageRecipient[]

  @@index([churchId])
  @@index([status])
  @@index([scheduledFor])
  @@index([sentByAdminId])
}

model MessageRecipient {
  id                    String              @id @default(cuid())
  messageId             String
  memberId              String

  // Delivery Tracking
  deliveryStatus        DeliveryStatus      @default(PENDING)
  twilioMessageSid      String?             @unique

  sentAt                DateTime?
  deliveredAt           DateTime?
  failedAt              DateTime?
  errorMessage          String?

  // Reply Tracking
  hasReplied            Boolean             @default(false)
  replyText             String?
  repliedAt             DateTime?

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  message               Message             @relation(fields: [messageId], references: [id], onDelete: Cascade)
  member                Member              @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([messageId, memberId])
  @@index([messageId])
  @@index([memberId])
  @@index([deliveryStatus])
  @@index([twilioMessageSid])
}

model Admin {
  id                    String              @id @default(cuid())
  churchId              String

  email                 String              @unique
  passwordHash          String

  firstName             String
  lastName              String

  role                  AdminRole           @default(CO_ADMIN)

  // Invitation System
  invitedBy             String?             // Admin ID who sent invite
  invitedAt             DateTime?
  inviteAcceptedAt      DateTime?
  inviteToken           String?             @unique

  // Account Status
  isActive              Boolean             @default(true)
  lastLoginAt           DateTime?

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  church                Church              @relation(fields: [churchId], references: [id], onDelete: Cascade)

  @@index([churchId])
  @@index([email])
  @@index([inviteToken])
}

model Subscription {
  id                    String              @id @default(cuid())
  churchId              String              @unique

  // Stripe Integration
  stripeCustomerId      String              @unique
  stripeSubscriptionId  String?             @unique
  stripePriceId         String?

  // Subscription Details
  plan                  SubscriptionPlan    @default(STARTER)
  status                SubscriptionStatus  @default(TRIALING)

  // Billing Cycle
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  cancelAtPeriodEnd     Boolean             @default(false)
  canceledAt            DateTime?

  // Trial
  trialStart            DateTime?
  trialEnd              DateTime?

  // Usage Tracking
  currentBranchCount    Int                 @default(0)
  currentMemberCount    Int                 @default(0)
  currentMessageCount   Int                 @default(0)   // This billing cycle

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  church                Church              @relation(fields: [churchId], references: [id], onDelete: Cascade)

  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
}

model AnalyticsEvent {
  id                    String              @id @default(cuid())
  churchId              String?

  eventName             String
  properties            Json                // Flexible JSON for event properties

  userId                String?             // Admin or member ID
  sessionId             String?

  timestamp             DateTime            @default(now())

  // Relations
  church                Church?             @relation(fields: [churchId], references: [id], onDelete: Cascade)

  @@index([churchId])
  @@index([eventName])
  @@index([timestamp])
  @@index([userId])
}

// ============================================
// SYSTEM TABLES
// ============================================

model PasswordResetToken {
  id                    String              @id @default(cuid())
  email                 String
  token                 String              @unique
  expiresAt             DateTime
  used                  Boolean             @default(false)

  createdAt             DateTime            @default(now())

  @@index([email])
  @@index([token])
}

model AuditLog {
  id                    String              @id @default(cuid())

  churchId              String?
  adminId               String?

  action                String              // e.g., "message_sent", "member_added"
  entityType            String?             // e.g., "Message", "Member"
  entityId              String?

  changes               Json?               // Before/after for updates
  ipAddress             String?
  userAgent             String?

  createdAt             DateTime            @default(now())

  @@index([churchId])
  @@index([adminId])
  @@index([action])
  @@index([createdAt])
}
```

### Plan Limits Reference

```typescript
// /backend/src/config/plans.ts
export const PLAN_LIMITS = {
  STARTER: {
    price: 49,
    maxBranches: 1,
    maxMembers: 500,
    maxMessagesPerMonth: 1000,
    maxCoAdmins: 1,
    features: ['basic_analytics', 'csv_import', 'scheduled_messages']
  },
  GROWTH: {
    price: 79,
    maxBranches: 5,
    maxMembers: 2000,
    maxMessagesPerMonth: 5000,
    maxCoAdmins: 3,
    features: ['basic_analytics', 'advanced_analytics', 'csv_import', 'scheduled_messages', 'multi_branch']
  },
  PRO: {
    price: 99,
    maxBranches: 10,
    maxMembers: -1, // unlimited
    maxMessagesPerMonth: -1, // unlimited
    maxCoAdmins: 3,
    features: ['basic_analytics', 'advanced_analytics', 'csv_import', 'scheduled_messages', 'multi_branch', 'priority_support']
  }
};
```

---

## 🗺️ COMPLETE API SPECIFICATION

### Authentication Endpoints

**POST /api/auth/register**
```typescript
// Request
{
  "email": "pastor@mychurch.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Smith",
  "churchName": "First Community Church",
  "churchPhone": "+12065551234"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "admin": {
      "id": "adm_abc123",
      "email": "pastor@mychurch.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "PRIMARY"
    },
    "church": {
      "id": "ch_xyz789",
      "name": "First Community Church",
      "isTrialing": true,
      "trialEndsAt": "2025-11-11T00:00:00Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}

// Error Response (400 Bad Request)
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

**POST /api/auth/login**
```typescript
// Request
{
  "email": "pastor@mychurch.com",
  "password": "SecurePass123!"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "admin": {
      "id": "adm_abc123",
      "email": "pastor@mychurch.com",
      "firstName": "John",
      "role": "PRIMARY",
      "churchId": "ch_xyz789"
    },
    "church": {
      "id": "ch_xyz789",
      "name": "First Community Church",
      "subscriptionPlan": "STARTER",
      "isTrialing": true
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**POST /api/auth/refresh**
```typescript
// Request
{
  "refreshToken": "eyJhbGc..."
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**POST /api/auth/forgot-password**
```typescript
// Request
{
  "email": "pastor@mychurch.com"
}

// Response (200 OK)
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

**POST /api/auth/reset-password**
```typescript
// Request
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}

// Response (200 OK)
{
  "success": true,
  "message": "Password reset successful"
}
```

### Church Endpoints

**GET /api/churches/:id**
```typescript
// Headers
Authorization: Bearer <access_token>

// Response (200 OK)
{
  "success": true,
  "data": {
    "id": "ch_xyz789",
    "name": "First Community Church",
    "email": "pastor@mychurch.com",
    "phone": "+12065551234",
    "subscriptionPlan": "GROWTH",
    "isTrialing": false,
    "communicationMode": "TWO_WAY",
    "twilioVerified": true,
    "branchCount": 3,
    "memberCount": 147,
    "createdAt": "2025-10-01T12:00:00Z"
  }
}
```

**PUT /api/churches/:id**
```typescript
// Request
{
  "name": "Updated Church Name",
  "phone": "+12065559999",
  "address": "123 Main St, Seattle, WA 98101",
  "communicationMode": "ONE_WAY"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "id": "ch_xyz789",
    "name": "Updated Church Name",
    // ... updated fields
  }
}
```

**POST /api/churches/:id/twilio/connect**
```typescript
// Request
{
  "accountSid": "ACxxxxxxxxxxxxx",
  "authToken": "your_auth_token",
  "phoneNumber": "+12065551234"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "twilioVerified": true,
    "phoneNumber": "+12065551234"
  }
}
```

### Branch Endpoints

**GET /api/churches/:churchId/branches**
```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "branches": [
      {
        "id": "br_001",
        "name": "Downtown Campus",
        "address": "123 Main St",
        "groupCount": 15,
        "memberCount": 89,
        "isActive": true,
        "createdAt": "2025-10-01T12:00:00Z"
      },
      {
        "id": "br_002",
        "name": "North Campus",
        "address": "456 North Ave",
        "groupCount": 12,
        "memberCount": 58,
        "isActive": true,
        "createdAt": "2025-10-15T12:00:00Z"
      }
    ],
    "total": 2
  }
}
```

**POST /api/churches/:churchId/branches**
```typescript
// Request
{
  "name": "West Campus",
  "address": "789 West Blvd, Seattle, WA 98103",
  "phone": "+12065552222",
  "description": "Our newest campus serving the west side"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "br_003",
    "name": "West Campus",
    "address": "789 West Blvd, Seattle, WA 98103",
    "phone": "+12065552222",
    "groupCount": 0,
    "memberCount": 0,
    "createdAt": "2025-10-28T12:00:00Z"
  }
}
```

**PUT /api/branches/:id**
**DELETE /api/branches/:id**

### Group Endpoints

**GET /api/branches/:branchId/groups**
```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "grp_001",
        "name": "Youth Ministry",
        "description": "Ages 12-18",
        "memberCount": 23,
        "welcomeMessageEnabled": true,
        "welcomeMessageText": "Welcome to Youth Ministry!",
        "isActive": true
      },
      // ... up to 30 groups
    ],
    "total": 15,
    "limit": 30
  }
}
```

**POST /api/branches/:branchId/groups**
```typescript
// Request
{
  "name": "Worship Team",
  "description": "Musicians and vocalists",
  "welcomeMessageEnabled": true,
  "welcomeMessageText": "Welcome to the Worship Team! We're excited to serve together."
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "grp_015",
    "name": "Worship Team",
    "memberCount": 0,
    "createdAt": "2025-10-28T12:00:00Z"
  }
}

// Error: Limit reached (400 Bad Request)
{
  "success": false,
  "error": {
    "code": "GROUP_LIMIT_REACHED",
    "message": "This branch has reached the maximum of 30 groups"
  }
}
```

### Member Endpoints

**GET /api/groups/:groupId/members**
```typescript
// Query params: ?page=1&limit=50&search=john

// Response (200 OK)
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "mem_001",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+12065551111",
        "email": "john@example.com",
        "isOptedIn": true,
        "joinedAt": "2025-10-01T12:00:00Z",
        "welcomeMessageSent": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 23,
      "pages": 1
    }
  }
}
```

**POST /api/groups/:groupId/members**
```typescript
// Request
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+12065552222",
  "email": "jane@example.com"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "mem_125",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+12065552222",
    "welcomeMessageQueued": true
  }
}
```

**POST /api/groups/:groupId/members/import**
```typescript
// Request (multipart/form-data)
// File: members.csv
// firstName,lastName,phone,email
// John,Doe,+12065551111,john@example.com
// Jane,Smith,+12065552222,jane@example.com

// Response (200 OK)
{
  "success": true,
  "data": {
    "imported": 2,
    "failed": 0,
    "errors": [],
    "members": [
      { "id": "mem_126", "firstName": "John", "lastName": "Doe" },
      { "id": "mem_127", "firstName": "Jane", "lastName": "Smith" }
    ]
  }
}

// Response with errors (200 OK but partial success)
{
  "success": true,
  "data": {
    "imported": 1,
    "failed": 1,
    "errors": [
      {
        "row": 3,
        "phone": "invalid",
        "error": "Invalid phone number format"
      }
    ],
    "members": [
      { "id": "mem_126", "firstName": "John", "lastName": "Doe" }
    ]
  }
}
```

**DELETE /api/members/:id**

### Message Endpoints

**POST /api/messages/send**
```typescript
// Request
{
  "content": "Join us this Sunday at 10am for our special worship service!",
  "targetType": "groups",  // "individual" | "groups" | "branches" | "all"
  "targetIds": ["grp_001", "grp_002"],  // Group/branch IDs
  "scheduleFor": null  // Send immediately, or ISO timestamp for scheduling
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "msg_999",
    "content": "Join us this Sunday...",
    "status": "SENDING",
    "totalRecipients": 45,
    "estimatedCost": 2.25,  // 45 * $0.05
    "sentAt": "2025-10-28T14:30:00Z"
  }
}
```

**POST /api/messages/schedule**
```typescript
// Request
{
  "content": "Reminder: Youth group tonight at 7pm!",
  "targetType": "groups",
  "targetIds": ["grp_001"],
  "scheduleFor": "2025-10-29T18:00:00Z"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "msg_1000",
    "status": "SCHEDULED",
    "scheduledFor": "2025-10-29T18:00:00Z",
    "totalRecipients": 23
  }
}
```

**GET /api/messages/history**
```typescript
// Query: ?page=1&limit=20&status=SENT

// Response (200 OK)
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_999",
        "content": "Join us this Sunday...",
        "status": "SENT",
        "sentByAdminEmail": "pastor@church.com",
        "totalRecipients": 45,
        "deliveredCount": 43,
        "failedCount": 2,
        "replyCount": 7,
        "sentAt": "2025-10-28T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

**GET /api/messages/:id**
```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "id": "msg_999",
    "content": "Join us this Sunday...",
    "status": "SENT",
    "recipients": [
      {
        "id": "rec_001",
        "memberName": "John Doe",
        "phone": "+12065551111",
        "deliveryStatus": "DELIVERED",
        "deliveredAt": "2025-10-28T14:30:15Z",
        "hasReplied": true,
        "replyText": "I'll be there!",
        "repliedAt": "2025-10-28T14:35:00Z"
      }
    ]
  }
}
```

**GET /api/messages/replies**
```typescript
// Get all replies across all messages

// Response (200 OK)
{
  "success": true,
  "data": {
    "replies": [
      {
        "id": "rec_001",
        "messageContent": "Join us this Sunday...",
        "memberName": "John Doe",
        "phone": "+12065551111",
        "replyText": "I'll be there!",
        "repliedAt": "2025-10-28T14:35:00Z",
        "isRead": false
      }
    ],
    "unreadCount": 3,
    "total": 15
  }
}
```

**PUT /api/messages/:id/cancel** (for scheduled messages)

### Admin Endpoints

**POST /api/churches/:churchId/admins/invite**
```typescript
// Request
{
  "email": "assistant@church.com",
  "firstName": "Sarah",
  "lastName": "Johnson"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "inviteId": "inv_abc123",
    "email": "assistant@church.com",
    "inviteSent": true,
    "expiresAt": "2025-11-04T12:00:00Z"
  }
}

// Error: Limit reached (400 Bad Request)
{
  "success": false,
  "error": {
    "code": "CO_ADMIN_LIMIT_REACHED",
    "message": "Your plan allows up to 3 co-administrators"
  }
}
```

**GET /api/churches/:churchId/admins**
```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": "adm_001",
        "email": "pastor@church.com",
        "firstName": "John",
        "lastName": "Smith",
        "role": "PRIMARY",
        "lastLoginAt": "2025-10-28T08:00:00Z",
        "createdAt": "2025-10-01T12:00:00Z"
      },
      {
        "id": "adm_002",
        "email": "assistant@church.com",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "role": "CO_ADMIN",
        "inviteAcceptedAt": "2025-10-15T14:00:00Z",
        "lastLoginAt": "2025-10-27T19:00:00Z"
      }
    ],
    "limit": 3,
    "current": 2
  }
}
```

**DELETE /api/admins/:id**

### Analytics Endpoints

**GET /api/analytics/dashboard**
```typescript
// Query: ?period=30days

// Response (200 OK)
{
  "success": true,
  "data": {
    "overview": {
      "totalMembers": 147,
      "totalMessages": 68,
      "avgDeliveryRate": 96.5,
      "avgReplyRate": 15.2,
      "messagesThisWeek": 4
    },
    "messagesByWeek": [
      { "week": "2025-W43", "count": 5 },
      { "week": "2025-W42", "count": 4 },
      { "week": "2025-W41", "count": 6 }
    ],
    "replyRatesByWeek": [
      { "week": "2025-W43", "rate": 18.5 },
      { "week": "2025-W42", "rate": 12.3 }
    ],
    "topGroups": [
      { "groupName": "Youth Ministry", "messagesSent": 23, "avgReplyRate": 22.1 },
      { "groupName": "Worship Team", "messagesSent": 15, "avgReplyRate": 18.7 }
    ],
    "branchStats": [
      {
        "branchName": "Downtown Campus",
        "memberCount": 89,
        "messagesSent": 42,
        "avgReplyRate": 16.8
      },
      {
        "branchName": "North Campus",
        "memberCount": 58,
        "messagesSent": 26,
        "avgReplyRate": 13.5
      }
    ]
  }
}
```

**GET /api/analytics/messages/:id**
```typescript
// Detailed analytics for a specific message

// Response (200 OK)
{
  "success": true,
  "data": {
    "messageId": "msg_999",
    "sentAt": "2025-10-28T14:30:00Z",
    "totalRecipients": 45,
    "delivered": 43,
    "failed": 2,
    "replies": 7,
    "deliveryRate": 95.6,
    "replyRate": 15.6,
    "deliveryTimeline": [
      { "timestamp": "2025-10-28T14:30:05Z", "delivered": 10 },
      { "timestamp": "2025-10-28T14:30:10Z", "delivered": 25 },
      { "timestamp": "2025-10-28T14:30:15Z", "delivered": 43 }
    ]
  }
}
```

### Billing Endpoints

**POST /api/billing/subscribe**
```typescript
// Request
{
  "plan": "GROWTH",
  "paymentMethodId": "pm_1234567890"  // Stripe Payment Method ID
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "subscriptionId": "sub_abc123",
    "status": "ACTIVE",
    "plan": "GROWTH",
    "currentPeriodEnd": "2025-11-28T12:00:00Z",
    "nextBillingAmount": 79.00
  }
}
```

**PUT /api/billing/upgrade**
```typescript
// Request
{
  "newPlan": "PRO"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "plan": "PRO",
    "proratedAmount": 20.00,
    "nextBillingAmount": 99.00,
    "effectiveImmediately": true
  }
}
```

**GET /api/billing/usage**
```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "currentPlan": "GROWTH",
    "billingCycle": {
      "start": "2025-10-01T00:00:00Z",
      "end": "2025-11-01T00:00:00Z"
    },
    "usage": {
      "branches": { "current": 3, "limit": 5 },
      "members": { "current": 147, "limit": 2000 },
      "messages": { "current": 423, "limit": 5000 }
    },
    "alerts": []
  }
}
```

---

## 📈 COMPLETE POSTHOG EVENT CATALOG

### Implementation in Code

```typescript
// /backend/src/services/analytics.service.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(
  process.env.POSTHOG_API_KEY!,
  { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' }
);

export class AnalyticsService {
  // Helper method to track events
  static async track(
    eventName: string,
    userId: string,
    properties: Record<string, any> = {}
  ) {
    posthog.capture({
      distinctId: userId,
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
  }
}
```

### All 50+ Events with Properties

**Authentication & Onboarding Events (10 events)**

1. **user_signed_up**
```typescript
{
  admin_id: string,
  church_id: string,
  church_name: string,
  email: string,
  signup_source: "web" | "referral" | "organic",
  timestamp: ISO8601
}
```

2. **user_logged_in**
```typescript
{
  admin_id: string,
  church_id: string,
  role: "PRIMARY" | "CO_ADMIN",
  days_since_last_login: number,
  timestamp: ISO8601
}
```

3. **onboarding_started**
```typescript
{
  admin_id: string,
  church_id: string,
  timestamp: ISO8601
}
```

4. **onboarding_step_completed**
```typescript
{
  admin_id: string,
  church_id: string,
  step_name: "church_profile" | "twilio_connect" | "first_branch" | "first_group" | "member_import" | "first_message",
  step_number: 1-6,
  time_spent_seconds: number,
  timestamp: ISO8601
}
```

5. **onboarding_completed**
```typescript
{
  admin_id: string,
  church_id: string,
  total_time_minutes: number,
  steps_completed: number,
  timestamp: ISO8601
}
```

6. **onboarding_abandoned**
```typescript
{
  admin_id: string,
  church_id: string,
  last_step_completed: string,
  time_spent_minutes: number,
  timestamp: ISO8601
}
```

7. **church_profile_completed**
```typescript
{
  admin_id: string,
  church_id: string,
  church_name: string,
  has_phone: boolean,
  has_address: boolean,
  timestamp: ISO8601
}
```

8. **twilio_connection_started**
```typescript
{
  admin_id: string,
  church_id: string,
  timestamp: ISO8601
}
```

9. **twilio_connected**
```typescript
{
  admin_id: string,
  church_id: string,
  phone_number: string,
  a2p_registered: boolean,
  timestamp: ISO8601
}
```

10. **twilio_connection_failed**
```typescript
{
  admin_id: string,
  church_id: string,
  error_type: "invalid_credentials" | "phone_number_unavailable" | "api_error",
  error_message: string,
  timestamp: ISO8601
}
```

**Multi-Branch Events (6 events)**

11. **branch_created**
```typescript
{
  admin_id: string,
  church_id: string,
  branch_id: string,
  branch_name: string,
  branch_count: number,
  is_first_branch: boolean,
  timestamp: ISO8601
}
```

12. **branch_edited**
```typescript
{
  admin_id: string,
  church_id: string,
  branch_id: string,
  fields_changed: string[],
  timestamp: ISO8601
}
```

13. **branch_deleted**
```typescript
{
  admin_id: string,
  church_id: string,
  branch_id: string,
  had_groups: number,
  had_members: number,
  timestamp: ISO8601
}
```

14. **branch_switched**
```typescript
{
  admin_id: string,
  church_id: string,
  from_branch_id: string,
  to_branch_id: string,
  timestamp: ISO8601
}
```

15. **multi_branch_enabled**
```typescript
{
  admin_id: string,
  church_id: string,
  branch_count: number,
  timestamp: ISO8601
}
```

16. **branch_limit_reached**
```typescript
{
  admin_id: string,
  church_id: string,
  current_plan: string,
  branch_limit: number,
  upgrade_prompt_shown: boolean,
  timestamp: ISO8601
}
```

**Group & Member Events (12 events)**

17. **group_created**
```typescript
{
  admin_id: string,
  church_id: string,
  branch_id: string,
  group_id: string,
  group_name: string,
  group_count: number,
  welcome_message_enabled: boolean,
  timestamp: ISO8601
}
```

18. **group_edited**
```typescript
{
  admin_id: string,
  church_id: string,
  group_id: string,
  fields_changed: string[],
  timestamp: ISO8601
}
```

19. **group_deleted**
```typescript
{
  admin_id: string,
  church_id: string,
  group_id: string,
  member_count: number,
  timestamp: ISO8601
}
```

20. **group_limit_reached**
```typescript
{
  admin_id: string,
  church_id: string,
  branch_id: string,
  group_limit: 30,
  timestamp: ISO8601
}
```

21. **member_added**
```typescript
{
  admin_id: string,
  church_id: string,
  group_id: string,
  member_id: string,
  method: "manual" | "csv_import",
  has_email: boolean,
  timestamp: ISO8601
}
```

22. **member_bulk_imported**
```typescript
{
  admin_id: string,
  church_id: string,
  group_id: string,
  import_count: number,
  failed_count: number,
  csv_rows: number,
  timestamp: ISO8601
}
```

23. **member_edited**
```typescript
{
  admin_id: string,
  church_id: string,
  member_id: string,
  fields_changed: string[],
  timestamp: ISO8601
}
```

24. **member_removed**
```typescript
{
  admin_id: string,
  church_id: string,
  group_id: string,
  member_id: string,
  reason: "manual_delete" | "opted_out",
  timestamp: ISO8601
}
```

25. **member_opted_out**
```typescript
{
  church_id: string,
  member_id: string,
  phone: string,
  opted_out_via: "text_reply" | "manual",
  timestamp: ISO8601
}
```

26. **member_opted_in**
```typescript
{
  admin_id: string,
  church_id: string,
  member_id: string,
  timestamp: ISO8601
}
```

27. **member_limit_warning**
```typescript
{
  admin_id: string,
  church_id: string,
  current_plan: string,
  member_count: number,
  member_limit: number,
  percentage_used: number,
  timestamp: ISO8601
}
```

28. **member_limit_reached**
```typescript
{
  admin_id: string,
  church_id: string,
  current_plan: string,
  member_limit: number,
  upgrade_prompt_shown: boolean,
  timestamp: ISO8601
}
```

**Messaging Events (15 events)**

29. **message_composed**
```typescript
{
  admin_id: string,
  church_id: string,
  character_count: number,
  target_type: "individual" | "groups" | "branches" | "all",
  target_count: number,
  estimated_recipients: number,
  timestamp: ISO8601
}
```

30. **message_sent**
```typescript
{
  admin_id: string,
  church_id: string,
  message_id: string,
  target_type: string,
  target_ids: string[],
  recipient_count: number,
  character_count: number,
  estimated_cost: number,
  is_scheduled: boolean,
  timestamp: ISO8601
}
```

31. **message_scheduled**
```typescript
{
  admin_id: string,
  church_id: string,
  message_id: string,
  scheduled_for: ISO8601,
  hours_until_send: number,
  recipient_count: number,
  timestamp: ISO8601
}
```

32. **message_schedule_edited**
```typescript
{
  admin_id: string,
  church_id: string,
  message_id: string,
  old_scheduled_time: ISO8601,
  new_scheduled_time: ISO8601,
  timestamp: ISO8601
}
```

33. **message_schedule_canceled**
```typescript
{
  admin_id: string,
  church_id: string,
  message_id: string,
  was_scheduled_for: ISO8601,
  timestamp: ISO8601
}
```

34. **message_delivered**
```typescript
{
  church_id: string,
  message_id: string,
  recipient_id: string,
  delivery_time_seconds: number,
  timestamp: ISO8601
}
```

35. **message_delivery_failed**
```typescript
{
  church_id: string,
  message_id: string,
  recipient_id: string,
  error_code: string,
  error_message: string,
  timestamp: ISO8601
}
```

36. **message_replied**
```typescript
{
  church_id: string,
  message_id: string,
  member_id: string,
  reply_text: string,
  time_to_reply_minutes: number,
  timestamp: ISO8601
}
```

37. **reply_viewed**
```typescript
{
  admin_id: string,
  church_id: string,
  message_id: string,
  recipient_id: string,
  timestamp: ISO8601
}
```

38. **welcome_message_sent**
```typescript
{
  church_id: string,
  group_id: string,
  member_id: string,
  trigger: "member_added" | "group_joined",
  timestamp: ISO8601
}
```

39. **weekly_message_count_tracked**
```typescript
{
  church_id: string,
  week_number: number,
  message_count: number,
  meets_target: boolean,  // 4+ messages
  timestamp: ISO8601
}
```

40. **message_history_viewed**
```typescript
{
  admin_id: string,
  church_id: string,
  filter_applied: string | null,
  timestamp: ISO8601
}
```

41. **reply_rate_calculated**
```typescript
{
  church_id: string,
  message_id: string,
  total_recipients: number,
  reply_count: number,
  reply_rate: number,
  timestamp: ISO8601
}
```

42. **message_limit_warning**
```typescript
{
  admin_id: string,
  church_id: string,
  current_plan: string,
  messages_sent_this_month: number,
  message_limit: number,
  percentage_used: number,
  timestamp: ISO8601
}
```

43. **message_limit_reached**
```typescript
{
  admin_id: string,
  church_id: string,
  current_plan: string,
  message_limit: number,
  upgrade_prompt_shown: boolean,
  timestamp: ISO8601
}
```

**Communication Settings Events (4 events)**

44. **communication_mode_toggled**
```typescript
{
  admin_id: string,
  church_id: string,
  previous_mode: "ONE_WAY" | "TWO_WAY",
  new_mode: "ONE_WAY" | "TWO_WAY",
  timestamp: ISO8601
}
```

45. **welcome_message_customized**
```typescript
{
  admin_id: string,
  church_id: string,
  group_id: string,
  message_length: number,
  timestamp: ISO8601
}
```

46. **welcome_message_disabled**
```typescript
{
  admin_id: string,
  church_id: string,
  group_id: string,
  timestamp: ISO8601
}
```

47. **auto_reply_configured**
```typescript
{
  admin_id: string,
  church_id: string,
  auto_reply_text: string,
  timestamp: ISO8601
}
```

**Co-Admin Events (5 events)**

48. **co_admin_invited**
```typescript
{
  admin_id: string,  // Inviter
  church_id: string,
  invited_email: string,
  co_admin_count: number,
  timestamp: ISO8601
}
```

49. **co_admin_invite_accepted**
```typescript
{
  church_id: string,
  co_admin_id: string,
  invited_by: string,
  days_to_accept: number,
  timestamp: ISO8601
}
```

50. **co_admin_removed**
```typescript
{
  admin_id: string,  // Remover
  church_id: string,
  removed_admin_id: string,
  timestamp: ISO8601
}
```

51. **co_admin_limit_reached**
```typescript
{
  admin_id: string,
  church_id: string,
  current_plan: string,
  co_admin_limit: number,
  timestamp: ISO8601
}
```

52. **co_admin_action_taken**
```typescript
{
  admin_id: string,
  church_id: string,
  role: "CO_ADMIN",
  action_type: "message_sent" | "member_added" | "group_created" | "branch_created",
  timestamp: ISO8601
}
```

**Billing & Subscription Events (8 events)**

53. **trial_started**
```typescript
{
  admin_id: string,
  church_id: string,
  trial_end_date: ISO8601,
  trial_length_days: 14,
  timestamp: ISO8601
}
```

54. **trial_ending_soon**
```typescript
{
  church_id: string,
  days_remaining: number,
  email_sent: boolean,
  timestamp: ISO8601
}
```

55. **trial_expired**
```typescript
{
  church_id: string,
  converted_to_paid: boolean,
  timestamp: ISO8601
}
```

56. **plan_upgraded**
```typescript
{
  admin_id: string,
  church_id: string,
  from_plan: string,
  to_plan: string,
  prorated_amount: number,
  timestamp: ISO8601
}
```

57. **plan_downgraded**
```typescript
{
  admin_id: string,
  church_id: string,
  from_plan: string,
  to_plan: string,
  effective_date: ISO8601,
  timestamp: ISO8601
}
```

58. **subscription_paid**
```typescript
{
  church_id: string,
  plan: string,
  amount: number,
  billing_cycle: "monthly" | "annual",
  timestamp: ISO8601
}
```

59. **payment_failed**
```typescript
{
  church_id: string,
  plan: string,
  amount: number,
  error_code: string,
  retry_date: ISO8601,
  timestamp: ISO8601
}
```

60. **subscription_canceled**
```typescript
{
  admin_id: string,
  church_id: string,
  plan: string,
  cancellation_reason: string,
  effective_date: ISO8601,
  timestamp: ISO8601
}
```

**Support & Engagement Events (5 events)**

61. **help_article_viewed**
```typescript
{
  admin_id: string,
  church_id: string,
  article_title: string,
  article_category: string,
  timestamp: ISO8601
}
```

62. **support_ticket_created**
```typescript
{
  admin_id: string,
  church_id: string,
  ticket_category: string,
  priority: "low" | "medium" | "high",
  timestamp: ISO8601
}
```

63. **feature_requested**
```typescript
{
  admin_id: string,
  church_id: string,
  feature_description: string,
  timestamp: ISO8601
}
```

64. **nps_survey_completed**
```typescript
{
  admin_id: string,
  church_id: string,
  nps_score: number,  // 0-10
  feedback: string,
  timestamp: ISO8601
}
```

65. **dashboard_viewed**
```typescript
{
  admin_id: string,
  church_id: string,
  timestamp: ISO8601
}
```

---

## 🎯 WEEK-BY-WEEK OVERVIEW

### Week 1: Foundation & Core Infrastructure
**Goal:** Working auth, database, multi-branch system, basic SMS sending
**Hours:** 40-50 hours
**Deliverables:**
- Complete project structure
- Database schema migrated
- JWT authentication working
- Church registration & onboarding wizard
- Multi-branch CRUD operations
- Twilio integration with test SMS
- Co-admin invitation system

**Success Criteria:**
- ✅ Can register, login, logout
- ✅ Can create church profile
- ✅ Can create and switch between 3 branches
- ✅ Twilio connected and can send test SMS
- ✅ Can invite 1 co-admin

---

### Week 2: Messaging & Group Features
**Goal:** Complete messaging system with groups and members
**Hours:** 40-50 hours
**Deliverables:**
- 30 groups per branch (with limits)
- Member management with CSV import
- Message composer with recipient selection
- Send messages to individuals, groups, branches, or all
- 1-way/2-way communication toggle
- Reply inbox and tracking
- Automated welcome messages
- Message scheduling

**Success Criteria:**
- ✅ Created 30 groups across branches
- ✅ Imported 100+ members via CSV
- ✅ Sent message to specific group
- ✅ Sent message to all branches
- ✅ Received and viewed replies
- ✅ Welcome message sent when member added
- ✅ Scheduled message for future delivery

---

### Week 3: Analytics, Billing & Polish
**Goal:** Production-ready with analytics and payment
**Hours:** 40-50 hours
**Deliverables:**
- PostHog integration with all 65 events
- Analytics dashboard with key metrics
- Reply rate tracking and reporting
- Stripe integration with 3 pricing tiers
- 14-day trial logic
- Usage tracking and plan limit enforcement
- Polished UI with responsive design
- Loading states and error handling

**Success Criteria:**
- ✅ All events tracking in PostHog
- ✅ Dashboard shows delivery rates, reply rates, weekly volume
- ✅ Can subscribe to Growth plan with Stripe
- ✅ Trial countdown visible
- ✅ App works perfectly on mobile
- ✅ No console errors
- ✅ Proper error messages shown

---

### Week 4: Testing, Deployment & Launch
**Goal:** Production deployed, tested, and ready for beta users
**Hours:** 40-50 hours
**Deliverables:**
- Comprehensive testing (unit, integration, E2E)
- Security hardening (rate limiting, input validation)
- Performance optimization
- Production deployment (frontend + backend)
- Environment variables configured
- Monitoring and alerting (Sentry)
- Documentation (API docs, admin guide)
- Beta user onboarding materials

**Success Criteria:**
- ✅ All critical paths tested
- ✅ Security audit passed
- ✅ App deployed to production
- ✅ SSL certificate working
- ✅ Error tracking active
- ✅ 10 beta churches can sign up successfully
- ✅ No critical bugs
- ✅ Performance acceptable (<2s page loads)

---

## WEEK 1: FOUNDATION & CORE INFRASTRUCTURE

### Week 1 Daily Breakdown

**Day 1:** Project setup, database schema, auth foundation
**Day 2:** Complete auth flows, church registration, onboarding wizard structure
**Day 3:** Multi-branch infrastructure and CRUD operations
**Day 4:** Twilio integration and test SMS sending
**Day 5:** Co-admin system, Week 1 integration testing

---

## DAY 1: PROJECT FOUNDATION & DATABASE SETUP
**Target Hours:** 8-10 hours
**Goal:** Complete project structure, database schema, and basic authentication

### Morning Session (5 hours)

#### Task 1.1: Initialize Complete Project Structure
**Time Estimate:** 1 hour
**Complexity:** Low

**Context:**
You're creating a monorepo with separate frontend (React + Vite) and backend (Node.js + Express) applications. The frontend will be deployed on Vercel, backend on Railway.

**Claude Code Prompt (COPY-PASTE READY):**

```
I'm building Connect YW, an enterprise church SMS communication platform. Create a complete monorepo project structure with the following specifications:

TECH STACK:
Frontend:
- React 18.2+ with TypeScript
- Vite 5+ for build tooling
- Tailwind CSS for styling
- React Router v6 for navigation
- React Query (TanStack Query) for server state
- Zustand for client state
- React Hook Form for forms
- Axios for HTTP requests

Backend:
- Node.js 18+ with Express
- TypeScript
- PostgreSQL 15+ database
- Prisma ORM
- JWT for authentication (jsonwebtoken, bcryptjs)
- Express middleware: cors, helmet, express-rate-limit, express-validator
- Twilio SDK for SMS
- Stripe SDK for payments
- PostHog SDK for analytics

PROJECT STRUCTURE:
Create a monorepo with these folders:
- /frontend - React application
- /backend - Express API server
- Root level workspace configuration

REQUIREMENTS:
1. Root package.json with npm workspaces
2. Complete frontend setup with Vite, React, TypeScript, and all dependencies
3. Complete backend setup with Express, TypeScript, and all dependencies
4. Proper TypeScript configurations for both frontend and backend
5. ESLint and Prettier configs for code quality
6. .env.example files with all required environment variables
7. docker-compose.yml for local PostgreSQL database
8. .gitignore for Node.js projects
9. README.md with setup instructions

SPECIFIC CONFIGURATIONS:
- Frontend should run on port 5173 (Vite default)
- Backend should run on port 3000
- TypeScript strict mode enabled
- ESLint with recommended rules
- Prettier with single quotes, 2-space indentation
- Tailwind configured with custom color palette for church theme

ENVIRONMENT VARIABLES NEEDED:
Frontend:
- VITE_API_URL
- VITE_POSTHOG_KEY
- VITE_POSTHOG_HOST

Backend:
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- POSTHOG_API_KEY
- POSTHOG_HOST
- NODE_ENV
- PORT
- CORS_ORIGIN

Create all files and folders now. Make it production-ready from day one.
```

**Expected Files Created:**

```
/
├── package.json (root workspace)
├── .gitignore
├── README.md
├── docker-compose.yml
├── .prettierrc
├── .eslintrc.js
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env.example
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── vite-env.d.ts
│   │   └── index.css
│   └── public/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types/
│   └── prisma/
│       └── schema.prisma
```

**Verification Commands:**

```bash
# Install all dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Verify frontend
cd frontend
npm run dev
# Should see: "Local: http://localhost:5173"

# Verify backend
cd backend
npm run dev
# Should see: "Server running on port 3000"

# Check TypeScript compilation
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

**Success Criteria:**
- [ ] All dependencies install without errors
- [ ] PostgreSQL container running (`docker ps`)
- [ ] Frontend dev server starts on port 5173
- [ ] Backend dev server starts on port 3000
- [ ] TypeScript compiles without errors
- [ ] No console warnings or errors

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| Port 5173 already in use | Kill process: `npx kill-port 5173` |
| PostgreSQL container won't start | Check Docker Desktop is running |
| TypeScript errors | Run `npm install` again in both folders |
| Module not found | Delete `node_modules` and reinstall |

**If Stuck (>1.5 hours):**
Use a starter template instead:
```bash
npm create vite@latest frontend -- --template react-ts
npm init -y in backend folder
```

---

#### Task 1.2: Design Complete Database Schema
**Time Estimate:** 2 hours
**Complexity:** High

**Context:**
This is the MOST CRITICAL task of the entire project. The database schema must support all features from day one. Spend extra time here to get it right—changing the schema later will cost days of refactoring.

**Claude Code Prompt (COPY-PASTE READY):**

```
Create a complete Prisma schema for the Connect YW church SMS platform. This schema must support ALL features including multi-branch management, 30 groups per branch, unlimited members, messaging, co-admins, subscriptions, and analytics.

DATABASE: PostgreSQL 15+

CORE REQUIREMENTS:

1. CHURCHES
- Unique identifier (cuid)
- Name, email (unique), phone, address
- Subscription plan (STARTER, GROWTH, PRO)
- Trial tracking (isTrialing, trialEndsAt)
- Communication mode (ONE_WAY or TWO_WAY)
- Twilio integration (accountSid, authToken, phoneNumber)
- Timestamps (createdAt, updatedAt)

2. BRANCHES (3-10 per church)
- Belongs to church (foreign key with cascade delete)
- Name, address, phone, description
- Active status
- Unique constraint: church + branch name
- Timestamps

3. GROUPS (Up to 30 per branch)
- Belongs to branch (foreign key with cascade delete)
- Name, description
- Welcome message settings (enabled, custom text)
- Active status
- Unique constraint: branch + group name
- Timestamps

4. MEMBERS (Unlimited, phone must be unique across platform)
- First name, last name
- Phone (E.164 format, unique, indexed)
- Email (optional)
- Opt-in/opt-out status and timestamp
- Notes and tags (flexible metadata)
- Timestamps

5. GROUP_MEMBERS (Many-to-many relationship)
- Links groups to members
- Tracks welcome message sent status and timestamp
- Joined date
- Unique constraint: group + member
- Cascade deletes

6. MESSAGES
- Belongs to church
- Sent by admin (ID and email for audit trail)
- Content, character count
- Target type ("individual", "group", "branch", "all")
- Target IDs (array of group/branch IDs)
- Status (DRAFT, SCHEDULED, SENDING, SENT, FAILED, CANCELED)
- Scheduled time, sent time
- Delivery statistics (total, delivered, failed, reply counts)
- Twilio message SIDs (array)
- Timestamps

7. MESSAGE_RECIPIENTS (Individual delivery tracking)
- Links message to member
- Delivery status (PENDING, QUEUED, SENT, DELIVERED, FAILED, UNDELIVERED)
- Twilio message SID (unique, indexed)
- Sent/delivered/failed timestamps
- Error message if failed
- Reply tracking (hasReplied, replyText, repliedAt)
- Unique constraint: message + member
- Timestamps

8. ADMINS (1 primary + up to 3 co-admins)
- Belongs to church
- Email (unique), password hash
- First name, last name
- Role (PRIMARY or CO_ADMIN)
- Invitation tracking (invitedBy, invitedAt, inviteAcceptedAt, inviteToken)
- Active status, last login
- Timestamps

9. SUBSCRIPTIONS (One per church)
- Links to church (one-to-one)
- Stripe integration (customerId, subscriptionId, priceId)
- Plan and status enums
- Billing cycle dates
- Trial dates
- Usage tracking (branch count, member count, message count)
- Cancel tracking
- Timestamps

10. ANALYTICS_EVENTS
- Links to church (optional, for non-authenticated events)
- Event name, properties (JSON)
- User ID, session ID
- Timestamp
- Indexes for querying

11. SYSTEM TABLES
- Password reset tokens (email, token, expiry, used status)
- Audit logs (church, admin, action, entity type/ID, changes, IP, user agent)

INDEXES:
Create indexes on:
- All foreign keys
- phone numbers (Member table)
- email addresses (Admin, Church tables)
- Twilio message SIDs
- Message status and scheduled times
- Analytics event names and timestamps
- All commonly queried fields

ENUMS:
- SubscriptionPlan: STARTER, GROWTH, PRO
- SubscriptionStatus: TRIALING, ACTIVE, PAST_DUE, CANCELED, INCOMPLETE
- AdminRole: PRIMARY, CO_ADMIN
- MessageStatus: DRAFT, SCHEDULED, SENDING, SENT, FAILED, CANCELED
- DeliveryStatus: PENDING, QUEUED, SENT, DELIVERED, FAILED, UNDELIVERED
- CommunicationMode: ONE_WAY, TWO_WAY

CASCADE DELETES:
- Delete church → delete all branches, admins, messages, subscription, analytics
- Delete branch → delete all groups
- Delete group → delete all group memberships
- Delete message → delete all message recipients

Write the complete Prisma schema now with all entities, relationships, indexes, and constraints. Save to /backend/prisma/schema.prisma
```

**Expected Output:**
- `/backend/prisma/schema.prisma` - Complete schema file (see schema in earlier section)

**Verification Commands:**

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name initial_schema

# Open Prisma Studio to inspect database
npx prisma studio
```

**Success Criteria:**
- [ ] Prisma generates client without errors
- [ ] Migration creates all tables successfully
- [ ] Prisma Studio shows all 11+ tables
- [ ] All foreign key relationships visible
- [ ] All indexes created
- [ ] No schema warnings

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| "Unknown type" errors | Check enum definitions are before models |
| Migration fails | Check PostgreSQL is running: `docker ps` |
| Relation errors | Verify @relation fields match on both sides |
| "Generator not found" | Run `npx prisma generate` first |

**If Stuck (>2.5 hours):**
Focus on core tables first (Church, Admin, Message, Member), add other tables later

---

#### Task 1.3: Environment Configuration
**Time Estimate:** 30 minutes
**Complexity:** Low

**Context:**
Set up environment variables for local development. You'll update these for production in Week 4.

**Claude Code Prompt:**

```
Set up environment variables for both frontend and backend of the Connect YW platform.

BACKEND .env file (/backend/.env):
Create the file with these values for local development:

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/connectyw?schema=public"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"

# JWT (generate secure random secrets)
JWT_SECRET="[generate a 64-character random string]"
JWT_REFRESH_SECRET="[generate another 64-character random string]"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Twilio (use test credentials for now)
TWILIO_ACCOUNT_SID="your_account_sid_here"
TWILIO_AUTH_TOKEN="your_auth_token_here"

# Stripe (test mode keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# PostHog
POSTHOG_API_KEY="your_posthog_key_here"
POSTHOG_HOST="https://app.posthog.com"

FRONTEND .env file (/frontend/.env):
VITE_API_URL="http://localhost:3000/api"
VITE_POSTHOG_KEY="your_posthog_key_here"
VITE_POSTHOG_HOST="https://app.posthog.com"

Also update both .env.example files to match (but with placeholder values, not real secrets).

Generate secure JWT secrets using crypto.
```

**Manual Steps:**

1. Add real Twilio credentials:
   - Go to https://console.twilio.com
   - Copy Account SID and Auth Token
   - Paste into `/backend/.env`

2. Add real Stripe test keys:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy Secret key
   - Paste into `/backend/.env`
   - Copy Webhook secret (create webhook endpoint later)

3. Add real PostHog key:
   - Go to https://app.posthog.com/project/settings
   - Copy Project API Key
   - Paste into both `.env` files

**Verification:**

```bash
# Backend
cd backend
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
# Should output: postgresql://postgres:postgres@localhost:5432/connectyw...

# Frontend
cd frontend
npm run dev
# Check browser console for VITE_API_URL
```

**Success Criteria:**
- [ ] Both `.env` files created
- [ ] Both `.env.example` files updated
- [ ] `.env` files in `.gitignore`
- [ ] Environment variables load correctly
- [ ] No secrets committed to git

---

### Afternoon Session (5 hours)

#### Task 1.4: JWT Authentication System
**Time Estimate:** 2 hours
**Complexity:** Medium

**Context:**
Build a secure JWT authentication system with access tokens (short-lived, 15 minutes) and refresh tokens (long-lived, 7 days). This will be used for all protected routes.

**Claude Code Prompt:**

```
Create a complete JWT authentication system for the Connect YW backend with the following requirements:

FEATURES NEEDED:
1. JWT token generation (access + refresh tokens)
2. JWT token verification middleware
3. Password hashing with bcrypt (10 salt rounds)
4. Token refresh endpoint
5. Role-based authorization middleware

FILE STRUCTURE:
Create these files in the backend:

/backend/src/utils/jwt.utils.ts
- generateAccessToken(adminId, churchId, role)
- generateRefreshToken(adminId)
- verifyAccessToken(token)
- verifyRefreshToken(token)

/backend/src/utils/password.utils.ts
- hashPassword(password)
- comparePassword(password, hash)

/backend/src/middleware/auth.middleware.ts
- authenticateToken (verifies JWT and attaches user to req.user)
- requireRole(roles) (checks if user has required role)

/backend/src/types/express.d.ts
- Extend Express Request type to include user property

TECHNICAL REQUIREMENTS:
- Use jsonwebtoken library
- Use bcryptjs library (10 salt rounds)
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Tokens include: adminId, churchId, role
- Middleware should return 401 for invalid/expired tokens
- Middleware should attach decoded user to req.user

ERROR HANDLING:
- Invalid token → 401 "Invalid token"
- Expired token → 401 "Token expired"
- No token → 401 "No token provided"
- Insufficient permissions → 403 "Forbidden"

TypeScript types should be fully defined. All functions should have proper error handling.
```

**Expected Files:**

```
backend/src/
├── utils/
│   ├── jwt.utils.ts
│   └── password.utils.ts
├── middleware/
│   └── auth.middleware.ts
└── types/
    └── express.d.ts
```

**Sample Code for Testing:**

```typescript
// Test in backend/src/index.ts temporarily
import { generateAccessToken, verifyAccessToken } from './utils/jwt.utils';
import { hashPassword, comparePassword } from './utils/password.utils';

// Test JWT
const token = generateAccessToken('admin_123', 'church_456', 'PRIMARY');
console.log('Generated token:', token);

const decoded = verifyAccessToken(token);
console.log('Decoded:', decoded);

// Test password
const hash = await hashPassword('TestPassword123!');
console.log('Hash:', hash);

const isValid = await comparePassword('TestPassword123!', hash);
console.log('Password valid:', isValid); // Should be true
```

**Verification:**

```bash
cd backend
npm run dev

# You should see test output in console
# Remove test code after verification
```

**Success Criteria:**
- [ ] JWT tokens generate successfully
- [ ] Tokens can be verified correctly
- [ ] Expired tokens throw proper errors
- [ ] Passwords hash and compare correctly
- [ ] Middleware attaches user to request
- [ ] TypeScript types work correctly

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "Secret required" error | Check JWT_SECRET in .env |
| TypeScript errors on req.user | Ensure express.d.ts is created |
| Bcrypt errors on Windows | Use bcryptjs instead of bcrypt |

---

#### Task 1.5: Church Registration API
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Context:**
Create the registration endpoint that creates both a church and primary admin in a single transaction.

**Claude Code Prompt:**

```
Create a complete church registration API endpoint for Connect YW with the following specifications:

ENDPOINT: POST /api/auth/register

REQUEST BODY:
{
  "email": string (required, valid email),
  "password": string (required, min 8 chars, 1 uppercase, 1 number),
  "firstName": string (required),
  "lastName": string (required),
  "churchName": string (required),
  "churchPhone": string (optional, E.164 format)
}

RESPONSE (201 Created):
{
  "success": true,
  "data": {
    "admin": { id, email, firstName, lastName, role },
    "church": { id, name, isTrialing, trialEndsAt },
    "accessToken": string,
    "refreshToken": string
  }
}

BUSINESS LOGIC:
1. Validate all inputs (use express-validator)
2. Check if email already exists → 400 error
3. Hash password with bcrypt
4. Create Stripe customer
5. Create church record with 14-day trial
6. Create admin record with PRIMARY role
7. Generate JWT tokens
8. Track PostHog event: "user_signed_up"
9. Return church, admin, and tokens

ERROR RESPONSES:
- 400 if validation fails
- 400 if email already exists
- 500 for server errors

FILE STRUCTURE:
Create:
- /backend/src/routes/auth.routes.ts
- /backend/src/controllers/auth.controller.ts
- /backend/src/services/auth.service.ts
- /backend/src/services/stripe.service.ts (Stripe customer creation)
- /backend/src/validators/auth.validator.ts

Use Prisma transactions to ensure church + admin are created together atomically.
Track the signup event in PostHog.
Return proper HTTP status codes.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── auth.routes.ts
├── controllers/
│   └── auth.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── stripe.service.ts
│   └── analytics.service.ts
└── validators/
    └── auth.validator.ts
```

**Verification:**

```bash
# Test with curl or Postman
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pastor@testchurch.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Smith",
    "churchName": "Test Community Church",
    "churchPhone": "+12065551234"
  }'

# Should return 201 with tokens and church/admin data

# Check database
cd backend
npx prisma studio
# Verify church and admin records created
```

**Success Criteria:**
- [ ] Endpoint returns 201 with correct data
- [ ] Church record created in database
- [ ] Admin record created with PRIMARY role
- [ ] Trial ends at is 14 days from now
- [ ] Password is hashed (not plain text)
- [ ] Stripe customer created
- [ ] PostHog event tracked
- [ ] Duplicate email returns 400 error

---

#### Task 1.6: Login & Refresh Token Endpoints
**Time Estimate:** 1 hour
**Complexity:** Low

**Context:**
Add login and token refresh endpoints to complete the auth system.

**Claude Code Prompt:**

```
Add login and refresh token endpoints to the Connect YW auth system.

ENDPOINT 1: POST /api/auth/login

REQUEST:
{
  "email": string,
  "password": string
}

RESPONSE (200 OK):
{
  "success": true,
  "data": {
    "admin": { id, email, firstName, lastName, role, churchId },
    "church": { id, name, subscriptionPlan, isTrialing, trialEndsAt },
    "accessToken": string,
    "refreshToken": string
  }
}

LOGIC:
1. Find admin by email
2. Compare password with hash
3. Update lastLoginAt timestamp
4. Generate tokens
5. Track PostHog event: "user_logged_in" with days_since_last_login
6. Return admin, church, and tokens

ERROR:
- 401 if email not found or password incorrect
- Return generic "Invalid credentials" message (don't reveal which is wrong)

ENDPOINT 2: POST /api/auth/refresh

REQUEST:
{
  "refreshToken": string
}

RESPONSE (200 OK):
{
  "success": true,
  "data": {
    "accessToken": string,
    "refreshToken": string
  }
}

LOGIC:
1. Verify refresh token
2. Generate new access and refresh tokens
3. Return both tokens

ERROR:
- 401 if token invalid or expired

Add both endpoints to /backend/src/routes/auth.routes.ts
Add controller methods to /backend/src/controllers/auth.controller.ts
Add service methods to /backend/src/services/auth.service.ts
```

**Verification:**

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pastor@testchurch.com",
    "password": "SecurePass123!"
  }'

# Copy refreshToken from response, then test refresh
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

**Success Criteria:**
- [ ] Login with correct credentials works
- [ ] Login with wrong password returns 401
- [ ] Login with non-existent email returns 401
- [ ] lastLoginAt updates on successful login
- [ ] Refresh token generates new tokens
- [ ] Invalid refresh token returns 401

---

#### Task 1.7: Frontend Auth Pages
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Context:**
Create basic register and login pages with form validation. We'll improve the UI later, focus on functionality now.

**Claude Code Prompt:**

```
Create registration and login pages for the Connect YW frontend with the following requirements:

TECH STACK:
- React Hook Form for form handling
- Zod for validation
- Axios for API requests
- React Router for navigation
- Zustand for auth state management

PAGES NEEDED:

1. /frontend/src/pages/auth/RegisterPage.tsx
Form fields:
- Email (required, valid email)
- Password (required, min 8 chars, shows strength indicator)
- Confirm Password (required, must match)
- First Name (required)
- Last Name (required)
- Church Name (required)
- Church Phone (optional, formatted as user types)

On success:
- Save tokens to localStorage
- Save user/church to Zustand store
- Redirect to /onboarding

2. /frontend/src/pages/auth/LoginPage.tsx
Form fields:
- Email (required)
- Password (required)

Links:
- "Forgot password?" → /forgot-password
- "Don't have an account? Sign up" → /register

On success:
- Save tokens to localStorage
- Save user/church to Zustand store
- Redirect to /dashboard

ZUSTAND STORE:
Create /frontend/src/stores/authStore.ts with:
- user: Admin object or null
- church: Church object or null
- accessToken: string or null
- refreshToken: string or null
- login(data)
- logout()
- isAuthenticated: computed boolean

API CLIENT:
Create /frontend/src/api/client.ts with:
- Axios instance configured with baseURL from env
- Interceptor to add Authorization header
- Interceptor to refresh token on 401

ROUTING:
Update /frontend/src/App.tsx with:
- /register
- /login
- /dashboard (protected route)
- /onboarding (protected route)

PROTECTED ROUTE:
Create /frontend/src/components/ProtectedRoute.tsx that:
- Checks if user is authenticated
- Redirects to /login if not
- Shows loading spinner while checking

UI REQUIREMENTS:
- Use Tailwind CSS for styling
- Mobile-responsive forms
- Loading states during submission
- Error messages from API displayed clearly
- Password strength indicator (weak/medium/strong)
- Form validation errors shown inline

No need for fancy design yet—functional and clean is enough for Day 1.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── auth/
│       ├── RegisterPage.tsx
│       └── LoginPage.tsx
├── stores/
│   └── authStore.ts
├── api/
│   ├── client.ts
│   └── auth.api.ts
├── components/
│   └── ProtectedRoute.tsx
└── App.tsx (updated)
```

**Verification:**

```bash
cd frontend
npm run dev

# Open http://localhost:5173/register
# Fill out form and submit
# Should redirect to /onboarding
# Check localStorage for tokens
# Check Zustand devtools for state

# Try logging out and logging back in
```

**Success Criteria:**
- [ ] Can register new church successfully
- [ ] Tokens saved to localStorage
- [ ] Auth state updated in Zustand
- [ ] Redirected to onboarding after register
- [ ] Can login with created account
- [ ] Redirected to dashboard after login
- [ ] Protected routes redirect to login when not authenticated
- [ ] Form validation works correctly
- [ ] API errors displayed to user

---

### End of Day 1 Checklist

**Completed Tasks:**
- [ ] Project structure created (frontend + backend)
- [ ] Database schema designed and migrated
- [ ] Environment variables configured
- [ ] JWT authentication system implemented
- [ ] Registration API endpoint working
- [ ] Login API endpoint working
- [ ] Frontend auth pages functional
- [ ] Protected routes working

**Database Check:**
- [ ] Churches table has test church
- [ ] Admins table has test admin with PRIMARY role
- [ ] Trial ends at is 14 days from now

**API Check:**
```bash
# Can register
# Can login
# Can refresh token
```

**Frontend Check:**
- [ ] Can access /register
- [ ] Can access /login
- [ ] Cannot access /dashboard without auth
- [ ] Can access /dashboard after login

**Git Commit:**
```bash
git add .
git commit -m "Day 1 complete: Foundation with auth system

- Complete project structure (monorepo)
- Database schema with all entities
- JWT authentication (access + refresh tokens)
- Church registration and login APIs
- Frontend auth pages with protected routes
- Zustand state management for auth"

git push origin development
```

**If Behind Schedule:**
- Skip password strength indicator
- Skip phone number formatting
- Use simpler styling (basic forms, no fancy UI)

**Tomorrow (Day 2) Preview:**
Complete the onboarding wizard structure and church profile management.

---

## DAY 2: ONBOARDING & CHURCH SETUP
**Target Hours:** 8-10 hours
**Goal:** Complete onboarding wizard, church profile, and trial management

### Morning Session (5 hours)

#### Task 2.1: Onboarding Wizard Structure
**Time Estimate:** 2 hours
**Complexity:** Medium

**Context:**
Create a 6-step onboarding wizard that guides new churches through setup in ~15 minutes. This is a competitive advantage mentioned in your docs.

**Steps:**
1. Church Profile
2. Twilio Connection
3. Create First Branch
4. Create First Group
5. Import Members (CSV)
6. Send Test Message

**Claude Code Prompt:**

```
Create a comprehensive onboarding wizard for Connect YW with the following specifications:

STRUCTURE:
6-step wizard with progress tracking, each step saves data before proceeding to next.

WIZARD COMPONENT:
Create /frontend/src/pages/onboarding/OnboardingWizard.tsx

Step tracking state:
- currentStep: 1-6
- completedSteps: array of step numbers
- canProceed: boolean (current step valid)
- Progress bar showing X/6 steps

Step components (create separate files):
1. /frontend/src/pages/onboarding/steps/ChurchProfileStep.tsx
   - Church name (pre-filled from registration, editable)
   - Church address
   - Church phone
   - Congregation size estimate (dropdown: <100, 100-250, 250-500, 500+)
   - Save to church record

2. /frontend/src/pages/onboarding/steps/TwilioConnectionStep.tsx
   - Instructions with screenshots
   - Input fields: Account SID, Auth Token
   - "Test Connection" button
   - Option to skip (can connect later)
   - On success: track "twilio_connected" event

3. /frontend/src/pages/onboarding/steps/FirstBranchStep.tsx
   - Branch name (default: "Main Campus")
   - Branch address (optional)
   - Branch phone (optional)
   - Explanation: "You can add up to 10 locations on Pro plan"
   - Create branch via API

4. /frontend/src/pages/onboarding/steps/FirstGroupStep.tsx
   - Group name (suggestions: "Everyone", "Members", "Youth", "Worship Team")
   - Group description
   - Enable welcome message? (toggle)
   - Welcome message text (textarea, default provided)
   - Create group via API

5. /frontend/src/pages/onboarding/steps/MemberImportStep.tsx
   - Two options: "Import CSV" or "Add manually"
   - CSV upload with validation
   - Show preview of first 5 members
   - CSV template download button
   - Manual add: simple form for 1 member
   - After import: track "member_bulk_imported" or "member_added"

6. /frontend/src/pages/onboarding/steps/TestMessageStep.tsx
   - Pre-filled message: "Welcome to [Church Name]! This is a test message from our new communication platform."
   - Character counter
   - Send to: first group created
   - "Send Test Message" button
   - Success message with delivery status
   - Track "message_sent" event

NAVIGATION:
- "Next" button (disabled if current step invalid)
- "Back" button (except on step 1)
- "Skip" option on Twilio and Member Import steps
- "Finish" button on step 6 → redirect to /dashboard
- Track "onboarding_completed" event with total_time_minutes

PROGRESS PERSISTENCE:
- Save completed steps to localStorage
- If user refreshes, restore to current step
- If user logs out mid-onboarding, can resume later

ANALYTICS TRACKING:
- Track each step completion: "onboarding_step_completed"
- Track time spent on each step
- Track if onboarding abandoned (user didn't complete within session)
- Track final "onboarding_completed" event

UI REQUIREMENTS:
- Clean, simple interface (not cluttered)
- Progress bar at top
- Step indicator (1 of 6, 2 of 6, etc.)
- Help text for each step
- Loading states during API calls
- Error handling with clear messages
- Mobile responsive

Create all components, routing, and API integration now.
```

**Expected Files:**

```
frontend/src/pages/onboarding/
├── OnboardingWizard.tsx
├── steps/
│   ├── ChurchProfileStep.tsx
│   ├── TwilioConnectionStep.tsx
│   ├── FirstBranchStep.tsx
│   ├── FirstGroupStep.tsx
│   ├── MemberImportStep.tsx
│   └── TestMessageStep.tsx
└── hooks/
    └── useOnboarding.ts (state management)
```

**Verification:**

```bash
# Start frontend
cd frontend
npm run dev

# Navigate to http://localhost:5173/onboarding
# Complete all 6 steps
# Check database for created records:
# - Church updated with profile
# - Twilio credentials saved
# - Branch created
# - Group created
# - Members imported
# - Message sent

# Check PostHog for events:
# - onboarding_step_completed (x6)
# - onboarding_completed
```

**Success Criteria:**
- [ ] All 6 steps render correctly
- [ ] Can navigate forward/back between steps
- [ ] Progress bar updates correctly
- [ ] Each step saves data before proceeding
- [ ] Can skip Twilio and member import
- [ ] CSV import validates and shows preview
- [ ] Test message sends successfully
- [ ] All events tracked in PostHog
- [ ] Redirects to dashboard on completion

---

#### Task 2.2: Church Profile Management API
**Time Estimate:** 1 hour
**Complexity:** Low

**Claude Code Prompt:**

```
Create church profile management endpoints for Connect YW.

ENDPOINTS:

1. GET /api/churches/:id
Authorization: JWT required
Returns: Complete church profile with stats

Response:
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    "email": string,
    "phone": string,
    "address": string,
    "congregationSize": string,
    "subscriptionPlan": enum,
    "isTrialing": boolean,
    "trialEndsAt": ISO8601,
    "communicationMode": enum,
    "twilioVerified": boolean,
    "twilioPhoneNumber": string,
    "branchCount": number,
    "totalMemberCount": number,
    "totalGroupCount": number,
    "createdAt": ISO8601
  }
}

2. PUT /api/churches/:id
Authorization: JWT required (PRIMARY or CO_ADMIN)
Request: Partial church update
{
  "name": string,
  "phone": string,
  "address": string,
  "congregationSize": string
}

Response: Updated church object

Business logic:
- Only admins of the church can update
- Cannot change subscriptionPlan via this endpoint (use billing endpoints)
- Track "church_profile_updated" PostHog event

3. POST /api/churches/:id/twilio/connect
Authorization: JWT required
Request:
{
  "accountSid": string,
  "authToken": string,
  "phoneNumber": string (optional)
}

Logic:
- Validate Twilio credentials by making test API call
- If phoneNumber not provided, list available numbers
- Save credentials (encrypt authToken)
- Set twilioVerified = true
- Track "twilio_connected" event

Response:
{
  "success": true,
  "data": {
    "twilioVerified": true,
    "phoneNumber": string,
    "availableNumbers": [ array of numbers if phoneNumber not provided ]
  }
}

Error handling:
- 401 if credentials invalid
- 404 if phone number not found in account
- 500 for Twilio API errors

4. POST /api/churches/:id/twilio/disconnect
Authorization: JWT required (PRIMARY only)
Logic:
- Remove Twilio credentials
- Set twilioVerified = false
- Warn that messaging will stop working

Create routes, controllers, services for all endpoints.
Use Prisma for database operations.
Add proper error handling and validation.
```

**Verification:**

```bash
# Get church profile
curl -X GET http://localhost:3000/api/churches/[churchId] \
  -H "Authorization: Bearer [accessToken]"

# Update church
curl -X PUT http://localhost:3000/api/churches/[churchId] \
  -H "Authorization: Bearer [accessToken]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Church Name",
    "address": "123 Main St, Seattle, WA 98101"
  }'

# Connect Twilio
curl -X POST http://localhost:3000/api/churches/[churchId]/twilio/connect \
  -H "Authorization: Bearer [accessToken]" \
  -H "Content-Type: application/json" \
  -d '{
    "accountSid": "ACxxxxx",
    "authToken": "your_token",
    "phoneNumber": "+12065551234"
  }'
```

**Success Criteria:**
- [ ] GET returns complete church profile
- [ ] PUT updates church successfully
- [ ] Twilio connect validates credentials
- [ ] Invalid Twilio credentials return 401
- [ ] Events tracked in PostHog

---

#### Task 2.3: Trial Management System
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Context:**
Implement 14-day trial logic with countdown, warnings, and conversion tracking.

**Claude Code Prompt:**

```
Implement trial management for Connect YW with the following requirements:

BACKEND SERVICES:

1. /backend/src/services/trial.service.ts

Methods:
- checkTrialStatus(churchId): Returns trial status
  {
    isTrialing: boolean,
    trialEndsAt: Date,
    daysRemaining: number,
    hasExpired: boolean
  }

- sendTrialReminders(): Cron job that runs daily
  - Find churches with trial ending in 3 days
  - Send email reminder (use email service)
  - Track "trial_ending_soon" event

- expireTrials(): Cron job that runs daily
  - Find churches with expired trials
  - Set isTrialing = false
  - Disable messaging if not subscribed
  - Track "trial_expired" event

2. Middleware: /backend/src/middleware/trial.middleware.ts

checkTrialOrSubscription: Middleware for protected actions
- Allow if trial active OR subscription active
- Block if trial expired and no subscription
- Return 402 "Trial expired. Please subscribe to continue"

FRONTEND COMPONENTS:

1. /frontend/src/components/TrialBanner.tsx
- Shows at top of dashboard
- "X days left in your trial"
- Link to "Subscribe Now"
- Dismissible (but shows again next day)
- Color coded:
  - Green: 8+ days
  - Yellow: 4-7 days
  - Red: 1-3 days
  - Urgent red: trial expired

2. /frontend/src/components/UpgradeModal.tsx
- Shown when trial expired or limit reached
- Can't dismiss (modal)
- Shows pricing plans
- "Subscribe Now" buttons
- Track "upgrade_modal_viewed" event

CRON JOBS:
Set up cron jobs in /backend/src/index.ts:
- Run sendTrialReminders() every day at 9am
- Run expireTrials() every day at midnight

Use node-cron library for scheduling.

TRIAL LIMITS:
Even during trial, enforce plan limits based on chosen plan (default STARTER):
- Starter: 1 branch, 500 members, 1000 messages/month
- Don't let trial users exceed limits without upgrading

Implement all services, middleware, components, and cron jobs now.
```

**Expected Files:**

```
backend/src/
├── services/
│   ├── trial.service.ts
│   └── email.service.ts (for reminders)
├── middleware/
│   └── trial.middleware.ts
└── cron/
    └── jobs.ts

frontend/src/components/
├── TrialBanner.tsx
└── UpgradeModal.tsx
```

**Verification:**

```bash
# Test trial status check
curl -X GET http://localhost:3000/api/churches/[churchId]/trial-status \
  -H "Authorization: Bearer [token]"

# Manually trigger trial reminder (for testing)
curl -X POST http://localhost:3000/api/admin/test/trial-reminders \
  -H "Authorization: Bearer [token]"

# Check database
npx prisma studio
# Manually set trialEndsAt to tomorrow, verify banner shows "1 day left"
```

**Success Criteria:**
- [ ] Trial status calculated correctly
- [ ] Trial banner shows on dashboard
- [ ] Banner color changes based on days remaining
- [ ] Cron jobs scheduled (check logs)
- [ ] Trial expired modal blocks access
- [ ] Events tracked in PostHog

---

### Afternoon Session (5 hours)

#### Task 2.4: Frontend Dashboard Shell
**Time Estimate:** 2 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create the main dashboard structure for Connect YW with navigation and layout.

DASHBOARD LAYOUT:
/frontend/src/pages/Dashboard.tsx

Layout structure:
- Sidebar navigation (fixed left)
- Top bar (trial banner, user menu)
- Main content area (React Router outlets)
- Mobile: Collapsible sidebar

SIDEBAR NAVIGATION:
Sections:
1. Overview
   - Dashboard (icon: home)

2. Messaging
   - Send Message (icon: send)
   - Message History (icon: clock)
   - Replies (icon: message-circle) - badge with unread count

3. People
   - Members (icon: users)
   - Groups (icon: folder)

4. Church
   - Branches (icon: map-pin)
   - Admins (icon: shield)

5. Settings
   - Church Profile (icon: building)
   - Communication (icon: settings)
   - Billing (icon: credit-card)

Active state highlighting
Role-based visibility (some items only for PRIMARY admin)

TOP BAR:
- Church name + branch selector (if multiple branches)
- Trial banner (from Task 2.3)
- User menu dropdown:
  - Profile
  - Switch branch (if multi-branch)
  - Help & Support
  - Logout

ROUTING:
Update /frontend/src/App.tsx with dashboard routes:
- /dashboard → overview
- /dashboard/send → send message
- /dashboard/messages → message history
- /dashboard/replies → reply inbox
- /dashboard/members → member list
- /dashboard/groups → group list
- /dashboard/branches → branch list
- /dashboard/admins → admin management
- /dashboard/settings/profile → church settings
- /dashboard/settings/communication → communication settings
- /dashboard/settings/billing → billing and subscription

DASHBOARD OVERVIEW PAGE:
/frontend/src/pages/dashboard/Overview.tsx

Show:
- Welcome message: "Welcome back, [First Name]!"
- Quick stats cards:
  - Total Members (icon, count)
  - Total Messages This Week (icon, count)
  - Avg Reply Rate (icon, percentage)
  - Trial Days Remaining (icon, count)
- Quick actions:
  - Send Message (button)
  - Import Members (button)
  - View Analytics (button)
- Recent activity feed (last 5 messages sent)

Mobile responsive:
- Sidebar collapses to hamburger menu
- Top bar stacks vertically
- Cards stack vertically

Use Tailwind CSS for styling.
Clean, professional design suitable for church administrators.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   ├── Dashboard.tsx
│   └── dashboard/
│       └── Overview.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── DashboardLayout.tsx
│   └── TrialBanner.tsx
└── App.tsx (updated with routes)
```

**Verification:**

```bash
cd frontend
npm run dev

# Navigate to http://localhost:5173/dashboard
# Check:
# - Sidebar navigation visible
# - All menu items present
# - Top bar with church name
# - Trial banner showing
# - Overview page with stats
# - Mobile responsive (resize browser)
```

**Success Criteria:**
- [ ] Dashboard loads successfully
- [ ] Sidebar navigation works
- [ ] All routes accessible
- [ ] Trial banner shows correctly
- [ ] User menu dropdown works
- [ ] Logout functionality works
- [ ] Mobile responsive
- [ ] Stats cards show real data from API

---

#### Task 2.5: Branch Selector Component
**Time Estimate:** 1 hour
**Complexity:** Low

**Context:**
Multi-branch churches need to switch between branches easily. This goes in the top bar.

**Claude Code Prompt:**

```
Create a branch selector component for the Connect YW dashboard.

COMPONENT: /frontend/src/components/BranchSelector.tsx

Features:
- Dropdown showing current branch name
- List all branches for the church
- Click to switch active branch
- Shows branch count (e.g., "Downtown Campus (1 of 3)")
- Icon indicator for each branch
- "Manage Branches" link at bottom → /dashboard/branches
- Only show if church has 2+ branches

STATE MANAGEMENT:
Add to Zustand store (/frontend/src/stores/branchStore.ts):
- currentBranch: Branch object or null
- branches: array of Branch objects
- setCurrentBranch(branch)
- loadBranches() - fetches from API

When branch is switched:
- Update currentBranch in store
- Reload data for current branch
- Track "branch_switched" PostHog event

API ENDPOINTS NEEDED:
GET /api/churches/:churchId/branches
- Returns all branches for the church

INTEGRATION:
Add BranchSelector to TopBar component
Position: Right side, before user menu
Mobile: Show as full-width dropdown on mobile

VISUAL:
- Current branch name with down arrow
- Dropdown with all branches
- Checkmark next to active branch
- Smooth transitions

Implement the component, state management, and API integration now.
```

**Expected Files:**

```
frontend/src/
├── components/
│   └── BranchSelector.tsx
├── stores/
│   └── branchStore.ts
└── api/
    └── branch.api.ts
```

**Verification:**

```bash
# Create multiple branches via Prisma Studio or API
# Reload dashboard
# Should see branch selector in top bar
# Click and switch branches
# Check PostHog for "branch_switched" event
```

**Success Criteria:**
- [ ] Selector only shows if 2+ branches
- [ ] Lists all branches correctly
- [ ] Switching updates active branch
- [ ] Event tracked in PostHog
- [ ] UI updates after switch

---

#### Task 2.6: Password Reset Flow
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Implement password reset functionality for Connect YW.

BACKEND ENDPOINTS:

1. POST /api/auth/forgot-password
Request: { "email": string }
Logic:
- Check if email exists
- Generate reset token (crypto.randomBytes)
- Save token to PasswordResetToken table (expires in 1 hour)
- Send password reset email with link
- Return success even if email doesn't exist (security)
Response: { "success": true, "message": "If that email exists, we sent a reset link" }

2. POST /api/auth/reset-password
Request:
{
  "token": string,
  "newPassword": string
}
Logic:
- Verify token exists and not expired
- Verify token not already used
- Hash new password
- Update admin password
- Mark token as used
- Track "password_reset" event
Response: { "success": true, "message": "Password updated successfully" }

EMAIL SERVICE:
Create /backend/src/services/email.service.ts
- Use nodemailer or SendGrid
- sendPasswordResetEmail(email, resetToken)
- Email template with reset link: http://app.connectyw.com/reset-password?token=[token]

FRONTEND PAGES:

1. /frontend/src/pages/auth/ForgotPasswordPage.tsx
- Email input
- Submit button
- Success message: "Check your email for reset instructions"
- Link back to login

2. /frontend/src/pages/auth/ResetPasswordPage.tsx
- Get token from URL query params
- New password input
- Confirm password input
- Submit button
- On success: Redirect to login with success message

ROUTING:
Add to App.tsx:
- /forgot-password
- /reset-password

Implement all backend endpoints, email service, and frontend pages now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── auth.routes.ts (updated)
├── controllers/
│   └── auth.controller.ts (updated)
├── services/
│   └── email.service.ts
frontend/src/pages/auth/
├── ForgotPasswordPage.tsx
└── ResetPasswordPage.tsx
```

**Verification:**

```bash
# Test forgot password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "pastor@testchurch.com"}'

# Check PasswordResetToken table for token
# Copy token

# Test reset password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "[token]",
    "newPassword": "NewSecurePass123!"
  }'

# Try logging in with new password
```

**Success Criteria:**
- [ ] Forgot password email sent
- [ ] Reset link works
- [ ] Password updates successfully
- [ ] Can login with new password
- [ ] Token expires after 1 hour
- [ ] Used token cannot be reused

---

### End of Day 2 Checklist

**Completed:**
- [ ] 6-step onboarding wizard functional
- [ ] Church profile management APIs
- [ ] Trial management system
- [ ] Dashboard shell with navigation
- [ ] Branch selector component
- [ ] Password reset flow

**Test Scenarios:**
1. Register new church → complete onboarding → land on dashboard
2. Update church profile → changes saved
3. Switch between branches → UI updates
4. Request password reset → receive email → reset password successfully

**Git Commit:**
```bash
git add .
git commit -m "Day 2 complete: Onboarding and church setup

- 6-step onboarding wizard with progress tracking
- Church profile management
- 14-day trial system with reminders
- Dashboard layout with sidebar navigation
- Multi-branch switching
- Password reset functionality"
git push origin development
```

**If Behind Schedule:**
- Skip email service (just save token, test with database)
- Simplify onboarding UI (basic forms, no fancy animations)
- Skip password reset (add later)

**Tomorrow (Day 3):**
Multi-branch CRUD operations and branch-specific data filtering.

---

## DAY 3: MULTI-BRANCH INFRASTRUCTURE
**Target Hours:** 8-10 hours
**Goal:** Complete multi-branch CRUD operations and branch-specific data filtering

### Morning Session (5 hours)

#### Task 3.1: Branch CRUD API Endpoints
**Time Estimate:** 2 hours
**Complexity:** Medium

**Context:**
Churches can have 3-10 branches depending on their subscription plan. Each branch has its own groups and members.

**Claude Code Prompt:**

```
Create complete branch management API endpoints for Connect YW with the following specifications:

ENDPOINTS:

1. GET /api/churches/:churchId/branches
Authorization: JWT required
Query params: ?includeStats=true (optional)
Returns: All branches for the church with optional stats

Response:
{
  "success": true,
  "data": {
    "branches": [
      {
        "id": string,
        "name": string,
        "address": string,
        "phone": string,
        "description": string,
        "isActive": boolean,
        "groupCount": number (if includeStats=true),
        "memberCount": number (if includeStats=true),
        "createdAt": ISO8601
      }
    ],
    "total": number,
    "planLimit": number (e.g., 10 for PRO)
  }
}

2. GET /api/branches/:id
Authorization: JWT required
Returns: Single branch with detailed stats

Response:
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    "address": string,
    "phone": string,
    "description": string,
    "isActive": boolean,
    "groupCount": number,
    "memberCount": number,
    "recentMessages": number,
    "createdAt": ISO8601,
    "updatedAt": ISO8601
  }
}

3. POST /api/churches/:churchId/branches
Authorization: JWT required
Request:
{
  "name": string (required),
  "address": string (optional),
  "phone": string (optional),
  "description": string (optional)
}

Business Logic:
- Check plan limit (STARTER: 1, GROWTH: 5, PRO: 10)
- Return 400 if limit reached with upgrade prompt
- Unique branch name per church
- Track "branch_created" PostHog event
- If this creates 2nd branch, track "multi_branch_enabled" event

Response (201 Created):
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    // ... full branch object
  }
}

Error (400 - Limit Reached):
{
  "success": false,
  "error": {
    "code": "BRANCH_LIMIT_REACHED",
    "message": "Your Starter plan allows 1 branch. Upgrade to Growth for 5 branches.",
    "currentPlan": "STARTER",
    "currentCount": 1,
    "limit": 1,
    "upgradeRequired": true
  }
}

4. PUT /api/branches/:id
Authorization: JWT required
Request: Partial branch update
{
  "name": string,
  "address": string,
  "phone": string,
  "description": string,
  "isActive": boolean
}

Logic:
- Verify admin belongs to branch's church
- Track "branch_edited" event with fields_changed array

5. DELETE /api/branches/:id
Authorization: JWT required (PRIMARY only)

Logic:
- Cannot delete if it's the only branch
- Cascade delete all groups in branch (Prisma handles this)
- Count members and groups before deletion for analytics
- Track "branch_deleted" event with had_groups and had_members

Response:
{
  "success": true,
  "message": "Branch deleted successfully",
  "deletedGroups": number,
  "deletedMembers": number
}

SERVICES:
Create /backend/src/services/branch.service.ts with methods:
- getAllBranches(churchId, includeStats)
- getBranchById(id)
- createBranch(churchId, data)
- updateBranch(id, data)
- deleteBranch(id)
- checkBranchLimit(churchId) - helper to verify plan limits

Use Prisma for all database operations.
Add validation with express-validator.
Track all events in PostHog.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── branch.routes.ts
├── controllers/
│   └── branch.controller.ts
├── services/
│   └── branch.service.ts
└── validators/
    └── branch.validator.ts
```

**Verification Commands:**

```bash
# Create branch
curl -X POST http://localhost:3000/api/churches/[churchId]/branches \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "North Campus",
    "address": "456 North Ave, Seattle, WA",
    "phone": "+12065552222"
  }'

# List all branches
curl -X GET http://localhost:3000/api/churches/[churchId]/branches?includeStats=true \
  -H "Authorization: Bearer [token]"

# Update branch
curl -X PUT http://localhost:3000/api/branches/[branchId] \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Campus Name"}'

# Try to exceed limit (create 2nd branch on STARTER plan)
# Should return 400 with upgrade prompt
```

**Success Criteria:**
- [ ] Can create branch successfully
- [ ] Branch limit enforced based on plan
- [ ] Upgrade prompt shown when limit reached
- [ ] Can update branch details
- [ ] Can delete branch (cascades to groups)
- [ ] Cannot delete last branch
- [ ] All events tracked in PostHog
- [ ] Branch names unique per church

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Cascade delete not working | Check Prisma schema has `onDelete: Cascade` |
| Limit check fails | Verify subscription table has correct plan |
| Branch count wrong | Use `_count` aggregation in Prisma |

---

#### Task 3.2: Branch List & Management UI
**Time Estimate:** 2 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create the branch management interface for Connect YW with the following requirements:

PAGE: /frontend/src/pages/dashboard/BranchesPage.tsx

FEATURES:

1. Branch List View
- Card layout showing all branches
- Each card displays:
  - Branch name (bold, large)
  - Address with map icon
  - Phone number
  - Stats: X groups, Y members
  - Created date
  - Edit and Delete buttons
  - "Active" / "Inactive" badge

2. Create Branch Button
- Top right of page
- Opens modal or slides in form
- Disabled if at plan limit
- Shows "Upgrade to add more branches" tooltip if disabled

3. Create/Edit Branch Modal
Component: /frontend/src/components/branches/BranchFormModal.tsx
Fields:
- Branch name (required)
- Address (optional, with Google Places autocomplete if possible)
- Phone (optional, formatted)
- Description (optional, textarea)

Validation:
- Branch name required
- Unique name per church
- Phone in E.164 format if provided

4. Delete Confirmation
- Modal asking "Are you sure?"
- Show warning: "This will delete X groups and Y members"
- Cannot delete if last branch
- Require typing branch name to confirm

5. Empty State
- Show when no branches
- "Create your first branch" CTA
- Helpful text about multi-branch feature

6. Plan Limit Indicator
- Show "X of Y branches used" at top
- Progress bar
- Upgrade CTA if approaching limit

INTEGRATION:
- Use React Query for data fetching
- Mutations for create/update/delete
- Optimistic updates for better UX
- Toast notifications for success/error
- Track "branch_created", "branch_edited", "branch_deleted" events

MOBILE RESPONSIVE:
- Cards stack vertically
- Forms adapt to small screens
- Touch-friendly buttons

Use Tailwind CSS for styling.
Implement all components and functionality now.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       └── BranchesPage.tsx
├── components/
│   └── branches/
│       ├── BranchCard.tsx
│       ├── BranchFormModal.tsx
│       ├── DeleteBranchModal.tsx
│       └── BranchLimitIndicator.tsx
└── api/
    └── branch.api.ts (React Query hooks)
```

**Verification:**

```bash
cd frontend
npm run dev

# Navigate to http://localhost:5173/dashboard/branches
# Create multiple branches
# Edit a branch
# Delete a branch (confirm warning shows)
# Try to create branch beyond limit (button disabled)
# Check PostHog for events
```

**Success Criteria:**
- [ ] Branch list displays correctly
- [ ] Can create new branch via modal
- [ ] Can edit existing branch
- [ ] Can delete branch with confirmation
- [ ] Plan limit indicator accurate
- [ ] Upgrade CTA shows when at limit
- [ ] Empty state shows when no branches
- [ ] Mobile responsive
- [ ] Events tracked

---

#### Task 3.3: Branch-Specific Data Filtering
**Time Estimate:** 1 hour
**Complexity:** Medium

**Context:**
When a branch is selected, all data (groups, members, messages) should filter to that branch.

**Claude Code Prompt:**

```
Implement branch-specific data filtering throughout the Connect YW application.

ZUSTAND STORE UPDATE:
Update /frontend/src/stores/branchStore.ts to include:
- currentBranchId: string | null
- allBranchesMode: boolean (true = show data from all branches)
- setCurrentBranch(branchId)
- setAllBranchesMode(enabled)
- Persist to localStorage

API QUERY PARAM:
Add ?branchId= query parameter to relevant endpoints:
- GET /api/groups (filter by branchId)
- GET /api/members (filter by branchId through groups)
- GET /api/messages (filter by branchId)
- GET /api/analytics (filter by branchId)

FRONTEND UPDATES:

1. Update BranchSelector component:
- Add "All Branches" option at top of dropdown
- Show "(All)" indicator when allBranchesMode active
- Save selection to localStorage

2. Update data fetching hooks:
- In /frontend/src/api/*.api.ts files
- Include currentBranchId in query key
- Pass branchId as query param to API
- Data automatically refetches when branch changes

3. Visual indicators:
- Show "Viewing: [Branch Name]" badge on pages that filter by branch
- Show "Viewing: All Branches" when in all-branches mode
- Add filter icon next to totals

PAGES TO UPDATE:
- Groups list → filter by selected branch
- Members list → filter by selected branch
- Message history → filter by branch
- Analytics dashboard → filter by branch

BACKEND UPDATES:
Update relevant service methods to accept optional branchId parameter:
- groupService.getAllGroups(churchId, branchId?)
- messageService.getMessages(churchId, branchId?)
- analyticsService.getStats(churchId, branchId?)

If branchId not provided, return data for all branches.

Implement all filtering logic now.
```

**Expected Updates:**

```
frontend/src/
├── stores/
│   └── branchStore.ts (updated with filtering)
├── components/
│   └── BranchSelector.tsx (updated with "All Branches")
└── api/
    └── *.api.ts (all updated with branchId param)

backend/src/services/
├── group.service.ts (updated)
├── message.service.ts (updated)
└── analytics.service.ts (updated)
```

**Verification:**

```bash
# Create 2 branches
# Create groups in each branch
# Create members in each branch
# Switch between branches
# Verify groups list updates
# Verify members list updates
# Switch to "All Branches"
# Verify combined data shows
```

**Success Criteria:**
- [ ] Branch selector includes "All Branches" option
- [ ] Switching branches updates all data
- [ ] API correctly filters by branchId
- [ ] "All Branches" mode shows combined data
- [ ] Selection persists after page refresh
- [ ] Visual indicators show current filter

---

### Afternoon Session (5 hours)

#### Task 3.4: Branch Analytics
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create branch-specific analytics for the Connect YW dashboard.

BACKEND ENDPOINT:
GET /api/analytics/branches/:churchId
Authorization: JWT required

Response:
{
  "success": true,
  "data": {
    "branches": [
      {
        "branchId": string,
        "branchName": string,
        "memberCount": number,
        "groupCount": number,
        "messagesSent": number,
        "averageReplyRate": number,
        "lastMessageSent": ISO8601,
        "growthRate": number (percentage member growth this month)
      }
    ],
    "totals": {
      "totalMembers": number,
      "totalGroups": number,
      "totalMessagesSent": number,
      "overallReplyRate": number
    }
  }
}

FRONTEND COMPONENT:
/frontend/src/components/analytics/BranchAnalytics.tsx

Display:
- Table or cards showing each branch's stats
- Sort by: members, groups, messages, reply rate
- Visual comparison (bar chart or progress bars)
- Highlight top-performing branch
- Show trends (up/down arrows)

INTEGRATION:
- Add to Dashboard Overview page
- Add to dedicated Analytics page
- Update when branch is switched

Use recharts or similar library for visualizations.
Implement backend endpoint and frontend component now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── analytics.routes.ts
├── controllers/
│   └── analytics.controller.ts
└── services/
    └── analytics.service.ts

frontend/src/components/
└── analytics/
    └── BranchAnalytics.tsx
```

**Verification:**

```bash
# Access analytics endpoint
curl -X GET http://localhost:3000/api/analytics/branches/[churchId] \
  -H "Authorization: Bearer [token]"

# View on dashboard
# Should see comparison of all branches
```

**Success Criteria:**
- [ ] API returns accurate stats per branch
- [ ] Frontend displays branch comparison
- [ ] Can sort by different metrics
- [ ] Visual indicators for performance
- [ ] Updates when data changes

---

#### Task 3.5: Group CRUD API Endpoints
**Time Estimate:** 2 hours
**Complexity:** Medium

**Context:**
Each branch can have up to 30 groups. All groups share one Twilio phone number (cost optimization).

**Claude Code Prompt:**

```
Create complete group management API endpoints for Connect YW with the following specifications:

ENDPOINTS:

1. GET /api/branches/:branchId/groups
Authorization: JWT required
Query: ?includeMembers=true (optional)

Response:
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": string,
        "name": string,
        "description": string,
        "memberCount": number,
        "welcomeMessageEnabled": boolean,
        "welcomeMessageText": string,
        "isActive": boolean,
        "createdAt": ISO8601
      }
    ],
    "total": number,
    "limit": 30
  }
}

2. GET /api/groups/:id
Authorization: JWT required
Returns: Group with member list and recent activity

Response:
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "branchId": string,
    "branchName": string,
    "memberCount": number,
    "welcomeMessageEnabled": boolean,
    "welcomeMessageText": string,
    "isActive": boolean,
    "members": [
      {
        "id": string,
        "firstName": string,
        "lastName": string,
        "phone": string,
        "isOptedIn": boolean,
        "joinedAt": ISO8601
      }
    ],
    "recentMessages": number,
    "createdAt": ISO8601
  }
}

3. POST /api/branches/:branchId/groups
Authorization: JWT required

Request:
{
  "name": string (required),
  "description": string (optional),
  "welcomeMessageEnabled": boolean (default: true),
  "welcomeMessageText": string (optional, default provided)
}

Business Logic:
- Check 30-group limit per branch
- Return 400 if limit reached
- Unique group name per branch
- Track "group_created" PostHog event
- If this is 30th group, track "group_limit_reached" event

Response (201 Created):
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    // ... full group object
  }
}

Error (400 - Limit Reached):
{
  "success": false,
  "error": {
    "code": "GROUP_LIMIT_REACHED",
    "message": "This branch has reached the maximum of 30 groups",
    "currentCount": 30,
    "limit": 30
  }
}

4. PUT /api/groups/:id
Authorization: JWT required

Request: Partial group update
{
  "name": string,
  "description": string,
  "welcomeMessageEnabled": boolean,
  "welcomeMessageText": string,
  "isActive": boolean
}

Logic:
- Track "group_edited" event with fields_changed
- If welcomeMessage changed, track "welcome_message_customized" or "welcome_message_disabled"

5. DELETE /api/groups/:id
Authorization: JWT required

Logic:
- Cascade delete all group memberships (Prisma handles this)
- Track "group_deleted" event with member_count

SERVICES:
Create /backend/src/services/group.service.ts with methods:
- getAllGroups(branchId, includeMembers)
- getGroupById(id)
- createGroup(branchId, data)
- updateGroup(id, data)
- deleteGroup(id)
- checkGroupLimit(branchId)

Implement all endpoints, services, and validation now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── group.routes.ts
├── controllers/
│   └── group.controller.ts
├── services/
│   └── group.service.ts
└── validators/
    └── group.validator.ts
```

**Verification:**

```bash
# Create group
curl -X POST http://localhost:3000/api/branches/[branchId]/groups \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Youth Ministry",
    "description": "Ages 12-18",
    "welcomeMessageEnabled": true,
    "welcomeMessageText": "Welcome to Youth Ministry!"
  }'

# Create 30 groups to test limit
# 31st should fail with proper error

# List groups
curl -X GET http://localhost:3000/api/branches/[branchId]/groups \
  -H "Authorization: Bearer [token]"
```

**Success Criteria:**
- [ ] Can create group successfully
- [ ] 30-group limit enforced per branch
- [ ] Can update group details
- [ ] Can delete group
- [ ] Welcome message settings save correctly
- [ ] Events tracked in PostHog

---

#### Task 3.6: Group List & Management UI
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create the group management interface for Connect YW.

PAGE: /frontend/src/pages/dashboard/GroupsPage.tsx

FEATURES:

1. Group List View
- Table or card layout
- Columns: Name, Description, Members, Status, Actions
- Sortable by name or member count
- Search/filter by name
- Color-coded by ministry type (suggest tagging system)

2. Create Group Button
- Top right
- Opens modal
- Disabled if at 30-group limit
- Tooltip: "This branch has reached 30 groups"

3. Group Form Modal
Component: /frontend/src/components/groups/GroupFormModal.tsx

Fields:
- Group name (required)
- Description (optional)
- Welcome message enabled (toggle)
- Welcome message text (textarea, shows when enabled)
- Suggested default: "Welcome to [Group Name]! We're glad to have you."

4. Group Detail View
Component: /frontend/src/components/groups/GroupDetailModal.tsx

Show:
- Group info (name, description)
- Member list (with quick actions)
- Recent messages sent to this group
- "Add Members" button
- "Edit Group" button
- "Delete Group" button

5. Delete Confirmation
- "Are you sure?" modal
- Show: "This will remove X members from this group"
- Note: Members not deleted, just removed from group

6. Group Limit Indicator
- "X of 30 groups used" badge
- Progress bar
- Show on page top

7. Empty State
- "Create your first group" CTA
- Examples: "Youth Ministry", "Worship Team", "Everyone"

SUGGESTIONS:
When creating group, suggest common names:
- Everyone
- Members
- Youth Ministry
- Worship Team
- Small Groups
- Volunteers
- Leadership
- Prayer Team

Use React Query for data fetching.
Track all events in PostHog.
Mobile responsive design.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       └── GroupsPage.tsx
├── components/
│   └── groups/
│       ├── GroupCard.tsx
│       ├── GroupFormModal.tsx
│       ├── GroupDetailModal.tsx
│       ├── DeleteGroupModal.tsx
│       └── GroupLimitIndicator.tsx
└── api/
    └── group.api.ts
```

**Verification:**

```bash
# Navigate to /dashboard/groups
# Create multiple groups
# Edit a group
# View group details
# Delete a group
# Try to create 31st group (should be blocked)
```

**Success Criteria:**
- [ ] Group list displays correctly
- [ ] Can create new group
- [ ] Can edit existing group
- [ ] Can delete group
- [ ] Welcome message settings work
- [ ] 30-group limit enforced in UI
- [ ] Search/filter works
- [ ] Events tracked

---

### End of Day 3 Checklist

**Completed:**
- [ ] Branch CRUD API endpoints
- [ ] Branch management UI
- [ ] Branch-specific data filtering
- [ ] Branch analytics
- [ ] Group CRUD API endpoints
- [ ] Group management UI

**Test Scenarios:**
1. Create 3 branches → switch between them → verify groups filter correctly
2. Create 30 groups in one branch → verify limit enforced
3. View branch analytics → see accurate stats per branch

**Git Commit:**
```bash
git add .
git commit -m "Day 3 complete: Multi-branch and group infrastructure

- Branch CRUD operations with plan limits
- Branch-specific data filtering
- Branch analytics and comparison
- Group management (30 per branch)
- Welcome message configuration
- All events tracked in PostHog"
git push origin development
```

**If Behind Schedule:**
- Skip branch analytics (add later)
- Simplify group UI (basic table instead of cards)
- Skip group suggestions feature

**Tomorrow (Day 4):**
Twilio integration and SMS sending functionality.

---

## DAY 4: TWILIO INTEGRATION & SMS SENDING
**Target Hours:** 8-10 hours
**Goal:** Complete Twilio integration with message sending and delivery tracking

### Morning Session (5 hours)

#### Task 4.1: Twilio Service Integration
**Time Estimate:** 2 hours
**Complexity:** High

**Context:**
Integrate Twilio SDK for SMS sending. All 30 groups share one phone number (cost optimization).

**Claude Code Prompt:**

```
Create a comprehensive Twilio integration service for Connect YW with the following specifications:

SERVICE: /backend/src/services/twilio.service.ts

FEATURES:

1. Initialize Twilio Client
- Use church's Twilio credentials from database
- Cache client instances per church (don't recreate every time)
- Handle credential errors gracefully

2. Send SMS Method
sendSMS(params):
  - to: string (E.164 format phone number)
  - message: string (content)
  - churchId: string (to get Twilio credentials and from number)
  - callbackUrl: string (for delivery status webhooks)

Returns:
{
  success: boolean,
  messageSid: string,
  status: string,
  error?: string
}

Logic:
- Get church's Twilio credentials and phone number from database
- Initialize Twilio client
- Send SMS via Twilio API
- Handle errors (invalid number, insufficient funds, etc.)
- Return Twilio message SID for tracking

3. Send Bulk SMS Method
sendBulkSMS(params):
  - recipients: Array<{phone: string, memberId: string}>
  - message: string
  - churchId: string
  - messageId: string (Connect YW message ID)

Returns:
{
  success: boolean,
  sent: number,
  failed: number,
  results: Array<{
    phone: string,
    memberId: string,
    messageSid: string,
    status: string,
    error?: string
  }>
}

Logic:
- Loop through recipients (with rate limiting)
- Send each SMS individually
- Track success/failure for each
- Update MessageRecipient records in database
- Rate limit: 10 messages/second (configurable)
- Use Twilio's messaging service for better deliverability

4. Verify Phone Number Method
verifyPhoneNumber(phone: string): boolean
- Check if phone is in E.164 format
- Use libphonenumber-js library
- Return true/false

5. Format Phone Number Method
formatToE164(phone: string, defaultCountry: 'US'): string
- Convert various phone formats to E.164
- Example: (206) 555-1234 → +12065551234

6. Check Twilio Balance Method
getBalance(churchId: string): Promise<number>
- Query Twilio account balance
- Warn if below $10
- Return balance in USD

7. List Available Numbers Method
listAvailableNumbers(churchId: string, areaCode?: string): Promise<Array>
- Search Twilio for available phone numbers
- Filter by area code if provided
- Return list of available numbers with pricing

WEBHOOK HANDLER:
Create /backend/src/controllers/twilio.controller.ts

POST /api/webhooks/twilio/status
- Receives delivery status updates from Twilio
- Updates MessageRecipient.deliveryStatus
- Tracks final delivery stats on Message record
- Validates webhook authenticity using Twilio signature

POST /api/webhooks/twilio/reply
- Receives incoming SMS replies
- Creates reply record in MessageRecipient
- Increments replyCount on Message
- Tracks "message_replied" PostHog event
- If ONE_WAY mode, ignore replies
- If TWO_WAY mode, save and notify admins

ERROR HANDLING:
- 21211: Invalid 'To' phone number → mark as FAILED with clear error
- 21408: Permission to send denied (unverified number) → provide verification instructions
- 21610: Unsubscribed recipient → mark as opted out, don't retry
- 30003: Unreachable destination → mark as FAILED
- 30005: Unknown destination → mark as FAILED
- 30006: Landline or unreachable → mark as FAILED

A2P 10DLC COMPLIANCE:
- Include opt-out instructions in first message: "Reply STOP to unsubscribe"
- Handle STOP, START, HELP replies automatically
- Update member.isOptedIn when STOP received

RATE LIMITING:
- Implement queue system for bulk sends
- Process 10 messages/second max
- Use Bull queue library for reliability

Dependencies needed:
- twilio
- libphonenumber-js
- bull (for queuing)

Implement all methods, error handling, and webhooks now.
```

**Expected Files:**

```
backend/src/
├── services/
│   ├── twilio.service.ts
│   └── queue.service.ts (Bull queue setup)
├── controllers/
│   └── twilio.controller.ts (webhooks)
├── routes/
│   └── webhook.routes.ts
└── utils/
    └── phone.utils.ts (formatting helpers)
```

**Environment Variables to Add:**

```bash
# Add to backend/.env
TWILIO_WEBHOOK_URL="http://localhost:3000/api/webhooks/twilio"
# For production, this will be your actual domain
```

**Verification:**

```bash
# Test sending single SMS
# Create test endpoint temporarily
curl -X POST http://localhost:3000/api/test/send-sms \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1YOUR_PHONE",
    "message": "Test from Connect YW"
  }'

# Check your phone for SMS
# Check Twilio console for message SID
# Check database for MessageRecipient record

# Test webhook (use ngrok for local testing)
# ngrok http 3000
# Update Twilio webhook URL to ngrok URL
# Send SMS and watch for delivery status update
```

**Success Criteria:**
- [ ] Can send single SMS successfully
- [ ] SMS received on actual phone
- [ ] Twilio message SID saved to database
- [ ] Delivery status webhook updates database
- [ ] Reply webhook captures incoming SMS
- [ ] Phone number formatting works
- [ ] Bulk sending with rate limiting works
- [ ] Error handling for all Twilio error codes

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "Unverified number" error | Verify number in Twilio console (trial accounts) |
| Webhooks not firing | Use ngrok for local testing |
| Rate limit errors | Reduce to 1 msg/sec for trial accounts |
| Invalid phone format | Always format to E.164 before sending |

---

#### Task 4.2: Message Sending API
**Time Estimate:** 2 hours
**Complexity:** High

**Claude Code Prompt:**

```
Create the message sending API for Connect YW with the following specifications:

ENDPOINT: POST /api/messages/send
Authorization: JWT required
Middleware: checkTrialOrSubscription (verify active trial or subscription)

Request Body:
{
  "content": string (required, max 1600 chars),
  "targetType": "individual" | "groups" | "branches" | "all" (required),
  "targetIds": string[] (required for groups/branches, empty for "all"),
  "memberId": string (required only for targetType="individual"),
  "scheduleFor": ISO8601 (optional, null = send immediately)
}

BUSINESS LOGIC:

1. Validation
- Verify church has Twilio connected
- Check message character count (warn if >160, shows as multiple segments)
- Validate targetType and targetIds
- Check if within plan limits (messages per month)

2. Recipient Resolution
Based on targetType:
- "individual": Get single member by memberId
- "groups": Get all opted-in members from targetIds (group IDs)
- "branches": Get all opted-in members from all groups in targetIds (branch IDs)
- "all": Get all opted-in members from all groups in all branches

Filter out:
- Members with isOptedIn = false
- Duplicate phone numbers (send once per unique number)

3. Create Message Record
- Save to Message table with status SCHEDULED or SENDING
- Store targetType, targetIds, content
- Calculate totalRecipients
- sentByAdminId and sentByAdminEmail for audit trail

4. Create MessageRecipient Records
- One record per unique recipient
- Initial status: PENDING
- Link to message and member

5. Queue or Send
If scheduleFor is null:
- Update message status to SENDING
- Queue bulk send job
- Process immediately (background job)

If scheduleFor is future:
- Keep status SCHEDULED
- Store scheduledFor timestamp
- Cron job will send at scheduled time

6. Track Analytics
- Track "message_composed" event when endpoint called
- Track "message_sent" event when actually sent
- Track "message_scheduled" event if scheduled

7. Response
Return immediately (don't wait for all SMSs to send):
{
  "success": true,
  "data": {
    "messageId": string,
    "status": "SENDING" | "SCHEDULED",
    "totalRecipients": number,
    "estimatedCost": number,
    "charactersUsed": number,
    "segmentCount": number,
    "sentAt": ISO8601 | null,
    "scheduledFor": ISO8601 | null
  }
}

BACKGROUND JOB:
Create /backend/src/jobs/sendMessage.job.ts

Process:
- Get message by ID
- Get all PENDING recipients
- Call twilioService.sendBulkSMS()
- Update MessageRecipient statuses as each sends
- Update Message delivery stats
- Set Message.status = SENT when complete
- Track "message_delivered" events

ERROR HANDLING:
- No Twilio connection → 400 "Connect Twilio first"
- No recipients found → 400 "No recipients match criteria"
- Plan limit reached → 402 "Message limit reached. Upgrade plan."
- Twilio API error → 500 "Failed to send message"

SCHEDULED MESSAGES:
Create cron job: /backend/src/cron/scheduledMessages.job.ts
- Runs every minute
- Finds messages with status=SCHEDULED and scheduledFor <= now
- Triggers send for each
- Updates status to SENDING

Implement all endpoints, logic, jobs, and error handling now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── message.routes.ts
├── controllers/
│   └── message.controller.ts
├── services/
│   └── message.service.ts
├── jobs/
│   ├── sendMessage.job.ts
│   └── scheduledMessages.job.ts
└── validators/
    └── message.validator.ts
```

**Verification:**

```bash
# Send to single group
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test message to Youth Ministry!",
    "targetType": "groups",
    "targetIds": ["grp_youth_123"]
  }'

# Check response for messageId
# Check database for Message record
# Check database for MessageRecipient records
# Check Twilio console for sent messages
# Verify SMS received on phone

# Send to all members
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Church-wide announcement!",
    "targetType": "all",
    "targetIds": []
  }'

# Schedule message for future
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Reminder: Service tomorrow at 10am!",
    "targetType": "all",
    "targetIds": [],
    "scheduleFor": "2025-10-29T09:00:00Z"
  }'
```

**Success Criteria:**
- [ ] Can send to individual member
- [ ] Can send to specific group(s)
- [ ] Can send to specific branch(es)
- [ ] Can send to all members
- [ ] Duplicate phone numbers handled
- [ ] Opted-out members excluded
- [ ] Scheduled messages queue correctly
- [ ] Background job sends messages
- [ ] Database records created correctly
- [ ] Events tracked in PostHog
- [ ] Plan limits enforced

---

#### Task 4.3: Message History API
**Time Estimate:** 1 hour
**Complexity:** Low

**Claude Code Prompt:**

```
Create message history endpoints for Connect YW.

ENDPOINTS:

1. GET /api/messages/history
Authorization: JWT required
Query params:
- page: number (default 1)
- limit: number (default 20, max 100)
- status: "SENT" | "SCHEDULED" | "FAILED" | "ALL" (default ALL)
- branchId: string (optional, filter by branch)
- search: string (optional, search message content)

Response:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": string,
        "content": string,
        "status": enum,
        "targetType": enum,
        "totalRecipients": number,
        "deliveredCount": number,
        "failedCount": number,
        "replyCount": number,
        "deliveryRate": number (percentage),
        "replyRate": number (percentage),
        "sentByAdminEmail": string,
        "sentAt": ISO8601,
        "scheduledFor": ISO8601,
        "createdAt": ISO8601
      }
    ],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "pages": number
    }
  }
}

2. GET /api/messages/:id
Authorization: JWT required
Returns: Full message details with recipient list

Response:
{
  "success": true,
  "data": {
    "message": {
      "id": string,
      "content": string,
      "status": enum,
      "targetType": enum,
      "targetIds": string[],
      "characterCount": number,
      "sentByAdminEmail": string,
      "sentAt": ISO8601,
      "scheduledFor": ISO8601
    },
    "stats": {
      "totalRecipients": number,
      "delivered": number,
      "failed": number,
      "pending": number,
      "replies": number,
      "deliveryRate": number,
      "replyRate": number
    },
    "recipients": [
      {
        "id": string,
        "memberName": string,
        "phone": string,
        "deliveryStatus": enum,
        "sentAt": ISO8601,
        "deliveredAt": ISO8601,
        "failedAt": ISO8601,
        "errorMessage": string,
        "hasReplied": boolean,
        "replyText": string,
        "repliedAt": ISO8601
      }
    ]
  }
}

Track "message_history_viewed" PostHog event.

3. PUT /api/messages/:id/cancel
Authorization: JWT required
Only for SCHEDULED messages

Logic:
- Verify message is SCHEDULED
- Update status to CANCELED
- Track "message_schedule_canceled" event

Response:
{
  "success": true,
  "message": "Message canceled successfully"
}

4. GET /api/messages/stats
Authorization: JWT required
Returns: Overall messaging statistics

Response:
{
  "success": true,
  "data": {
    "totalMessagesSent": number,
    "thisWeek": number,
    "thisMonth": number,
    "averageDeliveryRate": number,
    "averageReplyRate": number,
    "totalReplies": number,
    "messagesScheduled": number
  }
}

Implement all endpoints with proper pagination, filtering, and sorting.
```

**Verification:**

```bash
# Get message history
curl -X GET "http://localhost:3000/api/messages/history?page=1&limit=20" \
  -H "Authorization: Bearer [token]"

# Get specific message
curl -X GET http://localhost:3000/api/messages/[messageId] \
  -H "Authorization: Bearer [token]"

# Cancel scheduled message
curl -X PUT http://localhost:3000/api/messages/[messageId]/cancel \
  -H "Authorization: Bearer [token]"
```

**Success Criteria:**
- [ ] Message history returns correctly
- [ ] Pagination works
- [ ] Filtering by status works
- [ ] Search functionality works
- [ ] Message details show all recipients
- [ ] Can cancel scheduled message
- [ ] Stats endpoint accurate

---

### Afternoon Session (5 hours)

#### Task 4.4: Message Composer UI
**Time Estimate:** 2.5 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create a comprehensive message composer interface for Connect YW.

PAGE: /frontend/src/pages/dashboard/SendMessagePage.tsx

LAYOUT:

Left Panel (Recipient Selection):
- Tabs: "Individual" | "Groups" | "Branches" | "Everyone"

Individual Tab:
- Search members by name or phone
- Typeahead dropdown
- Shows selected member with remove button

Groups Tab:
- Checkbox list of all groups (filtered by current branch if selected)
- Shows member count for each group
- "Select All" option
- Shows total unique recipients at bottom

Branches Tab:
- Checkbox list of all branches
- Shows member count for each branch
- "Select All" option
- Shows total unique recipients

Everyone Tab:
- Simple confirmation
- Shows total member count
- Warning: "This will send to X members across all branches"

Right Panel (Message Composition):
- Textarea for message content
- Character counter (shows 160, 320, 480, etc. for SMS segments)
- Preview section showing how SMS will appear
- Schedule toggle:
  - "Send now" (default)
  - "Schedule for later" (date/time picker)
- Cost estimate: "Estimated cost: $X.XX"
- Large "Send Message" button

FEATURES:

1. Character Counter Component
/frontend/src/components/messages/CharacterCounter.tsx
- Shows: "145/160 characters (1 message)"
- Shows: "165/320 characters (2 messages)"
- Color codes:
  - Green: 0-160
  - Yellow: 161-320
  - Orange: 321-480
  - Red: 480+
- Warning if >480 characters

2. Recipient Preview Component
/frontend/src/components/messages/RecipientPreview.tsx
- Shows count: "Sending to 45 recipients"
- Shows breakdown: "Youth Ministry (23), Worship Team (22)"
- Shows duplicates removed if any
- Shows opted-out members excluded: "5 members opted out"

3. Cost Estimator
- $0.0075 per segment per recipient (Twilio price)
- Shows: "Estimated cost: $X.XX (Y messages × Z recipients)"

4. Message Templates (Nice to Have)
Dropdown with common templates:
- "Service Reminder"
- "Event Announcement"
- "Prayer Request"
- "Thank You"
- Custom templates saved by admin

5. Schedule Picker
/frontend/src/components/messages/SchedulePicker.tsx
- Date picker (react-datepicker)
- Time picker
- Timezone display
- Validation: can't schedule in past

6. Send Confirmation Modal
Before sending, show confirmation:
- Message content preview
- Recipient count
- Cost estimate
- Send time (now or scheduled)
- "Confirm Send" button

VALIDATION:
- Message required
- At least 1 recipient
- Scheduled time in future if scheduling
- Within plan limits

ERROR HANDLING:
- Show error if Twilio not connected
- Show error if no recipients found
- Show error if plan limit reached
- Suggest upgrade if needed

LOADING STATES:
- "Sending..." spinner during API call
- Disable form while sending
- Progress bar for recipient resolution

SUCCESS:
- Show success message: "Message sent to 45 recipients!"
- Redirect to message history after 2 seconds
- Or show "Send another message" button

Track "message_composed" event when form loaded.
Track "message_sent" event when successfully sent.

Use React Hook Form for form management.
Use React Query for API calls.
Mobile responsive design.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       └── SendMessagePage.tsx
├── components/
│   └── messages/
│       ├── RecipientSelector.tsx
│       ├── MessageComposer.tsx
│       ├── CharacterCounter.tsx
│       ├── RecipientPreview.tsx
│       ├── CostEstimator.tsx
│       ├── SchedulePicker.tsx
│       └── SendConfirmationModal.tsx
└── api/
    └── message.api.ts
```

**Verification:**

```bash
# Navigate to /dashboard/send
# Select group
# Type message
# Watch character counter update
# See cost estimate
# Click Send
# Confirm in modal
# Verify message sent
# Check message history
```

**Success Criteria:**
- [ ] Can select recipients (all 4 methods)
- [ ] Character counter accurate
- [ ] SMS segment calculation correct
- [ ] Cost estimate accurate
- [ ] Can schedule message
- [ ] Confirmation modal shows before send
- [ ] Success message after send
- [ ] Mobile responsive
- [ ] Events tracked

---

#### Task 4.5: Message History UI
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create the message history interface for Connect YW.

PAGE: /frontend/src/pages/dashboard/MessageHistoryPage.tsx

LAYOUT:

Top Section:
- Title: "Message History"
- Filter bar:
  - Status dropdown (All, Sent, Scheduled, Failed)
  - Date range picker
  - Search box (search message content)
  - Branch filter (if multi-branch)

Message List:
- Table or card layout showing:
  - Message preview (first 50 chars)
  - Status badge (Sent, Scheduled, Failed)
  - Recipients count
  - Delivery rate (% with progress bar)
  - Reply rate (% with progress bar)
  - Sent by (admin email)
  - Sent at / Scheduled for
  - Actions: View Details, Cancel (if scheduled)

Pagination:
- Bottom of list
- Show "Page X of Y"
- Items per page: 20

Empty State:
- "No messages yet"
- "Send your first message" CTA button

MESSAGE DETAIL MODAL:
/frontend/src/components/messages/MessageDetailModal.tsx

Show:
- Full message content
- Status and timestamps
- Stats cards:
  - Total Recipients
  - Delivered (with %)
  - Failed (with %)
  - Replies (with %)
- Recipient table:
  - Name
  - Phone
  - Delivery status with icon
  - Delivered/Failed time
  - Reply text (if replied)
  - Reply time
- Export button (CSV of recipients)

SCHEDULED MESSAGES SECTION:
Separate section showing only scheduled messages
- Countdown timer: "Sends in 2 hours"
- Edit schedule button
- Cancel button

STATISTICS OVERVIEW:
Top cards showing:
- Total Messages Sent
- This Week
- Avg Delivery Rate
- Avg Reply Rate

Use React Query for data fetching.
Infinite scroll or pagination for large message lists.
Real-time updates for delivery stats (poll every 30s).
Mobile responsive.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       └── MessageHistoryPage.tsx
├── components/
│   └── messages/
│       ├── MessageCard.tsx
│       ├── MessageDetailModal.tsx
│       ├── RecipientTable.tsx
│       └── MessageFilters.tsx
└── api/
    └── message.api.ts
```

**Verification:**

```bash
# Navigate to /dashboard/messages
# See list of sent messages
# Click on a message
# See detailed view with recipients
# Filter by status
# Search for message
# Click scheduled message
# See countdown and cancel button
```

**Success Criteria:**
- [ ] Message list displays correctly
- [ ] Filtering works
- [ ] Search works
- [ ] Pagination works
- [ ] Detail modal shows full info
- [ ] Can cancel scheduled message
- [ ] Stats cards accurate
- [ ] Real-time updates work
- [ ] Mobile responsive

---

#### Task 4.6: Reply Inbox (2-Way Communication)
**Time Estimate:** 1 hour
**Complexity:** Low

**Claude Code Prompt:**

```
Create the reply inbox for 2-way communication in Connect YW.

API ENDPOINT:
GET /api/messages/replies
Authorization: JWT required
Query params:
- page: number
- limit: number
- unreadOnly: boolean (default false)

Response:
{
  "success": true,
  "data": {
    "replies": [
      {
        "id": string,
        "originalMessageContent": string (first 50 chars),
        "memberName": string,
        "memberPhone": string,
        "replyText": string,
        "repliedAt": ISO8601,
        "isRead": boolean
      }
    ],
    "unreadCount": number,
    "total": number
  }
}

PUT /api/messages/replies/:id/mark-read
- Mark reply as read
- Track "reply_viewed" event

PAGE: /frontend/src/pages/dashboard/RepliesPage.tsx

FEATURES:

1. Reply List
- Shows all replies from 2-way messages
- Each item displays:
  - Member name and phone
  - Original message preview
  - Reply text (full)
  - Time of reply
  - Unread badge if not read
- Click to mark as read

2. Unread Count Badge
- Shows in sidebar navigation next to "Replies"
- Red badge with count
- Updates in real-time

3. Communication Mode Indicator
- Banner if ONE_WAY mode active:
  - "2-way communication is currently disabled. Members cannot reply to messages."
  - "Enable 2-way" button → settings
- If TWO_WAY mode, show active indicator

4. Filter
- "Show unread only" toggle

5. Empty State
- If ONE_WAY: "Enable 2-way communication to receive replies"
- If TWO_WAY and no replies: "No replies yet"

REAL-TIME UPDATES:
- Poll for new replies every 30 seconds
- Show toast notification when new reply received
- Update unread count in sidebar

Optional (if time permits):
- Reply to member (send new message to individual)

Track "reply_viewed" event when reply opened.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       └── RepliesPage.tsx
├── components/
│   └── messages/
│       ├── ReplyCard.tsx
│       ├── UnreadBadge.tsx
│       └── CommunicationModeBanner.tsx
└── api/
    └── reply.api.ts
```

**Verification:**

```bash
# Set church to TWO_WAY mode
# Send a test message to your phone
# Reply to the SMS
# Check webhook fires
# Check reply appears in inbox
# Check unread count updates
# Click reply to mark as read
# Unread count decrements
```

**Success Criteria:**
- [ ] Reply inbox shows all replies
- [ ] Unread count accurate
- [ ] Can mark replies as read
- [ ] Communication mode banner shows
- [ ] Real-time updates work
- [ ] Toast notification for new replies
- [ ] Events tracked

---

### End of Day 4 Checklist

**Completed:**
- [ ] Twilio service integration
- [ ] SMS sending (single and bulk)
- [ ] Message sending API
- [ ] Message history API
- [ ] Message composer UI
- [ ] Message history UI
- [ ] Reply inbox for 2-way communication

**Test Scenarios:**
1. Send SMS to your phone → receive it → check delivery status updates
2. Reply to SMS → see reply in inbox
3. Send to multiple groups → verify all recipients receive
4. Schedule message → verify it sends at scheduled time

**Git Commit:**
```bash
git add .
git commit -m "Day 4 complete: Twilio integration and messaging

- Complete Twilio SDK integration
- SMS sending with delivery tracking
- Bulk messaging with rate limiting
- Message composer with recipient selection
- Character counter and cost estimator
- Message history with filtering
- Reply inbox for 2-way communication
- Webhook handlers for delivery status and replies"
git push origin development
```

**If Behind Schedule:**
- Skip message templates feature
- Skip reply-to functionality
- Simplify message history UI

**Tomorrow (Day 5):**
Co-admin system and complete Week 1 integration testing.

---

## DAY 5: CO-ADMIN SYSTEM & WEEK 1 WRAP-UP
**Target Hours:** 8-10 hours
**Goal:** Complete co-admin invitation system and integration test all Week 1 features

### Morning Session (5 hours)

#### Task 5.1: Co-Admin Invitation API
**Time Estimate:** 2 hours
**Complexity:** Medium

**Context:**
Churches can have 1 primary admin + up to 3 co-admins depending on plan. Co-admins have full access except billing/subscription management.

**Claude Code Prompt:**

```
Create a complete co-admin management system for Connect YW with the following specifications:

ENDPOINTS:

1. POST /api/churches/:churchId/admins/invite
Authorization: JWT required (PRIMARY or CO_ADMIN can invite)

Request:
{
  "email": string (required, valid email),
  "firstName": string (required),
  "lastName": string (required)
}

Business Logic:
- Check co-admin limit based on plan:
  - STARTER: 1 co-admin
  - GROWTH: 3 co-admins
  - PRO: 3 co-admins
- Generate unique invite token (crypto.randomBytes)
- Save to Admin table with status pending
- Send invitation email with acceptance link
- Track "co_admin_invited" PostHog event
- If at limit, track "co_admin_limit_reached" event

Response (201 Created):
{
  "success": true,
  "data": {
    "inviteId": string,
    "email": string,
    "inviteToken": string,
    "inviteUrl": string,
    "expiresAt": ISO8601 (7 days from now)
  }
}

Error (400 - Limit Reached):
{
  "success": false,
  "error": {
    "code": "CO_ADMIN_LIMIT_REACHED",
    "message": "Your Starter plan allows 1 co-administrator",
    "currentCount": 1,
    "limit": 1,
    "upgradeRequired": true
  }
}

2. GET /api/invites/:token
Public endpoint (no auth required)
Returns: Invite details to show acceptance page

Response:
{
  "success": true,
  "data": {
    "churchName": string,
    "invitedBy": string,
    "email": string,
    "expiresAt": ISO8601,
    "isExpired": boolean,
    "isUsed": boolean
  }
}

3. POST /api/invites/:token/accept
Public endpoint (no auth required)

Request:
{
  "password": string (required, min 8 chars)
}

Business Logic:
- Verify token exists and not expired
- Verify not already accepted
- Hash password
- Update Admin record:
  - Set password hash
  - Set inviteAcceptedAt
  - Set isActive = true
  - Clear inviteToken
- Generate JWT tokens
- Track "co_admin_invite_accepted" PostHog event

Response:
{
  "success": true,
  "data": {
    "admin": { id, email, firstName, lastName, role: "CO_ADMIN" },
    "church": { id, name },
    "accessToken": string,
    "refreshToken": string
  }
}

4. GET /api/churches/:churchId/admins
Authorization: JWT required

Response:
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": string,
        "email": string,
        "firstName": string,
        "lastName": string,
        "role": "PRIMARY" | "CO_ADMIN",
        "isActive": boolean,
        "lastLoginAt": ISO8601,
        "inviteAcceptedAt": ISO8601,
        "createdAt": ISO8601
      }
    ],
    "limit": number,
    "current": number
  }
}

5. DELETE /api/admins/:id
Authorization: JWT required (PRIMARY only)

Business Logic:
- Cannot delete PRIMARY admin
- Cannot delete self
- Deactivate admin (set isActive = false)
- Track "co_admin_removed" event

EMAIL SERVICE:
Update /backend/src/services/email.service.ts

Add method: sendCoAdminInvite(email, inviteUrl, churchName, invitedBy)

Email template:
- Subject: "You've been invited to join [Church Name] on Connect YW"
- Body:
  - "Hi! [Inviter Name] has invited you to join [Church Name] as a co-administrator on Connect YW."
  - "Accept invitation" button → inviteUrl
  - "This invitation expires in 7 days"
  - What co-admins can do: send messages, manage members, etc.

Implement all endpoints, email service, and event tracking now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   ├── admin.routes.ts
│   └── invite.routes.ts
├── controllers/
│   ├── admin.controller.ts
│   └── invite.controller.ts
├── services/
│   ├── admin.service.ts
│   └── email.service.ts (updated)
└── validators/
    └── admin.validator.ts
```

**Verification:**

```bash
# Invite co-admin
curl -X POST http://localhost:3000/api/churches/[churchId]/admins/invite \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coadmin@church.com",
    "firstName": "Jane",
    "lastName": "Doe"
  }'

# Get invite details (use token from response)
curl -X GET http://localhost:3000/api/invites/[token]

# Accept invite
curl -X POST http://localhost:3000/api/invites/[token]/accept \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePass123!"
  }'

# List admins
curl -X GET http://localhost:3000/api/churches/[churchId]/admins \
  -H "Authorization: Bearer [token]"

# Try to exceed limit (invite 2nd co-admin on STARTER plan)
# Should return 400 with upgrade prompt
```

**Success Criteria:**
- [ ] Can invite co-admin successfully
- [ ] Invitation email sent
- [ ] Co-admin limit enforced
- [ ] Can accept invite and set password
- [ ] Accepting generates JWT tokens
- [ ] Co-admin can log in
- [ ] Co-admin sees full dashboard
- [ ] PRIMARY can remove co-admin
- [ ] Cannot remove PRIMARY admin
- [ ] Events tracked

---

#### Task 5.2: Co-Admin Management UI
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create the co-admin management interface for Connect YW.

PAGE: /frontend/src/pages/dashboard/AdminsPage.tsx
Route: /dashboard/admins
Access: Only visible to PRIMARY admin (hide from co-admins)

FEATURES:

1. Admin List
- Table showing all admins:
  - Name
  - Email
  - Role badge (PRIMARY / CO-ADMIN)
  - Status (Active / Pending)
  - Last Login
  - Actions (Remove button, only for co-admins)

2. Invite Button
- Top right
- "Invite Co-Admin"
- Opens modal
- Disabled if at plan limit
- Tooltip: "Upgrade to add more co-admins"

3. Invite Modal
Component: /frontend/src/components/admins/InviteAdminModal.tsx

Fields:
- Email (required)
- First Name (required)
- Last Name (required)
- Preview: "We'll send an invitation to this email"

On submit:
- Call invite API
- Show success message: "Invitation sent to [email]"
- Show invite URL (can copy to clipboard)

4. Remove Admin Confirmation
- Modal: "Remove [Name] as co-administrator?"
- Warning: "They will lose access immediately"
- Confirm button

5. Pending Invites Section
- Show pending invites separately
- Display: Email, Invited by, Sent date, Expires date
- Actions: Resend invite, Cancel invite
- Show expired invites with "Expired" badge

6. Plan Limit Indicator
- "X of Y co-admins" badge
- Progress bar
- If at limit: upgrade CTA

7. Role Badges
- PRIMARY: Blue badge, crown icon
- CO_ADMIN: Green badge
- PENDING: Yellow badge

ACCEPT INVITE PAGE:
/frontend/src/pages/invite/AcceptInvitePage.tsx
Route: /invite/:token

Features:
- Fetch invite details by token
- Show church name
- Show who invited them
- Password setup form
- Confirm password field
- Accept button

On success:
- Save tokens to localStorage
- Redirect to dashboard
- Show welcome message

Error states:
- Invalid token
- Expired token
- Already accepted

PERMISSIONS:
Create /frontend/src/hooks/usePermissions.ts

Hook to check:
- isPrimaryAdmin()
- canInviteCoAdmins()
- canRemoveCoAdmins()
- canManageBilling()

Use throughout app to show/hide features based on role.

Implement all components and permission logic now.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   ├── dashboard/
│   │   └── AdminsPage.tsx
│   └── invite/
│       └── AcceptInvitePage.tsx
├── components/
│   └── admins/
│       ├── AdminTable.tsx
│       ├── InviteAdminModal.tsx
│       ├── RemoveAdminModal.tsx
│       └── RoleBadge.tsx
├── hooks/
│   └── usePermissions.ts
└── api/
    └── admin.api.ts
```

**Verification:**

```bash
# As PRIMARY admin:
# Navigate to /dashboard/admins
# Click "Invite Co-Admin"
# Fill form and submit
# Check email for invitation
# Copy invite URL
# Open in incognito/private window
# See accept invite page
# Set password and accept
# Login as co-admin
# Verify co-admin can access most features
# Verify co-admin cannot see /dashboard/admins
# Verify co-admin cannot manage billing
```

**Success Criteria:**
- [ ] Admin list displays correctly
- [ ] Can invite co-admin
- [ ] Invitation email received
- [ ] Accept invite page works
- [ ] Password setup works
- [ ] Co-admin can login
- [ ] PRIMARY-only features hidden from co-admins
- [ ] Can remove co-admin
- [ ] Plan limit enforced in UI
- [ ] Events tracked

---

#### Task 5.3: Member Management APIs
**Time Estimate:** 1.5 hours
**Complexity:** Medium

**Context:**
Complete the member management system including CSV import.

**Claude Code Prompt:**

```
Create complete member management endpoints for Connect YW.

ENDPOINTS:

1. GET /api/groups/:groupId/members
Authorization: JWT required
Query: ?page=1&limit=50&search=john

Response:
{
  "success": true,
  "data": {
    "members": [
      {
        "id": string,
        "firstName": string,
        "lastName": string,
        "phone": string,
        "email": string,
        "isOptedIn": boolean,
        "joinedAt": ISO8601,
        "welcomeMessageSent": boolean
      }
    ],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}

2. POST /api/groups/:groupId/members
Authorization: JWT required

Request:
{
  "firstName": string (required),
  "lastName": string (required),
  "phone": string (required, E.164),
  "email": string (optional)
}

Business Logic:
- Validate phone number format
- Check if phone already exists (if yes, add existing member to group)
- Create new member if doesn't exist
- Create GroupMember link
- Queue welcome message if enabled
- Track "member_added" PostHog event
- Check plan member limit

Response (201 Created):
{
  "success": true,
  "data": {
    "id": string,
    "firstName": string,
    "lastName": string,
    "phone": string,
    "welcomeMessageQueued": boolean
  }
}

3. POST /api/groups/:groupId/members/import
Authorization: JWT required
Content-Type: multipart/form-data

Request: CSV file upload
CSV format:
firstName,lastName,phone,email
John,Doe,+12065551111,john@example.com
Jane,Smith,+12065552222,

Business Logic:
- Parse CSV file
- Validate each row:
  - Required fields present
  - Phone number valid
  - Email valid (if provided)
- Check for duplicates in CSV
- Check for existing members (add to group if exists)
- Create new members in batch
- Create GroupMember links in batch
- Queue welcome messages
- Track "member_bulk_imported" PostHog event

Response (200 OK):
{
  "success": true,
  "data": {
    "imported": number,
    "failed": number,
    "errors": [
      {
        "row": number,
        "field": string,
        "error": string,
        "value": string
      }
    ],
    "members": [ array of created members ]
  }
}

4. PUT /api/members/:id
Authorization: JWT required

Request: Partial member update
{
  "firstName": string,
  "lastName": string,
  "phone": string,
  "email": string,
  "isOptedIn": boolean
}

Track "member_edited" event.

5. DELETE /api/members/:id
Authorization: JWT required

Logic:
- Remove from all groups (delete GroupMember records)
- Optionally: soft delete member
- Track "member_removed" event

6. POST /api/members/:id/opt-out
Public endpoint (for automated opt-outs from SMS replies)

Logic:
- Set isOptedIn = false
- Set optedOutAt = now
- Track "member_opted_out" event

7. POST /api/members/:id/opt-in
Authorization: JWT required

Logic:
- Set isOptedIn = true
- Clear optedOutAt
- Track "member_opted_in" event

CSV PARSER:
Create /backend/src/utils/csvParser.util.ts

Methods:
- parseCSV(fileBuffer): Parse CSV to JSON
- validateMemberRow(row): Validate single row
- formatPhoneNumber(phone): Convert to E.164

Use papa-parse library for robust CSV parsing.

WELCOME MESSAGE QUEUE:
Create /backend/src/jobs/welcomeMessage.job.ts

Process:
- When member added to group with welcomeMessageEnabled
- Queue welcome message send (delay 1 minute)
- Check if member already received welcome message for this group
- Send via Twilio service
- Track "welcome_message_sent" event
- Mark GroupMember.welcomeMessageSent = true

Implement all endpoints, CSV parser, and welcome message job now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── member.routes.ts
├── controllers/
│   └── member.controller.ts
├── services/
│   └── member.service.ts
├── utils/
│   └── csvParser.util.ts
├── jobs/
│   └── welcomeMessage.job.ts
└── validators/
    └── member.validator.ts
```

**Verification:**

```bash
# Add single member
curl -X POST http://localhost:3000/api/groups/[groupId]/members \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+12065551111",
    "email": "john@example.com"
  }'

# Create test CSV file
echo "firstName,lastName,phone,email
Jane,Smith,+12065552222,jane@example.com
Bob,Johnson,+12065553333,bob@example.com" > members.csv

# Import CSV
curl -X POST http://localhost:3000/api/groups/[groupId]/members/import \
  -H "Authorization: Bearer [token]" \
  -F "file=@members.csv"

# Check database for new members
# Check Twilio console for welcome messages sent
# Check phones for welcome message SMS
```

**Success Criteria:**
- [ ] Can add single member
- [ ] CSV import works with valid file
- [ ] CSV validation catches errors
- [ ] Duplicate phone numbers handled
- [ ] Welcome messages send automatically
- [ ] Member limit enforced
- [ ] Events tracked
- [ ] Opt-out functionality works

---

### Afternoon Session (5 hours)

#### Task 5.4: Member Management UI
**Time Estimate:** 2 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create the member management interface for Connect YW.

PAGE: /frontend/src/pages/dashboard/MembersPage.tsx

FEATURES:

1. Member List View
- Table layout:
  - Checkbox (for bulk actions)
  - Name (first + last)
  - Phone (formatted)
  - Email
  - Groups (tags showing which groups)
  - Status (Opted In / Opted Out)
  - Actions dropdown

2. Top Bar
- Search box (search by name or phone)
- Group filter dropdown (show members of specific group)
- Branch filter (if multi-branch)
- Status filter (All / Opted In / Opted Out)
- Add Member button
- Import CSV button

3. Add Member Modal
Component: /frontend/src/components/members/AddMemberModal.tsx

Fields:
- First Name (required)
- Last Name (required)
- Phone (required, with formatting as user types)
- Email (optional)
- Group selection (checkboxes for multiple groups)

Phone input:
- Auto-format as user types: (206) 555-1234
- Convert to E.164 on submit
- Validate format
- Show error for invalid numbers

4. CSV Import Modal
Component: /frontend/src/components/members/ImportCSVModal.tsx

Features:
- File upload (drag & drop or click)
- CSV template download button
- Upload progress bar
- Preview first 5 rows before import
- Validation results display
- Import summary: "X imported, Y failed"
- Error list with row numbers

CSV template structure:
firstName,lastName,phone,email
John,Doe,2065551111,john@example.com
Jane,Smith,(206) 555-2222,jane@example.com

5. Member Detail Modal
Component: /frontend/src/components/members/MemberDetailModal.tsx

Show:
- Full member info
- Groups list
- Message history (messages sent to this member)
- Activity timeline
- Edit button
- Remove from group button
- Opt-in/opt-out toggle

6. Bulk Actions
- Select multiple members (checkboxes)
- Actions dropdown:
  - Add to group
  - Remove from group
  - Opt out
  - Export selected

7. Pagination & Stats
- Bottom: pagination controls
- Top: "Showing X-Y of Z members"
- Stats cards:
  - Total Members
  - Opted In
  - Opted Out
  - Added This Week

8. Empty States
- No members: "Add your first member" CTA
- No search results: "No members found" with clear filters button

PHONE NUMBER FORMATTING:
Use react-phone-number-input library
- Formats as user types
- Country code selection
- Validates format

CSV PREVIEW:
Parse CSV in browser before upload
Use papaparse library
Show preview table with first 5 rows

Use React Query for data fetching.
Track all events in PostHog.
Mobile responsive.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       └── MembersPage.tsx
├── components/
│   └── members/
│       ├── MemberTable.tsx
│       ├── AddMemberModal.tsx
│       ├── ImportCSVModal.tsx
│       ├── MemberDetailModal.tsx
│       ├── MemberFilters.tsx
│       └── PhoneInput.tsx
└── api/
    └── member.api.ts
```

**Verification:**

```bash
# Navigate to /dashboard/members
# Click "Add Member"
# Fill form and submit
# See new member in list
# Click "Import CSV"
# Upload test CSV with 10 members
# See import summary
# Filter by group
# Search for member
# Click member to see details
# Edit member info
```

**Success Criteria:**
- [ ] Member list displays correctly
- [ ] Can add single member
- [ ] Phone formatting works
- [ ] CSV import works
- [ ] CSV preview shows before import
- [ ] Import errors display clearly
- [ ] Search and filtering work
- [ ] Member details modal works
- [ ] Bulk actions work
- [ ] Pagination works
- [ ] Events tracked

---

#### Task 5.5: Communication Settings Page
**Time Estimate:** 1 hour
**Complexity:** Low

**Claude Code Prompt:**

```
Create the communication settings page for Connect YW.

PAGE: /frontend/src/pages/dashboard/settings/CommunicationSettingsPage.tsx
Route: /dashboard/settings/communication

SETTINGS:

1. Communication Mode
- Toggle switch: "1-Way" / "2-Way"
- Explanation:
  - 1-Way: "Members cannot reply to messages. Best for announcements."
  - 2-Way: "Members can reply to messages. You'll see replies in your inbox."
- Save button
- Track "communication_mode_toggled" event

2. Twilio Connection Status
- Card showing:
  - Connection status (Connected / Not Connected)
  - Phone number (if connected)
  - Account SID (last 4 digits)
  - Connection date
- Actions:
  - Reconnect button
  - Disconnect button (PRIMARY only)
  - Test SMS button (sends test to admin's phone)

3. Welcome Messages
- Enable/disable globally (affects all new groups)
- Default welcome message template
- Preview: "New groups will use this default message"

4. Message Settings
- Auto-include opt-out text: "Reply STOP to unsubscribe"
- Add church signature: "- [Church Name]"
- Character limit warnings enabled

5. Opt-Out Settings
- Handle STOP replies automatically (always enabled for compliance)
- Handle START replies (opt back in)
- Handle HELP replies (send help text)

API ENDPOINT:
PUT /api/churches/:id/settings
Request:
{
  "communicationMode": "ONE_WAY" | "TWO_WAY",
  "defaultWelcomeMessage": string,
  "autoIncludeOptOut": boolean,
  "addChurchSignature": boolean
}

BACKEND UPDATE:
Add fields to Church model (if not already there):
- defaultWelcomeMessage
- autoIncludeOptOut
- addChurchSignature

Create settings service method:
updateChurchSettings(churchId, settings)

Use React Hook Form for form management.
Save button with loading state.
Success message after save.
```

**Expected Files:**

```
frontend/src/pages/dashboard/settings/
└── CommunicationSettingsPage.tsx

backend/src/
├── routes/
│   └── settings.routes.ts
├── controllers/
│   └── settings.controller.ts
└── services/
    └── settings.service.ts
```

**Verification:**

```bash
# Navigate to /dashboard/settings/communication
# Toggle 1-way/2-way mode
# Save changes
# Send test message
# Reply to message (if 2-way)
# Check reply appears in inbox
# Toggle back to 1-way
# Reply to message
# Verify reply ignored
```

**Success Criteria:**
- [ ] Communication mode toggle works
- [ ] Settings save successfully
- [ ] Twilio status displays correctly
- [ ] Test SMS button works
- [ ] Welcome message settings save
- [ ] Events tracked

---

#### Task 5.6: Week 1 Integration Testing
**Time Estimate:** 2 hours
**Complexity:** High

**Context:**
Test all Week 1 features together end-to-end. This is critical to catch integration issues before moving to Week 2.

**Testing Checklist:**

```
WEEK 1 INTEGRATION TEST SCENARIOS:

Test 1: Complete Registration & Onboarding Flow (20 min)
1. Register new church account
   - Verify church and admin records created
   - Verify 14-day trial set correctly
   - Verify Stripe customer created
2. Complete 6-step onboarding wizard
   - Update church profile
   - Connect Twilio (use test credentials)
   - Create first branch
   - Create first group
   - Import 5 members via CSV
   - Send first test message
3. Verify landing on dashboard
4. Check all PostHog events fired

Expected Events:
- user_signed_up
- onboarding_started
- onboarding_step_completed (x6)
- church_profile_completed
- twilio_connected
- branch_created
- group_created
- member_bulk_imported
- message_sent
- onboarding_completed

Test 2: Multi-Branch Workflow (15 min)
1. Create 2 additional branches (3 total)
2. Create 3 groups in each branch (9 groups total)
3. Import 10 members into each group
4. Switch between branches
   - Verify groups filter correctly
   - Verify members filter correctly
5. View branch analytics
   - Verify stats accurate per branch
6. Try to create 4th branch on STARTER plan
   - Verify limit error shown
   - Verify upgrade prompt displayed

Test 3: Messaging Workflow (20 min)
1. Send message to single group
   - Verify message received on phone
   - Verify delivery status updates
   - Verify message in history
2. Send message to multiple groups
   - Verify deduplication (if member in both groups)
   - Verify all recipients receive
3. Send message to specific branch
   - Verify only that branch's members receive
4. Send message to all members
   - Verify count correct
5. Schedule message for 5 minutes from now
   - Wait and verify it sends
6. Toggle to 2-way mode
   - Send message
   - Reply from phone
   - Verify reply appears in inbox
7. Toggle to 1-way mode
   - Send message
   - Reply from phone
   - Verify reply ignored

Test 4: Co-Admin Workflow (15 min)
1. As PRIMARY admin, invite co-admin
   - Verify email sent
2. Open invite link in incognito window
3. Accept invite and set password
4. Login as co-admin
   - Verify full dashboard access
   - Verify can send messages
   - Verify can manage members
   - Verify CANNOT see admin management page
   - Verify CANNOT manage billing (Week 3)
5. As PRIMARY, remove co-admin
   - Verify co-admin loses access
6. Try to invite 2nd co-admin on STARTER plan
   - Verify limit error

Test 5: Member Management (15 min)
1. Add single member manually
   - Verify welcome message sent (if enabled)
2. Import CSV with 20 members
   - Include some invalid rows
   - Verify import summary correct
   - Verify errors shown for invalid rows
3. Search for member by name
4. Search for member by phone
5. Filter by group
6. Edit member details
7. Remove member from group
8. Opt out member
   - Verify status changes
   - Verify excluded from future messages
9. Opt in member again

Test 6: Authentication & Security (10 min)
1. Test password reset flow
2. Test invalid login credentials
3. Test expired JWT (manually expire or wait)
4. Test refresh token flow
5. Test protected route access without auth

Test 7: Database Integrity (10 min)
1. Open Prisma Studio
2. Verify all relationships correct:
   - Church → Branches → Groups → GroupMembers → Members
   - Church → Admins
   - Church → Messages → MessageRecipients → Members
   - Church → Subscription
3. Verify cascade deletes:
   - Delete a group → verify GroupMembers deleted
   - Delete a branch → verify Groups and GroupMembers deleted
4. Verify no orphaned records

Test 8: Error Handling (10 min)
1. Test with invalid Twilio credentials
2. Test sending message with no Twilio connected
3. Test creating branch beyond plan limit
4. Test creating group beyond 30 limit
5. Test invalid phone numbers
6. Test malformed CSV import
7. Test network errors (disconnect internet briefly)

BUGS TO WATCH FOR:
- Duplicate phone numbers causing multiple SMS sends
- Welcome messages sent multiple times
- Trial expiry not working
- Branch filtering not applying
- Events not tracking
- Cascade deletes not working
- Co-admin permissions too broad or too narrow
- Message delivery status not updating
- Reply inbox not showing replies
```

**Bug Tracking:**
Create a simple bug list:

```markdown
# Week 1 Bugs Found

## Critical (Must Fix Before Week 2)
1. [Bug description] - Status: Fixed/Open
2. ...

## Medium (Should Fix)
1. ...

## Low (Nice to Fix)
1. ...
```

**Performance Check:**
- Page load times < 2 seconds
- API response times < 500ms
- Database queries optimized (use EXPLAIN in PostgreSQL)
- No N+1 query problems

**Verification:**

```bash
# Run all tests manually
# Document any issues found
# Fix critical bugs before proceeding to Week 2
# Commit all fixes
```

**Success Criteria:**
- [ ] All 8 test scenarios pass
- [ ] All critical bugs fixed
- [ ] Performance acceptable
- [ ] Database integrity verified
- [ ] Security checks pass
- [ ] All events tracking correctly

---

### End of Day 5 & Week 1 Checklist

**Week 1 Completed Features:**
- [ ] Complete authentication system
- [ ] Church registration and onboarding wizard
- [ ] Multi-branch management (3-10 branches based on plan)
- [ ] Group management (30 per branch)
- [ ] Member management with CSV import
- [ ] Twilio integration
- [ ] SMS sending (individual, groups, branches, all)
- [ ] Message scheduling
- [ ] Message history
- [ ] 1-way/2-way communication modes
- [ ] Reply inbox
- [ ] Co-admin system (1+3)
- [ ] Plan limits enforcement
- [ ] Trial management
- [ ] Welcome messages

**Database Status:**
- [ ] All 11+ tables created
- [ ] All relationships working
- [ ] Cascade deletes working
- [ ] Indexes created

**API Status:**
- [ ] ~30 endpoints created
- [ ] All CRUD operations working
- [ ] Proper error handling
- [ ] Validation working
- [ ] Events tracked

**Frontend Status:**
- [ ] 15+ pages created
- [ ] All forms working
- [ ] Mobile responsive
- [ ] Error handling
- [ ] Loading states

**Git Commit:**
```bash
git add .
git commit -m "Week 1 complete: Foundation & Core Infrastructure

- Complete authentication and authorization
- Church onboarding wizard (6 steps)
- Multi-branch management with plan limits
- Group management (30 per branch)
- Member management with CSV import
- Twilio SMS integration
- Message sending and scheduling
- Reply inbox for 2-way communication
- Co-admin invitation system
- Trial management with 14-day countdown
- All Week 1 features integration tested

Database: 11 tables, all relationships working
API: 30+ endpoints, all tested
Frontend: 15+ pages, mobile responsive
Events: 25+ PostHog events tracking

Ready for Week 2: Advanced messaging features"

git push origin development
```

**Week 1 Retrospective:**

*What went well:*
- List 3-5 things

*What was challenging:*
- List 3-5 challenges

*Adjustments for Week 2:*
- List any changes needed to timeline or approach

**If Behind Schedule (>1 day):**
Priority cuts for Week 2:
- Skip message templates
- Simplify analytics dashboard
- Defer automated recurring messages
- Focus on core messaging features only

**Weekend Prep for Week 2:**
- [ ] Review Week 2 plan
- [ ] Set up any additional accounts needed
- [ ] Fix any remaining non-critical bugs
- [ ] Rest and prepare for intensive week

---

## WEEK 2: MESSAGING & GROUP FEATURES

### Week 2 Overview
**Goal:** Complete advanced messaging features and enhance member management
**Hours:** 40-50 hours
**Days:** 6-10

**Deliverables:**
- Message templates and recurring messages
- Enhanced member profiles and segmentation
- Advanced analytics dashboard
- Message scheduling improvements
- Automated workflows
- Performance optimizations

### Week 2 Daily Breakdown

**Day 6:** Message templates, recurring messages
**Day 7:** Enhanced member management and segmentation
**Day 8:** Analytics dashboard with visualizations
**Day 9:** Automated workflows and triggers
**Day 10:** Performance optimization and Week 2 testing

---

## DAY 6: MESSAGE TEMPLATES & RECURRING MESSAGES
**Target Hours:** 8-10 hours
**Goal:** Add message templates and recurring message scheduling

### Morning Session (5 hours)

#### Task 6.1: Message Templates API
**Time Estimate:** 2 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Create a message template system for Connect YW to help admins reuse common messages.

DATABASE SCHEMA:
Add new model to Prisma schema:

model MessageTemplate {
  id          String   @id @default(cuid())
  churchId    String
  name        String
  content     String
  category    String?  // "service_reminder", "event", "prayer", "thank_you", custom"
  isDefault   Boolean  @default(false)  // System-provided templates
  usageCount  Int      @default(0)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  church      Church   @relation(fields: [churchId], references: [id], onDelete: Cascade)

  @@index([churchId])
}

Run migration to add table.

ENDPOINTS:

1. GET /api/churches/:churchId/templates
Authorization: JWT required

Response:
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": string,
        "name": string,
        "content": string,
        "category": string,
        "usageCount": number,
        "createdBy": string,
        "createdAt": ISO8601
      }
    ]
  }
}

2. POST /api/churches/:churchId/templates
Authorization: JWT required

Request:
{
  "name": string (required),
  "content": string (required),
  "category": string (optional)
}

Track "template_created" PostHog event.

3. PUT /api/templates/:id
Authorization: JWT required

Request: Partial update
Track "template_edited" event.

4. DELETE /api/templates/:id
Authorization: JWT required
Track "template_deleted" event.

5. POST /api/templates/:id/use
Authorization: JWT required
Increments usageCount
Track "template_used" event.

SEED DEFAULT TEMPLATES:
Create /backend/prisma/seeds/templates.seed.ts

Default templates:
1. Service Reminder: "Join us this Sunday at [time] for worship service at [location]."
2. Event Announcement: "You're invited to [event name] on [date] at [time]. RSVP: [link]"
3. Prayer Request: "Please join us in praying for [prayer need]. Reply with your prayers."
4. Thank You: "Thank you for serving with us! Your dedication makes a difference."
5. Welcome: "Welcome to [church name]! We're excited to have you join our community."
6. Offering Reminder: "Thank you for your faithful giving. You can give online at [link]"

Each template should have placeholders: [church name], [date], [time], [location], [event name]

Implement all endpoints and seed templates now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── template.routes.ts
├── controllers/
│   └── template.controller.ts
├── services/
│   └── template.service.ts
└── prisma/
    ├── schema.prisma (updated)
    └── seeds/
        └── templates.seed.ts
```

**Verification:**

```bash
# Run migration
cd backend
npx prisma migrate dev --name add_message_templates

# Seed templates
npx prisma db seed

# List templates
curl -X GET http://localhost:3000/api/churches/[churchId]/templates \
  -H "Authorization: Bearer [token]"

# Create custom template
curl -X POST http://localhost:3000/api/churches/[churchId]/templates \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Youth Group Reminder",
    "content": "Youth group tonight at 7pm! See you there!",
    "category": "event"
  }'
```

**Success Criteria:**
- [ ] Templates table created
- [ ] Default templates seeded
- [ ] Can create custom template
- [ ] Can edit template
- [ ] Can delete template
- [ ] Usage count increments
- [ ] Events tracked

---

#### Task 6.2: Recurring Messages API
**Time Estimate:** 2 hours
**Complexity:** High

**Claude Code Prompt:**

```
Create a recurring message system for Connect YW to automate repetitive messages.

DATABASE SCHEMA:
Add new model to Prisma schema:

model RecurringMessage {
  id                String              @id @default(cuid())
  churchId          String
  name              String
  content           String
  targetType        String
  targetIds         String[]

  // Recurrence settings
  frequency         String              // "daily", "weekly", "monthly"
  dayOfWeek         Int?                // 0-6 for weekly (0 = Sunday)
  dayOfMonth        Int?                // 1-31 for monthly
  timeOfDay         String              // "HH:MM" format (e.g., "10:00")
  timezone          String              // "America/Los_Angeles"

  isActive          Boolean             @default(true)
  nextSendAt        DateTime?
  lastSentAt        DateTime?

  createdBy         String
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  church            Church              @relation(fields: [churchId], references: [id], onDelete: Cascade)

  @@index([churchId])
  @@index([nextSendAt])
  @@index([isActive])
}

Run migration.

ENDPOINTS:

1. GET /api/churches/:churchId/recurring-messages
Authorization: JWT required

Response:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": string,
        "name": string,
        "content": string (preview),
        "frequency": string,
        "isActive": boolean,
        "nextSendAt": ISO8601,
        "lastSentAt": ISO8601,
        "createdAt": ISO8601
      }
    ]
  }
}

2. POST /api/churches/:churchId/recurring-messages
Authorization: JWT required

Request:
{
  "name": string (required, e.g., "Sunday Service Reminder"),
  "content": string (required),
  "targetType": string (required),
  "targetIds": string[] (required),
  "frequency": "daily" | "weekly" | "monthly" (required),
  "dayOfWeek": number (0-6, required if weekly),
  "dayOfMonth": number (1-31, required if monthly),
  "timeOfDay": string (required, "HH:MM"),
  "timezone": string (default: "America/Los_Angeles")
}

Business Logic:
- Calculate nextSendAt based on frequency and current time
- Validate dayOfWeek/dayOfMonth based on frequency
- Track "recurring_message_created" PostHog event

Response (201 Created):
{
  "success": true,
  "data": {
    "id": string,
    "nextSendAt": ISO8601,
    // ... full recurring message
  }
}

3. PUT /api/recurring-messages/:id
Authorization: JWT required

Request: Partial update
Recalculate nextSendAt if schedule changed.
Track "recurring_message_edited" event.

4. PUT /api/recurring-messages/:id/toggle
Authorization: JWT required
Toggles isActive between true/false.
Track "recurring_message_toggled" event.

5. DELETE /api/recurring-messages/:id
Authorization: JWT required
Track "recurring_message_deleted" event.

CRON JOB:
Create /backend/src/jobs/recurringMessages.job.ts

Process:
- Runs every minute
- Finds RecurringMessage records where:
  - isActive = true
  - nextSendAt <= now
- For each:
  - Create regular Message record
  - Queue message send
  - Calculate next send time based on frequency
  - Update lastSentAt and nextSendAt
  - Track "recurring_message_sent" event

Next Send Calculation:
- Daily: Add 1 day to nextSendAt
- Weekly: Add 7 days to nextSendAt
- Monthly: Add 1 month to nextSendAt (handle month-end edge cases)

TIMEZONE HANDLING:
Use moment-timezone library for correct timezone handling.
Calculate nextSendAt in church's timezone.

Implement all endpoints, cron job, and timezone logic now.
```

**Expected Files:**

```
backend/src/
├── routes/
│   └── recurringMessage.routes.ts
├── controllers/
│   └── recurringMessage.controller.ts
├── services/
│   └── recurringMessage.service.ts
├── jobs/
│   └── recurringMessages.job.ts
└── prisma/
    └── schema.prisma (updated)
```

**Verification:**

```bash
# Run migration
npx prisma migrate dev --name add_recurring_messages

# Create recurring message (weekly, Sunday at 9am)
curl -X POST http://localhost:3000/api/churches/[churchId]/recurring-messages \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunday Service Reminder",
    "content": "Join us for worship this Sunday at 10am!",
    "targetType": "all",
    "targetIds": [],
    "frequency": "weekly",
    "dayOfWeek": 0,
    "timeOfDay": "09:00",
    "timezone": "America/Los_Angeles"
  }'

# List recurring messages
curl -X GET http://localhost:3000/api/churches/[churchId]/recurring-messages \
  -H "Authorization: Bearer [token]"

# For testing: manually set nextSendAt to now
# Wait for cron job to fire (check logs)
# Verify message sent
# Verify nextSendAt updated to next week
```

**Success Criteria:**
- [ ] Recurring messages table created
- [ ] Can create recurring message
- [ ] nextSendAt calculated correctly
- [ ] Cron job sends messages on schedule
- [ ] nextSendAt updates after send
- [ ] Can pause/resume recurring message
- [ ] Timezone handling correct
- [ ] Events tracked

---

#### Task 6.3: Template & Recurring Message UI
**Time Estimate:** 1 hour
**Complexity:** Low

**Claude Code Prompt:**

```
Create UI for message templates and recurring messages in Connect YW.

COMPONENT 1: Template Selector
/frontend/src/components/messages/TemplateSelector.tsx

Integrate into SendMessagePage:
- Dropdown: "Use Template"
- Lists all templates (default + custom)
- Click template → fills message textarea
- Shows template preview on hover
- "Create New Template" button

COMPONENT 2: Save as Template Button
In SendMessagePage composer:
- "Save as Template" button below message textarea
- Opens modal to name template and set category
- Saves current message as new template

COMPONENT 3: Template Management Page
/frontend/src/pages/dashboard/TemplatesPage.tsx
Route: /dashboard/templates

Features:
- List all templates (default + custom)
- Card layout showing:
  - Template name
  - Content preview (first 100 chars)
  - Category badge
  - Usage count
  - Edit/Delete buttons (only for custom templates)
- Create New Template button
- Search templates

COMPONENT 4: Recurring Messages Page
/frontend/src/pages/dashboard/RecurringMessagesPage.tsx
Route: /dashboard/recurring-messages

Features:
- List recurring messages
- Each item shows:
  - Name
  - Content preview
  - Frequency badge (Daily/Weekly/Monthly)
  - Next send time with countdown
  - Last sent time
  - Active/Paused toggle
  - Edit/Delete buttons

- Create New Recurring Message button
  Opens modal with:
  - Name
  - Message content (with template selector)
  - Recipient selection (same as SendMessagePage)
  - Frequency dropdown
  - Day picker (based on frequency)
  - Time picker
  - Timezone selector

- Empty state: "Set up automated messages"

Add to sidebar navigation:
- Under "Messaging" section
- "Templates" menu item
- "Recurring Messages" menu item

Implement all components and pages now.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       ├── TemplatesPage.tsx
│       └── RecurringMessagesPage.tsx
├── components/
│   └── messages/
│       ├── TemplateSelector.tsx
│       ├── SaveTemplateModal.tsx
│       ├── RecurringMessageForm.tsx
│       └── RecurringMessageCard.tsx
└── api/
    ├── template.api.ts
    └── recurringMessage.api.ts
```

**Verification:**

```bash
# Navigate to /dashboard/templates
# See default templates
# Create custom template
# Navigate to /dashboard/send
# Click "Use Template"
# Select template
# Verify textarea fills
# Save current message as new template

# Navigate to /dashboard/recurring-messages
# Create recurring message
# Set to weekly, Sunday 9am
# See next send countdown
# Toggle active/pause
# Edit recurring message
```

**Success Criteria:**
- [ ] Template selector works in composer
- [ ] Can save message as template
- [ ] Template management page functional
- [ ] Can create recurring message
- [ ] Frequency and timing options work
- [ ] Next send countdown accurate
- [ ] Can pause/resume recurring messages
- [ ] Events tracked

---

### Afternoon Session (5 hours)

#### Task 6.4: Message Analytics Enhancement
**Time Estimate:** 2 hours
**Complexity:** Medium

**Claude Code Prompt:**

```
Enhance message analytics for Connect YW with more detailed insights.

API ENDPOINT:
GET /api/analytics/messages
Authorization: JWT required
Query params:
- period: "7days" | "30days" | "90days" | "all"
- branchId: string (optional)

Response:
{
  "success": true,
  "data": {
    "overview": {
      "totalMessagesSent": number,
      "totalRecipients": number,
      "averageDeliveryRate": number (percentage),
      "averageReplyRate": number (percentage),
      "totalCost": number (estimated)
    },
    "messagesByDay": [
      { "date": "2025-10-22", "count": number }
    ],
    "messagesByHour": [
      { "hour": number, "count": number }
    ],
    "replyRatesByWeek": [
      { "week": "2025-W43", "rate": number }
    ],
    "topPerformingGroups": [
      {
        "groupName": string,
        "messagesSent": number,
        "averageReplyRate": number
      }
    ],
    "deliveryRatesByCarrier": [
      { "carrier": string, "rate": number }
    ],
    "engagementScore": number (0-100, calculated metric)
  }
}

ENGAGEMENT SCORE CALCULATION:
Algorithm:
- Delivery rate weight: 40%
- Reply rate weight: 40%
- Message frequency weight: 20%
- Score = (deliveryRate * 0.4) + (replyRate * 0.4) + (frequencyScore * 0.2)
- Frequency score: 100 if sending 4+ messages/week, scaled down below that

FRONTEND PAGE:
/frontend/src/pages/dashboard/AnalyticsPage.tsx
Route: /dashboard/analytics

Layout:
1. Period Selector
- Buttons: 7 days / 30 days / 90 days / All Time
- Date range picker (custom)

2. Overview Cards
- Total Messages Sent (with trend arrow)
- Average Delivery Rate (with progress circle)
- Average Reply Rate (with progress circle)
- Engagement Score (with gauge chart)

3. Message Volume Chart
- Line chart showing messages per day
- Use recharts library

4. Message Timing Heatmap
- Shows best times to send (by hour and day)
- Color-coded by engagement

5. Group Performance Table
- Lists all groups
- Columns: Group, Messages Sent, Delivery Rate, Reply Rate
- Sortable

6. Branch Comparison (if multi-branch)
- Bar chart comparing branches
- Metrics: messages sent, reply rate

7. Insights Section
- Auto-generated insights:
  - "Your reply rate increased 15% this week!"
  - "Tuesday at 10am has the highest engagement"
  - "Youth Ministry has the highest reply rate (22%)"

Use recharts for all visualizations.
Auto-refresh data every 5 minutes.
Export to CSV button.
```

**Expected Files:**

```
frontend/src/
├── pages/
│   └── dashboard/
│       └── AnalyticsPage.tsx
├── components/
│   └── analytics/
│       ├── OverviewCards.tsx
│       ├── MessageVolumeChart.tsx
│       ├── TimingHeatmap.tsx
│       ├── GroupPerformanceTable.tsx
│       └── InsightsPanel.tsx
└── api/
    └── analytics.api.ts
```

**Verification:**

```bash
# Navigate to /dashboard/analytics
# See all charts rendering
# Change period to 30 days
# Verify data updates
# Click on chart data points
# Export to CSV
```

**Success Criteria:**
- [ ] Analytics endpoint returns correct data
- [ ] Engagement score calculates correctly
- [ ] All charts render
- [ ] Period selector updates data
- [ ] Branch filter works
- [ ] Insights auto-generate
- [ ] Export to CSV works

---

*(Continuing in next message due to length...)*

## DAYS 7-10: COMPLETING WEEK 2

### DAY 7: Enhanced Member Management & Segmentation
**Goal:** Member tags, segments, and advanced filtering

**Morning Tasks (5 hours):**

**Task 7.1: Member Tags System (2h)**
```
Add member tagging for segmentation:

DATABASE: Add tags column to Member model (already there as String[])

API Endpoints:
- PUT /api/members/:id/tags - Add/remove tags
- GET /api/churches/:churchId/tags - Get all unique tags

Frontend:
- Tag input component (type and add tags)
- Filter members by tags
- Bulk tag operation
```

**Task 7.2: Member Segments (2h)**
```
Create saved member segments:

DATABASE: New SegmentModel:
- name, conditions (JSON), memberCount, churchId

Conditions examples:
- "All opted-in members"
- "Members in Youth Ministry"
- "Members added in last 30 days"
- "Members who replied to messages"

API: CRUD endpoints for segments
Frontend: Segment builder UI
```

**Task 7.3: Member Import Enhancements (1h)**
- Duplicate detection options (skip/update/create)
- Import history log
- Validation improvements

**Afternoon Tasks (5 hours):**

**Task 7.4: Member Activity Tracking (2h)**
- Last message received date
- Total messages received count
- Reply history
- Engagement score per member

**Task 7.5: Member Export (1h)**
- Export to CSV with filters
- Include all member data
- Export by segment

**Task 7.6: Member Profile Page (2h)**
- Dedicated page for each member
- Full history of messages
- Groups memberships
- Activity timeline
- Notes section for admins

---

### DAY 8: Advanced Analytics Dashboard
**Goal:** Complete analytics with PostHog integration

**Morning Tasks (5 hours):**

**Task 8.1: PostHog Integration Setup (1h)**
```
Complete PostHog client setup:

Backend:
- Initialize PostHog client in services/analytics.service.ts
- Create helper methods for all 65 events
- Batch events for performance

Frontend:
- Initialize PostHog in App.tsx
- Create useAnalytics hook
- Track page views automatically
```

**Task 8.2: Implement All 65 PostHog Events (3h)**
```
Go through every feature and add event tracking:

Authentication events (10): ✓ (Done in Week 1)
Multi-branch events (6): ✓ (Done in Week 1)
Group & Member events (12): Add remaining events
Messaging events (15): Add remaining events
Communication settings (4): Add all events
Co-admin events (5): ✓ (Done in Week 1)
Billing events (8): Add in Week 3
Support events (5): Add in Week 4

Use the complete PostHog events catalog from the guide.
For each event, include all specified properties.
```

**Task 8.3: Analytics Dashboard Visualizations (1h)**
- Complete all charts from Day 6 Task 6.4
- Add drill-down capabilities
- Real-time data updates

**Afternoon Tasks (5 hours):**

**Task 8.4: Reply Rate Tracking Dashboard (2h)**
```
Dedicated reply rate analytics:

API: GET /api/analytics/reply-rates
Returns:
- Overall reply rate trend
- Reply rate by group
- Reply rate by time of day
- Reply rate by message type
- Best performing message content patterns

Frontend:
- Reply rate trends chart
- Group comparison
- Time-of-day heatmap
- Message content insights
```

**Task 8.5: Weekly Message Volume Tracking (1h)**
Track 4+ messages/week pattern (validated in user research):
- Weekly volume chart
- Goal indicator (4 messages)
- Alerts if below target
- Track "weekly_message_count_tracked" event

**Task 8.6: Engagement Scoring (1h)**
- Member engagement scores
- Group engagement scores
- Branch engagement scores
- Recommendations based on scores

**Task 8.7: Export Analytics (1h)**
- Export all analytics to CSV
- PDF report generation
- Email reports (schedule weekly)

---

### DAY 9: Automated Workflows
**Goal:** Automated member onboarding and message triggers

**Morning Tasks (5 hours):**

**Task 9.1: Welcome Message Automation (Already done in Week 1)**
- Review and test thoroughly
- Add customization options
- Delay settings

**Task 9.2: Birthday Messages (2h)**
```
DATABASE: Add birthday field to Member

API & Job:
- Cron job runs daily at 9am
- Finds members with birthday = today
- Sends configured birthday message
- Track "birthday_message_sent" event

Frontend:
- Birthday field in member form
- Birthday message configuration in settings
- Birthday message template
```

**Task 9.3: Anniversary Messages (1h)**
```
Similar to birthdays but for membership anniversary:
- Uses member.createdAt as anniversary date
- Sends on each anniversary
- Configurable template
```

**Task 9.4: Inactivity Alerts (1h)**
```
Alert admins when members haven't been messaged recently:
- Cron job finds members not messaged in 30+ days
- Sends admin notification
- Track "inactivity_alert_sent" event
```

**Task 9.5: Opt-In Reminders (1h)**
```
For opted-out members:
- After 90 days, send email (not SMS) asking to opt back in
- Provide easy opt-in link
- Track conversions
```

**Afternoon Tasks (5 hours):**

**Task 9.6: Message Triggers System (3h)**
```
Create trigger-based messaging:

DATABASE: MessageTrigger model
- triggerType: "new_member", "birthday", "anniversary", "inactivity"
- conditions: JSON
- messageTemplate: string
- targetGroups: string[]
- isActive: boolean

API: CRUD for triggers

Examples:
- When member joins Youth Ministry → send welcome
- When member hasn't been messaged in 30 days → send check-in
- When member replies → add to "Engaged" tag

Frontend:
- Trigger builder UI
- Visual workflow designer (if time permits)
```

**Task 9.7: A/B Testing (If time permits - 2h)**
```
Test different message content:
- Send variant A to 50% of recipients
- Send variant B to 50% of recipients
- Track reply rates for each
- Determine winner
```

---

### DAY 10: Week 2 Wrap-Up & Optimization
**Goal:** Performance optimization and integration testing

**Morning Tasks (5 hours):**

**Task 10.1: Database Query Optimization (2h)**
```
Profile and optimize slow queries:

Tools:
- Use Prisma query logging
- PostgreSQL EXPLAIN ANALYZE
- Identify N+1 queries

Optimizations:
- Add missing indexes
- Use select to limit fields
- Use include efficiently
- Batch queries where possible

Critical endpoints to optimize:
- GET /api/messages/history (pagination)
- GET /api/members (with filters)
- GET /api/analytics/* (aggregations)
```

**Task 10.2: API Response Time Optimization (1h)**
- Implement Redis caching for frequent queries
- Cache analytics data (5 minute TTL)
- Cache member counts
- Cache branch/group lists

**Task 10.3: Frontend Performance (1h)**
- React Query caching configuration
- Lazy load heavy components
- Image optimization
- Bundle size analysis
- Code splitting

**Task 10.4: Background Job Optimization (1h)**
- Review all Bull queues
- Optimize batch sizes
- Add error retry logic
- Monitor queue health

**Afternoon Tasks (5 hours):**

**Task 10.5: Week 2 Integration Testing (3h)**
```
Test all Week 2 features:

1. Message Templates
   - Create template
   - Use template in composer
   - Edit template
   - Delete template

2. Recurring Messages
   - Create weekly recurring
   - Verify sends on schedule
   - Edit schedule
   - Pause/resume
   - Delete

3. Member Segments
   - Create segment
   - Filter members
   - Send to segment
   - Edit segment

4. Analytics
   - View all dashboards
   - Change date ranges
   - Export reports
   - Verify accuracy

5. Automated Workflows
   - Test birthday messages
   - Test welcome messages
   - Test triggers

6. Performance
   - Check page load times (<2s)
   - Check API response times (<500ms)
   - Check database query times
```

**Task 10.6: Bug Fixes (2h)**
- Fix any critical bugs found
- Document minor bugs for later
- Performance tuning adjustments

**End of Week 2 Git Commit:**
```bash
git add .
git commit -m "Week 2 complete: Advanced messaging and analytics

- Message templates (default + custom)
- Recurring message scheduling
- Enhanced member management with tags and segments
- Complete analytics dashboard with visualizations
- 65 PostHog events fully implemented
- Automated workflows (birthday, anniversary, welcome)
- Performance optimizations (caching, query optimization)
- Reply rate tracking and engagement scoring

Ready for Week 3: Billing and polish"

git push origin development
```

---

## WEEK 3: ANALYTICS, BILLING & POLISH

### Week 3 Overview
**Goal:** Production-ready with Stripe billing and polished UI
**Hours:** 40-50 hours
**Days:** 11-15

---

### DAY 11: Stripe Integration
**Goal:** Complete payment processing with 3 pricing tiers

**All Day (8-10 hours):**

**Task 11.1: Stripe Setup (1h)**
- Create Stripe products and prices in dashboard
- STARTER: $49/month - price_xxx
- GROWTH: $79/month - price_yyy
- PRO: $99/month - price_zzz
- Configure webhook endpoint
- Test webhooks with Stripe CLI

**Task 11.2: Stripe Backend Integration (4h)**
```
Complete Stripe service:

/backend/src/services/stripe.service.ts:

Methods:
1. createCustomer(churchId, email, name)
   - Called during registration
   - Saves stripeCustomerId to Church

2. createSubscription(churchId, priceId, paymentMethodId)
   - Creates Stripe subscription
   - Saves to Subscription table
   - Ends trial
   - Track "subscription_created" event

3. updateSubscription(subscriptionId, newPriceId)
   - Upgrade/downgrade plan
   - Prorated billing
   - Track "plan_upgraded" or "plan_downgraded" event

4. cancelSubscription(subscriptionId)
   - Cancel at period end
   - Track "subscription_canceled" event

5. resumeSubscription(subscriptionId)
   - Resume canceled subscription

6. handleWebhook(event)
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.paid
   - invoice.payment_failed

Webhook endpoint: POST /api/webhooks/stripe
- Verify signature
- Handle all events
- Update database accordingly
```

**Task 11.3: Billing API Endpoints (2h)**
```
API Endpoints:

1. POST /api/billing/setup-intent
   - Creates Stripe SetupIntent for payment method
   - Returns client_secret

2. POST /api/billing/subscribe
   Request: { priceId, paymentMethodId }
   - Creates subscription
   - Ends trial

3. PUT /api/billing/upgrade
   Request: { newPlan: "GROWTH" | "PRO" }
   - Changes subscription
   - Prorated billing

4. PUT /api/billing/downgrade
   Request: { newPlan: "STARTER" | "GROWTH" }
   - Schedules change for end of period

5. POST /api/billing/cancel
   - Cancels at period end
   - Keeps access until expiry

6. POST /api/billing/resume
   - Cancels scheduled cancellation

7. GET /api/billing/usage
   - Returns current usage vs limits
   - branch count, member count, message count

8. GET /api/billing/invoices
   - Returns billing history

9. POST /api/billing/update-payment-method
   - Updates payment method
```

**Task 11.4: Stripe Frontend Integration (3h)**
```
Stripe Elements integration:

Install: @stripe/stripe-js, @stripe/react-stripe-js

Pages:

1. /frontend/src/pages/dashboard/settings/BillingPage.tsx
   - Current plan display
   - Usage indicators
   - Payment method display
   - Billing history table
   - Cancel subscription button

2. /frontend/src/pages/billing/SubscribePage.tsx
   - Pricing table (3 plans)
   - Feature comparison
   - Select plan button
   - Stripe payment form
   - Subscribe button

3. /frontend/src/components/billing/UpgradeModal.tsx
   - Triggered when limits reached
   - Shows plan comparison
   - "Upgrade Now" CTAs

Components:

1. PaymentMethodForm
   - Stripe CardElement
   - Address fields
   - Submit button

2. PricingTable
   - 3 columns (Starter, Growth, Pro)
   - Feature lists
   - Current plan indicator
   - Upgrade/Downgrade buttons

3. UsageIndicators
   - Progress bars for branches, members, messages
   - "X of Y" text
   - Warning colors when approaching limits

Implement Stripe.js, payment forms, and all billing pages.
```

---

### DAY 12: Trial & Subscription Management
**Goal:** Complete trial-to-paid conversion flow

**Morning Tasks (5 hours):**

**Task 12.1: Trial Countdown Component (1h)**
- Prominent display on dashboard
- Color-coded warnings (green→yellow→red)
- Days remaining
- "Subscribe Now" CTA

**Task 12.2: Trial Expiry Handling (2h)**
```
When trial expires:

1. Disable messaging functionality
   - Block message sends
   - Show "Trial Expired" modal
   - Cannot be dismissed

2. Keep dashboard accessible (read-only)
   - Can view history
   - Can view members
   - Cannot add/edit/send

3. Email notifications
   - 7 days before expiry
   - 3 days before expiry
   - 1 day before expiry
   - On expiry day

4. Grace period (3 days)
   - Account not deleted immediately
   - All data retained
   - Easy reactivation

Implement middleware: requireActiveSubscription
Apply to message-sending endpoints
```

**Task 12.3: Subscription Flow Testing (2h)**
```
Test complete flow:
1. New church registers → 14-day trial starts
2. Complete onboarding
3. Use platform during trial
4. Receive trial reminder emails
5. Subscribe before expiry
   - Enter payment details
   - Select plan
   - Confirm subscription
6. Trial ends, subscription activates
7. First invoice generated
8. Test upgrade flow
9. Test downgrade flow
10. Test cancellation flow
```

**Afternoon Tasks (5 hours):**

**Task 12.4: Plan Limit Enforcement (3h)**
```
Strict enforcement of plan limits:

Middleware: checkPlanLimits(limitType)

Limits to enforce:
1. Branch creation
   - STARTER: 1, GROWTH: 5, PRO: 10
   - Block creation if at limit
   - Show upgrade modal

2. Co-admin invitations
   - STARTER: 1, GROWTH: 3, PRO: 3
   - Block if at limit

3. Member additions
   - STARTER: 500, GROWTH: 2000, PRO: unlimited
   - Warning at 80%
   - Block at 100%

4. Message sending
   - STARTER: 1000/month, GROWTH: 5000/month, PRO: unlimited
   - Track per billing period
   - Block if exceeded
   - Reset on billing renewal

Apply checks to all relevant endpoints.
Show clear upgrade CTAs when limits reached.
Track limit_reached events in PostHog.
```

**Task 12.5: Usage Tracking Dashboard (1h)**
- Real-time usage displays
- Historical usage charts
- Projection: "At current rate, you'll reach limit on [date]"

**Task 12.6: Billing Email Notifications (1h)**
```
Email templates:
- Trial started
- Trial ending soon (7, 3, 1 days)
- Trial expired
- Subscription successful
- Payment successful
- Payment failed
- Subscription canceled
- Subscription resumed

Use SendGrid or similar for transactional emails.
```

---

### DAY 13: UI/UX Polish
**Goal:** Professional, polished interface

**Morning Tasks (5 hours):**

**Task 13.1: Design System (2h)**
```
Create consistent design system:

/frontend/src/styles/theme.ts:
- Color palette (church-friendly colors)
- Typography scale
- Spacing scale
- Border radius
- Shadow depths

Components:
- Button variants (primary, secondary, danger, ghost)
- Input components (text, textarea, select, checkbox, radio)
- Card component
- Modal component
- Toast notifications
- Loading skeletons
- Empty states
- Error states

Update all existing components to use design system.
```

**Task 13.2: Responsive Design Audit (1h)**
- Test all pages on mobile (375px width)
- Test on tablet (768px)
- Test on desktop (1920px)
- Fix any layout issues
- Ensure touch-friendly buttons (min 44px)

**Task 13.3: Loading States (1h)**
- Skeleton loaders for all data fetching
- Spinner for button actions
- Progress bars for uploads
- Loading overlays for page transitions

**Task 13.4: Error Handling UI (1h)**
- Toast notifications for errors
- Inline form validation errors
- Error boundaries for React components
- 404 page
- 500 error page
- Network error handling

**Afternoon Tasks (5 hours):**

**Task 13.5: Accessibility (2h)**
```
WCAG 2.1 AA compliance:

1. Keyboard navigation
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order
   - Escape key closes modals

2. Screen reader support
   - Semantic HTML
   - ARIA labels where needed
   - Alt text for images
   - Form labels

3. Color contrast
   - Text: minimum 4.5:1 ratio
   - UI elements: minimum 3:1
   - Test with contrast checker

4. Form accessibility
   - Labels for all inputs
   - Error announcements
   - Required field indicators

Use react-aria or similar library.
```

**Task 13.6: Micro-interactions (1h)**
- Button hover states
- Smooth transitions
- Success animations
- Confirmation feedback
- Progress indicators

**Task 13.7: Onboarding Improvements (1h)**
- Add helpful tooltips
- Progress indicators clearer
- Skip options more obvious
- Success celebrations
- Better error recovery

**Task 13.8: Empty States (1h)**
- Meaningful illustrations (use unDraw or similar)
- Clear CTAs
- Helpful guidance
- No blank pages ever

---

### DAY 14: Testing & Quality Assurance
**Goal:** Comprehensive testing coverage

**Morning Tasks (5 hours):**

**Task 14.1: Unit Tests (3h)**
```
Critical functions to test:

Backend:
- JWT token generation/verification
- Password hashing/comparison
- Phone number formatting
- CSV parsing
- Message recipient resolution
- Engagement score calculation
- Next send time calculation (recurring messages)

Use Jest for testing.
Aim for 70%+ coverage on critical paths.
```

**Task 14.2: Integration Tests (2h)**
```
API endpoint tests:

Use supertest library.

Critical endpoints:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/messages/send
- POST /api/groups/:id/members/import
- POST /api/billing/subscribe
- All webhook endpoints

Test success cases and error cases.
```

**Afternoon Tasks (5 hours):**

**Task 14.3: End-to-End Tests (3h)**
```
Use Playwright or Cypress.

Critical user flows:
1. Registration → Onboarding → Send Message
2. Login → Import Members → Send to Group
3. Create Branch → Create Group → Add Members
4. Subscribe → Upgrade Plan
5. Invite Co-Admin → Accept Invite → Login
6. Create Recurring Message → Verify Sends
7. 2-Way Communication → Reply → View Reply

Write tests for top 5 most critical flows.
```

**Task 14.4: Security Testing (1h)**
```
Security checks:

1. SQL Injection
   - Test with malicious inputs
   - Prisma prevents this, but verify

2. XSS
   - Test with script tags in inputs
   - Verify sanitization

3. CSRF
   - Verify CSRF tokens working
   - Test cross-origin requests

4. Authentication
   - Test expired tokens
   - Test invalid tokens
   - Test missing tokens

5. Authorization
   - Test accessing other church's data
   - Test co-admin accessing PRIMARY-only features

6. Rate Limiting
   - Test rapid requests
   - Verify rate limits apply

Use OWASP guidelines.
```

**Task 14.5: Load Testing (1h)**
```
Use Artillery or k6.

Scenarios:
1. 100 concurrent users browsing dashboard
2. 50 concurrent message sends
3. 1000 member CSV import
4. 100 concurrent API requests

Ensure:
- Response times stay <2s
- No crashes
- Database handles load
- Queues don't overflow
```

---

### DAY 15: Week 3 Wrap-Up & Documentation
**Goal:** Production-ready deployment preparation

**Morning Tasks (5 hours):**

**Task 15.1: Environment Configuration (1h)**
```
Prepare for deployment:

1. Backend environment variables
   - Production DATABASE_URL
   - Production Twilio credentials
   - Production Stripe keys
   - Production PostHog key
   - Strong JWT secrets
   - CORS_ORIGIN (production frontend URL)

2. Frontend environment variables
   - VITE_API_URL (production API)
   - VITE_POSTHOG_KEY
   - VITE_STRIPE_PUBLISHABLE_KEY

3. Create .env.production.example files
```

**Task 15.2: Database Migration Strategy (1h)**
```
Production migration plan:

1. Backup strategy
   - Automated daily backups
   - Point-in-time recovery
   - Backup retention policy

2. Migration execution
   - Run migrations on deploy
   - Rollback plan
   - Zero-downtime migrations

3. Seed production data
   - Default message templates
   - System settings
```

**Task 15.3: Monitoring Setup (1h)**
```
Set up monitoring:

1. Error Tracking: Sentry
   - Install @sentry/node and @sentry/react
   - Configure DSN
   - Test error reporting

2. Uptime Monitoring: UptimeRobot or similar
   - Monitor homepage
   - Monitor API health endpoint
   - Alert on downtime

3. Performance Monitoring
   - New Relic or DataDog (if budget allows)
   - Or use PostHog performance monitoring

4. Log Aggregation
   - Winston logger in backend
   - Log to file + console
   - Rotate logs daily
```

**Task 15.4: API Documentation (1h)**
```
Create API documentation:

Use Swagger/OpenAPI:

1. Install swagger-jsdoc and swagger-ui-express
2. Document all endpoints with JSDoc comments
3. Generate Swagger UI at /api/docs
4. Include request/response examples
5. Authentication documentation

Alternatively: Use Postman Collections
- Export all endpoints
- Include examples
- Share with team
```

**Task 15.5: Admin Documentation (1h)**
```
Create admin guide:

/docs/ADMIN_GUIDE.md:

Sections:
1. Getting Started
   - Registration
   - Onboarding
   - First message

2. Member Management
   - Adding members
   - Importing CSV
   - Managing groups

3. Messaging
   - Sending messages
   - Scheduling
   - Templates
   - Recurring messages

4. Multi-Branch
   - Creating branches
   - Switching branches
   - Branch-specific data

5. Co-Admins
   - Inviting
   - Roles and permissions

6. Billing
   - Plans and pricing
   - Upgrading/downgrading
   - Managing subscription

7. Settings
   - Twilio setup
   - Communication modes
   - Welcome messages

8. Analytics
   - Reading reports
   - Engagement scores
   - Exporting data

9. Troubleshooting
   - Common issues
   - Support contact
```

**Afternoon Tasks (5 hours):**

**Task 15.6: Week 3 Integration Testing (3h)**
```
Test all Week 3 features:

1. Stripe Integration
   - Test card: 4242 4242 4242 4242
   - Subscribe to STARTER
   - Verify subscription active
   - Verify trial ended
   - Test upgrade to GROWTH
   - Test downgrade to STARTER
   - Test payment failure (4000 0000 0000 0002)
   - Verify webhook handling

2. Plan Limits
   - Verify branch limits enforced
   - Verify member limits enforced
   - Verify message limits enforced
   - Verify upgrade prompts show

3. UI Polish
   - Check all pages responsive
   - Verify loading states
   - Verify error handling
   - Test accessibility with keyboard
   - Test with screen reader

4. Testing
   - Run unit tests: npm test
   - Run integration tests
   - Run E2E tests
   - Fix any failures
```

**Task 15.7: Performance Audit (1h)**
- Run Lighthouse audit (aim for 90+ score)
- Check bundle size (keep frontend <1MB)
- Optimize images
- Enable gzip compression
- Configure CDN if needed

**Task 15.8: Security Hardening (1h)**
```
Final security checks:

1. Helmet.js configured
2. CORS properly restricted
3. Rate limiting on all endpoints
4. Input validation everywhere
5. SQL injection prevention (Prisma)
6. XSS prevention (React escaping)
7. HTTPS only (will configure in deployment)
8. Secure headers
9. Environment variables secured
10. No secrets in code
```

**End of Week 3 Git Commit:**
```bash
git add .
git commit -m "Week 3 complete: Billing and production readiness

- Complete Stripe integration (3 pricing tiers)
- Subscription management (subscribe, upgrade, downgrade, cancel)
- Trial-to-paid conversion flow
- Plan limit enforcement
- Usage tracking and alerts
- UI/UX polish (responsive, accessible, loading states)
- Comprehensive testing (unit, integration, E2E, security)
- Monitoring setup (Sentry, uptime)
- API and admin documentation
- Security hardening

Production-ready codebase.
Ready for Week 4: Deployment and launch"

git push origin development
```

---

## WEEK 4: DEPLOYMENT & LAUNCH

### Week 4 Overview
**Goal:** Deploy to production and launch to beta users
**Hours:** 40-50 hours
**Days:** 16-20

---

### DAY 16: Deployment Setup
**Goal:** Deploy both frontend and backend to production

**All Day (8-10 hours):**

**Task 16.1: Choose Hosting (1h)**

**Option A: Vercel + Railway (Recommended)**
- Frontend: Vercel (free, automatic deployments)
- Backend: Railway ($5/month, includes PostgreSQL)
- Pros: Easy, fast, good DX
- Cons: Less control

**Option B: DigitalOcean (Full Control)**
- Frontend: DigitalOcean App Platform or Droplet + Nginx
- Backend: Droplet with PM2
- Database: Managed PostgreSQL
- Pros: Full control, predictable pricing
- Cons: More setup required

**Option C: AWS (Scalable)**
- Frontend: S3 + CloudFront
- Backend: ECS or Elastic Beanstalk
- Database: RDS PostgreSQL
- Pros: Highly scalable, many services
- Cons: Complex, expensive

**Choose based on budget and expertise. Guide assumes Option A (Vercel + Railway).**

**Task 16.2: Database Setup (2h)**
```
Railway PostgreSQL:

1. Create Railway account
2. New project: "connect-yw-backend"
3. Add PostgreSQL plugin
4. Copy DATABASE_URL
5. Run migrations:
   - npx prisma migrate deploy
6. Seed production templates:
   - npx prisma db seed
7. Verify database accessible
8. Enable automatic backups
```

**Task 16.3: Backend Deployment (3h)**
```
Railway backend deployment:

1. Connect GitHub repo
2. Configure build:
   - Build Command: cd backend && npm install && npx prisma generate && npm run build
   - Start Command: cd backend && node dist/index.js

3. Add environment variables:
   - All backend env vars
   - Production values
   - Twilio production credentials
   - Stripe live keys
   - PostHog key

4. Deploy
5. Check logs for errors
6. Test API health endpoint: GET /health

7. Configure custom domain (optional):
   - api.connectyw.com
   - Set up DNS

8. Enable production mode:
   - NODE_ENV=production
```

**Task 16.4: Frontend Deployment (2h)**
```
Vercel frontend deployment:

1. Create Vercel account
2. Import GitHub repo
3. Configure build:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist

4. Add environment variables:
   - VITE_API_URL (Railway backend URL)
   - VITE_POSTHOG_KEY
   - VITE_STRIPE_PUBLISHABLE_KEY

5. Deploy
6. Test homepage loads
7. Test API connectivity

8. Configure custom domain:
   - app.connectyw.com
   - Set up DNS
   - SSL certificate (automatic with Vercel)
```

**Task 16.5: Webhook Configuration (1h)**
```
Update webhook URLs:

1. Twilio:
   - Status callback: https://api.connectyw.com/api/webhooks/twilio/status
   - Incoming message: https://api.connectyw.com/api/webhooks/twilio/reply

2. Stripe:
   - Webhook endpoint: https://api.connectyw.com/api/webhooks/stripe
   - Select events: all subscription and invoice events
   - Copy webhook signing secret
   - Update STRIPE_WEBHOOK_SECRET env var

3. Test webhooks:
   - Send test SMS
   - Verify status updates
   - Reply to SMS
   - Verify reply captured
   - Trigger Stripe webhook
   - Verify handled correctly
```

**Task 16.6: Smoke Testing (1h)**
```
Test production deployment:

1. Register new church
2. Complete onboarding
3. Connect Twilio (production)
4. Create branch, group, add members
5. Send test message
6. Verify SMS received
7. Reply to SMS (if 2-way)
8. Verify reply appears
9. Test all critical features
10. Check error tracking (Sentry)
11. Check analytics (PostHog)

Fix any issues immediately.
```

---

### DAY 17: Beta User Preparation
**Goal:** Prepare for beta user onboarding

**Morning Tasks (5 hours):**

**Task 17.1: Beta User Onboarding Materials (2h)**
```
Create materials:

1. Beta Welcome Email
   - Thank you for joining beta
   - Link to sign up: app.connectyw.com/register
   - Beta code (if using invite codes)
   - What to expect
   - How to give feedback
   - Support email

2. Getting Started Guide
   - Quick start checklist
   - Video walkthrough (record with Loom)
   - Common questions
   - Support resources

3. Feedback Survey
   - Google Form or Typeform
   - Questions:
     - What do you like?
     - What's confusing?
     - What features are missing?
     - How likely to recommend? (NPS)
     - Would you pay for this?

4. Beta Testing Checklist
   - Hand to each beta user
   - Key flows to test
   - Scenarios to try
   - Bugs to watch for
```

**Task 17.2: Support System Setup (1h)**
```
Set up support channels:

1. Support Email: support@connectyw.com
   - Set up forwarding
   - Create support@ alias
   - Auto-responder

2. Help Center (Simple)
   - FAQ page on marketing site
   - Common questions
   - Video tutorials
   - Contact information

3. In-App Support
   - "Help & Support" link in dashboard
   - Links to FAQ
   - Email support
   - Schedule demo link (Calendly)

4. Internal Support Tracking
   - Simple spreadsheet or Airtable
   - Track: User, Issue, Status, Resolution
```

**Task 17.3: Beta User Recruitment (2h)**
```
Find beta users:

1. Target: 10-20 churches
   - Size: 100-250 members
   - Tech-savvy leadership
   - Active SMS users already
   - Willing to give feedback

2. Outreach channels:
   - Church leadership forums
   - Facebook groups
   - Church tech conferences
   - Personal network
   - Cold email to local churches

3. Pitch:
   - Free during beta
   - Help shape the product
   - Early adopter benefits
   - Priority support

4. Application form:
   - Church name and size
   - Current communication methods
   - SMS usage (frequency, volume)
   - Tech comfort level
   - Availability for feedback calls

5. Selection criteria:
   - Diverse church sizes
   - Different regions
   - Various tech levels
   - Engaged and responsive
```

**Afternoon Tasks (5 hours):**

**Task 17.4: Beta Invite System (2h)**
```
Optional: Invite-only beta access

DATABASE: BetaInvite model
- code: unique string
- email: string
- used: boolean
- usedAt: DateTime
- churchId: string (after registration)

Generate 20 unique invite codes.

Update registration:
- Require invite code during beta
- Validate code exists and unused
- Mark code as used after registration
- Track which code used by which church

Frontend:
- Add invite code field to registration
- Validate on submit
- Show error if invalid

This allows controlled rollout.
```

**Task 17.5: Feature Flags (1h)**
```
Implement feature flags for controlled rollout:

Use simple approach:
- Config file: /backend/src/config/features.ts
- Feature flags:
  - RECURRING_MESSAGES: true/false
  - A_B_TESTING: true/false
  - ADVANCED_ANALYTICS: true/false

Check flags before showing features.
Allows enabling features per church if needed.

Or use LaunchDarkly/PostHog feature flags if budget allows.
```

**Task 17.6: Usage Monitoring Dashboard (1h)**
```
Internal dashboard for monitoring beta:

Create admin-only endpoint:
GET /api/admin/beta-stats
(Protected by admin API key)

Returns:
{
  totalChurches: number,
  totalMessages: number,
  totalMembers: number,
  averageEngagement: number,
  churches: [
    {
      name: string,
      memberCount: number,
      messagesSent: number,
      lastActive: ISO8601,
      plan: string
    }
  ]
}

Simple HTML dashboard or use Retool/internal tool.
Monitor beta usage daily.
```

**Task 17.7: Emergency Procedures (1h)**
```
Create runbook for emergencies:

/docs/RUNBOOK.md:

1. Service Down
   - Check Railway/Vercel status
   - Check database connection
   - Check logs in Railway
   - Check Sentry errors
   - Rollback procedure

2. Database Issues
   - Backup restoration
   - Connection pool exhaustion
   - Slow queries

3. Messaging Issues
   - Twilio API errors
   - Rate limits exceeded
   - Webhook failures

4. Billing Issues
   - Payment failures
   - Webhook delays
   - Refund process

5. Security Incident
   - Isolate issue
   - Notify affected users
   - Patch immediately
   - Post-mortem

6. Data Loss
   - Restore from backup
   - Assess scope
   - Notify users
   - Prevention measures

Include on-call rotation if team grows.
```

---

### DAY 18: Beta Launch Day
**Goal:** Launch to first beta users

**Morning Tasks (5 hours):**

**Task 18.1: Pre-Launch Checklist (1h)**
```
Final checks before launch:

Infrastructure:
☐ Frontend deployed and accessible
☐ Backend deployed and accessible
☐ Database running and backed up
☐ All environment variables set
☐ SSL certificates active
☐ DNS configured correctly
☐ Webhooks configured and tested

Functionality:
☐ Registration works
☐ Onboarding wizard works
☐ SMS sending works
☐ SMS receiving works (if 2-way)
☐ Billing works (test subscription)
☐ All critical features tested
☐ No console errors
☐ No server errors

Monitoring:
☐ Sentry error tracking active
☐ PostHog analytics tracking
☐ Uptime monitoring active
☐ Log aggregation working
☐ Backup schedule confirmed

Support:
☐ Support email monitored
☐ Help documentation accessible
☐ Feedback survey ready
☐ Beta welcome email ready

Legal:
☐ Privacy policy published
☐ Terms of service published
☐ TCPA compliance (SMS consent)
☐ GDPR considerations (if applicable)
```

**Task 18.2: Soft Launch (1h)**
```
Launch to first 3 beta users:

1. Select 3 most reliable beta testers
2. Send welcome email with:
   - Sign up link
   - Getting started guide
   - Your personal contact
   - Ask them to test immediately

3. Monitor their activity live:
   - Watch PostHog events
   - Watch Sentry for errors
   - Monitor server logs
   - Be available for support

4. Schedule 30-min call with each:
   - Watch them use product
   - Ask questions
   - Note pain points
   - Gather feedback
```

**Task 18.3: Bug Fix Session (2h)**
- Fix any critical bugs found by first 3 users
- Deploy fixes immediately
- Re-test

**Task 18.4: Expand to 10 Beta Users (1h)**
- If first 3 successful, invite next 7 users
- Send welcome emails
- Monitor activity
- Provide support

**Afternoon Tasks (5 hours):**

**Task 18.5: Active Monitoring (5h)**
```
Stay close to the product all day:

1. Monitor Dashboards
   - Sentry: watch for errors
   - PostHog: watch user activity
   - Railway: watch server performance
   - Database: watch query performance

2. User Support
   - Respond to support emails within 1 hour
   - Proactive check-ins with beta users
   - Live chat if possible

3. Feedback Collection
   - Send feedback survey after 24 hours of use
   - Schedule feedback calls
   - Watch for patterns in feedback

4. Quick Fixes
   - Fix small bugs immediately
   - Deploy patches as needed
   - Document larger issues for later

5. Usage Analysis
   - Which features used most?
   - Which features not used?
   - Where do users get stuck?
   - What delights users?

6. Performance Monitoring
   - Page load times
   - API response times
   - Message delivery rates
   - Error rates

Be prepared for long day. This is launch day!
```

---

### DAY 19: Post-Launch Monitoring & Iteration
**Goal:** Monitor beta users and iterate on feedback

**Morning Tasks (5 hours):**

**Task 19.1: Beta User Check-Ins (2h)**
```
Reach out to all beta users:

1. Email each user:
   - How is it going?
   - Any issues?
   - What do you love?
   - What's frustrating?
   - Feature requests?

2. Schedule 15-min calls with:
   - Most active users
   - Least active users
   - Users who reported issues

3. Review feedback survey responses

4. Compile feedback into categories:
   - Bugs (critical, medium, low)
   - Feature requests (nice-to-have, must-have)
   - UX improvements
   - Documentation needs
```

**Task 19.2: Analytics Review (1h)**
```
Analyze PostHog data:

Key metrics:
- Daily active users
- Messages sent per day
- Average messages per church
- Onboarding completion rate
- Feature adoption rates
- Engagement score trends

Concerning signals:
- Users not completing onboarding
- Users not sending messages
- Users not returning after day 1
- Features with zero usage
- High error rates

Positive signals:
- High message volume
- Recurring usage
- Feature discovery
- Positive engagement scores
```

**Task 19.3: Bug Prioritization & Fixes (2h)**
```
Prioritize bugs:

Priority 1 (fix immediately):
- Blocks core functionality
- Affects all users
- Data loss risk
- Security vulnerability

Priority 2 (fix this week):
- Affects specific feature
- Workaround available
- Affects some users

Priority 3 (fix later):
- Minor inconvenience
- Rare edge case
- Cosmetic issue

Fix Priority 1 bugs now.
Deploy fixes.
Notify affected users.
```

**Afternoon Tasks (5 hours):**

**Task 19.4: Feature Iteration (3h)**
```
Quick wins - improve based on feedback:

Common improvements:
1. Onboarding tweaks
   - Clarify confusing steps
   - Add more guidance
   - Better error messages

2. UX polish
   - Add missing tooltips
   - Improve empty states
   - Better loading indicators

3. Documentation
   - Add FAQ items
   - Create video tutorials
   - Improve help text

4. Performance
   - Optimize slow pages
   - Reduce load times
   - Cache more data

Implement top 3-5 quick wins.
Deploy to production.
```

**Task 19.5: Expand Beta (1h)**
```
If going well, invite remaining beta users:

- Send welcome emails
- Stagger invites (2-3 per day)
- Monitor capacity
- Ensure support bandwidth

Goal: 15-20 active beta churches by end of week.
```

**Task 19.6: Documentation Updates (1h)**
```
Update docs based on user questions:

Common questions become FAQs:
- How do I import members?
- How do I schedule recurring messages?
- How does 2-way communication work?
- What are plan limits?

Create video tutorials for:
- Getting started (5 min)
- Importing members (2 min)
- Sending your first message (2 min)
- Setting up recurring messages (3 min)

Use Loom for quick screen recordings.
```

---

### DAY 20: LAUNCH DAY - Final Preparation
**Goal:** Prepare for public launch (or expanded beta)

**Morning Tasks (5 hours):**

**Task 20.1: Launch Readiness Review (2h)**
```
Final assessment:

Product Readiness:
☐ All critical bugs fixed
☐ Core features working reliably
☐ Performance acceptable
☐ Security hardened
☐ Billing working correctly
☐ Positive beta feedback

Infrastructure Readiness:
☐ Can handle 50+ concurrent users
☐ Database scaled appropriately
☐ Monitoring comprehensive
☐ Backup strategy solid
☐ Support system ready

Business Readiness:
☐ Pricing validated
☐ Marketing site ready (if applicable)
☐ Payment processing verified
☐ Terms & privacy policies published
☐ Support bandwidth adequate

If any critical items not ready, delay launch.
Better to launch late than broken.
```

**Task 20.2: Beta Retrospective (1h)**
```
Review beta period:

What went well:
- List successes
- User testimonials
- Metrics that exceeded expectations

What didn't go well:
- Major issues encountered
- User frustrations
- Metrics below expectations

Lessons learned:
- What would we do differently?
- What assumptions were wrong?
- What surprised us?

Key metrics from beta:
- Total churches: X
- Total messages sent: X
- Average engagement score: X
- NPS score: X
- Conversion rate (trial → paid): X%

Document in /docs/BETA_RETROSPECTIVE.md
```

**Task 20.3: Launch Plan (2h)**
```
Plan for public launch:

Option A: Gradual Launch
- Continue invite-only for 2 more weeks
- Expand to 50 churches
- Gather more feedback
- Fix remaining issues
- Then open public registration

Option B: Public Launch
- Remove invite requirement
- Announce on social media
- Submit to directories (Product Hunt, etc.)
- Email marketing
- Content marketing

Recommended: Option A (gradual launch)
- Less risk
- Better support experience
- More time to iterate

Launch checklist:
1. Remove beta banner from app
2. Update marketing site
3. Prepare launch announcement
4. Set up customer onboarding automation
5. Scale infrastructure if needed
6. Prepare for support volume
```

**Afternoon Tasks (5 hours):**

**Task 20.4: Marketing Preparation (If launching publicly) (2h)**
```
Marketing materials:

1. Landing page
   - Clear value proposition
   - Feature highlights
   - Pricing table
   - Testimonials from beta users
   - Sign up CTA

2. Launch announcement
   - Blog post
   - Social media posts
   - Email to waitlist (if any)

3. Product Hunt launch (optional)
   - Create listing
   - Prepare assets (logo, screenshots)
   - Schedule launch
   - Rally supporters

4. Content
   - "How It Works" video
   - Customer success stories
   - Comparison vs. alternatives
```

**Task 20.5: Scale Preparation (1h)**
```
Prepare for growth:

1. Infrastructure auto-scaling
   - Railway: increase resources if needed
   - Database: upgrade plan if needed
   - CDN: configure if needed

2. Rate limiting
   - Adjust limits for higher traffic
   - Prevent abuse

3. Support scaling
   - Customer support email monitored
   - Canned responses for common questions
   - Consider help desk tool (Intercom, Zendesk)

4. Monitoring alerts
   - Alert on high error rates
   - Alert on slow response times
   - Alert on downtime
```

**Task 20.6: 4-Week Retrospective (2h)**
```
Reflect on entire 4-week build:

Achievements:
☐ Complete authentication system
☐ Multi-branch management
☐ Group management (30 per branch)
☐ Member management with CSV import
☐ Twilio SMS integration
☐ Message scheduling and recurring
☐ 1-way and 2-way communication
☐ Co-admin system
☐ Message templates
☐ Analytics dashboard
☐ Stripe billing (3 tiers)
☐ Trial management
☐ Deployed to production
☐ Beta users actively using

Database:
- 15+ tables
- All relationships working
- Properly indexed
- Backed up

API:
- 50+ endpoints
- RESTful design
- Comprehensive error handling
- Documented

Frontend:
- 25+ pages
- Responsive design
- Accessible (WCAG AA)
- Professional UI

Tracking:
- 65 PostHog events
- Sentry error tracking
- Uptime monitoring

Documentation:
- API docs
- Admin guide
- Runbook
- README

What didn't get built:
- Advanced A/B testing
- Complex automation workflows
- Native mobile apps
- API for third-party integrations
- Advanced reporting

Post-launch priorities:
1. Fix remaining bugs
2. Improve onboarding based on feedback
3. Add most-requested features
4. Scale infrastructure as needed
5. Grow user base

Celebrate! You built an enterprise-level product in 4 weeks!
```

**End of Week 4 & Project Git Commit:**
```bash
git add .
git commit -m "Week 4 complete: Deployment and launch ✨

- Deployed frontend to Vercel
- Deployed backend to Railway
- PostgreSQL database in production
- Webhooks configured (Twilio + Stripe)
- Monitoring active (Sentry + uptime)
- Beta users onboarded
- Launch materials prepared
- Documentation complete
- Ready for scale

Final Statistics:
- 15 database tables
- 50+ API endpoints
- 25+ frontend pages
- 65 PostHog events
- 4 weeks from start to launch
- Enterprise-grade SMS platform for churches

LAUNCH READY! 🚀"

git push origin main
git tag -a v1.0.0 -m "Version 1.0.0 - Launch"
git push origin v1.0.0
```

---

## APPENDICES

### APPENDIX A: TROUBLESHOOTING GUIDE

**Common Issues and Solutions:**

**1. Twilio Issues**
- **Error: Invalid phone number format**
  - Solution: Always format to E.164 (+1234567890)
  - Use libphonenumber-js for validation

- **Error: Permission denied (21408)**
  - Solution: For trial accounts, verify destination number in Twilio console
  - Or upgrade to paid account

- **Error: Insufficient funds**
  - Solution: Add credit to Twilio account
  - Set up automatic recharge

**2. Database Issues**
- **Error: Connection pool exhausted**
  - Solution: Increase connection_limit in DATABASE_URL
  - Default is 5, try 10-20
  - Check for unclosed connections

- **Error: Slow queries**
  - Solution: Add indexes to frequently queried fields
  - Use EXPLAIN ANALYZE to profile queries
  - Optimize Prisma includes

**3. Authentication Issues**
- **Error: JWT expired**
  - Solution: Use refresh token to get new access token
  - Implement automatic token refresh in axios interceptor

- **Error: CORS errors**
  - Solution: Add frontend URL to CORS_ORIGIN
  - Check credentials: 'include' if using cookies

**4. Deployment Issues**
- **Error: Build fails**
  - Solution: Check Node version matches local (18+)
  - Verify all dependencies in package.json
  - Check build logs for specific error

- **Error: Environment variables not loading**
  - Solution: In Railway/Vercel, check env vars are set
  - Restart service after adding env vars

**5. Message Sending Issues**
- **Error: Messages not sending**
  - Solution: Check Twilio credentials correct
  - Verify phone number purchased and active
  - Check member opted-in status
  - Check plan message limits

- **Error: Delivery status not updating**
  - Solution: Verify webhook URL configured in Twilio
  - Check webhook signature validation
  - Check logs for webhook errors

---

### APPENDIX B: TESTING CHECKLIST

**Pre-Launch Testing Scenarios:**

**Authentication & Onboarding:**
- [ ] Register new church
- [ ] Verify email format validation
- [ ] Verify password strength requirements
- [ ] Complete all 6 onboarding steps
- [ ] Skip optional steps (Twilio, member import)
- [ ] Log out and log back in
- [ ] Test forgot password flow
- [ ] Test reset password flow

**Multi-Branch:**
- [ ] Create 3 branches
- [ ] Try to create 4th branch on STARTER plan (should fail)
- [ ] Switch between branches
- [ ] Verify data filters correctly
- [ ] Edit branch details
- [ ] Delete branch (verify cascade)
- [ ] Cannot delete last branch

**Groups:**
- [ ] Create 10 groups in a branch
- [ ] Try to create 31st group (should fail)
- [ ] Edit group details
- [ ] Configure welcome message
- [ ] Delete group (verify members safe)

**Members:**
- [ ] Add single member manually
- [ ] Import CSV with 20 members
- [ ] Import CSV with invalid data (test error handling)
- [ ] Search members by name
- [ ] Search members by phone
- [ ] Filter by group
- [ ] Edit member details
- [ ] Remove member from group
- [ ] Opt out member
- [ ] Opt in member

**Messaging:**
- [ ] Send message to individual member
- [ ] Send message to specific group
- [ ] Send message to multiple groups
- [ ] Send message to specific branch
- [ ] Send message to all members
- [ ] Schedule message for future
- [ ] Edit scheduled message
- [ ] Cancel scheduled message
- [ ] Verify message received on phone
- [ ] Reply to message (if 2-way)
- [ ] Verify reply appears in inbox
- [ ] Toggle to 1-way mode
- [ ] Verify replies ignored in 1-way

**Templates & Recurring:**
- [ ] Create message template
- [ ] Use template in composer
- [ ] Edit template
- [ ] Delete template
- [ ] Create recurring message (weekly)
- [ ] Verify sends on schedule
- [ ] Pause recurring message
- [ ] Resume recurring message

**Co-Admins:**
- [ ] Invite co-admin
- [ ] Verify invitation email
- [ ] Accept invite (different browser)
- [ ] Login as co-admin
- [ ] Verify appropriate access
- [ ] Verify cannot access PRIMARY-only features
- [ ] As PRIMARY, remove co-admin
- [ ] Try to exceed co-admin limit

**Analytics:**
- [ ] View analytics dashboard
- [ ] Change date range
- [ ] Filter by branch
- [ ] Verify all charts render
- [ ] Export analytics to CSV
- [ ] Check engagement scores accurate

**Billing:**
- [ ] Subscribe to STARTER plan
- [ ] Verify trial ends
- [ ] Upgrade to GROWTH plan
- [ ] Verify prorated billing
- [ ] Downgrade to STARTER
- [ ] Cancel subscription
- [ ] Resume subscription
- [ ] Test payment failure (test card)
- [ ] Verify plan limits enforced

**Performance:**
- [ ] Page load time <2s
- [ ] API response time <500ms
- [ ] Database query time reasonable
- [ ] No N+1 queries
- [ ] Bundle size <1MB (frontend)

**Security:**
- [ ] Try accessing other church's data (should fail)
- [ ] Try SQL injection (should be prevented)
- [ ] Try XSS attack (should be escaped)
- [ ] Test rate limiting
- [ ] Verify HTTPS only
- [ ] Check secure headers

**Mobile:**
- [ ] Test all pages on mobile (375px)
- [ ] Verify responsive layout
- [ ] Test forms on mobile
- [ ] Test message composer on mobile
- [ ] Verify touch-friendly buttons

**Accessibility:**
- [ ] Tab through entire app (keyboard only)
- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Verify alt text on images
- [ ] Verify form labels

---

### APPENDIX C: DEPLOYMENT GUIDE

**Option A: Vercel + Railway (Recommended)**

**Prerequisites:**
- GitHub repository
- Vercel account
- Railway account
- Domain name (optional)

**Backend Deployment (Railway):**

1. **Create Railway Project**
   ```
   - Go to railway.app
   - New Project
   - Deploy from GitHub repo
   - Select your repo
   ```

2. **Add PostgreSQL**
   ```
   - New → Database → PostgreSQL
   - Copy DATABASE_URL
   ```

3. **Configure Backend Service**
   ```
   - Settings → Root Directory: /backend
   - Build Command: npm install && npx prisma generate && npm run build
   - Start Command: node dist/index.js
   ```

4. **Add Environment Variables**
   ```
   All backend env vars (see earlier section)
   Use production values
   ```

5. **Deploy**
   ```
   - Will auto-deploy on git push
   - Check logs for errors
   - Test health endpoint
   ```

6. **Run Migrations**
   ```
   In Railway terminal:
   npx prisma migrate deploy
   npx prisma db seed
   ```

7. **Custom Domain (Optional)**
   ```
   - Settings → Domains
   - Add: api.yourdomain.com
   - Update DNS CNAME record
   ```

**Frontend Deployment (Vercel):**

1. **Import Repository**
   ```
   - Go to vercel.com
   - New Project
   - Import from GitHub
   - Select your repo
   ```

2. **Configure Build**
   ```
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
   ```

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_POSTHOG_KEY=phc_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

4. **Deploy**
   ```
   - Click Deploy
   - Wait for build
   - Test deployment
   ```

5. **Custom Domain**
   ```
   - Settings → Domains
   - Add: app.yourdomain.com
   - Update DNS (automatic SSL)
   ```

**Webhook Configuration:**

Update all webhooks with production URLs:
- Twilio → https://api.yourdomain.com/api/webhooks/twilio/status
- Twilio → https://api.yourdomain.com/api/webhooks/twilio/reply
- Stripe → https://api.yourdomain.com/api/webhooks/stripe

**Continuous Deployment:**

Both Vercel and Railway auto-deploy on git push to main branch.

To deploy to production:
```bash
git push origin main
```

Monitor deployments:
- Railway: Check deployment logs
- Vercel: Check deployment status

**Rollback:**

If deployment fails:
```
Railway: Click previous deployment → Redeploy
Vercel: Deployments tab → Redeploy previous
```

---

### APPENDIX D: POST-LAUNCH MONITORING

**Daily Monitoring Checklist:**

**Morning (15 min):**
- [ ] Check Sentry for new errors
- [ ] Check uptime monitor (99.9%+ expected)
- [ ] Review overnight usage (PostHog)
- [ ] Check support inbox
- [ ] Verify backups ran successfully

**Afternoon (15 min):**
- [ ] Review active user count
- [ ] Check message volume
- [ ] Monitor API response times
- [ ] Check database performance
- [ ] Review billing events (subscriptions, payments)

**Weekly Review (1 hour):**
- [ ] Analyze user growth
- [ ] Review top errors in Sentry
- [ ] Customer support metrics (response time, resolution time)
- [ ] Financial metrics (MRR, churn, LTV)
- [ ] Feature adoption rates
- [ ] Performance trends
- [ ] Plan infrastructure scaling if needed

**Key Metrics to Track:**

**Product Metrics:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Messages sent per day
- Average messages per church
- Engagement score trend
- Feature adoption rates
- Onboarding completion rate

**Business Metrics:**
- New sign-ups per week
- Trial conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Net Promoter Score (NPS)

**Technical Metrics:**
- API response time (p50, p95, p99)
- Error rate (errors per request)
- Uptime (99.9%+ target)
- Database query time
- Message delivery rate (95%+ target)
- Webhook success rate

**Support Metrics:**
- Support tickets per week
- Average response time
- Average resolution time
- Customer satisfaction score

**Alerts to Configure:**

**Critical (immediate action):**
- Site down (>5 min)
- Error rate spike (>5% of requests)
- Database connection failure
- Payment processing failure

**Warning (investigate within 1 hour):**
- Slow API responses (>2s average)
- High memory usage (>80%)
- High CPU usage (>80%)
- Webhook failures (>10% failure rate)

**Info (review daily):**
- New user signups
- Subscription changes
- High usage churches

---

### APPENDIX E: FEATURE PRIORITIZATION FOR POST-LAUNCH

**Phase 2 Features (Weeks 5-8):**

**High Priority:**
1. **Native Mobile Apps** (iOS + Android)
   - React Native
   - Push notifications
   - Offline mode for viewing

2. **Advanced Automation**
   - Visual workflow builder
   - Complex triggers
   - Multi-step workflows

3. **Email Integration**
   - Send emails in addition to SMS
   - Unified communication history

4. **API for Integrations**
   - Public REST API
   - Webhook subscriptions
   - Zapier integration

**Medium Priority:**
5. **Team Permissions**
   - Granular permission levels
   - Department-specific access
   - Audit logs

6. **Advanced Reporting**
   - Custom report builder
   - Scheduled email reports
   - Export to PDF

7. **Contact Forms**
   - Embedded forms for websites
   - Auto-add to groups
   - Custom fields

**Low Priority:**
8. **WhatsApp Integration**
   - International churches
   - WhatsApp Business API

9. **Voice Calls**
   - Twilio Voice API
   - Phone trees
   - Voicemail

10. **Multi-Language Support**
    - i18n implementation
    - RTL language support

**Feature Request Process:**

1. Collect requests from:
   - User feedback
   - Support tickets
   - Analytics (low feature usage)
   - Competitive analysis

2. Prioritize using RICE:
   - Reach: How many users?
   - Impact: How much benefit?
   - Confidence: How sure are we?
   - Effort: How long to build?
   - Score = (R × I × C) / E

3. Quarterly roadmap review
   - Top 3-5 features per quarter
   - Communicate to users
   - Deliver on schedule

---

## FINAL NOTES

**Congratulations!** If you've followed this guide and built Connect YW, you've created an enterprise-grade church SMS communication platform from scratch in 4 weeks.

**What You've Accomplished:**
- ✅ Full-stack application (React + Node.js)
- ✅ Multi-branch church management
- ✅ SMS messaging with Twilio
- ✅ Subscription billing with Stripe
- ✅ Advanced analytics with PostHog
- ✅ Production deployment
- ✅ Real beta users
- ✅ Scalable architecture

**Next Steps:**

1. **First 30 Days:**
   - Support beta users actively
   - Fix bugs quickly
   - Iterate on feedback
   - Improve onboarding
   - Monitor metrics daily

2. **Months 2-3:**
   - Expand to 50-100 churches
   - Implement top feature requests
   - Scale infrastructure
   - Build marketing funnel
   - Achieve profitability

3. **Months 4-6:**
   - Public launch
   - Content marketing
   - Customer success program
   - Team growth (if needed)
   - Product/market fit validation

4. **Long-term:**
   - Scale to 1000+ churches
   - Raise funding (if desired)
   - Expand feature set
   - International markets
   - Strategic partnerships

**Remember:**
- Shipping is better than perfection
- User feedback is gold
- Focus on core value proposition
- Stay close to customers
- Iterate quickly

**Support:**
This guide provided by Claude Code. For questions:
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Documentation: https://docs.claude.com

**Good luck with your launch! 🚀**

---

## QUICK REFERENCE

**Essential Commands:**

```bash
# Development
npm run dev                    # Start dev servers
npx prisma studio             # Database GUI
npx prisma migrate dev        # Create migration
npm test                      # Run tests

# Deployment
git push origin main          # Deploy to production
npx prisma migrate deploy     # Run migrations in prod
npm run build                 # Build for production

# Database
npx prisma generate           # Generate Prisma client
npx prisma db push            # Push schema changes (dev only)
npx prisma db seed            # Seed data

# Debugging
npm run logs                  # View server logs
docker-compose logs -f        # View Docker logs
```

**Essential URLs:**
- Development: http://localhost:5173
- API: http://localhost:3000
- Prisma Studio: http://localhost:5555
- Production: https://app.connectyw.com
- API Docs: https://api.connectyw.com/docs

**Key Files:**
- Database schema: `/backend/prisma/schema.prisma`
- API routes: `/backend/src/routes/`
- Environment vars: `/backend/.env`, `/frontend/.env`
- Main app: `/frontend/src/App.tsx`

---

**END OF GUIDE**

*Last updated: October 28, 2025*
*Version: 1.0*
*Built with Claude Code*

