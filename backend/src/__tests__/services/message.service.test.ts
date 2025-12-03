import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as messageService from '../../services/message.service.js';
import { prisma } from '../../lib/prisma.js';

// Mock Prisma
jest.mock('../../lib/prisma.js');

describe('Message Service - Unit Tests', () => {
  const churchId = 'church-123';
  const mockMember = {
    id: 'member-1',
    phone: '+1234567890',
    optInSms: true,
  };

  const mockGroup = {
    id: 'group-1',
    churchId,
    name: 'Sunday School',
  };

  const mockBranch = {
    id: 'branch-1',
    churchId,
    name: 'Main Campus',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveRecipients', () => {
    it('should resolve individual recipient by member ID', async () => {
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);

      const result = await messageService.resolveRecipients(churchId, {
        targetType: 'individual',
        targetIds: ['member-1'],
      });

      expect(result).toEqual([{ id: mockMember.id, phone: mockMember.phone }]);
      expect(prisma.member.findUnique).toHaveBeenCalled();
    });

    it('should skip opted-out members', async () => {
      const optedOutMember = { ...mockMember, optInSms: false };
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(optedOutMember);

      const result = await messageService.resolveRecipients(churchId, {
        targetType: 'individual',
        targetIds: ['member-1'],
      });

      expect(result).toEqual([]);
    });

    it('should resolve group recipients', async () => {
      const mockGroupMembers = [
        {
          member: { id: 'member-1', phone: '+1111111111', optInSms: true },
        },
        {
          member: { id: 'member-2', phone: '+2222222222', optInSms: true },
        },
      ];

      (prisma.groupMember.findMany as jest.Mock).mockResolvedValue(mockGroupMembers);

      const result = await messageService.resolveRecipients(churchId, {
        targetType: 'groups',
        targetIds: ['group-1'],
      });

      expect(result.length).toBe(2);
      expect(result).toContainEqual({ id: 'member-1', phone: '+1111111111' });
      expect(result).toContainEqual({ id: 'member-2', phone: '+2222222222' });
    });

    it('should resolve branch recipients', async () => {
      const mockBranchMembers = [
        {
          member: { id: 'member-1', phone: '+1111111111', optInSms: true },
        },
        {
          member: { id: 'member-2', phone: '+2222222222', optInSms: true },
        },
      ];

      (prisma.groupMember.findMany as jest.Mock).mockResolvedValue(mockBranchMembers);

      const result = await messageService.resolveRecipients(churchId, {
        targetType: 'branches',
        targetIds: ['branch-1'],
      });

      expect(result.length).toBe(2);
      expect(prisma.groupMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            group: expect.objectContaining({
              branchId: { in: ['branch-1'] },
            }),
          }),
        })
      );
    });

    it('should resolve all church members', async () => {
      const mockAllMembers = [
        { id: 'member-1', phone: '+1111111111' },
        { id: 'member-2', phone: '+2222222222' },
        { id: 'member-3', phone: '+3333333333' },
      ];

      (prisma.member.findMany as jest.Mock).mockResolvedValue(mockAllMembers);

      const result = await messageService.resolveRecipients(churchId, {
        targetType: 'all',
      });

      expect(result.length).toBe(3);
      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            optInSms: true,
          }),
        })
      );
    });

    it('should deduplicate phone numbers across groups', async () => {
      const mockGroupMembers = [
        { member: { id: 'member-1', phone: '+1111111111', optInSms: true } },
        { member: { id: 'member-1', phone: '+1111111111', optInSms: true } }, // Duplicate
      ];

      (prisma.groupMember.findMany as jest.Mock).mockResolvedValue(mockGroupMembers);

      const result = await messageService.resolveRecipients(churchId, {
        targetType: 'groups',
        targetIds: ['group-1'],
      });

      expect(result.length).toBe(1); // Should deduplicate
    });

    it('should throw error on database failure', async () => {
      (prisma.member.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        messageService.resolveRecipients(churchId, {
          targetType: 'individual',
          targetIds: ['member-1'],
        })
      ).rejects.toThrow('Failed to resolve recipients');
    });
  });
});
