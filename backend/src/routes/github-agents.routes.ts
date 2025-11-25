import { Router } from 'express';
import express from 'express';
import {
  handleGitHubAgentsWebhook,
  checkGitHubWebhookHealth,
} from '../controllers/github-agents.controller.js';

const router = Router();

/**
 * GitHub Agents Webhook Routes
 *
 * These endpoints receive webhooks from GitHub Actions workflows
 * and trigger Claude agents for automated code review, testing, and analysis
 */

/**
 * POST /api/webhooks/github/agents
 * Main webhook endpoint for GitHub Actions
 *
 * GitHub sends:
 * - Event type in X-Github-Event header
 * - Signature in X-Hub-Signature-256 header
 * - Payload in request body
 *
 * CRITICAL: Using express.raw() middleware to capture raw bytes for HMAC verification
 * This MUST be applied directly to this route to intercept the body before parsing
 */
// IMPORTANT: Do NOT apply express.raw() here - it's already applied globally
// at app.use('/api/webhooks/', express.raw(...)) in app.ts
// Applying it twice causes body parsing conflicts
router.post(
  '/webhooks/github/agents',
  handleGitHubAgentsWebhook
);

/**
 * GET /api/webhooks/github/agents/health
 * Health check endpoint
 * Used by monitoring systems to verify the webhook endpoint is running
 */
router.get('/webhooks/github/agents/health', checkGitHubWebhookHealth);

export default router;
