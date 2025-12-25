const { chromium } = require('playwright');

const TEST_EMAIL = `validate-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'ValidateTest123!';

async function validateForm() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 FORM VALIDATION TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER FIRST
    console.log('Step 1: Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Validate');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'Validate Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    console.log(`✅ Registered: ${TEST_EMAIL}\n`);
    await page.waitForTimeout(1500);

    // NAVIGATE TO LOGIN
    console.log('Step 2: Navigate to login page...\n');
    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // NOW CHECK FORM VALIDATION
    console.log('Step 3: Fill form with valid credentials...\n');

    await page.fill('input[name="email"]', TEST_EMAIL);
    console.log(`Email filled: ${TEST_EMAIL}`);

    await page.fill('input[name="password"]', TEST_PASSWORD);
    console.log(`Password filled: ${TEST_PASSWORD} (${TEST_PASSWORD.length} chars)\n`);

    // Trigger blur to validate
    await page.locator('input[name="password"]').blur();
    await page.waitForTimeout(500);

    // CHECK FOR ERROR MESSAGES
    const errorMessages = await page.locator('[class*="error"], .text-red-500, .text-error').allTextContents();
    console.log('Error messages on form:');
    if (errorMessages.length === 0) {
      console.log('  ✅ No error messages found\n');
    } else {
      errorMessages.forEach((msg) => {
        console.log(`  ❌ ${msg}`);
      });
      console.log('');
    }

    // GET FORM STATE
    const formState = await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      const submitButton = document.querySelector('button[type="submit"]');

      return {
        emailValue: emailInput?.value,
        passwordValue: passwordInput?.value,
        emailDisabled: emailInput?.disabled,
        passwordDisabled: passwordInput?.disabled,
        buttonDisabled: submitButton?.disabled,
        buttonHTML: submitButton?.outerHTML?.substring(0, 200),
      };
    });

    console.log('Form State:');
    console.log(`  Email value: "${formState.emailValue}"`);
    console.log(`  Password value: "${formState.passwordValue}"`);
    console.log(`  Email disabled: ${formState.emailDisabled}`);
    console.log(`  Password disabled: ${formState.passwordDisabled}`);
    console.log(`  Button disabled: ${formState.buttonDisabled}`);
    console.log(`  Button HTML: ${formState.buttonHTML}\n`);

    if (formState.buttonDisabled) {
      console.log('❌ ISSUE: Submit button is disabled!');
      console.log('   The form validation is blocking submission\n');
    }

    // CHECK IF BUTTON CAN BE CLICKED
    console.log('Step 4: Try to click submit button...\n');

    const initialLogs = [];
    page.on('console', (msg) => {
      initialLogs.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.text().includes('[LoginPage]') || msg.text().includes('[auth.login]')) {
        console.log(`✅ [${msg.type()}] ${msg.text()}`);
      }
    });

    // Try to click the button
    try {
      await page.click('button[type="submit"]', { force: true });
      console.log('Button clicked successfully\n');
    } catch (e) {
      console.log(`⚠️ Button click failed: ${e.message}\n`);
    }

    // Wait to see if anything happens
    await page.waitForTimeout(3000);

    // Check if any login logs appeared
    const loginLogs = initialLogs.filter((log) => log.includes('[LoginPage]') || log.includes('[auth.login]'));

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('DIAGNOSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (formState.buttonDisabled) {
      console.log('❌ ROOT CAUSE: Submit button is disabled');
      console.log('   The form validation is preventing submission');
      console.log('   Need to check validation rules in LoginPage.tsx');
    } else if (loginLogs.length === 0) {
      console.log('❌ ROOT CAUSE: Form submit handler never called');
      console.log('   Even though button is enabled, the form submit event was not triggered');
      console.log('   Possible issues:');
      console.log('   1. Button click is not reaching form submit');
      console.log('   2. React Hook Form handleSubmit is not working');
      console.log('   3. Form element is not properly configured');
    } else {
      console.log('✅ Form submit handler was called!');
      console.log(`   Logs: ${loginLogs.join(', ')}`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

validateForm().catch(console.error);
