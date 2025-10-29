import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateRecurringMessageData {
  name: string;
  content: string;
  targetType: 'individual' | 'groups' | 'branches' | 'all';
  targetIds?: string[]; // JSON array as string
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  timeOfDay: string; // HH:MM format
}

export async function getRecurringMessages(churchId: string) {
  return await prisma.recurringMessage.findMany({
    where: { churchId },
    orderBy: { nextSendAt: 'asc' },
  });
}

export async function createRecurringMessage(
  churchId: string,
  data: CreateRecurringMessageData
) {
  const nextSendAt = calculateNextSendAt(
    data.frequency,
    data.timeOfDay,
    data.dayOfWeek
  );

  return await prisma.recurringMessage.create({
    data: {
      churchId,
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

export async function updateRecurringMessage(
  messageId: string,
  data: Partial<CreateRecurringMessageData>
) {
  const updates: any = {};

  if (data.name) updates.name = data.name;
  if (data.content) updates.content = data.content;
  if (data.targetType) updates.targetType = data.targetType;
  if (data.targetIds !== undefined) {
    updates.targetIds = data.targetIds ? JSON.stringify(data.targetIds) : '';
  }
  if (data.frequency) {
    updates.frequency = data.frequency;
    updates.nextSendAt = calculateNextSendAt(
      data.frequency,
      data.timeOfDay || '',
      data.dayOfWeek
    );
  }
  if (data.dayOfWeek !== undefined) updates.dayOfWeek = data.dayOfWeek;
  if (data.timeOfDay) {
    updates.timeOfDay = data.timeOfDay;
    if (data.frequency) {
      updates.nextSendAt = calculateNextSendAt(
        data.frequency,
        data.timeOfDay,
        data.dayOfWeek
      );
    }
  }

  return await prisma.recurringMessage.update({
    where: { id: messageId },
    data: updates,
  });
}

export async function deleteRecurringMessage(messageId: string) {
  return await prisma.recurringMessage.delete({
    where: { id: messageId },
  });
}

export async function toggleRecurringMessage(
  messageId: string,
  isActive: boolean
) {
  return await prisma.recurringMessage.update({
    where: { id: messageId },
    data: { isActive },
  });
}

export async function updateNextSendAt(
  messageId: string,
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number
) {
  const nextSendAt = calculateNextSendAt(frequency, timeOfDay, dayOfWeek);

  return await prisma.recurringMessage.update({
    where: { id: messageId },
    data: { nextSendAt },
  });
}

/**
 * Calculate next send time based on frequency
 */
function calculateNextSendAt(
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number
): Date {
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
  } else if (frequency === 'weekly') {
    // Schedule for next occurrence of dayOfWeek
    const targetDay = dayOfWeek || 0;
    const currentDay = next.getDay();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd < 0 || (daysToAdd === 0 && next <= now)) {
      daysToAdd += 7;
    }

    next.setDate(next.getDate() + daysToAdd);
  } else if (frequency === 'monthly') {
    // Schedule for same day next month
    next.setMonth(next.getMonth() + 1);

    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
}
