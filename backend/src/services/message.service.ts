import { prisma } from '../lib/prisma.js';

export interface ResolveRecipientsOptions {
  targetType: 'individual' | 'all';
  targetIds?: string[]; // Member IDs for individual
}

export interface CreateMessageData {
  content: string;
  targetType: 'individual' | 'all';
  targetIds?: string[];
}

/**
 * Resolve recipients based on target type
 * Returns unique opted-in members by phone number
 */
export async function resolveRecipients(
  churchId: string,
  options: ResolveRecipientsOptions
): Promise<Array<{ id: string; phone: string }>> {
  const members = new Map<string, { id: string; phone: string }>();

  try {
    if (options.targetType === 'individual' && options.targetIds?.length === 1) {
      // Single member
      const member = await prisma.member.findUnique({
        where: { id: options.targetIds[0] },
        select: { id: true, phone: true, optInSms: true },
      });

      if (member && member.optInSms) {
        members.set(member.phone, { id: member.id, phone: member.phone });
      }
    } else if (options.targetType === 'all') {
      // Get all members through conversations (members don't have churchId anymore)
      const conversations = await prisma.conversation.findMany({
        where: { churchId },
        select: {
          member: {
            select: {
              id: true,
              phone: true,
              optInSms: true,
            },
          },
        },
      });

      for (const conv of conversations) {
        const member = conv.member;
        if (member.optInSms) {
          members.set(member.phone, { id: member.id, phone: member.phone });
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to resolve recipients: ${(error as Error).message}`);
  }

  return Array.from(members.values());
}

/**
 * Create message record
 */
export async function createMessage(
  churchId: string,
  data: CreateMessageData
): Promise<any> {
  // Resolve recipients
  const recipients = await resolveRecipients(churchId, {
    targetType: data.targetType,
    targetIds: data.targetIds,
  });

  if (recipients.length === 0) {
    throw new Error('No valid recipients found');
  }

  // Create message record
  const message = await prisma.message.create({
    data: {
      churchId,
      content: data.content,
      targetType: data.targetType,
      targetIds: JSON.stringify(data.targetIds || []),
      totalRecipients: recipients.length,
      status: 'pending',
    },
  });

  // Create message recipient records in batch (not one-by-one)
  await prisma.messageRecipient.createMany({
    data: recipients.map((recipient) => ({
      messageId: message.id,
      memberId: recipient.id,
      status: 'pending',
    })),
  });

  return {
    id: message.id,
    content: message.content,
    targetType: message.targetType,
    totalRecipients: message.totalRecipients,
    status: message.status,
    createdAt: message.createdAt,
  };
}

/**
 * Get message history with pagination
 */
export async function getMessageHistory(
  churchId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const where: any = { churchId };
  if (status) {
    where.status = status;
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      select: {
        id: true,
        content: true,
        status: true,
        targetType: true,
        totalRecipients: true,
        deliveredCount: true,
        failedCount: true,
        sentAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  return {
    data: messages.map((m) => ({
      ...m,
      deliveryRate: m.totalRecipients > 0 ? Math.round((m.deliveredCount / m.totalRecipients) * 100) : 0,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single message details with recipients
 */
export async function getMessageDetails(messageId: string): Promise<any> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      recipients: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  return {
    ...message,
    recipients: message.recipients.map((r) => ({
      id: r.id,
      member: r.member,
      status: r.status,
      deliveredAt: r.deliveredAt,
      failedAt: r.failedAt,
      failureReason: r.failureReason,
    })),
  };
}

/**
 * Update message delivery stats
 */
export async function updateMessageStats(messageId: string): Promise<void> {
  const stats = await prisma.messageRecipient.groupBy({
    by: ['status'],
    where: { messageId },
    _count: { id: true },
  });

  const counts = stats.reduce(
    (acc, s) => {
      acc[s.status] = s._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  await prisma.message.update({
    where: { id: messageId },
    data: {
      deliveredCount: counts['delivered'] || 0,
      failedCount: counts['failed'] || 0,
      status:
        counts['pending'] === 0
          ? counts['failed'] > 0 && counts['delivered'] === 0
            ? 'failed'
            : 'sent'
          : 'pending',
    },
  });
}

/**
 * Update recipient delivery status
 * Accepts messageId to avoid redundant database fetch
 */
export async function updateRecipientStatus(
  recipientId: string,
  status: 'delivered' | 'failed',
  messageId: string,
  data?: { failureReason?: string }
): Promise<void> {
  await prisma.messageRecipient.update({
    where: { id: recipientId },
    data: {
      status,
      deliveredAt: status === 'delivered' ? new Date() : undefined,
      failedAt: status === 'failed' ? new Date() : undefined,
      failureReason: data?.failureReason,
    },
  });

  // Update message stats
  await updateMessageStats(messageId);
}
