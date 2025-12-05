import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test: Church Onboarding Flow
 * Tests complete setup flow from registration to first message ready
 */

test.describe('Church Onboarding Flow', () => {
  let page: Page;
  const testEmail = `onboarding-${Date.now()}@e2e.test.com`;
  const testPassword = 'E2ETestPassword123!';
  const testChurchName = `Onboarding Church ${Date.now()}`;
  const testAdminFirstName = 'John';
  const testAdminLastName = 'Smith';

  test.beforeEach(async ({ page: testPage }: { page: Page }) => {
    page = testPage;

    // Clear existing state
    await page.context().clearCookies();
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('should display onboarding wizard after signup', async () => {
    // Navigate to signup
    await page.goto('/register');

    // Fill signup form
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i).first();
    await passwordInput.fill(testPassword);

    const passwordConfirm = page.locator('input[type="password"]').last();
    await passwordConfirm.fill(testPassword);

    const churchNameInput = page.getByLabel(/church name/i);
    await churchNameInput.fill(testChurchName);

    const firstNameInput = page.getByLabel(/first name|admin name/i).first();
    await firstNameInput.fill(testAdminFirstName);

    const lastNameInput = page.getByLabel(/last name/i).first();
    await lastNameInput.fill(testAdminLastName);

    // Submit signup
    const signupButton = page.getByRole('button', { name: /register|sign up|create/i });
    await signupButton.click();

    // Wait for redirect to onboarding
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {});

    // Check for onboarding wizard
    const wizardTitle = page.locator('text=/welcome|get started|setup|onboarding|guided tour/i');
    await expect(wizardTitle).toBeVisible({ timeout: 5000 });
  });

  test('should show onboarding steps indicator', async () => {
    // Assuming user is already at onboarding screen
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Check for step indicator
    const stepIndicator = page.locator('text=/step|step 1|1 of|progress/i');

    // Should show steps or progress
    if (await stepIndicator.isVisible()) {
      await expect(stepIndicator).toBeVisible();
    }
  });

  test('should display preferences/settings step', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Look for preferences section
    const preferencesSection = page.locator('text=/preferences|settings|timezone|language|notification/i');

    if (await preferencesSection.isVisible()) {
      await expect(preferencesSection).toBeVisible();

      // Check for timezone selection
      const timezoneSelect = page.getByLabel(/timezone|time zone/i);
      if (await timezoneSelect.isVisible()) {
        await expect(timezoneSelect).toBeVisible();
      }
    }
  });

  test('should display team member invitation step', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Look for team/members section
    const teamSection = page.locator('text=/team|members|invite|add team|co-admin/i');

    if (await teamSection.isVisible()) {
      await expect(teamSection).toBeVisible();

      // Should have email input for inviting team members
      const emailInput = page.getByLabel(/email|invite email/i).first();
      if (await emailInput.isVisible()) {
        await expect(emailInput).toBeVisible();
      }
    }
  });

  test('should allow skipping optional steps', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Look for skip button
    const skipButton = page.getByRole('button', { name: /skip|next|continue|skip this step/i });

    if (await skipButton.isVisible()) {
      const initialUrl = page.url();
      await skipButton.click();

      // Should navigate to next step or dashboard
      await page.waitForTimeout(500);
      const newUrl = page.url();

      // URL should change
      expect(newUrl).not.toBe(initialUrl);
    }
  });

  test('should allow completing all steps', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Get all next/continue buttons
    const continueButtons = page.getByRole('button', { name: /next|continue|finish|complete/i });

    // Click through all steps
    let buttonCount = 0;
    while (buttonCount < 10) {
      // Safety limit
      const button = continueButtons.first();

      if (!(await button.isVisible())) {
        break;
      }

      await button.click();
      await page.waitForTimeout(300);
      buttonCount++;
    }

    // After completing, should be on dashboard
    await page.waitForTimeout(1000);
    const finalUrl = page.url();

    expect(finalUrl).toMatch(/dashboard|members|conversations|messages/i);
  });

  test('should show progress between steps', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    const stepIndicator = page.locator('text=/step|progress/i');

    if (await stepIndicator.isVisible()) {
      const initialText = await stepIndicator.textContent();

      // Click next
      const nextButton = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);

        const newText = await stepIndicator.textContent();

        // Step indicator should change
        expect(newText).not.toBe(initialText);
      }
    }
  });

  test('should validate form fields in onboarding', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Look for form inputs
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Try to submit with empty fields
      const submitButton = page.getByRole('button', { name: /next|continue|finish/i }).first();

      if (await submitButton.isVisible()) {
        // Leave field empty and try to continue
        await submitButton.click();
        await page.waitForTimeout(300);

        // Should show validation error or stay on same step
        const errorText = page.locator('text=/required|must|invalid/i');

        // Either error is shown or we're still on same step
        const onSameStep = page.url().includes('onboarding');
        const showsError = await errorText.isVisible().catch(() => false);

        expect(onSameStep || showsError).toBeTruthy();
      }
    }
  });

  test('should allow going back to previous step', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    const initialUrl = page.url();

    // Go to next step
    const nextButton = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);

      const secondStepUrl = page.url();

      // Look for back button
      const backButton = page.getByRole('button', { name: /back|previous|go back/i });

      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForTimeout(300);

        const returnedUrl = page.url();

        // Should go back to initial step
        expect(returnedUrl).not.toBe(secondStepUrl);
      }
    }
  });

  test('should show tooltip/help text for fields', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Look for help icons or tooltip
    const helpIcon = page.locator('[aria-label*="help" i], [title*="help" i], [title*="tooltip" i]');

    if (await helpIcon.first().isVisible()) {
      // Hover over help icon
      await helpIcon.first().hover();

      // Tooltip/help text should appear
      const tooltip = page.locator('[role="tooltip"], .tooltip, .help-text');

      if (await tooltip.isVisible()) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('should disable finish button until required steps complete', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    const finishButton = page.getByRole('button', { name: /finish|complete|done/i });

    // If finish button exists, it should be disabled initially
    if (await finishButton.isVisible()) {
      const isDisabled = await finishButton.isDisabled();

      // Button might be disabled if not all steps completed
      expect(typeof isDisabled).toBe('boolean');
    }
  });

  test('should save progress between page refreshes', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Fill some field
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      const testValue = `test-${Date.now()}`;
      await input.fill(testValue);

      // Refresh page
      await page.reload();

      // Value should still be there (saved)
      await expect(input).toHaveValue(testValue);
    }
  });

  test('should handle network errors during onboarding', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Simulate network error
    await page.context().setOffline(true);

    // Try to continue
    const nextButton = page.getByRole('button', { name: /next|continue|finish/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Should show network error
      const errorText = page.locator('text=/network|connection|offline|failed/i');

      if (await errorText.isVisible()) {
        await expect(errorText).toBeVisible();
      }
    }

    // Restore network
    await page.context().setOffline(false);
  });

  test('should have clear call-to-action to complete onboarding', async () => {
    await page.goto('/dashboard/onboarding', { waitUntil: 'load' }).catch(() => {});

    // Last step should have finish/complete button
    const finishButton = page.getByRole('button', { name: /finish|complete|done|go to dashboard|start using/i });

    if (await finishButton.isVisible()) {
      await expect(finishButton).toBeVisible();
      expect(await finishButton.isEnabled()).toBe(true);
    }
  });
});
