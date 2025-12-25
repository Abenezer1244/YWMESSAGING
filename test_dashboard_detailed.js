const { chromium } = require('playwright');

const TEST_EMAIL = `test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'TestPassword123!';

async function testDashboardLoading() {
  console.log('🚀 Starting detailed dashboard loading test...\n');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track all network requests
  const requests = [];
  const responses = [];

  page.on('request', req => {
    requests.push({
      url: req.url(),
      method: req.method(),
      timestamp: new Date().toISOString(),
    });
    console.log(`📤 REQUEST: ${req.method()} ${req.url()}`);
  });

  page.on('response', res => {
    responses.push({
      url: res.url(),
      status: res.status(),
      timestamp: new Date().toISOString(),
    });
    console.log(`📥 RESPONSE: ${res.status()} ${res.url()}`);
  });

  try {
    // 1. Register
    console.log('\n=== STEP 1: REGISTRATION ===\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="churchName"]', 'Test Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    console.log('📝 Submitting registration form...');
    const [navResponse] = await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => null),
      page.click('button[type="submit"]')
    ]);

    await page.waitForTimeout(2000);
    const registrationUrl = page.url();
    console.log(`✅ Registered, current URL: ${registrationUrl}\n`);

    // 2. Check cookies after registration
    console.log('=== STEP 2: CHECK COOKIES ===\n');
    const cookies = await context.cookies();
    console.log(`📋 Total cookies after registration: ${cookies.length}`);
    cookies.forEach(cookie => {
      console.log(`🍪 ${cookie.name}: domain=${cookie.domain}, sameSite=${cookie.sameSite}, httpOnly=${cookie.httpOnly}`);
    });

    // 3. Navigate to dashboard
    console.log('\n=== STEP 3: NAVIGATE TO DASHBOARD ===\n');
    console.log('Navigating to https://koinoniasms.com/dashboard...');

    // Reset request/response tracking for dashboard navigation
    const dashboardRequests = [];
    const dashboardResponses = [];

    page.removeAllListeners('request');
    page.removeAllListeners('response');

    page.on('request', req => {
      dashboardRequests.push({
        url: req.url(),
        method: req.method(),
        timestamp: Date.now(),
      });
      const hasAuth = req.headers()['authorization'] ? '✅' : '❌';
      console.log(`  📤 [${req.method()}] ${req.url()} ${hasAuth} Auth header`);
    });

    page.on('response', res => {
      dashboardResponses.push({
        url: res.url(),
        status: res.status(),
        timestamp: Date.now(),
      });
      console.log(`  📥 [${res.status()}] ${res.url()}`);
    });

    // Navigate to dashboard with timeout
    try {
      await Promise.race([
        page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'networkidle', timeout: 10000 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Dashboard networkidle timeout')), 10000))
      ]);
      console.log('✅ Dashboard loaded successfully (networkidle achieved)');
    } catch (e) {
      console.log(`⚠️ Dashboard loading timeout: ${e.message}`);
      console.log('Waiting additional 3 seconds to collect pending requests...');
      await page.waitForTimeout(3000);
    }

    // 4. Analyze requests
    console.log('\n=== STEP 4: REQUEST ANALYSIS ===\n');
    console.log(`Total dashboard requests: ${dashboardRequests.length}`);
    console.log(`Total dashboard responses: ${dashboardResponses.length}`);

    // Find failed requests
    const failedRequests = dashboardResponses.filter(r => r.status >= 400);
    if (failedRequests.length > 0) {
      console.log(`\n❌ FAILED REQUESTS (${failedRequests.length}):`);
      failedRequests.forEach(r => {
        console.log(`   [${r.status}] ${r.url}`);
      });
    }

    // Find pending requests
    const pendingRequests = dashboardRequests.filter(
      req => !dashboardResponses.find(res => res.url === req.url)
    );
    if (pendingRequests.length > 0) {
      console.log(`\n⏳ PENDING REQUESTS (${pendingRequests.length}) - Still loading:`);
      pendingRequests.forEach(r => {
        console.log(`   [${r.method}] ${r.url}`);
      });
    }

    // 5. Check current page state
    console.log('\n=== STEP 5: PAGE STATE ===\n');
    console.log(`Current URL: ${page.url()}`);

    // Check if loading spinner is visible
    const isLoading = await page.locator('[data-testid="loading-spinner"]').isVisible().catch(() => false);
    console.log(`Loading spinner visible: ${isLoading ? '✅ YES (still loading)' : '❌ NO (loaded)'}`);

    // Check if content is visible
    const hasContent = await page.locator('text=Messages Sent').isVisible().catch(() => false);
    console.log(`Dashboard content visible: ${hasContent ? '✅ YES' : '❌ NO'}`);

    // Check browser console for errors
    console.log('\n=== STEP 6: CONSOLE ERRORS ===\n');
    const errors = await page.evaluate(() => {
      return (window as any).__CONSOLE_ERRORS__ || [];
    }).catch(() => []);

    if (errors.length > 0) {
      console.log(`Found ${errors.length} console errors`);
      errors.forEach((err: string) => {
        console.log(`  ❌ ${err}`);
      });
    }

    // 6. Take screenshot
    console.log('\n=== STEP 7: SCREENSHOT ===\n');
    await page.screenshot({ path: 'dashboard-state.png', fullPage: true });
    console.log('📸 Screenshot saved to dashboard-state.png');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'dashboard-error.png', fullPage: true });
  }

  await browser.close();
}

testDashboardLoading();
