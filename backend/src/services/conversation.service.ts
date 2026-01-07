import type { TenantPrismaClient } from '../lib/tenant-prisma.js';
import { sendRCSWithFallback } from './telnyx-rcs.service.js';
import { decrypt, decryptPhoneSafe } from '../utils/encryption.utils.js';
import { getCached, setCached, invalidateCache } from './cache.service.js';

/**
 * Get all conversations for a tenant (sorted by newest)
 * ✅ OPTIMIZED: Cache conversations list for 5 minutes
 * Reduces database load for frequently accessed lists
 */
export async function getConversations(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  options: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const { status = 'open', page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  // ✅ CACHE: Check if conversations list is cached
  const cacheKey = `conversations:${tenantId}:${status}:${page}:${limit}`;
  const cached = await getCached<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [conversations, total] = await Promise.all([
      tenantPrisma.conversation.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              mediaType: true,
              direction: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      tenantPrisma.conversation.count({ where }),
    ]);

    const result = {
      data: conversations.map((conv) => ({
        id: conv.id,
        member: conv.member,
        status: conv.status,
        unreadCount: conv.unreadCount,
        lastMessage: conv.messages[0] || null,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // ✅ CACHE: Store conversations list for 5 minutes (300 seconds)
    await setCached(cacheKey, result, 300);

    return result;
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    throw new Error(`Failed to get conversations: ${error.message}`);
  }
}

/**
 * Get single conversation with all messages
 */
export async function getConversation(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  conversationId: string,
  options: {
    page?: number;
    limit?: number;
  } = {}
): Promise<any> {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  try {
    const conversation = await tenantPrisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            optInSms: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get messages (paginated) with reactions and reply info
    // Note: reactions and replyTo relations require Prisma client regeneration after migration
    const includeOptions: any = {
      member: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      // Include reactions (iMessage-style) - available after migration
      reactions: true,
      // Include replied-to message preview (iMessage-style) - available after migration
      replyTo: {
        select: {
          id: true,
          content: true,
          direction: true,
        },
      },
    };

    const [messages, total] = await Promise.all([
      tenantPrisma.conversationMessage.findMany({
        where: { conversationId },
        include: includeOptions,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }) as Promise<any[]>,
      tenantPrisma.conversationMessage.count({
        where: { conversationId },
      }),
    ]);

    return {
      id: conversation.id,
      member: conversation.member,
      status: conversation.status,
      unreadCount: conversation.unreadCount,
      createdAt: conversation.createdAt,
      messages: messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        direction: msg.direction,
        member: msg.member,
        deliveryStatus: msg.deliveryStatus,
        // Media fields
        mediaUrl: msg.mediaUrl,
        mediaType: msg.mediaType,
        mediaName: msg.mediaName,
        mediaSizeBytes: msg.mediaSizeBytes,
        mediaWidth: msg.mediaWidth,
        mediaHeight: msg.mediaHeight,
        mediaDuration: msg.mediaDuration,
        createdAt: msg.createdAt,
        // RCS fields (iMessage-style)
        channel: msg.channel,
        rcsReadAt: msg.rcsReadAt,
        // Reply threading (iMessage-style)
        replyToId: msg.replyToId,
        replyTo: msg.replyTo,
        // Reactions (iMessage-style)
        reactions: msg.reactions || [],
        // Send effect (iMessage-style)
        sendEffect: msg.sendEffect,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error('Error getting conversation:', error);
    throw new Error(`Failed to get conversation: ${error.message}`);
  }
}

/**
 * Broadcast outbound reply to all congregation members
 * ✅ OPTIMIZED: Parallel RCS/SMS sending instead of sequential
 * ✅ RCS: HD media, read receipts, typing indicators (iMessage-style)
 * Falls back to SMS automatically when RCS not available
 */
async function broadcastOutboundToMembers(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  content: string,
  mediaUrl?: string  // Optional media URL for HD images/videos via RCS
): Promise<void> {
  try {
    // Get all members through conversations
    const conversations = await tenantPrisma.conversation.findMany({
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

    if (members.length === 0) {
      console.log('ℹ️ No members to notify');
      return;
    }

    // Deduplicate members by phone number (in case same phone exists under multiple IDs)
    const seenPhones = new Set<string>();
    const uniqueMembers = members.filter(member => {
      const memberPhone = decryptPhoneSafe(member.phone);
      if (seenPhones.has(memberPhone)) {
        return false;
      }
      seenPhones.add(memberPhone);
      return true;
    });

    console.log(`📢 Broadcasting reply to ${uniqueMembers.length} members`);

    // ✅ Send via RCS with SMS fallback in PARALLEL to all members
    const messageText = `Church: ${content}`;
    const sendPromises = uniqueMembers.map(async (member) => {
      try {
        // Decrypt phone number (stored encrypted in database, or plain text for legacy records)
        const decryptedPhone = decryptPhoneSafe(member.phone);

        // Use RCS with automatic SMS fallback for iMessage-style delivery
        const result = await sendRCSWithFallback(decryptedPhone, messageText, tenantId, { mediaUrl });

        console.log(`   ✓ Sent to ${member.firstName} via ${result.channel.toUpperCase()}`);
        return { success: true, member: member.firstName, channel: result.channel };
      } catch (error: any) {
        console.error(`   ✗ Failed to send to ${member.firstName}: ${error.message}`);
        return { success: false, member: member.firstName, error: error.message };
      }
    });

    // Wait for all SMS sends to complete (don't fail if any individual send fails)
    const results = await Promise.allSettled(sendPromises);

    // Count successes and channel breakdown
    const successResults = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    );
    const rcsCount = successResults.filter(
      (r) => r.status === 'fulfilled' && r.value.channel === 'rcs'
    ).length;
    const smsCount = successResults.length - rcsCount;

    console.log(`✅ Broadcast sent to ${successResults.length}/${uniqueMembers.length} members`);
    console.log(`   📱 RCS: ${rcsCount} | SMS fallback: ${smsCount}`);
  } catch (error: any) {
    console.error('❌ Error broadcasting outbound reply:', error);
    // Don't throw - continue processing even if broadcast fails
  }
}

/**
 * Create text-only reply message
 * Supports reply threading (replyToId) and send effects (sendEffect)
 */
export async function createReply(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  conversationId: string,
  content: string,
  options?: {
    replyToId?: string;
    sendEffect?: string;
  }
): Promise<any> {
  try {
    const conversation = await tenantPrisma.conversation.findUnique({
      where: { id: conversationId },
      include: { member: true },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Create message with optional reply threading and send effects
    const messageData: any = {
      conversationId,
      memberId: conversation.memberId,
      content,
      direction: 'outbound',
    };
    if (options?.replyToId) messageData.replyToId = options.replyToId;
    if (options?.sendEffect) messageData.sendEffect = options.sendEffect;

    const message = await (tenantPrisma.conversationMessage.create({
      data: messageData,
    }) as Promise<any>);

    // Update conversation
    await tenantPrisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // ✅ CACHE INVALIDATION: Clear all conversation lists for this tenant
    await invalidateCache(`conversations:${tenantId}:*`);

    // Broadcast to all members
    await broadcastOutboundToMembers(tenantId, tenantPrisma, content);

    return {
      id: message.id,
      content: message.content,
      direction: message.direction,
      deliveryStatus: message.deliveryStatus,
      createdAt: message.createdAt,
      replyToId: message.replyToId,
      replyTo: (message as any).replyTo,
      sendEffect: message.sendEffect,
    };
  } catch (error: any) {
    console.error('Error creating reply:', error);
    throw new Error(`Failed to create reply: ${error.message}`);
  }
}

/**
 * Create reply with media attachment
 */
export async function createReplyWithMedia(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  conversationId: string,
  content: string | undefined,
  mediaData: {
    s3Url: string;
    s3Key: string;
    type: 'image' | 'video' | 'audio' | 'document';
    name: string;
    sizeBytes: number;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
  }
): Promise<any> {
  try {
    const conversation = await tenantPrisma.conversation.findUnique({
      where: { id: conversationId },
      include: { member: true },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Create message with media
    const message = await tenantPrisma.conversationMessage.create({
      data: {
        conversationId,
        memberId: conversation.memberId,
        content: content || `[${mediaData.type}]`,
        direction: 'outbound',
        mediaUrl: mediaData.s3Url,
        mediaType: mediaData.type,
        mediaName: mediaData.name,
        mediaSizeBytes: mediaData.sizeBytes,
        mediaS3Key: mediaData.s3Key,
        mediaMimeType: mediaData.mimeType,
        mediaWidth: mediaData.width,
        mediaHeight: mediaData.height,
        mediaDuration: mediaData.duration,
      },
    });

    // Update conversation
    await tenantPrisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Broadcast to all members with HD media via RCS
    const displayText = content || `[${mediaData.type}]`;
    await broadcastOutboundToMembers(tenantId, tenantPrisma, displayText, mediaData.s3Url);

    return {
      id: message.id,
      content: message.content,
      direction: message.direction,
      mediaUrl: message.mediaUrl,
      mediaType: message.mediaType,
      mediaSizeBytes: message.mediaSizeBytes,
      deliveryStatus: message.deliveryStatus,
      createdAt: message.createdAt,
    };
  } catch (error: any) {
    console.error('Error creating reply with media:', error);
    throw new Error(`Failed to create reply with media: ${error.message}`);
  }
}

/**
 * Mark conversation as read
 */
export async function markAsRead(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  conversationId: string
): Promise<void> {
  try {
    const conversation = await tenantPrisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await tenantPrisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });

    console.log(`✅ Marked conversation as read: ${conversationId}`);
  } catch (error: any) {
    console.error('Error marking as read:', error);
    throw new Error(`Failed to mark as read: ${error.message}`);
  }
}

/**
 * Update conversation status
 */
export async function updateStatus(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  conversationId: string,
  status: 'open' | 'closed' | 'archived'
): Promise<void> {
  try {
    const conversation = await tenantPrisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await tenantPrisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    });

    // ✅ CACHE INVALIDATION: Clear all conversation lists for this tenant
    await invalidateCache(`conversations:${tenantId}:*`);

    console.log(`✅ Updated conversation status: ${conversationId} → ${status}`);
  } catch (error: any) {
    console.error('Error updating status:', error);
    throw new Error(`Failed to update status: ${error.message}`);
  }
}

/**
 * Delete conversation and all messages
 */
export async function deleteConversation(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  conversationId: string
): Promise<void> {
  try {
    const conversation = await tenantPrisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Delete all messages (cascade handled by Prisma)
    await tenantPrisma.conversation.delete({
      where: { id: conversationId },
    });

    console.log(`✅ Deleted conversation: ${conversationId}`);
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}
