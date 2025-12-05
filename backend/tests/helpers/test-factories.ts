/**
 * Test Data Factories
 * Creates consistent test data for unit and integration tests
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Simple utility to generate test data without faker dependency
function randomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

function randomEmail(): string {
  return `test-${randomString()}@example.com`;
}

function randomPhone(): string {
  return '+1555' + Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
}

function randomName(): string {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Anderson'];
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

export class TestFactories {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a test church
   */
  async createTestChurch(overrides: {
    name?: string;
    email?: string;
    stripeCustomerId?: string;
    telnyxPhoneNumber?: string;
    trialEndsAt?: Date;
    subscriptionStatus?: string;
  } = {}) {
    const email = overrides.email || randomEmail();
    const churchName = overrides.name || `Test Church ${randomString(4)}`;
    const trialEndsAt = overrides.trialEndsAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return this.prisma.church.create({
      data: {
        name: churchName,
        email,
        stripeCustomerId: overrides.stripeCustomerId || `cus_test_${randomString(14)}`,
        telnyxPhoneNumber: overrides.telnyxPhoneNumber || '+15551234567',
        trialEndsAt,
        subscriptionStatus: overrides.subscriptionStatus || 'trial',
        admins: {
          create: {
            email: randomEmail(),
            passwordHash: await bcrypt.hash('TestPassword123!', 10),
            firstName: randomName(),
            lastName: randomName(),
          },
        },
      },
      include: {
        admins: true,
      },
    });
  }

  /**
   * Create a test church with active subscription
   */
  async createTestChurchWithSubscription(overrides: {
    subscriptionTier?: string;
  } = {}) {
    return this.createTestChurch({
      subscriptionStatus: 'active',
      trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Trial expired
      ...overrides,
    });
  }

  /**
   * Create a test church with expired trial
   */
  async createTestChurchWithExpiredTrial() {
    return this.createTestChurch({
      subscriptionStatus: 'trial', // Still trial status but expired
      trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Trial expired yesterday
    });
  }

  /**
   * Create a test admin user
   */
  async createTestAdmin(churchId: string, overrides: {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  } = {}) {
    const password = overrides.password || 'TestPassword123!';

    return this.prisma.admin.create({
      data: {
        churchId,
        email: overrides.email || randomEmail(),
        passwordHash: await bcrypt.hash(password, 10),
        firstName: overrides.firstName || randomName(),
        lastName: overrides.lastName || randomName(),
      },
    });
  }

  /**
   * Create a test member
   * Note: Members don't have churchId directly. They are linked to churches through groups/conversations.
   */
  async createTestMember(churchId: string, overrides: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  } = {}) {
    return this.prisma.member.create({
      data: {
        firstName: overrides.firstName || randomName(),
        lastName: overrides.lastName || randomName(),
        phone: overrides.phone || randomPhone(),
        optInSms: true,
      },
    });
  }

  /**
   * Create a test message with recipients
   */
  async createTestMessage(churchId: string, overrides: {
    content?: string;
    status?: string;
    targetType?: string;
    memberIds?: string[];
  } = {}) {
    const memberIds = overrides.memberIds || [];

    // Create test members if none provided
    let recipientIds = memberIds;
    if (recipientIds.length === 0) {
      const member = await this.createTestMember(churchId);
      recipientIds = [member.id];
    }

    // Create message with targetType required
    const message = await this.prisma.message.create({
      data: {
        churchId,
        content: overrides.content || 'Test message',
        status: overrides.status || 'pending',
        targetType: overrides.targetType || 'individual',
        targetIds: JSON.stringify(recipientIds),
        totalRecipients: recipientIds.length,
      },
    });

    // Create message recipients
    await Promise.all(
      recipientIds.map(memberId =>
        this.prisma.messageRecipient.create({
          data: {
            messageId: message.id,
            memberId,
            status: 'pending',
          },
        })
      )
    );

    // Return message with recipients (guaranteed to exist since we just created it)
    const fullMessage = await this.prisma.message.findUnique({
      where: { id: message.id },
      include: { recipients: true },
    });

    if (!fullMessage) {
      throw new Error(`Failed to retrieve message ${message.id} after creation`);
    }

    return fullMessage;
  }

  /**
   * Create a test conversation
   */
  async createTestConversation(churchId: string, memberId: string, overrides: {
    status?: string;
  } = {}) {
    return this.prisma.conversation.create({
      data: {
        churchId,
        memberId,
        status: overrides.status || 'open',
      },
    });
  }

  /**
   * Create a test conversation message
   */
  async createTestConversationMessage(
    conversationId: string,
    overrides: {
      content?: string;
      direction?: string; // 'inbound' (from member) or 'outbound' (from staff)
      memberId?: string;
    } = {}
  ) {
    // Get conversation to find memberId if not provided
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return this.prisma.conversationMessage.create({
      data: {
        conversationId,
        memberId: overrides.memberId || conversation.memberId,
        content: overrides.content || 'Test conversation message',
        direction: overrides.direction || 'inbound',
      },
    });
  }

  /**
   * Clean up test data - delete all records
   */
  async cleanup() {
    try {
      // Order matters due to foreign key constraints
      await this.prisma.conversationMessage.deleteMany({});
      await this.prisma.conversation.deleteMany({});
      await this.prisma.messageRecipient.deleteMany({});
      await this.prisma.message.deleteMany({});
      await this.prisma.messageTemplate.deleteMany({});
      await this.prisma.member.deleteMany({});
      await this.prisma.branch.deleteMany({});
      await this.prisma.admin.deleteMany({});
      await this.prisma.church.deleteMany({});
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}

/**
 * Factory instance for tests
 */
let factories: TestFactories;

/**
 * Get test factories instance
 */
export function getTestFactories(prisma: PrismaClient): TestFactories {
  if (!factories) {
    factories = new TestFactories(prisma);
  }
  return factories;
}
