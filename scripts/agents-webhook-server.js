#!/usr/bin/env node

/**
 * Automated Agent Webhook Server
 * Handles GitHub webhook events and invokes Claude agents
 *
 * This server listens for webhook events from GitHub Actions workflows
 * and invokes the appropriate Claude agents for code review, testing, etc.
 */

const http = require('http');
const crypto = require('crypto');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

// Configuration
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your-webhook-secret';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Initialize GitHub API client
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Agent configuration
const AGENTS = {
  'backend-engineer': {
    name: 'Backend Engineer',
    icon: '🔧',
    description: 'Code review, API design, database optimization'
  },
  'senior-frontend': {
    name: 'Senior Frontend Engineer',
    icon: '🎨',
    description: 'Component architecture, performance optimization'
  },
  'security-analyst': {
    name: 'Security Analyst',
    icon: '🔒',
    description: 'Vulnerability assessment, threat modeling'
  },
  'design-review': {
    name: 'Design Review',
    icon: '✨',
    description: 'UI/UX review, accessibility compliance'
  },
  'qa-testing': {
    name: 'QA Testing',
    icon: '✅',
    description: 'Test planning, regression testing'
  },
  'system-architecture': {
    name: 'System Architecture',
    icon: '🏗️',
    description: 'System design, scalability analysis'
  },
  'devops': {
    name: 'DevOps',
    icon: '🚀',
    description: 'Deployment, infrastructure, CI/CD'
  },
  'product-manager': {
    name: 'Product Manager',
    icon: '📊',
    description: 'Feature prioritization, roadmap'
  }
};

/**
 * Verify GitHub webhook signature
 */
function verifySignature(req, body) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return signature === `sha256=${hash}`;
}

/**
 * Invoke Claude agent via webhook
 */
async function invokeAgent(agent, payload, context) {
  try {
    console.log(`\n📡 Invoking ${AGENTS[agent].name} agent...`);

    const agentPayload = {
      agent,
      timestamp: new Date().toISOString(),
      github_context: context,
      webhook_data: payload
    };

    // Log the agent invocation
    await logAgentInvocation(agent, context, 'started');

    // In production, this would call Claude API or invoke via webhook
    console.log(`✅ ${AGENTS[agent].name} invocation queued`);

    // Send Slack notification
    if (SLACK_WEBHOOK_URL) {
      await notifySlack({
        agent,
        status: 'started',
        context
      });
    }

    return { success: true, agent, status: 'queued' };
  } catch (error) {
    console.error(`❌ Error invoking ${agent}:`, error);
    await logAgentInvocation(agent, context, 'failed', error.message);
    return { success: false, agent, error: error.message };
  }
}

/**
 * Handle PR events
 */
async function handlePREvent(event) {
  const { action, pull_request, repository } = event;

  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return { status: 'skipped', reason: `PR action '${action}' not in trigger list` };
  }

  const context = {
    event_type: 'pull_request',
    pr_number: pull_request.number,
    pr_title: pull_request.title,
    pr_author: pull_request.user.login,
    repo: repository.full_name,
    branch: pull_request.head.ref,
    base_branch: pull_request.base.ref
  };

  console.log(`\n🔔 PR Event: #${pull_request.number} - ${pull_request.title}`);

  const agentsToInvoke = [
    'backend-engineer',
    'senior-frontend',
    'security-analyst',
    'design-review',
    'qa-testing'
  ];

  const results = await Promise.all(
    agentsToInvoke.map(agent => invokeAgent(agent, event, context))
  );

  return {
    status: 'processed',
    context,
    results
  };
}

/**
 * Handle push events (main branch)
 */
async function handlePushEvent(event) {
  const { ref, repository, pusher } = event;

  if (ref !== 'refs/heads/main') {
    return { status: 'skipped', reason: 'Only main branch triggers post-merge analysis' };
  }

  const context = {
    event_type: 'push',
    commit_sha: event.after,
    repo: repository.full_name,
    branch: 'main',
    pusher: pusher.name
  };

  console.log(`\n🔔 Push Event: Commit ${event.after.substring(0, 7)} to main`);

  const agentsToInvoke = [
    'system-architecture',
    'devops',
    'product-manager'
  ];

  const results = await Promise.all(
    agentsToInvoke.map(agent => invokeAgent(agent, event, context))
  );

  return {
    status: 'processed',
    context,
    results
  };
}

/**
 * Log agent invocation for audit trail
 */
async function logAgentInvocation(agent, context, status, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    agent,
    context,
    status,
    error
  };

  console.log(`📝 [AUDIT LOG] Agent: ${agent}, Status: ${status}`);

  // In production, this would write to database or logging service
  // For now, we'll just log to console
  if (error) {
    console.error(`   Error: ${error}`);
  }
}

/**
 * Send Slack notification
 */
async function notifySlack(data) {
  if (!SLACK_WEBHOOK_URL) return;

  try {
    const agent = AGENTS[data.agent];
    const message = {
      text: `${agent.icon} ${agent.name} Review`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${agent.icon} **${agent.name}** - ${data.status}\n*Context:* ${JSON.stringify(data.context).substring(0, 100)}...`
          }
        }
      ]
    };

    await axios.post(SLACK_WEBHOOK_URL, message);
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
  }
}

/**
 * Post comment on GitHub PR
 */
async function postPRComment(owner, repo, issueNumber, comment) {
  try {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: comment
    });
    console.log(`✅ Posted comment on PR #${issueNumber}`);
  } catch (error) {
    console.error('Failed to post PR comment:', error.message);
  }
}

/**
 * Main webhook handler
 */
async function handleWebhook(event, headers) {
  const eventType = headers['x-github-event'];

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📨 GitHub Webhook Received: ${eventType}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  switch (eventType) {
    case 'pull_request':
      return await handlePREvent(event);
    case 'push':
      return await handlePushEvent(event);
    case 'workflow_run':
      console.log('Workflow run event received');
      return { status: 'processing', event_type: eventType };
    default:
      return { status: 'ignored', reason: `Event type '${eventType}' not configured` };
  }
}

/**
 * Health check endpoint
 */
function healthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    agents: Object.keys(AGENTS).length
  };
}

/**
 * Create HTTP server
 */
const server = http.createServer(async (req, res) => {
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthCheck()));
    return;
  }

  // Webhook endpoint
  if (req.url === '/webhook' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        // Verify webhook signature
        if (!verifySignature(req, body)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }

        const event = JSON.parse(body);
        const result = await handleWebhook(event, req.headers);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          result,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Webhook processing error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Automated Agent Webhook Server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`\n✅ Ready to receive GitHub webhooks!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📍 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
