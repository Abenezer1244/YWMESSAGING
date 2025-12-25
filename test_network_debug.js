const { chromium } = require('playwright');
const fs = require('fs');

const TEST_EMAIL = `test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'TestPassword123!';

async function testNetwork() {
  console.log('🚀 Starting network debug test...\n');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const pendingRequests = {};
  const failedRequests = [];

  page.on('request', req => {
    pendingRequests[req.url()] = {
      method: req.method(),
      url: req.url(),
      startTime: Date.now()
    };
  });

  page.on('response', res => {
    const url = res.url();
    if (pendingRequests[url]) {
      delete pendingRequests[url];
    }
    if (res.status() >= 400) {
      failedRequests.push({
        status: res.status(),
        method: res.request().method(),
        url: url
      });
    }
  });

  page.on('requestfailed', req => {
    if (pendingRequests[req.url()]) {
      delete pendingRequests[req.url()];
    }
    failedRequests.push({
      status: 'FAILED',
      method: req.method(),
      url: req.url(),
      error: req.failure().errorText
    });
  });

  try {
    // Register
    console.log('📝 Registering user...');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="churchName"]', 'Test Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000);

    console.log(`✅ Registered, on: ${page.url()}\n`);

    // Now try navigating to settings and monitor requests
    console.log('📝 Navigating to settings page (with network monitoring)...');
    console.log('⏳ Waiting 10 seconds while monitoring requests...\n');

    const startNav = Date.now();
    page.goto('https://koinoniasms.com/dashboard/settings', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});

    // Monitor for 10 seconds
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      console.log(`[${i + 1}s] Pending requests: ${Object.keys(pendingRequests).length}`);
      if (Object.keys(pendingRequests).length > 0) {
        Object.keys(pendingRequests).slice(0, 3).forEach(url => {
          const duration = Date.now() - pendingRequests[url].startTime;
          console.log(`  ⏳ ${pendingRequests[url].method} ${url.substring(0, 80)} (${duration}ms)`);
        });
      }
    }

    const elapsed = Date.now() - startNav;
    console.log(`\n📊 After ${elapsed}ms:`);
    console.log(`  Pending requests: ${Object.keys(pendingRequests).length}`);
    console.log(`  Failed requests: ${failedRequests.length}`);

    console.log('\n❌ Failed/Error Requests:');
    failedRequests.slice(0, 10).forEach(req => {
      console.log(`  ${req.status} ${req.method} ${req.url.substring(0, 100)}`);
      if (req.error) console.log(`    Error: ${req.error}`);
    });

    if (Object.keys(pendingRequests).length > 0) {
      console.log('\n⏳ Still Pending Requests (likely hanging):');
      Object.keys(pendingRequests).slice(0, 5).forEach(url => {
        const duration = Date.now() - pendingRequests[url].startTime;
        console.log(`  ${pendingRequests[url].method} ${url.substring(0, 100)}`);
        console.log(`    Duration: ${duration}ms`);
      });
    }

    // Save detailed report
    fs.writeFileSync('network-debug.json', JSON.stringify({
      testEmail: TEST_EMAIL,
      currentUrl: page.url(),
      elapsedMs: elapsed,
      failedRequests: failedRequests,
      pendingRequests: Object.keys(pendingRequests).map(url => ({
        ...pendingRequests[url],
        durationMs: Date.now() - pendingRequests[url].startTime
      }))
    }, null, 2));

    console.log('\n📄 Detailed report saved to: network-debug.json');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }

  await browser.close();
}

testNetwork();
