# Staging Deployment Guide

**Last Updated:** 2024-10-30
**Target Platform:** Render.com (or similar Node.js hosting)
**Estimated Setup Time:** 30-45 minutes
**Difficulty Level:** Intermediate

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Migration](#database-migration)
6. [Testing Checklist](#testing-checklist)
7. [Pre-Production Verification](#pre-production-verification)
8. [Monitoring & Logging](#monitoring--logging)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Requirements

- [ ] Git repository set up with main/staging branches
- [ ] Render.com account (or alternative hosting platform)
- [ ] PostgreSQL database provisioned (staging environment)
- [ ] Stripe test account with test keys
- [ ] SendGrid account for emails (if applicable)
- [ ] Domain name for staging (optional but recommended)
- [ ] SSL certificate (auto-provisioned by Render)

### Recommended Setup

```
Staging Environment:
├── Backend: Render Web Service (Node.js/Express)
├── Frontend: Render Static Site (React)
├── Database: Render PostgreSQL
├── Email: SendGrid
└── Payments: Stripe (Test Mode)
```

---

## Environment Setup

### Step 1: Create Render Services

#### A. PostgreSQL Database

1. **Create Database:**
   - Log in to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Name: `ywmessaging-staging-db`
   - Region: Choose closest to your users
   - PostgreSQL Version: 14+
   - Plan: Free or Standard
   - Click "Create Database"

2. **Save Credentials:**
   ```
   Internal Database URL: (provided by Render)
   External Database URL: (for local development)
   Username: postgres
   Database Name: (provided)
   ```

#### B. Backend Web Service

1. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `ywmessaging-staging-api`
   - Branch: `staging` or `main`
   - Root Directory: `backend`
   - Environment: `node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start` or `node dist/server.js`
   - Plan: Free or Starter

2. **Configure Service:**
   - Region: Same as database
   - Auto-deploy: Enable
   - Redirect HTTP to HTTPS: Enable
   - Health check path: `/health`

#### C. Frontend Static Site

1. **Create Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Name: `ywmessaging-staging-web`
   - Branch: `staging` or `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Plan: Free

2. **Configure Service:**
   - Region: Same as backend
   - Auto-deploy: Enable

---

### Step 2: Set Environment Variables

#### Backend Environment Variables

In Render Dashboard → ywmessaging-staging-api → Environment:

```env
# Database
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Node Environment
NODE_ENV=staging

# Frontend URL (for CORS)
FRONTEND_URL=https://ywmessaging-staging-web.onrender.com

# JWT Secrets (Generate using: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-key-here
REFRESH_SECRET=your-refresh-secret-key-here
COOKIE_SECRET=your-cookie-secret-key-here

# Stripe (Test Keys - from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_WEBHOOK_SECRET_HERE

# Email (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Optional: Feature Flags
ENABLE_PAYMENT_PROCESSING=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

#### Frontend Environment Variables

In Render Dashboard → ywmessaging-staging-web → Environment:

```env
# API Configuration
VITE_API_URL=https://ywmessaging-staging-api.onrender.com/api

# Stripe (Publishable Key - from https://dashboard.stripe.com/test/apikeys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Environment
VITE_ENV=staging
```

---

## Backend Deployment

### Step 1: Prepare Backend

```bash
# 1. Ensure all changes are committed
git status
git add .
git commit -m "Prepare for staging deployment"

# 2. Switch to staging branch
git checkout -b staging
git push origin staging

# 3. Verify build locally
npm run build
# Should complete successfully
```

### Step 2: Deploy to Render

**Automatic Deployment:**
- Push to `staging` branch on GitHub
- Render automatically detects and deploys
- View logs: Render Dashboard → ywmessaging-staging-api → Logs

**Monitor Deployment:**
```bash
# SSH into Render service (optional)
# View real-time logs
```

### Step 3: Verify Backend

```bash
# Test health endpoint
curl https://ywmessaging-staging-api.onrender.com/health
# Expected: { "status": "ok", "timestamp": "2024-10-30T..." }

# Test API endpoint
curl https://ywmessaging-staging-api.onrender.com/api/csrf-token
# Expected: { "csrfToken": "..." }

# Check security headers
curl -I https://ywmessaging-staging-api.onrender.com/health
# Should show: Content-Security-Policy, Strict-Transport-Security, etc.
```

---

## Frontend Deployment

### Step 1: Prepare Frontend

```bash
# 1. Update API URL in .env or environment
# VITE_API_URL=https://ywmessaging-staging-api.onrender.com/api

# 2. Build locally to verify
npm run build

# 3. Commit and push
git push origin staging
```

### Step 2: Deploy to Render

**Automatic Deployment:**
- Push to `staging` branch on GitHub
- Render builds and deploys automatically
- Deployment usually takes 2-3 minutes

**Monitor Deployment:**
- Render Dashboard → ywmessaging-staging-web → Logs
- Wait for "Deployed successfully" message

### Step 3: Verify Frontend

```bash
# Visit the staging URL
https://ywmessaging-staging-web.onrender.com

# Verify:
1. [ ] Page loads without errors
2. [ ] Logo and branding visible
3. [ ] CSS/styles applied correctly
4. [ ] Network requests go to staging API
5. [ ] Login page displays
```

---

## Database Migration

### Step 1: Run Database Migrations

If using migrations (Prisma, Sequelize, etc.):

```bash
# Connect to staging database
DATABASE_URL=postgresql://... npm run migrate

# Or via Render CLI:
# render run npm run migrate
```

### Step 2: Seed Data (Optional)

```bash
# Create test data for staging
npm run seed:staging

# This should create:
# - Test admin users
# - Test organizations
# - Sample messages/templates
```

### Step 3: Verify Database

```bash
# Connect to database and verify structure
psql postgresql://username:password@hostname:5432/database_name

# Query tables
\dt
# Should show: users, churches, messages, etc.

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM churches;
```

---

## Testing Checklist

### Unit 1: Authentication

```bash
# [ ] Login with test credentials
curl -X POST https://ywmessaging-staging-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Expected: { "success": true, "user": {...} }

# [ ] Invalid credentials rejected
# [ ] Rate limiting active (5 attempts per 15 min)
# [ ] Tokens set in HTTPOnly cookies (after migration)
```

### Unit 2: Security Headers

```bash
# [ ] CSP header present
curl -I https://ywmessaging-staging-api.onrender.com/health | grep Content-Security-Policy

# [ ] HSTS header present
curl -I https://ywmessaging-staging-api.onrender.com/health | grep Strict-Transport-Security

# [ ] X-Frame-Options: DENY
curl -I https://ywmessaging-staging-api.onrender.com/health | grep X-Frame-Options

# [ ] X-Content-Type-Options: nosniff
curl -I https://ywmessaging-staging-api.onrender.com/health | grep X-Content-Type-Options
```

### Unit 3: CORS Configuration

```bash
# [ ] Frontend requests succeed
curl -X OPTIONS https://ywmessaging-staging-api.onrender.com/api/csrf-token \
  -H "Origin: https://ywmessaging-staging-web.onrender.com" \
  -H "Access-Control-Request-Method: GET"

# Expected: Access-Control-Allow-Origin header present
```

### Unit 4: Stripe Integration

```bash
# [ ] Stripe keys configured correctly
# [ ] Payment intent creation works
# [ ] Test card (4242 4242 4242 4242) accepted
# [ ] Invalid card (4000 0000 0000 0002) rejected
# [ ] Card never exposed in console/network
```

### Unit 5: Rate Limiting

```bash
# [ ] Auth endpoints limited to 5 per 15 min
# [ ] Billing endpoints limited to 5 per 15 min
# [ ] General API limited to 100 per 15 min
# [ ] 429 responses have proper headers
```

### Unit 6: Frontend Features

```bash
# [ ] Landing page loads
# [ ] Login/register pages functional
# [ ] Dashboard loads after authentication
# [ ] Navigation between pages works
# [ ] API requests complete successfully
# [ ] Error messages display properly
# [ ] No console errors (check DevTools)
```

---

## Pre-Production Verification

### Security Verification

- [ ] **SSL/HTTPS Enabled**
  ```bash
  curl -I https://ywmessaging-staging-api.onrender.com/health
  # Should show: HTTP/1.1 200 (not 301 redirect)
  ```

- [ ] **Security Headers Present**
  ```bash
  curl -I https://ywmessaging-staging-api.onrender.com/health
  # Check for: CSP, HSTS, X-Frame-Options, etc.
  ```

- [ ] **CORS Properly Configured**
  ```bash
  # Only frontend domain allowed
  # Wildcard "*" NOT used
  ```

- [ ] **Rate Limiting Active**
  ```bash
  # Make 6 auth requests
  # 6th should return 429
  ```

- [ ] **Error Messages Generic**
  ```bash
  # 500 errors show: "Something went wrong"
  # NOT: Stack traces or internal details
  ```

### Performance Verification

- [ ] **Frontend Bundle Size**
  - Acceptable: < 1MB (gzipped)
  - Check: `npm run build` output

- [ ] **Page Load Time**
  - Target: < 3 seconds (first contentful paint)
  - Tool: Lighthouse, WebPageTest

- [ ] **API Response Time**
  - Target: < 500ms (p95)
  - Check: Network tab in DevTools

### Data Verification

- [ ] **Database Connected**
  - Verify: Data visible in admin dashboard

- [ ] **Migrations Applied**
  - Check: All table schemas present

- [ ] **No Sensitive Data Exposed**
  - API responses: No passwords, tokens, etc.
  - Logs: No sensitive information

---

## Monitoring & Logging

### Step 1: Set Up Logging

In backend `.env`:
```env
LOG_LEVEL=info
LOG_FORMAT=json

# Optional: External logging service
LOG_SERVICE=datadog  # or sentry, loggly, etc.
LOG_SERVICE_KEY=your-api-key
```

### Step 2: Configure Alerts

**Render Notifications:**
- Render Dashboard → Settings → Notifications
- Email notifications for deployment failures
- Slack integration (optional)

**Application Monitoring:**

```typescript
// Example: Sentry integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.errorHandler());
```

### Step 3: Monitor Key Metrics

```bash
# Health checks
# - API response time
# - Database connection status
# - Error rate (5xx responses)

# Security metrics
# - Rate limit hits
# - Failed authentication attempts
# - Unusual traffic patterns

# Performance metrics
# - Average response time
# - Requests per second
# - Database query time
```

---

## Rollback Procedures

### Scenario 1: Frontend Rollback

If frontend deployment causes issues:

```bash
# Option 1: Redeploy previous build
git revert HEAD
git push origin staging
# Render auto-deploys

# Option 2: Manual rollback in Render
# Render Dashboard → ywmessaging-staging-web
# → Deployments → Previous deployment → Redeploy
```

### Scenario 2: Backend Rollback

If backend deployment causes critical errors:

```bash
# Option 1: Quick revert
git revert HEAD
git push origin staging
# Render auto-deploys (takes ~2-3 min)

# Option 2: Database rollback (if migrations failed)
DATABASE_URL=postgresql://... npm run migrate:down
```

### Scenario 3: Database Rollback

If migrations introduced issues:

```bash
# Revert migration
npm run migrate:down

# Or restore from backup
# (Ensure backups configured in Render)
```

---

## Environment-Specific Configuration

### Staging (`staging` branch)

```env
NODE_ENV=staging
FRONTEND_URL=https://ywmessaging-staging-web.onrender.com
DATABASE_URL=postgresql://staging-db
STRIPE_KEYS=sk_test_...
LOG_LEVEL=info
DEBUG=false
```

### Production (`main` branch)

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=postgresql://production-db
STRIPE_KEYS=sk_live_...
LOG_LEVEL=error
DEBUG=false
ENABLE_UPTIME_MONITORING=true
```

---

## Post-Deployment Checklist

After successful deployment, verify:

### Immediate (First Hour)

- [ ] Both services show "Live" status in Render
- [ ] Frontend accessible and loads without errors
- [ ] Backend health endpoint responds
- [ ] HTTPS working (no mixed content warnings)
- [ ] Logs show no errors
- [ ] Security headers present

### Short-term (First Day)

- [ ] Users can login successfully
- [ ] All major features working (send message, etc.)
- [ ] Payment processing works (test transaction)
- [ ] Emails sent successfully (if applicable)
- [ ] Rate limiting working correctly
- [ ] No spike in error rate

### Mid-term (First Week)

- [ ] Monitor error logs for patterns
- [ ] Check database performance
- [ ] Verify backup procedures working
- [ ] Monitor API response times
- [ ] Check SSL certificate (valid expiry)
- [ ] Review security audit logs

---

## Troubleshooting

### Issue: Frontend Cannot Connect to API

**Symptoms:**
- "CORS error" in console
- "Failed to fetch" errors
- Network requests showing 0 bytes

**Solutions:**
```bash
# 1. Check CORS configuration
# Verify: FRONTEND_URL env var matches actual URL

# 2. Check API is running
curl https://ywmessaging-staging-api.onrender.com/health

# 3. Check firewall/security groups
# Render allows all outbound by default

# 4. Check frontend env variable
# VITE_API_URL should be full URL with /api
```

### Issue: Deployment Takes Too Long

**Symptoms:**
- Build step stalled
- "Waiting for build..." for >10 minutes

**Solutions:**
```bash
# 1. Check build logs in Render dashboard
# 2. Verify npm dependencies resolve
npm ci --production

# 3. Check disk space
du -sh node_modules/

# 4. Clear build cache
# Render → Service → Settings → Clear Build Cache
```

### Issue: Database Connection Failed

**Symptoms:**
- "ECONNREFUSED" error
- "Unable to connect to database"

**Solutions:**
```bash
# 1. Verify DATABASE_URL is set
echo $DATABASE_URL

# 2. Test connection locally
psql $DATABASE_URL -c "SELECT 1"

# 3. Check database is running
# Render dashboard → PostgreSQL service status

# 4. Verify IP whitelist (if applicable)
# Render allows all connections by default
```

### Issue: Stripe Integration Not Working

**Symptoms:**
- Payment page shows error
- "Stripe is not defined"
- Invalid key errors

**Solutions:**
```bash
# 1. Verify keys are correct (TEST keys, not LIVE)
echo $STRIPE_SECRET_KEY  # Should start with sk_test_

# 2. Check key hasn't expired
# Stripe dashboard → Developers → API Keys

# 3. Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# 4. Check CSP allows Stripe domains
# Should include: https://js.stripe.com
```

### Issue: Rate Limiting Too Strict

**Symptoms:**
- Getting 429 errors on legitimate requests
- Users locked out

**Solutions:**
```bash
# 1. Check IP detection working
# Rate limits are per-IP

# 2. If behind proxy, verify X-Forwarded-For trusted
app.set('trust proxy', 1)

# 3. Temporarily increase limits for testing
# RATE_LIMIT_MAX_REQUESTS=1000

# 4. Check rate limit headers
curl -I https://api.onrender.com/api/messages
# Look for: RateLimit-Remaining
```

---

## Success Criteria

You'll know deployment is successful when:

✅ **Infrastructure:**
- Backend service shows "Live"
- Frontend service shows "Live"
- Database connection working
- All environment variables set

✅ **Functionality:**
- Users can login
- Messages can be sent
- Payment processing works
- All API endpoints respond

✅ **Security:**
- HTTPS enforced
- Security headers present
- Rate limiting active
- No sensitive data in logs

✅ **Performance:**
- Page load time < 3s
- API response time < 500ms
- Database queries < 100ms

---

## Next Steps

1. **Staging Testing:** Test all features for 1-2 days
2. **Bug Fixes:** Address any issues found
3. **Documentation:** Update team on deployment process
4. **Production Deployment:** When ready, follow same process with production keys/URLs
5. **Monitoring:** Set up alerts for production
6. **Incident Response:** Plan for rollback/recovery

---

## Resources

- [Render Documentation](https://render.com/docs)
- [Render Deployment Best Practices](https://render.com/docs/deploy-docker)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Questions?** Refer to specific section or check logs in Render dashboard.
