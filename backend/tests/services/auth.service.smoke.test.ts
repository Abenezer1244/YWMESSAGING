/**
 * Authentication Service Smoke Test
 * Validates test infrastructure is working
 */

import { PrismaClient } from '@prisma/client';
import { getTestFactories } from '../helpers/test-factories.js';

describe('Auth Service - Smoke Tests (Infrastructure Validation)', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = global.testDb;
  });

  beforeEach(async () => {
    const factories = getTestFactories(prisma);
    await factories.cleanup();
  });

  afterAll(async () => {
    const factories = getTestFactories(prisma);
    await factories.cleanup();
  });

  test('✅ Test database connection works', async () => {
    expect(prisma).toBeDefined();
    expect(prisma.church).toBeDefined();
  });

  test('✅ Can create test church', async () => {
    const factories = getTestFactories(prisma);
    const church = await factories.createTestChurch({
      name: 'Test Church',
      email: 'test@church.com',
    });

    expect(church.id).toBeDefined();
    expect(church.name).toBe('Test Church');
    expect(church.email).toBe('test@church.com');
    expect(church.admins).toHaveLength(1);
    expect(church.admins[0].email).toBeDefined();
  });

  test('✅ Can create test member', async () => {
    const factories = getTestFactories(prisma);
    const church = await factories.createTestChurch();
    const member = await factories.createTestMember(church.id, {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+15551234567',
    });

    expect(member.id).toBeDefined();
    expect(member.firstName).toBe('John');
    expect(member.lastName).toBe('Doe');
    expect(member.phone).toBe('+15551234567');
  });

  test('✅ Can create message with recipients', async () => {
    const factories = getTestFactories(prisma);
    const church = await factories.createTestChurch();
    const message = await factories.createTestMessage(church.id, {
      content: 'Hello members!',
    });

    expect(message.id).toBeDefined();
    expect(message.churchId).toBe(church.id);
    expect(message.content).toBe('Hello members!');
    expect(message.status).toBe('pending');
  });

  test('✅ Cleanup removes test data', async () => {
    const factories = getTestFactories(prisma);
    await factories.createTestChurch();
    await factories.createTestChurch();

    let churchCount = await prisma.church.count();
    expect(churchCount).toBeGreaterThan(0);

    await factories.cleanup();
    churchCount = await prisma.church.count();
    expect(churchCount).toBe(0);
  });

  test('✅ Can create church with subscription', async () => {
    const factories = getTestFactories(prisma);
    const church = await factories.createTestChurchWithSubscription();

    expect(church.subscriptionStatus).toBe('active');
    expect(church.id).toBeDefined();
  });

  test('✅ Can create church with expired trial', async () => {
    const factories = getTestFactories(prisma);
    const church = await factories.createTestChurchWithExpiredTrial();

    expect(church.subscriptionStatus).toBe('trial');
    expect(church.trialEndsAt.getTime()).toBeLessThan(Date.now());
  });

  test('✅ Multi-tenancy isolation works', async () => {
    const factories = getTestFactories(prisma);
    const church1 = await factories.createTestChurch({ name: 'Church 1' });
    const church2 = await factories.createTestChurch({ name: 'Church 2' });

    const member1 = await factories.createTestMember(church1.id, { phone: '+15551111111' });
    const member2 = await factories.createTestMember(church2.id, { phone: '+15552222222' });

    expect(member1.id).toBeDefined();
    expect(member2.id).toBeDefined();
    expect(member1.id).not.toBe(member2.id);
    expect(member1.phone).toBe('+15551111111');
    expect(member2.phone).toBe('+15552222222');
  });

  test('✅ Can create conversation', async () => {
    const factories = getTestFactories(prisma);
    const church = await factories.createTestChurch();
    const member = await factories.createTestMember(church.id);
    const conversation = await factories.createTestConversation(church.id, member.id);

    expect(conversation.id).toBeDefined();
    expect(conversation.churchId).toBe(church.id);
    expect(conversation.memberId).toBe(member.id);
    expect(conversation.status).toBe('open');
  });
});
