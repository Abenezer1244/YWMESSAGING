const { chromium } = require('playwright');

const TEST_EMAIL = `debug-signin-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'DebugSignIn123!';

class SignInDebugTest {
  constructor() {
    this.consoleLogs = [];
    this.startTime = null;
  }

  log(message) {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${elapsed}ms] ${message}`);
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 SIGN-IN DEBUG TEST WITH CONSOLE LOGGING');
    console.log('═══════════════════════════════════════════════════════\n');

    this.startTime = Date.now();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capture ALL console messages
    page.on('console', (msg) => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
      };
      this.consoleLogs.push(logEntry);

      // Print in real-time with emoji
      const emoji = msg.type() === 'error' ? '❌' : msg.type() === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} [${msg.type()}] ${msg.text()}`);
    });

    try {
      // STEP 1: REGISTER
      console.log('\n=== STEP 1: REGISTER NEW ACCOUNT ===\n');
      this.log('🚀 Navigating to registration page...');

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded', timeout: 15000 });
      this.log('✅ Register page loaded');

      await page.waitForTimeout(800);

      this.log('📝 Filling registration form...');
      await page.fill('input[name="firstName"]', 'Debug');
      await page.fill('input[name="lastName"]', 'SignIn');
      await page.fill('input[name="churchName"]', 'Debug SignIn Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      this.log('⏳ Submitting registration...');

      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.log('✅ Registration complete');
      console.log(`\n   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
      console.log(`   Post-reg URL: ${page.url()}`);

      await page.waitForTimeout(2000);

      // STEP 2: CLEAR & NAVIGATE TO LOGIN
      console.log('\n=== STEP 2: CLEAR AUTH & NAVIGATE TO LOGIN PAGE ===\n');
      this.log('🚀 Clearing authentication...');

      await context.clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      this.log('🚀 Navigating to login page...');
      this.consoleLogs = []; // Clear logs to see only login-related messages

      await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
      this.log('✅ Login page loaded');

      await page.waitForTimeout(2000);

      // STEP 3: SIGN IN WITH DEBUG
      console.log('\n=== STEP 3: SIGN IN (CAPTURE CONSOLE LOGS) ===\n');
      this.log('🔑 Starting sign-in process...');

      // Wait for email input
      await page.waitForSelector('input[name="email"]', { timeout: 10000 });
      await page.waitForTimeout(500);

      this.log('📝 Filling email and password...');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);

      this.log('⏳ Clicking login button...');
      console.log('\n--- CONSOLE OUTPUT DURING LOGIN ---\n');

      // Click and wait for something to happen
      const clickTime = Date.now();
      let navError = null;
      let finalUrl = null;

      try {
        await Promise.race([
          page.waitForNavigation({ timeout: 10000 }).catch((e) => {
            navError = e.message;
          }),
          new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              const currentUrl = page.url();
              if (currentUrl !== 'https://koinoniasms.com/login') {
                finalUrl = currentUrl;
                clearInterval(checkInterval);
                resolve('URL changed');
              }
            }, 500);

            setTimeout(() => {
              clearInterval(checkInterval);
              resolve('timeout');
            }, 15000);
          }),
        ]);
      } catch (e) {
        navError = e.message;
      }

      const elapsedTime = Date.now() - clickTime;
      console.log('\n--- END CONSOLE OUTPUT ---\n');

      this.log(`⏰ Response after ${elapsedTime}ms`);

      const currentUrl = page.url();
      console.log(`\n📍 Final URL: ${currentUrl}`);
      console.log(`   Still on login page: ${currentUrl === 'https://koinoniasms.com/login'}`);

      // SUMMARY
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 CONSOLE LOGS CAPTURED DURING SIGN-IN');
      console.log('═══════════════════════════════════════════════════════\n');

      const loginRelated = this.consoleLogs.filter(
        (log) => log.text.includes('[LoginPage]') || log.text.includes('[auth.login]')
      );

      if (loginRelated.length === 0) {
        console.log('❌ NO LOGIN-RELATED CONSOLE LOGS FOUND');
        console.log('   This means onSubmit handler was never called!');
      } else {
        console.log(`Found ${loginRelated.length} login-related logs:\n`);
        loginRelated.forEach((log, i) => {
          console.log(`${i + 1}. [${log.type}] ${log.text}`);
        });
      }

      console.log('\n=== ALL CONSOLE LOGS ===\n');
      console.log(`Total console messages: ${this.consoleLogs.length}\n`);

      this.consoleLogs.forEach((log, i) => {
        const emoji = log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} [${log.type}] ${log.text}`);
      });

      // DIAGNOSIS
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔍 DIAGNOSIS');
      console.log('═══════════════════════════════════════════════════════\n');

      if (loginRelated.length === 0) {
        console.log('❌ Form submit handler never called');
        console.log('   Possible causes:');
        console.log('   1. Form validation is blocking submission');
        console.log('   2. Button click is not reaching form submit');
        console.log('   3. React Hook Form is not configured correctly');
      } else if (!loginRelated.some((log) => log.text.includes('About to make axios POST'))) {
        console.log('⚠️ Form submit handler called but login() API function never reached');
        console.log('   Something is preventing the API call');
      } else if (!loginRelated.some((log) => log.text.includes('Axios POST returned'))) {
        console.log('❌ API call made but failed');
        const errorLogs = loginRelated.filter((log) => log.type === 'error');
        if (errorLogs.length > 0) {
          console.log('   Error details from logs:');
          errorLogs.forEach((log) => console.log(`   - ${log.text}`));
        }
      } else {
        console.log('✅ Sign-in was successful!');
        console.log('   Login API returned successfully');
      }

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    } finally {
      await browser.close();
    }
  }
}

const test = new SignInDebugTest();
test.runTest().catch(console.error);
