# Automated Agent System - Quick Start Guide

Get your enterprise agents running in 10 minutes!

## 📋 Pre-flight Checklist

- [ ] Node.js 18+ installed
- [ ] Claude API key
- [ ] GitHub personal access token
- [ ] GitHub repository access
- [ ] (Optional) Slack workspace

## ⚡ 5-Minute Setup

### 1. Configure Environment (2 min)

```bash
# Copy template
cp .env.agents.example .env.agents

# Edit with your values
nano .env.agents
# Required:
# - CLAUDE_API_KEY
# - GITHUB_TOKEN
# - GITHUB_WEBHOOK_SECRET (generate: openssl rand -base64 32)
```

### 2. Set GitHub Secrets (2 min)

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add these secrets:
   - `CLAUDE_API_KEY` → Your Claude API key
   - `CLAUDE_WEBHOOK_URL` → `https://your-domain.com/webhook`
   - `GITHUB_TOKEN` → Your GitHub token
   - `SLACK_WEBHOOK_URL` → (Optional) Slack webhook

### 3. Configure GitHub Webhook (1 min)

1. Go to **Settings → Webhooks**
2. Click **Add webhook**
3. Set:
   - **Payload URL:** `https://your-domain.com/webhook`
   - **Content type:** `application/json`
   - **Secret:** Your `GITHUB_WEBHOOK_SECRET`
   - **Events:** Select "Let me select individual events"
   - Check: "Pull requests", "Pushes", "Workflows"

## 🚀 Deploy Webhook Server

### Local Development
```bash
node scripts/agents-webhook-server.js
# Server running on http://localhost:3000
```

### Production (Render)
```bash
# Create render.yaml in repo root
# (Template provided in docs)

# Deploy
git push origin main
# Render auto-deploys!
```

## ✅ Verify Setup

### Test the Webhook
```bash
# Get your webhook URL and secret, then:
curl -X POST https://your-domain.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=test" \
  -d '{
    "action":"opened",
    "pull_request":{"number":1,"title":"Test"},
    "repository":{"full_name":"org/repo"}
  }'
```

### Check Health
```bash
curl https://your-domain.com/health
# Should return: {"status":"healthy",...}
```

### Create Test PR
```bash
git checkout -b test/agents
echo "test" >> README.md
git commit -am "Test: Automated agents"
git push origin test/agents
```

Open PR on GitHub and watch the magic! 🎉

## 📊 What Happens Next

1. **Workflows trigger** → PR opens
2. **5 agents start** → Background jobs begin
3. **Results appear** → PR comments + Slack notifications
4. **Decision ready** → Merge with confidence!

### Expected Reviews
- ✅ Backend Engineer - Code quality
- 🎨 Senior Frontend - Components & performance
- 🔒 Security Analyst - Vulnerabilities
- ✨ Design Review - UI/UX compliance
- ✅ QA Testing - Test coverage

## 🔍 Monitor Agents

```bash
# View audit logs
node scripts/agents-orchestrator.js audit-log $(date +%Y-%m-%d)

# Run agents locally
node scripts/agents-orchestrator.js pr-review

# Check server health
curl http://localhost:3000/health | jq
```

## 🎯 Automation Triggers

| Event | Agents | When |
|-------|--------|------|
| **PR Opened** | Backend, Frontend, Security, Design, QA | Instant |
| **Commit to Main** | Architecture, DevOps, Product | After merge |
| **Weekly (Mon)** | Security Analyst | 2 AM UTC |
| **Weekly (Thu)** | Architecture, QA | 2 AM UTC |
| **Deployment** | DevOps, QA | Pre/post deploy |

## 🐛 Troubleshooting

### Workflows Not Running
```bash
# Check Actions tab for errors
# Verify .github/workflows/ files exist
ls .github/workflows/
# Should see: agents-pr-review.yml, etc.
```

### No PR Comments
1. Check GitHub token has `repo` scope
2. Verify `POST_PR_COMMENTS=true` in `.env.agents`
3. Check webhook server logs

### Slack Notifications Not Working
1. Verify `SLACK_WEBHOOK_URL` is correct
2. Test with curl:
```bash
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test notification"}'
```

## 📚 Next Steps

1. **Read full docs:** `AGENTS_AUTOMATION.md`
2. **Configure Slack:** Optional but recommended
3. **Customize agents:** Edit agent configurations in `.claude/agents/`
4. **Monitor metrics:** Set up dashboards for agent effectiveness
5. **Team onboarding:** Train team on automated review process

## 💬 Quick Commands

```bash
# Start webhook server
node scripts/agents-webhook-server.js

# Run PR review agents
node scripts/agents-orchestrator.js pr-review

# Run all agents
node scripts/agents-orchestrator.js all

# View today's audit logs
node scripts/agents-orchestrator.js audit-log

# View specific date logs
node scripts/agents-orchestrator.js audit-log 2024-11-24
```

## 🎓 Understanding Your Agents

Each agent specializes in one area:

- **Backend Engineer** 🔧 → API design, database queries, business logic
- **Senior Frontend** 🎨 → Components, performance, React best practices
- **Security** 🔒 → OWASP vulnerabilities, dependency scanning, threats
- **Design Review** ✨ → Accessibility, responsive design, visual polish
- **QA Testing** ✅ → Test coverage, regression risks, edge cases
- **System Architecture** 🏗️ → Scalability, patterns, system impact
- **DevOps** 🚀 → Deployment readiness, infrastructure, monitoring
- **Product Manager** 📊 → Feature alignment, user value, roadmap fit

## ✨ Pro Tips

1. **Parallel agents faster** → Set `AGENTS_PARALLEL=true`
2. **Skip docs changes** → Reduces unnecessary reviews
3. **Use labels** → `[needs-review]` to trigger agents
4. **Monitor costs** → Check agent invocation logs
5. **Team Slack channel** → Post agent summaries daily

---

**Need help?** See `AGENTS_AUTOMATION.md` for complete documentation.

**Questions?** Check GitHub Issues or contact the team.

Good luck! 🚀
