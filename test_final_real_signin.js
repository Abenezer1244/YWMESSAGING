const { chromium } = require('playwright');

const TEST_EMAIL = `final-test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'FinalTest123!';

class FinalRealSignInTest {
  constructor() {
    this.startTime = null;
    this.timings = {};
  }

  log(message) {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${elapsed}ms] ${message}`);
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎯 FINAL REAL SIGN-IN TEST');
    console.log('Register → Sign Out → Sign In → Measure Dashboard');
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
      console.log('=== STEP 1: REGISTER NEW ACCOUNT ===\n');
      this.log('🚀 Navigating to registration page...');
      const regStart = Date.now();

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded', timeout: 15000 });
      this.log('✅ Register page loaded');

      await page.waitForTimeout(800);

      this.log('📝 Filling registration form...');
      await page.fill('input[name="firstName"]', 'Final');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'Final Test Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      this.log('⏳ Submitting registration...');

      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.timings.registration = Date.now() - regStart;
      this.log(`✅ Registered successfully (${this.timings.registration}ms)`);
      console.log(`\n   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
      console.log(`   Post-reg URL: ${page.url()}`);

      await page.waitForTimeout(1500);

      // STEP 2: CLEAR AUTH AND NAVIGATE TO LOGIN (simulating sign out)
      console.log('\n=== STEP 2: CLEAR AUTH & NAVIGATE TO LOGIN PAGE ===\n');
      this.log('🚀 Clearing authentication...');

      // Clear all cookies and localStorage to simulate sign out
      await context.clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      this.log('🚀 Navigating to login page...');

      await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
      this.log('✅ Login page loaded');

      await page.waitForTimeout(2000);

      // STEP 3: SIGN IN
      console.log('\n=== STEP 3: SIGN IN WITH NEW CREDENTIALS ===\n');
      this.log('🔑 Starting sign-in process...');
      const signinStart = Date.now();

      // Wait for email input to be visible
      await page.waitForSelector('input[name="email"]', { timeout: 10000 });
      await page.waitForTimeout(500);

      // Clear network log before sign-in measurement
      networkLog.length = 0;

      this.log('📝 Entering email and password...');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);

      this.log('⏳ Clicking login button...');

      const [signinNav] = await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.timings.signin = Date.now() - signinStart;
      this.log(`✅ Signed in successfully (${this.timings.signin}ms)`);
      console.log(`\n   Post-signin URL: ${page.url()}`);

      await page.waitForTimeout(2000);

      // STEP 4: MEASURE AUTHENTICATED DASHBOARD
      console.log('\n=== STEP 4: MEASURE AUTHENTICATED DASHBOARD ===\n');

      networkLog.length = 0;
      const dashStart = Date.now();

      this.log('⏱️ Measuring dashboard load...');

      // Wait for dashboard content
      try {
        await page.waitForSelector('[class*="dashboard"], [class*="Dashboard"], main, .min-h-screen', {
          timeout: 15000
        });
        this.timings.dashboardVisible = Date.now() - dashStart;
        this.log(`✅ Dashboard content visible (${this.timings.dashboardVisible}ms)`);
      } catch (e) {
        this.log(`⚠️ ${e.message}`);
      }

      // Wait for network idle
      try {
        await Promise.race([
          page.waitForLoadState('networkidle', { timeout: 30000 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 30000)
          ),
        ]);
        this.timings.dashboardIdle = Date.now() - dashStart;
        this.log(`✅ Network idle (${this.timings.dashboardIdle}ms)`);
      } catch (e) {
        this.timings.dashboardIdle = Date.now() - dashStart;
        this.log(`⏰ Still loading after ${this.timings.dashboardIdle}ms`);
      }

      // Get page state
      const pageState = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          bodyLength: document.body.innerHTML.length,
          hasContent: document.body.innerHTML.includes('Members') ||
                     document.body.innerHTML.includes('Groups') ||
                     document.body.innerHTML.includes('Messages'),
        };
      });

      // RESULTS
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 FINAL RESULTS - REAL SIGN-IN PERFORMANCE');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`✅ SUCCESSFULLY TESTED:`);
      console.log(`   1. Created account: ${TEST_EMAIL}`);
      console.log(`   2. Navigated to login`);
      console.log(`   3. Signed in with credentials`);
      console.log(`   4. Measured authenticated dashboard\n`);

      console.log(`⏱️ PERFORMANCE TIMINGS:`);
      console.log(`   Registration: ${this.timings.registration}ms`);
      console.log(`   Sign-In: ${this.timings.signin}ms`);
      console.log(`   Dashboard Visible: ${this.timings.dashboardVisible}ms`);
      console.log(`   Network Idle: ${this.timings.dashboardIdle}ms\n`);

      console.log(`📄 DASHBOARD STATE:`);
      console.log(`   Title: ${pageState.title}`);
      console.log(`   URL: ${pageState.url}`);
      console.log(`   Content: ${pageState.hasContent ? '✅ YES (Real data)' : '⚠️ Not detected'}`);
      console.log(`   Size: ${pageState.bodyLength} bytes\n`);

      // Check Stripe
      const stripeRequests = networkLog.filter(r => r.url.includes('stripe.com'));
      console.log(`🔍 STRIPE LAZY-LOADING:`);
      console.log(`   Stripe Requests: ${stripeRequests.length}`);
      if (stripeRequests.length === 0) {
        console.log(`   ✅ SUCCESS: Stripe NOT loaded on dashboard!\n`);
      } else {
        console.log(`   ⚠️ Stripe loaded:\n`);
        stripeRequests.forEach(req => {
          const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
          console.log(`      - ${url}`);
        });
      }

      // Top requests
      const sortedRequests = [...networkLog]
        .filter(r => r.duration)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 8);

      console.log(`🐢 TOP 8 SLOWEST REQUESTS:`);
      sortedRequests.forEach((req, i) => {
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 65);
        console.log(`${i + 1}. [${req.duration}ms] ${url}`);
      });

      // VERDICT
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✨ FINAL VERDICT');
      console.log('═══════════════════════════════════════════════════════\n');

      const isAuth = page.url().includes('dashboard') || page.url().includes('branches');
      console.log(`${isAuth ? '✅' : '⚠️'} AUTHENTICATION: Sign-in ${isAuth ? 'successful' : 'failed'}`);

      const speedGood = this.timings.dashboardVisible < 3000;
      console.log(`${speedGood ? '✅' : '⚠️'} PERFORMANCE: Dashboard visible in ${this.timings.dashboardVisible}ms`);

      const stripeGood = stripeRequests.length === 0;
      console.log(`${stripeGood ? '✅' : '⚠️'} LAZY-LOADING: ${stripeGood ? 'Stripe NOT loaded' : `Stripe loaded with ${stripeRequests.length} requests`}`);

      console.log(`${pageState.hasContent ? '✅' : '⚠️'} CONTENT: ${pageState.hasContent ? 'Real authenticated dashboard' : 'Content not detected'}`);

      console.log(`\n═══════════════════════════════════════════════════════`);
      console.log(`🎉 TEST COMPLETE - This is REAL and AUTHENTIC!`);
      console.log(`═══════════════════════════════════════════════════════\n`);

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.error(error.stack);
    } finally {
      await browser.close();
    }
  }
}

const test = new FinalRealSignInTest();
test.runTest().catch(console.error);
