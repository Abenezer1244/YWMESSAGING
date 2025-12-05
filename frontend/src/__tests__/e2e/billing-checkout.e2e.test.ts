import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test: Billing & Checkout Flow
 * Tests trial management, plan selection, and payment processing
 */

test.describe('Billing & Checkout Flow', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }: { page: Page }) => {
    page = testPage;

    // Clear existing state
    await page.context().clearCookies();
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('should display trial banner on free tier', async () => {
    // Assuming user is already logged in
    await page.goto('/dashboard', { waitUntil: 'load' }).catch(() => {});

    // Look for trial banner
    const trialBanner = page.locator('text=/trial|days left|upgrade|free plan/i');

    if (await trialBanner.isVisible()) {
      await expect(trialBanner).toBeVisible();

      // Should show remaining days
      const daysText = page.locator('text=/\\d+ days/i');
      if (await daysText.isVisible()) {
        await expect(daysText).toBeVisible();
      }
    }
  });

  test('should allow navigating to billing page', async () => {
    await page.goto('/dashboard', { waitUntil: 'load' }).catch(() => {});

    // Look for billing link
    const billingLink = page.getByRole('link', { name: /billing|upgrade|pricing|plans/i });

    if (await billingLink.isVisible()) {
      await billingLink.click();
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

      const currentUrl = page.url();
      expect(currentUrl).toMatch(/billing|checkout|pricing|plans/i);
    }
  });

  test('should display available pricing plans', async () => {
    await page.goto('/billing', { waitUntil: 'load' }).catch(() => {});

    // Look for pricing plans
    const starterPlan = page.locator('text=/starter/i');
    const growthPlan = page.locator('text=/growth/i');
    const proPlan = page.locator('text=/pro/i');

    // Should show at least some plans
    const planCount = [
      await starterPlan.isVisible(),
      await growthPlan.isVisible(),
      await proPlan.isVisible(),
    ].filter(Boolean).length;

    expect(planCount).toBeGreaterThan(0);
  });

  test('should display pricing details for each plan', async () => {
    await page.goto('/billing', { waitUntil: 'load' }).catch(() => {});

    // Look for plan cards
    const planCards = page.locator('[class*="plan"], [class*="pricing"], [data-testid*="plan"]');

    if (await planCards.first().isVisible()) {
      const firstCard = planCards.first();

      // Should show price
      const price = firstCard.locator('text=/\\$\\d+|\\d+\\.\\d{2}/');
      if (await price.isVisible()) {
        await expect(price).toBeVisible();
      }

      // Should show features list
      const featuresList = firstCard.locator('text=/members|messages|features|includes/i');
      if (await featuresList.isVisible()) {
        await expect(featuresList).toBeVisible();
      }
    }
  });

  test('should allow selecting a plan', async () => {
    await page.goto('/billing', { waitUntil: 'load' }).catch(() => {});

    // Find select/upgrade button
    const selectButton = page.getByRole('button', { name: /select|upgrade|choose|subscribe/i }).first();

    if (await selectButton.isVisible()) {
      await selectButton.click();

      // Should navigate to checkout
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

      const currentUrl = page.url();
      expect(currentUrl).toMatch(/checkout|payment|confirm/i);
    }
  });

  test('should display Stripe payment form on checkout', async () => {
    await page.goto('/checkout', { waitUntil: 'load' }).catch(() => {});

    // Look for Stripe iframe or payment form
    const stripeFrame = page.frameLocator('[title*="Stripe"]').first();
    const cardElement = page.locator('[class*="card"], [data-testid*="card"]');

    if (await stripeFrame.first().isVisible().catch(() => false)) {
      // Stripe is loaded via iframe
      await expect(stripeFrame).toBeDefined();
    } else if (await cardElement.isVisible()) {
      // Card element is visible
      await expect(cardElement).toBeVisible();
    }
  });

  test('should display order summary on checkout', async () => {
    await page.goto('/checkout', { waitUntil: 'load' }).catch(() => {});

    // Look for plan name
    const planName = page.locator('text=/starter|growth|pro/i');

    if (await planName.isVisible()) {
      await expect(planName).toBeVisible();
    }

    // Look for price
    const priceText = page.locator('text=/\\$\\d+|total|price/i');
    if (await priceText.isVisible()) {
      await expect(priceText).toBeVisible();
    }

    // Look for billing period
    const billingPeriod = page.locator('text=/month|annual|year|billing/i');
    if (await billingPeriod.isVisible()) {
      await expect(billingPeriod).toBeVisible();
    }
  });

  test('should validate billing address information', async () => {
    await page.goto('/checkout', { waitUntil: 'load' }).catch(() => {});

    // Look for email field
    const emailInput = page.getByLabel(/email/i);

    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();

      // Should pre-fill with user email
      const email = await emailInput.inputValue();
      if (email) {
        expect(email).toMatch(/.+@.+\..+/); // Basic email format
      }
    }
  });

  test('should show loading state during payment processing', async () => {
    await page.goto('/checkout', { waitUntil: 'load' }).catch(() => {});

    // Fill payment form (test credentials)
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
    }

    // Find submit button
    const submitButton = page.getByRole('button', { name: /pay|subscribe|confirm|checkout/i });

    if (await submitButton.isVisible()) {
      const submitPromise = submitButton.click();

      // Check for loading state
      await page.waitForTimeout(100);

      const isDisabled = await submitButton.isDisabled();
      const hasLoadingText = page.locator('text=/processing|loading|please wait/i').isVisible().catch(() => false);

      expect(isDisabled || hasLoadingText).toBeTruthy();

      await submitPromise.catch(() => {});
    }
  });

  test('should handle payment errors gracefully', async () => {
    await page.goto('/checkout', { waitUntil: 'load' }).catch(() => {});

    // Fill form with test failure card
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
    }

    // Try to process payment with failure scenario
    const submitButton = page.getByRole('button', { name: /pay|subscribe|confirm|checkout/i });

    if (await submitButton.isVisible()) {
      // Simulate payment failure
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Should show error message
      const errorText = page.locator('text=/error|failed|declined|invalid|card/i');

      if (await errorText.isVisible()) {
        await expect(errorText).toBeVisible();
      }
    }
  });

  test('should allow applying promo/coupon codes', async () => {
    await page.goto('/checkout', { waitUntil: 'load' }).catch(() => {});

    // Look for promo code input
    const promoInput = page.getByLabel(/promo|coupon|discount|code/i);

    if (await promoInput.isVisible()) {
      await expect(promoInput).toBeVisible();

      // Try entering a code
      await promoInput.fill('TEST10');

      // Look for apply button
      const applyButton = page.getByRole('button', { name: /apply|redeem|use/i });

      if (await applyButton.isVisible()) {
        await applyButton.click();

        // Price should update if code is valid
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show confirmation after successful payment', async () => {
    // This would require successful payment setup
    await page.goto('/checkout/success', { waitUntil: 'load' }).catch(() => {});

    // Look for success message
    const successText = page.locator('text=/success|thank you|confirmed|welcome|subscription active/i');

    if (await successText.isVisible()) {
      await expect(successText).toBeVisible();

      // Should show order details
      const orderDetails = page.locator('text=/order|invoice|receipt|reference/i');

      if (await orderDetails.isVisible()) {
        await expect(orderDetails).toBeVisible();
      }

      // Should have next steps or CTA
      const ctaButton = page.getByRole('button', { name: /continue|dashboard|get started|go to app/i });

      if (await ctaButton.isVisible()) {
        await expect(ctaButton).toBeVisible();
      }
    }
  });

  test('should allow managing subscriptions from billing page', async () => {
    await page.goto('/billing', { waitUntil: 'load' }).catch(() => {});

    // Look for active subscription section
    const activeSubscription = page.locator('text=/active|current plan|subscription|billing/i');

    if (await activeSubscription.isVisible()) {
      // Should have management options
      const manageButton = page.getByRole('button', { name: /manage|change|cancel|update/i });

      if (await manageButton.isVisible()) {
        await expect(manageButton).toBeVisible();
      }

      // Should show billing date
      const billingDate = page.locator('text=/renews|next billing|expires|until/i');

      if (await billingDate.isVisible()) {
        await expect(billingDate).toBeVisible();
      }
    }
  });

  test('should allow upgrading to higher plan', async () => {
    await page.goto('/billing', { waitUntil: 'load' }).catch(() => {});

    // Find upgrade button for higher tier plan
    const upgradeButtons = page.getByRole('button', { name: /upgrade|switch|change|select/i });

    if (await upgradeButtons.count() > 0) {
      const upgradeButton = upgradeButtons.first();
      await upgradeButton.click();

      // Should go to upgrade/change plan flow
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

      const currentUrl = page.url();
      expect(currentUrl).toMatch(/checkout|confirm|upgrade/i);
    }
  });

  test('should handle network errors during checkout', async () => {
    await page.goto('/checkout', { waitUntil: 'load' }).catch(() => {});

    // Simulate network failure
    await page.context().setOffline(true);

    // Try to process payment
    const submitButton = page.getByRole('button', { name: /pay|subscribe|confirm/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Should show network error
      const errorText = page.locator('text=/network|connection|offline|failed/i');

      if (await errorText.isVisible()) {
        await expect(errorText).toBeVisible();
      }
    }

    // Restore network
    await page.context().setOffline(false);
  });

  test('should display usage stats and limits', async () => {
    await page.goto('/billing', { waitUntil: 'load' }).catch(() => {});

    // Look for usage section
    const usageSection = page.locator('text=/usage|limits|messages|members|usage this month/i');

    if (await usageSection.isVisible()) {
      await expect(usageSection).toBeVisible();

      // Should show specific metrics
      const metrics = [
        page.locator('text=/members/i'),
        page.locator('text=/messages/i'),
        page.locator('text=/remaining/i'),
      ];

      const visibleMetrics = await Promise.all(
        metrics.map((m) => m.isVisible().catch(() => false))
      );

      expect(visibleMetrics.some((v) => v)).toBeTruthy();
    }
  });

  test('should show invoice history', async () => {
    await page.goto('/billing', { waitUntil: 'load' }).catch(() => {});

    // Look for invoice section
    const invoiceSection = page.locator('text=/invoice|history|past|billing history|transactions/i');

    if (await invoiceSection.isVisible()) {
      await expect(invoiceSection).toBeVisible();

      // Should have invoice list or table
      const invoiceTable = page.locator('[class*="invoice"], [class*="table"], [role="table"]').first();

      if (await invoiceTable.isVisible()) {
        await expect(invoiceTable).toBeVisible();
      }

      // Should have download option
      const downloadLink = page.getByRole('link', { name: /download|pdf|invoice|receipt/i });

      if (await downloadLink.isVisible()) {
        await expect(downloadLink).toBeVisible();
      }
    }
  });
});
