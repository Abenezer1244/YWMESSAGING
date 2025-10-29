import { Request, Response } from 'express';
/**
 * POST /api/churches/:churchId/twilio/connect
 * Connect Twilio credentials
 */
export declare function connectTwilio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
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
 */
export declare function getMessageDetails(req: Request, res: Response): Promise<void>;
/**
 * POST /api/webhooks/twilio/status
 * Webhook for Twilio delivery status updates
 */
export declare function handleTwilioWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=message.controller.d.ts.map