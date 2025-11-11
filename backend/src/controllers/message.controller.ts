import { Request, Response } from 'express';
import * as messageService from '../services/message.service.js';
import * as twilioService from '../services/twilio.service.js';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * SECURITY: Validate Twilio webhook request signature
 * Twilio includes X-Twilio-Signature header with HMAC-SHA1 of request URL + body
 */
function validateTwilioSignature(req: Request, twilioAuthToken: string): boolean {
  const signature = req.headers['x-twilio-signature'] as string;
  if (!signature) {
    return false;
  }

  const url = `https://${req.get('host')}${req.originalUrl}`;
  const hmac = crypto.createHmac('sha1', twilioAuthToken);
  hmac.update(url + new URLSearchParams(req.body as Record<string, string>).toString());
  const computedSignature = hmac.digest('base64');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
}

/**
 * POST /api/churches/:churchId/twilio/connect
 * Koinonia Twilio credentials
 */
export async function connectTwilio(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    const { accountSid, authToken, phoneNumber } = req.body;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate input
    if (!accountSid || !authToken || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'accountSid, authToken, and phoneNumber are required',
      });
    }

    // Validate credentials
    const isValid = await twilioService.validateTwilioCredentials(
      accountSid,
      authToken,
      phoneNumber
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Twilio credentials',
      });
    }

    // Save credentials
    const church = await prisma.church.update({
      where: { id: churchId },
      data: {
        twilioAccountSid: accountSid,
        twilioAuthToken: authToken,
        twilioPhoneNumber: phoneNumber,
        twilioVerified: true,
      },
    });

    res.json({
      success: true,
      data: {
        twilioVerified: church.twilioVerified,
        twilioPhoneNumber: church.twilioPhoneNumber,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/messages/send
 * Send message to recipients
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    const { content, targetType, targetIds } = req.body;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate input
    if (!content || !targetType) {
      return res.status(400).json({
        success: false,
        error: 'content and targetType are required',
      });
    }

    if (content.length === 0 || content.length > 1600) {
      return res.status(400).json({
        success: false,
        error: 'Message must be between 1 and 1600 characters',
      });
    }

    // Create message record
    const message = await messageService.createMessage(churchId, {
      content,
      targetType,
      targetIds: targetIds || [],
    });

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
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const status = req.query.status as string | undefined;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

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
 * POST /api/webhooks/twilio/status
 * Webhook for Twilio delivery status updates
 * SECURITY: Validates Twilio signature using auth token from database
 */
export async function handleTwilioWebhook(req: Request, res: Response) {
  try {
    const { MessageSid, MessageStatus } = req.body;

    if (!MessageSid) {
      return res.status(400).json({ error: 'MessageSid required' });
    }

    // Find recipient by Twilio message SID to get church
    const recipient = await prisma.messageRecipient.findFirst({
      where: { twilioMessageSid: MessageSid },
      include: {
        message: {
          include: { church: true },
        },
      },
    });

    if (!recipient) {
      // Message SID not found, just acknowledge webhook
      return res.status(200).json({ received: true });
    }

    // SECURITY: Validate Twilio signature using church's auth token
    const church = recipient.message.church;
    if (!church.twilioAuthToken || !validateTwilioSignature(req, church.twilioAuthToken)) {
      console.warn('⚠️ Twilio webhook signature validation failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Map Twilio status to our status
    let status: 'delivered' | 'failed';
    if (MessageStatus === 'delivered') {
      status = 'delivered';
    } else if (
      MessageStatus === 'failed' ||
      MessageStatus === 'undelivered' ||
      MessageStatus === 'bounced'
    ) {
      status = 'failed';
    } else {
      // pending, sent, etc. - don't update yet
      return res.status(200).json({ received: true });
    }

    // Update recipient status
    await messageService.updateRecipientStatus(recipient.id, status, {
      failureReason: req.body.ErrorMessage,
    });

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Twilio webhook');
    res.status(500).json({ error: 'Failed to process webhook' });
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
    // For now, we'll use twilioMessageSid field since we're storing all message IDs there
    const recipient = await prisma.messageRecipient.findFirst({
      where: { twilioMessageSid: messageId },
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
