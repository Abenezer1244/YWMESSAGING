const { chromium } = require('playwright');

const TEST_EMAIL = `e2e-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'E2ETest123!';

async function testSignInFlow() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🧪 END-TO-END SIGN-IN FLOW TEST');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Track network requests/responses
  const networkLog = {
    requests: [],
    responses: [],
    errors: [],
  };

  page.on('request', (request) => {
    if (request.url().includes('auth')) {
      networkLog.requests.push({
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toISOString(),
      });
      console.log(`📤 REQUEST: ${request.method()} ${request.url().split('/').pop()}`);
    }
  });

  page.on('response', (response) => {
    if (response.url().includes('auth')) {
      networkLog.responses.push({
        status: response.status(),
        url: response.url(),
        timestamp: new Date().toISOString(),
      });
      console.log(`📥 RESPONSE: ${response.status()} from ${response.url().split('/').pop()}`);
    }
  });

  page.on('requestfailed', (request) => {
    if (request.url().includes('auth')) {
      networkLog.errors.push({
        url: request.url(),
        failure: request.failure(),
      });
      console.log(`❌ FAILED: ${request.url().split('/').pop()}`);
    }
  });

  try {
    // ════════════════════════════════════════════════════════════════
    // STEP 1: REGISTER NEW ACCOUNT
    // ════════════════════════════════════════════════════════════════
    console.log('STEP 1: Registering new account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'E2E');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'E2E Test Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    console.log(`Submitting registration form for: ${TEST_EMAIL}\n`);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(2000);
    const registerUrl = page.url();
    const registerSuccess = registerUrl.includes('dashboard');

    if (registerSuccess) {
      console.log('✅ REGISTRATION: Account created successfully\n');
    } else {
      console.log(`⚠️ REGISTRATION: Unexpected URL after signup: ${registerUrl}\n`);
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 2: CLEAR SESSION & NAVIGATE TO LOGIN
    // ════════════════════════════════════════════════════════════════
    console.log('STEP 2: Clearing session and navigating to login...\n');

    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // ════════════════════════════════════════════════════════════════
    // STEP 3: PERFORM LOGIN
    // ════════════════════════════════════════════════════════════════
    console.log('STEP 3: Performing login...\n');

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    console.log(`Submitting login form for: ${TEST_EMAIL}\n`);

    // Monitor console for any errors during submission
    const consoleLogs = [];
    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error' || msg.text().includes('error')) {
        console.log(`⚠️ CONSOLE: ${msg.text()}`);
      }
    });

    // Click submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => {
        console.log('⚠️ Navigation timed out or page didn\'t navigate');
      }),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(3000);

    // ════════════════════════════════════════════════════════════════
    // STEP 4: VERIFY RESULTS
    // ════════════════════════════════════════════════════════════════
    console.log('\nSTEP 4: Verifying results...\n');

    const finalUrl = page.url();
    const onDashboard = finalUrl.includes('dashboard');
    const loginUrl = finalUrl.includes('login');

    console.log('═════════════════════════════════════════════════════════════════');
    console.log('📊 TEST RESULTS');
    console.log('═════════════════════════════════════════════════════════════════\n');

    console.log(`Final URL: ${finalUrl}`);
    console.log(`On Dashboard: ${onDashboard ? '✅ YES' : '❌ NO'}`);
    console.log(`Still on Login: ${loginUrl ? '⚠️ YES' : '✅ NO'}\n`);

    console.log(`Network Requests Made: ${networkLog.requests.length}`);
    networkLog.requests.forEach((req, i) => {
      console.log(`  ${i + 1}. ${req.method} ${req.url.split('/').pop()}`);
    });

    console.log(`\nNetwork Responses Received: ${networkLog.responses.length}`);
    networkLog.responses.forEach((res, i) => {
      console.log(`  ${i + 1}. Status ${res.status} from ${res.url.split('/').pop()}`);
    });

    if (networkLog.errors.length > 0) {
      console.log(`\nNetwork Errors: ${networkLog.errors.length}`);
      networkLog.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.url.split('/').pop()}`);
      });
    }

    console.log(`\nConsole Messages: ${consoleLogs.length}`);
    const errorLogs = consoleLogs.filter(log => log.includes('error') || log.includes('Error'));
    if (errorLogs.length > 0) {
      console.log('  Error logs detected:');
      errorLogs.forEach(log => console.log(`    - ${log}`));
    }

    // ════════════════════════════════════════════════════════════════
    // FINAL VERDICT
    // ════════════════════════════════════════════════════════════════
    console.log('\n═════════════════════════════════════════════════════════════════');
    if (onDashboard) {
      console.log('✅ SUCCESS: Sign-in flow is working correctly!');
      console.log('✅ FIX VERIFIED: User navigated to dashboard after login');
    } else {
      console.log('❌ FAILURE: Sign-in flow is still broken');
      console.log(`⚠️ User ended up at: ${finalUrl}`);
    }
    console.log('═════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
  }
}

testSignInFlow().catch(console.error);
