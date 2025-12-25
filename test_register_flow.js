const { chromium } = require('playwright');

const TEST_EMAIL = `test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'TestPassword123!';

async function testRegister() {
  console.log('🚀 Starting registration test...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  let errorCount = 0;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errorCount++;
      console.log(`[ERROR] ${msg.text()}`);
    }
  });

  try {
    console.log('\n📝 Step 1: Navigate to register page');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('📸 Capturing register page screenshot');
    await page.screenshot({ path: '1-register-page.png', fullPage: true });

    console.log('\n📝 Step 2: Fill in registration form');
    console.log(`Email: ${TEST_EMAIL}`);

    // Fill using name attributes
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="churchName"]', 'Test Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    console.log('✅ Form filled');

    console.log('\n📝 Step 3: Submit form');
    await page.click('button[type="submit"]');

    console.log('⏳ Waiting for redirect (up to 15 seconds)...');
    const url = await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {
      return page.url();
    });

    console.log(`Current URL: ${url}`);

    if (url.includes('dashboard')) {
      console.log('✅ Successfully registered and redirected to dashboard');

      console.log('\n📝 Step 4: Wait for dashboard content to load');
      await page.waitForTimeout(3000);

      console.log('📸 Capturing dashboard screenshot');
      await page.screenshot({ path: '2-dashboard.png', fullPage: true });

      // Check for specific dashboard elements
      const hasHeader = await page.locator('header, [role="banner"]').count() > 0;
      const hasNav = await page.locator('nav, [role="navigation"]').count() > 0;
      const hasMainContent = await page.locator('main, [role="main"]').count() > 0;

      console.log(`\nDashboard elements:`);
      console.log(`  - Has header: ${hasHeader}`);
      console.log(`  - Has navigation: ${hasNav}`);
      console.log(`  - Has main content: ${hasMainContent}`);

      // Try navigating to other pages
      console.log('\n📝 Step 5: Test navigation to Settings');
      try {
        await page.click('a[href*="settings"], button:has-text("Settings")');
        await page.waitForTimeout(3000);
        const settingsUrl = page.url();
        console.log(`Settings URL: ${settingsUrl}`);

        if (settingsUrl.includes('settings')) {
          console.log('✅ Successfully navigated to settings');
          await page.screenshot({ path: '3-settings.png', fullPage: true });
        }
      } catch (e) {
        console.log(`⚠️ Settings navigation failed: ${e.message}`);
      }

      // Try navigating to Branches
      console.log('\n📝 Step 6: Test navigation to Branches');
      try {
        await page.goto('https://koinoniasms.com/dashboard/branches', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        console.log('✅ Successfully navigated to branches');
        await page.screenshot({ path: '4-branches.png', fullPage: true });
      } catch (e) {
        console.log(`⚠️ Branches navigation failed: ${e.message}`);
      }

    } else {
      console.log('❌ Registration failed - not redirected to dashboard');
      console.log(`Current page: ${url}`);
      await page.screenshot({ path: 'error-after-register.png', fullPage: true });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }

  console.log(`\n📊 Summary: ${errorCount} console errors detected`);
  await browser.close();
}

testRegister();
