import type { TenantPrismaClient } from '../lib/tenant-prisma.js';
import { createCustomSpan, createDatabaseSpan } from '../utils/apm-instrumentation.js';

export interface ResolveRecipientsOptions {
  targetType: 'individual' | 'all';
  targetIds?: string[]; // Member IDs for individual
}

export interface CreateMessageData {
  content: string;
  targetType: 'individual' | 'all';
  targetIds?: string[];
  // RCS Rich Card data (optional) - for iMessage-style rich messages
  richCard?: {
    title: string;
    description?: string;
    imageUrl?: string;
    // Action buttons
    rsvpUrl?: string;
    websiteUrl?: string;
    phoneNumber?: string;
    location?: {
      latitude: number;
      longitude: number;
      label: string;
    };
    // Quick reply buttons
    quickReplies?: string[];
  };
}

/**
 * Resolve recipients based on target type
 * Returns unique opted-in members by phone number
 */
export async function resolveRecipients(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  options: ResolveRecipientsOptions
): Promise<Array<{ id: string; phone: string }>> {
  return createCustomSpan(
    'message.resolve_recipients',
    async () => {
      const members = new Map<string, { id: string; phone: string }>();

      try {
        if (options.targetType === 'individual' && options.targetIds?.length === 1) {
          // Single member
          const member = await createDatabaseSpan(
            'SELECT',
            'member',
            () => tenantPrisma.member.findUnique({
              where: { id: options.targetIds![0] },
              select: { id: true, phone: true, optInSms: true },
            }),
            { tenantId, targetType: 'individual' }
          );

          if (member && member.optInSms) {
            members.set(member.phone, { id: member.id, phone: member.phone });
          }
        } else if (options.targetType === 'all') {
          // Get all members through conversations
          const conversations = await createDatabaseSpan(
            'SELECT',
            'conversation',
            () => tenantPrisma.conversation.findMany({
              select: {
                member: {
                  select: {
                    id: true,
                    phone: true,
                    optInSms: true,
                  },
                },
              },
            }),
            { tenantId, targetType: 'all' }
          );

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
    },
    { tenantId, targetType: options.targetType }
  );
}

/**
 * Create message record
 */
export async function createMessage(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  data: CreateMessageData
): Promise<any> {
  return createCustomSpan(
    'message.create',
    async () => {
      // Resolve recipients
      const recipients = await resolveRecipients(tenantId, tenantPrisma, {
        targetType: data.targetType,
        targetIds: data.targetIds,
      });

      if (recipients.length === 0) {
        throw new Error('No valid recipients found');
      }

      // Create message record
      const message = await createDatabaseSpan(
        'INSERT',
        'message',
        () => tenantPrisma.message.create({
          data: {
            content: data.content,
            targetType: data.targetType,
            targetIds: JSON.stringify(data.targetIds || []),
            totalRecipients: recipients.length,
            status: 'pending',
          },
        }),
        { tenantId, recipientCount: recipients.length }
      );

      // Create message recipient records in batch (not one-by-one)
      await createDatabaseSpan(
        'INSERT',
        'messageRecipient',
        () => tenantPrisma.messageRecipient.createMany({
          data: recipients.map((recipient) => ({
            messageId: message.id,
            memberId: recipient.id,
            status: 'pending',
          })),
        }),
        { tenantId, recordCount: recipients.length }
      );

      return {
        id: message.id,
        content: message.content,
        targetType: message.targetType,
        totalRecipients: message.totalRecipients,
        status: message.status,
        createdAt: message.createdAt,
      };
    },
    { tenantId, targetType: data.targetType, contentLength: data.content.length }
  );
}

/**
 * Get message history with pagination
 */
export async function getMessageHistory(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  options: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [messages, total] = await Promise.all([
    tenantPrisma.message.findMany({
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
    tenantPrisma.message.count({ where }),
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
export async function getMessageDetails(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string): Promise<any> {
  const message = await tenantPrisma.message.findUnique({
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
export async function updateMessageStats(tenantId: string, tenantPrisma: TenantPrismaClient, messageId: string): Promise<void> {
  const stats = await tenantPrisma.messageRecipient.groupBy({
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

  await tenantPrisma.message.update({
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
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  recipientId: string,
  status: 'delivered' | 'failed',
  messageId: string,
  data?: { failureReason?: string }
): Promise<void> {
  await tenantPrisma.messageRecipient.update({
    where: { id: recipientId },
    data: {
      status,
      deliveredAt: status === 'delivered' ? new Date() : undefined,
      failedAt: status === 'failed' ? new Date() : undefined,
      failureReason: data?.failureReason,
    },
  });

  // Update message stats
  await updateMessageStats(tenantId, tenantPrisma, messageId);
}
