# Connect YW - Deployment Checklist for Render

Quick reference checklist for deploying to Render.

## Pre-Deployment (Local)

### Prepare Secrets
- [ ] Generate JWT_ACCESS_SECRET: `openssl rand -hex 32`
- [ ] Generate JWT_REFRESH_SECRET: `openssl rand -hex 32`
- [ ] Have Twilio credentials ready (Account SID, Auth Token)
- [ ] Have Stripe keys ready (Secret, Publishable, Webhook)
- [ ] Have SendGrid API key ready
- [ ] Have PostHog API key (optional)

### Code Quality
- [ ] Run `npm run build` in backend - no errors
- [ ] Run `npm run build` in frontend - no errors
- [ ] All TypeScript types correct
- [ ] No hardcoded secrets in code
- [ ] Commit all changes to main branch

---

## Render Setup

### Database Setup
- [ ] Log in to https://dashboard.render.com
- [ ] Create new PostgreSQL database
  - Name: `connect-yw-db`
  - Database: `connect_yw_production`
  - User: `connect_yw_user`
  - Region: Oregon
  - Plan: Starter ($9/month)
- [ ] Wait for database to be created (2-3 min)
- [ ] Copy **Internal Database URL**
- [ ] Test local migration: `npx prisma migrate deploy`

### Deployment Using render.yaml (Recommended)
- [ ] Go to https://dashboard.render.com/iac
- [ ] Click "New Project from Repo"
- [ ] Select YWMESSAGING repository
- [ ] Select `main` branch
- [ ] Click "Create Infrastructure"
- [ ] Wait for all services to deploy

**OR if using Manual Setup:**

### Backend Service
- [ ] Create Web Service in Render
- [ ] Connect GitHub (YWMESSAGING repo)
- [ ] Set Name: `connect-yw-backend`
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `node dist/index.js`
- [ ] Plan: Starter ($7/month) or Standard ($12/month)

### Frontend Service
- [ ] Create Static Site in Render
- [ ] Connect GitHub (YWMESSAGING repo)
- [ ] Set Name: `connect-yw-frontend`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

### Environment Variables
- [ ] Add to Backend Service → Environment:
  - [ ] DATABASE_URL (from PostgreSQL)
  - [ ] NODE_ENV = `production`
  - [ ] FRONTEND_URL = `https://connect-yw-frontend.onrender.com`
  - [ ] JWT_ACCESS_SECRET (generated)
  - [ ] JWT_REFRESH_SECRET (generated)
  - [ ] TWILIO_ACCOUNT_SID
  - [ ] TWILIO_AUTH_TOKEN
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_PUBLISHABLE_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] SENDGRID_API_KEY
  - [ ] POSTHOG_API_KEY

---

## Post-Deployment

### Verification
- [ ] Backend health check: `https://connect-yw-backend.onrender.com/health`
  - Should return `{"status": "ok", ...}`
- [ ] Frontend loads: `https://connect-yw-frontend.onrender.com`
  - Should show login page
- [ ] Test registration flow
  - Create account, verify email sent (check SendGrid)
  - Test login
  - Create a branch
  - Create a group
  - Add members

### Monitoring Setup
- [ ] Backend service → Logs (check for errors)
- [ ] PostgreSQL → Check connections
- [ ] SendGrid dashboard → Verify emails received
- [ ] Stripe dashboard → Check test payments

### CI/CD Pipeline
- [ ] Go to GitHub repository → Settings → Secrets and variables
- [ ] Add GitHub Secrets (optional for auto-deploy):
  - [ ] RENDER_SERVICE_ID
  - [ ] RENDER_DEPLOY_KEY
- [ ] Commit `.github/workflows/deploy.yml` to main
- [ ] Test: Push a small change to main
  - [ ] GitHub Actions runs build
  - [ ] Check Actions tab for success/failure

### Database Backups
- [ ] PostgreSQL service → Backups
- [ ] Verify daily backups enabled
- [ ] Retention period: 7 days

### Custom Domain (Optional)
- [ ] Buy domain (Namecheap, GoDaddy, etc.)
- [ ] Backend service → Custom Domain
- [ ] Add domain, follow DNS setup
- [ ] Frontend service → Custom Domain
- [ ] Add domain, follow DNS setup
- [ ] Wait for HTTPS certificate (auto-generated)
- [ ] Test both services on custom domain

---

## Monitoring & Maintenance

### Daily
- [ ] Check Render logs for errors
- [ ] Monitor database connections
- [ ] Check SendGrid delivery rates

### Weekly
- [ ] Review error logs in Render
- [ ] Check database backup status
- [ ] Monitor application performance

### Monthly
- [ ] Review usage metrics
- [ ] Check for security updates
- [ ] Verify backups are working
- [ ] Review Stripe charges

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Deployment failed | Check Render logs for build errors |
| Service not responding | Verify DATABASE_URL in environment |
| Emails not sending | Check SENDGRID_API_KEY is correct |
| Frontend blank | Verify FRONTEND_URL matches frontend domain |
| Database migration failed | Run locally first: `npx prisma migrate deploy` |

---

## Cost Summary

**Estimated Monthly Costs:**
- Backend Web Service: $7-12
- Frontend (Static): Free
- PostgreSQL Database: $9+
- **Total Minimum: ~$16-21/month**

Scales based on:
- Compute hours (auto-scales with usage)
- Database size (additional queries = higher cost)
- Data transfer (minimal for this app)

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. ⬜ Set up custom domain
3. ⬜ Configure monitoring alerts
4. ⬜ Database migration (SQLite → PostgreSQL complete)
5. ⬜ Performance optimization
6. ⬜ Advanced features (two-way SMS, etc.)

---

**Questions?** Refer to DEPLOYMENT_GUIDE.md for detailed instructions.
