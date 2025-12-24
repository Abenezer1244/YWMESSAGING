const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';

  try {
    console.log('\n🔍 TESTING WITH ACTUAL USER INTERACTION\n');
    console.log('=' .repeat(80));

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('\n1. User Story: Fill out registration form with invalid data');

    // User fills in name fields
    console.log('2. Filling first name, last name, church name, email...');
    await page.locator('input[placeholder="John"]').type('John', { delay: 20 });
    await page.locator('input[placeholder="Doe"]').type('Doe', { delay: 20 });
    await page.locator('input[placeholder="Grace Community Church"]').type('Test Church', { delay: 20 });
    await page.locator('input[placeholder="pastor@church.com"]').type('test@test.com', { delay: 20 });

    console.log('3. Filling password with invalid value (lowercase only)...');
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.type('password123', { delay: 20 });
    await page.waitForTimeout(300);

    // Blur the password field
    await passwordInput.blur();
    await page.waitForTimeout(500);

    // Check if helper text or error is visible
    const helperText = page.locator('text=At least 8 characters');
    const helperVisible = await helperText.isVisible();
    console.log(`\n4. Helper text visible: ${helperVisible}`);

    const uppercaseError = page.locator('text=uppercase');
    const uppercaseVisible = await uppercaseError.isVisible();
    console.log(`5. Uppercase error visible: ${uppercaseVisible}`);

    // Now try to submit and see if we get an error
    console.log('\n6. Attempting to submit form with invalid password...');
    const submitButton = page.locator('button:has-text("Create Account")');
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Check for toast error message (client-side would show immediately)
    const toastError = page.locator('text=uppercase, text=password, text=Password');
    const toastCount = await toastError.count();
    console.log(`7. Toast/error messages found: ${toastCount}`);

    // Check page URL (if it stays on register, form wasn't submitted)
    const currentUrl = page.url();
    const isOnRegisterPage = currentUrl.includes('/register');
    console.log(`\n8. Still on register page: ${isOnRegisterPage} (${currentUrl})`);

    if (isOnRegisterPage) {
      console.log('\n✅ GOOD: Form prevented submission (validation worked!)');
    } else {
      console.log('\n❌ BAD: Form was submitted despite invalid data');
    }

    // Now test with valid password
    console.log('\n9. Clearing password and entering valid value...');
    await passwordInput.triple_click();
    await passwordInput.press('Delete');
    await passwordInput.type('ValidPass123', { delay: 20 });
    await page.waitForTimeout(300);

    // Check if uppercase error is gone
    const uppercaseErrorAfter = page.locator('text=uppercase');
    const errorGoneVisible = await uppercaseErrorAfter.isVisible();
    console.log(`10. Uppercase error still visible: ${errorGoneVisible}`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ TEST COMPLETE\n');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
