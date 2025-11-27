import { prisma } from '../lib/prisma.js';
import * as telnyxService from './telnyx.service.js';
import { decryptPhoneSafe } from '../utils/encryption.utils.js';
/**
 * Get all conversations for a church (sorted by newest)
 */
export async function getConversations(churchId, options = {}) {
    const { status = 'open', page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    try {
        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                where: {
                    churchId,
                    ...(status ? { status } : {}),
                },
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
            prisma.conversation.count({
                where: {
                    churchId,
                    ...(status ? { status } : {}),
                },
            }),
        ]);
        return {
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
    }
    catch (error) {
        console.error('Error getting conversations:', error);
        throw new Error(`Failed to get conversations: ${error.message}`);
    }
}
/**
 * Get single conversation with all messages
 */
export async function getConversation(conversationId, churchId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                church: {
                    select: { id: true, name: true },
                },
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
        // Verify ownership
        if (conversation.churchId !== churchId) {
            throw new Error('Access denied');
        }
        // Get messages (paginated)
        const [messages, total] = await Promise.all([
            prisma.conversationMessage.findMany({
                where: { conversationId },
                include: {
                    member: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
            }),
            prisma.conversationMessage.count({
                where: { conversationId },
            }),
        ]);
        return {
            id: conversation.id,
            church: conversation.church,
            member: conversation.member,
            status: conversation.status,
            unreadCount: conversation.unreadCount,
            createdAt: conversation.createdAt,
            messages: messages.map((msg) => ({
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
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error('Error getting conversation:', error);
        throw new Error(`Failed to get conversation: ${error.message}`);
    }
}
/**
 * Broadcast outbound reply to all congregation members
 * ✅ OPTIMIZED: Parallel SMS sending instead of sequential
 * Before: 10s (sequential, 1000 members * 10ms per SMS)
 * After: 1s (parallel, limited by slowest single SMS)
 */
async function broadcastOutboundToMembers(churchId, content) {
    try {
        // Get all members of the church who opted in for SMS
        // Include members who are in groups OR have conversations with this church
        const members = await prisma.member.findMany({
            where: {
                optInSms: true,
                OR: [
                    // Members in groups for this church
                    {
                        groups: {
                            some: {
                                group: { churchId },
                            },
                        },
                    },
                    // Members who have conversations with this church (texted the church number)
                    {
                        conversations: {
                            some: {
                                churchId,
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                firstName: true,
                phone: true,
            },
        });
        if (members.length === 0) {
            console.log('ℹ️ No members to notify');
            return;
        }
        // Deduplicate members by phone number (in case same phone exists under multiple IDs)
        const seenPhones = new Set();
        const uniqueMembers = members.filter(member => {
            const memberPhone = decryptPhoneSafe(member.phone);
            if (seenPhones.has(memberPhone)) {
                return false;
            }
            seenPhones.add(memberPhone);
            return true;
        });
        console.log(`📢 Broadcasting reply to ${uniqueMembers.length} members`);
        // ✅ Send SMS in PARALLEL to all members (instead of sequential)
        const messageText = `Church: ${content}`;
        const sendPromises = uniqueMembers.map(async (member) => {
            try {
                // Decrypt phone number (stored encrypted in database, or plain text for legacy records)
                const decryptedPhone = decryptPhoneSafe(member.phone);
                await telnyxService.sendSMS(decryptedPhone, messageText, churchId);
                console.log(`   ✓ Sent to ${member.firstName}`);
                return { success: true, member: member.firstName };
            }
            catch (error) {
                console.error(`   ✗ Failed to send to ${member.firstName}: ${error.message}`);
                return { success: false, member: member.firstName, error: error.message };
            }
        });
        // Wait for all SMS sends to complete (don't fail if any individual send fails)
        const results = await Promise.allSettled(sendPromises);
        // Count successes
        const successCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
        console.log(`✅ Broadcast sent to ${successCount}/${uniqueMembers.length} members`);
    }
    catch (error) {
        console.error('❌ Error broadcasting outbound reply:', error);
        // Don't throw - continue processing even if broadcast fails
    }
}
/**
 * Create text-only reply message
 */
export async function createReply(conversationId, churchId, content) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { member: true },
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        if (conversation.churchId !== churchId) {
            throw new Error('Access denied');
        }
        // Create message
        const message = await prisma.conversationMessage.create({
            data: {
                conversationId,
                memberId: conversation.memberId,
                content,
                direction: 'outbound',
            },
        });
        // Update conversation
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });
        // Broadcast to all members
        await broadcastOutboundToMembers(churchId, content);
        return {
            id: message.id,
            content: message.content,
            direction: message.direction,
            deliveryStatus: message.deliveryStatus,
            createdAt: message.createdAt,
        };
    }
    catch (error) {
        console.error('Error creating reply:', error);
        throw new Error(`Failed to create reply: ${error.message}`);
    }
}
/**
 * Create reply with media attachment
 */
export async function createReplyWithMedia(conversationId, churchId, content, mediaData) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { member: true },
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        if (conversation.churchId !== churchId) {
            throw new Error('Access denied');
        }
        // Create message with media
        const message = await prisma.conversationMessage.create({
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
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });
        // Broadcast to all members
        const displayText = content || `[${mediaData.type}]`;
        await broadcastOutboundToMembers(churchId, displayText);
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
    }
    catch (error) {
        console.error('Error creating reply with media:', error);
        throw new Error(`Failed to create reply with media: ${error.message}`);
    }
}
/**
 * Mark conversation as read
 */
export async function markAsRead(conversationId, churchId) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        if (conversation.churchId !== churchId) {
            throw new Error('Access denied');
        }
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 },
        });
        console.log(`✅ Marked conversation as read: ${conversationId}`);
    }
    catch (error) {
        console.error('Error marking as read:', error);
        throw new Error(`Failed to mark as read: ${error.message}`);
    }
}
/**
 * Update conversation status
 */
export async function updateStatus(conversationId, churchId, status) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        if (conversation.churchId !== churchId) {
            throw new Error('Access denied');
        }
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { status },
        });
        console.log(`✅ Updated conversation status: ${conversationId} → ${status}`);
    }
    catch (error) {
        console.error('Error updating status:', error);
        throw new Error(`Failed to update status: ${error.message}`);
    }
}
/**
 * Delete conversation and all messages
 */
export async function deleteConversation(conversationId, churchId) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        if (conversation.churchId !== churchId) {
            throw new Error('Access denied');
        }
        // Delete all messages (cascade handled by Prisma)
        await prisma.conversation.delete({
            where: { id: conversationId },
        });
        console.log(`✅ Deleted conversation: ${conversationId}`);
    }
    catch (error) {
        console.error('Error deleting conversation:', error);
        throw new Error(`Failed to delete conversation: ${error.message}`);
    }
}
//# sourceMappingURL=conversation.service.js.map