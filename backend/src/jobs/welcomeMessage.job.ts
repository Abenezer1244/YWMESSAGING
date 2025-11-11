import { PrismaClient } from '@prisma/client';
import * as telnyxService from '../services/telnyx.service.js';

const prisma = new PrismaClient();

/**
 * Send welcome message when a member is added to a group
 * Triggered by GroupMember creation
 * Delay: 1 minute
 */
export async function sendWelcomeMessage(
  groupMemberId: string,
  groupId: string,
  memberId: string
) {
  try {
    // Fetch group, member, and church details
    const [group, member] = await Promise.all([
      prisma.group.findUnique({
        where: { id: groupId },
        include: { church: true },
      }),
      prisma.member.findUnique({
        where: { id: memberId },
      }),
    ]);

    if (!group || !member || !group.welcomeMessageEnabled) {
      return;
    }

    // Check if welcome message already sent
    const groupMember = await prisma.groupMember.findUnique({
      where: { id: groupMemberId },
    });

    if (!groupMember || groupMember.welcomeMessageSent) {
      return;
    }

    const welcomeText =
      group.welcomeMessageText || `Welcome to ${group.name}!`;

    // Send SMS via Telnyx
    await telnyxService.sendSMS(member.phone, welcomeText, group.churchId);

    // Mark as sent
    await prisma.groupMember.update({
      where: { id: groupMemberId },
      data: { welcomeMessageSent: true },
    });

    console.log(
      `Welcome message sent to ${member.phone} for group ${group.name}`
    );
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

/**
 * Helper to call welcome message job with delay
 */
export async function queueWelcomeMessage(
  groupMemberId: string,
  groupId: string,
  memberId: string,
  delayMs: number = 60000 // 1 minute default
) {
  // In a real implementation with Bull queue, this would be:
  // await welcomeMessageQueue.add(
  //   { groupMemberId, groupId, memberId },
  //   { delay: delayMs }
  // );

  // For now, schedule with setTimeout
  setTimeout(() => {
    sendWelcomeMessage(groupMemberId, groupId, memberId).catch((error) =>
      console.error('Welcome message job failed:', error)
    );
  }, delayMs);
}
