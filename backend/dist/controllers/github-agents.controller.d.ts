import { Request, Response } from 'express';
/**
 * POST /api/webhooks/github/agents
 * Receive GitHub webhook events from CI/CD workflows
 * Verify signature and invoke Claude agents
 */
export declare function handleGitHubAgentsWebhook(req: Request, res: Response): Promise<void>;
/**
 * Health check endpoint for GitHub webhooks
 */
export declare function checkGitHubWebhookHealth(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=github-agents.controller.d.ts.map