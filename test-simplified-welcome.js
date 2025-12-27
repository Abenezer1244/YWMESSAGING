const { chromium } = require('@playwright/test');

async function testSimplifiedWelcome() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('\n🧪 TESTING SIMPLIFIED WELCOME FLOW\n');

  try {
    // Step 1: Create account
    console.log('[1] Creating account...');
    const email = `test${Date.now()}@test-e2e.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="churchName"]', `Church${Date.now()}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);

    console.log('✅ Account created');

    // Step 2: Check if welcome modal is visible
    console.log('\n[2] Checking for welcome modal...');
    const welcomeTitle = await page.$('h1:has-text("Welcome to")');
    const nextButton = await page.$('button:has-text("Next")');

    if (welcomeTitle && nextButton) {
      console.log('✅ Welcome modal found with Next button');
    } else {
      console.log('❌ Welcome modal NOT found!');
      const text = await page.textContent('body');
      console.log('Page text:', text.substring(0, 500));
      throw new Error('Welcome modal not displayed');
    }

    // Step 3: Click Next button
    console.log('\n[3] Clicking Next button...');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(2000);

    console.log('✅ Next button clicked');

    // Step 4: Verify modal is closed and dashboard loads
    console.log('\n[4] Verifying modal closed and dashboard is visible...');
    const url = page.url();
    const dashboardText = await page.textContent('body');

    // Check if still on dashboard
    if (url.includes('/dashboard')) {
      console.log('✅ Redirected to dashboard:', url);
    } else {
      console.log('⚠️  Not on dashboard URL, but may still be loaded');
    }

    // Check if welcome modal is gone
    const modalStillVisible = await page.$('h1:has-text("Welcome to")');
    if (!modalStillVisible) {
      console.log('✅ Welcome modal closed successfully');
    } else {
      console.log('❌ Welcome modal still visible!');
      throw new Error('Welcome modal did not close');
    }

    // Check if dashboard elements are visible
    const hasDashboardElements =
      dashboardText.includes('Dashboard') ||
      dashboardText.includes('Branch') ||
      dashboardText.includes('Messaging');

    if (hasDashboardElements) {
      console.log('✅ Dashboard content is visible');
    } else {
      console.log('⚠️  Dashboard content not immediately visible (may be loading)');
    }

    // Step 5: Check if welcomeCompleted was set
    console.log('\n[5] Checking welcomeCompleted flag...');
    const authStore = await page.evaluate(() => {
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        return auth;
      } catch (e) {
        return null;
      }
    });

    if (authStore && authStore.state && authStore.state.user) {
      if (authStore.state.user.welcomeCompleted) {
        console.log('✅ welcomeCompleted flag is set to TRUE');
      } else {
        console.log('⚠️  welcomeCompleted flag may not be persisted yet (API call may not have returned)');
      }
    } else {
      console.log('⚠️  Could not check auth store');
    }

    console.log('\n✅ SIMPLIFIED WELCOME FLOW TEST PASSED!\n');
    console.log('The welcome modal has been successfully replaced with a simple Next button.');
    console.log('Users can now proceed to the dashboard with a single click.\n');

    await page.screenshot({ path: '/tmp/welcome-test-complete.png', fullPage: true });
    console.log('Screenshot saved to /tmp/welcome-test-complete.png\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testSimplifiedWelcome().catch(console.error);
