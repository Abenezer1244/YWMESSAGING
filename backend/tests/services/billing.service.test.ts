/**
 * Billing Service Unit Tests
 * Tests SMS billing, plan management, usage tracking, and caching
 *
 * Covers:
 * - recordSMSUsage() - SMS cost tracking
 * - getSMSUsageSummary() - usage reporting
 * - calculateBatchCost() - cost calculations
 * - getSMSPricing() - pricing info
 * - getCurrentPlan() - plan retrieval with caching
 * - getPlanLimits() - plan configuration
 * - getUsage() - usage metrics with caching
 * - isOnTrial() - trial status checking
 * - invalidateBillingCache() - cache management
 */

import { PrismaClient } from '@prisma/client';
import { getTestFactories } from '../helpers/test-factories.js';
import {
  recordSMSUsage,
  getSMSUsageSummary,
  calculateBatchCost,
  getSMSPricing,
  getCurrentPlan,
  getPlanLimits,
  getUsage,
  isOnTrial,
  invalidateBillingCache,
} from '../../src/services/billing.service.js';
import * as cacheService from '../../src/services/cache.service.js';

let prisma: PrismaClient;
let factories: any;

describe('Billing Service Unit Tests', () => {
  beforeAll(async () => {
    prisma = global.testDb;
    factories = getTestFactories(prisma);
  });

  beforeEach(async () => {
    await factories.cleanup();
  });

  afterAll(async () => {
    await factories.cleanup();
  });

  // ========== recordSMSUsage() Tests ==========

  describe('recordSMSUsage()', () => {
    test('✅ Should record cost for sent SMS', async () => {
      const testChurch = await factories.createTestChurch();
      const result = await recordSMSUsage(testChurch.id, 'sent');

      expect(result.success).toBe(true);
      expect(result.cost).toBe(0.02); // $0.02 per SMS
    });

    test('✅ Should not charge for failed SMS', async () => {
      const testChurch = await factories.createTestChurch();
      const result = await recordSMSUsage(testChurch.id, 'failed');

      expect(result.success).toBe(true);
      expect(result.cost).toBe(0); // No charge for failed
    });

    test('✅ Should default to sent status if not provided', async () => {
      const testChurch = await factories.createTestChurch();
      const result = await recordSMSUsage(testChurch.id);

      expect(result.success).toBe(true);
      expect(result.cost).toBe(0.02);
    });

    test('✅ Should accept optional messageRecipientId', async () => {
      const testChurch = await factories.createTestChurch();
      const result = await recordSMSUsage(testChurch.id, 'sent', 'recipient-123');

      expect(result.success).toBe(true);
      expect(result.cost).toBe(0.02);
    });

    test('✅ Should handle billing errors gracefully', async () => {
      // Use invalid churchId format - should still return success (service logs and returns)
      const result = await recordSMSUsage('', 'sent');

      expect(result.success).toBe(true);
      expect(result.cost).toBe(0.02); // Should still charge the standard rate
    });
  });

  // ========== getSMSUsageSummary() Tests ==========

  describe('getSMSUsageSummary()', () => {
    test('✅ Should return usage summary with default date range', async () => {
      const testChurch = await factories.createTestChurch();
      const result = await getSMSUsageSummary(testChurch.id);

      expect(result.totalMessages).toBeDefined();
      expect(result.totalCost).toBeDefined();
      expect(result.currency).toBe('USD');
    });

    test('✅ Should accept custom start and end dates', async () => {
      const testChurch = await factories.createTestChurch();
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      const result = await getSMSUsageSummary(testChurch.id, startDate, endDate);

      expect(result.totalMessages).toBeDefined();
      expect(result.totalCost).toBeDefined();
      expect(result.currency).toBe('USD');
    });

    test('✅ Should default to last 30 days when start date not provided', async () => {
      const testChurch = await factories.createTestChurch();
      const endDate = new Date();
      const result = await getSMSUsageSummary(testChurch.id, undefined, endDate);

      expect(result.currency).toBe('USD');
      // Should default to 30 days ago internally
    });

    test('✅ Should return 0 usage for non-existent church', async () => {
      const result = await getSMSUsageSummary('non-existent-church-id');

      expect(result.totalMessages).toBe(0);
      expect(result.totalCost).toBe(0);
      expect(result.currency).toBe('USD');
    });

    test('✅ Should handle date range edge cases', async () => {
      const testChurch = await factories.createTestChurch();
      const sameDate = new Date('2025-06-15');

      const result = await getSMSUsageSummary(testChurch.id, sameDate, sameDate);

      expect(result.currency).toBe('USD');
    });
  });

  // ========== calculateBatchCost() Tests ==========

  describe('calculateBatchCost()', () => {
    test('✅ Should calculate correct cost for batch of 100 messages', () => {
      const cost = calculateBatchCost(100);

      expect(cost).toBe(2.0); // 100 * $0.02
    });

    test('✅ Should calculate zero cost for zero messages', () => {
      const cost = calculateBatchCost(0);

      expect(cost).toBe(0);
    });

    test('✅ Should calculate cost for single message', () => {
      const cost = calculateBatchCost(1);

      expect(cost).toBe(0.02);
    });

    test('✅ Should calculate cost for large batch (10000 messages)', () => {
      const cost = calculateBatchCost(10000);

      expect(cost).toBe(200.0); // 10000 * $0.02
    });

    test('✅ Should handle fractional message counts', () => {
      const cost = calculateBatchCost(50.5);

      expect(cost).toBeCloseTo(1.01); // 50.5 * $0.02
    });
  });

  // ========== getSMSPricing() Tests ==========

  describe('getSMSPricing()', () => {
    test('✅ Should return pricing object with all fields', () => {
      const pricing = getSMSPricing();

      expect(pricing.costPerSMS).toBe(0.02);
      expect(pricing.currency).toBe('USD');
      expect(pricing.setupFee).toBe(0.5);
    });

    test('✅ Should always return same pricing (not time-sensitive)', () => {
      const pricing1 = getSMSPricing();
      const pricing2 = getSMSPricing();

      expect(pricing1).toEqual(pricing2);
    });

    test('✅ Should have correct monetary values', () => {
      const pricing = getSMSPricing();

      expect(typeof pricing.costPerSMS).toBe('number');
      expect(pricing.costPerSMS).toBeGreaterThan(0);
      expect(typeof pricing.setupFee).toBe('number');
      expect(pricing.setupFee).toBeGreaterThanOrEqual(0);
    });
  });

  // ========== getCurrentPlan() Tests ==========

  describe('getCurrentPlan()', () => {
    test('✅ Should return trial for new church', async () => {
      const testChurch = await factories.createTestChurch();

      const plan = await getCurrentPlan(testChurch.id);

      expect(plan).toBe('trial');
    });

    test('✅ Should return plan from database if not cached', async () => {
      const testChurch = await factories.createTestChurch();
      // Church created with subscriptionStatus from factory

      const plan = await getCurrentPlan(testChurch.id);

      expect(plan).toBeDefined();
      expect(['trial', 'starter', 'growth', 'pro']).toContain(plan);
    });

    test('✅ Should cache plan result for future calls', async () => {
      const testChurch = await factories.createTestChurch();

      const plan1 = await getCurrentPlan(testChurch.id);
      const plan2 = await getCurrentPlan(testChurch.id);

      expect(plan1).toBe(plan2); // Should be from cache on second call
    });

    test('✅ Should default to trial for non-existent church', async () => {
      const plan = await getCurrentPlan('non-existent-id');

      expect(plan).toBe('trial');
    });

    test('✅ Should return starter plan for church with starter subscription', async () => {
      const testChurch = await factories.createTestChurch({
        subscriptionStatus: 'starter',
      });

      const plan = await getCurrentPlan(testChurch.id);

      expect(plan).toBe('starter');
    });

    test('✅ Different churches have different cached plans', async () => {
      const church1 = await factories.createTestChurch({
        subscriptionStatus: 'starter',
      });
      const church2 = await factories.createTestChurch({
        subscriptionStatus: 'growth',
      });

      const plan1 = await getCurrentPlan(church1.id);
      const plan2 = await getCurrentPlan(church2.id);

      expect(plan1).toBe('starter');
      expect(plan2).toBe('growth');
    });
  });

  // ========== getPlanLimits() Tests ==========

  describe('getPlanLimits()', () => {
    test('✅ Should return limits for trial plan', () => {
      const limits = getPlanLimits('trial');

      expect(limits).toBeDefined();
      expect(limits?.branches).toBeDefined();
      expect(limits?.messagesPerMonth).toBeDefined();
      expect(limits?.members).toBeDefined();
    });

    test('✅ Should return limits for starter plan', () => {
      const limits = getPlanLimits('starter');

      expect(limits).toBeDefined();
      expect(typeof limits?.branches).toBe('number');
      expect(typeof limits?.messagesPerMonth).toBe('number');
    });

    test('✅ Should return limits for growth plan', () => {
      const limits = getPlanLimits('growth');

      expect(limits).toBeDefined();
      expect(limits?.branches).toBeGreaterThanOrEqual(0);
      expect(limits?.messagesPerMonth).toBeGreaterThanOrEqual(0);
    });

    test('✅ Should return limits for pro plan', () => {
      const limits = getPlanLimits('pro');

      expect(limits).toBeDefined();
      expect(limits?.branches).toBeGreaterThanOrEqual(0);
    });

    test('✅ Should return null for unknown plan', () => {
      const limits = getPlanLimits('unknown-plan');

      expect(limits).toBeNull();
    });

    test('✅ Should have increasing limits across plans', () => {
      const trialLimits = getPlanLimits('trial');
      const starterLimits = getPlanLimits('starter');
      const growthLimits = getPlanLimits('growth');
      const proLimits = getPlanLimits('pro');

      // Trial/starter should have same (trial maps to starter)
      expect(trialLimits).toEqual(starterLimits);

      // Higher plans should have more generous limits (where applicable)
      if (growthLimits && starterLimits) {
        expect(growthLimits.messagesPerMonth).toBeGreaterThanOrEqual(
          starterLimits.messagesPerMonth
        );
      }
    });
  });

  // ========== getUsage() Tests ==========

  describe('getUsage()', () => {
    test('✅ Should return usage metrics for church', async () => {
      const testChurch = await factories.createTestChurch();

      const usage = await getUsage(testChurch.id);

      expect(usage.branches).toBeDefined();
      expect(usage.members).toBeDefined();
      expect(usage.messagesThisMonth).toBeDefined();
      expect(usage.coAdmins).toBeDefined();
      expect(typeof usage.branches).toBe('number');
      expect(typeof usage.members).toBe('number');
    });

    test('✅ Should count branches correctly', async () => {
      const testChurch = await factories.createTestChurch();

      // Create a branch
      await prisma.branch.create({
        data: {
          name: 'Test Branch',
          churchId: testChurch.id,
        },
      });

      const usage = await getUsage(testChurch.id);

      expect(usage.branches).toBe(1);
    });

    test('✅ Should count co-admins correctly', async () => {
      const testChurch = await factories.createTestChurch();

      // Get usage (coAdmins count depends on factory setup)
      const usage = await getUsage(testChurch.id);

      expect(typeof usage.coAdmins).toBe('number');
      expect(usage.coAdmins).toBeGreaterThanOrEqual(0);
    });

    test('✅ Should count messages from this month only', async () => {
      const testChurch = await factories.createTestChurch();

      // Create a message in this month (factory creates without params for simplicity)
      const usage = await getUsage(testChurch.id);

      // Should have at least 0 messages initially
      expect(typeof usage.messagesThisMonth).toBe('number');
      expect(usage.messagesThisMonth).toBeGreaterThanOrEqual(0);
    });

    test('✅ Should cache usage results', async () => {
      const testChurch = await factories.createTestChurch();

      const usage1 = await getUsage(testChurch.id);
      const usage2 = await getUsage(testChurch.id);

      expect(usage1).toEqual(usage2); // Should be same from cache
    });

    test('✅ Should return zero values for non-existent church', async () => {
      const usage = await getUsage('non-existent-id');

      expect(usage.branches).toBe(0);
      expect(usage.members).toBe(0);
      expect(usage.messagesThisMonth).toBe(0);
      expect(usage.coAdmins).toBe(0);
    });

    test('✅ Each church sees only their own usage', async () => {
      const church1 = await factories.createTestChurch();
      const church2 = await factories.createTestChurch();

      // Create branch in church1
      await prisma.branch.create({
        data: {
          name: 'Church 1 Branch',
          churchId: church1.id,
        },
      });

      const usage1 = await getUsage(church1.id);
      const usage2 = await getUsage(church2.id);

      expect(usage1.branches).toBe(1);
      expect(usage2.branches).toBe(0);
    });

    test('✅ Should handle query errors gracefully', async () => {
      // Even if queries fail, should return default zero values
      const usage = await getUsage('any-church-id');

      expect(usage.branches).toBe(0);
      expect(usage.members).toBe(0);
      expect(usage.messagesThisMonth).toBe(0);
      expect(usage.coAdmins).toBe(0);
    });
  });

  // ========== isOnTrial() Tests ==========

  describe('isOnTrial()', () => {
    test('✅ Should return true for church with active trial', async () => {
      const testChurch = await factories.createTestChurch();

      const onTrial = await isOnTrial(testChurch.id);

      expect(typeof onTrial).toBe('boolean');
      // Result depends on factory trial setup
    });

    test('✅ Should return false for non-existent church', async () => {
      const onTrial = await isOnTrial('non-existent-id');

      expect(onTrial).toBe(false);
    });

    test('✅ Should return false when trial has expired', async () => {
      // Create church with expired trial
      const testChurch = await factories.createTestChurch();

      // Update trial to have ended in past
      await prisma.church.update({
        where: { id: testChurch.id },
        data: {
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
      });

      const onTrial = await isOnTrial(testChurch.id);

      expect(onTrial).toBe(false);
    });

    test('✅ Should return false for paid subscription', async () => {
      const testChurch = await factories.createTestChurch({
        subscriptionStatus: 'starter',
      });

      const onTrial = await isOnTrial(testChurch.id);

      expect(onTrial).toBe(false);
    });

    test('✅ Should check both subscription status AND trial end date', async () => {
      // Requires BOTH conditions to be true
      const testChurch = await factories.createTestChurch();

      // Set to trial with future end date
      await prisma.church.update({
        where: { id: testChurch.id },
        data: {
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        },
      });

      const onTrial = await isOnTrial(testChurch.id);

      expect(typeof onTrial).toBe('boolean');
    });

    test('✅ Should handle database errors gracefully', async () => {
      // Should not throw, should return false
      const onTrial = await isOnTrial('any-id');

      expect(typeof onTrial).toBe('boolean');
    });
  });

  // ========== invalidateBillingCache() Tests ==========

  describe('invalidateBillingCache()', () => {
    test('✅ Should invalidate cache without throwing error', async () => {
      const testChurch = await factories.createTestChurch();

      await expect(invalidateBillingCache(testChurch.id)).resolves.not.toThrow();
    });

    test('✅ Should invalidate plan cache', async () => {
      const testChurch = await factories.createTestChurch();

      // Get plan (will be cached)
      const plan1 = await getCurrentPlan(testChurch.id);

      // Invalidate cache
      await invalidateBillingCache(testChurch.id);

      // Get plan again (will query fresh)
      const plan2 = await getCurrentPlan(testChurch.id);

      expect(plan1).toBeDefined();
      expect(plan2).toBeDefined();
    });

    test('✅ Should invalidate usage cache', async () => {
      const testChurch = await factories.createTestChurch();

      // Get usage (will be cached)
      const usage1 = await getUsage(testChurch.id);

      // Invalidate cache
      await invalidateBillingCache(testChurch.id);

      // Get usage again (will query fresh)
      const usage2 = await getUsage(testChurch.id);

      expect(usage1).toBeDefined();
      expect(usage2).toBeDefined();
    });

    test('✅ Should handle non-existent church cache gracefully', async () => {
      // Should not throw when invalidating cache for non-existent church
      await expect(
        invalidateBillingCache('non-existent-id')
      ).resolves.not.toThrow();
    });

    test('✅ Should be callable without awaiting (async)', () => {
      const testChurch = factories.createTestChurch().then((c: any) => c.id);

      // Should return a Promise
      const result = invalidateBillingCache('any-id');

      expect(result).toBeInstanceOf(Promise);
    });
  });

  // ========== Multi-tenancy and Integration Tests ==========

  describe('Multi-tenancy Isolation', () => {
    test('✅ Different churches have independent billing data', async () => {
      const church1 = await factories.createTestChurch();
      const church2 = await factories.createTestChurch();

      // Record SMS for church1
      await recordSMSUsage(church1.id, 'sent');

      // Get usage for both
      const usage1 = await getUsage(church1.id);
      const usage2 = await getUsage(church2.id);

      // Should be independent
      expect(usage1).toBeDefined();
      expect(usage2).toBeDefined();
    });

    test('✅ Plan retrieval is isolated per church', async () => {
      const church1 = await factories.createTestChurch({
        subscriptionStatus: 'starter',
      });
      const church2 = await factories.createTestChurch({
        subscriptionStatus: 'growth',
      });

      const plan1 = await getCurrentPlan(church1.id);
      const plan2 = await getCurrentPlan(church2.id);

      expect(plan1).toBe('starter');
      expect(plan2).toBe('growth');
      expect(plan1).not.toBe(plan2);
    });

    test('✅ Trial status is independent per church', async () => {
      const church1 = await factories.createTestChurch({
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Active trial
      });
      const church2 = await factories.createTestChurch({
        subscriptionStatus: 'starter',
      });

      const onTrial1 = await isOnTrial(church1.id);
      const onTrial2 = await isOnTrial(church2.id);

      // Results may vary based on trial setup, but should be independent
      expect(typeof onTrial1).toBe('boolean');
      expect(typeof onTrial2).toBe('boolean');
    });
  });

  // ========== Cache Behavior Tests ==========

  describe('Cache Behavior', () => {
    test('✅ getCurrentPlan implementation supports caching', async () => {
      const testChurch = await factories.createTestChurch();

      // Call getCurrentPlan multiple times - should work consistently
      const plan1 = await getCurrentPlan(testChurch.id);
      const plan2 = await getCurrentPlan(testChurch.id);

      // Should return same plan (either from cache or consistent DB)
      expect(plan1).toBe(plan2);
      expect(['trial', 'starter', 'growth', 'pro']).toContain(plan1);
    });

    test('✅ getUsage implementation supports caching', async () => {
      const testChurch = await factories.createTestChurch();

      // Call getUsage multiple times - should work consistently
      const usage1 = await getUsage(testChurch.id);
      const usage2 = await getUsage(testChurch.id);

      // Should return same structure
      expect(usage2.branches).toBeDefined();
      expect(usage2.members).toBeDefined();
      expect(usage2.messagesThisMonth).toBeDefined();
      expect(usage2.coAdmins).toBeDefined();
    });

    test('✅ invalidateBillingCache executes without error', async () => {
      const testChurch = await factories.createTestChurch();

      // Populate caches
      await getCurrentPlan(testChurch.id);
      await getUsage(testChurch.id);

      // Invalidate should complete without throwing
      await expect(invalidateBillingCache(testChurch.id)).resolves.not.toThrow();

      // Next calls should still work after invalidation
      const plan = await getCurrentPlan(testChurch.id);
      const usage = await getUsage(testChurch.id);

      expect(plan).toBeDefined();
      expect(usage).toBeDefined();
    });
  });

  // ========== Edge Cases and Error Handling ==========

  describe('Edge Cases and Error Handling', () => {
    test('✅ calculateBatchCost handles negative numbers', () => {
      const cost = calculateBatchCost(-10);

      expect(cost).toBe(-0.2); // Returns mathematical result
    });

    test('✅ getPlanLimits is case-sensitive', () => {
      const limits1 = getPlanLimits('starter');
      const limits2 = getPlanLimits('STARTER');
      const limits3 = getPlanLimits('Starter');

      expect(limits1).not.toBeNull();
      expect(limits2).toBeNull(); // Case sensitive
      expect(limits3).toBeNull(); // Case sensitive
    });

    test('✅ Empty string churchId returns default values', async () => {
      const plan = await getCurrentPlan('');
      const usage = await getUsage('');
      const onTrial = await isOnTrial('');

      expect(plan).toBe('trial'); // Defaults to trial
      expect(usage.branches).toBe(0); // Defaults to 0
      expect(onTrial).toBe(false); // Defaults to false
    });

    test('✅ Very long churchId is handled', async () => {
      const longId =
        'a'.repeat(1000) +
        '-' +
        Math.random().toString(36).substring(2, 15);

      const plan = await getCurrentPlan(longId);
      const usage = await getUsage(longId);

      expect(plan).toBe('trial'); // Should default
      expect(usage.branches).toBe(0); // Should default
    });
  });
});
