# Connect YW Church SMS Platform - Project Plan

**Project Goal:** Build an enterprise-level church SMS communication platform for churches with 100-250 members across 3-10 physical locations.

**Timeline:** 4 weeks (20 working days) + 1 extra day for deployment (21 total)

**Philosophy:** Simple, incremental changes. Each task impacts minimal code. Focus on completing small checkpoints before moving to the next.

---

## 📐 ARCHITECTURE OVERVIEW

### Project Structure (Monorepo)
```
/root
├── /backend (Node.js + Express + TypeScript)
│   ├── /src
│   │   ├── /api (routes, controllers)
│   │   ├── /services (business logic)
│   │   ├── /jobs (background tasks - Bull queues)
│   │   ├── /middleware
│   │   ├── /utils
│   │   ├── /config
│   │   └── app.ts, index.ts
│   ├── /prisma (database schema, migrations, seeds)
│   └── package.json
├── /frontend (React + Vite + TypeScript)
│   ├── /src
│   │   ├── /pages (route pages)
│   │   ├── /components (reusable components)
│   │   ├── /stores (Zustand stores)
│   │   ├── /hooks (custom React hooks)
│   │   ├── /api (Axios client)
│   │   └── App.tsx, main.tsx
│   └── package.json
└── package.json (root, npm workspaces)
```

### Tech Stack
- **Backend:** Express, Prisma ORM, PostgreSQL, Bull (job queue), Redis (cache)
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Zustand, React Hook Form
- **Services:** Twilio (SMS), Stripe (payments), PostHog (analytics), SendGrid (email)
- **Deployment:** Railway (backend + database), Vercel (frontend)

---

## 🏷️ FEATURE LABELS

- **MVP** = Must-have for launch (Checkpoints 1-8)
- **Phase 2** = Nice-to-have, defer if timeline at risk

---

---

## <� HIGH-LEVEL CHECKPOINTS

1. **Foundation Setup** (Days 1-2) - MVP
2. **Authentication & Church Setup** (Days 3-4) - MVP
3. **Multi-Branch Infrastructure** (Days 5-6) - MVP
4. **Member Management** (Days 7-8) - MVP
5. **SMS Messaging Core** (Days 9-11) - MVP
6. **Message Templates & Automation** (Days 12-13) - MVP
7. **Analytics Integration** (Days 14-15) - MVP
8. **Billing & Subscriptions** (Days 16-17) - MVP
9. **Testing & Polish** (Days 18-20) - MVP
10. **Deployment & Launch** (Day 21) - MVP

---

## CHECKPOINT 1: FOUNDATION SETUP (Days 1-2)
**Goal:** Complete project structure, database schema, and environment setup

### High-Level Tasks:
- [ ] Initialize project repository with monorepo structure
- [ ] Design and implement complete database schema
- [ ] Set up development environment
- [ ] Configure all required services

### Detailed Task Breakdown:

#### Task 1.1: Project Initialization
- [ ] Create GitHub repository "connect-yw-platform"
- [ ] Initialize root package.json with npm workspaces
- [ ] Create `/frontend` folder with Vite + React + TypeScript
- [ ] Create `/backend` folder with Express + TypeScript
- [ ] Add .gitignore for Node.js projects
- [ ] Set up ESLint and Prettier configs
- [ ] Create README.md with basic setup instructions
- [ ] **Verify:** Both `npm install` commands run without errors

#### Task 1.2: Database Schema Design
- [ ] Create Prisma schema file at `/backend/prisma/schema.prisma`
- [ ] Define Church model (id, name, email, subscription, trial dates, Twilio config)
- [ ] Define Branch model (id, churchId, name, address, phone)
- [ ] Define Group model (id, branchId, name, welcomeMessage config)
- [ ] Define Member model (id, firstName, lastName, phone, email, optIn status)
- [ ] Define GroupMember join table (many-to-many)
- [ ] Define Message model (id, churchId, content, status, scheduling)
- [ ] Define MessageRecipient model (delivery tracking per member)
- [ ] Define Admin model (id, churchId, email, role, invitation tracking)
- [ ] Define Subscription model (Stripe integration fields)
- [ ] Define AnalyticsEvent model (PostHog backup)
- [ ] Add all foreign key relationships with cascade rules
- [ ] Add indexes on frequently queried fields
- [ ] **Verify:** Run `npx prisma generate` successfully

#### Task 1.3: Environment Configuration
- [ ] Create `/backend/.env.example` with all required variables
- [ ] Create `/frontend/.env.example` with all required variables
- [ ] Set up local PostgreSQL via Docker Compose
- [ ] Set up Redis via Docker Compose (for cache + Bull queue)
- [ ] Generate JWT secrets (64-char random strings)
- [ ] Add Twilio test credentials
- [ ] Add Stripe test keys
- [ ] Add PostHog project key
- [ ] Add SendGrid API key
- [ ] **Verify:** Docker containers (Postgres + Redis) run, both accessible

#### Task 1.3b: Redis & Bull Setup (Job Queue)
- [ ] Install Redis and Bull packages in backend
- [ ] Create `/backend/src/config/redis.config.ts` (Redis client connection)
- [ ] Create `/backend/src/jobs/queue.ts` (Bull queue initialization)
- [ ] Add `mailQueue`, `smsQueue`, `analyticsQueue` job queues
- [ ] **Verify:** Can connect to Redis, queues initialize without errors

#### Task 1.3c: SendGrid Email Service Setup
- [ ] Install SendGrid package
- [ ] Create `/backend/src/services/sendgrid.service.ts`
- [ ] Add `sendEmail(to, subject, template, variables)` function
- [ ] Create email templates for: password reset, welcome, invitation
- [ ] **Verify:** Can send test email via SendGrid

#### Task 1.4: Run Initial Migration
- [ ] Run `npx prisma migrate dev --name initial_schema`
- [ ] Open Prisma Studio to verify all tables created
- [ ] **Verify:** 11+ tables visible in Prisma Studio

#### Task 1.5: Basic Backend Structure
- [ ] Create `/backend/src/index.ts` (Express server entry point)
- [ ] Create `/backend/src/app.ts` (Express app configuration)
- [ ] Set up CORS middleware
- [ ] Set up Helmet for security headers
- [ ] Add body-parser middleware
- [ ] Create health check endpoint: GET /health
- [ ] **Verify:** Server starts on port 3000, /health returns 200

#### Task 1.6: Basic Frontend Structure
- [ ] Create `/frontend/src/main.tsx` (React entry point)
- [ ] Create `/frontend/src/App.tsx` (Root component)
- [ ] Set up React Router
- [ ] Configure Tailwind CSS
- [ ] Create basic layout component
- [ ] **Verify:** Dev server starts on port 5173, homepage loads

**Checkpoint 1 Complete When:**
-  Both frontend and backend servers start without errors
-  Database schema migrated with all tables
-  Environment variables configured
-  Health check endpoint working

---

## CHECKPOINT 2: AUTHENTICATION & CHURCH SETUP (Days 3-4)
**Goal:** User registration, login, and basic church profile management

### High-Level Tasks:
- [ ] JWT authentication system
- [ ] Church registration API
- [ ] Login/logout functionality
- [ ] Frontend auth pages

### Detailed Task Breakdown:

#### Task 2.1: JWT Utilities
- [ ] Create `/backend/src/utils/jwt.utils.ts`
- [ ] Add `generateAccessToken(adminId, churchId, role)` function
- [ ] Add `generateRefreshToken(adminId)` function
- [ ] Add `verifyAccessToken(token)` function
- [ ] Add `verifyRefreshToken(token)` function
- [ ] **Verify:** Can generate and verify tokens successfully

#### Task 2.2: Password Utilities
- [ ] Create `/backend/src/utils/password.utils.ts`
- [ ] Add `hashPassword(password)` using bcrypt (10 rounds)
- [ ] Add `comparePassword(password, hash)` function
- [ ] **Verify:** Password hashes and compares correctly

#### Task 2.3: Auth Middleware
- [ ] Create `/backend/src/middleware/auth.middleware.ts`
- [ ] Add `authenticateToken` middleware (verifies JWT)
- [ ] Add `requireRole(['PRIMARY', 'CO_ADMIN'])` middleware
- [ ] Extend Express Request type to include `user` property
- [ ] **Verify:** Middleware attaches user to req.user

#### Task 2.4: Stripe Customer Creation
- [ ] Create `/backend/src/services/stripe.service.ts`
- [ ] Add `createCustomer(email, name)` function
- [ ] Return Stripe customer ID
- [ ] **Verify:** Creates customer in Stripe dashboard

#### Task 2.5: Registration API Endpoint
- [ ] Create `/backend/src/routes/auth.routes.ts`
- [ ] Create `/backend/src/controllers/auth.controller.ts`
- [ ] Create `/backend/src/services/auth.service.ts`
- [ ] POST /api/auth/register endpoint
- [ ] Validate: email, password (min 8 chars), firstName, lastName, churchName
- [ ] Check email uniqueness
- [ ] Hash password
- [ ] Create Stripe customer
- [ ] Create Church record (trial ends in 14 days)
- [ ] Create Admin record (role: PRIMARY)
- [ ] Generate access + refresh tokens
- [ ] Track "user_signed_up" PostHog event
- [ ] **Verify:** Can register via curl, returns tokens

#### Task 2.6: Login API Endpoint
- [ ] POST /api/auth/login endpoint in auth.routes.ts
- [ ] Find admin by email
- [ ] Compare password hash
- [ ] Update lastLoginAt timestamp
- [ ] Generate tokens
- [ ] Track "user_logged_in" PostHog event
- [ ] **Verify:** Can login via curl with correct credentials

#### Task 2.7: Token Refresh Endpoint
- [ ] POST /api/auth/refresh endpoint
- [ ] Verify refresh token
- [ ] Generate new access + refresh tokens
- [ ] **Verify:** Can refresh tokens successfully

#### Task 2.7b: Password Reset API (Phase 2)
- [ ] POST /api/auth/forgot-password endpoint
- [ ] Accept email, generate reset token (30-min expiry)
- [ ] Send reset link via SendGrid
- [ ] POST /api/auth/reset-password endpoint
- [ ] Validate token, update password, invalidate refresh tokens
- [ ] **Verify:** Can reset password via email link
- [ ] **Note:** Can defer to Phase 2 if timeline tight

#### Task 2.8: Frontend Auth Store (Zustand)
- [ ] Create `/frontend/src/stores/authStore.ts`
- [ ] Add state: user, church, accessToken, refreshToken
- [ ] Add action: login(data)
- [ ] Add action: logout()
- [ ] Add computed: isAuthenticated
- [ ] Persist to localStorage
- [ ] **Verify:** Store persists across page refresh

#### Task 2.9: Frontend API Client (Axios)
- [ ] Create `/frontend/src/api/client.ts`
- [ ] Configure Axios with baseURL from env
- [ ] Add request interceptor to attach Authorization header
- [ ] Add response interceptor to handle 401 (refresh token)
- [ ] **Verify:** API client attaches token automatically

#### Task 2.10: Registration Page UI
- [ ] Create `/frontend/src/pages/auth/RegisterPage.tsx`
- [ ] Form fields: email, password, confirm password, firstName, lastName, churchName, churchPhone
- [ ] Use React Hook Form for validation
- [ ] Password strength indicator
- [ ] Submit calls /api/auth/register
- [ ] On success: save tokens, redirect to /onboarding
- [ ] **Verify:** Can register via UI, redirects correctly

#### Task 2.11: Login Page UI
- [ ] Create `/frontend/src/pages/auth/LoginPage.tsx`
- [ ] Form fields: email, password
- [ ] "Forgot password?" link
- [ ] "Sign up" link
- [ ] Submit calls /api/auth/login
- [ ] On success: save tokens, redirect to /dashboard
- [ ] **Verify:** Can login via UI successfully

#### Task 2.12: Protected Route Component
- [ ] Create `/frontend/src/components/ProtectedRoute.tsx`
- [ ] Check if user authenticated
- [ ] If not, redirect to /login
- [ ] If yes, render children
- [ ] **Verify:** Cannot access /dashboard without login

**Checkpoint 2 Complete When:**
-  Can register new church via UI
-  Can login with created account
-  Tokens saved and persist across refresh
-  Protected routes redirect to login when not authenticated
-  JWT middleware working on backend

---

## CHECKPOINT 3: MULTI-BRANCH INFRASTRUCTURE (Days 5-6)
**Goal:** Churches can manage 3-10 physical branches based on plan

### High-Level Tasks:
- [ ] Branch CRUD API endpoints
- [ ] Branch management UI
- [ ] Branch switching functionality
- [ ] Plan limit enforcement

### Detailed Task Breakdown:

#### Task 3.1: Branch List API
- [ ] Create `/backend/src/routes/branch.routes.ts`
- [ ] Create `/backend/src/controllers/branch.controller.ts`
- [ ] Create `/backend/src/services/branch.service.ts`
- [ ] GET /api/churches/:churchId/branches endpoint
- [ ] Return all branches for church
- [ ] Include group count and member count per branch
- [ ] **Verify:** Returns empty array for new church

#### Task 3.2: Create Branch API
- [ ] POST /api/churches/:churchId/branches endpoint
- [ ] Validate: name (required), address, phone, description
- [ ] Check plan limit (STARTER: 1, GROWTH: 5, PRO: 10)
- [ ] If at limit, return 400 with upgrade message
- [ ] Create Branch record
- [ ] Track "branch_created" PostHog event
- [ ] If 2nd branch created, track "multi_branch_enabled" event
- [ ] **Verify:** Can create branch, limit enforced

#### Task 3.3: Update Branch API
- [ ] PUT /api/branches/:id endpoint
- [ ] Allow updating: name, address, phone, description, isActive
- [ ] Track "branch_edited" PostHog event
- [ ] **Verify:** Updates persist to database

#### Task 3.4: Delete Branch API
- [ ] DELETE /api/branches/:id endpoint
- [ ] Check: cannot delete if only branch
- [ ] Cascade delete groups and group members (Prisma handles)
- [ ] Track "branch_deleted" PostHog event with counts
- [ ] **Verify:** Branch deletes, groups cascade

#### Task 3.5: Branch Store (Frontend)
- [ ] Create `/frontend/src/stores/branchStore.ts`
- [ ] Add state: branches[], currentBranchId, allBranchesMode
- [ ] Add action: loadBranches()
- [ ] Add action: setCurrentBranch(id)
- [ ] Add action: setAllBranchesMode(bool)
- [ ] Persist currentBranchId to localStorage
- [ ] **Verify:** Branch selection persists

#### Task 3.6: Branches Page UI
- [ ] Create `/frontend/src/pages/dashboard/BranchesPage.tsx`
- [ ] List all branches in cards
- [ ] Show: name, address, stats (groups, members)
- [ ] "Create Branch" button (disabled if at limit)
- [ ] Edit and Delete buttons per branch
- [ ] **Verify:** Shows all branches

#### Task 3.7: Branch Form Modal
- [ ] Create `/frontend/src/components/branches/BranchFormModal.tsx`
- [ ] Form fields: name, address, phone, description
- [ ] Submit creates or updates branch
- [ ] **Verify:** Can create/edit branch via modal

#### Task 3.8: Branch Selector Component
- [ ] Create `/frontend/src/components/BranchSelector.tsx`
- [ ] Dropdown showing current branch
- [ ] List all branches
- [ ] "All Branches" option at top
- [ ] Click to switch active branch
- [ ] Show in top navigation bar
- [ ] Track "branch_switched" PostHog event
- [ ] **Verify:** Switching updates currentBranchId

**Checkpoint 3 Complete When:**
-  Can create multiple branches
-  Branch limit enforced based on plan
-  Can switch between branches
-  Branch selector visible in top bar
-  Can edit and delete branches

---

## CHECKPOINT 4: MEMBER MANAGEMENT (Days 7-8)
**Goal:** Add and manage church members with CSV import

### High-Level Tasks:
- [ ] Group CRUD API endpoints
- [ ] Member CRUD API endpoints
- [ ] CSV import functionality
- [ ] Member management UI

### Detailed Task Breakdown:

#### Task 4.1: Group List API
- [ ] GET /api/branches/:branchId/groups endpoint
- [ ] Return all groups for branch
- [ ] Include member count per group
- [ ] **Verify:** Returns empty array initially

#### Task 4.2: Create Group API
- [ ] POST /api/branches/:branchId/groups endpoint
- [ ] Validate: name (required), description
- [ ] Check 30-group limit per branch
- [ ] Create Group record with default welcome message
- [ ] Track "group_created" PostHog event
- [ ] **Verify:** Can create group, limit enforced

#### Task 4.3: Update/Delete Group APIs
- [ ] PUT /api/groups/:id endpoint
- [ ] DELETE /api/groups/:id endpoint
- [ ] Track appropriate PostHog events
- [ ] **Verify:** CRUD operations work

#### Task 4.4: Groups Page UI
- [ ] Create `/frontend/src/pages/dashboard/GroupsPage.tsx`
- [ ] List all groups for current branch
- [ ] Show: name, description, member count
- [ ] "Create Group" button (disabled if at 30)
- [ ] Edit/Delete buttons per group
- [ ] **Verify:** Shows groups, respects branch filter

#### Task 4.5: Member Add API (Single)
- [ ] POST /api/groups/:groupId/members endpoint
- [ ] Validate: firstName, lastName, phone (E.164 format)
- [ ] Check if phone already exists (reuse member)
- [ ] Create Member record if new
- [ ] Create GroupMember join record
- [ ] Track "member_added" PostHog event
- [ ] **Verify:** Can add member

#### Task 4.6: CSV Parser Utility
- [ ] Create `/backend/src/utils/csvParser.util.ts`
- [ ] Install papaparse library
- [ ] Add `parseCSV(fileBuffer)` function
- [ ] Add `validateMemberRow(row)` function
- [ ] Add `formatPhoneToE164(phone)` function
- [ ] **Verify:** Parses test CSV correctly

#### Task 4.7: CSV Import API
- [ ] POST /api/groups/:groupId/members/import endpoint
- [ ] Accept multipart/form-data file upload
- [ ] Parse CSV with csvParser
- [ ] Validate each row
- [ ] Batch create members
- [ ] Return: imported count, failed count, errors array
- [ ] Track "member_bulk_imported" PostHog event
- [ ] **Verify:** Imports valid CSV, reports errors

#### Task 4.8: Member List API
- [ ] GET /api/groups/:groupId/members endpoint
- [ ] Support pagination: ?page=1&limit=50
- [ ] Support search: ?search=john
- [ ] Return members with join date
- [ ] **Verify:** Returns paginated results

#### Task 4.9: Members Page UI
- [ ] Create `/frontend/src/pages/dashboard/MembersPage.tsx`
- [ ] Table showing: name, phone, email, groups, opt-in status
- [ ] Search box
- [ ] Group filter dropdown
- [ ] "Add Member" button
- [ ] "Import CSV" button
- [ ] **Verify:** Lists members with filters

#### Task 4.10: Add Member Modal
- [ ] Create `/frontend/src/components/members/AddMemberModal.tsx`
- [ ] Form: firstName, lastName, phone, email, group selection
- [ ] Phone input with auto-formatting
- [ ] Submit calls API
- [ ] **Verify:** Can add member via UI

#### Task 4.11: CSV Import Modal
- [ ] Create `/frontend/src/components/members/ImportCSVModal.tsx`
- [ ] File upload (drag & drop)
- [ ] CSV template download button
- [ ] Preview first 5 rows
- [ ] Show validation results
- [ ] Import button
- [ ] **Verify:** Can import CSV via UI

**Checkpoint 4 Complete When:**
-  Can create groups (up to 30 per branch)
-  Can add members manually
-  Can import members via CSV
-  Members list with search and filters
-  Phone numbers properly formatted

---

## CHECKPOINT 5: SMS MESSAGING CORE (Days 9-11)
**Goal:** Send SMS messages to members via Twilio

### High-Level Tasks:
- [ ] Twilio service integration
- [ ] Message sending API
- [ ] Message composer UI
- [ ] Delivery tracking

### Detailed Task Breakdown:

#### Task 5.1: Twilio Connection API
- [ ] POST /api/churches/:churchId/twilio/connect endpoint
- [ ] Accept: accountSid, authToken, phoneNumber
- [ ] Validate credentials by test API call
- [ ] Save encrypted to Church record
- [ ] Set twilioVerified = true
- [ ] Track "twilio_connected" PostHog event
- [ ] **Verify:** Credentials save successfully

#### Task 5.2: Twilio Service
- [ ] Create `/backend/src/services/twilio.service.ts`
- [ ] Add `sendSMS(to, message, churchId)` function
- [ ] Initialize Twilio client with church credentials
- [ ] Send SMS via Twilio API
- [ ] Return message SID
- [ ] Handle Twilio error codes
- [ ] **Verify:** Can send test SMS to your phone

#### Task 5.3: Phone Number Utilities
- [ ] Create `/backend/src/utils/phone.utils.ts`
- [ ] Add `formatToE164(phone)` function using libphonenumber-js
- [ ] Add `validatePhoneNumber(phone)` function
- [ ] **Verify:** Formats various phone formats to E.164

#### Task 5.4: Message Sending API - Part 1 (Recipient Resolution)
- [ ] Create `/backend/src/services/message.service.ts`
- [ ] Add `resolveRecipients(targetType, targetIds, churchId)` function
- [ ] For "individual": return single member
- [ ] For "groups": get all opted-in members from those groups
- [ ] For "branches": get all opted-in members from all groups in branches
- [ ] For "all": get all opted-in members from entire church
- [ ] Remove duplicate phone numbers
- [ ] **Verify:** Returns correct unique recipients

#### Task 5.5: Message Sending API - Part 2 (Create Records)
- [ ] POST /api/messages/send endpoint
- [ ] Validate: content, targetType, targetIds
- [ ] Resolve recipients
- [ ] Create Message record
- [ ] Create MessageRecipient records (status: PENDING)
- [ ] Track "message_sent" PostHog event
- [ ] Return message ID and recipient count
- [ ] **Verify:** Creates records in database

#### Task 5.6: Message Sending Job (Background)
- [ ] Create `/backend/src/jobs/sendMessage.job.ts`
- [ ] Set up Bull queue for message sending
- [ ] Job: get message and pending recipients
- [ ] Loop through recipients, call twilioService.sendSMS()
- [ ] Update MessageRecipient status to SENT
- [ ] Save Twilio message SID
- [ ] Rate limit: 10 messages/second
- [ ] Update Message delivery stats
- [ ] **Verify:** Messages send in background

#### Task 5.7: Twilio Status Webhook
- [ ] POST /api/webhooks/twilio/status endpoint
- [ ] Parse Twilio webhook payload
- [ ] Find MessageRecipient by message SID
- [ ] Update deliveryStatus (DELIVERED, FAILED, etc.)
- [ ] Update timestamps
- [ ] Track "message_delivered" or "message_delivery_failed" events
- [ ] **Verify:** Delivery status updates from Twilio

#### Task 5.8: Message History API
- [ ] GET /api/messages/history endpoint
- [ ] Support pagination and filters (status, date range)
- [ ] Return messages with delivery stats
- [ ] **Verify:** Returns sent messages

#### Task 5.9: Message Composer Page
- [ ] Create `/frontend/src/pages/dashboard/SendMessagePage.tsx`
- [ ] Textarea for message content
- [ ] Character counter (shows 160, 320, etc. for SMS segments)
- [ ] Recipient selector tabs: Individual, Groups, Branches, Everyone
- [ ] Cost estimator ($0.0075 per segment per recipient)
- [ ] "Send Message" button
- [ ] **Verify:** Can compose and send message

#### Task 5.10: Recipient Selector Component
- [ ] Create `/frontend/src/components/messages/RecipientSelector.tsx`
- [ ] Individual tab: member search dropdown
- [ ] Groups tab: checkbox list with member counts
- [ ] Branches tab: checkbox list
- [ ] Everyone tab: confirmation with total count
- [ ] Show total unique recipients
- [ ] **Verify:** Selects recipients correctly

#### Task 5.11: Message History Page
- [ ] Create `/frontend/src/pages/dashboard/MessageHistoryPage.tsx`
- [ ] Table: content preview, status, recipients, delivery rate, sent date
- [ ] Click row to see full details
- [ ] Filter by status and date
- [ ] **Verify:** Shows message history

**Checkpoint 5 Complete When:**
-  Twilio connected to church account
-  Can send SMS to individual member
-  Can send SMS to group
-  Can send SMS to all members
-  Message delivery status updates from Twilio
-  Message history shows sent messages

---

## CHECKPOINT 6: MESSAGE TEMPLATES & AUTOMATION (Days 12-13)
**Goal:** Reusable templates and automated welcome messages

### High-Level Tasks:
- [ ] Message templates CRUD
- [ ] Welcome message automation
- [ ] Recurring messages

### Detailed Task Breakdown:

#### Task 6.1: Templates Database Table
- [ ] Add MessageTemplate model to Prisma schema
- [ ] Fields: id, churchId, name, content, category, usageCount
- [ ] Run migration
- [ ] **Verify:** Table created

#### Task 6.2: Seed Default Templates
- [ ] Create `/backend/prisma/seeds/templates.seed.ts`
- [ ] Add 6 default templates:
  - Service Reminder
  - Event Announcement
  - Prayer Request
  - Thank You
  - Welcome
  - Offering Reminder
- [ ] Run seed script
- [ ] **Verify:** Default templates in database

#### Task 6.3: Templates API
- [ ] GET /api/churches/:churchId/templates
- [ ] POST /api/churches/:churchId/templates (create custom)
- [ ] PUT /api/templates/:id
- [ ] DELETE /api/templates/:id
- [ ] Track appropriate PostHog events
- [ ] **Verify:** CRUD operations work

#### Task 6.4: Templates Page UI
- [ ] Create `/frontend/src/pages/dashboard/TemplatesPage.tsx`
- [ ] List templates (default + custom)
- [ ] Show: name, content preview, category, usage count
- [ ] "Create Template" button
- [ ] Edit/Delete for custom templates only
- [ ] **Verify:** Shows all templates

#### Task 6.5: Template Selector in Composer
- [ ] Add dropdown in SendMessagePage: "Use Template"
- [ ] Click template � fills message textarea
- [ ] "Save as Template" button below textarea
- [ ] **Verify:** Can use and save templates

#### Task 6.6: Welcome Message Job
- [ ] Create `/backend/src/jobs/welcomeMessage.job.ts`
- [ ] Trigger: when GroupMember created and welcomeMessageEnabled = true
- [ ] Delay 1 minute
- [ ] Check if already sent for this member+group
- [ ] Send welcome message via Twilio
- [ ] Mark GroupMember.welcomeMessageSent = true
- [ ] Track "welcome_message_sent" PostHog event
- [ ] **Verify:** Welcome message sends when member added

#### Task 6.7: Welcome Message Settings
- [ ] In Group edit form, add:
  - Toggle: "Send welcome messages"
  - Textarea: "Welcome message text"
  - Default text provided
- [ ] Save to Group.welcomeMessageEnabled and welcomeMessageText
- [ ] **Verify:** Settings save and affect new members

#### Task 6.8: Recurring Messages Database
- [ ] Add RecurringMessage model to Prisma schema
- [ ] Fields: name, content, targetType, targetIds, frequency, dayOfWeek, timeOfDay, nextSendAt
- [ ] Run migration
- [ ] **Verify:** Table created

#### Task 6.9: Recurring Messages API
- [ ] GET /api/churches/:churchId/recurring-messages
- [ ] POST /api/churches/:churchId/recurring-messages
- [ ] PUT /api/recurring-messages/:id
- [ ] DELETE /api/recurring-messages/:id
- [ ] PUT /api/recurring-messages/:id/toggle (pause/resume)
- [ ] Calculate nextSendAt based on frequency
- [ ] **Verify:** CRUD works, nextSendAt calculated

#### Task 6.10: Recurring Messages Job
- [ ] Create `/backend/src/jobs/recurringMessages.job.ts`
- [ ] Cron: runs every minute
- [ ] Find RecurringMessage where isActive=true and nextSendAt <= now
- [ ] Create regular Message record
- [ ] Queue message send
- [ ] Update nextSendAt (add 1 day/week/month)
- [ ] Track "recurring_message_sent" event
- [ ] **Verify:** Sends on schedule

#### Task 6.11: Recurring Messages Page
- [ ] Create `/frontend/src/pages/dashboard/RecurringMessagesPage.tsx`
- [ ] List recurring messages
- [ ] Show: name, frequency, next send (countdown), active status
- [ ] "Create Recurring Message" button
- [ ] Pause/Resume toggle per message
- [ ] **Verify:** Shows recurring messages with countdown

**Checkpoint 6 Complete When:**
-  Can create and use message templates
-  Welcome messages send automatically when members added
-  Can create recurring messages (weekly, daily, monthly)
-  Recurring messages send on schedule

---

## CHECKPOINT 7: ANALYTICS INTEGRATION (Days 14-15)
**Goal:** Complete PostHog tracking and analytics dashboard

### High-Level Tasks:
- [ ] PostHog client setup
- [ ] Track all 65 events
- [ ] Analytics dashboard

### Detailed Task Breakdown:

#### Task 7.1: PostHog Backend Service
- [ ] Create `/backend/src/services/analytics.service.ts`
- [ ] Initialize PostHog client with API key
- [ ] Add `track(eventName, userId, properties)` helper function
- [ ] **Verify:** Can send test event to PostHog

#### Task 7.2: PostHog Frontend Setup
- [ ] Install posthog-js in frontend
- [ ] Initialize in App.tsx with project key
- [ ] Create `/frontend/src/hooks/useAnalytics.ts` hook
- [ ] Auto-track page views
- [ ] **Verify:** Page views appear in PostHog

#### Task 7.3: Add All Event Tracking (Backend)
- [ ] Review all API endpoints
- [ ] Add analytics.track() calls for all events:
  - Authentication events (user_signed_up, user_logged_in, etc.)
  - Branch events (branch_created, branch_edited, etc.)
  - Group events (group_created, group_limit_reached, etc.)
  - Member events (member_added, member_bulk_imported, etc.)
  - Message events (message_sent, message_delivered, etc.)
  - Admin events (co_admin_invited, co_admin_accepted, etc.)
- [ ] Include all required properties per event
- [ ] **Verify:** Events appear in PostHog dashboard

#### Task 7.4: Add All Event Tracking (Frontend)
- [ ] Add useAnalytics hook calls for UI events:
  - Onboarding events (step_completed, onboarding_abandoned)
  - Dashboard views
  - Feature usage
  - Communication mode toggles
- [ ] **Verify:** Frontend events in PostHog

#### Task 7.5: Analytics API - Message Stats
- [ ] GET /api/analytics/messages endpoint
- [ ] Calculate: total messages, delivery rate, reply rate
- [ ] Group by day/week for charts
- [ ] **Verify:** Returns accurate stats

#### Task 7.6: Analytics API - Branch Stats
- [ ] GET /api/analytics/branches endpoint
- [ ] Per branch: member count, message count, engagement
- [ ] **Verify:** Returns stats per branch

#### Task 7.7: Analytics Dashboard Page
- [ ] Create `/frontend/src/pages/dashboard/AnalyticsPage.tsx`
- [ ] Overview cards: Total Messages, Avg Delivery Rate, Avg Reply Rate
- [ ] Message volume chart (line chart by day)
- [ ] Branch comparison (bar chart)
- [ ] Group performance table
- [ ] Date range selector
- [ ] Use recharts library for visualizations
- [ ] **Verify:** All charts render with real data

**Checkpoint 7 Complete When:**
-  All 65 PostHog events tracking
-  Analytics dashboard shows data
-  Charts rendering correctly
-  Can filter by date range and branch

---

## CHECKPOINT 8: BILLING & SUBSCRIPTIONS (Days 16-17)
**Goal:** Stripe payment processing with 3 pricing tiers

### High-Level Tasks:
- [ ] Stripe service integration
- [ ] Subscription management APIs
- [ ] Billing UI and payment flow
- [ ] Plan limit enforcement

### Detailed Task Breakdown:

#### Task 8.1: Stripe Products Setup
- [ ] Create 3 products in Stripe dashboard:
  - STARTER: $49/month
  - GROWTH: $79/month
  - PRO: $99/month
- [ ] Note price IDs
- [ ] **Verify:** Products visible in Stripe

#### Task 8.2: Stripe Service - Customer
- [ ] Update `/backend/src/services/stripe.service.ts`
- [ ] Add `createCustomer(email, name)` (already done in Checkpoint 2)
- [ ] **Verify:** Customer created in Stripe

#### Task 8.3: Stripe Service - Subscription
- [ ] Add `createSubscription(customerId, priceId, paymentMethodId)`
- [ ] Add `updateSubscription(subscriptionId, newPriceId)`
- [ ] Add `cancelSubscription(subscriptionId)`
- [ ] **Verify:** Test each method with Stripe test cards

#### Task 8.4: Stripe Webhooks
- [ ] POST /api/webhooks/stripe endpoint
- [ ] Verify webhook signature
- [ ] Handle events:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed
- [ ] Update Subscription table accordingly
- [ ] Track billing PostHog events
- [ ] **Verify:** Webhooks fire in test mode

#### Task 8.5: Billing APIs
- [ ] POST /api/billing/subscribe (end trial, start subscription)
- [ ] PUT /api/billing/upgrade (change to higher plan)
- [ ] POST /api/billing/cancel (cancel at period end)
- [ ] GET /api/billing/usage (current usage vs limits)
- [ ] **Verify:** Each endpoint works correctly

#### Task 8.6: Plan Limits Config
- [ ] Create `/backend/src/config/plans.ts`
- [ ] Define limits for each plan:
  - STARTER: 1 branch, 500 members, 1000 msgs/month, 1 co-admin
  - GROWTH: 5 branches, 2000 members, 5000 msgs/month, 3 co-admins
  - PRO: 10 branches, unlimited, unlimited, 3 co-admins
- [ ] **Verify:** Config imported successfully

#### Task 8.7: Plan Limit Middleware
- [ ] Create `/backend/src/middleware/limits.middleware.ts`
- [ ] Add `checkBranchLimit` middleware
- [ ] Add `checkMemberLimit` middleware
- [ ] Add `checkMessageLimit` middleware
- [ ] Apply to relevant endpoints
- [ ] Return 400 with upgrade message if exceeded
- [ ] Track "limit_reached" PostHog events
- [ ] **Verify:** Limits enforced

#### Task 8.8: Subscribe Page UI
- [ ] Create `/frontend/src/pages/billing/SubscribePage.tsx`
- [ ] Pricing table (3 columns)
- [ ] Feature comparison
- [ ] Select plan button
- [ ] Stripe payment form (CardElement)
- [ ] Submit subscribes and ends trial
- [ ] **Verify:** Can subscribe to plan

#### Task 8.9: Billing Page UI
- [ ] Create `/frontend/src/pages/dashboard/settings/BillingPage.tsx`
- [ ] Show current plan
- [ ] Usage indicators (progress bars for branches, members, messages)
- [ ] Payment method display
- [ ] "Upgrade Plan" button
- [ ] "Cancel Subscription" button
- [ ] **Verify:** Shows current subscription

#### Task 8.10: Trial Banner Component
- [ ] Create `/frontend/src/components/TrialBanner.tsx`
- [ ] Show at top of dashboard
- [ ] "X days left in trial"
- [ ] Color-coded: green (8+ days), yellow (4-7), red (1-3)
- [ ] "Subscribe Now" button
- [ ] **Verify:** Shows correct days remaining

#### Task 8.11: Trial Expiry Handling
- [ ] Create middleware: requireActiveSubscription
- [ ] Check: trial active OR subscription active
- [ ] If expired and no subscription, return 402
- [ ] Apply to message-sending endpoints
- [ ] **Verify:** Cannot send messages after trial expires

**Checkpoint 8 Complete When:**
-  Can subscribe to any plan via Stripe
-  Trial countdown visible
-  Plan limits enforced
-  Usage indicators accurate
-  Can upgrade/downgrade plans
-  Cannot use features after trial expires without subscription

---

## CHECKPOINT 9: TESTING & POLISH (Days 18-20)
**Goal:** Comprehensive testing and UI improvements (extended to 3 days for quality)

### High-Level Tasks:
- [ ] Unit tests for critical functions
- [ ] Integration tests for APIs
- [ ] Security testing
- [ ] UI/UX polish
- [ ] Accessibility improvements

### Detailed Task Breakdown:

#### Task 9.1: Unit Tests - Backend
- [ ] Install Jest and testing libraries
- [ ] Test JWT utilities (generate, verify)
- [ ] Test password utilities (hash, compare)
- [ ] Test phone formatting utilities
- [ ] Test recipient resolution logic
- [ ] Test CSV parser
- [ ] Aim for 70%+ coverage on critical functions
- [ ] **Verify:** npm test passes

#### Task 9.2: Integration Tests - Auth
- [ ] Install supertest
- [ ] Test POST /api/auth/register (success and errors)
- [ ] Test POST /api/auth/login (success and errors)
- [ ] Test POST /api/auth/refresh
- [ ] **Verify:** All tests pass

#### Task 9.3: Integration Tests - Messaging
- [ ] Test POST /api/messages/send (all target types)
- [ ] Test message sending job
- [ ] Test webhook handling
- [ ] **Verify:** All tests pass

#### Task 9.4: Security Audit
- [ ] Test SQL injection prevention (Prisma handles)
- [ ] Test XSS prevention (React escapes)
- [ ] Test CSRF protection
- [ ] Test rate limiting on all endpoints
- [ ] Test authentication bypass attempts
- [ ] Test accessing other church's data
- [ ] **Verify:** All attacks prevented

#### Task 9.5: UI Responsive Design
- [ ] Test all pages at 375px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1920px (desktop)
- [ ] Fix any layout breaks
- [ ] Ensure touch-friendly buttons (44px min)
- [ ] **Verify:** All pages responsive

#### Task 9.6: Loading States
- [ ] Add skeleton loaders for data fetching
- [ ] Add spinners for button actions
- [ ] Add progress bars for file uploads
- [ ] **Verify:** No blank screens during loading

#### Task 9.7: Error Handling UI
- [ ] Toast notifications for all errors
- [ ] Inline validation errors on forms
- [ ] 404 page
- [ ] 500 error page
- [ ] **Verify:** All errors have user-friendly messages

#### Task 9.8: Accessibility (WCAG 2.1 AA)
- [ ] Ensure all interactive elements keyboard accessible
- [ ] Add ARIA labels where needed
- [ ] Check color contrast (4.5:1 minimum)
- [ ] Add alt text to images
- [ ] Test with screen reader
- [ ] **Verify:** Can navigate entire app with keyboard

#### Task 9.9: Performance Optimization
- [ ] Run Lighthouse audit (aim for 90+ score)
- [ ] Optimize images
- [ ] Add database indexes if missing
- [ ] Implement Redis caching for analytics
- [ ] **Verify:** Page loads < 2 seconds

**Checkpoint 9 Complete When:**
-  Unit tests passing (70%+ coverage)
-  Integration tests passing
-  Security audit clean
-  All pages responsive
-  Accessibility compliant
-  Performance optimized

---

## CHECKPOINT 10: DEPLOYMENT & LAUNCH (Day 21)
**Goal:** Deploy to production and onboard first beta users

### High-Level Tasks:
- [ ] Production environment setup
- [ ] Database deployment
- [ ] Frontend and backend deployment
- [ ] Webhook configuration
- [ ] Beta user onboarding

### Detailed Task Breakdown:

#### Task 10.1: Database (Railway)
- [ ] Create Railway account and project
- [ ] Add PostgreSQL plugin
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Run seed: `npx prisma db seed`
- [ ] **Verify:** Database accessible

#### Task 10.2: Backend Deployment (Railway)
- [ ] Connect GitHub repo to Railway
- [ ] Configure build commands
- [ ] Add all production environment variables
- [ ] Deploy backend
- [ ] Test API health endpoint
- [ ] **Verify:** API responding

#### Task 10.3: Frontend Deployment (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repo
- [ ] Configure build settings
- [ ] Add production environment variables
- [ ] Deploy frontend
- [ ] **Verify:** App loads

#### Task 10.4: Custom Domains (Optional)
- [ ] Configure api.yourdomain.com � Railway
- [ ] Configure app.yourdomain.com � Vercel
- [ ] Update environment variables with new URLs
- [ ] **Verify:** SSL working

#### Task 10.5: Webhook Configuration
- [ ] Update Twilio webhooks to production URLs
- [ ] Update Stripe webhooks to production URLs
- [ ] Test by sending SMS and checking delivery
- [ ] **Verify:** Webhooks firing

#### Task 10.6: Monitoring Setup
- [ ] Set up Sentry for error tracking
- [ ] Configure uptime monitoring (UptimeRobot)
- [ ] Set up alert emails
- [ ] **Verify:** Can see errors in Sentry

#### Task 10.7: Smoke Testing in Production
- [ ] Register new church account
- [ ] Complete onboarding
- [ ] Connect Twilio
- [ ] Add members
- [ ] Send test message
- [ ] Verify SMS received
- [ ] Subscribe to plan
- [ ] **Verify:** All critical flows work

#### Task 10.8: Beta User Materials
- [ ] Create welcome email template
- [ ] Create getting started guide
- [ ] Create feedback survey (Google Form)
- [ ] Set up support email
- [ ] **Verify:** Materials ready

#### Task 10.9: Invite First 3 Beta Users
- [ ] Send welcome emails with signup link
- [ ] Monitor their activity in PostHog
- [ ] Be available for support
- [ ] **Verify:** Beta users signing up

#### Task 10.10: Launch Day Monitoring
- [ ] Monitor error rates (Sentry)
- [ ] Monitor performance
- [ ] Respond to support requests
- [ ] Fix critical bugs immediately
- [ ] **Verify:** No critical issues

**Checkpoint 10 Complete When:**
-  Application deployed to production
-  All webhooks configured
-  Monitoring active
-  First beta users onboarded
-  No critical bugs

---

## > SPECIALIZED AGENT INSTRUCTIONS

### AGENT 1: MARKETING BACKGROUND RESEARCH

**Role:** Research the church communication market to inform positioning and messaging

**Tasks:**
1. **Competitive Analysis**
   - Research 5-10 existing church SMS platforms
   - Document: pricing, features, target audience, positioning
   - Identify gaps in current solutions
   - Note: what do they do well? what's missing?

2. **Target Audience Research**
   - Profile: churches with 100-250 members, 3-10 locations
   - Current pain points with communication
   - Technology adoption level
   - Budget constraints
   - Decision-making process

3. **Pricing Research**
   - What do competitors charge?
   - What's the perceived value of SMS communication?
   - Willingness to pay for church tech
   - Freemium vs. paid models

4. **Marketing Channels**
   - Where do church leaders look for solutions?
   - Church tech forums, conferences, blogs
   - Social media presence of churches
   - Word-of-mouth patterns

5. **Messaging Strategy**
   - Value propositions that resonate
   - Language and tone for church audience
   - Key differentiators to emphasize
   - Objections to overcome

**Deliverable:**
- Markdown document: `/docs/MARKETING_RESEARCH.md`
- Sections: Competitive landscape, Target audience, Pricing analysis, Go-to-market strategy
- Recommended positioning statement
- Key marketing messages

**Timeline:** Complete before Week 2 to inform feature prioritization

---

### AGENT 2: USER NEEDS RESEARCH

**Role:** Deep dive into church communication needs to validate and enhance features

**Tasks:**
1. **User Interviews (if possible)**
   - Interview 5-10 church administrators
   - Questions:
     - How do you currently communicate with members?
     - What's frustrating about current methods?
     - How often do you send messages?
     - What information do you send?
     - How do you organize members (groups, locations)?
     - What metrics matter to you?

2. **Use Case Documentation**
   - Document 10-15 specific use cases:
     - Sunday service reminders
     - Event announcements
     - Prayer requests
     - Volunteer coordination
     - Giving campaigns
     - Emergency notifications
   - For each: frequency, audience, content, timing

3. **Workflow Analysis**
   - Map current workflow: from message idea � sent
   - Pain points at each step
   - Time spent on communication tasks
   - Tools currently used

4. **Feature Prioritization**
   - Which proposed features solve biggest pain?
   - Which features are "must-have" vs "nice-to-have"?
   - Missing features not in current plan?

5. **Success Metrics**
   - What does success look like for churches?
   - How do they measure communication effectiveness?
   - What would make them switch from current solution?

**Deliverable:**
- Markdown document: `/docs/USER_RESEARCH.md`
- Sections: Use cases, Workflows, Pain points, Feature validation
- Priority matrix (must-have vs. nice-to-have)
- User personas (3-4 types of church administrators)

**Timeline:** Complete during Week 1 to inform Week 2+ development

---

### AGENT 3: FEATURE PLANNING & ROADMAP

**Role:** Create a long-term product roadmap beyond the 4-week MVP

**Tasks:**
1. **Phase 1 Review (MVP - 4 weeks)**
   - Review all features in Checkpoints 1-10
   - Validate scope is achievable
   - Flag any features that could be deferred
   - Recommend simplifications if timeline at risk

2. **Phase 2 Planning (Weeks 5-8)**
   - Advanced automation workflows
   - Native mobile apps (iOS/Android)
   - Email integration
   - Enhanced analytics
   - API for third-party integrations
   - Priority: what brings most value soonest?

3. **Phase 3 Planning (Months 3-6)**
   - Team permissions (granular roles)
   - Advanced reporting (custom reports)
   - WhatsApp integration
   - Voice calls (Twilio Voice)
   - Multi-language support
   - Contact forms for websites

4. **Ongoing Features (6+ months)**
   - AI-powered message suggestions
   - Predictive analytics
   - Integration with church management systems
   - Member mobile app (not admin app)
   - Advanced segmentation

5. **Technical Debt Management**
   - Identify potential technical debt from MVP speed
   - Plan refactoring sprints
   - Scalability improvements
   - Performance optimizations

6. **Feature Gating Strategy**
   - Which features are premium (Pro plan only)?
   - Which enable upgrades from Starter � Growth?
   - Free tier limitations?

**Deliverable:**
- Markdown document: `/docs/PRODUCT_ROADMAP.md`
- Sections: Phase 1 (MVP), Phase 2, Phase 3, Long-term vision
- Feature prioritization using RICE framework:
  - Reach: How many users?
  - Impact: How much value?
  - Confidence: How sure are we?
  - Effort: How long to build?
- Quarterly release plan for Year 1
- Recommended feature gating by plan tier

**Timeline:**
- Initial roadmap: During Week 2 (before building advanced features)
- Updates: Review every 2 weeks based on user feedback

---

## =� PROJECT PLAN REVIEW PROCESS

### How We'll Use This Plan:

1. **Week 0 (Before starting):**
   - Review entire project plan together
   - Clarify any ambiguities
   - Adjust timeline if needed
   - Get specialized agent research started

2. **Daily:**
   - Start each day reviewing that day's checkpoint
   - Follow tasks sequentially
   - Verify each task before moving to next
   - End each day with git commit

3. **End of Each Checkpoint:**
   - Run all verification steps
   - Ensure "Complete When" criteria met
   - Don't proceed until checkpoint solid
   - Update plan if adjustments needed

4. **Weekly Review:**
   - End of Weeks 1, 2, 3: Review progress
   - Are we on track? Behind? Ahead?
   - Which features working well?
   - What's taking longer than expected?
   - Adjust next week's plan accordingly

5. **Agent Research Integration:**
   - Marketing research informs messaging/positioning
   - User research validates/adjusts features
   - Feature planning guides post-MVP work

---

## =� SUCCESS CRITERIA

### By End of Week 1:
-  Can register, login, logout
-  Can create branches and groups
-  Can add members via CSV
-  Can send SMS to members
-  Messages delivered and tracked

### By End of Week 2:
-  Message templates working
-  Welcome messages automated
-  Recurring messages scheduled
-  Analytics tracking all events

### By End of Week 3:
-  Stripe billing integrated
-  Plan limits enforced
-  UI polished and responsive
-  Tests passing
-  Ready for production

### By End of Week 4:
-  Deployed to production
-  Monitoring active
-  5-10 beta users onboarded
-  Support system operational
-  Ready to scale

---

## =� TRACKING & METRICS

### Development Metrics:
- Tasks completed per day (target: 8-12)
- Git commits per day (target: 3-5)
- Tests passing (maintain 100% pass rate)
- API endpoints completed (target: 50+ total)
- UI pages completed (target: 25+ total)

### Product Metrics (Post-Launch):
- Beta users signed up
- Messages sent per day
- Average delivery rate (target: 95%+)
- Trial-to-paid conversion rate
- User engagement (DAU/MAU)

---

## <� PHILOSOPHY & PRINCIPLES

1. **Simple Over Complex:** Every task should be as simple as possible. Avoid clever code.

2. **Working Over Perfect:** Ship working features, iterate later. Don't optimize prematurely.

3. **Tested Over Assumed:** Verify each task works before moving on. No assumptions.

4. **Incremental Over Big Bang:** Small, frequent commits. Each checkpoint is shippable.

5. **User Value Over Feature Count:** Focus on features churches actually need. Cut ruthlessly if behind.

6. **Communication Over Silence:** Update plan if stuck. Ask for help early. Document decisions.

---

**Next Step:** Review this plan together, make any adjustments, then begin Checkpoint 1!

