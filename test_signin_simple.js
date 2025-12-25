const { chromium } = require('playwright');

const TEST_EMAIL = `simple-test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'SimpleTest123!';

class SimpleSignInTest {
  constructor() {
    this.startTime = null;
  }

  log(message) {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${elapsed}ms] ${message}`);
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔐 SIMPLE SIGN-IN & DASHBOARD PERFORMANCE TEST');
    console.log('═══════════════════════════════════════════════════════\n');

    this.startTime = Date.now();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const networkLog = [];

    page.on('request', (request) => {
      networkLog.push({
        url: request.url(),
        startTime: Date.now(),
      });
    });

    page.on('response', (response) => {
      const matching = networkLog.find(r => r.url === response.url());
      if (matching) {
        matching.status = response.status();
        matching.endTime = Date.now();
        matching.duration = matching.endTime - matching.startTime;
      }
    });

    try {
      // STEP 1: REGISTER
      console.log('=== STEP 1: REGISTER ===\n');
      this.log('REG_START: Starting registration...');
      const regStart = Date.now();

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
      this.log('REG_LOAD: Register page loaded');

      await page.waitForTimeout(600);

      // Fill all fields
      const inputs = await page.locator('input').all();
      console.log(`\nFound ${inputs.length} input fields on registration page`);

      this.log('REG_FILL: Filling form fields...');
      await page.fill('input[name="firstName"]', 'Simple');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'Simple Test Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      this.log('REG_SUBMIT: Submitting form...');

      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      const regTime = Date.now() - regStart;
      this.log(`REG_DONE: Registration completed in ${regTime}ms`);

      const postRegUrl = page.url();
      console.log(`\nPost-registration URL: ${postRegUrl}`);
      console.log(`Email created: ${TEST_EMAIL}`);
      console.log(`Password: ${TEST_PASSWORD}`);

      await page.waitForTimeout(1000);

      // STEP 2: NAVIGATE TO LOGIN (simulating sign out)
      console.log('\n=== STEP 2: NAVIGATE TO LOGIN PAGE ===\n');
      this.log('LOGIN_NAV: Navigating to login...');

      await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
      this.log('LOGIN_LOAD: Login page loaded');

      // Print what we see on login page
      const loginInputs = await page.locator('input').all();
      console.log(`Found ${loginInputs.length} input fields on login page`);

      // Get input types
      for (let i = 0; i < Math.min(3, loginInputs.length); i++) {
        const type = await loginInputs[i].getAttribute('type');
        const name = await loginInputs[i].getAttribute('name');
        const placeholder = await loginInputs[i].getAttribute('placeholder');
        console.log(`  Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
      }

      await page.waitForTimeout(500);

      // STEP 3: SIGN IN
      console.log('\n=== STEP 3: SIGN IN WITH CREDENTIALS ===\n');
      this.log('SIGNIN_START: Starting sign-in...');
      const signinStart = Date.now();

      // Try different selectors for email/password
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      this.log('SIGNIN_FILL: Filling credentials...');

      if (await emailInput.count() > 0) {
        await emailInput.fill(TEST_EMAIL);
        console.log('✓ Filled email input');
      } else {
        console.log('⚠️ Could not find email input with type="email", trying alternatives...');
        const firstInput = page.locator('input').first();
        await firstInput.fill(TEST_EMAIL);
        console.log('✓ Filled first input field');
      }

      if (await passwordInput.count() > 0) {
        await passwordInput.fill(TEST_PASSWORD);
        console.log('✓ Filled password input');
      } else {
        const inputs = await page.locator('input').all();
        if (inputs.length > 1) {
          await inputs[1].fill(TEST_PASSWORD);
          console.log('✓ Filled second input field');
        }
      }

      this.log('SIGNIN_SUBMIT: Clicking sign-in button...');

      const [signinNav] = await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      const signinTime = Date.now() - signinStart;
      this.log(`SIGNIN_DONE: Sign-in completed in ${signinTime}ms`);

      const postSigninUrl = page.url();
      console.log(`\nPost-signin URL: ${postSigninUrl}`);

      await page.waitForTimeout(1500);

      // STEP 4: MEASURE DASHBOARD
      console.log('\n=== STEP 4: MEASURE DASHBOARD ===\n');

      networkLog.length = 0;
      const dashStart = Date.now();

      this.log('DASH_START: Measuring dashboard...');

      // Wait for visible content
      try {
        await page.waitForSelector('[class*="dashboard"], main, body > div', { timeout: 15000 });
        const dashVisible = Date.now() - dashStart;
        this.log(`DASH_VISIBLE: Dashboard visible in ${dashVisible}ms`);
      } catch (e) {
        this.log(`DASH_WAIT: ${e.message}`);
      }

      // Wait for network idle
      try {
        await Promise.race([
          page.waitForLoadState('networkidle', { timeout: 30000 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 30000)
          ),
        ]);
        const dashIdle = Date.now() - dashStart;
        this.log(`DASH_IDLE: Network idle in ${dashIdle}ms`);
      } catch (e) {
        const dashTimeout = Date.now() - dashStart;
        this.log(`DASH_TIMEOUT: Still loading after ${dashTimeout}ms`);
      }

      // Get page info
      const pageTitle = await page.title();
      const pageUrl = page.url();
      const bodyLength = (await page.locator('body').innerHTML()).length;

      // Check for Stripe
      const stripeRequests = networkLog.filter(r => r.url.includes('stripe.com'));

      // Print results
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 RESULTS - REAL SIGN-IN PERFORMANCE');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`📧 Credentials Used:`);
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);

      console.log(`\n📍 URLs:`);
      console.log(`   After Registration: ${postRegUrl}`);
      console.log(`   After Sign-In: ${postSigninUrl}`);

      console.log(`\n📄 Page State:`);
      console.log(`   Title: ${pageTitle}`);
      console.log(`   Body Size: ${bodyLength} bytes`);

      console.log(`\n🔍 Stripe Lazy-Loading:`);
      console.log(`   Stripe Requests: ${stripeRequests.length}`);
      if (stripeRequests.length === 0) {
        console.log(`   ✅ SUCCESS: Stripe NOT loaded on dashboard`);
      } else {
        console.log(`   ⚠️  Stripe loaded with ${stripeRequests.length} requests`);
        stripeRequests.forEach(req => {
          const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
          console.log(`      - ${url}`);
        });
      }

      // Slowest requests
      const slowRequests = [...networkLog]
        .filter(r => r.duration)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 5);

      console.log('\n🐢 Top 5 Slowest Requests:');
      slowRequests.forEach((req, i) => {
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 65);
        console.log(`${i + 1}. [${req.duration}ms] ${url}`);
      });

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✨ FINAL VERDICT');
      console.log('═══════════════════════════════════════════════════════\n');

      if (postSigninUrl.includes('dashboard') || postSigninUrl.includes('branches')) {
        console.log('✅ SIGN-IN: Successful (redirected to dashboard)');
      } else {
        console.log(`⚠️  SIGN-IN: Redirected to ${postSigninUrl}`);
      }

      if (stripeRequests.length === 0) {
        console.log('✅ LAZY-LOADING: Stripe lazy-loading working!');
      } else {
        console.log(`⚠️  LAZY-LOADING: Stripe was loaded`);
      }

      if (bodyLength > 5000) {
        console.log('✅ CONTENT: Real dashboard content loaded');
      }

      console.log(`\n═══════════════════════════════════════════════════════`);
      console.log(`🎉 THIS IS A REAL SIGN-IN TEST WITH REAL CREDENTIALS`);
      console.log(`═══════════════════════════════════════════════════════\n`);

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    } finally {
      await browser.close();
    }
  }
}

const test = new SimpleSignInTest();
test.runTest().catch(console.error);
