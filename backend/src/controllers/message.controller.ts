import { Request, Response } from 'express';
import * as messageService from '../services/message.service.js';
import * as twilioService from '../services/twilio.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/churches/:churchId/twilio/connect
 * Connect Twilio credentials
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
 */
export async function getMessageDetails(req: Request, res: Response) {
  try {
    const { messageId } = req.params;

    const message = await messageService.getMessageDetails(messageId);

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
 */
export async function handleTwilioWebhook(req: Request, res: Response) {
  try {
    const { MessageSid, MessageStatus } = req.body;

    if (!MessageSid) {
      return res.status(400).json({ error: 'MessageSid required' });
    }

    // Find recipient by Twilio message SID
    const recipient = await prisma.messageRecipient.findFirst({
      where: { twilioMessageSid: MessageSid },
    });

    if (!recipient) {
      // Message SID not found, just acknowledge webhook
      return res.status(200).json({ received: true });
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
    console.error('Error processing Twilio webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
