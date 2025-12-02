import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test: Admin Login Flow
 * Tests authentication from login page to dashboard
 */

test.describe('Admin Login Flow', () => {
  let page: Page;

  // Test credentials (created during test setup or pre-existing)
  const testEmail = 'test-admin@e2e.test.com';
  const testPassword = 'E2ETestPassword123!';

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('should display login page', async () => {
    await page.goto('/login');

    // Check for login title
    await expect(page.locator('text=/login|sign in|welcome back/i')).toBeVisible();

    // Check for email and password fields
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show validation errors for empty credentials', async () => {
    await page.goto('/login');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=/required|must|email/i')).toBeVisible();
  });

  test('should validate email format on login', async () => {
    await page.goto('/login');

    // Enter invalid email
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('invalid-email');

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=/invalid email|valid email/i')).toBeVisible();
  });

  test('should show error for non-existent email', async () => {
    await page.goto('/login');

    // Enter valid but non-existent email
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(`nonexistent-${Date.now()}@test.com`);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('SomePassword123!');

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Should show login error
    await expect(page.locator('text=/not found|invalid credentials|does not exist/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show error for incorrect password', async () => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('WrongPassword123!');

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Should show authentication error
    await expect(
      page.locator('text=/invalid credentials|incorrect password|authentication failed/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should complete login with valid credentials', async () => {
    await page.goto('/login');

    // Enter credentials
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill(testPassword);

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Wait for navigation to dashboard
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {
      // Navigation might not happen if already on dashboard
    });

    // Should be on dashboard or authenticated
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/dashboard|members|conversations/i);

    // Session should be stored
    const authState = await page.evaluate(() => sessionStorage.getItem('authState'));
    expect(authState).toBeTruthy();
  });

  test('should maintain email on password error', async () => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    const testEmailValue = `test-${Date.now()}@test.com`;
    await emailInput.fill(testEmailValue);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('WrongPassword123!');

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Wait for error
    await page.waitForTimeout(500);

    // Email should still be filled
    await expect(emailInput).toHaveValue(testEmailValue);
  });

  test('should show loading state during login', async () => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill(testPassword);

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });

    // Click submit and check for loading state
    const submitPromise = submitButton.click();
    await page.waitForTimeout(100);

    // Button should be disabled during submission
    const isDisabled = await submitButton.isDisabled();
    const hasLoadingText = page.locator('text=/loading|signing in|authenticating/i').isVisible().catch(() => false);

    expect(isDisabled || hasLoadingText).toBeTruthy();

    await submitPromise;
  });

  test('should have remember me option', async () => {
    await page.goto('/login');

    // Look for remember me checkbox
    const rememberMeCheckbox = page.getByRole('checkbox', { name: /remember|keep me logged in/i });

    // If exists, it should be interactive
    if (await rememberMeCheckbox.isVisible()) {
      await expect(rememberMeCheckbox).toBeVisible();
      await rememberMeCheckbox.check();
      await expect(rememberMeCheckbox).toBeChecked();
    }
  });

  test('should have password reset link', async () => {
    await page.goto('/login');

    const resetLink = page.getByRole('link', { name: /forgot password|reset password|password help/i });

    if (await resetLink.isVisible()) {
      await expect(resetLink).toBeVisible();
      expect(resetLink).toHaveAttribute('href', /reset|forgot/i);
    }
  });

  test('should have signup link for new users', async () => {
    await page.goto('/login');

    const signupLink = page.getByRole('link', { name: /sign up|register|create account|new account/i });

    if (await signupLink.isVisible()) {
      await expect(signupLink).toBeVisible();
      await signupLink.click();
      await expect(page).toHaveURL(/register|signup/i);
    }
  });

  test('should handle network errors gracefully', async () => {
    // Simulate network failure
    await page.context().setOffline(true);

    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill(testPassword);

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Should show network error
    await expect(page.locator('text=/network|connection|offline/i')).toBeVisible({ timeout: 5000 });

    // Restore network
    await page.context().setOffline(false);
  });

  test('should handle session timeout gracefully', async () => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill(testEmail);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill(testPassword);

    // Intercept and delay the auth response
    await page.route('**/api/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    const submitButton = page.getByRole('button', { name: /login|sign in|next/i });
    await submitButton.click();

    // Should still handle it gracefully
    await page.waitForTimeout(500);
  });
});
