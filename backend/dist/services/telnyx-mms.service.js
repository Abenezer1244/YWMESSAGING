import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import * as s3MediaService from './s3-media.service.js';
const prisma = new PrismaClient();
const TELNYX_BASE_URL = 'https://api.telnyx.com/v2';
function getTelnyxClient() {
    const apiKey = process.env.TELNYX_API_KEY;
    if (!apiKey) {
        throw new Error('TELNYX_API_KEY not configured');
    }
    return axios.create({
        baseURL: TELNYX_BASE_URL,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });
}
/**
 * Hash phone number for secure lookup
 * Used to match incoming SMS/MMS to members without storing plain text
 */
function hashPhone(phone) {
    const hashKey = process.env.PHONE_HASH_KEY || 'default_key';
    return crypto.createHmac('sha256', hashKey).update(phone).digest('hex');
}
/**
 * Normalize phone number to E.164 format
 */
function normalizePhone(phone) {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // If starts with 1 and is 11 digits (US), keep as is
    // Otherwise assume it's 10 digits and prepend +1
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
    }
    else if (digits.length === 10) {
        return `+1${digits}`;
    }
    else {
        return `+${digits}`;
    }
}
/**
 * Find member by phone number
 * Returns existing member or creates new one for unknown number
 */
export async function findOrCreateMemberByPhone(churchId, phone) {
    const normalizedPhone = normalizePhone(phone);
    const phoneHash = hashPhone(normalizedPhone);
    try {
        // Try to find existing member with this phone in this church
        const existingMember = await prisma.member.findFirst({
            where: {
                groups: {
                    some: {
                        group: { churchId },
                    },
                },
                phoneHash,
            },
        });
        if (existingMember) {
            console.log(`✅ Found existing member: ${existingMember.firstName} ${existingMember.lastName}`);
            return existingMember;
        }
        // Create new member for unknown caller
        console.log(`📱 Creating new member for phone: ${normalizedPhone}`);
        const newMember = await prisma.member.create({
            data: {
                firstName: '',
                lastName: 'Congregation Member',
                phone: normalizedPhone,
                phoneHash,
                optInSms: true,
            },
        });
        console.log(`✅ Created new member: ${newMember.id}`);
        return newMember;
    }
    catch (error) {
        console.error('Error finding/creating member:', error);
        throw new Error(`Failed to find or create member: ${error.message}`);
    }
}
/**
 * Send MMS (SMS with media attachment) via Telnyx
 * Used for leader replies with media
 */
export async function sendMMS(to, message, churchId, mediaS3Url) {
    try {
        // Get church Telnyx number
        const church = await prisma.church.findUnique({
            where: { id: churchId },
            select: { telnyxPhoneNumber: true },
        });
        if (!church?.telnyxPhoneNumber) {
            throw new Error('Telnyx phone number not configured for this church');
        }
        // Build payload
        const payload = {
            from: church.telnyxPhoneNumber,
            to,
            text: message,
            type: mediaS3Url ? 'MMS' : 'SMS',
            webhook_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
            webhook_failover_url: `${process.env.BACKEND_URL || 'https://api.koinoniasms.com'}/api/webhooks/telnyx/status`,
        };
        // Add media URL if provided
        if (mediaS3Url) {
            payload.media_urls = [mediaS3Url];
            console.log(`📎 Attaching media: ${mediaS3Url}`);
        }
        // Send via Telnyx
        const client = getTelnyxClient();
        const response = await client.post('/messages', payload);
        const messageId = response.data?.data?.id;
        if (!messageId) {
            throw new Error('No message ID returned from Telnyx');
        }
        console.log(`✅ ${mediaS3Url ? 'MMS' : 'SMS'} sent: ${messageId} to ${to}`);
        return {
            messageSid: messageId,
            success: true,
        };
    }
    catch (error) {
        const errorMessage = error.response?.data?.errors?.[0]?.detail ||
            error.message ||
            'Failed to send MMS';
        console.error(`❌ MMS send error: ${errorMessage}`);
        throw new Error(`Telnyx error: ${errorMessage}`);
    }
}
/**
 * Handle inbound MMS webhook
 * Called when member sends photo/video/audio/document to church number
 */
export async function handleInboundMMS(churchId, senderPhone, messageText, mediaUrls, telnyxMessageId) {
    try {
        console.log(`📱 Inbound MMS: ${senderPhone} → Church (${mediaUrls.length} media files)`);
        // 1. Find or create member by phone
        const member = await findOrCreateMemberByPhone(churchId, senderPhone);
        // 2. Find or create conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                churchId,
                memberId: member.id,
            },
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    churchId,
                    memberId: member.id,
                    lastMessageAt: new Date(),
                },
            });
            console.log(`💬 Created new conversation: ${conversation.id}`);
        }
        else {
            console.log(`💬 Using existing conversation: ${conversation.id}`);
        }
        // 3. Create message for text content (if any)
        const messageIds = [];
        if (messageText) {
            const textMessage = await prisma.conversationMessage.create({
                data: {
                    conversationId: conversation.id,
                    memberId: member.id,
                    content: messageText,
                    direction: 'inbound',
                    providerMessageId: telnyxMessageId, // Store Telnyx ID for idempotency
                },
            });
            messageIds.push(textMessage.id);
            console.log(`📝 Created text message: ${textMessage.id}`);
        }
        // 4. Process each media attachment
        for (const mediaUrl of mediaUrls) {
            try {
                console.log(`⬇️ Processing media: ${mediaUrl}`);
                // Extract filename from URL
                const fileName = mediaUrl.split('/').pop() || `media_${Date.now()}`;
                // Download from Telnyx and upload to S3
                const uploadResult = await s3MediaService.downloadAndUploadMedia(mediaUrl, conversation.id, fileName);
                // Create message record for media
                const mediaMessage = await prisma.conversationMessage.create({
                    data: {
                        conversationId: conversation.id,
                        memberId: member.id,
                        content: messageText || `[${uploadResult.metadata.type}]`,
                        direction: 'inbound',
                        providerMessageId: telnyxMessageId, // Store Telnyx ID for idempotency
                        mediaUrl: uploadResult.s3Url,
                        mediaType: uploadResult.metadata.type,
                        mediaName: fileName,
                        mediaSizeBytes: uploadResult.metadata.sizeBytes,
                        mediaS3Key: uploadResult.s3Key,
                        mediaMimeType: uploadResult.metadata.mimeType,
                        mediaWidth: uploadResult.metadata.width,
                        mediaHeight: uploadResult.metadata.height,
                        mediaDuration: uploadResult.metadata.duration,
                    },
                });
                messageIds.push(mediaMessage.id);
                console.log(`🖼️ Created media message: ${mediaMessage.id}`);
            }
            catch (error) {
                console.error(`❌ Failed to process media: ${error.message}`);
                // Continue with next media instead of failing entire webhook
            }
        }
        // 5. Update conversation last message time
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
        });
        console.log(`✅ Inbound MMS processed: ${conversation.id} (${messageIds.length} messages)`);
        return {
            conversationId: conversation.id,
            messageIds,
        };
    }
    catch (error) {
        console.error('❌ Inbound MMS handling error:', error);
        throw error;
    }
}
/**
 * Get member by phone (for outbound messaging)
 */
export async function getMemberByPhone(churchId, phone) {
    const normalizedPhone = normalizePhone(phone);
    const phoneHash = hashPhone(normalizedPhone);
    try {
        const member = await prisma.member.findFirst({
            where: {
                groups: {
                    some: {
                        group: { churchId },
                    },
                },
                phoneHash,
            },
        });
        return member || null;
    }
    catch (error) {
        console.error('Error getting member:', error);
        return null;
    }
}
/**
 * Validate MMS credentials
 */
export async function validateMMSSetup() {
    const telnyxConfigured = !!process.env.TELNYX_API_KEY;
    const s3Configured = !!process.env.AWS_S3_BUCKET &&
        !!process.env.AWS_ACCESS_KEY_ID &&
        !!process.env.AWS_SECRET_ACCESS_KEY;
    let s3Accessible = false;
    if (s3Configured) {
        s3Accessible = await s3MediaService.checkS3Connection();
    }
    return {
        telnyxConfigured,
        s3Configured: s3Configured && s3Accessible,
        ready: telnyxConfigured && s3Configured && s3Accessible,
    };
}
//# sourceMappingURL=telnyx-mms.service.js.map