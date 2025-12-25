const { chromium } = require('playwright');

const TEST_EMAIL = 'diagnostic@koinoniasms.com';
const TEST_PASSWORD = 'TestPassword123!';

class SignInPerformanceTest {
  constructor() {
    this.startTime = null;
    this.stepTimings = {};
  }

  log(step, message) {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${elapsed}ms] ${step}: ${message}`);
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 SIGN-IN AND DASHBOARD PERFORMANCE TEST');
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
      // Navigate to login
      this.log('STEP_1_START', '🚀 Navigating to login page...');
      const step1Start = Date.now();

      await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
      this.log('STEP_1_LOAD', '✅ Login page loaded');

      await page.waitForTimeout(500);

      // Sign in
      this.log('STEP_1_SIGNIN', '🔑 Signing in...');
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);

      const [navResponse] = await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.stepTimings.SIGNIN = Date.now() - step1Start;
      this.log('STEP_1_COMPLETE', `✅ Sign-in complete (${this.stepTimings.SIGNIN}ms)`);

      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`\n📍 Current URL: ${currentUrl}\n`);

      // Measure dashboard load
      this.log('STEP_2_START', '🚀 Measuring dashboard visibility...');
      const step2Start = Date.now();

      // Clear network log for dashboard
      networkLog.length = 0;

      // Wait for main content to be visible
      try {
        await page.waitForSelector('[class*="dashboard"], main, .min-h-screen', { timeout: 15000 });
        this.stepTimings.DASHBOARD_VISIBLE = Date.now() - step2Start;
        this.log('STEP_2_VISIBLE', `✅ Dashboard content visible (${this.stepTimings.DASHBOARD_VISIBLE}ms)`);
      } catch (e) {
        this.log('STEP_2_TIMEOUT', `⚠️ Timeout waiting for dashboard content`);
      }

      // Wait for networkidle
      try {
        await Promise.race([
          page.waitForLoadState('networkidle', { timeout: 30000 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('networkidle timeout after 30s')), 30000)
          ),
        ]);
        this.stepTimings.DASHBOARD_IDLE = Date.now() - step2Start;
        this.log('STEP_2_IDLE', `✅ Network idle (${this.stepTimings.DASHBOARD_IDLE}ms)`);
      } catch (e) {
        this.stepTimings.DASHBOARD_IDLE = Date.now() - step2Start;
        this.log('STEP_2_TIMEOUT', `⚠️ ${e.message}`);
      }

      // Check page state
      const pageState = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          hasLoadingSpinner: !!document.querySelector('[data-testid="loading-spinner"]') ||
                            !!document.querySelector('.animate-spin') ||
                            !!document.querySelector('[class*="loader"]'),
          hasContent: document.body.innerHTML.length > 500,
        };
      });

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 PERFORMANCE RESULTS');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`⏱️  Sign-in Time: ${this.stepTimings.SIGNIN}ms`);
      console.log(`⏱️  Dashboard Content Visible: ${this.stepTimings.DASHBOARD_VISIBLE}ms`);
      console.log(`⏱️  Network Idle: ${this.stepTimings.DASHBOARD_IDLE}ms`);
      console.log(`📄 Page Title: ${pageState.title}`);
      console.log(`🔗 URL: ${pageState.url}`);
      console.log(`⏳ Loading Spinner Visible: ${pageState.hasLoadingSpinner}`);
      console.log(`✅ Page Content: ${pageState.hasContent ? 'YES' : 'NO'}`);

      // Analyze network
      const sortedRequests = [...networkLog].sort((a, b) => (b.duration || 0) - (a.duration || 0));
      const slowestRequests = sortedRequests.slice(0, 5).filter(r => r.status);

      console.log('\n🐢 TOP 5 SLOWEST REQUESTS:');
      slowestRequests.forEach((req, i) => {
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 60);
        console.log(`${i + 1}. [${req.status}] ${req.duration}ms - ${url}`);
      });

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✨ SUMMARY');
      console.log('═══════════════════════════════════════════════════════\n');

      const stripeRequests = networkLog.filter(r => r.url.includes('stripe.com'));
      console.log(`Stripe requests made: ${stripeRequests.length}`);
      if (stripeRequests.length > 0) {
        stripeRequests.forEach(req => {
          const url = req.url.replace(/^https?:\/\//, '').substring(0, 60);
          console.log(`  - ${url} (${req.duration}ms)`);
        });
      } else {
        console.log('  (None - Stripe lazy loading working!)');
      }

      const totalTime = Date.now() - this.startTime;
      console.log(`\n⏰ Total Test Time: ${totalTime}ms`);
      console.log(`\n${this.stepTimings.DASHBOARD_VISIBLE < 5000 ? '✅ EXCELLENT' : '⚠️  SLOW'}: Dashboard visible in ${this.stepTimings.DASHBOARD_VISIBLE}ms`);
      console.log(`${this.stepTimings.SIGNIN < 10000 ? '✅ FAST' : '⚠️  SLOW'}: Sign-in took ${this.stepTimings.SIGNIN}ms`);

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    } finally {
      await browser.close();
    }
  }
}

const test = new SignInPerformanceTest();
test.runTest().catch(console.error);
