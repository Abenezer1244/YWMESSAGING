const { chromium } = require('playwright');

async function debugTokenRevocation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const apiCalls = [];
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      apiCalls.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });

  try {
    console.log('🔍 Step 1: Navigate to login page');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    console.log('✅ Login page loaded');

    console.log('\n🔍 Step 2: Sign in with credentials');
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');

    console.log('⏳ Waiting for login to complete...');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Login successful');

    console.log('\n🔍 Step 3: Check localStorage for tokens');
    const localStorage = await page.evaluate(() => {
      return {
        keys: Object.keys(window.localStorage),
        onboarding_progress: window.localStorage.getItem('onboarding_progress'),
      };
    });
    console.log('localStorage keys:', localStorage.keys);
    console.log('onboarding_progress:', localStorage.onboarding_progress);

    console.log('\n🔍 Step 4: Check cookies');
    const cookies = await page.context().cookies();
    cookies.forEach(cookie => {
      const val = cookie.value.substring(0, 50);
      console.log(`Cookie: ${cookie.name} = ${val}...`);
    });

    console.log('\n🔍 Step 5: Navigate to Members page');
    await page.goto('https://koinoniasms.com/dashboard/members', { waitUntil: 'networkidle', timeout: 10000 });

    await page.waitForTimeout(2000);

    console.log('\n🔍 Step 6: Check for errors in page');
    const errors = await page.evaluate(() => {
      return document.body.innerText;
    });

    if (errors.includes('revoked') || errors.includes('Unauthorized')) {
      console.log('❌ Token revocation error found on page');
      console.log('Page content:', errors.substring(0, 500));
    } else {
      console.log('✅ No token revocation error on page');
      console.log('Page appears to be loading normally');
    }

    console.log('\n🔍 Step 7: API calls made');
    apiCalls.forEach(call => {
      const path = call.url.substring(call.url.lastIndexOf('/'));
      console.log(`  ${path} - Status: ${call.status}`);
    });

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
  }
}

debugTokenRevocation();
