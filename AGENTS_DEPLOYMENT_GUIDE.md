# Enterprise Automated Agent System - Deployment Guide

## ✅ **Integration Complete!**

Your Express.js backend now has GitHub webhook integration for automated agents. This guide walks you through deploying and testing the system.

---

## 📋 **What Was Added**

### **Backend Files Created**
1. ✅ `backend/src/controllers/github-agents.controller.ts` (250 lines)
   - GitHub webhook signature verification (HMAC-SHA256)
   - Event routing (PR, Push, Workflow events)
   - Slack notifications
   - Agent invocation logging

2. ✅ `backend/src/routes/github-agents.routes.ts`
   - Webhook endpoint: `POST /api/webhooks/github/agents`
   - Health check: `GET /api/webhooks/github/agents/health`

3. ✅ `backend/src/app.ts` (Updated)
   - Imported GitHub agents routes
   - Registered webhook endpoint

---

## 🚀 **Deployment Steps**

### **Step 1: Verify Environment Variables**

Make sure these are in your `.env` file in the backend directory:

```bash
# Backend .env
GITHUB_WEBHOOK_SECRET=<your-webhook-secret-from-github>
SLACK_WEBHOOK_URL=<your-slack-webhook-url>
SLACK_CHANNEL=#all-engineering-automation
```

**⚠️ IMPORTANT**: Get actual values from:
- GitHub Webhook Secret: GitHub → Repository → Settings → Webhooks → Copy Secret
- Slack Webhook URL: Slack API → Create Incoming Webhook → Copy URL

### **Step 2: Build Backend Locally**

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Build TypeScript
npm run build

# Verify build succeeded
ls dist/controllers/github-agents.controller.js
```

### **Step 3: Test Locally**

```bash
# Start backend in development
npm run dev

# Test webhook health check in another terminal
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}

# Test webhook endpoint
curl http://localhost:3000/api/webhooks/github/agents/health
# Should return: {"status":"ok","message":"GitHub agent webhook endpoint is healthy",...}
```

### **Step 4: Deploy to Render**

```bash
# Commit changes
git add backend/src/controllers/github-agents.controller.ts
git add backend/src/routes/github-agents.routes.ts
git add backend/src/app.ts
git commit -m "feat: Add GitHub agents webhook integration"

# Push to GitHub
git push origin main

# Render auto-deploys!
# Check Render dashboard: https://dashboard.render.com/
```

### **Step 5: Verify Deployment**

Once deployed, test the endpoint:

```bash
# Test webhook endpoint on production
curl https://connect-yw-backend.onrender.com/api/webhooks/github/agents/health

# Should return 200 OK with health check JSON
```

---

## 🔗 **Update GitHub Webhook Configuration**

Now that your backend has the webhook endpoint, configure GitHub:

### **In Your Repository → Settings → Webhooks**

**1. Update Existing Webhook (if any)**

If you created a webhook earlier, update it:
- **Payload URL:** `https://connect-yw-backend.onrender.com/api/webhooks/github/agents`
- **Content type:** `application/json`
- **Secret:** Use the same secret from your `.env` GITHUB_WEBHOOK_SECRET
- **Events:** "Send me everything"
- **Active:** ✅ Checked

**2. Or Add New Webhook**

Click "Add webhook":
- **Payload URL:** `https://connect-yw-backend.onrender.com/api/webhooks/github/agents`
- **Content type:** `application/json`
- **Secret:** Generate a new webhook secret using `openssl rand -base64 32` and set in `.env`
- **Which events:** Select "Let me select individual events"
- **Check these events:**
  - ✅ Pull requests
  - ✅ Pushes
  - ✅ Workflows
- **Active:** ✅ Checked

Click **"Add webhook"**

---

## 🧪 **Test the Integration**

### **Test 1: Create a Test PR**

```bash
# Create a test branch
git checkout -b test/agents-integration
echo "# Test: Agents Integration" >> README.md
git add README.md
git commit -m "test: Verify agents webhook integration"
git push origin test/agents-integration

# Go to GitHub and create a PR
# Watch for webhook delivery in GitHub webhook logs
```

### **Test 2: Check Webhook Deliveries**

1. Go to **Repository → Settings → Webhooks**
2. Click on your webhook
3. Scroll to **Recent Deliveries**
4. You should see your test PR event!

### **Test 3: Check Backend Logs**

On Render dashboard, view logs:
```
✅ GitHub webhook signature verified
📨 GitHub Webhook Received
   Event Type: pull_request
   PR Number: #1
   PR Title: test: Verify agents webhook integration
📡 Invoking agents: ...
✅ GitHub webhook accepted for processing
```

### **Test 4: Verify Slack Notification**

If Slack is configured, check your Slack channel (#all-engineering-automation):
```
🔍 PR Review Started
PR #1: test: Verify agents webhook integration
Author: your-username
```

---

## 📊 **System Architecture Now**

```
┌──────────────────┐
│  GitHub Event    │
│  (PR, Push, etc) │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  GitHub Actions Workflow         │
│  (agents-pr-review.yml, etc)     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  POST to Backend Webhook         │
│  https://connect-yw-backend      │
│  /api/webhooks/github/agents     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Signature Verification (HMAC)   │
│  github-agents.controller.ts     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Log + Slack Notification        │
│  Route to agents (in logs)       │
└──────────────────────────────────┘
```

---

## 🔐 **Security Verification**

Your webhook endpoint includes:
✅ **GitHub HMAC-SHA256 signature verification**
✅ **Constant-time comparison** (prevents timing attacks)
✅ **Raw body preservation** for signature validation
✅ **Environment variable protection** for secrets
✅ **Error logging** without exposing internals

---

## 🐛 **Troubleshooting**

### **Webhook Not Triggering**

1. **Check GitHub webhook delivery logs:**
   - Go to Settings → Webhooks
   - Click webhook
   - Check "Recent Deliveries"
   - Look for HTTP status code

2. **Check Render logs:**
   - Go to Render dashboard
   - Select backend service
   - View logs for errors

3. **Common errors:**
   ```
   ❌ 401 Unauthorized
   → GITHUB_WEBHOOK_SECRET mismatch

   ❌ 404 Not Found
   → Wrong payload URL

   ❌ 500 Server Error
   → Backend crashed, check Render logs
   ```

### **Signature Verification Failed**

```bash
# Verify secret matches exactly
# GitHub → Settings → Webhooks
# Should match: GITHUB_WEBHOOK_SECRET in backend .env
```

### **Slack Notification Not Sending**

1. Verify `SLACK_WEBHOOK_URL` is correct
2. Check Slack workspace settings for webhook app
3. Webhook not configured is OK - agents still work without Slack

---

## 📈 **Next: Enable Full Agent Automation**

Now that webhook is working, agents need to actually **invoke Claude AI**.

Currently, the system:
✅ Receives GitHub webhooks
✅ Verifies signatures
✅ Logs events
✅ Sends Slack notifications

But it doesn't yet:
❌ Actually invoke Claude agents

To complete automation:

1. **Deploy webhook server** (optional standalone service)
2. **Add Claude API integration** to controller
3. **Implement agent state management**
4. **Setup result posting** to GitHub PRs

---

## ✅ **Deployment Checklist**

- [ ] Build backend locally (`npm run build`)
- [ ] Test locally (`npm run dev`)
- [ ] Push code to GitHub (`git push origin main`)
- [ ] Verify Render deployment succeeded
- [ ] Test webhook health check on production
- [ ] Create test PR to trigger webhook
- [ ] Check GitHub webhook delivery logs (success)
- [ ] Check Render backend logs (received webhook)
- [ ] Verify Slack notification (if configured)
- [ ] Read AGENTS_AUTOMATION.md for full system context

---

## 🎯 **Current Status**

✅ **MCP Tools** - All 6 installed and connected
✅ **GitHub Actions Workflows** - Created (4 workflows)
✅ **Agent Configurations** - Updated (9 agents)
✅ **Backend Webhook** - Integrated (Express)
✅ **Signature Verification** - Implemented
✅ **Slack Integration** - Ready
✅ **Logging & Audit** - Built-in

🔄 **Next Phase**
⏳ Claude agent invocation integration
⏳ PR comment posting
⏳ Full agent orchestration

---

## 💡 **Key Files Reference**

| File | Purpose |
|------|---------|
| `backend/src/controllers/github-agents.controller.ts` | Webhook handler, signature verification, event routing |
| `backend/src/routes/github-agents.routes.ts` | Express routes for webhook endpoint |
| `backend/src/app.ts` | Registration of webhook routes |
| `.env.agents` | Configuration (CLAUDE_API_KEY, secrets, etc) |
| `.github/workflows/*.yml` | GitHub Actions automation |
| `.claude/agents/*.md` | Agent configurations |

---

## 📞 **Support**

For issues:
1. Check Render logs first
2. Check GitHub webhook delivery logs
3. Verify all environment variables match
4. Check AGENTS_AUTOMATION.md for comprehensive guide

You're all set! 🚀
