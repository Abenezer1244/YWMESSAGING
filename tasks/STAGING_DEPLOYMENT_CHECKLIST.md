# Staging Deployment Checklist

**Start Date:** 2024-10-30
**Target:** Deploy to Render.com (or similar)
**Estimated Time:** 2-4 hours

---

## Pre-Deployment Setup (30 minutes)

### ✅ Prerequisites Check

- [ ] **GitHub Account**
  - Logged in and repository accessible
  - Branch: `main` is up to date with latest code
  - Verify: `git log --oneline -1` shows security commit

- [ ] **Render.com Account**
  - Sign up at https://render.com
  - Verify email
  - Payment method added (Free tier available)

- [ ] **Required Credentials**
  - [ ] Stripe Test Keys (from dashboard.stripe.com)
    - Publishable Key: `pk_test_...`
    - Secret Key: `sk_test_...`
  - [ ] SendGrid API Key (optional)
  - [ ] Database credentials (will be provided by Render)

### ✅ Code Verification

```bash
# 1. Verify latest code is pushed
git log --oneline -1
# Should show: "feat: Implement comprehensive security hardening"

# 2. Verify build works locally
npm run build
# Should complete in ~15 seconds with no errors

# 3. Verify no uncommitted changes
git status
# Should show: "working tree clean"
```

---

## Step 1: Create Render Services (45 minutes)

### 1A. Create PostgreSQL Database

**In Render Dashboard:**

```
1. Click "New +" → "PostgreSQL"
2. Name: ywmessaging-staging-db
3. Region: Choose closest to users
4. PostgreSQL Version: 14 or later
5. Plan: Free or Standard
6. Click "Create Database"
```

**After Creation:**
```
✅ Save these values (you'll need them):
- Internal Database URL: postgresql://...
- External Database URL: postgresql://...  (for local dev)
- Username: postgres
- Database Name: (provided by Render)
- Region: (noted above)
```

**Expected Time:** 5 minutes

**Troubleshoot If:**
- Database doesn't appear: Refresh page or wait 30 seconds
- Connection fails: Verify database is in "Available" state

---

### 1B. Create Backend Web Service

**In Render Dashboard:**

```
1. Click "New +" → "Web Service"
2. Connect GitHub repository
   - Authorize Render with GitHub
   - Select: Abenezer1244/YWMESSAGING
3. Configure Service:
   - Name: ywmessaging-staging-api
   - Branch: main
   - Root Directory: backend
   - Environment: node
   - Build Command: npm install && npm run build
   - Start Command: npm start
4. Plan: Free or Starter ($7/month)
5. Region: Same as database (important!)
6. Click "Create Web Service"
```

**Configuration:**
```
- Auto-deploy: Enable (automatic deploys when you push)
- Redirect HTTP to HTTPS: Enable
- Health check path: /health
```

**Expected Time:** 10 minutes
- First deploy will take 3-5 minutes

**What to Expect:**
- Yellow status → Building
- Green status → Live ✅
- Red status → Error (check logs)

---

### 1C. Create Frontend Static Site

**In Render Dashboard:**

```
1. Click "New +" → "Static Site"
2. Connect GitHub repository (already authorized)
3. Configure Service:
   - Name: ywmessaging-staging-web
   - Branch: main
   - Root Directory: frontend
   - Build Command: npm install && npm run build
   - Publish Directory: dist
4. Plan: Free
5. Region: Same region as backend
6. Click "Create Static Site"
```

**Expected Time:** 5 minutes
- Deploy will take 2-3 minutes

**What Happens:**
- Render runs build command
- Deploys `dist/` folder as static site
- Assigns URL: `https://ywmessaging-staging-web.onrender.com`

---

**Milestone:** ✅ All three services created

---

## Step 2: Configure Environment Variables (30 minutes)

### 2A. Backend Environment Variables

**In Render Dashboard → ywmessaging-staging-api → Environment:**

```bash
# Database
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Node Environment
NODE_ENV=staging

# Frontend URL (for CORS)
FRONTEND_URL=https://ywmessaging-staging-web.onrender.com

# JWT Secrets (Generate using: openssl rand -base64 32)
JWT_SECRET=<generate-random-32-char-string>
REFRESH_SECRET=<generate-random-32-char-string>
COOKIE_SECRET=<generate-random-32-char-string>

# Stripe (Test Keys from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET_HERE

# Email (optional)
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Logging
LOG_LEVEL=info
```

**How to Generate Secrets:**
```bash
# On your local machine (Mac/Linux):
openssl rand -base64 32

# Output: Something like: xR9kL2mN4pQ6sT8uV0wX3yZ5aB7cD9eF+gH=

# Use this value in Render dashboard
```

**Step-by-step:**
1. Go to Render dashboard → Backend service
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Paste each variable (one by one)
5. Click "Save"

**Expected Time:** 10 minutes

---

### 2B. Frontend Environment Variables

**In Render Dashboard → ywmessaging-staging-web → Environment:**

```bash
# API Configuration
VITE_API_URL=https://ywmessaging-staging-api.onrender.com/api

# Stripe (Publishable Key from https://dashboard.stripe.com/test/apikeys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Environment
VITE_ENV=staging
```

**Step-by-step:**
1. Go to Render dashboard → Frontend service
2. Click "Environment" tab
3. Add the 3 variables
4. Click "Save"

**Expected Time:** 5 minutes

---

**Milestone:** ✅ All environment variables configured

---

## Step 3: Verify Services Are Running (15 minutes)

### 3A. Check Backend Service

**In Render Dashboard:**

```
1. Click ywmessaging-staging-api
2. Look at top-right corner:
   - 🟢 Green = Running ✅
   - 🟡 Yellow = Starting
   - 🔴 Red = Error
3. Check Logs (if red status):
   - Click "Logs" tab
   - Look for error messages
   - Common issues:
     - DATABASE_URL incorrect
     - Missing environment variables
     - Port conflicts
```

**Test Backend Health:**
```bash
# Get the service URL from Render dashboard
# Should be: https://ywmessaging-staging-api.onrender.com

curl https://ywmessaging-staging-api.onrender.com/health

# Expected response:
# { "status": "ok", "timestamp": "2024-10-30T..." }
```

**If Health Check Fails:**
1. Check error logs in Render dashboard
2. Verify DATABASE_URL is correct
3. Verify all environment variables are set
4. Try restarting service: Click "Settings" → "Restart"

---

### 3B. Check Frontend Service

**In Render Dashboard:**

```
1. Click ywmessaging-staging-web
2. Look at status (should be 🟢 Green)
3. Click "Visit Site" button
4. Should see landing page
```

**Expected:**
- Landing page loads
- Logo visible
- Navigation works
- No console errors (check DevTools)

---

**Milestone:** ✅ Both services running

---

## Step 4: Database Setup (20 minutes)

### 4A. Connect to Staging Database

**Get Connection String from Render:**
1. Go to Render dashboard → PostgreSQL service
2. Copy "External Database URL"
3. Format: `postgresql://user:password@hostname:5432/dbname`

**From Your Local Machine:**

```bash
# Test connection
psql "postgresql://user:password@hostname:5432/dbname"

# If successful, you'll see:
# psql (14.0)
# Type "help" for help.
# database_name=#

# Type \dt to see tables
\dt

# Type \q to quit
\q
```

---

### 4B. Run Migrations

**If You Have Migrations (Prisma, Sequelize, etc.):**

```bash
# Option 1: Local machine with DATABASE_URL set
export DATABASE_URL="postgresql://user:password@hostname:5432/dbname"
npm run migrate:up
# or
npx prisma migrate deploy

# Option 2: Via Render CLI (if installed)
render run npm run migrate:up
```

**Expected:**
```
✅ Migrations applied successfully
✅ Tables created in database
```

**If Migrations Fail:**
1. Check DATABASE_URL is correct
2. Verify database is accessible
3. Check migration files syntax
4. Review error message in console

---

### 4C. Seed Test Data (Optional)

```bash
# If you have a seed script
DATABASE_URL="postgresql://..." npm run seed:staging

# Create test users for testing
# - Email: admin@test.com, Password: test123
# - Email: user@test.com, Password: test123
```

---

**Milestone:** ✅ Database ready

---

## Step 5: Verification Testing (30 minutes)

### 5A. Security Headers Check

```bash
# Check that security headers are present
curl -I https://ywmessaging-staging-api.onrender.com/health

# You should see these headers:
# Content-Security-Policy: ...
# Strict-Transport-Security: ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

**If Headers Missing:**
- Service needs to restart after environment variable changes
- Click "Settings" → "Restart" in Render dashboard

---

### 5B. Basic Functionality Test

**Test 1: Login**
```bash
curl -X POST https://ywmessaging-staging-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'

# Expected response (success):
# { "success": true, "user": { ... } }

# Or (failure):
# { "error": "Invalid credentials" }
```

**Test 2: CSRF Token**
```bash
curl https://ywmessaging-staging-api.onrender.com/api/csrf-token

# Expected:
# { "csrfToken": "..." }
```

**Test 3: Frontend Access**
```
1. Open browser: https://ywmessaging-staging-web.onrender.com
2. Should see landing page
3. No console errors (F12 → Console)
4. Can navigate to login page
5. CSS/styles applied correctly
```

---

### 5C. Rate Limiting Test

```bash
# Test auth rate limiting (should fail on 6th request)
for i in {1..7}; do
  curl -X POST https://ywmessaging-staging-api.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' \
    -w "\nAttempt $i: Status %{http_code}\n\n"
  sleep 1
done

# Expected:
# Attempts 1-5: 401 (Unauthorized - bad credentials)
# Attempt 6+: 429 (Too Many Requests - rate limited) ✅
```

---

**Milestone:** ✅ Staging environment verified

---

## Troubleshooting Guide

### Issue: Backend Service Shows Red Status

**Symptom:** 🔴 Red status, service won't start

**Solutions:**
1. **Check Logs:**
   ```
   Render Dashboard → Backend Service → Logs
   Look for error message
   ```

2. **Common Issues:**
   - DATABASE_URL missing or wrong format
   - Node version mismatch
   - Missing dependencies

3. **Fix:**
   - Verify DATABASE_URL: `postgresql://user:pass@host:5432/db`
   - Restart service: Settings → Restart
   - Check build logs for errors

---

### Issue: Frontend Can't Connect to Backend

**Symptom:** "CORS error" or "Failed to fetch"

**Solutions:**
1. **Check FRONTEND_URL:**
   - Backend environment variable should match frontend URL exactly
   - `FRONTEND_URL=https://ywmessaging-staging-web.onrender.com`

2. **Check CORS Headers:**
   ```bash
   curl -I https://ywmessaging-staging-api.onrender.com/health
   # Should have: Access-Control-Allow-Origin header
   ```

3. **Check Frontend API URL:**
   - `VITE_API_URL=https://ywmessaging-staging-api.onrender.com/api`
   - Build should pass this to frontend

---

### Issue: Database Connection Failed

**Symptom:** "ECONNREFUSED" or "Unable to connect"

**Solutions:**
1. **Verify Database is Running:**
   - Render Dashboard → PostgreSQL service
   - Status should be 🟢 Green

2. **Test Connection Locally:**
   ```bash
   psql "postgresql://user:pass@host:5432/dbname"
   ```

3. **Check DATABASE_URL Format:**
   ```
   ✅ Correct: postgresql://user:password@hostname:5432/dbname
   ❌ Wrong: postgres://user:password@hostname/dbname
   ❌ Wrong: postgresql://localhost/dbname (won't work from Render)
   ```

---

## Final Checklist

Before moving to next phase, verify:

- [ ] Backend service: 🟢 Running
- [ ] Frontend service: 🟢 Running
- [ ] Database: Connected and migrated
- [ ] Security headers: Present on all responses
- [ ] CORS: Working (frontend can call backend API)
- [ ] Rate limiting: Active (tested 6 auth attempts)
- [ ] Login: Works with test credentials
- [ ] Landing page: Displays correctly
- [ ] No console errors in browser

---

## Success Criteria

✅ **Staging Deployment Complete When:**
1. All services show 🟢 Green status
2. Frontend loads without errors
3. Backend health endpoint responds
4. Security headers present
5. Rate limiting working
6. Database connected
7. Login functionality works

---

## Next Steps After Deployment

Once staging is live:

1. **Full Feature Testing** (1-2 days)
   - Test all features end-to-end
   - Create test users
   - Test payment flow with Stripe test cards

2. **HTTPOnly Cookie Implementation** (3-4 days)
   - Migrate tokens from localStorage
   - Test token refresh
   - Verify security

3. **Production Deployment** (1 week)
   - Deploy to production with same steps
   - Use production Stripe keys
   - Enable monitoring

---

## Help Resources

If you get stuck:

1. **Render Documentation:** https://render.com/docs
2. **Node.js Issues:** https://nodejs.org/en/docs/
3. **PostgreSQL:** https://www.postgresql.org/docs/
4. **This Guide:** Refer back to troubleshooting section

---

**Time Estimate: 2-4 hours total**
- Setup: 30 min
- Create services: 45 min
- Configure: 30 min
- Verify: 30 min
- Troubleshooting: 30-90 min (if needed)

**Ready to deploy? Start with Step 1 above! 🚀**
