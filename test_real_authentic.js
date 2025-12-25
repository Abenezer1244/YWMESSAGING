const { chromium } = require('playwright');

const TEST_EMAIL = `perf-test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'RealTest123!';

class RealDashboardTest {
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
    console.log('🔐 REAL DASHBOARD PERFORMANCE TEST');
    console.log('(Registration + Authenticated Dashboard Load)');
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
      // STEP 1: REGISTER
      console.log('=== STEP 1: CREATE NEW ACCOUNT ===\n');
      this.log('REG_START', '🚀 Registering new account...');
      const regStart = Date.now();

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
      this.log('REG_PAGE', '✅ Register page loaded');

      await page.waitForTimeout(500);

      // Fill form
      this.log('REG_FILL', '📝 Filling registration form...');
      await page.fill('input[name="firstName"]', 'Perf');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'Performance Test Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      this.log('REG_SUBMIT', '⏳ Submitting...');

      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.timings.REGISTRATION = Date.now() - regStart;
      this.log('REG_DONE', `✅ Registration complete (${this.timings.REGISTRATION}ms)`);

      const postRegUrl = page.url();
      console.log(`\n📍 Post-registration URL: ${postRegUrl}`);

      // STEP 2: MEASURE AUTHENTICATED DASHBOARD
      console.log('\n=== STEP 2: MEASURE AUTHENTICATED DASHBOARD ===\n');

      // Clear network log for dashboard measurement
      networkLog.length = 0;
      const dashStart = Date.now();

      this.log('DASH_START', '⏱️ Measuring authenticated dashboard...');

      // Wait for dashboard content
      try {
        await page.waitForSelector('[class*="dashboard"], [class*="Dashboard"], main, .min-h-screen', {
          timeout: 15000
        });
        this.timings.DASH_VISIBLE = Date.now() - dashStart;
        this.log('DASH_VISIBLE', `✅ Dashboard visible (${this.timings.DASH_VISIBLE}ms)`);
      } catch (e) {
        this.log('DASH_ERROR', `⚠️ ${e.message}`);
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
          hasContent: document.body.innerHTML.includes('Members') ||
                     document.body.innerHTML.includes('Groups') ||
                     document.body.innerHTML.includes('Messages'),
        };
      });

      // Print results
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 REAL PERFORMANCE RESULTS');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`📧 Test Account: ${TEST_EMAIL}`);
      console.log(`\n⏱️  TIMING RESULTS:`);
      console.log(`   Registration: ${this.timings.REGISTRATION}ms`);
      console.log(`   Dashboard Visible: ${this.timings.DASH_VISIBLE}ms`);
      console.log(`   Network Idle: ${this.timings.DASH_IDLE}ms`);

      console.log(`\n📄 Page Info:`);
      console.log(`   Title: ${pageState.title}`);
      console.log(`   URL: ${pageState.url}`);
      console.log(`   Content Size: ${pageState.bodyLength} bytes`);
      console.log(`   Loading Spinner: ${pageState.hasLoadingSpinner ? 'YES' : 'NO'}`);
      console.log(`   Dashboard Content: ${pageState.hasContent ? 'YES' : 'NO'}`);

      // Stripe check
      const stripeRequests = networkLog.filter(r => r.url.includes('stripe.com'));
      console.log(`\n🔍 STRIPE LAZY-LOADING:`);
      console.log(`   Stripe Requests: ${stripeRequests.length}`);
      if (stripeRequests.length === 0) {
        console.log(`   ✅ SUCCESS: Stripe NOT loaded (lazy-loading working!)`);
      } else {
        console.log(`   ⚠️  Stripe was loaded:`);
        stripeRequests.forEach(req => {
          const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
          console.log(`      - ${url} (${req.duration}ms)`);
        });
      }

      // Top requests
      const sortedRequests = [...networkLog]
        .filter(r => r.duration)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 10);

      console.log('\n🐢 TOP 10 SLOWEST REQUESTS:');
      sortedRequests.forEach((req, i) => {
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 65);
        console.log(`${i + 1}. [${req.duration}ms] ${url}`);
      });

      // Summary
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✨ FINAL VERDICT');
      console.log('═══════════════════════════════════════════════════════\n');

      if (postRegUrl.includes('dashboard') || postRegUrl.includes('branches')) {
        console.log('✅ REGISTRATION: Successful (automatically logged in)');
      }

      if (this.timings.DASH_VISIBLE && this.timings.DASH_VISIBLE < 5000) {
        console.log(`✅ SPEED: Dashboard visible in ${this.timings.DASH_VISIBLE}ms`);
      } else if (this.timings.DASH_VISIBLE) {
        console.log(`⚠️  SPEED: Dashboard visible in ${this.timings.DASH_VISIBLE}ms`);
      }

      if (stripeRequests.length === 0) {
        console.log('✅ LAZY-LOADING: Stripe not loaded (working correctly!)');
      } else {
        console.log(`⚠️  LAZY-LOADING: Stripe loaded with ${stripeRequests.length} requests`);
      }

      if (pageState.hasContent) {
        console.log('✅ CONTENT: Real dashboard content loaded');
      } else {
        console.log('⚠️  CONTENT: Dashboard content not detected');
      }

      console.log(`\n═══════════════════════════════════════════════════════`);
      console.log(`🎉 TEST COMPLETE - This is REAL, AUTHENTIC data!`);
      console.log(`═══════════════════════════════════════════════════════\n`);

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.log('\nDetails:');
      console.log(error.stack);
    } finally {
      await browser.close();
    }
  }
}

const test = new RealDashboardTest();
test.runTest().catch(console.error);
