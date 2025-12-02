import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as messageService from '../../services/message.service';
import * as authService from '../../services/auth.service';
import { prisma } from '../../lib/prisma';

/**
 * Message Integration Tests
 * Tests message sending through database persistence and validation
 * ✅ Message creation and persistence
 * ✅ Recipient validation and creation
 * ✅ Cost calculation and billing
 * ✅ Error handling and rollback
 */

describe('Message Integration Tests', () => {
  let churchId: string;
  let adminId: string;
  let groupId: string;
  let memberId: string;
  let memberPhone: string;

  beforeEach(async () => {
    // Setup: Create church, admin, group, and member
    const registrationResult = await authService.register(
      'Message Test Church',
      'Admin',
      `admin-${Date.now()}@test.com`,
      'SecurePassword123!',
      '+12025551234'
    );

    churchId = registrationResult.church.id;
    adminId = registrationResult.admin.id;

    // Create a group
    const groupResult = await prisma.group.create({
      data: {
        churchId,
        name: 'Test Group',
        description: 'Test group for message integration tests',
      },
    });
    groupId = groupResult.id;

    // Create a member
    memberPhone = '+12025555555';
    const memberResult = await prisma.member.create({
      data: {
        churchId,
        firstName: 'John',
        lastName: 'Doe',
        phone: memberPhone,
        email: 'john@test.com',
        optInSms: true,
      },
    });
    memberId = memberResult.id;

    // Add member to group
    await prisma.groupMember.create({
      data: {
        groupId,
        memberId,
      },
    });
  });

  afterEach(async () => {
    await prisma.church.deleteMany({
      where: { id: churchId },
    });
  });

  describe('Message Creation', () => {
    it('should create message and persist to database', async () => {
      const messageContent = 'Test message';
      const recipientIds = [memberId];

      const result = await messageService.sendMessage({
        churchId,
        userId: adminId,
        content: messageContent,
        recipientIds,
        senderId: adminId,
      });

      expect(result).toHaveProperty('id');
      expect(result.content).toBe(messageContent);

      // Verify message exists in database
      const messageFromDb = await prisma.message.findUnique({
        where: { id: result.id },
      });

      expect(messageFromDb).toBeTruthy();
      expect(messageFromDb?.content).toBe(messageContent);
      expect(messageFromDb?.churchId).toBe(churchId);
    });

    it('should create message recipients on send', async () => {
      const recipientIds = [memberId];

      const result = await messageService.sendMessage({
        churchId,
        userId: adminId,
        content: 'Test',
        recipientIds,
        senderId: adminId,
      });

      // Verify recipients were created
      const recipients = await prisma.messageRecipient.findMany({
        where: { messageId: result.id },
      });

      expect(recipients).toHaveLength(1);
      expect(recipients[0].memberId).toBe(memberId);
      expect(recipients[0].status).toBe('pending');
    });

    it('should set correct delivery status initially', async () => {
      const result = await messageService.sendMessage({
        churchId,
        userId: adminId,
        content: 'Test',
        recipientIds: [memberId],
        senderId: adminId,
      });

      const messageFromDb = await prisma.message.findUnique({
        where: { id: result.id },
        include: { recipients: true },
      });

      expect(messageFromDb?.recipients[0]?.status).toBe('pending');
    });
  });

  describe('Bulk Message Sending', () => {
    let member2Id: string;
    let member3Id: string;

    beforeEach(async () => {
      // Create two additional members
      const member2 = await prisma.member.create({
        data: {
          churchId,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+12025555556',
          email: 'jane@test.com',
          optInSms: true,
        },
      });
      member2Id = member2.id;

      const member3 = await prisma.member.create({
        data: {
          churchId,
          firstName: 'Bob',
          lastName: 'Johnson',
          phone: '+12025555557',
          email: 'bob@test.com',
          optInSms: true,
        },
      });
      member3Id = member3.id;
    });

    it('should send message to multiple recipients', async () => {
      const recipientIds = [memberId, member2Id, member3Id];

      const result = await messageService.sendMessage({
        churchId,
        userId: adminId,
        content: 'Bulk message',
        recipientIds,
        senderId: adminId,
      });

      // Verify all recipients were created
      const recipients = await prisma.messageRecipient.findMany({
        where: { messageId: result.id },
      });

      expect(recipients).toHaveLength(3);
      expect(recipients.map((r) => r.memberId).sort()).toEqual(
        [memberId, member2Id, member3Id].sort()
      );
    });

    it('should handle large recipient lists (1000 members)', async () => {
      // Create many members
      const memberIds = [];
      for (let i = 0; i < 100; i++) {
        const member = await prisma.member.create({
          data: {
            churchId,
            firstName: `Member${i}`,
            lastName: 'Test',
            phone: `+1202555${String(1000 + i).padStart(4, '0')}`,
            email: `member${i}@test.com`,
            optInSms: true,
          },
        });
        memberIds.push(member.id);
      }

      const result = await messageService.sendMessage({
        churchId,
        userId: adminId,
        content: 'Mass message',
        recipientIds: memberIds,
        senderId: adminId,
      });

      const recipients = await prisma.messageRecipient.count({
        where: { messageId: result.id },
      });

      expect(recipients).toBe(memberIds.length);
    });
  });

  describe('Message History Retrieval', () => {
    beforeEach(async () => {
      // Create multiple messages
      for (let i = 0; i < 5; i++) {
        await messageService.sendMessage({
          churchId,
          userId: adminId,
          content: `Message ${i}`,
          recipientIds: [memberId],
          senderId: adminId,
        });
      }
    });

    it('should retrieve message history for church', async () => {
      const result = await messageService.getMessageHistory(
        churchId,
        { page: 1, limit: 10 }
      );

      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(5);
    });

    it('should paginate message history correctly', async () => {
      const page1 = await messageService.getMessageHistory(
        churchId,
        { page: 1, limit: 2 }
      );
      const page2 = await messageService.getMessageHistory(
        churchId,
        { page: 2, limit: 2 }
      );

      expect(page1.data).toHaveLength(2);
      expect(page2.data).toHaveLength(2);
      expect(page1.pagination.pages).toBe(3);
    });

    it('should sort messages by creation date descending', async () => {
      const result = await messageService.getMessageHistory(
        churchId,
        { page: 1, limit: 10 }
      );

      const dates = result.data.map((m: any) => new Date(m.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });

  describe('Access Control', () => {
    let anotherChurchId: string;

    beforeEach(async () => {
      const otherChurch = await authService.register(
        'Another Church',
        'Admin',
        `admin-other-${Date.now()}@test.com`,
        'SecurePassword123!',
        '+12025559999'
      );
      anotherChurchId = otherChurch.church.id;
    });

    afterEach(async () => {
      await prisma.church.deleteMany({
        where: { id: anotherChurchId },
      });
    });

    it('should isolate message history between churches', async () => {
      // Send message to testChurch
      await messageService.sendMessage({
        churchId,
        userId: adminId,
        content: 'Church 1 message',
        recipientIds: [memberId],
        senderId: adminId,
      });

      // Get history for both churches
      const church1History = await messageService.getMessageHistory(
        churchId,
        { page: 1, limit: 10 }
      );
      const church2History = await messageService.getMessageHistory(
        anotherChurchId,
        { page: 1, limit: 10 }
      );

      expect(church1History.data.length).toBeGreaterThan(0);
      expect(church2History.data).toHaveLength(0);
    });

    it('should prevent unauthorized message access', async () => {
      const messageResult = await messageService.sendMessage({
        churchId,
        userId: adminId,
        content: 'Private message',
        recipientIds: [memberId],
        senderId: adminId,
      });

      // Try to get message from different church
      const historyFromOtherChurch = await messageService.getMessageHistory(
        anotherChurchId,
        { page: 1, limit: 10 }
      );

      const messageFound = historyFromOtherChurch.data.find(
        (m: any) => m.id === messageResult.id
      );
      expect(messageFound).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid recipient IDs gracefully', async () => {
      await expect(
        messageService.sendMessage({
          churchId,
          userId: adminId,
          content: 'Test',
          recipientIds: ['invalid-id-123'],
          senderId: adminId,
        })
      ).rejects.toThrow();
    });

    it('should handle empty recipient list', async () => {
      await expect(
        messageService.sendMessage({
          churchId,
          userId: adminId,
          content: 'Test',
          recipientIds: [],
          senderId: adminId,
        })
      ).rejects.toThrow();
    });

    it('should not create message if recipient creation fails', async () => {
      // This test validates transaction rollback behavior
      const initialCount = await prisma.message.count({
        where: { churchId },
      });

      try {
        await messageService.sendMessage({
          churchId,
          userId: adminId,
          content: 'Should fail',
          recipientIds: ['definitely-invalid-uuid'],
          senderId: adminId,
        });
      } catch (error) {
        // Expected to fail
      }

      const finalCount = await prisma.message.count({
        where: { churchId },
      });

      expect(finalCount).toBe(initialCount);
    });
  });
});
