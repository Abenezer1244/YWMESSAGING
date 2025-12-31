import crypto from 'crypto';
import * as conversationService from '../services/conversation.service.js';
import * as telnyxMMSService from '../services/telnyx-mms.service.js';
import * as s3MediaService from '../services/s3-media.service.js';
import { hashForSearch } from '../utils/encryption.utils.js';
import { sendSMS } from '../services/telnyx.service.js';
import { formatToE164 } from '../utils/phone.utils.js';
import { safeValidate } from '../lib/validation/schemas.js';
import { getTenantPrisma, getRegistryPrisma } from '../lib/tenant-prisma.js';
import { ReplyToConversationSchema, UpdateConversationStatusSchema, ReplyWithMediaSchema, ConversationParamSchema, } from '../lib/validation/schemas.js';
/**
 * GET /api/conversations
 * Get all conversations for tenant
 */
export async function getConversations(req, res) {
    try {
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const status = req.query.status;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const result = await conversationService.getConversations(tenantId, tenantPrisma, {
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
export async function getConversation(req, res) {
    try {
        const { conversationId } = req.params;
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        const conversation = await conversationService.getConversation(tenantId, tenantPrisma, conversationId, { page, limit });
        res.json({
            success: true,
            data: conversation,
        });
    }
    catch (error) {
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
export async function replyToConversation(req, res) {
    try {
        const { conversationId } = req.params;
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
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
        const { content } = bodyValidation.data;
        const message = await conversationService.createReply(conversationId, tenantId, tenantPrisma, content);
        res.status(201).json({
            success: true,
            data: message,
        });
    }
    catch (error) {
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
export async function replyWithMedia(req, res) {
    try {
        const { conversationId } = req.params;
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
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
        const { content } = bodyValidation.data;
        // Validate file
        const validation = await s3MediaService.validateMediaFile(req.file.path, req.file.mimetype);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }
        // Upload to S3 (full quality, no compression)
        console.log(`📤 Uploading file: ${req.file.originalname} (${req.file.mimetype})`);
        const uploadResult = await s3MediaService.uploadMediaFromFile(req.file.path, conversationId, req.file.originalname, req.file.mimetype);
        // Create reply with media
        const message = await conversationService.createReplyWithMedia(conversationId, tenantId, tenantPrisma, content, {
            s3Url: uploadResult.s3Url,
            s3Key: uploadResult.s3Key,
            type: uploadResult.metadata.type,
            name: req.file.originalname,
            sizeBytes: uploadResult.metadata.sizeBytes,
            mimeType: uploadResult.metadata.mimeType,
            width: uploadResult.metadata.width,
            height: uploadResult.metadata.height,
            duration: uploadResult.metadata.duration,
        });
        res.status(201).json({
            success: true,
            data: message,
        });
    }
    catch (error) {
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
export async function markAsRead(req, res) {
    try {
        const { conversationId } = req.params;
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }
        await conversationService.markAsRead(conversationId, tenantId, tenantPrisma);
        res.json({
            success: true,
            message: 'Conversation marked as read',
        });
    }
    catch (error) {
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
export async function updateStatus(req, res) {
    try {
        const { conversationId } = req.params;
        const tenantId = req.tenantId;
        const tenantPrisma = req.prisma;
        if (!tenantId || !tenantPrisma) {
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
        const { status } = bodyValidation.data;
        await conversationService.updateStatus(conversationId, tenantId, tenantPrisma, status);
        res.json({
            success: true,
            message: `Conversation status updated to ${status}`,
        });
    }
    catch (error) {
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
function verifyTelnyxInboundWebhookSignature(payload, signatureHeader, timestampHeader, publicKeyBase64) {
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
        const isValid = crypto.verify(null, Buffer.from(signedMessage, 'utf-8'), publicKey, signatureBuffer);
        if (!isValid) {
            console.error('❌ ED25519 Signature verification failed');
            return false;
        }
        const webhookTimestamp = parseInt(timestampHeader, 10);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDifferenceSeconds = Math.abs(currentTimestamp - webhookTimestamp);
        const MAX_AGE_SECONDS = 5 * 60;
        if (timeDifferenceSeconds > MAX_AGE_SECONDS) {
            console.warn(`⚠️ Webhook timestamp is ${timeDifferenceSeconds}s old (max: ${MAX_AGE_SECONDS}s) - possible replay attack`);
            return false;
        }
        console.log('✅ ED25519 signature verified successfully');
        return true;
    }
    catch (error) {
        console.error('❌ Webhook signature verification error:', error.message);
        return false;
    }
}
export async function handleTelnyxInboundMMS(req, res) {
    try {
        // ✅ CRITICAL SECURITY: Verify webhook signature before processing
        const signature = req.headers['telnyx-signature-ed25519'];
        const timestamp = req.headers['telnyx-timestamp'];
        let rawBody;
        if (Buffer.isBuffer(req.body)) {
            rawBody = req.body.toString('utf-8');
        }
        else if (typeof req.body === 'string') {
            rawBody = req.body;
        }
        else {
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
        const isValidSignature = verifyTelnyxInboundWebhookSignature(rawBody, signature, timestamp, publicKey);
        if (!isValidSignature) {
            console.error('❌ WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING INBOUND MMS');
            return res.status(401).json({ error: 'Invalid webhook signature - access denied' });
        }
        console.log('✅ Webhook signature verified (ED25519) - processing inbound MMS');
        let webhookData;
        try {
            webhookData = JSON.parse(rawBody);
        }
        catch (parseError) {
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
        // Get registry database for tenant lookup
        const registryPrisma = getRegistryPrisma();
        // Find tenant by Telnyx number (to field)
        console.log(`🔍 Looking for tenant with telnyxPhoneNumber: ${recipientPhone}`);
        const tenant = await registryPrisma.church.findFirst({
            where: { telnyxPhoneNumber: recipientPhone },
            select: { id: true, name: true, telnyxPhoneNumber: true }
        });
        if (!tenant) {
            console.log(`❌ No tenant found for Telnyx number: ${recipientPhone}`);
            return res.status(200).json({ received: true });
        }
        const tenantId = tenant.id;
        const tenantPrisma = await getTenantPrisma(tenantId);
        // IDEMPOTENCY: Check if we already processed this message
        if (telnyxMessageId) {
            const existingMessage = await tenantPrisma.conversationMessage.findFirst({
                where: { providerMessageId: telnyxMessageId }
            });
            if (existingMessage) {
                console.log(`⏭️ Webhook already processed for message ID: ${telnyxMessageId}`);
                return res.json({ received: true });
            }
        }
        console.log(`📨 Telnyx MMS webhook: from=${senderPhone}, to=${recipientPhone}, media=${media?.length || 0}`);
        // SECURITY: Verify sender is a registered member of the tenant
        console.log(`🔐 Verifying member: ${senderPhone} for tenant ${tenantId}`);
        // Format phone number to match how it's stored in the database
        let formattedPhone;
        try {
            formattedPhone = formatToE164(senderPhone);
        }
        catch (error) {
            // Fallback if formatToE164 fails - use simple normalization
            const digits = senderPhone.replace(/\D/g, '');
            if (digits.length === 11 && digits.startsWith('1')) {
                formattedPhone = `+${digits}`;
            }
            else if (digits.length === 10) {
                formattedPhone = `+1${digits}`;
            }
            else {
                formattedPhone = `+${digits}`;
            }
        }
        const phoneHash = hashForSearch(formattedPhone);
        // ✅ SECURITY: Only allow messages from registered members
        // Check if sender exists in member list (tenant database isolation)
        const member = await tenantPrisma.member.findFirst({
            where: {
                phoneHash
            }
        });
        if (!member) {
            console.log(`🚫 Non-member blocked from messaging: ${senderPhone} to ${recipientPhone}`);
            // Send auto-reply explaining they need to be added as a member
            try {
                const replyMessage = `Hello! To communicate with ${tenant.name}, please contact the church and ask to be added as a member. Only registered members can send messages.`;
                await sendSMS(senderPhone, // to (sender's number)
                replyMessage, // message
                tenantId // tenantId
                );
                console.log(`✅ Auto-reply sent to non-member: ${senderPhone}`);
            }
            catch (error) {
                console.error(`⚠️ Failed to send auto-reply to ${senderPhone}:`, error.message);
            }
            return res.status(200).json({ received: true });
        }
        console.log(`✅ Member verified: ${member.id} (${member.firstName} ${member.lastName})`);
        // Extract media URLs
        const mediaUrls = media?.map((m) => m.url) || [];
        console.log(`✅ Processing MMS for tenant: ${tenant.name} (${tenantId})`);
        // Process inbound MMS
        const result = await telnyxMMSService.handleInboundMMS(tenantId, senderPhone, text || '', mediaUrls, telnyxMessageId);
        console.log(`✅ MMS processed: conversation=${result.conversationId}, messages=${result.messageIds.length}`);
        return res.json({ received: true });
    }
    catch (error) {
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
export async function handleTelnyxWebhook(req, res) {
    try {
        // ✅ CRITICAL SECURITY: Verify webhook signature before processing delivery receipts
        const signature = req.headers['telnyx-signature-ed25519'];
        const timestamp = req.headers['telnyx-timestamp'];
        let rawBody;
        if (Buffer.isBuffer(req.body)) {
            rawBody = req.body.toString('utf-8');
        }
        else if (typeof req.body === 'string') {
            rawBody = req.body;
        }
        else {
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
        const isValidSignature = verifyTelnyxInboundWebhookSignature(rawBody, signature, timestamp, publicKey);
        if (!isValidSignature) {
            console.error('❌ DELIVERY RECEIPT WEBHOOK SIGNATURE VERIFICATION FAILED - REJECTING');
            return res.status(401).json({ error: 'Invalid webhook signature - access denied' });
        }
        console.log('✅ Delivery receipt webhook signature verified (ED25519) - processing');
        let webhookData;
        try {
            webhookData = JSON.parse(rawBody);
        }
        catch (parseError) {
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
        // SECURITY: Map Telnyx status to our status
        let status = null;
        if (telnyxStatus === 'delivered') {
            status = 'delivered';
        }
        else if (telnyxStatus === 'failed' ||
            telnyxStatus === 'undelivered' ||
            telnyxStatus === 'bounced') {
            status = 'failed';
        }
        if (!status) {
            // Status not relevant for our system (pending, queued, etc.)
            console.log(`⏭️ Ignoring Telnyx status ${telnyxStatus} for message ${messageId}`);
            return res.json({ received: true });
        }
        // SECURITY: Search all active tenant databases for this message
        // This is necessary because DLR webhooks only contain the Telnyx message ID
        // and we need to find which tenant database has this message
        // For efficiency, we look up the registry first to get a list of all churches
        const registryPrisma = getRegistryPrisma();
        const churches = await registryPrisma.church.findMany({
            select: { id: true },
        });
        let updated = false;
        for (const church of churches) {
            try {
                const tenantPrisma = await getTenantPrisma(church.id);
                const conversationMessage = await tenantPrisma.conversationMessage.findFirst({
                    where: { providerMessageId: messageId },
                });
                if (conversationMessage) {
                    // Found it! Update the message status
                    await tenantPrisma.conversationMessage.update({
                        where: { id: conversationMessage.id },
                        data: { deliveryStatus: status },
                    });
                    console.log(`✅ Updated delivery status for message ${messageId} to ${status} in tenant ${church.id}`);
                    updated = true;
                    break;
                }
            }
            catch (error) {
                // Log but continue to next tenant
                console.warn(`⚠️ Error searching tenant ${church.id} for message ${messageId}: ${error.message}`);
            }
        }
        if (!updated) {
            console.log(`⏭️ Message ${messageId} not found in any tenant database`);
        }
        return res.json({ received: true });
    }
    catch (error) {
        console.error('❌ Telnyx webhook error:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
}
//# sourceMappingURL=conversation.controller.js.map