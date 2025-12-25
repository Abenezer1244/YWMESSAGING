const { chromium } = require('playwright');

const TEST_EMAIL = `debug-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'DebugTest123!';

class DebugSignInTest {
  constructor() {
    this.startTime = null;
  }

  log(message) {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${elapsed}ms] ${message}`);
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🐛 DEBUG SIGN-IN TEST');
    console.log('Capturing all API responses to debug the issue');
    console.log('═══════════════════════════════════════════════════════\n');

    this.startTime = Date.now();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const apiResponses = [];

    // Intercept all API responses
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        const status = response.status();
        let bodyText = '';

        try {
          bodyText = await response.text();
        } catch (e) {
          bodyText = '[Could not read body]';
        }

        apiResponses.push({
          url: url.replace(/^https?:\/\//, ''),
          method: response.request().method(),
          status: status,
          body: bodyText.substring(0, 500), // First 500 chars
          timestamp: new Date().toISOString(),
        });

        console.log(`\n📡 API RESPONSE: ${response.request().method()} ${url.replace(/^https?:\/\//, '')}`);
        console.log(`   Status: ${status}`);
        if (bodyText) {
          console.log(`   Body: ${bodyText.substring(0, 200)}`);
        }
      }
    });

    try {
      // STEP 1: REGISTER
      console.log('\n=== STEP 1: REGISTER ===\n');
      this.log('🚀 Registering account...');

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      await page.fill('input[name="firstName"]', 'Debug');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'Debug Test Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.log('✅ Registration complete');
      console.log(`   Created account: ${TEST_EMAIL}`);

      await page.waitForTimeout(2000);

      // STEP 2: CLEAR AUTH AND GO TO LOGIN
      console.log('\n=== STEP 2: CLEAR AUTH & GO TO LOGIN ===\n');

      await context.clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      this.log('✅ On login page');

      // STEP 3: ATTEMPT LOGIN WITH DEBUG
      console.log('\n=== STEP 3: SIGN IN (WITH NETWORK CAPTURE) ===\n');
      this.log('🔑 Attempting login...');

      // Wait for inputs to be visible
      await page.waitForSelector('input[name="email"]', { timeout: 10000 });

      const emailField = page.locator('input[name="email"]');
      const passwordField = page.locator('input[name="password"]');
      const loginBtn = page.locator('button[type="submit"]');

      // Check if fields are visible
      const emailVisible = await emailField.isVisible();
      const passwordVisible = await passwordField.isVisible();
      const loginVisible = await loginBtn.isVisible();

      console.log(`\nField visibility:`);
      console.log(`  Email field: ${emailVisible ? '✅ visible' : '❌ hidden'}`);
      console.log(`  Password field: ${passwordVisible ? '✅ visible' : '❌ hidden'}`);
      console.log(`  Login button: ${loginVisible ? '✅ visible' : '❌ hidden'}`);

      // Fill fields
      this.log('📝 Filling login form...');
      await emailField.fill(TEST_EMAIL);
      await passwordField.fill(TEST_PASSWORD);

      this.log('⏳ Clicking login...');

      // Click login and wait for any navigation or response
      const clickTime = Date.now();

      let navigationError = null;
      let finalUrl = null;

      try {
        await Promise.race([
          page.waitForNavigation({ timeout: 10000 }).catch((e) => {
            navigationError = e.message;
          }),
          new Promise((resolve) => {
            // Also check every 2 seconds if something changed
            const checkInterval = setInterval(() => {
              const currentUrl = page.url();
              if (currentUrl !== 'https://koinoniasms.com/login') {
                finalUrl = currentUrl;
                clearInterval(checkInterval);
                resolve('URL changed');
              }
            }, 2000);

            setTimeout(() => {
              clearInterval(checkInterval);
              resolve('timeout');
            }, 15000);
          }),
        ]);
      } catch (e) {
        navigationError = e.message;
      }

      const elapsedTime = Date.now() - clickTime;
      this.log(`⏰ Response after ${elapsedTime}ms`);

      if (navigationError) {
        console.log(`   Navigation error: ${navigationError}`);
      }

      const currentUrl = page.url();
      console.log(`   Final URL: ${currentUrl}`);

      if (finalUrl && finalUrl !== currentUrl) {
        console.log(`   (Changed from login page)`);
      } else {
        console.log(`   (Still on login page)`);
      }

      // Check page state
      const pageTitle = await page.title();
      console.log(`   Page title: ${pageTitle}`);

      // Check for error messages on page
      const pageContent = await page.evaluate(() => {
        return {
          errorText: document.body.innerText.substring(0, 500),
          hasError: document.body.innerText.toLowerCase().includes('error') ||
                   document.body.innerText.toLowerCase().includes('invalid'),
        };
      });

      console.log(`   Has error text: ${pageContent.hasError ? '✅ YES' : '❌ NO'}`);

      // SUMMARY
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 API RESPONSES CAPTURED');
      console.log('═══════════════════════════════════════════════════════\n');

      if (apiResponses.length === 0) {
        console.log('❌ NO API RESPONSES CAPTURED!');
        console.log('   This means the API request never left the browser.');
        console.log('   Possible causes:');
        console.log('   - CORS error (blocked by browser)');
        console.log('   - Network error');
        console.log('   - API endpoint not found');
      } else {
        console.log(`Total API responses: ${apiResponses.length}\n`);

        apiResponses.forEach((response) => {
          console.log(`${response.method} ${response.url}`);
          console.log(`  Status: ${response.status}`);
          if (response.body) {
            console.log(`  Body: ${response.body}`);
          }
        });
      }

      // Look specifically for auth/login response
      const loginResponse = apiResponses.find((r) => r.url.includes('/auth/login'));
      if (!loginResponse) {
        console.log('\n❌ NO /auth/login RESPONSE FOUND!');
        console.log('   The login API request was never made or received no response.');
      } else {
        console.log(`\n✅ /auth/login response found:`);
        console.log(`   Status: ${loginResponse.status}`);
        console.log(`   Body: ${loginResponse.body}`);
      }

      console.log(`\n═══════════════════════════════════════════════════════`);
      console.log(`🎯 DIAGNOSIS`);
      console.log(`═══════════════════════════════════════════════════════\n`);

      if (!loginResponse) {
        console.log('❌ ISSUE: API request never reached backend');
        console.log('   Check browser console for network errors');
        console.log('   Check if CORS is configured correctly');
        console.log('   Check API_BASE_URL is correct');
      } else if (loginResponse.status === 401) {
        console.log('⚠️ ISSUE: Authentication failed (401)');
        console.log(`   Response: ${loginResponse.body}`);
        console.log('   Check: Email/password combination might be invalid');
      } else if (loginResponse.status >= 500) {
        console.log('❌ ISSUE: Server error');
        console.log(`   Status: ${loginResponse.status}`);
        console.log(`   Response: ${loginResponse.body}`);
      } else if (loginResponse.status === 200) {
        console.log('✅ API SUCCESS but navigation failed');
        console.log('   The login request succeeded but redirect didnt happen');
        console.log(`   Response: ${loginResponse.body}`);
      }

    } catch (error) {
      console.error('\n❌ Test error:', error.message);
    } finally {
      await browser.close();
    }
  }
}

const test = new DebugSignInTest();
test.runTest().catch(console.error);
