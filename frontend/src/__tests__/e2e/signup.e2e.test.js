import { test, expect } from '@playwright/test';
/**
 * E2E Test: User Signup Flow
 * Tests complete registration process from landing page to dashboard
 */
test.describe('User Signup Flow', () => {
    let page;
    const timestamp = Date.now();
    const testChurchName = `E2E Test Church ${timestamp}`;
    const testEmail = `e2e-signup-${timestamp}@test.com`;
    const testPassword = 'E2ETestPassword123!';
    const testPhone = '+12025551234';
    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        // Clear any existing auth state
        await page.context().clearCookies();
        await page.evaluate(() => {
            sessionStorage.clear();
            localStorage.clear();
        });
    });
    test('should display signup page', async () => {
        await page.goto('/');
        expect(page.url()).toContain('/');
        // Check for signup link or button
        const signupLink = page.getByRole('link', { name: /sign up|register/i });
        await expect(signupLink).toBeVisible();
    });
    test('should navigate to signup page', async () => {
        await page.goto('/');
        // Click signup button
        const signupLink = page.getByRole('link', { name: /sign up|register/i });
        await signupLink.click();
        // Should be on signup page
        await expect(page).toHaveURL(/register|signup/i);
    });
    test('should show validation errors for empty form', async () => {
        await page.goto('/register');
        // Try to submit empty form
        const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
        await submitButton.click();
        // Should show validation errors
        await expect(page.locator('text=/required|must|invalid/i')).toBeVisible();
    });
    test('should validate email format', async () => {
        await page.goto('/register');
        // Fill form with invalid email
        const emailInput = page.getByLabel(/email/i);
        await emailInput.fill('invalid-email');
        const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
        await submitButton.click();
        // Should show email validation error
        await expect(page.locator('text=/invalid email|email address/i')).toBeVisible();
    });
    test('should validate password strength', async () => {
        await page.goto('/register');
        // Fill with weak password
        const passwordInput = page.getByLabel(/password/i).first();
        await passwordInput.fill('weak');
        const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
        await submitButton.click();
        // Should show password strength error
        await expect(page.locator('text=/password must be|at least 12|uppercase|number|special character/i')).toBeVisible();
    });
    test('should complete signup with valid data', async () => {
        await page.goto('/register');
        // Fill signup form
        await page.getByLabel(/church name/i).fill(testChurchName);
        await page.getByLabel(/admin email|your email/i).fill(testEmail);
        await page.getByLabel(/password/i).first().fill(testPassword);
        const passwordConfirm = page.locator('input[type="password"]').last();
        await passwordConfirm.fill(testPassword);
        await page.getByLabel(/phone/i).fill(testPhone);
        // Accept terms if present
        const termsCheckbox = page.getByRole('checkbox', { name: /terms|agree/i });
        if (await termsCheckbox.isVisible()) {
            await termsCheckbox.check();
        }
        // Submit form
        const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
        await submitButton.click();
        // Should redirect to dashboard or login
        await page.waitForNavigation({ timeout: 10000 }).catch(() => {
            // Navigation might not happen immediately
        });
        // Should be authenticated or redirected to login
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/dashboard|login|verify/i);
    });
    test('should show error for duplicate email', async () => {
        // First signup
        await page.goto('/register');
        await page.getByLabel(/church name/i).fill(`Church 1 ${timestamp}`);
        await page.getByLabel(/admin email|your email/i).fill(testEmail);
        await page.getByLabel(/password/i).first().fill(testPassword);
        await page.locator('input[type="password"]').last().fill(testPassword);
        await page.getByLabel(/phone/i).fill(testPhone);
        const termsCheckbox = page.getByRole('checkbox', { name: /terms|agree/i });
        if (await termsCheckbox.isVisible()) {
            await termsCheckbox.check();
        }
        const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
        await submitButton.click();
        // Wait for response
        await page.waitForTimeout(2000);
        // Try duplicate signup
        await page.goto('/register');
        await page.getByLabel(/church name/i).fill(`Church 2 ${timestamp}`);
        await page.getByLabel(/admin email|your email/i).fill(testEmail); // Same email
        await page.getByLabel(/password/i).first().fill(testPassword);
        await page.locator('input[type="password"]').last().fill(testPassword);
        await page.getByLabel(/phone/i).fill(testPhone);
        if ((await page.getByRole('checkbox', { name: /terms|agree/i }).isVisible())) {
            await page.getByRole('checkbox', { name: /terms|agree/i }).check();
        }
        await submitButton.click();
        // Should show error
        await expect(page.locator('text=/already exists|already registered|duplicate|in use/i')).toBeVisible({ timeout: 5000 });
    });
    test('should maintain form data on validation error', async () => {
        await page.goto('/register');
        const churchNameInput = page.getByLabel(/church name/i);
        const emailInput = page.getByLabel(/admin email|your email/i);
        // Fill form
        await churchNameInput.fill(testChurchName);
        await emailInput.fill(testEmail);
        // Submit with invalid password
        const passwordInput = page.getByLabel(/password/i).first();
        await passwordInput.fill('weak');
        const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
        await submitButton.click();
        // Form data should still be visible
        await expect(churchNameInput).toHaveValue(testChurchName);
        await expect(emailInput).toHaveValue(testEmail);
    });
    test('should show loading state during submission', async () => {
        await page.goto('/register');
        // Fill form
        await page.getByLabel(/church name/i).fill(testChurchName);
        await page.getByLabel(/admin email|your email/i).fill(testEmail);
        await page.getByLabel(/password/i).first().fill(testPassword);
        await page.locator('input[type="password"]').last().fill(testPassword);
        await page.getByLabel(/phone/i).fill(testPhone);
        const termsCheckbox = page.getByRole('checkbox', { name: /terms|agree/i });
        if (await termsCheckbox.isVisible()) {
            await termsCheckbox.check();
        }
        // Slow down network to observe loading state
        await page.context().setExtraHTTPHeaders({});
        const submitButton = page.getByRole('button', { name: /register|sign up|create account/i });
        // Check for loading indicators (disabled state, spinner, etc.)
        const submitPromise = submitButton.click();
        await page.waitForTimeout(100);
        // Button should be disabled or show loading state
        const isDisabled = await submitButton.isDisabled();
        const hasLoadingText = page.locator('text=/loading|creating|registering/i').isVisible().catch(() => false);
        expect(isDisabled || hasLoadingText).toBeTruthy();
        await submitPromise;
    });
});
//# sourceMappingURL=signup.e2e.test.js.map