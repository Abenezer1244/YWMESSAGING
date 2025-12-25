const { chromium } = require('playwright');

async function testDashboardLoading() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🔍 DASHBOARD LOADING DIAGNOSTIC TEST');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const networkLog = {
    requests: [],
    responses: [],
    timings: {},
    errors: [],
  };

  // Track all requests with timestamps
  page.on('request', (request) => {
    const url = request.url();
    const startTime = Date.now();
    networkLog.timings[url] = { start: startTime };

    // Only log API calls (not static assets)
    if (url.includes('/api/')) {
      console.log(`📤 [${new Date().toLocaleTimeString()}] REQUEST: ${request.method()} ${url.split('/').pop()}`);
      networkLog.requests.push({
        method: request.method(),
        url: url,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Track all responses
  page.on('response', (response) => {
    const url = response.url();
    const timing = networkLog.timings[url];

    if (url.includes('/api/')) {
      const responseTime = timing ? Date.now() - timing.start : -1;
      console.log(`📥 [${new Date().toLocaleTimeString()}] RESPONSE: ${response.status()} from ${url.split('/').pop()} (${responseTime}ms)`);
      networkLog.responses.push({
        status: response.status(),
        url: url,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Track request failures
  page.on('requestfailed', (request) => {
    if (request.url().includes('/api/')) {
      console.log(`❌ [${new Date().toLocaleTimeString()}] FAILED: ${request.url().split('/').pop()}`);
      networkLog.errors.push({
        url: request.url(),
        failure: request.failure(),
      });
    }
  });

  // Monitor console for errors
  const consoleMessages = [];
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
    });

    if (msg.type() === 'error' || msg.text().includes('Failed') || msg.text().includes('Error')) {
      console.log(`⚠️ [CONSOLE ${msg.type()}] ${msg.text()}`);
    }
  });

  try {
    console.log('STEP 1: Signing in...\n');

    // Sign up new account
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const email = `dash-${Date.now()}@koinoniasms.com`;
    const password = 'Dashboard123!';

    await page.fill('input[name="firstName"]', 'Dashboard');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'Dashboard Church');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);

    console.log(`Registering: ${email}\n`);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(2000);

    // Clear and login
    console.log('STEP 2: Logging in...\n');

    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`\nCurrently at: ${currentUrl}`);
    console.log(currentUrl.includes('dashboard') ? '✅ On dashboard' : '❌ NOT on dashboard');

    // Now monitor dashboard loading
    console.log('\nSTEP 3: Monitoring dashboard loading...\n');

    await page.waitForTimeout(8000);

    // Check if page is still loading
    const isLoading = await page.locator('[class*="loader"], [class*="loading"], [class*="spinner"]').isVisible().catch(() => false);
    console.log(`\nPage still loading: ${isLoading ? '🔄 YES' : '✅ NO'}`);

    // Take screenshot to see what's displayed
    const displayedText = await page.locator('body').innerText().catch(() => '');
    const hasContent = displayedText.length > 100;
    console.log(`Page has content: ${hasContent ? '✅ YES' : '❌ NO (blank/minimal)'}`);

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('📊 NETWORK ANALYSIS');
    console.log('═════════════════════════════════════════════════════════════════\n');

    console.log(`Total API Requests: ${networkLog.requests.length}`);
    networkLog.requests.forEach((req, i) => {
      console.log(`  ${i + 1}. ${req.method} ${req.url}`);
    });

    console.log(`\nAPI Responses: ${networkLog.responses.length}`);
    const slowRequests = [];
    networkLog.responses.forEach((res, i) => {
      console.log(`  ${i + 1}. Status ${res.status} - ${res.responseTime}ms`);
      if (res.responseTime > 5000) {
        slowRequests.push({ status: res.status, time: res.responseTime, url: res.url });
      }
    });

    if (slowRequests.length > 0) {
      console.log(`\n⚠️ SLOW REQUESTS (>5s):`);
      slowRequests.forEach(req => {
        console.log(`  - ${req.status} Status (${req.time}ms)`);
      });
    }

    if (networkLog.errors.length > 0) {
      console.log(`\nFailed Requests: ${networkLog.errors.length}`);
      networkLog.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.url}`);
      });
    }

    console.log(`\nConsole Messages: ${consoleMessages.length}`);
    const errorMessages = consoleMessages.filter(m => m.type === 'error');
    if (errorMessages.length > 0) {
      console.log(`  Errors: ${errorMessages.length}`);
      errorMessages.slice(0, 5).forEach(msg => {
        console.log(`    - ${msg.text.substring(0, 100)}`);
      });
    }

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('🔍 DIAGNOSIS');
    console.log('═════════════════════════════════════════════════════════════════\n');

    if (isLoading && !hasContent) {
      console.log('❌ DASHBOARD IS STUCK LOADING');
      console.log('\nPossible causes:');

      if (slowRequests.length > 0) {
        console.log('1. Slow API endpoint(s) blocking dashboard');
        slowRequests.forEach(req => {
          console.log(`   - Request took ${req.time}ms`);
        });
      }

      if (networkLog.errors.length > 0) {
        console.log('2. Failed API requests');
        networkLog.errors.forEach(err => {
          console.log(`   - ${err.url.split('/').pop()}`);
        });
      }

      if (errorMessages.length > 0) {
        console.log('3. JavaScript errors on page');
      }

      // Find which specific endpoint is missing/slow
      const missingEndpoints = [
        { name: 'Profile', endpoint: '/api/admin/profile' },
        { name: 'Summary Stats', endpoint: '/api/analytics/summary' },
        { name: 'Message Stats', endpoint: '/api/analytics/messages' },
        { name: 'Groups', endpoint: '/api/groups' },
        { name: 'Members', endpoint: '/api/members' },
        { name: 'Branches', endpoint: '/api/branches' },
      ];

      console.log('\nChecking for missing/failing endpoints:');
      missingEndpoints.forEach(ep => {
        const hasResponse = networkLog.responses.some(r => r.url.includes(ep.endpoint));
        const hasFailed = networkLog.errors.some(e => e.url.includes(ep.endpoint));

        if (hasFailed) {
          console.log(`  ❌ ${ep.name}: FAILED`);
        } else if (!hasResponse) {
          console.log(`  ❌ ${ep.name}: NOT CALLED`);
        } else {
          console.log(`  ✅ ${ep.name}: OK`);
        }
      });

    } else if (hasContent) {
      console.log('✅ DASHBOARD LOADED SUCCESSFULLY');
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testDashboardLoading();
