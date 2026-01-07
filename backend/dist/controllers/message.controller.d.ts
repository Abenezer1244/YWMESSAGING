import { Request, Response } from 'express';
/**
 * POST /api/messages/send
 * Send message to recipients synchronously (no Redis queue)
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
 * POST /api/messages/rcs/announcement
 * Send a rich card announcement to all members
 *
 * Request body:
 * {
 *   title: string,
 *   description: string,
 *   imageUrl?: string,
 *   rsvpUrl?: string,
 *   websiteUrl?: string,
 *   phoneNumber?: string,
 *   location?: { latitude, longitude, label },
 *   quickReplies?: string[]
 * }
 */
export declare function sendRichAnnouncement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/messages/rcs/event
 * Send an event invitation to all members
 *
 * Request body:
 * {
 *   title: string,
 *   description: string,
 *   imageUrl?: string,
 *   startTime: string (ISO 8601),
 *   endTime: string (ISO 8601),
 *   location?: { latitude, longitude, label }
 * }
 */
export declare function sendEventInvitation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/messages/rcs/schedule
 * Send weekly schedule as a carousel
 *
 * Request body:
 * {
 *   events: Array<{
 *     title: string,
 *     description: string,
 *     imageUrl?: string,
 *     location?: { latitude, longitude, label }
 *   }>
 * }
 */
export declare function sendWeeklySchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/messages/rcs/status
 * Check RCS configuration status for the church
 */
export declare function getRCSStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/webhooks/telnyx/status
 * Webhook for Telnyx delivery status updates (DLR - Delivery Receipt)
 *
 * FIXME: This function is deprecated. The active webhook handler is in conversation.controller.ts
 * This handler cannot work in database-per-tenant architecture without a WebhookMessageMapping table
 * in the registry to map providerMessageId -> tenantId.
 *
 * Routes use conversation.controller.handleTelnyxWebhook instead.
 */
export declare function handleTelnyxWebhook(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=message.controller.d.ts.map