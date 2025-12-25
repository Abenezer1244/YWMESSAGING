const { chromium } = require('playwright');

const TEST_EMAIL = `error-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'Error123!';

async function testLoginErrors() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🔴 LOGIN ERROR DETECTION');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const events = {
    requests: [],
    responses: [],
    failures: [],
    consoleMessages: [],
  };

  page.on('request', (request) => {
    if (request.url().includes('/auth/login')) {
      events.requests.push({
        url: request.url(),
        method: request.method(),
        time: new Date().toISOString(),
      });
      console.log(`📤 REQUEST: POST login`);
    }
  });

  page.on('response', (response) => {
    if (response.url().includes('/auth/login')) {
      events.responses.push({
        status: response.status(),
        statusText: response.statusText(),
        url: response.url(),
        time: new Date().toISOString(),
      });
      console.log(`📥 RESPONSE: ${response.status()} ${response.statusText()}`);
    }
  });

  page.on('requestfailed', (request) => {
    if (request.url().includes('/auth/login')) {
      const failure = request.failure();
      events.failures.push({
        url: request.url(),
        errorText: failure?.errorText,
        time: new Date().toISOString(),
      });
      console.log(`❌ REQUEST FAILED: ${failure?.errorText}`);
    }
  });

  page.on('console', (msg) => {
    if (msg.text().includes('login') || msg.text().includes('error') || msg.type() === 'error') {
      events.consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        time: new Date().toISOString(),
      });
      console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
    }
  });

  try {
    // Register
    console.log('STEP 1: Register account\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Error');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'Error Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(2000);
    console.log('✅ Registration done\n');

    // Clear and navigate to login
    console.log('STEP 2: Login\n');
    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    console.log('Clicking login button...\n');

    await page.click('button[type="submit"]');

    // Wait for any response or failure
    await page.waitForTimeout(8000);

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('📊 EVENT LOG');
    console.log('═════════════════════════════════════════════════════════════════\n');

    console.log(`Requests: ${events.requests.length}`);
    events.requests.forEach((r) => console.log(`  - ${r.method} ${r.url}`));

    console.log(`\nResponses: ${events.responses.length}`);
    events.responses.forEach((r) => console.log(`  - ${r.status} ${r.statusText}`));

    console.log(`\nFailures: ${events.failures.length}`);
    events.failures.forEach((f) => console.log(`  - ${f.errorText}`));

    console.log(`\nConsole Messages: ${events.consoleMessages.length}`);
    events.consoleMessages.forEach((c) => console.log(`  - [${c.type}] ${c.text}`));

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);
    console.log(`Status: ${finalUrl.includes('dashboard') ? 'ON DASHBOARD ✅' : 'STILL ON LOGIN ❌'}`);

    // Try to understand what happened
    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('🔍 ANALYSIS');
    console.log('═════════════════════════════════════════════════════════════════\n');

    if (events.requests.length > 0 && events.responses.length === 0 && events.failures.length === 0) {
      console.log('⚠️ REQUEST WAS MADE BUT NO RESPONSE WAS CAPTURED');
      console.log('   This could indicate:');
      console.log('   1. Request is hanging/timing out');
      console.log('   2. Response is being blocked');
      console.log('   3. Browser lost connection');
      console.log('   4. Backend is not responding');
    }

    if (events.failures.length > 0) {
      console.log('❌ REQUESTS FAILED');
      console.log('   Error details:');
      events.failures.forEach((f) => console.log(`     - ${f.errorText}`));
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginErrors().catch(console.error);
