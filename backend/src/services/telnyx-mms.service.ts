import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import * as s3MediaService from './s3-media.service.js';
import { formatToE164 } from '../utils/phone.utils.js';
import { hashForSearch, decrypt, encrypt, decryptPhoneSafe } from '../utils/encryption.utils.js';

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
 * Find member by phone number
 * Returns existing member or creates new one for unknown number
 */
export async function findOrCreateMemberByPhone(
  churchId: string,
  phone: string
): Promise<any> {
  let formattedPhone: string;
  try {
    // Use same formatting as member service for consistency
    formattedPhone = formatToE164(phone);
  } catch (error) {
    // Fallback if formatToE164 fails - use simple normalization
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      formattedPhone = `+${digits}`;
    } else if (digits.length === 10) {
      formattedPhone = `+1${digits}`;
    } else {
      formattedPhone = `+${digits}`;
    }
  }
  const phoneHash = hashForSearch(formattedPhone);

  try {
    // Try to find existing member with this phone (check if conversation exists for this church)
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        churchId,
        member: {
          phoneHash,
        },
      },
      include: {
        member: true,
      },
    });

    if (existingConversation) {
      console.log(`✅ Found existing member: ${existingConversation.member.firstName} ${existingConversation.member.lastName}`);
      return existingConversation.member;
    }

    // Create new member for unknown caller
    console.log(`📱 Creating new member for phone: ${formattedPhone}`);

    const newMember = await prisma.member.create({
      data: {
        firstName: '',
        lastName: 'Congregation Member',
        phone: encrypt(formattedPhone),
        phoneHash,
        optInSms: true,
      },
    });

    console.log(`✅ Created new member: ${newMember.id}`);
    return newMember;
  } catch (error: any) {
    console.error('Error finding/creating member:', error);
    throw new Error(`Failed to find or create member: ${error.message}`);
  }
}

/**
 * Send MMS (SMS with media attachment) via Telnyx
 * Used for leader replies with media
 */
export async function sendMMS(
  to: string,
  message: string,
  churchId: string,
  mediaS3Url?: string
): Promise<{ messageSid: string; success: boolean }> {
  try {
    // Get church Telnyx number and 10DLC brand info
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: {
        telnyxPhoneNumber: true,
        usingSharedBrand: true,
        dlcBrandId: true,
        deliveryRate: true,
      },
    });

    if (!church?.telnyxPhoneNumber) {
      throw new Error('Telnyx phone number not configured for this church');
    }

    // Build payload
    const payload: any = {
      from: church.telnyxPhoneNumber,
      to,
      text: message,
      type: mediaS3Url ? 'MMS' : 'SMS',
      dlr_type: 'dlr',  // Request delivery receipt notifications
      webhook_url: `${
        process.env.BACKEND_URL || 'https://api.koinoniasms.com'
      }/api/webhooks/telnyx/status`,
      webhook_failover_url: `${
        process.env.BACKEND_URL || 'https://api.koinoniasms.com'
      }/api/webhooks/telnyx/status`,
    };

    // Add brand ID based on delivery tier
    if (church.usingSharedBrand) {
      // Using platform's shared brand (65% delivery)
      const platformBrandId = process.env.TELNYX_PLATFORM_BRAND_ID;
      if (platformBrandId) {
        payload.brand_id = platformBrandId;
      }
    } else if (!church.usingSharedBrand && church.dlcBrandId) {
      // Using church's personal 10DLC brand (99% delivery)
      payload.brand_id = church.dlcBrandId;
    }

    // Add media URL if provided
    if (mediaS3Url) {
      payload.media_urls = [mediaS3Url];
      console.log(`📎 Attaching media: ${mediaS3Url}`);
    }

    // Log outbound attempt with delivery rate
    const brandType = church.usingSharedBrand ? 'shared' : 'personal';
    const deliveryPercent = Math.round((church.deliveryRate || 0.65) * 100);
    console.log(`📤 Sending ${mediaS3Url ? 'MMS' : 'SMS'}: from ${church.telnyxPhoneNumber} to ${to}`);
    console.log(`   Brand: ${brandType} (${deliveryPercent}% delivery rate)`);
    console.log(`   Message: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`);

    // Send via Telnyx
    const client = getTelnyxClient();
    const response = await client.post('/messages', payload);

    const messageId = response.data?.data?.id;
    const messageStatus = response.data?.data?.status;

    if (!messageId) {
      console.error('❌ No message ID returned from Telnyx');
      console.error('   Telnyx Response:', JSON.stringify(response.data, null, 2));
      throw new Error('No message ID returned from Telnyx');
    }

    console.log(`✅ ${mediaS3Url ? 'MMS' : 'SMS'} accepted by Telnyx: ${messageId}`);
    console.log(`   Status: ${messageStatus}, Recipient: ${to}`);

    return {
      messageSid: messageId,
      success: true,
    };
  } catch (error: any) {
    console.error(`❌ Failed to send ${mediaS3Url ? 'MMS' : 'SMS'} to ${to}`);

    // Log detailed error information from Telnyx
    if (error.response?.data) {
      console.error('   Telnyx Response:', JSON.stringify(error.response.data, null, 2));
      const errors = error.response.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        errors.forEach((err: any, idx: number) => {
          console.error(`   Error ${idx + 1}: [${err.code}] ${err.title} - ${err.detail}`);
        });
      }
    } else if (error.message) {
      console.error('   Error:', error.message);
    }

    const errorMessage =
      error.response?.data?.errors?.[0]?.detail ||
      error.message ||
      'Failed to send MMS';
    throw new Error(`Telnyx error: ${errorMessage}`);
  }
}

/**
 * Handle inbound MMS webhook
 * Called when member sends photo/video/audio/document to church number
 */
export async function handleInboundMMS(
  churchId: string,
  senderPhone: string,
  messageText: string,
  mediaUrls: string[],
  telnyxMessageId?: string
): Promise<{
  conversationId: string;
  messageIds: string[];
}> {
  try {
    console.log(
      `📱 Inbound MMS: ${senderPhone} → Church (${mediaUrls.length} media files)`
    );

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
    } else {
      console.log(`💬 Using existing conversation: ${conversation.id}`);
    }

    // 3. Create message for text content (if any)
    const messageIds: string[] = [];

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
        const uploadResult = await s3MediaService.downloadAndUploadMedia(
          mediaUrl,
          conversation.id,
          fileName
        );

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
      } catch (error: any) {
        console.error(`❌ Failed to process media: ${error.message}`);
        // Continue with next media instead of failing entire webhook
      }
    }

    // 5. Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // 6. Broadcast message to all other congregation members
    if (messageText || mediaUrls.length > 0) {
      const mediaType = mediaUrls.length > 0 ? 'media' : undefined;
      await broadcastInboundToMembers(
        churchId,
        member.id,
        messageText,
        mediaType
      );
    }

    console.log(
      `✅ Inbound MMS processed: ${conversation.id} (${messageIds.length} messages)`
    );

    return {
      conversationId: conversation.id,
      messageIds,
    };
  } catch (error: any) {
    console.error('❌ Inbound MMS handling error:', error);
    throw error;
  }
}

/**
 * Broadcast inbound message to all congregation members
 * When a member texts the church number, send SMS to all other members
 * Sends synchronously without Redis queue
 */
export async function broadcastInboundToMembers(
  churchId: string,
  senderMemberId: string,
  messageText: string,
  mediaType?: string
): Promise<void> {
  try {
    // Get all members through conversations (members don't have churchId anymore)
    const conversations = await prisma.conversation.findMany({
      where: {
        churchId,
      },
      select: {
        member: {
          select: {
            id: true,
            firstName: true,
            phone: true,
            optInSms: true,
          },
        },
      },
    });

    const members = conversations
      .map(conv => conv.member)
      .filter(member => member.optInSms);

    // Get sender info (phone + name)
    const sender = await prisma.member.findUnique({
      where: { id: senderMemberId },
      select: { firstName: true, phone: true },
    });

    if (!sender) {
      console.error(`Sender member not found: ${senderMemberId}`);
      return;
    }

    // Filter out the sender by comparing phone numbers
    // This handles cases where the same phone number exists under multiple member IDs
    const senderPhone = decryptPhoneSafe(sender.phone);
    const recipientMembers = members.filter(m => {
      const memberPhone = decryptPhoneSafe(m.phone);
      return memberPhone !== senderPhone;
    });

    if (recipientMembers.length === 0) {
      console.log('ℹ️ No other members to notify');
      return;
    }

    const senderName = sender?.firstName || 'Member';

    // Format message
    const displayMessage = mediaType
      ? `${senderName}: [${mediaType.toUpperCase()}]`
      : `${senderName}: ${messageText}`;

    console.log(`📢 Broadcasting to ${recipientMembers.length} members: ${displayMessage}`);

    // Send SMS synchronously to each recipient
    for (const member of recipientMembers) {
      try {
        // Decrypt phone number (stored encrypted in database, or plain text for legacy records)
        const decryptedPhone = decryptPhoneSafe(member.phone);
        const result = await sendMMS(decryptedPhone, displayMessage, churchId);

        // Save outbound message to conversation history
        // First, find or create conversation between church and this member
        const conversation = await prisma.conversation.upsert({
          where: {
            churchId_memberId: {
              churchId,
              memberId: member.id,
            }
          },
          update: {
            lastMessageAt: new Date(),
          },
          create: {
            churchId,
            memberId: member.id,
          }
        });

        // Save the outbound message
        await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            memberId: member.id,
            content: displayMessage,
            direction: 'outbound',
            providerMessageId: result.messageSid,
            deliveryStatus: 'pending',
          }
        });

        console.log(`   ✓ Sent to ${member.firstName}`);
      } catch (error: any) {
        console.error(`   ✗ Failed to send to ${member.firstName}: ${error.message}`);
      }
    }

    console.log(`✅ Broadcast sent to ${recipientMembers.length} members`);
  } catch (error: any) {
    console.error('❌ Error broadcasting inbound message:', error);
    // Don't throw - continue processing even if broadcast fails
  }
}

/**
 * Get member by phone (for outbound messaging)
 */
export async function getMemberByPhone(
  churchId: string,
  phone: string
): Promise<any | null> {
  let formattedPhone: string;
  try {
    // Use same formatting as member service for consistency
    formattedPhone = formatToE164(phone);
  } catch (error) {
    // Fallback if formatToE164 fails - use simple normalization
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      formattedPhone = `+${digits}`;
    } else if (digits.length === 10) {
      formattedPhone = `+1${digits}`;
    } else {
      formattedPhone = `+${digits}`;
    }
  }
  const phoneHash = hashForSearch(formattedPhone);

  try {
    // Find member through conversation (members don't have churchId anymore)
    const conversation = await prisma.conversation.findFirst({
      where: {
        churchId,
        member: {
          phoneHash,
        },
      },
      include: {
        member: true,
      },
    });

    return conversation?.member || null;
  } catch (error: any) {
    console.error('Error getting member:', error);
    return null;
  }
}

/**
 * Validate MMS credentials
 */
export async function validateMMSSetup(): Promise<{
  telnyxConfigured: boolean;
  s3Configured: boolean;
  ready: boolean;
}> {
  const telnyxConfigured = !!process.env.TELNYX_API_KEY;
  const s3Configured =
    !!process.env.AWS_S3_BUCKET &&
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
