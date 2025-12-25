const { chromium } = require('playwright');
const fs = require('fs');

const TEST_EMAIL = `test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'TestPassword123!';

async function testFull() {
  console.log('🚀 Starting full Koinonia flow test...\n');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    email: TEST_EMAIL,
    steps: []
  };

  async function logStep(name, success, details = '') {
    const msg = `${success ? '✅' : '❌'} ${name}`;
    console.log(msg);
    if (details) console.log(`   ${details}`);
    results.steps.push({ name, success, details });
  }

  try {
    // Step 1: Register
    await logStep('Navigating to register page', true);
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await logStep('Filling registration form', true, `Email: ${TEST_EMAIL}`);
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="churchName"]', 'Test Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    await logStep('Submitting registration form', true);
    await page.click('button[type="submit"]');

    // Wait for navigation
    try {
      await page.waitForNavigation({ timeout: 15000 });
    } catch {
      // Navigation timed out, but page might have still changed
    }

    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    const isOnDashboard = currentUrl && currentUrl.includes('dashboard');

    await logStep('Registration & redirect to dashboard', isOnDashboard, `URL: ${currentUrl}`);

    if (isOnDashboard) {
      // Step 2: Dashboard
      await logStep('Dashboard page loaded', true);

      // Try navigating around
      await logStep('Attempting settings navigation', true);
      try {
        await page.goto('https://koinoniasms.com/dashboard/settings', { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);
        await logStep('Settings page loaded', true, `URL: ${page.url()}`);
      } catch (e) {
        await logStep('Settings page load failed', false, e.message);
      }

      await logStep('Attempting branches navigation', true);
      try {
        await page.goto('https://koinoniasms.com/dashboard/branches', { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);
        await logStep('Branches page loaded', true, `URL: ${page.url()}`);
      } catch (e) {
        await logStep('Branches page load failed', false, e.message);
      }

      await logStep('Attempting messages navigation', true);
      try {
        await page.goto('https://koinoniasms.com/dashboard/messages', { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);
        await logStep('Messages page loaded', true, `URL: ${page.url()}`);
      } catch (e) {
        await logStep('Messages page load failed', false, e.message);
      }

      // Step 3: Test logout
      await logStep('Attempting logout', true);
      try {
        await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'networkidle' });
        // Click logout button if exists
        const logoutBtn = await page.$('button:has-text("Logout"), button:has-text("Sign out")');
        if (logoutBtn) {
          await logoutBtn.click();
          await page.waitForNavigation({ timeout: 5000 });
          const postLogoutUrl = page.url();
          const isOnLogin = postLogoutUrl && postLogoutUrl.includes('login');
          await logStep('Logout successful', isOnLogin, `URL: ${postLogoutUrl}`);
        } else {
          await logStep('Logout button not found', false);
        }
      } catch (e) {
        await logStep('Logout test failed', false, e.message);
      }
    } else {
      await logStep('Dashboard not reached after registration', false, `Final URL: ${currentUrl}`);
    }

  } catch (error) {
    console.error('\n❌ Test crashed:', error.message);
    results.steps.push({ name: 'Test crash', success: false, details: error.message });
  }

  // Save results
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Results saved to: test-results.json');

  const successCount = results.steps.filter(s => s.success).length;
  const totalCount = results.steps.length;
  console.log(`\n📊 Summary: ${successCount}/${totalCount} steps successful`);

  await browser.close();
}

testFull();
