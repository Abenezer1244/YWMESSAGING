# CHECKPOINT 1: FOUNDATION SETUP - Working Todo List
**Days 1-2 | Goal:** Complete project structure, database schema, and environment setup

---

## Task 1.1: Project Initialization

- [ ] Create GitHub repository "connect-yw-platform"
- [ ] Initialize root package.json with npm workspaces
- [ ] Create `/frontend` folder with Vite + React + TypeScript
- [ ] Create `/backend` folder with Express + TypeScript
- [ ] Add .gitignore for Node.js projects
- [ ] Set up ESLint and Prettier configs
- [ ] Create README.md with basic setup instructions
- [ ] **Verify:** Both `npm install` commands run without errors

---

## Task 1.2: Database Schema Design

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

---

## Task 1.3: Environment Configuration

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

---

## Task 1.3b: Redis & Bull Setup (Job Queue)

- [ ] Install Redis and Bull packages in backend
- [ ] Create `/backend/src/config/redis.config.ts` (Redis client connection)
- [ ] Create `/backend/src/jobs/queue.ts` (Bull queue initialization)
- [ ] Add `mailQueue`, `smsQueue`, `analyticsQueue` job queues
- [ ] **Verify:** Can connect to Redis, queues initialize without errors

---

## Task 1.3c: SendGrid Email Service Setup

- [ ] Install SendGrid package
- [ ] Create `/backend/src/services/sendgrid.service.ts`
- [ ] Add `sendEmail(to, subject, template, variables)` function
- [ ] Create email templates for: password reset, welcome, invitation
- [ ] **Verify:** Can send test email via SendGrid

---

## Task 1.4: Run Initial Migration

- [ ] Run `npx prisma migrate dev --name initial_schema`
- [ ] Open Prisma Studio to verify all tables created
- [ ] **Verify:** 11+ tables visible in Prisma Studio

---

## Task 1.5: Basic Backend Structure

- [ ] Create `/backend/src/index.ts` (Express server entry point)
- [ ] Create `/backend/src/app.ts` (Express app configuration)
- [ ] Set up CORS middleware
- [ ] Set up Helmet for security headers
- [ ] Add body-parser middleware
- [ ] Create health check endpoint: GET /health
- [ ] **Verify:** Server starts on port 3000, /health returns 200

---

## Task 1.6: Basic Frontend Structure

- [ ] Create `/frontend/src/main.tsx` (React entry point)
- [ ] Create `/frontend/src/App.tsx` (Root component)
- [ ] Set up React Router
- [ ] Configure Tailwind CSS
- [ ] Create basic layout component
- [ ] **Verify:** Dev server starts on port 5173, homepage loads

---

## ✅ CHECKPOINT 1 COMPLETE WHEN:

- ✓ Both frontend and backend servers start without errors
- ✓ Database schema migrated with all tables (11+)
- ✓ Docker containers (Postgres, Redis) running
- ✓ Environment variables configured
- ✓ Health check endpoint working (GET /health → 200)
- ✓ Can send test email via SendGrid
- ✓ Bull queues initialized, Redis connection working

---

## 📝 REVIEW SECTION

### Changes Made:
(To be filled in as you complete tasks)

### Issues Encountered:
(To be filled in as you complete tasks)

### Lessons Learned:
(To be filled in as you complete tasks)
