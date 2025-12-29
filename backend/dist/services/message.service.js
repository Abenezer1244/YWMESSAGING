/**
 * Resolve recipients based on target type
 * Returns unique opted-in members by phone number
 */
export async function resolveRecipients(tenantId, tenantPrisma, options) {
    const members = new Map();
    try {
        if (options.targetType === 'individual' && options.targetIds?.length === 1) {
            // Single member
            const member = await tenantPrisma.member.findUnique({
                where: { id: options.targetIds[0] },
                select: { id: true, phone: true, optInSms: true },
            });
            if (member && member.optInSms) {
                members.set(member.phone, { id: member.id, phone: member.phone });
            }
        }
        else if (options.targetType === 'all') {
            // Get all members through conversations
            const conversations = await tenantPrisma.conversation.findMany({
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
    }
    catch (error) {
        throw new Error(`Failed to resolve recipients: ${error.message}`);
    }
    return Array.from(members.values());
}
/**
 * Create message record
 */
export async function createMessage(tenantId, tenantPrisma, data) {
    // Resolve recipients
    const recipients = await resolveRecipients(tenantId, tenantPrisma, {
        targetType: data.targetType,
        targetIds: data.targetIds,
    });
    if (recipients.length === 0) {
        throw new Error('No valid recipients found');
    }
    // Create message record
    const message = await tenantPrisma.message.create({
        data: {
            churchId: tenantId,
            content: data.content,
            targetType: data.targetType,
            targetIds: JSON.stringify(data.targetIds || []),
            totalRecipients: recipients.length,
            status: 'pending',
        },
    });
    // Create message recipient records in batch (not one-by-one)
    await tenantPrisma.messageRecipient.createMany({
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
export async function getMessageHistory(tenantId, tenantPrisma, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;
    const where = {};
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
export async function getMessageDetails(tenantId, tenantPrisma, messageId) {
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
export async function updateMessageStats(tenantId, tenantPrisma, messageId) {
    const stats = await tenantPrisma.messageRecipient.groupBy({
        by: ['status'],
        where: { messageId },
        _count: { id: true },
    });
    const counts = stats.reduce((acc, s) => {
        acc[s.status] = s._count.id;
        return acc;
    }, {});
    await tenantPrisma.message.update({
        where: { id: messageId },
        data: {
            deliveredCount: counts['delivered'] || 0,
            failedCount: counts['failed'] || 0,
            status: counts['pending'] === 0
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
export async function updateRecipientStatus(tenantId, tenantPrisma, recipientId, status, messageId, data) {
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
//# sourceMappingURL=message.service.js.map