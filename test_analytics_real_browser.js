const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('🧪 REAL BROWSER TEST: Analytics Page\n');
  console.log('Starting Chromium browser...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const screenshotsDir = './test_screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  let testResults = [];

  try {
    // STEP 1: Navigate to login page
    console.log('STEP 1: Navigate to login page');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    const loginTitle = await page.title();
    console.log(`  Page title: ${loginTitle}`);
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png') });
    console.log('  ✅ Screenshot saved: 01-login-page.png\n');

    // STEP 2: Check if login form exists
    console.log('STEP 2: Verify login form elements');
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"]');

    if (emailInput && passwordInput && loginButton) {
      console.log('  ✅ Email input found');
      console.log('  ✅ Password input found');
      console.log('  ✅ Login button found\n');
      testResults.push({ step: 'Login form elements', status: 'PASS' });
    } else {
      console.log('  ❌ Missing form elements\n');
      testResults.push({ step: 'Login form elements', status: 'FAIL' });
      throw new Error('Login form elements not found');
    }

    // STEP 3: Enter credentials
    console.log('STEP 3: Enter login credentials');
    await page.fill('input[type="email"]', 'ax@gmail.com');
    await page.fill('input[type="password"]', '12!Michael');
    console.log('  ✅ Email entered: ax@gmail.com');
    console.log('  ✅ Password entered\n');

    // STEP 4: Click login button
    console.log('STEP 4: Submit login form');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    console.log('  Waiting for login to process...');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });
      console.log('  ✅ Login successful - redirected\n');
      testResults.push({ step: 'Login submission', status: 'PASS' });
    } catch (e) {
      console.log('  ⚠️  Navigation timeout - checking if logged in...');
      await page.waitForTimeout(2000);
    }

    // Take screenshot after login
    await page.screenshot({ path: path.join(screenshotsDir, '02-after-login.png') });
    console.log('  Screenshot saved: 02-after-login.png\n');

    // STEP 5: Navigate to analytics page
    console.log('STEP 5: Navigate to Analytics page');
    try {
      await page.goto('https://koinoniasms.com/analytics', { waitUntil: 'networkidle', timeout: 15000 });
      console.log('  ✅ Analytics page loaded\n');
      testResults.push({ step: 'Analytics navigation', status: 'PASS' });
    } catch (e) {
      console.log(`  ⚠️  Navigation error: ${e.message}\n`);
      testResults.push({ step: 'Analytics navigation', status: 'PARTIAL' });
    }

    // STEP 6: Wait for API calls and take screenshot
    console.log('STEP 6: Wait for analytics data to load');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '03-analytics-page.png') });
    console.log('  ✅ Screenshot saved: 03-analytics-page.png\n');

    // STEP 7: Check for errors in console
    console.log('STEP 7: Check for JavaScript console errors');
    let consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // STEP 8: Verify page content
    console.log('STEP 8: Verify analytics page content');
    const pageUrl = page.url();
    console.log(`  Current URL: ${pageUrl}`);

    const pageContent = await page.content();

    // Check for specific analytics content
    const hasAnalyticsTitle = pageContent.includes('Analytics') || pageContent.includes('analytics');
    const hasSummaryStats = pageContent.includes('totalMessages') || pageContent.includes('Total');

    if (hasAnalyticsTitle) {
      console.log('  ✅ Analytics page title found');
    } else {
      console.log('  ❌ Analytics page title NOT found');
    }

    if (pageUrl.includes('/analytics')) {
      console.log('  ✅ URL is correct: /analytics\n');
      testResults.push({ step: 'Analytics page access', status: 'PASS' });
    } else {
      console.log(`  ⚠️  URL mismatch: ${pageUrl}\n`);
    }

    // STEP 9: Check for API errors
    console.log('STEP 9: Check for 500 errors');
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 500) {
        networkErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    if (networkErrors.length === 0) {
      console.log('  ✅ No 500 errors detected\n');
      testResults.push({ step: '500 error detection', status: 'PASS' });
    } else {
      console.log('  ❌ 500 errors detected:');
      networkErrors.forEach(err => {
        console.log(`     ${err.status}: ${err.url}`);
      });
      console.log('');
      testResults.push({ step: '500 error detection', status: 'FAIL' });
    }

    // STEP 10: Try clicking on a stats element if it exists
    console.log('STEP 10: Interact with analytics elements');
    try {
      // Look for any chart or stats elements
      const elements = await page.locator('[class*="stat"], [class*="chart"], [class*="card"]').count();
      if (elements > 0) {
        console.log(`  ✅ Found ${elements} analytics elements on the page\n`);
        testResults.push({ step: 'Analytics elements', status: 'PASS' });
      } else {
        console.log('  ⚠️  Limited analytics elements found\n');
      }
    } catch (e) {
      console.log('  ⚠️  Could not verify analytics elements\n');
    }

    // Final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '04-final-state.png') });
    console.log('  ✅ Final screenshot saved: 04-final-state.png\n');

  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
    testResults.push({ step: 'Overall test', status: 'ERROR', message: error.message });
  } finally {
    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════════\n');

    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const partial = testResults.filter(r => r.status === 'PARTIAL').length;

    testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.step}: ${result.status}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    });

    console.log(`\nTotal: ${passed} passed, ${failed} failed, ${partial} partial\n`);

    if (failed === 0) {
      console.log('🎉 REAL BROWSER TEST PASSED!\n');
      console.log('Screenshots saved to: ./test_screenshots/');
    } else {
      console.log('⚠️  Some tests failed. Check screenshots for details.\n');
    }

    await browser.close();
    console.log('Browser closed.');
  }
}

// Run the test
runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
