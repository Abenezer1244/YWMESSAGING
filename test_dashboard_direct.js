const { chromium } = require('playwright');

class DashboardSpeedTest {
  constructor() {
    this.startTime = null;
  }

  log(message) {
    const elapsed = Date.now() - this.startTime;
    console.log(`[${elapsed}ms] ${message}`);
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('⚡ DASHBOARD SPEED TEST (STRIPE LAZY-LOADING CHECK)');
    console.log('═══════════════════════════════════════════════════════\n');

    this.startTime = Date.now();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const networkLog = [];
    const startNetworkTime = Date.now();

    page.on('request', (request) => {
      networkLog.push({
        url: request.url(),
        startTime: Date.now() - startNetworkTime,
      });
    });

    page.on('response', (response) => {
      const matching = networkLog.find(r => r.url === response.url());
      if (matching) {
        matching.status = response.status();
        matching.endTime = Date.now() - startNetworkTime;
        matching.duration = matching.endTime - matching.startTime;
      }
    });

    try {
      this.log('🚀 Navigating to dashboard...');
      const navigationStart = Date.now();

      await page.goto('https://koinoniasms.com/dashboard', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      const domLoadTime = Date.now() - navigationStart;
      this.log(`✅ DOM loaded: ${domLoadTime}ms`);

      // Check for loading spinner
      await page.waitForTimeout(1000);

      const pageState = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          hasLoadingSpinner: !!document.querySelector('[data-testid="loading-spinner"]') ||
                            !!document.querySelector('.animate-spin') ||
                            !!document.querySelector('[class*="loader"]'),
          bodyLength: document.body.innerHTML.length,
        };
      });

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 RESULTS');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`📄 Page Title: ${pageState.title}`);
      console.log(`🔗 URL: ${pageState.url}`);
      console.log(`⏱️  DOM Content Loaded: ${domLoadTime}ms`);
      console.log(`⏳ Loading Spinner: ${pageState.hasLoadingSpinner ? 'YES' : 'NO'}`);
      console.log(`📝 Page Content Size: ${pageState.bodyLength} bytes`);

      // Analyze Stripe requests
      const stripeRequests = networkLog.filter(r => r.url.includes('stripe.com'));
      const slowRequests = [...networkLog]
        .filter(r => r.duration)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 10);

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔍 STRIPE LAZY-LOADING CHECK');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`Stripe requests: ${stripeRequests.length}`);
      if (stripeRequests.length === 0) {
        console.log('✅ SUCCESS! Stripe NOT loaded on dashboard (lazy-loading working!)');
      } else {
        console.log('⚠️  Stripe was loaded:');
        stripeRequests.forEach(req => {
          const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
          console.log(`  - ${url} (${req.duration}ms)`);
        });
      }

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🐢 TOP 10 SLOWEST REQUESTS');
      console.log('═══════════════════════════════════════════════════════\n');

      slowRequests.forEach((req, i) => {
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
        console.log(`${i + 1}. [${req.duration}ms] ${url}`);
      });

      const totalTime = Date.now() - this.startTime;
      console.log(`\n⏰ Total Time: ${totalTime}ms`);

      // Performance verdict
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📈 PERFORMANCE VERDICT');
      console.log('═══════════════════════════════════════════════════════\n');

      if (domLoadTime < 2000) {
        console.log('✅ EXCELLENT: DOM loads in <2 seconds');
      } else if (domLoadTime < 5000) {
        console.log('✅ GOOD: DOM loads in <5 seconds');
      } else {
        console.log('⚠️  SLOW: DOM loads in >5 seconds');
      }

      if (stripeRequests.length === 0) {
        console.log('✅ PERFECT: Stripe lazy-loading is working (0 Stripe requests)');
      } else {
        console.log(`⚠️  ISSUE: Stripe loaded with ${stripeRequests.length} requests`);
      }

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    } finally {
      await browser.close();
    }
  }
}

const test = new DashboardSpeedTest();
test.runTest().catch(console.error);
