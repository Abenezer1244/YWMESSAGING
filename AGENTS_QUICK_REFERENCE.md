# Automated Agent System - Quick Reference Card

## 🚀 Start Here
```bash
# 1. Setup
cp .env.agents.example .env.agents
# Edit .env.agents with your keys

# 2. Deploy webhook
node scripts/agents-webhook-server.js

# 3. Test locally
node scripts/agents-orchestrator.js pr-review

# 4. Monitor logs
tail -f logs/audit-*.json
```

## 📡 Webhook Server
**File:** `scripts/agents-webhook-server.js`
**Port:** 3000
**Health:** `GET /health`
**Webhook:** `POST /webhook`

## 🎯 Orchestrator Commands
```bash
node scripts/agents-orchestrator.js [command]

pr-review       # Run PR agents (parallel)
merge-review    # Run merge agents
security-audit  # Run security audit
all            # Run all agents
audit-log      # Show audit logs
```

## 🔗 GitHub Actions

| File | Trigger | Agents |
|------|---------|--------|
| agents-pr-review.yml | PR opened/updated | Backend, Frontend, Security, Design, QA |
| agents-main-merge.yml | Push to main | Architecture, DevOps, Product |
| agents-scheduled.yml | Weekly (Mon/Thu) | Security, Architecture, QA |
| agents-deployment.yml | Deploy events | DevOps, QA |

## 🤖 The 9 Agents

| Agent | Icon | Role | MCPs |
|-------|------|------|------|
| Backend Engineer | 🔧 | API, Database, Logic | Semgrep, Context7 |
| Senior Frontend | 🎨 | Components, Perf | Playwright, Semgrep, Context7 |
| Security Analyst | 🔒 | Vulnerabilities | Semgrep, Context7 |
| Design Review | ✨ | UI/UX, Accessibility | Playwright, Exa, Semgrep, Context7 |
| QA Testing | ✅ | Test Coverage | Playwright, Semgrep, Context7 |
| System Architecture | 🏗️ | Scalability | Exa, Context7 |
| DevOps | 🚀 | Deployment | Exa, Context7 |
| Product Manager | 📊 | Strategy | Exa, Context7 |
| UI/UX | 🎨 | Design System | Playwright, Exa, Context7 |

## 🌍 Environment Variables

**Required:**
```bash
CLAUDE_API_KEY=...
GITHUB_TOKEN=...
GITHUB_WEBHOOK_SECRET=...
```

**Optional but Recommended:**
```bash
SLACK_WEBHOOK_URL=...
SLACK_CHANNEL=#engineering
```

**Tuning:**
```bash
AGENTS_PARALLEL=true         # Faster
AGENT_TIMEOUT=300            # Seconds
AGENT_RETRY_COUNT=3          # Retries
LOG_DIR=./logs               # Audit logs
```

## 📊 Workflow Triggers

```
PR Event
  ├─ Backend Engineer (API, DB)
  ├─ Senior Frontend (React/Vue)
  ├─ Security Analyst (Vulns)
  ├─ Design Review (UI/UX)
  └─ QA Testing (Coverage)

Main Branch Push
  ├─ System Architecture (Impact)
  ├─ DevOps (Deploy ready)
  └─ Product Manager (Features)

Weekly Scheduled
  ├─ Monday 2 AM: Full Security Audit
  └─ Thursday 2 AM: Perf Analysis + Regression Tests

Deployment
  ├─ Pre-deploy: Quality gates
  └─ Post-deploy: Smoke tests
```

## 📝 Audit Logs

**Location:** `logs/audit-YYYY-MM-DD.json`

**Format:**
```json
{
  "timestamp": "2024-11-24T10:30:45Z",
  "agent": "backend-engineer",
  "event": "agent_invocation_started",
  "status": "success",
  "duration": 45.2,
  "details": { ... }
}
```

**View:**
```bash
node scripts/agents-orchestrator.js audit-log 2024-11-24
```

## 🔐 GitHub Setup

**1. Secrets** (Settings → Secrets and variables → Actions)
- `CLAUDE_API_KEY`
- `CLAUDE_WEBHOOK_URL`
- `GITHUB_TOKEN`
- `SLACK_WEBHOOK_URL`

**2. Webhook** (Settings → Webhooks → Add webhook)
- URL: `https://your-domain.com/webhook`
- Content type: `application/json`
- Secret: Use `GITHUB_WEBHOOK_SECRET`
- Events: Pull requests, Pushes, Workflows

**3. Permissions**
- GitHub token needs: `repo`, `workflow` scopes

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| Agents not triggering | Check Actions tab, verify workflows exist |
| No PR comments | Verify GitHub token has `repo` scope |
| Slack not working | Check webhook URL, test with curl |
| Server not responding | `curl localhost:3000/health` |
| Missing audit logs | Check `LOG_DIR` permission, create manually |

## 🚨 Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 401 | Invalid signature | Check webhook secret |
| 403 | Forbidden | GitHub token expired/invalid |
| 404 | Not found | Check URL path |
| 500 | Server error | Check logs, restart server |

## 📚 Documentation

- **Full Guide:** `AGENTS_AUTOMATION.md`
- **Quick Start:** `AGENTS_QUICKSTART.md`
- **This Card:** `AGENTS_QUICK_REFERENCE.md`
- **Implementation:** `AGENTS_IMPLEMENTATION_SUMMARY.md`

## 🎯 Success Metrics

Track these after deployment:
- ✅ Agent invocation frequency
- ✅ Average response time
- ✅ Issues found & fixed rate
- ✅ PR merge time reduction
- ✅ Security incidents prevention

## 💡 Pro Tips

1. **Parallel = Faster** → Set `AGENTS_PARALLEL=true` for PR reviews
2. **Sequential = Safer** → Set `AGENTS_PARALLEL=false` for main branch
3. **Skip docs** → Add `paths-ignore` for markdown changes
4. **Labels trigger** → Use `[needs-review]` label for force runs
5. **Monitors cost** → Reduce unnecessary agent invocations

## 🆘 Quick Help

```bash
# Check server health
curl http://localhost:3000/health

# View today's audit logs
node scripts/agents-orchestrator.js audit-log

# Run agents manually
node scripts/agents-orchestrator.js pr-review

# View GitHub Actions
# Go to: https://github.com/org/repo/actions
```

## 🎓 Learning Path

1. Read: `AGENTS_QUICKSTART.md` (10 min)
2. Deploy: Webhook server (5 min)
3. Configure: GitHub secrets (5 min)
4. Test: Create PR (5 min)
5. Monitor: View audit logs (5 min)
6. Deep dive: `AGENTS_AUTOMATION.md` (optional)

## ✨ What Agents Do

| Stage | Agents | Output |
|-------|--------|--------|
| **PR Review** | 5 agents | Comments, findings, recommendations |
| **Merge Analysis** | 3 agents | System impact report, deployment readiness |
| **Weekly Audit** | 3 agents | Security report, perf analysis, regression risks |
| **Pre-Deploy** | DevOps | Deployment checklist, quality gates |
| **Post-Deploy** | QA + DevOps | Smoke test results, verification status |

---

**Got stuck?** Check AGENTS_AUTOMATION.md → Troubleshooting section
**Need setup help?** Follow AGENTS_QUICKSTART.md step-by-step
**Want full details?** Read AGENTS_AUTOMATION.md chapter by chapter
