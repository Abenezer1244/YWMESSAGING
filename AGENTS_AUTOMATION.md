# Enterprise Automated Agent System Documentation

## Overview

This documentation covers the complete setup and usage of the **Automated Agent System** for enterprise SaaS development. The system enables 9 specialized AI agents to automatically review code, conduct security audits, test features, and provide product guidance throughout your development lifecycle.

## Architecture

```
GitHub Events (PR, Push, Scheduled)
    ↓
GitHub Actions Workflows
    ↓
Webhook Server (agents-webhook-server.js)
    ↓
Agent Orchestrator (agents-orchestrator.js)
    ↓
Claude Agents (Backend, Frontend, Security, etc.)
    ↓
Notifications (PR Comments, Slack, Logs)
```

## Components

### 1. GitHub Actions Workflows

Four automated workflows handle different triggers:

#### **agents-pr-review.yml**
- **Trigger:** PR opened/updated/reopened
- **Agents:** Backend Engineer, Frontend Engineer, Security, Design Review, QA
- **Action:** Reviews code and design for quality and security

#### **agents-main-merge.yml**
- **Trigger:** Push to main branch
- **Agents:** System Architecture, DevOps, Product Manager
- **Action:** Post-merge analysis for system impact

#### **agents-scheduled.yml**
- **Triggers:**
  - Weekly security audit (Monday 2 AM UTC)
  - Weekly performance analysis (Thursday 2 AM UTC)
- **Agents:** Security Analyst, System Architecture, QA
- **Action:** Comprehensive codebase audits

#### **agents-deployment.yml**
- **Trigger:** Deployment events
- **Agents:** DevOps, QA
- **Action:** Pre/post-deployment verification

### 2. Webhook Server

**File:** `scripts/agents-webhook-server.js`

Standalone Node.js server that:
- Listens for GitHub webhook events
- Verifies webhook signatures for security
- Routes events to appropriate agents
- Logs all invocations for audit trail
- Sends Slack notifications

**Running the server:**
```bash
node scripts/agents-webhook-server.js
```

**Health check:**
```bash
curl http://localhost:3000/health
```

### 3. Agent Orchestrator

**File:** `scripts/agents-orchestrator.js`

Manages:
- Sequential vs parallel agent execution
- Audit logging with timestamps
- Summary reporting
- Individual agent invocations

**Commands:**
```bash
# PR review agents (parallel)
node scripts/agents-orchestrator.js pr-review

# Post-merge agents (sequential)
node scripts/agents-orchestrator.js merge-review

# Security audit
node scripts/agents-orchestrator.js security-audit

# All agents
node scripts/agents-orchestrator.js all

# View audit logs
node scripts/agents-orchestrator.js audit-log 2024-11-24
```

### 4. MCP Tools Integration

All 9 agents have access to:
- **Playwright** - Browser automation & visual testing
- **Semgrep** - Code analysis & security scanning
- **Exa** - Web search & research
- **Context7** - Knowledge base & documentation
- **Ref** - Tools API references
- **Magic** - Development tools

## Setup Instructions

### Prerequisites

- Node.js 18+
- GitHub repository with Actions enabled
- Claude API key
- GitHub personal access token
- (Optional) Slack workspace

### Step 1: Environment Setup

1. Copy the environment template:
```bash
cp .env.agents.example .env.agents
```

2. Fill in required values:
```bash
CLAUDE_API_KEY=your-claude-api-key
GITHUB_TOKEN=your-github-token
GITHUB_WEBHOOK_SECRET=generate-random-string
```

3. Load environment variables:
```bash
export $(cat .env.agents | xargs)
```

### Step 2: GitHub Configuration

#### Configure GitHub Secrets

1. Go to **Settings → Secrets and variables → Actions**
2. Add the following secrets:
   - `CLAUDE_API_KEY` - Your Claude API key
   - `CLAUDE_WEBHOOK_URL` - Webhook server endpoint
   - `GITHUB_TOKEN` - Personal access token
   - `SLACK_WEBHOOK_URL` - Slack webhook (optional)

#### Configure Webhook

1. Go to **Settings → Webhooks**
2. Click **Add webhook**
3. Configure:
   - **Payload URL:** `https://your-domain.com/webhook`
   - **Content type:** `application/json`
   - **Secret:** Use the same `GITHUB_WEBHOOK_SECRET`
   - **Events:** Select "Let me select individual events"
   - **Check:** Pull requests, Pushes, Workflows

### Step 3: Deploy Webhook Server

Option A: Local development
```bash
node scripts/agents-webhook-server.js
```

Option B: Deploy to cloud (Render, Railway, Heroku)
```bash
# Using Render
npm install -g @render/cli
render deploy
```

### Step 4: Test the Setup

1. **Create a test PR:**
```bash
git checkout -b test/agent-system
echo "test" >> README.md
git commit -am "Test: Agent system"
git push origin test/agent-system
```

2. **Open PR on GitHub** and observe:
   - Workflows start running
   - Agents begin reviewing
   - Comments appear on PR
   - Slack notifications sent

3. **Check logs:**
```bash
node scripts/agents-orchestrator.js audit-log $(date +%Y-%m-%d)
```

## Agent Roles & Responsibilities

### 📊 Product Manager
- Feature prioritization
- Roadmap alignment
- User story validation
- **Triggers:** Push to main

### 🎨 UI/UX Designer
- Accessibility compliance (WCAG)
- Design consistency
- Responsive testing
- Visual polish assessment
- **Triggers:** PR with UI changes

### 🏗️ System Architecture
- Scalability analysis
- Database design review
- Integration patterns
- Performance considerations
- **Triggers:** Push to main, Weekly performance audit

### 🎨 Senior Frontend Engineer
- Component architecture
- Performance optimization
- Testing strategy
- React/Vue best practices
- **Triggers:** PR with frontend changes

### 🔧 Backend Engineer
- API design review
- Database optimization
- Business logic validation
- Integration patterns
- **Triggers:** PR with backend changes

### ✅ QA Testing
- Test plan creation
- Test case design
- Regression testing
- Smoke tests post-deployment
- **Triggers:** PR, Deployment, Weekly regression tests

### 🚀 DevOps Engineer
- Deployment readiness
- Infrastructure review
- CI/CD pipeline validation
- Scaling strategy
- **Triggers:** Push to main, Deployment events

### 🔒 Security Analyst
- Vulnerability assessment
- OWASP Top 10 compliance
- Dependency scanning
- Threat modeling
- **Triggers:** PR, Weekly security audit

### ✨ Design Review Agent
- Comprehensive visual review
- Cross-browser testing
- Accessibility audit
- Interactive component testing
- **Triggers:** PR with UI changes

## Notification System

### Slack Integration

Agents send automatic Slack notifications:

```
✅ Backend Engineer - Code review complete
🔒 Security Analyst - Found 2 vulnerabilities
🎨 Design Review - Accessibility issues detected
```

Configure in `.env.agents`:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#engineering-automation
```

### PR Comments

Agents post detailed reviews directly on PRs:
- Code quality issues
- Security concerns
- Design feedback
- Test recommendations
- Performance suggestions

Enable in `.env.agents`:
```
POST_PR_COMMENTS=true
INCLUDE_CODE_SNIPPETS=true
```

### Audit Logs

All agent invocations logged to `logs/audit-YYYY-MM-DD.json`:

```json
{
  "timestamp": "2024-11-24T10:30:45Z",
  "agent": "backend-engineer",
  "event": "agent_invocation_started",
  "status": "running",
  "details": {
    "pr_number": 123,
    "repo": "org/repo",
    "branch": "feature/auth"
  }
}
```

View logs:
```bash
node scripts/agents-orchestrator.js audit-log 2024-11-24
```

## Troubleshooting

### Agents Not Triggering

1. **Check GitHub Actions:**
   - Go to **Actions** tab
   - Verify workflow files are present
   - Check for syntax errors

2. **Verify Secrets:**
   ```bash
   # In GitHub Actions
   echo "CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}"
   ```

3. **Test Webhook:**
   ```bash
   curl -X POST http://localhost:3000/webhook \
     -H "Content-Type: application/json" \
     -d '{"action":"opened","pull_request":{"number":1}}'
   ```

### Webhook Server Not Responding

1. **Check server status:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **View logs:**
   ```bash
   tail -f logs/agents.log
   ```

3. **Verify firewall:**
   ```bash
   netstat -tuln | grep 3000
   ```

### PR Comments Not Posting

1. **Verify GitHub token permissions:**
   - Must have `repo` and `workflow` scopes
   - Can read/write pull requests

2. **Check comment length:**
   - Adjust `MAX_COMMENT_LENGTH` in `.env.agents`

3. **Review GitHub rate limits:**
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/rate_limit
   ```

## Performance Tuning

### Parallel vs Sequential Execution

```bash
# Faster (parallel) - Good for PR reviews
AGENTS_PARALLEL=true

# Safer (sequential) - Good for production merges
AGENTS_PARALLEL=false
```

### Agent Timeouts

```bash
# Default: 300 seconds
AGENT_TIMEOUT=300
```

Increase for complex codebases, decrease for CI/CD speed.

### Retry Configuration

```bash
AGENT_RETRY_ENABLED=true
AGENT_RETRY_COUNT=3
AGENT_RETRY_DELAY=5000  # milliseconds
```

## Cost Optimization

### Reduce Unnecessary Agent Runs

1. **Skip documentation-only changes:**
   ```yaml
   paths-ignore:
     - 'docs/**'
     - '*.md'
   ```

2. **Selective agent triggering:**
   ```bash
   if: contains(github.event.pull_request.labels.*.name, 'needs-review')
   ```

3. **Filter by file paths:**
   ```yaml
   paths:
     - 'backend/**'
   ```

## Monitoring & Analytics

### Dashboard Metrics

Create a monitoring dashboard tracking:
- Agent invocation frequency
- Average execution time per agent
- Success/failure rates
- Most common findings
- Time-to-review metrics

### Query Audit Logs

```bash
# Agent invocations last 7 days
for i in {0..6}; do
  date=$(date -d "$i days ago" +%Y-%m-%d)
  node scripts/agents-orchestrator.js audit-log $date
done

# Count by agent
grep '"agent"' logs/audit-*.json | \
  sed 's/.*"agent": "\([^"]*\)".*/\1/' | \
  sort | uniq -c | sort -rn
```

## Security Best Practices

### Protecting Secrets

1. **Never commit `.env.agents`:**
   ```bash
   echo ".env.agents" >> .gitignore
   ```

2. **Use GitHub Secrets** for all sensitive data

3. **Rotate API keys** regularly:
   - Claude API key: Quarterly
   - GitHub token: Quarterly
   - Webhook secret: Monthly

4. **Audit webhook access:**
   ```bash
   grep "webhook" logs/audit-*.json | jq '.details'
   ```

### Webhook Security

- **Signature verification:** Enabled by default
- **HTTPS only:** Use for production
- **Rate limiting:** Configure on your server
- **IP whitelisting:** (Optional) GitHub's IPs only

```bash
# GitHub webhook IPs
curl https://api.github.com/meta | jq '.hooks'
```

## Scaling Considerations

### Single Server
- Good for: Teams <20 developers
- Limitation: ~100 PR reviews/day

### Distributed System
- Use message queue (Redis, RabbitMQ)
- Multiple webhook servers
- Async agent processing
- Good for: Enterprise with high velocity

### Database Integration
For production:
1. Add database logging
2. Store audit trail in PostgreSQL
3. Add analytics queries
4. Create dashboards

## Advanced Configuration

### Custom Agent Triggers

Edit workflow files to add specific logic:

```yaml
if: |
  contains(github.event.pull_request.labels.*.name, 'security-review') ||
  contains(github.event.pull_request.files.*.filename, 'auth/**')
```

### Multi-Repository Setup

For monorepos or multiple projects:

```bash
# Run only relevant agents per service
if: contains(github.event.pull_request.files.*.filename, 'backend/**')
```

### Custom Notifications

Extend notification system:

```javascript
// agents-webhook-server.js
notifyTeams(data);      // Microsoft Teams
notifyDiscord(data);    // Discord
notifyPagerDuty(data);  // On-call rotation
```

## Support & Feedback

- **Documentation:** See `CLAUDE.md` for Claude Code setup
- **Issues:** Report in GitHub Issues
- **Feedback:** Contact engineering team

## Glossary

- **Agent:** Specialized Claude AI with domain expertise
- **MCP:** Model Context Protocol for tool integration
- **Webhook:** HTTP callback triggered by GitHub events
- **Audit Trail:** Complete log of all agent actions
- **Orchestrator:** System managing multiple agent invocations
