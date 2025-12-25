const { chromium } = require('playwright');
const fs = require('fs');

async function debugDashboardLoading() {
  console.log('🔍 Starting Dashboard Loading Debug Investigation...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: './screenshots/debug-videos/',
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  // Track all network requests
  const networkLog = [];
  const consoleMessages = [];
  const errors = [];

  page.on('request', request => {
    networkLog.push({
      type: 'REQUEST',
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    });
    console.log(`📤 ${request.method()} ${request.url()}`);
  });

  page.on('response', async response => {
    const request = response.request();
    const responseLog = {
      type: 'RESPONSE',
      method: request.method(),
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    };

    // Try to get response body for API calls
    if (response.url().includes('/api/')) {
      try {
        const body = await response.text();
        responseLog.body = body;
      } catch (e) {
        responseLog.bodyError = e.message;
      }
    }

    networkLog.push(responseLog);
    console.log(`📥 ${response.status()} ${request.method()} ${response.url()}`);
  });

  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(message);
    console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    errors.push(errorLog);
    console.log(`❌ Page Error: ${error.message}`);
  });

  try {
    console.log('\n📍 Step 1: Navigate to login page');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: './screenshots/01-login-page.png', fullPage: true });
    console.log('✅ Login page loaded and screenshot saved');

    console.log('\n📍 Step 2: Check login form elements');
    const emailInput = await page.locator('input[type="email"]');
    const passwordInput = await page.locator('input[type="password"]');
    const signInButton = await page.locator('button:has-text("Sign In")');

    const formExists = await emailInput.count() > 0 && await passwordInput.count() > 0;
    console.log(`Form elements found: ${formExists}`);

    if (!formExists) {
      console.log('⚠️  Login form not found! Taking screenshot...');
      await page.screenshot({ path: './screenshots/02-form-not-found.png', fullPage: true });
      throw new Error('Login form elements not found');
    }

    console.log('\n📍 Step 3: Fill in test credentials');
    // Using environment variables or prompting for credentials
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    const email = process.env.TEST_EMAIL || await question('Enter email address: ');
    const password = process.env.TEST_PASSWORD || await question('Enter password: ');
    rl.close();

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await page.screenshot({ path: './screenshots/03-credentials-filled.png', fullPage: true });
    console.log('✅ Credentials filled');

    console.log('\n📍 Step 4: Check cookies before sign in');
    const cookiesBeforeSignIn = await context.cookies();
    console.log('Cookies before sign in:', JSON.stringify(cookiesBeforeSignIn, null, 2));

    console.log('\n📍 Step 5: Click Sign In button and monitor requests');
    const navigationPromise = page.waitForURL('**/dashboard', { timeout: 30000 }).catch(() => null);

    await signInButton.click();
    console.log('✅ Sign In button clicked');

    // Wait a bit to see loading state
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './screenshots/04-after-signin-click.png', fullPage: true });

    // Wait for either dashboard or stay on same page
    await navigationPromise;

    console.log('\n📍 Step 6: Check current URL and state');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    await page.screenshot({ path: './screenshots/05-current-state.png', fullPage: true });

    console.log('\n📍 Step 7: Check cookies after sign in');
    const cookiesAfterSignIn = await context.cookies();
    console.log('Cookies after sign in:', JSON.stringify(cookiesAfterSignIn, null, 2));

    // Check for specific cookies
    const refreshToken = cookiesAfterSignIn.find(c => c.name === 'refreshToken');
    const accessToken = cookiesAfterSignIn.find(c => c.name === 'accessToken');
    console.log('\n🔐 Authentication Cookies:');
    console.log(`  refreshToken: ${refreshToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`  accessToken: ${accessToken ? '✅ Present' : '❌ Missing'}`);

    console.log('\n📍 Step 8: Wait and observe dashboard loading behavior');
    await page.waitForTimeout(10000); // Wait 10 seconds to observe behavior
    await page.screenshot({ path: './screenshots/06-after-10sec-wait.png', fullPage: true });

    console.log('\n📍 Step 9: Check for loading indicators');
    const loadingIndicators = await page.locator('[data-loading="true"], .loading, .spinner, [role="progressbar"]').count();
    console.log(`Loading indicators found: ${loadingIndicators}`);

    // Save all logs to file
    const debugReport = {
      timestamp: new Date().toISOString(),
      currentUrl,
      cookiesBeforeSignIn,
      cookiesAfterSignIn,
      networkLog,
      consoleMessages,
      errors,
      summary: {
        totalRequests: networkLog.filter(l => l.type === 'REQUEST').length,
        totalResponses: networkLog.filter(l => l.type === 'RESPONSE').length,
        apiCalls: networkLog.filter(l => l.url.includes('/api/')),
        failedRequests: networkLog.filter(l => l.type === 'RESPONSE' && l.status >= 400),
        refreshTokenPresent: !!refreshToken,
        accessTokenPresent: !!accessToken,
        consoleErrors: consoleMessages.filter(m => m.type === 'error').length,
        pageErrors: errors.length
      }
    };

    fs.writeFileSync('./screenshots/debug-report.json', JSON.stringify(debugReport, null, 2));
    console.log('\n✅ Debug report saved to screenshots/debug-report.json');

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DEBUG SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n📊 Network Activity:`);
    console.log(`  Total Requests: ${debugReport.summary.totalRequests}`);
    console.log(`  Total Responses: ${debugReport.summary.totalResponses}`);
    console.log(`  API Calls: ${debugReport.summary.apiCalls.length}`);
    console.log(`  Failed Requests (4xx/5xx): ${debugReport.summary.failedRequests.length}`);

    console.log(`\n🔐 Authentication:`);
    console.log(`  Refresh Token: ${debugReport.summary.refreshTokenPresent ? '✅' : '❌'}`);
    console.log(`  Access Token: ${debugReport.summary.accessTokenPresent ? '✅' : '❌'}`);

    console.log(`\n⚠️  Errors:`);
    console.log(`  Console Errors: ${debugReport.summary.consoleErrors}`);
    console.log(`  Page Errors: ${debugReport.summary.pageErrors}`);

    if (debugReport.summary.failedRequests.length > 0) {
      console.log(`\n❌ Failed Requests:`);
      debugReport.summary.failedRequests.forEach(req => {
        console.log(`  ${req.status} ${req.method} ${req.url}`);
      });
    }

    if (debugReport.summary.apiCalls.length > 0) {
      console.log(`\n📡 API Calls Made:`);
      debugReport.summary.apiCalls.slice(0, 10).forEach(call => {
        const status = call.status || 'pending';
        console.log(`  ${status} ${call.method} ${call.url}`);
      });
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Debug script error:', error.message);
    await page.screenshot({ path: './screenshots/error-state.png', fullPage: true });
    throw error;
  } finally {
    console.log('\n⏸️  Pausing for 5 seconds before closing browser...');
    await page.waitForTimeout(5000);
    await context.close();
    await browser.close();
    console.log('✅ Browser closed');
  }
}

debugDashboardLoading().catch(console.error);
