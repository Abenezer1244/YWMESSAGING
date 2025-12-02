import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as conversationService from '../services/conversation.service.js';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
import * as s3MediaService from '../services/s3-media.service.js';
import * as websocketService from '../services/websocket.service.js';
import { hashForSearch } from '../utils/encryption.utils.js';
import { sendSMS } from '../services/telnyx.service.js';
import { formatToE164 } from '../utils/phone.utils.js';
import { safeValidate } from '../lib/validation/schemas.js';
import {
  ReplyToConversationSchema,
  UpdateConversationStatusSchema,
  ReplyWithMediaSchema,
  ConversationParamSchema,
} from '../lib/validation/schemas.js';

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
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // ✅ SECURITY: Validate conversation ID parameter
    const paramValidation = safeValidate(ConversationParamSchema, { conversationId });
    if (!paramValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: paramValidation.errors,
      });
    }

    // ✅ SECURITY: Validate request body with Zod schema
    const bodyValidation = safeValidate(ReplyToConversationSchema, req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: bodyValidation.errors,
      });
    }

    const { content } = bodyValidation.data as any;

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
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // ✅ SECURITY: Validate conversation ID parameter
    const paramValidation = safeValidate(ConversationParamSchema, { conversationId });
    if (!paramValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: paramValidation.errors,
      });
    }

    // ✅ SECURITY: Validate request body with Zod schema (content is optional for media)
    const bodyValidation = safeValidate(ReplyWithMediaSchema, req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: bodyValidation.errors,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const { content } = bodyValidation.data as any;

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
    const churchId = req.user?.churchId;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // ✅ SECURITY: Validate conversation ID parameter
    const paramValidation = safeValidate(ConversationParamSchema, { conversationId });
    if (!paramValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: paramValidation.errors,
      });
    }

    // ✅ SECURITY: Validate request body with Zod schema
    const bodyValidation = safeValidate(UpdateConversationStatusSchema, req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: bodyValidation.errors,
      });
    }

    const { status } = bodyValidation.data as any;

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
/**
 * ✅ SECURITY: Verify Telnyx webhook signature using ED25519
 * Reuses the same verification logic as the 10DLC endpoints
 */
function verifyTelnyxInboundWebhookSignature(
  payload: string,
  signatureHeader: string,
  timestampHeader: string,
  publicKeyBase64: string
): boolean {
  if (!signatureHeader || !timestampHeader) {
    console.warn('⚠️ Webhook missing signature or timestamp header');
    return false;
  }

  if (!publicKeyBase64 || typeof publicKeyBase64 !== 'string' || publicKeyBase64.trim().length === 0) {
    console.error('❌ CRITICAL: Webhook verification failed - public key not configured or empty');
    return false;
  }

  try {
    const trimmedKey = publicKeyBase64.trim();
    const publicKeyBuffer = Buffer.from(trimmedKey, 'base64');

    if (publicKeyBuffer.length === 0) {
      console.error('❌ CRITICAL: Decoded public key is empty - base64 decoding produced no bytes');
      return false;
    }

    const signedMessage = `${timestampHeader}|${payload}`;
    const signatureBuffer = Buffer.from(signatureHeader, 'base64');

    console.log(`📋 Webhook Signature Debug:
   Timestamp: ${timestampHeader}
   Payload length: ${payload.length}
   Signed message length: ${signedMessage.length}`);

    const derKey = Buffer.concat([
      Buffer.from('302a', 'hex'),
      Buffer.from('3005', 'hex'),
      Buffer.from('06032b6570', 'hex'),
      Buffer.from('0321', 'hex'),
      Buffer.from('00', 'hex'),
      publicKeyBuffer,
    ]);

    const publicKey = crypto.createPublicKey({
      key: derKey,
      format: 'der',
      type: 'spki',
    });

    const isValid = crypto.verify(
      null,
      Buffer.from(signedMessage, 'utf-8'),
      publicKey,
      signatureBuffer
    );

    if (!isValid) {
      console.error('❌ ED25519 Signature verification failed');
      return false;
    }

    const webhookTimestamp = parseInt(timestampHeader, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDifferenceSeconds = Math.abs(currentTimestamp - webhookTimestamp);
    const MAX_AGE_SECONDS = 5 * 60;

    if (timeDifferenceSeconds > MAX_AGE_SECONDS) {
      console.warn(
        `⚠️ Webhook timestamp is ${timeDifferenceSeconds}s old (max: ${MAX_AGE_SECONDS}s) - possible replay attack`
      );
      return false;
    }

    console.log('✅ ED25519 signature verified successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Webhook signature verification error:', error.message);
    return false;
  }
}

export async function handleTelnyxInboundMMS(req: Request, res: Response) {
  try {
    // ✅ CRITICAL SECURITY: Verify webhook signature before processing
    const signature = req.headers['telnyx-signature-ed25519'] as string;
    const timestamp = req.headers['telnyx-timestamp'] as string;

    let rawBody: string;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf-8');
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else {
      console.error('❌ Webhook req.body is neither Buffer nor string:', typeof req.body);
      return res.status(400).json({ error: 'Invalid request format' });
    }

    if (!rawBody || !signature || !timestamp) {
      console.error('❌ Missing required webhook data:', {
        hasRawBody: !!rawBody,
        hasSignature: !!signature,
        hasTimestamp: !!timestamp,
      });
      return res.status(400).json({ error: 'Missing required webhook headers or body' });
    }

    const publicKey = process.env.TELNYX_WEBHOOK_PUBLIC_KEY;
    if (!publicKey) {
      console.error('❌ CRITICAL: TELNYX_WEBHOOK_PUBLIC_KEY environment variable not configured');
      return res.status(500).json({ error: 'Server configuration error - webhook verification disabled' });
    }

    const isValidSignature = verifyTelnyxInboundWebhookSignature(
      rawBody,
      signature,
      timestamp,
      publicKey
    );

    if (!isValidSignature) {
      console.error('❌ WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING INBOUND MMS');
      return res.status(401).json({ error: 'Invalid webhook signature - access denied' });
    }

    console.log('✅ Webhook signature verified (ED25519) - processing inbound MMS');

    let webhookData: any;
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Invalid JSON in webhook payload:', parseError);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    console.log('🔔 WEBHOOK RECEIVED:', JSON.stringify(webhookData, null, 2));

    const { data } = webhookData;
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

    // Format phone number to match how it's stored in the database
    let formattedPhone: string;
    try {
      formattedPhone = formatToE164(senderPhone);
    } catch (error) {
      // Fallback if formatToE164 fails - use simple normalization
      const digits = senderPhone.replace(/\D/g, '');
      if (digits.length === 11 && digits.startsWith('1')) {
        formattedPhone = `+${digits}`;
      } else if (digits.length === 10) {
        formattedPhone = `+1${digits}`;
      } else {
        formattedPhone = `+${digits}`;
      }
    }

    const phoneHash = hashForSearch(formattedPhone);
    // Check if member is part of this church (either in a group or has a conversation)
    const isMember = await prisma.member.findFirst({
      where: {
        phoneHash,
        OR: [
          // Members in groups for this church
          {
            groups: {
              some: {
                group: {
                  churchId: church.id
                }
              }
            }
          },
          // Members who have conversations with this church
          {
            conversations: {
              some: {
                churchId: church.id
              }
            }
          }
        ]
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
 * ✅ SECURITY: Verify Telnyx webhook signature using ED25519
 */
export async function handleTelnyxWebhook(req: Request, res: Response) {
  try {
    // ✅ CRITICAL SECURITY: Verify webhook signature before processing delivery receipts
    const signature = req.headers['telnyx-signature-ed25519'] as string;
    const timestamp = req.headers['telnyx-timestamp'] as string;

    let rawBody: string;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf-8');
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else {
      console.error('❌ Webhook req.body is neither Buffer nor string:', typeof req.body);
      return res.status(400).json({ error: 'Invalid request format' });
    }

    if (!rawBody || !signature || !timestamp) {
      console.error('❌ Missing required webhook data for delivery receipt:', {
        hasRawBody: !!rawBody,
        hasSignature: !!signature,
        hasTimestamp: !!timestamp,
      });
      return res.status(400).json({ error: 'Missing required webhook headers or body' });
    }

    const publicKey = process.env.TELNYX_WEBHOOK_PUBLIC_KEY;
    if (!publicKey) {
      console.error('❌ CRITICAL: TELNYX_WEBHOOK_PUBLIC_KEY environment variable not configured');
      return res.status(500).json({ error: 'Server configuration error - webhook verification disabled' });
    }

    const isValidSignature = verifyTelnyxInboundWebhookSignature(
      rawBody,
      signature,
      timestamp,
      publicKey
    );

    if (!isValidSignature) {
      console.error('❌ DELIVERY RECEIPT WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING');
      return res.status(401).json({ error: 'Invalid webhook signature - access denied' });
    }

    console.log('✅ Delivery receipt webhook signature verified (ED25519) - processing');

    let webhookData: any;
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Invalid JSON in delivery receipt payload:', parseError);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    const { type, data } = webhookData;

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

    // Find message by Telnyx ID (include conversation for churchId)
    const message = await prisma.conversationMessage.findFirst({
      where: { providerMessageId: messageId },
      include: {
        conversation: {
          select: { churchId: true },
        },
      },
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

      // 🔔 Emit real-time WebSocket event to notify connected clients
      if (status === 'delivered') {
        websocketService.broadcastMessageDelivered(
          message.conversation.churchId,
          message.id,
          message.conversationId
        );
      } else if (status === 'failed') {
        websocketService.broadcastMessageFailed(
          message.conversation.churchId,
          message.id,
          `Telnyx delivery failed with status: ${telnyxStatus}`,
          message.conversationId
        );
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Telnyx webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
