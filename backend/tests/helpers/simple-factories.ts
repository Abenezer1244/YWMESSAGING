/**
 * Simplified Test Factories - Matched to actual Prisma schema
 * Creates test data that actually works with the current schema
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export class SimpleFactories {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a test church with admin
   */
  async createTestChurch(overrides: {
    name?: string;
    email?: string;
    stripeCustomerId?: string;
    telnyxPhoneNumber?: string;
    trialEndsAt?: Date;
    subscriptionStatus?: string;
  } = {}) {
    const email = overrides.email || faker.internet.email();
    const churchName = overrides.name || faker.company.name();
    const trialEndsAt = overrides.trialEndsAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return this.prisma.church.create({
      data: {
        name: churchName,
        email,
        stripeCustomerId: overrides.stripeCustomerId || `cus_test_${faker.string.alphanumeric(14)}`,
        telnyxPhoneNumber: overrides.telnyxPhoneNumber || '+15551234567',
        trialEndsAt,
        subscriptionStatus: overrides.subscriptionStatus || 'trial',
        admins: {
          create: {
            email: faker.internet.email(),
            passwordHash: await bcrypt.hash('TestPassword123!', 10),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          },
        },
      },
      include: {
        admins: true,
      },
    });
  }

  /**
   * Create test admin
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
        email: overrides.email || faker.internet.email(),
        passwordHash: await bcrypt.hash(password, 10),
        firstName: overrides.firstName || faker.person.firstName(),
        lastName: overrides.lastName || faker.person.lastName(),
      },
    });
  }

  /**
   * Clean up all test data
   */
  async cleanup() {
    try {
      await this.prisma.$executeRawUnsafe(
        'TRUNCATE TABLE "ConversationMessage" CASCADE'
      );
      await this.prisma.$executeRawUnsafe(
        'TRUNCATE TABLE "Conversation" CASCADE'
      );
      await this.prisma.$executeRawUnsafe(
        'TRUNCATE TABLE "MessageRecipient" CASCADE'
      );
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "Message" CASCADE');
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "Member" CASCADE');
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "Branch" CASCADE');
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "Admin" CASCADE');
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE "Church" CASCADE');
    } catch (error) {
      console.error('Cleanup error:', error);
      // Fallback to individual deletes if TRUNCATE fails
      try {
        await this.prisma.admin.deleteMany({});
        await this.prisma.church.deleteMany({});
      } catch (e) {
        console.error('Fallback cleanup error:', e);
      }
    }
  }
}

/**
 * Get factories instance
 */
export function getSimpleFactories(prisma: PrismaClient): SimpleFactories {
  return new SimpleFactories(prisma);
}
