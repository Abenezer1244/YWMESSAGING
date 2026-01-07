import * as messageService from '../services/message.service.js';
import * as telnyxService from '../services/telnyx.service.js';
import * as websocketService from '../services/websocket.service.js';
import * as rcsService from '../services/telnyx-rcs.service.js';
import { decryptPhoneSafe } from '../utils/encryption.utils.js';
import { sendMessageSchema, getMessageHistorySchema } from '../lib/validation/schemas.js';
import { safeValidate } from '../lib/validation/schemas.js';
import { withRetry, TELNYX_RETRY_CONFIG } from '../utils/retry.js';
import { smsQueue } from '../jobs/queue.js';
/**
 * POST /api/messages/send
 * Send message to recipients synchronously (no Redis queue)
 */
export async function sendMessage(req, res) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        const churchId = tenantId; // Alias for compatibility
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // ✅ SECURITY: Validate request body with Zod schema
        const validationResult = safeValidate(sendMessageSchema, req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationResult.errors,
            });
        }
        const { content, targetType, targetIds, richCard } = validationResult.data;
        // Create message record (with optional rich card data)
        const message = await messageService.createMessage(tenantId, tenantPrisma, {
            content,
            targetType,
            targetIds,
            richCard,
        });
        // 🔔 Emit WebSocket event: Message sent (broadcasting to all users in this church)
        (async () => {
            try {
                const recipients = await tenantPrisma.messageRecipient.findMany({
                    where: { messageId: message.id },
                });
                websocketService.broadcastMessageSent(churchId, message.id, recipients.length);
            }
            catch (error) {
                console.error('Failed to emit WebSocket message:sent event:', error);
            }
        })();
        // ✅ PHASE 1: Queue SMS messages for improved reliability and throughput
        // Messages are now sent asynchronously via Bull queue with automatic retry
        (async () => {
            try {
                // Get all recipients for this message
                const recipients = await tenantPrisma.messageRecipient.findMany({
                    where: { messageId: message.id },
                    include: { member: true },
                });
                console.log(`📤 Queueing message to ${recipients.length} recipients`);
                // Queue each recipient for SMS sending
                for (const recipient of recipients) {
                    try {
                        // Decrypt phone number (stored encrypted in database, or plain text for legacy records)
                        const decryptedPhone = decryptPhoneSafe(recipient.member.phone);
                        // Queue the SMS job with automatic retry (handled by Bull)
                        if (smsQueue) {
                            await smsQueue.add({
                                phone: decryptedPhone,
                                churchId,
                                content,
                                recipientId: recipient.id,
                                messageId: message.id,
                                // RCS rich card data (optional) - for iMessage-style messaging
                                richCard: richCard || undefined,
                            }, {
                                attempts: 3, // Automatic retry up to 3 times
                                backoff: {
                                    type: 'exponential',
                                    delay: 2000, // Start with 2 second delay
                                },
                                removeOnComplete: true,
                                removeOnFail: false, // Keep failed jobs for analysis
                            });
                            console.log(`   ✓ Queued SMS to ${recipient.member.firstName} ${recipient.member.lastName}`);
                        }
                        else {
                            // Fallback: Send directly if queue is disabled
                            let result;
                            let messageId;
                            // ✅ RCS: Use rich card if data provided (iMessage-style)
                            if (richCard && richCard.title) {
                                const rcsResult = await rcsService.sendChurchAnnouncement(decryptedPhone, churchId, {
                                    title: richCard.title,
                                    description: richCard.description || content,
                                    imageUrl: richCard.imageUrl,
                                    rsvpUrl: richCard.rsvpUrl,
                                    websiteUrl: richCard.websiteUrl,
                                    phoneNumber: richCard.phoneNumber,
                                    location: richCard.location,
                                    quickReplies: richCard.quickReplies,
                                });
                                messageId = rcsResult.messageId;
                                console.log(`   ✓ Sent rich card to ${recipient.member.firstName} via ${rcsResult.channel.toUpperCase()}`);
                            }
                            else {
                                // Standard SMS
                                const smsResult = await withRetry(() => telnyxService.sendSMS(decryptedPhone, content, churchId), `sendSMS:${recipient.id}`, TELNYX_RETRY_CONFIG);
                                messageId = smsResult.messageSid;
                                console.log(`   ✓ Sent SMS to ${recipient.member.firstName} ${recipient.member.lastName}`);
                            }
                            await tenantPrisma.messageRecipient.update({
                                where: { id: recipient.id },
                                data: {
                                    providerMessageId: messageId,
                                    status: 'pending',
                                },
                            });
                        }
                    }
                    catch (error) {
                        // Mark as failed but continue with other recipients
                        await tenantPrisma.messageRecipient.update({
                            where: { id: recipient.id },
                            data: {
                                status: 'failed',
                                failureReason: error.message,
                                failedAt: new Date(),
                            },
                        });
                        console.error(`   ✗ Failed to queue SMS to ${recipient.member.firstName}: ${error.message}`);
                    }
                }
                // Update message stats
                await messageService.updateMessageStats(tenantId, tenantPrisma, message.id);
                console.log(`✅ Message queued for delivery: ${message.id}`);
            }
            catch (error) {
                console.error('❌ Error queueing message batch:', error.message);
            }
        })(); // Fire and forget - don't wait for queuing to complete
        res.status(201).json({
            success: true,
            data: message,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * GET /api/churches/:churchId/messages
 * Get message history with pagination
 */
export async function getMessageHistory(req, res) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // ✅ SECURITY: Validate query parameters with Zod schema
        const validationResult = safeValidate(getMessageHistorySchema, req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationResult.errors,
            });
        }
        const { page, limit, status } = validationResult.data;
        const result = await messageService.getMessageHistory(tenantId, tenantPrisma, {
            page,
            limit,
            status,
        });
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * GET /api/messages/:messageId
 * Get message details
 * SECURITY: Verifies message belongs to authenticated user's church
 */
export async function getMessageDetails(req, res) {
    try {
        const { messageId } = req.params;
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        // SECURITY: Verify message belongs to user's tenant before returning details
        const message = await messageService.getMessageDetails(tenantId, tenantPrisma, messageId);
        if (!message || message.churchId !== tenantId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }
        res.json({
            success: true,
            data: message,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
// ============================================================================
// RCS RICH MESSAGING ENDPOINTS
// ============================================================================
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
export async function sendRichAnnouncement(req, res) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { title, description, imageUrl, rsvpUrl, websiteUrl, phoneNumber, location, quickReplies, } = req.body;
        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Title and description are required',
            });
        }
        // Get all members with SMS opt-in
        const members = await tenantPrisma.member.findMany({
            where: { optInSms: true },
            select: { id: true, firstName: true, phone: true },
        });
        if (members.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No members with SMS opt-in found',
            });
        }
        console.log(`📢 Sending RCS announcement "${title}" to ${members.length} members`);
        // Send to each member
        const results = {
            total: members.length,
            rcs: 0,
            sms: 0,
            mms: 0,
            failed: 0,
        };
        for (const member of members) {
            try {
                const decryptedPhone = decryptPhoneSafe(member.phone);
                if (!decryptedPhone) {
                    results.failed++;
                    continue;
                }
                const result = await rcsService.sendChurchAnnouncement(decryptedPhone, tenantId, {
                    title,
                    description,
                    imageUrl,
                    rsvpUrl,
                    websiteUrl,
                    phoneNumber,
                    location,
                    quickReplies,
                });
                if (result.success) {
                    results[result.channel]++;
                }
                else {
                    results.failed++;
                }
            }
            catch (error) {
                console.error(`Failed to send to ${member.firstName}:`, error.message);
                results.failed++;
            }
        }
        console.log(`📢 Announcement results: RCS=${results.rcs}, SMS=${results.sms}, MMS=${results.mms}, Failed=${results.failed}`);
        res.json({
            success: true,
            data: {
                message: `Announcement sent to ${results.total} members`,
                results,
            },
        });
    }
    catch (error) {
        console.error('Error sending announcement:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
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
export async function sendEventInvitation(req, res) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { title, description, imageUrl, startTime, endTime, location } = req.body;
        if (!title || !description || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, startTime, and endTime are required',
            });
        }
        // Get all members
        const members = await tenantPrisma.member.findMany({
            where: { optInSms: true },
            select: { id: true, firstName: true, phone: true },
        });
        console.log(`📅 Sending event invitation "${title}" to ${members.length} members`);
        const results = { total: members.length, rcs: 0, sms: 0, mms: 0, failed: 0 };
        for (const member of members) {
            try {
                const decryptedPhone = decryptPhoneSafe(member.phone);
                if (!decryptedPhone) {
                    results.failed++;
                    continue;
                }
                const result = await rcsService.sendEventInvitation(decryptedPhone, tenantId, { title, description, imageUrl, startTime, endTime, location });
                if (result.success) {
                    results[result.channel]++;
                }
                else {
                    results.failed++;
                }
            }
            catch (error) {
                results.failed++;
            }
        }
        res.json({
            success: true,
            data: { message: `Event invitation sent`, results },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
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
export async function sendWeeklySchedule(req, res) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const { events } = req.body;
        if (!events || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Events array is required',
            });
        }
        // Get all members
        const members = await tenantPrisma.member.findMany({
            where: { optInSms: true },
            select: { id: true, firstName: true, phone: true },
        });
        console.log(`📆 Sending weekly schedule (${events.length} events) to ${members.length} members`);
        const results = { total: members.length, rcs: 0, sms: 0, mms: 0, failed: 0 };
        for (const member of members) {
            try {
                const decryptedPhone = decryptPhoneSafe(member.phone);
                if (!decryptedPhone) {
                    results.failed++;
                    continue;
                }
                const result = await rcsService.sendWeeklySchedule(decryptedPhone, tenantId, events);
                if (result.success) {
                    results[result.channel]++;
                }
                else {
                    results.failed++;
                }
            }
            catch (error) {
                results.failed++;
            }
        }
        res.json({
            success: true,
            data: { message: `Weekly schedule sent`, results },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
/**
 * GET /api/messages/rcs/status
 * Check RCS configuration status for the church
 */
export async function getRCSStatus(req, res) {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const status = await rcsService.validateRCSSetup(tenantId);
        res.json({
            success: true,
            data: status,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
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
export async function handleTelnyxWebhook(req, res) {
    try {
        console.log('[DEPRECATED] message.controller.handleTelnyxWebhook called - use conversation.controller version');
        // Just acknowledge the webhook
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error('Error processing Telnyx webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
}
//# sourceMappingURL=message.controller.js.map