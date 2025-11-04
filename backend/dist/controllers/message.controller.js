import * as messageService from '../services/message.service.js';
import * as twilioService from '../services/twilio.service.js';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();
/**
 * SECURITY: Validate Twilio webhook request signature
 * Twilio includes X-Twilio-Signature header with HMAC-SHA1 of request URL + body
 */
function validateTwilioSignature(req, twilioAuthToken) {
    const signature = req.headers['x-twilio-signature'];
    if (!signature) {
        return false;
    }
    const url = `https://${req.get('host')}${req.originalUrl}`;
    const hmac = crypto.createHmac('sha1', twilioAuthToken);
    hmac.update(url + new URLSearchParams(req.body).toString());
    const computedSignature = hmac.digest('base64');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
}
/**
 * POST /api/churches/:churchId/twilio/connect
 * Koinonia Twilio credentials
 */
export async function connectTwilio(req, res) {
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
        const isValid = await twilioService.validateTwilioCredentials(accountSid, authToken, phoneNumber);
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /api/messages/send
 * Send message to recipients
 */
export async function sendMessage(req, res) {
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
        const churchId = req.user?.churchId;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const status = req.query.status;
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /api/webhooks/twilio/status
 * Webhook for Twilio delivery status updates
 * SECURITY: Validates Twilio signature using auth token from database
 */
export async function handleTwilioWebhook(req, res) {
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
        let status;
        if (MessageStatus === 'delivered') {
            status = 'delivered';
        }
        else if (MessageStatus === 'failed' ||
            MessageStatus === 'undelivered' ||
            MessageStatus === 'bounced') {
            status = 'failed';
        }
        else {
            // pending, sent, etc. - don't update yet
            return res.status(200).json({ received: true });
        }
        // Update recipient status
        await messageService.updateRecipientStatus(recipient.id, status, {
            failureReason: req.body.ErrorMessage,
        });
        res.json({ received: true });
    }
    catch (error) {
        console.error('Error processing Twilio webhook');
        res.status(500).json({ error: 'Failed to process webhook' });
    }
}
//# sourceMappingURL=message.controller.js.map