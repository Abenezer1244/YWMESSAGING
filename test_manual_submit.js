const { chromium } = require('playwright');

const TEST_EMAIL = `manual-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'ManualTest123!';

async function testManualSubmit() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 MANUAL FORM SUBMISSION TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Manual');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'Manual Test Church');
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

    // CAPTURE ALL ERRORS THAT HAPPEN
    console.log('Monitoring for errors...\n');

    let capturedError = null;
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
        capturedError = msg.text();
        console.log(`⚠️ Error: ${msg.text()}`);
      }
    });

    // TRY ALTERNATIVE SUBMISSION METHOD
    console.log('Test 1: Using submitButton.form.submit()\n');

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    const result1 = await page.evaluate(() => {
      try {
        const button = document.querySelector('button[type="submit"]');
        const form = button?.form;

        if (!form) {
          console.log('[DEBUG] ERROR: Button has no form!');
          return 'error';
        }

        console.log('[DEBUG] Calling form.submit() directly');
        form.submit();
        return 'success';
      } catch (e) {
        console.log('[DEBUG] Error calling form.submit():', e.message);
        return `error: ${e.message}`;
      }
    });

    console.log(`Result: ${result1}\n`);
    await page.waitForTimeout(2000);

    // TEST 2: Using keyboard Enter key
    console.log('Test 2: Using Enter key on password field\n');

    // Fill again in case it cleared
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    await page.locator('input[name="password"]').press('Enter');
    await page.waitForTimeout(2000);

    // SUMMARY
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');

    const currentUrl = page.url();
    if (currentUrl.includes('dashboard')) {
      console.log('✅ SUCCESS: Navigated to dashboard!');
    } else if (currentUrl.includes('login')) {
      console.log('❌ Still on login page');
    } else {
      console.log(`📍 URL: ${currentUrl}`);
    }

    if (capturedError) {
      console.log(`\n⚠️ Captured error: ${capturedError}`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testManualSubmit().catch(console.error);
