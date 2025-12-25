const { chromium } = require('playwright');
const fs = require('fs');

const TEST_EMAIL = `diag-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'TestPassword123!';

class PerformanceDiagnostic {
  constructor() {
    this.requests = [];
    this.startTime = null;
    this.stepTimings = {};
  }

  log(step, message) {
    const elapsed = this.stepTimings[step] || (Date.now() - this.startTime);
    console.log(`[${elapsed}ms] ${step}: ${message}`);
  }

  async runFullDiagnostic() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 COMPREHENSIVE PERFORMANCE DIAGNOSTIC');
    console.log('═══════════════════════════════════════════════════════\n');

    this.startTime = Date.now();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Intercept ALL network requests
    const networkLog = [];
    page.on('request', (request) => {
      networkLog.push({
        url: request.url(),
        method: request.method(),
        startTime: Date.now(),
        timestamp: new Date().toISOString(),
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
      // ========== STEP 1: REGISTRATION ==========
      this.log('STEP_1_START', '🚀 Starting registration...');
      const step1Start = Date.now();

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
      this.log('STEP_1_LOAD', '✅ Register page DOM loaded');

      await page.waitForTimeout(1000);

      await page.fill('input[name="firstName"]', 'Diagnostic');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'Diagnostic Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      this.log('STEP_1_FILLED', '✅ Form fields filled');

      // Wait for registration submission
      const [navResponse] = await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.stepTimings.STEP_1_END = Date.now() - step1Start;
      this.log('STEP_1_END', `✅ Registration complete (${this.stepTimings.STEP_1_END}ms)`);

      await page.waitForTimeout(2000);
      console.log(`\n📍 Current URL: ${page.url()}\n`);

      // ========== STEP 2: CHECK DASHBOARD LOAD ==========
      this.log('STEP_2_START', '🚀 Navigating to dashboard...');
      const step2Start = Date.now();

      // Clear network log for dashboard
      networkLog.length = 0;
      const dashboardNetworkStart = Date.now();

      try {
        await Promise.race([
          page.goto('https://koinoniasms.com/dashboard', {
            waitUntil: 'networkidle',
            timeout: 60000
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Dashboard networkidle timeout after 60s')), 60000)
          ),
        ]);
        this.log('STEP_2_LOADED', '✅ Dashboard networkidle achieved');
      } catch (e) {
        this.log('STEP_2_TIMEOUT', `⚠️ ${e.message}`);
      }

      const dashboardLoadTime = Date.now() - dashboardNetworkStart;
      this.stepTimings.STEP_2_DASHBOARD = dashboardLoadTime;
      this.log('STEP_2_END', `Dashboard load took ${dashboardLoadTime}ms`);

      // ========== STEP 3: ANALYZE NETWORK ==========
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 NETWORK REQUEST ANALYSIS');
      console.log('═══════════════════════════════════════════════════════\n');

      // Sort by duration
      const sortedRequests = [...networkLog].sort((a, b) => (b.duration || 0) - (a.duration || 0));

      // Group by status
      const byStatus = {};
      networkLog.forEach(req => {
        const status = req.status || 'PENDING';
        if (!byStatus[status]) byStatus[status] = [];
        byStatus[status].push(req);
      });

      // Print slowest requests
      console.log('🐢 SLOWEST REQUESTS (Top 10):');
      sortedRequests.slice(0, 10).forEach((req, i) => {
        const duration = req.duration || '?';
        const status = req.status || 'PENDING';
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
        console.log(`${i + 1}. [${status}] ${duration}ms - ${url}`);
      });

      console.log('\n📈 REQUEST STATISTICS:');
      Object.entries(byStatus).forEach(([status, reqs]) => {
        console.log(`  ${status}: ${reqs.length} requests`);
      });

      // Find pending requests
      const pendingReqs = networkLog.filter(r => !r.status);
      if (pendingReqs.length > 0) {
        console.log('\n⏳ PENDING REQUESTS (Still loading):');
        pendingReqs.forEach(req => {
          const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
          console.log(`  - ${url}`);
        });
      }

      // Find failed requests
      const failedReqs = networkLog.filter(r => r.status >= 400);
      if (failedReqs.length > 0) {
        console.log('\n❌ FAILED REQUESTS:');
        failedReqs.forEach(req => {
          const url = req.url.replace(/^https?:\/\//, '').substring(0, 70);
          console.log(`  - [${req.status}] ${url}`);
        });
      }

      // ========== STEP 4: CHECK PAGE STATE ==========
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🎨 PAGE STATE ANALYSIS');
      console.log('═══════════════════════════════════════════════════════\n');

      const pageState = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          readyState: document.readyState,
          bodyHTML: document.body.innerHTML.substring(0, 200),
          hasLoadingSpinner: !!document.querySelector('[data-testid="loading-spinner"]') ||
                            !!document.querySelector('.animate-spin') ||
                            !!document.querySelector('[class*="loader"]'),
          hasDashboardContent: !!document.querySelector('[class*="dashboard"]') ||
                              !!document.querySelector('text:contains("Messages Sent")'),
        };
      }).catch(() => ({}));

      console.log('📄 Page Title:', pageState.title);
      console.log('🔗 URL:', pageState.url);
      console.log('📖 Ready State:', pageState.readyState);
      console.log('⏳ Loading Spinner Visible:', pageState.hasLoadingSpinner);
      console.log('✅ Dashboard Content Visible:', pageState.hasDashboardContent);

      // ========== STEP 5: CONSOLE ERRORS ==========
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('⚠️  CONSOLE MESSAGES');
      console.log('═══════════════════════════════════════════════════════\n');

      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      }));

      // Wait a bit to capture errors
      await page.waitForTimeout(2000);

      const errors = consoleMessages.filter(m => m.type === 'error');
      const warns = consoleMessages.filter(m => m.type === 'warning');

      if (errors.length > 0) {
        console.log('❌ ERRORS:');
        errors.slice(0, 10).forEach((err, i) => {
          console.log(`${i + 1}. ${err.text.substring(0, 100)}`);
        });
      } else {
        console.log('✅ No errors in console');
      }

      if (warns.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        warns.slice(0, 5).forEach((warn, i) => {
          console.log(`${i + 1}. ${warn.text.substring(0, 100)}`);
        });
      }

      // ========== STEP 6: PERFORMANCE METRICS ==========
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('⚡ PERFORMANCE METRICS');
      console.log('═══════════════════════════════════════════════════════\n');

      const perfMetrics = await page.evaluate(() => {
        const perf = window.performance.getEntriesByType('navigation')[0];
        if (!perf) return { error: 'No navigation timing available' };

        return {
          'DNS Lookup': perf.domainLookupEnd - perf.domainLookupStart,
          'TCP Connection': perf.connectEnd - perf.connectStart,
          'TLS Handshake': (perf.secureConnectionStart > 0) ?
            (perf.connectEnd - perf.secureConnectionStart) : 0,
          'Request Time': perf.responseStart - perf.requestStart,
          'Response Download': perf.responseEnd - perf.responseStart,
          'DOM Interactive': perf.domInteractive - perf.fetchStart,
          'DOM Complete': perf.domComplete - perf.fetchStart,
          'Load Complete': perf.loadEventEnd - perf.fetchStart,
        };
      }).catch(() => ({ error: 'Could not get metrics' }));

      Object.entries(perfMetrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          console.log(`${key}: ${value}ms`);
        }
      });

      // ========== SUMMARY ==========
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📋 DIAGNOSTIC SUMMARY');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`⏱️  Registration Time: ${this.stepTimings.STEP_1_END}ms`);
      console.log(`⏱️  Dashboard Load Time: ${this.stepTimings.STEP_2_DASHBOARD}ms`);
      console.log(`📡 Total Network Requests: ${networkLog.length}`);
      console.log(`✅ Successful (2xx): ${byStatus['200']?.length || 0}`);
      console.log(`❌ Failed (4xx+): ${failedReqs.length}`);
      console.log(`⏳ Pending: ${pendingReqs.length}`);

      // Identify root cause
      console.log('\n🎯 DIAGNOSIS:');
      if (this.stepTimings.STEP_2_DASHBOARD > 60000) {
        console.log('  ⚠️  Dashboard loading took >60 seconds!');
        if (pendingReqs.length > 0) {
          console.log('  → Some requests never completed');
          console.log('  → Check: Are API calls hanging? Is backend responsive?');
        }
        if (failedReqs.length > 0) {
          console.log('  → Many requests failed (4xx/5xx)');
          console.log('  → Check: Are there authentication/permission errors?');
        }
      }

      // Save detailed log
      const logFile = 'diagnostic-results.json';
      fs.writeFileSync(logFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        timings: this.stepTimings,
        networkRequests: sortedRequests.slice(0, 50),
        pageState,
        errors: errors.map(e => e.text),
        summary: {
          registrationTime: this.stepTimings.STEP_1_END,
          dashboardLoadTime: this.stepTimings.STEP_2_DASHBOARD,
          totalRequests: networkLog.length,
          failedRequests: failedReqs.length,
          pendingRequests: pendingReqs.length,
        },
      }, null, 2));

      console.log(`\n💾 Detailed results saved to: ${logFile}\n`);

    } catch (error) {
      console.error('\n❌ Diagnostic test failed:', error.message);
    } finally {
      await browser.close();
    }
  }
}

// Run diagnostic
const diag = new PerformanceDiagnostic();
diag.runFullDiagnostic().catch(console.error);
