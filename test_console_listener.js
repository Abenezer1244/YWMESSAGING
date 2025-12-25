const { chromium } = require('playwright');

const TEST_EMAIL = `console-test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'ConsoleTest123!';

async function testConsoleListener() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 TEST CONSOLE LISTENER');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Console');
    await page.fill('input[name="lastName"]', 'Listener');
    await page.fill('input[name="churchName"]', 'Console Listener Church');
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

    // TEST CONSOLE LISTENER WITH SIMPLE INJECT
    console.log('Testing console listener...\n');

    const allConsoleLogs = [];
    page.on('console', (msg) => {
      const text = msg.text();
      allConsoleLogs.push(`[${msg.type()}] ${text}`);
      console.log(`📍 Caught: [${msg.type()}] ${text.substring(0, 100)}`);
    });

    // Inject a simple test log
    console.log('Step 1: Inject test log into page\n');
    await page.evaluate(() => {
      console.log('[TEST] This is a test log from page.evaluate');
    });

    await page.waitForTimeout(500);

    console.log(`\nStep 2: Check if test log was captured`);
    const testLogCaptured = allConsoleLogs.some((log) => log.includes('[TEST]'));
    console.log(`Test log captured: ${testLogCaptured}`);
    console.log(`Total logs so far: ${allConsoleLogs.length}\n`);

    // NOW TRY SUBMISSION
    console.log('Step 3: Fill form and submit\n');

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    // Reset log capture to focus on submission
    allConsoleLogs.length = 0;

    // Add simple test before click
    await page.evaluate(() => {
      console.log('[PRE-SUBMIT] About to submit form');
    });

    await page.waitForTimeout(200);

    console.log('Logs captured before submit click:');
    allConsoleLogs.forEach((log) => console.log(`  ${log}`));
    console.log();

    // Clear and click
    allConsoleLogs.length = 0;

    console.log('Clicking submit button...\n');
    await page.click('button[type="submit"]');

    // Wait and collect logs
    await page.waitForTimeout(5000);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 LOGS CAPTURED DURING/AFTER SUBMIT');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Total logs: ${allConsoleLogs.length}\n`);

    allConsoleLogs.forEach((log, i) => {
      console.log(`${i + 1}. ${log}`);
    });

    if (allConsoleLogs.length === 0) {
      console.log('❌ NO LOGS CAPTURED');
      console.log('   The console listener may not be working');
      console.log('   Or all logs happen too fast for async capture');
    } else {
      const loginLogs = allConsoleLogs.filter((log) => log.includes('[auth.login]') || log.includes('[LoginPage]'));
      if (loginLogs.length === 0) {
        console.log('\n⚠️ Console listener IS working');
        console.log('   But NO [auth.login] or [LoginPage] logs were captured');
        console.log('   This suggests the login() function was not called');
      } else {
        console.log(`\n✅ Found ${loginLogs.length} login-related logs`);
      }
    }

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testConsoleListener().catch(console.error);
