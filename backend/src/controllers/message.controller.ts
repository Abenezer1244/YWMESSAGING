import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import * as messageService from '../services/message.service.js';
import * as telnyxService from '../services/telnyx.service.js';
import * as websocketService from '../services/websocket.service.js';
import { decrypt, decryptPhoneSafe } from '../utils/encryption.utils.js';
import { sendMessageSchema, getMessageHistorySchema } from '../lib/validation/schemas.js';
import { safeValidate } from '../lib/validation/schemas.js';
import { withRetry, TELNYX_RETRY_CONFIG } from '../utils/retry.js';
import { smsQueue } from '../jobs/queue.js';
import crypto from 'crypto';


/**
 * POST /api/messages/send
 * Send message to recipients synchronously (no Redis queue)
 */
export async function sendMessage(req: Request, res: Response) {
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

    const { content, targetType, targetIds } = validationResult.data as any;

    // Create message record
    const message = await messageService.createMessage(tenantId, tenantPrisma, {
      content,
      targetType,
      targetIds,
    });

    // 🔔 Emit WebSocket event: Message sent (broadcasting to all users in this church)
    (async () => {
      try {
        const recipients = await tenantPrisma.messageRecipient.findMany({
          where: { messageId: message.id },
        });
        websocketService.broadcastMessageSent(churchId!, message.id, recipients.length);
      } catch (error) {
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
              await smsQueue.add(
                {
                  phone: decryptedPhone,
                  churchId,
                  content,
                  recipientId: recipient.id,
                  messageId: message.id,
                },
                {
                  attempts: 3, // Automatic retry up to 3 times
                  backoff: {
                    type: 'exponential',
                    delay: 2000, // Start with 2 second delay
                  },
                  removeOnComplete: true,
                  removeOnFail: false, // Keep failed jobs for analysis
                }
              );

              console.log(`   ✓ Queued SMS to ${recipient.member.firstName} ${recipient.member.lastName}`);
            } else {
              // Fallback: Send directly if queue is disabled
              const result = await withRetry(
                () => telnyxService.sendSMS(
                  decryptedPhone,
                  content,
                  churchId!
                ),
                `sendSMS:${recipient.id}`,
                TELNYX_RETRY_CONFIG
              );

              await tenantPrisma.messageRecipient.update({
                where: { id: recipient.id },
                data: {
                  providerMessageId: result.messageSid,
                  status: 'pending',
                },
              });

              console.log(`   ✓ Sent to ${recipient.member.firstName} ${recipient.member.lastName}`);
            }
          } catch (error: any) {
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
      } catch (error: any) {
        console.error('❌ Error queueing message batch:', error.message);
      }
    })(); // Fire and forget - don't wait for queuing to complete

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/churches/:churchId/messages
 * Get message history with pagination
 */
export async function getMessageHistory(req: Request, res: Response) {
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

    const { page, limit, status } = validationResult.data as any;

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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * GET /api/messages/:messageId
 * Get message details
 * SECURITY: Verifies message belongs to authenticated user's church
 */
export async function getMessageDetails(req: Request, res: Response) {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
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
export async function handleTelnyxWebhook(req: Request, res: Response) {
  try {
    console.log('[DEPRECATED] message.controller.handleTelnyxWebhook called - use conversation.controller version');
    // Just acknowledge the webhook
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing Telnyx webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
