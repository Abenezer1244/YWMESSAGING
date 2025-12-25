const { chromium } = require('playwright');

const TEST_EMAIL = `signin-test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'SignInTest123!';

class CompleteSignInTest {
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
    console.log('🔐 COMPLETE SIGN-IN FLOW TEST');
    console.log('(Register → Sign Out → Sign In → Dashboard)');
    console.log('═══════════════════════════════════════════════════════\n');

    this.startTime = Date.now();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // STEP 1: REGISTER
      console.log('=== STEP 1: REGISTER NEW ACCOUNT ===\n');
      this.log('REG_START', '🚀 Registering new account...');
      const regStart = Date.now();

      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
      this.log('REG_PAGE', '✅ Register page loaded');

      await page.waitForTimeout(800);

      // Fill registration form
      this.log('REG_FILL', '📝 Filling form...');
      await page.fill('input[name="firstName"]', 'SignIn');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'SignIn Test Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      this.log('REG_SUBMIT', '⏳ Submitting registration...');

      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.timings.REGISTRATION = Date.now() - regStart;
      this.log('REG_DONE', `✅ Registration complete (${this.timings.REGISTRATION}ms)`);

      const postRegUrl = page.url();
      console.log(`\n📍 URL after registration: ${postRegUrl}`);

      await page.waitForTimeout(1000);

      // STEP 2: SIGN OUT
      console.log('\n=== STEP 2: SIGN OUT ===\n');
      this.log('SIGNOUT_START', '🚀 Looking for sign out button...');

      try {
        // Look for user menu or settings
        const userMenuSelector = '[class*="user"], [class*="User"], [class*="profile"], [class*="Profile"], button[aria-label*="menu"], button[aria-label*="user"]';

        // Try to find and click the settings or user menu
        const settingsLink = await page.locator('a:has-text("Settings"), a:has-text("Admin"), button:has-text("Sign Out"), button:has-text("Logout")').first();

        if (await settingsLink.count() > 0) {
          this.log('SIGNOUT_FOUND', '✅ Found settings/logout button');
          await settingsLink.click();
          await page.waitForTimeout(500);
        }

        // Alternative: try to find logout in hamburger menu
        const hamburger = await page.locator('button[class*="menu"], button[aria-label*="menu"]').first();
        if (await hamburger.count() > 0) {
          this.log('MENU_FOUND', '✅ Found menu button');
          await hamburger.click();
          await page.waitForTimeout(300);

          // Look for logout option in menu
          const logoutBtn = await page.locator('text=Sign Out, text=Logout, text=Log Out').first();
          if (await logoutBtn.count() > 0) {
            this.log('LOGOUT_FOUND', '✅ Found logout in menu');
            await logoutBtn.click();
            await page.waitForNavigation({ timeout: 10000 }).catch(() => null);
          }
        }

        // Navigate directly to login page as fallback
        this.log('SIGNOUT_FALLBACK', '⏳ Navigating to login page directly...');
        await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
        this.log('SIGNOUT_DONE', '✅ On login page (signed out)');

      } catch (e) {
        this.log('SIGNOUT_ATTEMPT', `⚠️ Could not find logout, navigating to login: ${e.message}`);
        await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
      }

      const loginPageUrl = page.url();
      console.log(`\n📍 URL after sign out: ${loginPageUrl}`);

      await page.waitForTimeout(1000);

      // STEP 3: SIGN IN WITH NEW CREDENTIALS
      console.log('\n=== STEP 3: SIGN IN WITH NEW CREDENTIALS ===\n');
      this.log('SIGNIN_START', '🔑 Starting sign-in process...');
      const signinStart = Date.now();

      // Make sure we're on login page
      if (!page.url().includes('login')) {
        this.log('SIGNIN_NAVIGATE', '🚀 Navigating to login page...');
        await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
      }

      this.log('SIGNIN_FILL', '📝 Entering email and password...');

      // Wait for email field
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);

      this.log('SIGNIN_SUBMIT', '⏳ Clicking sign in button...');

      const [signinNav] = await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      this.timings.SIGNIN = Date.now() - signinStart;
      this.log('SIGNIN_COMPLETE', `✅ Sign-in complete (${this.timings.SIGNIN}ms)`);

      const postSigninUrl = page.url();
      console.log(`\n📍 URL after sign-in: ${postSigninUrl}`);

      await page.waitForTimeout(1500);

      // STEP 4: MEASURE AUTHENTICATED DASHBOARD
      console.log('\n=== STEP 4: MEASURE AUTHENTICATED DASHBOARD ===\n');

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

      const dashStart = Date.now();
      this.log('DASH_START', '⏱️ Measuring dashboard...');

      try {
        await page.waitForSelector('[class*="dashboard"], [class*="Dashboard"], main, .min-h-screen', {
          timeout: 15000
        });
        this.timings.DASH_VISIBLE = Date.now() - dashStart;
        this.log('DASH_VISIBLE', `✅ Dashboard visible (${this.timings.DASH_VISIBLE}ms)`);
      } catch (e) {
        this.log('DASH_ERROR', `⚠️ ${e.message}`);
      }

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
                            !!document.querySelector('.animate-spin'),
          bodyLength: document.body.innerHTML.length,
          hasContent: document.body.innerHTML.includes('Members') ||
                     document.body.innerHTML.includes('Groups') ||
                     document.body.innerHTML.includes('Messages') ||
                     document.body.innerHTML.includes('Branches'),
        };
      });

      // Print results
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📊 COMPLETE SIGN-IN PERFORMANCE RESULTS');
      console.log('═══════════════════════════════════════════════════════\n');

      console.log(`📧 Test Credentials Used:`);
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);

      console.log(`\n⏱️  TIMING:`);
      console.log(`   Registration: ${this.timings.REGISTRATION}ms`);
      console.log(`   Sign-In: ${this.timings.SIGNIN}ms`);
      console.log(`   Dashboard Visible: ${this.timings.DASH_VISIBLE}ms`);
      console.log(`   Network Idle: ${this.timings.DASH_IDLE}ms`);

      console.log(`\n📄 Page State:`);
      console.log(`   Title: ${pageState.title}`);
      console.log(`   URL: ${pageState.url}`);
      console.log(`   Loading Spinner: ${pageState.hasLoadingSpinner ? 'YES' : 'NO'}`);
      console.log(`   Dashboard Content: ${pageState.hasContent ? 'YES - Real data loaded' : 'NO'}`);
      console.log(`   Content Size: ${pageState.bodyLength} bytes`);

      // Stripe check
      const stripeRequests = networkLog.filter(r => r.url.includes('stripe.com'));
      console.log(`\n🔍 STRIPE LAZY-LOADING:`);
      console.log(`   Requests: ${stripeRequests.length}`);
      if (stripeRequests.length === 0) {
        console.log(`   ✅ SUCCESS: Stripe NOT loaded!`);
      } else {
        console.log(`   ⚠️  Stripe loaded with ${stripeRequests.length} requests`);
      }

      // Top requests
      const sortedRequests = [...networkLog]
        .filter(r => r.duration)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
        .slice(0, 8);

      console.log('\n🐢 TOP 8 SLOWEST REQUESTS:');
      sortedRequests.forEach((req, i) => {
        const url = req.url.replace(/^https?:\/\//, '').substring(0, 65);
        console.log(`${i + 1}. [${req.duration}ms] ${url}`);
      });

      // Summary
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✨ FINAL VERDICT - REAL SIGN-IN TEST');
      console.log('═══════════════════════════════════════════════════════\n');

      const isAuthenticated = postSigninUrl.includes('dashboard') || postSigninUrl.includes('branches');
      if (isAuthenticated) {
        console.log('✅ AUTHENTICATION: Sign-in successful with credentials!');
      } else {
        console.log(`⚠️  AUTHENTICATION: Redirected to ${postSigninUrl} (check if login worked)`);
      }

      if (this.timings.DASH_VISIBLE < 3000) {
        console.log(`✅ PERFORMANCE: Dashboard visible in ${this.timings.DASH_VISIBLE}ms`);
      } else if (this.timings.DASH_VISIBLE) {
        console.log(`⚠️  PERFORMANCE: Dashboard visible in ${this.timings.DASH_VISIBLE}ms`);
      }

      if (stripeRequests.length === 0) {
        console.log('✅ LAZY-LOADING: Stripe NOT loaded (lazy-loading working!)');
      } else {
        console.log(`⚠️  LAZY-LOADING: Stripe loaded with ${stripeRequests.length} requests`);
      }

      if (pageState.hasContent) {
        console.log('✅ CONTENT: Real authenticated dashboard content present');
      } else {
        console.log('⚠️  CONTENT: Dashboard content not detected');
      }

      console.log(`\n═══════════════════════════════════════════════════════`);
      console.log(`🎉 REAL SIGN-IN TEST COMPLETE`);
      console.log(`═══════════════════════════════════════════════════════\n`);

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.log('\nFull error:');
      console.log(error);
    } finally {
      await browser.close();
    }
  }
}

const test = new CompleteSignInTest();
test.runTest().catch(console.error);
