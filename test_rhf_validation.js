const { chromium } = require('playwright');

const TEST_EMAIL = `rhf-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'RHFTest123!';

async function testRHFValidation() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 REACT-HOOK-FORM VALIDATION TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'RHF');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'RHF Test Church');
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
    console.log('Navigate to login page...\n');
    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // FILL FORM
    console.log('Fill form...\n');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.locator('input[name="password"]').blur();
    await page.waitForTimeout(500);

    // INJECT REACT HOOK FORM VALIDATION TRACKER
    console.log('Checking React Hook Form validation state...\n');

    const validationState = await page.evaluate(() => {
      // Try to find React Hook Form state by checking the inputs
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      const form = document.querySelector('form');

      // Look for error elements
      const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
      const errorMessages = Array.from(errorElements).map((el) => el.textContent);

      // Check input validity
      const emailValid = emailInput?.checkValidity?.() ?? 'no checkValidity';
      const passwordValid = passwordInput?.checkValidity?.() ?? 'no checkValidity';
      const formValid = form?.checkValidity?.() ?? 'no checkValidity';

      console.log('[DEBUG] Email input valid:', emailValid);
      console.log('[DEBUG] Password input valid:', passwordValid);
      console.log('[DEBUG] Form valid:', formValid);
      console.log('[DEBUG] Error elements found:', errorElements.length);
      console.log('[DEBUG] Error messages:', errorMessages);

      // Try to find React fiber to inspect RHF state
      let rhfState = 'Could not access RHF state';
      try {
        // Get React's internal instance from any DOM node
        const reactKey = Object.keys(emailInput).find((key) => key.startsWith('__react'));
        if (reactKey) {
          console.log('[DEBUG] Found React key:', reactKey);
        }
      } catch (e) {
        console.log('[DEBUG] Could not access React internals');
      }

      return {
        errorMessages,
        emailValid,
        passwordValid,
        formValid,
        errorCount: errorElements.length,
      };
    });

    console.log('Validation State:');
    console.log(`  Email valid: ${validationState.emailValid}`);
    console.log(`  Password valid: ${validationState.passwordValid}`);
    console.log(`  Form valid: ${validationState.formValid}`);
    console.log(`  Error elements: ${validationState.errorCount}`);
    if (validationState.errorMessages.length > 0) {
      console.log(`  Error messages: ${validationState.errorMessages.join(', ')}`);
    }
    console.log();

    // NOW ADD LISTENER FOR onSubmit HANDLER
    console.log('Adding listener for form submission...\n');

    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        // The form element should have the onSubmit handler attached by React
        // When form.dispatchEvent('submit') is called, React will handle it
        // But we can wrap preventDefault to see if it's being called

        const originalPreventDefault = Event.prototype.preventDefault;
        let preventDefaultCalled = false;

        Event.prototype.preventDefault = function () {
          if (this.type === 'submit') {
            preventDefaultCalled = true;
            console.log('[DEBUG] preventDefault called on submit event');
          }
          return originalPreventDefault.call(this);
        };

        // Also set up a listener to see if onSubmit callback is called
        let onSubmitCalled = false;
        form.addEventListener('submit', (e) => {
          console.log('[DEBUG] Form submit listener fired');
          // Don't call preventDefault here - let React handle it
        });
      }
    });

    // CAPTURE LOGS
    const consoleLogs = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[DEBUG]') || text.includes('[LoginPage]') || text.includes('[auth.login]')) {
        consoleLogs.push(text);
        console.log(`ℹ️ ${text}`);
      }
    });

    // CLICK BUTTON AND WAIT
    console.log('Clicking submit button...\n');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // CHECK RESULTS
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');

    const loginPagesLogs = consoleLogs.filter((log) => log.includes('[LoginPage]'));
    const authLogs = consoleLogs.filter((log) => log.includes('[auth.login]'));

    console.log(`Logs captured: ${consoleLogs.length}`);
    consoleLogs.forEach((log, i) => {
      console.log(`  ${i + 1}. ${log}`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 DIAGNOSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (loginPagesLogs.length === 0) {
      console.log('❌ onSubmit callback never called');
      console.log('   React Hook Form handleSubmit received the submit event');
      console.log('   But did not call the onSubmit callback\n');
      console.log('Possible causes:');
      console.log('1. Form validation failed (preventDefault was called)');
      console.log('2. React Hook Form has a bug or misconfiguration');
      console.log('3. The input fields are not properly registered with RHF');
      console.log('4. There is an async validator that is blocking execution');
    } else {
      console.log('✅ onSubmit callback was called!');
      console.log(`   Logs: ${loginPagesLogs.join(', ')}`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testRHFValidation().catch(console.error);
