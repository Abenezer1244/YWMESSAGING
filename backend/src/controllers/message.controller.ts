import { Request, Response } from 'express';
import * as messageService from '../services/message.service.js';
import * as telnyxService from '../services/telnyx.service.js';
import { PrismaClient } from '@prisma/client';
import { decrypt, decryptPhoneSafe } from '../utils/encryption.utils.js';
import { sendMessageSchema, getMessageHistorySchema } from '../lib/validation/schemas.js';
import { safeValidate } from '../lib/validation/schemas.js';
import crypto from 'crypto';

const prisma = new PrismaClient();


/**
 * POST /api/messages/send
 * Send message to recipients synchronously (no Redis queue)
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;

    if (!churchId) {
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
    const message = await messageService.createMessage(churchId, {
      content,
      targetType,
      targetIds,
    });

    // Send messages synchronously to all recipients
    (async () => {
      try {
        // Get all recipients for this message
        const recipients = await prisma.messageRecipient.findMany({
          where: { messageId: message.id },
          include: { member: true },
        });

        console.log(`📤 Sending message to ${recipients.length} recipients`);

        // Send to each recipient
        for (const recipient of recipients) {
          try {
            // Decrypt phone number (stored encrypted in database, or plain text for legacy records)
            const decryptedPhone = decryptPhoneSafe(recipient.member.phone);

            const result = await telnyxService.sendSMS(
              decryptedPhone,
              content,
              churchId
            );

            // Update recipient with Telnyx message ID
            await prisma.messageRecipient.update({
              where: { id: recipient.id },
              data: {
                providerMessageId: result.messageSid,
                status: 'pending', // Pending delivery confirmation from Telnyx
              },
            });

            console.log(`   ✓ Sent to ${recipient.member.firstName} ${recipient.member.lastName}`);
          } catch (error: any) {
            // Mark as failed but continue with other recipients
            await prisma.messageRecipient.update({
              where: { id: recipient.id },
              data: {
                status: 'failed',
                failureReason: error.message,
                failedAt: new Date(),
              },
            });

            console.error(`   ✗ Failed to send to ${recipient.member.firstName}: ${error.message}`);
          }
        }

        // Update message stats
        await messageService.updateMessageStats(message.id);
        console.log(`✅ Message broadcast complete: ${message.id}`);
      } catch (error: any) {
        console.error('❌ Error sending message batch:', error.message);
      }
    })(); // Fire and forget - don't wait for sending to complete

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
    const churchId = req.user?.churchId;

    if (!churchId) {
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

    const result = await messageService.getMessageHistory(churchId, {
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
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // SECURITY: Verify message belongs to user's church before returning details
    const message = await messageService.getMessageDetails(messageId);

    if (!message || message.churchId !== churchId) {
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
 * Telnyx sends event-based webhooks without signature validation on HTTPS
 */
export async function handleTelnyxWebhook(req: Request, res: Response) {
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
    let status: 'delivered' | 'failed' | null = null;

    if (telnyxStatus === 'delivered') {
      status = 'delivered';
    } else if (
      telnyxStatus === 'failed' ||
      telnyxStatus === 'undelivered' ||
      telnyxStatus === 'bounced'
    ) {
      status = 'failed';
    } else {
      // pending, queued, etc. - don't update yet
      return res.status(200).json({ received: true });
    }

    if (status) {
      // Update recipient status
      await messageService.updateRecipientStatus(recipient.id, status, {
        failureReason: payload.error_message || undefined,
      });

      console.log(`Telnyx webhook: Updated message ${messageId} to ${status}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Telnyx webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
