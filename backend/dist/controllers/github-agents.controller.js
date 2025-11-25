import crypto from 'crypto';
import axios from 'axios';
import { invokeMultipleAgents, getAgentsForEvent, } from '../services/agent-invocation.service.js';
import { postOrUpdatePRFindings } from '../services/github-results.service.js';
/**
 * GitHub Webhook Controller
 * Handles automated agent invocation from GitHub Actions
 * Verifies webhook signatures and routes to Claude agents
 */
/**
 * Verify GitHub webhook signature using HMAC-SHA256
 * GitHub sends: X-Hub-Signature-256 header with signature
 * Format: sha256=hash_value
 */
function verifyGitHubSignature(payload, signatureHeader, webhookSecret) {
    if (!signatureHeader || !webhookSecret) {
        console.warn('⚠️ GitHub webhook missing signature or secret');
        return false;
    }
    try {
        // GitHub sends: sha256=abcd1234...
        const [algorithm, signature] = signatureHeader.split('=');
        if (algorithm !== 'sha256') {
            console.warn(`⚠️ Unexpected signature algorithm: ${algorithm}`);
            return false;
        }
        // Calculate expected signature
        const hash = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex');
        // Debug: Log first 10 chars of hashes
        console.log('🔐 Signature verification:');
        console.log(`   Received: ${signature.substring(0, 10)}...`);
        console.log(`   Calculated: ${hash.substring(0, 10)}...`);
        console.log(`   Payload size: ${payload.length} bytes`);
        console.log(`   Secret length: ${webhookSecret.length} chars`);
        // Constant-time comparison to prevent timing attacks
        const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
        if (!isValid) {
            console.error('❌ GitHub webhook signature verification failed');
            console.error(`   Expected: ${hash}`);
            console.error(`   Received: ${signature}`);
            return false;
        }
        console.log('✅ GitHub webhook signature verified successfully');
        return true;
    }
    catch (error) {
        console.error('❌ GitHub signature verification error:', error.message);
        return false;
    }
}
/**
 * POST /api/webhooks/github/agents
 * Receive GitHub webhook events from CI/CD workflows
 * Verify signature and invoke Claude agents
 */
export async function handleGitHubAgentsWebhook(req, res) {
    try {
        // Get webhook secret from environment
        const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('❌ CRITICAL: GITHUB_WEBHOOK_SECRET environment variable not configured');
            res.status(500).json({
                error: 'Server configuration error - webhook verification disabled',
            });
            return;
        }
        // Get signature from header
        const signature = req.headers['x-hub-signature-256'];
        const eventType = req.headers['x-github-event'];
        const deliveryId = req.headers['x-github-delivery'];
        // Get raw body for signature verification
        // express.raw() middleware provides req.body as Buffer
        // CRITICAL: Pass Buffer directly to HMAC - no encoding conversion
        // Any Buffer->String->Buffer conversion can cause encoding mismatches
        const rawBody = req.body;
        // Debug logging to diagnose payload issues
        const bodyLength = Buffer.isBuffer(rawBody) ? rawBody.length : rawBody.length;
        const bodyPreview = Buffer.isBuffer(rawBody)
            ? rawBody.toString('utf-8').substring(0, 200)
            : rawBody.substring(0, 200);
        console.log('🔍 Webhook payload details:');
        console.log(`   Body type: ${Buffer.isBuffer(req.body) ? 'Buffer' : typeof req.body}`);
        console.log(`   Body length: ${bodyLength} bytes`);
        console.log(`   Signature header: ${signature}`);
        console.log(`   Expected pattern: sha256=<hash>`);
        if (bodyLength < 500) {
            console.log(`   Payload preview: ${bodyPreview}`);
        }
        if (!signature) {
            console.warn('⚠️ GitHub webhook missing signature header');
            res.status(400).json({ error: 'Missing signature header' });
            return;
        }
        // Verify webhook signature
        // Pass Buffer directly - crypto.update() will handle both Buffer and string
        const isValidSignature = verifyGitHubSignature(rawBody, signature, webhookSecret);
        if (!isValidSignature) {
            console.error('❌ WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING');
            res.status(401).json({
                error: 'Invalid webhook signature - access denied',
            });
            return;
        }
        // Signature verified - safe to process
        console.log(`\n📨 GitHub Webhook Received`);
        console.log(`   Event Type: ${eventType}`);
        console.log(`   Delivery ID: ${deliveryId}`);
        // Parse webhook payload
        // When express.raw() is used, req.body is a Buffer/string, not parsed JSON
        // Parse it now that we've verified the signature
        let payload;
        if (Buffer.isBuffer(rawBody)) {
            payload = JSON.parse(rawBody.toString('utf-8'));
        }
        else if (typeof rawBody === 'string') {
            payload = JSON.parse(rawBody);
        }
        else {
            payload = rawBody; // Already parsed (shouldn't happen with express.raw())
        }
        // Log webhook details
        if (eventType === 'workflow_run') {
            console.log(`   Workflow: ${payload.workflow_run?.name}`);
            console.log(`   Status: ${payload.workflow_run?.conclusion}`);
            console.log(`   Branch: ${payload.workflow_run?.head_branch}`);
        }
        else if (eventType === 'pull_request') {
            console.log(`   PR Number: #${payload.pull_request?.number}`);
            console.log(`   PR Title: ${payload.pull_request?.title}`);
            console.log(`   Action: ${payload.action}`);
        }
        else if (eventType === 'push') {
            console.log(`   Commit SHA: ${payload.after?.substring(0, 7)}`);
            console.log(`   Branch: ${payload.ref}`);
            console.log(`   Pusher: ${payload.pusher?.name}`);
        }
        // Process webhook asynchronously (don't block response)
        processGitHubWebhook(eventType, payload).catch((error) => {
            console.error('⚠️ Error processing GitHub webhook:', error.message);
        });
        // Return 202 Accepted immediately
        console.log(`✅ GitHub webhook accepted for processing`);
        res.status(202).json({
            success: true,
            message: 'Webhook accepted for processing',
            deliveryId,
        });
    }
    catch (error) {
        console.error('❌ GitHub webhook endpoint error:', error.message);
        res.status(500).json({
            error: 'Internal server error processing webhook',
        });
    }
}
/**
 * Process GitHub webhook and invoke agents
 * Route to different agent handlers based on event type
 */
async function processGitHubWebhook(eventType, payload) {
    try {
        console.log(`\n🤖 Processing GitHub webhook: ${eventType}`);
        switch (eventType) {
            case 'pull_request':
                await handlePullRequestEvent(payload);
                break;
            case 'push':
                await handlePushEvent(payload);
                break;
            case 'workflow_run':
                await handleWorkflowRunEvent(payload);
                break;
            default:
                console.log(`⚠️ Unhandled GitHub event type: ${eventType}`);
        }
    }
    catch (error) {
        console.error('❌ Error processing GitHub webhook:', error.message);
    }
}
/**
 * Handle pull request events
 * Trigger: PR opened, synchronized, reopened
 */
async function handlePullRequestEvent(payload) {
    const action = payload.action;
    const pr = payload.pull_request;
    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
        console.log(`⚠️ Skipping PR action: ${action}`);
        return;
    }
    console.log(`\n🔍 PR Review Triggered`);
    console.log(`   PR #${pr.number}: ${pr.title}`);
    console.log(`   Author: ${pr.user.login}`);
    console.log(`   Branch: ${pr.head.ref}`);
    try {
        // Get agents for PR events
        const agents = getAgentsForEvent('pull_request');
        console.log(`\n📡 Invoking ${agents.length} agents in parallel...`);
        // Invoke all agents in parallel
        const responses = await invokeMultipleAgents(agents, {
            agentType: '',
            eventType: 'pull_request',
            context: { changesSummary: 'PR review requested' },
            githubData: { pr },
        }, true // parallel execution
        );
        console.log(`\n✅ All agents completed. Processing results...`);
        console.log(`   Successful responses: ${responses.length}/${agents.length}`);
        // Always attempt to post findings, even if some agents failed
        const repoOwner = pr.base?.repo?.owner?.login || 'unknown';
        const repoName = pr.base?.repo?.name || 'unknown';
        if (responses.length > 0) {
            const posted = await postOrUpdatePRFindings({
                repoOwner,
                repoName,
                prNumber: pr.number,
            }, responses);
            if (posted) {
                console.log(`✅ Agent findings posted to PR #${pr.number}`);
            }
            else {
                console.warn(`⚠️ Failed to post findings to PR #${pr.number}`);
            }
        }
        else {
            console.warn(`⚠️ No agents succeeded - skipping PR comment`);
        }
        // Send Slack notification (if configured)
        const severityCounts = {
            critical: responses.filter((r) => r.severity === 'critical').length,
            high: responses.filter((r) => r.severity === 'high').length,
        };
        await notifySlack({
            title: responses.length > 0 ? '🔍 PR Review Completed' : '⚠️ PR Review Partial',
            text: `PR #${pr.number}: *${pr.title}*\nAuthor: ${pr.user.login}\nAgents: ${responses.length}/${agents.length} succeeded\nCritical: ${severityCounts.critical} | High: ${severityCounts.high}`,
            color: responses.length === 0 ? '#FFA500' : severityCounts.critical > 0 ? '#D73A49' : '#28A745',
        });
    }
    catch (error) {
        console.error(`❌ Error processing PR event:`, error.message);
        await notifySlack({
            title: '❌ PR Review Failed',
            text: `PR #${pr.number}: *${pr.title}*\nError: ${error.message}`,
            color: '#D73A49',
        });
    }
}
/**
 * Handle push events
 * Trigger: Code pushed to main branch
 */
async function handlePushEvent(payload) {
    const ref = payload.ref;
    const branch = ref.replace('refs/heads/', '');
    // Only process main branch
    if (branch !== 'main') {
        console.log(`⚠️ Skipping push to non-main branch: ${branch}`);
        return;
    }
    const after = payload.after;
    const pusher = payload.pusher;
    const commits = payload.commits || [];
    console.log(`\n📤 Push to main branch detected`);
    console.log(`   Commit: ${after.substring(0, 7)}`);
    console.log(`   Pusher: ${pusher.name}`);
    console.log(`   Commits: ${commits.length}`);
    try {
        // Get agents for push events
        const agents = getAgentsForEvent('push');
        console.log(`\n📡 Invoking ${agents.length} agents in parallel...`);
        // Invoke all agents in parallel
        const responses = await invokeMultipleAgents(agents, {
            agentType: '',
            eventType: 'push',
            context: { analysis: 'Post-merge code analysis' },
            githubData: { pusher, after, commits },
        }, true // parallel execution
        );
        console.log(`\n✅ All agents completed. Post-merge analysis done.`);
        console.log(`   Successful responses: ${responses.length}/${agents.length}`);
        // Send Slack notification with results
        const severityCounts = {
            critical: responses.filter((r) => r.severity === 'critical').length,
            high: responses.filter((r) => r.severity === 'high').length,
        };
        await notifySlack({
            title: responses.length > 0 ? '📤 Post-Merge Analysis Completed' : '⚠️ Post-Merge Analysis Partial',
            text: `Commit: \`${after.substring(0, 7)}\`\nPushed by: ${pusher.name}\nAgents: ${responses.length}/${agents.length} succeeded\nCritical: ${severityCounts.critical} | High: ${severityCounts.high}`,
            color: responses.length === 0 ? '#FFA500' : severityCounts.critical > 0 ? '#D73A49' : '#28A745',
        });
    }
    catch (error) {
        console.error(`❌ Error processing push event:`, error.message);
        await notifySlack({
            title: '❌ Post-Merge Analysis Failed',
            text: `Commit: \`${after.substring(0, 7)}\`\nError: ${error.message}`,
            color: '#D73A49',
        });
    }
}
/**
 * Handle workflow run events
 * Trigger: Scheduled workflows (security audit, performance analysis)
 */
async function handleWorkflowRunEvent(payload) {
    const workflow = payload.workflow_run;
    const action = payload.action;
    if (action !== 'completed') {
        console.log(`⚠️ Skipping workflow action: ${action}`);
        return;
    }
    const name = workflow.name;
    const status = workflow.conclusion;
    console.log(`\n⚙️ Workflow Run Event`);
    console.log(`   Workflow: ${name}`);
    console.log(`   Status: ${status}`);
    try {
        // Get agents for workflow event
        const agents = getAgentsForEvent('workflow_run');
        if (agents.length === 0) {
            console.log(`⚠️ No agents configured for workflow events`);
            return;
        }
        console.log(`\n📡 Invoking ${agents.length} agent(s)...`);
        // Invoke agents
        const responses = await invokeMultipleAgents(agents, {
            agentType: '',
            eventType: 'workflow_run',
            context: { analysis: 'Scheduled workflow analysis' },
            githubData: { workflow },
        }, true // parallel execution
        );
        console.log(`\n✅ Workflow analysis completed.`);
        console.log(`   Successful responses: ${responses.length}/${agents.length}`);
        // Send Slack notification
        await notifySlack({
            title: `⚙️ Scheduled Workflow: ${name}`,
            text: `Status: ${status}\nAgents: ${responses.length}/${agents.length} completed`,
            color: responses.length === 0 ? '#FFA500' : status === 'success' ? '#28A745' : '#D73A49',
        });
    }
    catch (error) {
        console.error(`❌ Error processing workflow event:`, error.message);
        await notifySlack({
            title: `❌ Workflow Analysis Failed: ${name}`,
            text: `Error: ${error.message}`,
            color: '#D73A49',
        });
    }
}
/**
 * Send Slack notification
 * Optional: only if SLACK_WEBHOOK_URL is configured
 */
async function notifySlack(message) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
        return; // Slack not configured, skip
    }
    try {
        await axios.post(webhookUrl, {
            attachments: [
                {
                    fallback: message.title,
                    color: message.color,
                    title: message.title,
                    text: message.text,
                    footer: 'Automated Agent System',
                    ts: Math.floor(Date.now() / 1000),
                },
            ],
        });
        console.log('✅ Slack notification sent');
    }
    catch (error) {
        console.error('⚠️ Failed to send Slack notification:', error.message);
        // Don't fail the webhook processing if Slack fails
    }
}
/**
 * Health check endpoint for GitHub webhooks
 */
export async function checkGitHubWebhookHealth(req, res) {
    res.status(200).json({
        status: 'ok',
        message: 'GitHub agent webhook endpoint is healthy',
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=github-agents.controller.js.map