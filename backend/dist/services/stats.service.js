import { prisma } from '../lib/prisma.js';
/**
 * Get message statistics for a church
 */
export async function getMessageStats(churchId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    // Get overall stats
    const messages = await prisma.message.findMany({
        where: {
            churchId,
            createdAt: { gte: startDate },
        },
        include: {
            recipients: true,
        },
    });
    const totalMessages = messages.length;
    const deliveredCount = messages.reduce((sum, msg) => sum +
        msg.recipients.filter((r) => r.status === 'delivered').length, 0);
    const failedCount = messages.reduce((sum, msg) => sum + msg.recipients.filter((r) => r.status === 'failed').length, 0);
    const pendingCount = messages.reduce((sum, msg) => sum + msg.recipients.filter((r) => r.status === 'pending').length, 0);
    const totalRecipients = messages.reduce((sum, msg) => sum + msg.recipients.length, 0);
    const deliveryRate = totalRecipients > 0
        ? Math.round((deliveredCount / totalRecipients) * 100)
        : 0;
    // Get stats by day
    const byDay = [];
    const dayMap = new Map();
    for (const message of messages) {
        const dateStr = message.createdAt.toISOString().split('T')[0];
        if (!dayMap.has(dateStr)) {
            dayMap.set(dateStr, {
                count: 0,
                delivered: 0,
                failed: 0,
            });
        }
        const day = dayMap.get(dateStr);
        day.count += 1;
        day.delivered += message.recipients.filter((r) => r.status === 'delivered').length;
        day.failed += message.recipients.filter((r) => r.status === 'failed').length;
    }
    // Convert to array and sort
    for (const [date, data] of dayMap.entries()) {
        byDay.push({ date, ...data });
    }
    byDay.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
        totalMessages,
        deliveredCount,
        failedCount,
        pendingCount,
        deliveryRate,
        byDay,
    };
}
/**
 * Get statistics per branch
 */
export async function getBranchStats(churchId) {
    const branches = await prisma.branch.findMany({
        where: { churchId },
        include: {
            groups: {
                include: {
                    members: {
                        select: { id: true },
                    },
                },
            },
        },
    });
    const stats = [];
    for (const branch of branches) {
        // Count members
        const memberSet = new Set();
        for (const group of branch.groups) {
            for (const member of group.members) {
                memberSet.add(member.id);
            }
        }
        const memberCount = memberSet.size;
        // Count messages sent to this branch
        const messages = await prisma.message.findMany({
            where: {
                churchId,
            },
        });
        // Filter messages where targetType is 'branches' or 'all'
        let messageCount = 0;
        let deliveredCount = 0;
        for (const msg of messages) {
            if (msg.targetType === 'branches' || msg.targetType === 'all') {
                messageCount += 1;
                const recipients = await prisma.messageRecipient.findMany({
                    where: { messageId: msg.id, member: { groups: { some: { groupId: { in: branch.groups.map((g) => g.id) } } } } },
                });
                deliveredCount += recipients.filter((r) => r.status === 'delivered').length;
            }
        }
        const deliveryRate = messageCount > 0
            ? Math.round((deliveredCount / (messageCount * memberCount || 1)) * 100)
            : 0;
        stats.push({
            id: branch.id,
            name: branch.name,
            memberCount,
            messageCount,
            deliveryRate: Math.min(deliveryRate, 100),
            groupCount: branch.groups.length,
        });
    }
    return stats;
}
/**
 * Get summary statistics
 */
export async function getSummaryStats(churchId) {
    const [messages, members, branches, groups] = await Promise.all([
        prisma.message.count({ where: { churchId } }),
        prisma.member.count(),
        prisma.branch.count({ where: { churchId } }),
        prisma.group.count({ where: { churchId } }),
    ]);
    const messageStats = await getMessageStats(churchId, 30);
    return {
        totalMessages: messages,
        averageDeliveryRate: messageStats.deliveryRate,
        totalMembers: members,
        totalBranches: branches,
        totalGroups: groups,
    };
}
//# sourceMappingURL=stats.service.js.map