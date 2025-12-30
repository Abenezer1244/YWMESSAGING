export async function getRecurringMessages(tenantId, tenantPrisma) {
    return await tenantPrisma.recurringMessage.findMany({
        orderBy: { nextSendAt: 'asc' },
    });
}
export async function createRecurringMessage(tenantId, tenantPrisma, data) {
    const nextSendAt = calculateNextSendAt(data.frequency, data.timeOfDay, data.dayOfWeek);
    return await tenantPrisma.recurringMessage.create({
        data: {
            name: data.name,
            content: data.content,
            targetType: data.targetType,
            targetIds: data.targetIds ? JSON.stringify(data.targetIds) : '',
            frequency: data.frequency,
            dayOfWeek: data.dayOfWeek,
            timeOfDay: data.timeOfDay,
            nextSendAt,
            isActive: true,
        },
    });
}
export async function updateRecurringMessage(tenantId, tenantPrisma, messageId, data) {
    const updates = {};
    if (data.name)
        updates.name = data.name;
    if (data.content)
        updates.content = data.content;
    if (data.targetType)
        updates.targetType = data.targetType;
    if (data.targetIds !== undefined) {
        updates.targetIds = data.targetIds ? JSON.stringify(data.targetIds) : '';
    }
    if (data.frequency) {
        updates.frequency = data.frequency;
        updates.nextSendAt = calculateNextSendAt(data.frequency, data.timeOfDay || '', data.dayOfWeek);
    }
    if (data.dayOfWeek !== undefined)
        updates.dayOfWeek = data.dayOfWeek;
    if (data.timeOfDay) {
        updates.timeOfDay = data.timeOfDay;
        if (data.frequency) {
            updates.nextSendAt = calculateNextSendAt(data.frequency, data.timeOfDay, data.dayOfWeek);
        }
    }
    return await tenantPrisma.recurringMessage.update({
        where: { id: messageId },
        data: updates,
    });
}
export async function deleteRecurringMessage(tenantId, tenantPrisma, messageId) {
    return await tenantPrisma.recurringMessage.delete({
        where: { id: messageId },
    });
}
export async function toggleRecurringMessage(tenantId, tenantPrisma, messageId, isActive) {
    return await tenantPrisma.recurringMessage.update({
        where: { id: messageId },
        data: { isActive },
    });
}
export async function updateNextSendAt(tenantId, tenantPrisma, messageId, frequency, timeOfDay, dayOfWeek) {
    const nextSendAt = calculateNextSendAt(frequency, timeOfDay, dayOfWeek);
    return await tenantPrisma.recurringMessage.update({
        where: { id: messageId },
        data: { nextSendAt },
    });
}
/**
 * Calculate next send time based on frequency
 */
function calculateNextSendAt(frequency, timeOfDay, dayOfWeek) {
    const [hours, minutes] = timeOfDay.split(':').map(Number);
    const now = new Date();
    const next = new Date(now);
    // Set time to timeOfDay
    next.setHours(hours, minutes, 0, 0);
    if (frequency === 'daily') {
        // If time has passed today, schedule for tomorrow
        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }
    }
    else if (frequency === 'weekly') {
        // Schedule for next occurrence of dayOfWeek
        const targetDay = dayOfWeek || 0;
        const currentDay = next.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd < 0 || (daysToAdd === 0 && next <= now)) {
            daysToAdd += 7;
        }
        next.setDate(next.getDate() + daysToAdd);
    }
    else if (frequency === 'monthly') {
        // Schedule for same day next month
        next.setMonth(next.getMonth() + 1);
        if (next <= now) {
            next.setMonth(next.getMonth() + 1);
        }
    }
    return next;
}
//# sourceMappingURL=recurring.service.js.map