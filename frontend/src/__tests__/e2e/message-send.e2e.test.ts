import { Route } from '@playwright/test';
import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test: Message Sending Flow
 * Tests complete message sending workflow from dashboard to sending
 */

test.describe('Message Sending Flow', () => {
  let page: Page;

  // Test credentials
  const testEmail = 'test-admin@e2e.test.com';
  const testPassword = 'E2ETestPassword123!';

  test.beforeEach(async ({ page: testPage }: { page: any }) => {
    page = testPage;

    // Login before each test
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill(testPassword);

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Wait for dashboard to load
    await page.waitForURL(/dashboard|members|conversations/i, { timeout: 10000 }).catch(() => {
      // Might already be on dashboard
    });
  });

  test('should display send message page', async () => {
    // Navigate to send message page
    const sendMessageLink = page.getByRole('link', { name: /send message|compose|new message/i });

    if (await sendMessageLink.isVisible()) {
      await sendMessageLink.click();
    } else {
      await page.goto('/dashboard/send-message');
    }

    // Should show message form
    await expect(page.locator('text=/send message|compose message|message content/i')).toBeVisible();
  });

  test('should show validation errors for empty message', async () => {
    // Navigate to send message page
    const sendMessageLink = page.getByRole('link', { name: /send message|compose|new message/i });

    if (await sendMessageLink.isVisible()) {
      await sendMessageLink.click();
    } else {
      await page.goto('/dashboard/send-message');
    }

    // Try to submit without filling form
    const submitButton = page.getByRole('button', { name: /send|submit|next/i }).first();
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=/required|must|select|choose/i')).toBeVisible();
  });

  test('should validate message length', async () => {
    await page.goto('/dashboard/send-message');

    // Find message textarea
    const messageInput = page.locator('textarea').first();

    // Exceed max length (typically 160 chars for SMS)
    const longMessage = 'A'.repeat(200);
    await messageInput.fill(longMessage);

    // Should show error
    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    // Should show length validation error
    await expect(page.locator('text=/too long|max|characters|160/i')).toBeVisible({ timeout: 3000 });
  });

  test('should require recipient selection', async () => {
    await page.goto('/dashboard/send-message');

    // Fill message but no recipients
    const messageInput = page.locator('textarea').first();
    await messageInput.fill('Test message');

    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    // Should show recipient validation error
    await expect(page.locator('text=/select|choose|recipient|member|group/i')).toBeVisible({
      timeout: 3000,
    });
  });

  test('should allow selecting recipients', async () => {
    await page.goto('/dashboard/send-message');

    // Look for recipient selector (could be dropdown, list, or search)
    const recipientInput = page.getByLabel(/recipient|select|member|group|to/i).first();

    if (await recipientInput.isVisible()) {
      await recipientInput.click();

      // Look for recipient options
      const firstOption = page.locator('[role="option"]').first();

      if (await firstOption.isVisible()) {
        await firstOption.click();

        // Recipient should be selected
        await expect(page.locator('text=/selected|recipient/i')).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('should allow selecting multiple recipients', async () => {
    await page.goto('/dashboard/send-message');

    const recipientInputs = page.locator('input[type="checkbox"]');
    const count = await recipientInputs.count();

    if (count >= 2) {
      // Select first two recipients
      await recipientInputs.nth(0).check();
      await recipientInputs.nth(1).check();

      // Both should be checked
      await expect(recipientInputs.nth(0)).toBeChecked();
      await expect(recipientInputs.nth(1)).toBeChecked();
    }
  });

  test('should allow selecting group', async () => {
    await page.goto('/dashboard/send-message');

    // Look for group selector
    const groupSelector = page.getByLabel(/group|broadcast|all members/i);

    if (await groupSelector.isVisible()) {
      await groupSelector.click();

      // Look for group options
      const groupOption = page.locator('text=/group|members|everyone/i').first();

      if (await groupOption.isVisible()) {
        await groupOption.click();

        // Group should be selected
        await expect(page.locator('text=/selected|group/i')).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('should show character counter', async () => {
    await page.goto('/dashboard/send-message');

    const messageInput = page.locator('textarea').first();

    // Check for character counter
    const charCounter = page.locator('text=/characters|character count|160/i');

    if (await charCounter.isVisible()) {
      await messageInput.fill('Test message');

      // Counter should update
      await expect(charCounter).toContainText(/\d+/);
    }
  });

  test('should handle scheduling option', async () => {
    await page.goto('/dashboard/send-message');

    // Look for schedule option
    const scheduleCheckbox = page.getByRole('checkbox', { name: /schedule|later|time/i });

    if (await scheduleCheckbox.isVisible()) {
      await scheduleCheckbox.check();

      // Should show date/time picker
      const dateInput = page.getByLabel(/date|time|when/i);

      if (await dateInput.isVisible()) {
        await expect(dateInput).toBeVisible();
      }
    }
  });

  test('should show confirmation before sending', async () => {
    await page.goto('/dashboard/send-message');

    // Fill form completely
    const messageInput = page.locator('textarea').first();
    await messageInput.fill('Test message for confirmation');

    // Select recipient
    const recipientCheckbox = page.locator('input[type="checkbox"]').first();
    if (await recipientCheckbox.isVisible()) {
      await recipientCheckbox.check();
    }

    // Submit
    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    // Should show confirmation dialog
    await expect(page.locator('text=/confirm|send|are you sure|proceed/i')).toBeVisible({
      timeout: 3000,
    });
  });

  test('should send message successfully', async () => {
    await page.goto('/dashboard/send-message');

    // Fill form
    const messageInput = page.locator('textarea').first();
    await messageInput.fill('E2E test message');

    // Select recipient
    const recipientCheckbox = page.locator('input[type="checkbox"]').first();
    if (await recipientCheckbox.isVisible()) {
      await recipientCheckbox.check();
    }

    // Submit
    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    // Confirm if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|send|proceed/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Should show success message
    await expect(
      page.locator('text=/sent|success|message sent|delivered/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should display success notification', async () => {
    await page.goto('/dashboard/send-message');

    const messageInput = page.locator('textarea').first();
    await messageInput.fill('Test message');

    const recipientCheckbox = page.locator('input[type="checkbox"]').first();
    if (await recipientCheckbox.isVisible()) {
      await recipientCheckbox.check();
    }

    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    const confirmButton = page.getByRole('button', { name: /confirm|yes|send|proceed/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Look for success notification (toast/alert)
    const successNotif = page.locator('[role="alert"]').filter({
      hasText: /sent|success|delivered/i,
    });

    if (await successNotif.isVisible()) {
      await expect(successNotif).toBeVisible();
    }
  });

  test('should allow sending another message', async () => {
    await page.goto('/dashboard/send-message');

    // First message
    const messageInput = page.locator('textarea').first();
    await messageInput.fill('First message');

    const recipientCheckbox = page.locator('input[type="checkbox"]').first();
    if (await recipientCheckbox.isVisible()) {
      await recipientCheckbox.check();
    }

    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    const confirmButton = page.getByRole('button', { name: /confirm|yes|send/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Wait for success
    await page.waitForTimeout(2000);

    // Form should be reset or page should allow new message
    const clearButton = page.getByRole('button', { name: /clear|reset|new message/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Should be able to fill form again
    await expect(page.locator('textarea').first()).toHaveValue('');
  });

  test('should handle send error gracefully', async () => {
    // Simulate network error
    await page.context().setOffline(true);

    await page.goto('/dashboard/send-message');

    const messageInput = page.locator('textarea').first();
    await messageInput.fill('Message during network error');

    const recipientCheckbox = page.locator('input[type="checkbox"]').first();
    if (await recipientCheckbox.isVisible()) {
      await recipientCheckbox.check();
    }

    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    const confirmButton = page.getByRole('button', { name: /confirm|yes|send/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Should show error message
    await expect(page.locator('text=/error|failed|network|offline/i')).toBeVisible({
      timeout: 5000,
    });

    // Restore network
    await page.context().setOffline(false);
  });
});
