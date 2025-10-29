# Connect YW - Render Deployment Guide

Complete step-by-step guide to deploy Connect YW to Render.com

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Environment Variables](#step-1-prepare-environment-variables)
3. [Step 2: Configure Database](#step-2-configure-database)
4. [Step 3: Deploy to Render](#step-3-deploy-to-render)
5. [Step 4: Configure Monitoring](#step-4-configure-monitoring)
6. [Step 5: Set Up CI/CD](#step-5-set-up-cicd)
7. [Step 6: Post-Deployment](#step-6-post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Render account (free or paid)
- ✅ GitHub account with access to YWMESSAGING repository
- ✅ All third-party API keys ready:
  - Twilio Account SID and Auth Token
  - Stripe Secret Key, Publishable Key, Webhook Secret
  - SendGrid API Key
  - PostHog API Key (optional)

---

## Step 1: Prepare Environment Variables

### Generate JWT Secrets (Important!)

On your local machine, generate new secure JWT secrets:

```bash
# Generate access secret
openssl rand -hex 32

# Generate refresh secret
openssl rand -hex 32
```

Save these values - you'll need them in Step 2.

### Gather All Secrets

Create a temporary file with all your secrets:

```
JWT_ACCESS_SECRET=<generated-value>
JWT_REFRESH_SECRET=<generated-value>
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG....
POSTHOG_API_KEY=<your-key>
```

⚠️ **SECURITY**: Never commit these to GitHub. Keep them secure.

---

## Step 2: Configure Database

### Create PostgreSQL Instance on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `connect-yw-db`
   - **Database**: `connect_yw_production`
   - **User**: `connect_yw_user`
   - **Region**: Oregon (or your choice)
   - **PostgreSQL Version**: 15
   - **Plan**: Starter ($9/month)

4. Click "Create Database"
5. Wait for it to be created (usually 2-3 minutes)
6. Copy the **Internal Database URL** (you'll need this)

### Run Database Migrations

Once database is created:

```bash
# Set the DATABASE_URL locally
export DATABASE_URL="postgresql://..."

# From project root
cd backend
npx prisma migrate deploy
```

This initializes the production database schema.

---

## Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Go to https://dashboard.render.com/iac
2. Click "New Project from Repo"
3. Connect your GitHub account
4. Select `YWMESSAGING` repository
5. Select `main` branch
6. Click "Create Infrastructure"

Render will automatically:
- Create backend web service
- Create frontend static site
- Create PostgreSQL database
- Set up CI/CD integration

### Option B: Manual Setup (If Option A Doesn't Work)

#### 3.1 Create Backend Web Service

1. https://dashboard.render.com → "New +" → "Web Service"
2. Connect GitHub account
3. Select `YWMESSAGING` repository
4. Configure:
   - **Name**: `connect-yw-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Plan**: Standard ($12/month) or Starter ($7/month)

5. Click "Create Web Service"
6. Set environment variables in Dashboard → Environment
7. Add each secret from Step 1:
   - `DATABASE_URL` = PostgreSQL connection string
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://connect-yw-frontend.onrender.com`
   - All API keys (TWILIO, STRIPE, SENDGRID, POSTHOG)

#### 3.2 Create Frontend Static Site

1. https://dashboard.render.com → "New +" → "Static Site"
2. Connect GitHub account
3. Select `YWMESSAGING` repository
4. Configure:
   - **Name**: `connect-yw-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Click "Create Static Site"

#### 3.3 Update Database Connection

In backend service environment variables:
- Set `DATABASE_URL` to PostgreSQL connection string from Step 2

---

## Step 4: Configure Monitoring

### Render Built-in Monitoring

1. Go to Backend Web Service → Logs
2. Logs automatically appear as your app runs
3. Filter by:
   - `severity:error` for errors
   - `source:app` for application logs
   - Time range filters

### Set Up Error Alerts (Optional)

In backend service settings:
- Email notifications → Enable
- Alert on deployment failures

### Database Monitoring

1. Go to PostgreSQL → Connections
2. View active connections, queries, and performance
3. Manual backups available in PostgreSQL settings

---

## Step 5: Set Up CI/CD

### Enable GitHub Actions

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add these secrets for automatic deployment:
   - `RENDER_SERVICE_ID` = (get from Render backend service URL)
   - `RENDER_DEPLOY_KEY` = (get from Render account settings)

3. Commit this file to main branch:
   ```bash
   .github/workflows/deploy.yml
   ```

Now every push to `main` branch:
- ✅ Runs backend tests/build
- ✅ Runs frontend build
- ✅ Security checks (npm audit)
- ✅ Automatically deploys to Render

### View Deployment Status

- GitHub: Actions tab shows each deployment
- Render: Backend service → Deployments shows history

---

## Step 6: Post-Deployment

### Verify Deployment

1. **Backend**: Visit `https://connect-yw-backend.onrender.com/health`
   - Should return: `{"status": "ok", "timestamp": "..."}`

2. **Frontend**: Visit `https://connect-yw-frontend.onrender.com`
   - Should show login page

3. **Test Login Flow**:
   - Try registering a test account
   - Verify emails send (check SendGrid dashboard)
   - Try creating a branch, group, member

### Configure Custom Domain (Optional)

1. In Render service settings → Custom Domain
2. Add your domain (e.g., `app.connect-yw.com`)
3. Follow Render's DNS configuration
4. SSL certificate auto-generated

### Set Up SSL/TLS

- Render automatically provides HTTPS with Let's Encrypt
- Auto-renews certificates
- No additional setup needed

### Database Backups

1. PostgreSQL service → Backups
2. Enable automatic backups (enabled by default)
3. Daily snapshots retained for 7 days
4. Manual backups available anytime

### Monitoring Setup

**Application Monitoring:**
- Check logs: Backend service → Logs
- Monitor uptime: Render dashboard
- Health check: `/health` endpoint running

**Email Monitoring:**
- SendGrid dashboard → Metrics
- View delivery rates, bounces, opens

**Database Monitoring:**
- PostgreSQL dashboard → Connections
- Monitor query performance

---

## Troubleshooting

### Deployment Failed

**Check logs:**
```bash
# In Render dashboard → Backend Service → Logs
# Look for build errors
```

**Common issues:**
- Missing environment variables → Add to service settings
- Database migration failed → Check DATABASE_URL format
- Port not available → Render assigns automatically

### Service is Crashing

```bash
# Check application logs
# Render dashboard → Logs

# Check database connection
# Test: curl https://backend-service/health
```

### Database Connection Issues

```bash
# Verify DATABASE_URL format
postgresql://user:password@host:port/database

# Test connection locally
psql $DATABASE_URL
```

### Frontend Not Loading

1. Check build output: Static site → Logs
2. Verify FRONTEND_URL in backend matches frontend URL
3. Check CORS settings in backend

### Emails Not Sending

1. Verify SENDGRID_API_KEY in environment
2. Check SendGrid dashboard for bounces
3. Verify sender email is verified in SendGrid

---

## Cost Breakdown

**Monthly costs at scale:**

| Service | Starter | Standard | Usage |
|---------|---------|----------|-------|
| Backend | $7 | $12 | Per 750 compute hours |
| Frontend | Free | - | Always free |
| Database | $9 | $35+ | Per database |
| **Total Minimum** | **$16** | - | Scales with usage |

---

## Next Steps

1. Deploy to Render
2. Configure DNS (if using custom domain)
3. Set up monitoring/alerting
4. Test all features in production
5. Database migration (SQLite → PostgreSQL)
6. Advanced monitoring (Prometheus/Grafana)
7. Performance optimization

---

## Support

For issues:
- Check Render documentation: https://render.com/docs
- GitHub Actions docs: https://docs.github.com/en/actions
- Ask Claude Code for help with specific errors
