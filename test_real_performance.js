const { chromium } = require('playwright');
const fs = require('fs');

const TEST_EMAIL = `perf-test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'RealTest123!';

class RealAuthenticationTest {
  constructor() {
    this.startTime = null;
    this.timings = {};
  }

  log(step, message) {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${elapsed}ms] ${step}: ${message}`);
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔐 REAL AUTHENTICATION & DASHBOARD PERFORMANCE TEST');
    console.log('═══════════════════════════════════════════════════════\n');

    this.startTime = Date.now();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const networkLog = [];

    page.on('request', (request) => {
      networkLog.push({
        url: request.url(),
        method: request.method(),
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
      // STEP 1: REGISTER NEW ACCOUNT
      console.log('\n=== STEP 1: REGISTER NEW ACCOUNT ===\n');
      this.log('REGISTER_START', '🚀 Navigating to registration page...');
      const regStart = Date.now();

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
      this.log('REGISTER_LOADED', '✅ Registration page loaded');

      await page.waitForTimeout(500);

      // Fill registration form
      this.log('REGISTER_FILL', '📝 Filling registration form...');
      await page.fill('input[name="firstName"]', 'Perf');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'Performance Test Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      this.log('REGISTER_SUBMIT', '⏳ Submitting registration...');

      const [navResponse] = await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.timings.REGISTRATION = Date.now() - regStart;
      this.log('REGISTER_COMPLETE', `✅ Registration complete (${this.timings.REGISTRATION}ms)`);

      const regUrl = page.url();
      console.log(`\n📍 URL after registration: ${regUrl}`);

      await page.waitForTimeout(2000);

      // STEP 2: SIGN OUT (if needed) AND SIGN IN
      console.log('\n=== STEP 2: SIGN IN WITH NEW CREDENTIALS ===\n');

      this.log('SIGNIN_NAVIGATE', '🚀 Navigating to login page...');
      const signinStart = Date.now();

      await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
      this.log('LOGIN_LOADED', '✅ Login page loaded');

      await page.waitForTimeout(500);

      // Sign in
      this.log('SIGNIN_FILL', '🔑 Entering credentials...');
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);

      this.log('SIGNIN_SUBMIT', '⏳ Submitting login...');

      const [signinNav] = await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.timings.SIGNIN = Date.now() - signinStart;
      this.log('SIGNIN_COMPLETE', `✅ Sign-in complete (${this.timings.SIGNIN}ms)`);

      const postSigninUrl = page.url();
      console.log(`\n📍 URL after sign-in: ${postSigninUrl}`);

      await page.waitForTimeout(2000);

      // STEP 3: MEASURE DASHBOARD LOAD
      console.log('\n=== STEP 3: MEASURE DASHBOARD LOAD ===\n');

      networkLog.length = 0;
      const dashStart = Date.now();

      this.log('DASH_START', '🚀 Dashboard is loading...');

      // Wait for dashboard content to be visible
      try {
        await page.waitForSelector('[class*="dashboard"], [class*="Dashboard"], main', {
          timeout: 15000
        });
        this.timings.DASH_VISIBLE = Date.now() - dashStart;
        this.log('DASH_VISIBLE', `✅ Dashboard content visible (${this.timings.DASH_VISIBLE}ms)`);
      } catch (e) {
        this.log('DASH_ERROR', `⚠️ Could not find dashboard content: ${e.message}`);
      }

      // Wait for network idle
      try {
        await Promise.race([
          page.waitForLoadState('networkidle', { timeout: 30000 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('networkidle timeout after 30s')), 30000)
          ),
        ]);
        this.timings.DASH_IDLE = Date.now() - dashStart;
        this.log('DASH_IDLE', `✅ Network idle (${this.timings.DASH_IDLE}ms)`);
      } catch (e) {
        this.timings.DASH_IDLE = Date.now() - dashStart;
        this.log('DASH_TIMEOUT', `⚠️ ${e.message}`);
      }

      // Check page state
      const pageState = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          hasLoadingSpinner: !!document.querySelector('[data-testid="loading-spinner"]') ||
                            !!document.querySelector('.animate-spin') ||
                            !!document.querySelector('[class*="loader"]'),
          bodyLength: document.body.innerHTML.length,
          h1Text: document.querySelector('h1')?.textContent || 'NO H1',
        };
      });

      // Print results
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 REAL AUTHENTICATION RESULTS');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`📧 Test Email: ${TEST_EMAIL}`);
      console.log(`🔐 Password: ${TEST_PASSWORD}`);
      console.log(`\n⏱️  Registration Time: ${this.timings.REGISTRATION}ms`);
      console.log(`⏱️  Sign-in Time: ${this.timings.SIGNIN}ms`);
      console.log(`⏱️  Dashboard Content Visible: ${this.timings.DASH_VISIBLE}ms`);
      console.log(`⏱️  Network Idle: ${this.timings.DASH_IDLE}ms`);

      console.log(`\n📄 Page Title: ${pageState.title}`);
      console.log(`🔗 Final URL: ${pageState.url}`);
      console.log(`⏳ Loading Spinner: ${pageState.hasLoadingSpinner ? 'YES' : 'NO'}`);
      console.log(`📝 Page Content: ${pageState.bodyLength} bytes`);
      console.log(`📌 Page Header: ${pageState.h1Text}`);

      // Stripe requests check
      const stripeRequests = networkLog.filter(r => r.url.includes('stripe.com'));
      console.log(`\n🔍 STRIPE LAZY-LOADING:
✅ Stripe requests: ${stripeRequests.length} (${stripeRequests.length === 0 ? 'WORKING!' : 'LOADED'})`);

      // Top slow requests
      const sortedRequests = [...networkLog]
        .filter(r => r.duration)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 5);

      console.log('\n🐢 TOP 5 SLOWEST REQUESTS:');
      sortedRequests.forEach((req, i) => {
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 60);
        console.log(`${i + 1}. [${req.duration}ms] ${url}`);
      });

      // Summary
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✨ REAL PERFORMANCE VERDICT');
      console.log('═══════════════════════════════════════════════════════\n');

      if (postSigninUrl.includes('dashboard') || postSigninUrl.includes('branches')) {
        console.log('✅ AUTHENTICATION: Sign-in successful (redirected to dashboard)');
      } else {
        console.log(`⚠️  AUTHENTICATION: Unexpected redirect to ${postSigninUrl}`);
      }

      if (this.timings.DASH_VISIBLE < 5000) {
        console.log(`✅ DASHBOARD SPEED: Content visible in ${this.timings.DASH_VISIBLE}ms`);
      } else {
        console.log(`⚠️  DASHBOARD SPEED: Content visible in ${this.timings.DASH_VISIBLE}ms`);
      }

      if (stripeRequests.length === 0) {
        console.log('✅ STRIPE: Lazy-loading working (not loaded on dashboard)');
      } else {
        console.log(`⚠️  STRIPE: ${stripeRequests.length} requests made`);
      }

      console.log(`\n📋 Account created for future testing:`);
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.log('\nStack trace:');
      console.log(error.stack);
    } finally {
      await browser.close();
    }
  }
}

const test = new RealAuthenticationTest();
test.runTest().catch(console.error);
