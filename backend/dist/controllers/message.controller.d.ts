import { Request, Response } from 'express';
/**
 * POST /api/messages/send
 * Send message to recipients
 */
export declare function sendMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/churches/:churchId/messages
 * Get message history with pagination
 */
export declare function getMessageHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/messages/:messageId
 * Get message details
 * SECURITY: Verifies message belongs to authenticated user's church
 */
export declare function getMessageDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/webhooks/telnyx/status
 * Webhook for Telnyx delivery status updates (DLR - Delivery Receipt)
 * Telnyx sends event-based webhooks without signature validation on HTTPS
 */
export declare function handleTelnyxWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=message.controller.d.ts.map