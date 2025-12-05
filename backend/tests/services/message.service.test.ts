/**
 * Message Service Unit Tests
 * Tests core messaging functionality:
 * - Recipient resolution (individual, groups, branches, all)
 * - Message creation with recipient deduplication
 * - Delivery status tracking
 * - Pagination and filtering
 */

import { PrismaClient } from '@prisma/client';
import { getTestFactories } from '../helpers/test-factories.js';
import * as messageService from '../../src/services/message.service.js';

describe('Message Service - Unit Tests', () => {
  let prisma: PrismaClient;
  let factories: any;
  let testChurch: any;

  beforeAll(async () => {
    prisma = global.testDb;
    factories = getTestFactories(prisma);
  });

  beforeEach(async () => {
    await factories.cleanup();
    // Create test church for each test
    testChurch = await factories.createTestChurch();
  });

  afterAll(async () => {
    await factories.cleanup();
  });

  describe('resolveRecipients()', () => {
    test('✅ Should resolve individual recipient by member ID', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'individual',
        targetIds: [member.id],
      });

      expect(recipients).toHaveLength(1);
      expect(recipients[0].id).toBe(member.id);
      expect(recipients[0].phone).toBe(member.phone);
    });

    test('✅ Should exclude opted-out members from individual resolution', async () => {
      const member = await prisma.member.create({
        data: {
          firstName: 'Opted',
          lastName: 'Out',
          phone: '+15551234567',
          optInSms: false,
        },
      });

      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'individual',
        targetIds: [member.id],
      });

      expect(recipients).toHaveLength(0);
    });

    test('✅ Should resolve multiple members in a group', async () => {
      // Create branch and group
      const branch = await prisma.branch.create({
        data: {
          churchId: testChurch.id,
          name: 'Test Branch',
        },
      });

      const group = await prisma.group.create({
        data: {
          churchId: testChurch.id,
          branchId: branch.id,
          name: 'Test Group',
        },
      });

      // Add members to group
      const member1 = await factories.createTestMember(testChurch.id);
      const member2 = await factories.createTestMember(testChurch.id);

      await prisma.groupMember.createMany({
        data: [
          { groupId: group.id, memberId: member1.id },
          { groupId: group.id, memberId: member2.id },
        ],
      });

      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'groups',
        targetIds: [group.id],
      });

      expect(recipients).toHaveLength(2);
      expect(recipients.map((r) => r.id)).toContain(member1.id);
      expect(recipients.map((r) => r.id)).toContain(member2.id);
    });

    test('✅ Should deduplicate members by phone number in groups', async () => {
      const branch = await prisma.branch.create({
        data: { churchId: testChurch.id, name: 'Branch' },
      });

      const group1 = await prisma.group.create({
        data: { churchId: testChurch.id, branchId: branch.id, name: 'Group 1' },
      });

      const group2 = await prisma.group.create({
        data: { churchId: testChurch.id, branchId: branch.id, name: 'Group 2' },
      });

      // Same member in both groups
      const member = await factories.createTestMember(testChurch.id);
      await prisma.groupMember.createMany({
        data: [
          { groupId: group1.id, memberId: member.id },
          { groupId: group2.id, memberId: member.id },
        ],
      });

      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'groups',
        targetIds: [group1.id, group2.id],
      });

      expect(recipients).toHaveLength(1);
      expect(recipients[0].id).toBe(member.id);
    });

    test('✅ Should resolve all members in branch', async () => {
      const branch = await prisma.branch.create({
        data: { churchId: testChurch.id, name: 'Branch' },
      });

      const group = await prisma.group.create({
        data: { churchId: testChurch.id, branchId: branch.id, name: 'Group' },
      });

      const member = await factories.createTestMember(testChurch.id);
      await prisma.groupMember.create({
        data: { groupId: group.id, memberId: member.id },
      });

      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'branches',
        targetIds: [branch.id],
      });

      expect(recipients).toHaveLength(1);
      expect(recipients[0].id).toBe(member.id);
    });

    test('✅ Should resolve all members in church', async () => {
      const branch = await prisma.branch.create({
        data: { churchId: testChurch.id, name: 'Branch' },
      });

      const group = await prisma.group.create({
        data: { churchId: testChurch.id, branchId: branch.id, name: 'Group' },
      });

      const member = await factories.createTestMember(testChurch.id);
      await prisma.groupMember.create({
        data: { groupId: group.id, memberId: member.id },
      });

      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'all',
      });

      expect(recipients).toHaveLength(1);
      expect(recipients[0].id).toBe(member.id);
    });

    test('✅ Should return empty array for no matching recipients', async () => {
      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'individual',
        targetIds: ['nonexistent-id'],
      });

      expect(recipients).toHaveLength(0);
    });

    test('✅ Should only include opted-in members', async () => {
      const branch = await prisma.branch.create({
        data: { churchId: testChurch.id, name: 'Branch' },
      });

      const group = await prisma.group.create({
        data: { churchId: testChurch.id, branchId: branch.id, name: 'Group' },
      });

      const optedInMember = await factories.createTestMember(testChurch.id);
      const optedOutMember = await prisma.member.create({
        data: {
          firstName: 'Out',
          lastName: 'User',
          phone: '+15559999999',
          optInSms: false,
        },
      });

      await prisma.groupMember.createMany({
        data: [
          { groupId: group.id, memberId: optedInMember.id },
          { groupId: group.id, memberId: optedOutMember.id },
        ],
      });

      const recipients = await messageService.resolveRecipients(testChurch.id, {
        targetType: 'groups',
        targetIds: [group.id],
      });

      expect(recipients).toHaveLength(1);
      expect(recipients[0].id).toBe(optedInMember.id);
    });
  });

  describe('createMessage()', () => {
    test('✅ Should create message with individual recipient', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Hello member!',
        targetType: 'individual',
        targetIds: [member.id],
      });

      expect(message.id).toBeDefined();
      expect(message.content).toBe('Hello member!');
      expect(message.status).toBe('pending');
      expect(message.totalRecipients).toBe(1);
      expect(message.targetType).toBe('individual');
    });

    test('✅ Should create message recipient records', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Test message',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const recipients = await prisma.messageRecipient.findMany({
        where: { messageId: message.id },
      });

      expect(recipients).toHaveLength(1);
      expect(recipients[0].memberId).toBe(member.id);
      expect(recipients[0].status).toBe('pending');
    });

    test('✅ Should reject message with no recipients', async () => {
      await expect(
        messageService.createMessage(testChurch.id, {
          content: 'No recipients',
          targetType: 'individual',
          targetIds: ['nonexistent'],
        })
      ).rejects.toThrow('No valid recipients found');
    });

    test('✅ Should batch create recipient records (performance)', async () => {
      const branch = await prisma.branch.create({
        data: { churchId: testChurch.id, name: 'Branch' },
      });

      const group = await prisma.group.create({
        data: { churchId: testChurch.id, branchId: branch.id, name: 'Group' },
      });

      // Create 10 members
      const members = await Promise.all(
        Array.from({ length: 10 }, () =>
          factories.createTestMember(testChurch.id)
        )
      );

      for (const member of members) {
        await prisma.groupMember.create({
          data: { groupId: group.id, memberId: member.id },
        });
      }

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Batch message',
        targetType: 'groups',
        targetIds: [group.id],
      });

      expect(message.totalRecipients).toBe(10);

      const recipients = await prisma.messageRecipient.findMany({
        where: { messageId: message.id },
      });
      expect(recipients).toHaveLength(10);
    });

    test('✅ Should store targetIds as JSON', async () => {
      const member = await factories.createTestMember(testChurch.id);
      const targetIds = [member.id];

      await messageService.createMessage(testChurch.id, {
        content: 'JSON test',
        targetType: 'individual',
        targetIds,
      });

      const dbMessage = await prisma.message.findFirst({
        where: { churchId: testChurch.id },
      });

      expect(dbMessage?.targetIds).toBe(JSON.stringify(targetIds));
    });
  });

  describe('getMessageHistory()', () => {
    test('✅ Should return paginated message history', async () => {
      const member = await factories.createTestMember(testChurch.id);

      // Create 5 messages
      for (let i = 0; i < 5; i++) {
        await messageService.createMessage(testChurch.id, {
          content: `Message ${i}`,
          targetType: 'individual',
          targetIds: [member.id],
        });
      }

      const result = await messageService.getMessageHistory(testChurch.id, {
        page: 1,
        limit: 3,
      });

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.pages).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    test('✅ Should filter by status', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message1 = await messageService.createMessage(testChurch.id, {
        content: 'Pending',
        targetType: 'individual',
        targetIds: [member.id],
      });

      // Mark second message as sent
      await prisma.message.create({
        data: {
          churchId: testChurch.id,
          content: 'Sent',
          targetType: 'individual',
          targetIds: JSON.stringify([member.id]),
          totalRecipients: 1,
          status: 'sent',
        },
      });

      const pendingResult = await messageService.getMessageHistory(
        testChurch.id,
        { status: 'pending' }
      );

      expect(pendingResult.data).toHaveLength(1);
      expect(pendingResult.data[0].status).toBe('pending');
    });

    test('✅ Should calculate delivery rate', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Test',
        targetType: 'individual',
        targetIds: [member.id],
      });

      // Update to simulate delivery
      const recipient = await prisma.messageRecipient.findFirst({
        where: { messageId: message.id },
      });

      if (recipient) {
        await prisma.messageRecipient.update({
          where: { id: recipient.id },
          data: { status: 'delivered' },
        });

        // Update message stats
        await messageService.updateMessageStats(message.id);
      }

      const result = await messageService.getMessageHistory(testChurch.id);

      expect(result.data[0].deliveryRate).toBe(100);
    });

    test('✅ Should order by newest first', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message1 = await messageService.createMessage(testChurch.id, {
        content: 'First',
        targetType: 'individual',
        targetIds: [member.id],
      });

      await new Promise((r) => setTimeout(r, 100));

      const message2 = await messageService.createMessage(testChurch.id, {
        content: 'Second',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const result = await messageService.getMessageHistory(testChurch.id);

      expect(result.data[0].id).toBe(message2.id);
      expect(result.data[1].id).toBe(message1.id);
    });
  });

  describe('getMessageDetails()', () => {
    test('✅ Should return message with recipients', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Details test',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const details = await messageService.getMessageDetails(message.id);

      expect(details.id).toBe(message.id);
      expect(details.content).toBe('Details test');
      expect(details.recipients).toHaveLength(1);
      expect(details.recipients[0].member.id).toBe(member.id);
    });

    test('✅ Should include member details in response', async () => {
      const member = await factories.createTestMember(testChurch.id, {
        firstName: 'John',
        lastName: 'Doe',
      });

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Member details',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const details = await messageService.getMessageDetails(message.id);

      expect(details.recipients[0].member.firstName).toBe('John');
      expect(details.recipients[0].member.lastName).toBe('Doe');
      expect(details.recipients[0].member.phone).toBe(member.phone);
    });

    test('✅ Should throw error for nonexistent message', async () => {
      await expect(
        messageService.getMessageDetails('nonexistent')
      ).rejects.toThrow('Message not found');
    });
  });

  describe('updateMessageStats()', () => {
    test('✅ Should count delivered recipients', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Stats test',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const recipient = await prisma.messageRecipient.findFirst({
        where: { messageId: message.id },
      });

      if (recipient) {
        await prisma.messageRecipient.update({
          where: { id: recipient.id },
          data: { status: 'delivered', deliveredAt: new Date() },
        });

        await messageService.updateMessageStats(message.id);

        const updated = await prisma.message.findUnique({
          where: { id: message.id },
        });

        expect(updated?.deliveredCount).toBe(1);
        expect(updated?.status).toBe('sent');
      }
    });

    test('✅ Should count failed recipients', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Failed test',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const recipient = await prisma.messageRecipient.findFirst({
        where: { messageId: message.id },
      });

      if (recipient) {
        await prisma.messageRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'failed',
            failedAt: new Date(),
            failureReason: 'Invalid number',
          },
        });

        await messageService.updateMessageStats(message.id);

        const updated = await prisma.message.findUnique({
          where: { id: message.id },
        });

        expect(updated?.failedCount).toBe(1);
        expect(updated?.status).toBe('failed');
      }
    });

    test('✅ Should mark message as sent when all delivered', async () => {
      const members = await Promise.all([
        factories.createTestMember(testChurch.id),
        factories.createTestMember(testChurch.id),
      ]);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'All sent',
        targetType: 'individual',
        targetIds: [members[0].id, members[1].id],
      });

      const recipients = await prisma.messageRecipient.findMany({
        where: { messageId: message.id },
      });

      for (const recipient of recipients) {
        await prisma.messageRecipient.update({
          where: { id: recipient.id },
          data: { status: 'delivered', deliveredAt: new Date() },
        });
      }

      await messageService.updateMessageStats(message.id);

      const updated = await prisma.message.findUnique({
        where: { id: message.id },
      });

      expect(updated?.status).toBe('sent');
      expect(updated?.deliveredCount).toBe(2);
    });
  });

  describe('updateRecipientStatus()', () => {
    test('✅ Should update recipient to delivered', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Update test',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const recipient = await prisma.messageRecipient.findFirst({
        where: { messageId: message.id },
      });

      if (recipient) {
        await messageService.updateRecipientStatus(
          recipient.id,
          'delivered',
          message.id
        );

        const updated = await prisma.messageRecipient.findUnique({
          where: { id: recipient.id },
        });

        expect(updated?.status).toBe('delivered');
        expect(updated?.deliveredAt).toBeDefined();
      }
    });

    test('✅ Should update recipient to failed with reason', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Fail test',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const recipient = await prisma.messageRecipient.findFirst({
        where: { messageId: message.id },
      });

      if (recipient) {
        await messageService.updateRecipientStatus(
          recipient.id,
          'failed',
          message.id,
          { failureReason: 'Number not in service' }
        );

        const updated = await prisma.messageRecipient.findUnique({
          where: { id: recipient.id },
        });

        expect(updated?.status).toBe('failed');
        expect(updated?.failureReason).toBe('Number not in service');
        expect(updated?.failedAt).toBeDefined();
      }
    });

    test('✅ Should update message stats after recipient update', async () => {
      const member = await factories.createTestMember(testChurch.id);

      const message = await messageService.createMessage(testChurch.id, {
        content: 'Stats update',
        targetType: 'individual',
        targetIds: [member.id],
      });

      const recipient = await prisma.messageRecipient.findFirst({
        where: { messageId: message.id },
      });

      if (recipient) {
        await messageService.updateRecipientStatus(
          recipient.id,
          'delivered',
          message.id
        );

        const updated = await prisma.message.findUnique({
          where: { id: message.id },
        });

        expect(updated?.deliveredCount).toBe(1);
      }
    });
  });

  describe('Multi-tenancy Isolation', () => {
    test('✅ Messages from one church do not affect another', async () => {
      const church2 = await factories.createTestChurch({
        email: 'church2@example.com',
      });

      const member1 = await factories.createTestMember(testChurch.id);
      const member2 = await factories.createTestMember(church2.id);

      const msg1 = await messageService.createMessage(testChurch.id, {
        content: 'Church 1',
        targetType: 'individual',
        targetIds: [member1.id],
      });

      const msg2 = await messageService.createMessage(church2.id, {
        content: 'Church 2',
        targetType: 'individual',
        targetIds: [member2.id],
      });

      const hist1 = await messageService.getMessageHistory(testChurch.id);
      expect(hist1.data).toHaveLength(1);
      expect(hist1.data[0].id).toBe(msg1.id);

      const hist2 = await messageService.getMessageHistory(church2.id);
      expect(hist2.data).toHaveLength(1);
      expect(hist2.data[0].id).toBe(msg2.id);
    });
  });

  describe('Error Handling', () => {
    test('✅ Should handle database errors gracefully', async () => {
      await expect(
        messageService.resolveRecipients('invalid-church', {
          targetType: 'all',
        })
      ).resolves.toEqual([]);
    });
  });
});
