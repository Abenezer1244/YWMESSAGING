import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as conversationService from '../services/conversation.service.js';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
import * as s3MediaService from '../services/s3-media.service.js';
import { hashForSearch } from '../utils/encryption.utils.js';
import { sendSMS } from '../services/telnyx.service.js';

const prisma = new PrismaClient();

/**
 * GET /api/conversations
 * Get all conversations for church
 */
export async function getConversations(req: Request, res: Response) {
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

    const result = await conversationService.getConversations(churchId, {
      page,
      limit,
      status,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/conversations/:conversationId
 * Get single conversation with all messages
 */
export async function getConversation(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const churchId = req.user?.churchId;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const conversation = await conversationService.getConversation(
      conversationId,
      churchId,
      { page, limit }
    );

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error('Error getting conversation:', error);
    const statusCode = error.message === 'Access denied' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/conversations/:conversationId/reply
 * Send text-only reply
 */
export async function replyToConversation(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const churchId = req.user?.churchId;

    if (!churchId || !conversationId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const message = await conversationService.createReply(
      conversationId,
      churchId,
      content
    );

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error('Error replying:', error);
    const statusCode = error.message === 'Access denied' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/conversations/:conversationId/reply-with-media
 * Send reply with media attachment (full quality, no compression)
 */
export async function replyWithMedia(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const churchId = req.user?.churchId;

    if (!churchId || !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Validate file
    const validation = await s3MediaService.validateMediaFile(
      req.file.path,
      req.file.mimetype
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Upload to S3 (full quality, no compression)
    console.log(
      `📤 Uploading file: ${req.file.originalname} (${req.file.mimetype})`
    );
    const uploadResult = await s3MediaService.uploadMediaFromFile(
      req.file.path,
      conversationId,
      req.file.originalname,
      req.file.mimetype
    );

    // Create reply with media
    const message = await conversationService.createReplyWithMedia(
      conversationId,
      churchId,
      content,
      {
        s3Url: uploadResult.s3Url,
        s3Key: uploadResult.s3Key,
        type: uploadResult.metadata.type,
        name: req.file.originalname,
        sizeBytes: uploadResult.metadata.sizeBytes,
        mimeType: uploadResult.metadata.mimeType,
        width: uploadResult.metadata.width,
        height: uploadResult.metadata.height,
        duration: uploadResult.metadata.duration,
      }
    );

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error('Error replying with media:', error);
    const statusCode = error.message === 'Access denied' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PATCH /api/conversations/:conversationId/read
 * Mark conversation as read
 */
export async function markAsRead(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await conversationService.markAsRead(conversationId, churchId);

    res.json({
      success: true,
      message: 'Conversation marked as read',
    });
  } catch (error: any) {
    console.error('Error marking as read:', error);
    const statusCode = error.message === 'Access denied' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PATCH /api/conversations/:conversationId/status
 * Update conversation status
 */
export async function updateStatus(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!['open', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    await conversationService.updateStatus(conversationId, churchId, status);

    res.json({
      success: true,
      message: `Conversation status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Error updating status:', error);
    const statusCode = error.message === 'Access denied' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/webhooks/telnyx/mms
 * Receive inbound MMS from congregation member
 * Telnyx sends webhook when member texts the church number with media
 */
export async function handleTelnyxInboundMMS(req: Request, res: Response) {
  try {
    console.log('🔔 WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));

    const { data } = req.body;
    const eventType = data?.event_type;

    // Only process message received events
    if (eventType !== 'message.received') {
      console.log(`⏭️ Skipping webhook type: ${eventType}`);
      return res.status(200).json({ received: true });
    }

    const payload = data?.payload;
    if (!payload) {
      console.warn('⚠️ Invalid payload in webhook');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { id: telnyxMessageId, from, to, text, media } = payload;

    // Extract phone numbers from Telnyx webhook format
    const senderPhone = from?.phone_number;
    const recipientPhone = to?.[0]?.phone_number;

    if (!senderPhone || !recipientPhone) {
      console.warn('⚠️ Missing phone numbers in webhook payload');
      return res.status(400).json({ error: 'Missing phone numbers' });
    }

    // IDEMPOTENCY: Check if we already processed this message
    if (telnyxMessageId) {
      const existingMessage = await prisma.conversationMessage.findFirst({
        where: { providerMessageId: telnyxMessageId }
      });

      if (existingMessage) {
        console.log(`⏭️ Webhook already processed for message ID: ${telnyxMessageId}`);
        return res.json({ received: true });
      }
    }

    console.log(
      `📨 Telnyx MMS webhook: from=${senderPhone}, to=${recipientPhone}, media=${media?.length || 0}`
    );

    // Find church by Telnyx number (to field)
    console.log(`🔍 Looking for church with telnyxPhoneNumber: ${recipientPhone}`);

    const church = await prisma.church.findFirst({
      where: { telnyxPhoneNumber: recipientPhone },
      select: { id: true, name: true, telnyxPhoneNumber: true }
    });

    console.log(`Found churches in database:`,
      await prisma.church.findMany({
        where: { telnyxPhoneNumber: { not: null } },
        select: { id: true, name: true, telnyxPhoneNumber: true }
      })
    );

    if (!church) {
      console.log(`❌ No church found for Telnyx number: ${recipientPhone}`);
      return res.status(200).json({ received: true });
    }

    // SECURITY: Verify sender is a registered member of the church
    console.log(`🔐 Verifying member: ${senderPhone} for church ${church.id}`);

    const phoneHash = hashForSearch(senderPhone);
    const isMember = await prisma.member.findFirst({
      where: {
        phoneHash,
        groups: {
          some: {
            group: {
              churchId: church.id
            }
          }
        }
      }
    });

    if (!isMember) {
      console.log(`🚫 Non-member attempted to message: ${senderPhone} to ${recipientPhone}`);

      // Send auto-reply to non-member
      try {
        const replyMessage = `Hello! To communicate with ${church.name}, please ask the church leader to add you to the system.`;

        await sendSMS(
          senderPhone,           // to (sender's number)
          replyMessage,          // message
          church.id              // churchId
        );

        console.log(`✅ Auto-reply sent to non-member: ${senderPhone}`);
      } catch (error: any) {
        console.error(`⚠️ Failed to send auto-reply to ${senderPhone}:`, error.message);
      }

      return res.status(200).json({ received: true });
    }

    console.log(`✅ Member verified: ${isMember.id} (${isMember.firstName} ${isMember.lastName})`);

    // Extract media URLs
    const mediaUrls = media?.map((m: any) => m.url) || [];

    console.log(
      `✅ Processing MMS for church: ${church.name} (${church.id})`
    );

    // Process inbound MMS
    const result = await telnyxMMSService.handleInboundMMS(
      church.id,
      senderPhone,
      text || '',
      mediaUrls,
      telnyxMessageId
    );

    console.log(
      `✅ MMS processed: conversation=${result.conversationId}, messages=${result.messageIds.length}`
    );

    return res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Inbound MMS webhook error:', error);
    // Still return 200 to acknowledge receipt to Telnyx
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/webhooks/telnyx/status
 * Receive delivery status updates from Telnyx (for SMS/MMS sent)
 * Updates message delivery status
 */
export async function handleTelnyxWebhook(req: Request, res: Response) {
  try {
    const { type, data } = req.body;

    // Only process delivery receipt events
    if (type !== 'message.dlr') {
      return res.status(200).json({ received: true });
    }

    const payload = data?.payload?.[0];
    if (!payload || !payload.id) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const messageId = payload.id;
    const telnyxStatus = payload.status;

    console.log(`📨 Telnyx DLR: message=${messageId}, status=${telnyxStatus}`);

    // Find message by Telnyx ID
    const message = await prisma.conversationMessage.findFirst({
      where: { providerMessageId: messageId },
    });

    if (!message) {
      console.log(
        `⏭️ Message not found for Telnyx ID: ${messageId} (may not be from conversation)`
      );
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
      // Update message delivery status
      await prisma.conversationMessage.update({
        where: { id: message.id },
        data: {
          deliveryStatus: status,
        },
      });

      console.log(
        `✅ Updated message delivery status: ${message.id} → ${status}`
      );
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Telnyx webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
