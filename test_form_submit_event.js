const { chromium } = require('playwright');

const TEST_EMAIL = `form-submit-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'FormSubmit123!';

async function testFormSubmitEvent() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 FORM SUBMIT EVENT TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Form');
    await page.fill('input[name="lastName"]', 'Submit');
    await page.fill('input[name="churchName"]', 'Form Submit Church');
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
    console.log('Fill form with credentials...\n');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    // INJECT DEBUGGING CODE INTO PAGE
    console.log('Injecting form debugging code...\n');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      const button = document.querySelector('button[type="submit"]');

      console.log('[DEBUG] Form element found:', !!form);
      console.log('[DEBUG] Button element found:', !!button);
      console.log('[DEBUG] Form onsubmit handler:', form?.onsubmit);
      console.log('[DEBUG] Button onclick handler:', button?.onclick);

      if (form) {
        // Listen for submit event on the form
        form.addEventListener('submit', (e) => {
          console.log('[DEBUG] FORM SUBMIT EVENT FIRED!');
          console.log('[DEBUG] Submit event object:', {
            type: e.type,
            target: e.target.tagName,
            preventDefault: typeof e.preventDefault,
          });
        });

        // Listen for any form events
        ['submit', 'click', 'change', 'input'].forEach((eventName) => {
          form.addEventListener(eventName, (e) => {
            console.log(`[DEBUG] Form event: ${eventName}`);
          });
        });
      }

      if (button) {
        // Listen for button click
        button.addEventListener('click', (e) => {
          console.log('[DEBUG] BUTTON CLICK EVENT FIRED!');
          console.log('[DEBUG] Event details:', {
            type: e.type,
            target: e.target.tagName,
            bubbles: e.bubbles,
            cancelable: e.cancelable,
          });
        });
      }

      // Try to find React props (React Hook Form attaches handlers via React)
      console.log('[DEBUG] Form classes:', form?.className);
      console.log('[DEBUG] Button classes:', button?.className);
    });

    // CAPTURE CONSOLE LOGS
    const consoleLogs = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[DEBUG]')) {
        consoleLogs.push(text);
        console.log(`ℹ️ ${text}`);
      }
    });

    // TRY DIFFERENT CLICK METHODS
    console.log('\nTest 1: Simple page.click()...\n');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    console.log('\nTest 2: Try page.press("Enter") on password field...\n');
    await page.locator('input[name="password"]').press('Enter');
    await page.waitForTimeout(1000);

    console.log('\nTest 3: Evaluate and trigger submit manually...\n');
    const submitResult = await page.evaluate(async () => {
      const form = document.querySelector('form');
      const button = document.querySelector('button[type="submit"]');

      if (button) {
        console.log('[DEBUG] Manually triggering button click...');
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (form) {
        console.log('[DEBUG] Manually triggering form submit...');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        return 'Manual submit dispatched';
      }

      return 'Could not find form';
    });

    await page.waitForTimeout(2000);

    // SUMMARY
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Console logs captured: ${consoleLogs.length}`);
    consoleLogs.forEach((log, i) => {
      console.log(`  ${i + 1}. ${log}`);
    });

    if (consoleLogs.filter((log) => log.includes('FORM SUBMIT EVENT')).length === 0) {
      console.log('\n❌ FORM SUBMIT EVENT WAS NEVER FIRED');
      console.log('   This explains why the login handler is never called!');
      console.log('\n   Possible causes:');
      console.log('   1. React Hook Form handleSubmit is not properly attached');
      console.log('   2. The form onSubmit handler is not registered');
      console.log('   3. Some other code is preventing form submission');
    } else {
      console.log('\n✅ FORM SUBMIT EVENT FIRED');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFormSubmitEvent().catch(console.error);
