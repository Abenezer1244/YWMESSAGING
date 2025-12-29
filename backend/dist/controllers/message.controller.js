import * as messageService from '../services/message.service.js';
import * as telnyxService from '../services/telnyx.service.js';
import * as websocketService from '../services/websocket.service.js';
import { PrismaClient } from '@prisma/client';
import { decryptPhoneSafe } from '../utils/encryption.utils.js';
import { sendMessageSchema, getMessageHistorySchema } from '../lib/validation/schemas.js';
import { safeValidate } from '../lib/validation/schemas.js';
import { withRetry, TELNYX_RETRY_CONFIG } from '../utils/retry.js';
import { smsQueue } from '../jobs/queue.js';
const prisma = new PrismaClient();
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
        const { content, targetType, targetIds } = validationResult.data;
        // Create message record
        const message = await messageService.createMessage(tenantId, tenantPrisma, {
            content,
            targetType,
            targetIds,
        });
        // 🔔 Emit WebSocket event: Message sent (broadcasting to all users in this church)
        (async () => {
            try {
                const recipients = await prisma.messageRecipient.findMany({
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
                const recipients = await prisma.messageRecipient.findMany({
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
                            const result = await withRetry(() => telnyxService.sendSMS(decryptedPhone, content, churchId), `sendSMS:${recipient.id}`, TELNYX_RETRY_CONFIG);
                            await prisma.messageRecipient.update({
                                where: { id: recipient.id },
                                data: {
                                    providerMessageId: result.messageSid,
                                    status: 'pending',
                                },
                            });
                            console.log(`   ✓ Sent to ${recipient.member.firstName} ${recipient.member.lastName}`);
                        }
                    }
                    catch (error) {
                        // Mark as failed but continue with other recipients
                        await prisma.messageRecipient.update({
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
/**
 * POST /api/webhooks/telnyx/status
 * Webhook for Telnyx delivery status updates (DLR - Delivery Receipt)
 * Telnyx sends event-based webhooks without signature validation on HTTPS
 */
export async function handleTelnyxWebhook(req, res) {
    try {
        const { type, data } = req.body;
        // Only process message delivery receipts
        if (type !== 'message.dlr') {
            return res.status(200).json({ received: true });
        }
        const payload = data?.payload?.[0];
        if (!payload || !payload.id) {
            return res.status(400).json({ error: 'Payload with message ID required' });
        }
        const messageId = payload.id;
        const telnyxStatus = payload.status;
        // Find recipient by Telnyx message ID
        const recipient = await prisma.messageRecipient.findFirst({
            where: { providerMessageId: messageId },
            include: {
                message: {
                    include: { church: true },
                },
            },
        });
        if (!recipient) {
            // Message ID not found, just acknowledge webhook
            console.log(`Telnyx webhook: Message ID ${messageId} not found in database`);
            return res.status(200).json({ received: true });
        }
        // Map Telnyx status to our status
        let status = null;
        if (telnyxStatus === 'delivered') {
            status = 'delivered';
        }
        else if (telnyxStatus === 'failed' ||
            telnyxStatus === 'undelivered' ||
            telnyxStatus === 'bounced') {
            status = 'failed';
        }
        else {
            // pending, queued, etc. - don't update yet
            return res.status(200).json({ received: true });
        }
        if (status) {
            // Update recipient status
            const tenantId = recipient.message.churchId;
            const { getTenantPrisma } = await import('../lib/tenant-prisma.js');
            const tenantPrisma = await getTenantPrisma(tenantId);
            await messageService.updateRecipientStatus(tenantId, tenantPrisma, recipient.id, status, recipient.message.id, {
                failureReason: payload.error_message || undefined,
            });
            console.log(`Telnyx webhook: Updated message ${messageId} to ${status}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error processing Telnyx webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
}
//# sourceMappingURL=message.controller.js.map