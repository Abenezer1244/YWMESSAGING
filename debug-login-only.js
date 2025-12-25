const { chromium } = require('playwright');
const fs = require('fs');

async function debugLoginDashboard() {
  console.log('🔍 Dashboard Loading Debug - Login Flow Only\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Comprehensive network tracking
  const networkLog = [];
  const consoleMessages = [];
  const errors = [];

  page.on('request', request => {
    const logEntry = {
      type: 'REQUEST',
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    };
    networkLog.push(logEntry);

    if (request.url().includes('/api/')) {
      console.log(`📤 ${request.method()} ${request.url()}`);
    }
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

    // Capture API response bodies
    if (response.url().includes('/api/')) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const body = await response.text();
          responseLog.body = body;
        }
      } catch (e) {
        responseLog.bodyError = e.message;
      }

      const statusIcon = response.status() >= 400 ? '❌' : '✅';
      console.log(`${statusIcon} ${response.status()} ${request.method()} ${response.url()}`);

      // Print response body for errors and auth endpoints
      if (response.status() >= 400 || response.url().includes('/auth/')) {
        try {
          if (responseLog.body) {
            const bodyObj = JSON.parse(responseLog.body);
            console.log(`   Response:`, JSON.stringify(bodyObj, null, 2));
          }
        } catch (e) {
          // Not JSON
        }
      }
    }

    networkLog.push(responseLog);
  });

  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(message);

    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
    }
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
    // STEP 1: Navigate to Login
    console.log('=' .repeat(80));
    console.log('📍 STEP 1: NAVIGATE TO LOGIN PAGE');
    console.log('='.repeat(80) + '\n');

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: './screenshots/login-01-page.png', fullPage: true });
    console.log('✅ Login page loaded\n');

    // Wait a bit for any loading states to clear
    await page.waitForTimeout(2000);

    // STEP 2: Check page content
    console.log('📍 STEP 2: CHECKING PAGE CONTENT\n');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.locator('button:has-text("Sign In")');

    const emailCount = await emailInput.count();
    const passwordCount = await passwordInput.count();
    const buttonCount = await signInButton.count();

    console.log(`Email input fields found: ${emailCount}`);
    console.log(`Password input fields found: ${passwordCount}`);
    console.log(`Sign In buttons found: ${buttonCount}\n`);

    if (emailCount === 0 || passwordCount === 0 || buttonCount === 0) {
      console.log('⚠️  Login form elements not fully visible!');
      console.log('Taking screenshot of current state...\n');
      await page.screenshot({ path: './screenshots/login-02-form-missing.png', fullPage: true });

      // Try to get page HTML
      const bodyHTML = await page.locator('body').innerHTML();
      fs.writeFileSync('./screenshots/login-page-html.txt', bodyHTML);
      console.log('✅ Page HTML saved to screenshots/login-page-html.txt');

      throw new Error('Login form not found - see screenshots for details');
    }

    // STEP 3: Fill credentials (you'll need to update these)
    console.log('📍 STEP 3: FILLING CREDENTIALS\n');
    console.log('⚠️  USING PLACEHOLDER CREDENTIALS - UPDATE THE SCRIPT WITH REAL ONES!\n');

    // UPDATE THESE WITH REAL TEST CREDENTIALS
    const testEmail = 'your-email@example.com';  // ← UPDATE THIS
    const testPassword = 'your-password';  // ← UPDATE THIS

    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    await page.screenshot({ path: './screenshots/login-03-credentials-filled.png', fullPage: true });
    console.log('✅ Credentials filled\n');

    // Check cookies before sign in
    console.log('📍 STEP 4: COOKIES BEFORE SIGN IN\n');
    const cookiesBeforeSignIn = await context.cookies();
    console.log(`Total cookies: ${cookiesBeforeSignIn.length}`);
    cookiesBeforeSignIn.forEach(c => {
      console.log(`  - ${c.name}: ${c.domain}${c.path}`);
    });
    console.log();

    // STEP 5: Click Sign In and watch carefully
    console.log('=' .repeat(80));
    console.log('📍 STEP 5: CLICKING SIGN IN - WATCHING NETWORK ACTIVITY');
    console.log('='.repeat(80) + '\n');

    await signInButton.click();
    console.log('✅ Sign In button clicked\n');

    // Wait and observe
    console.log('Waiting 3 seconds to observe initial response...\n');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: './screenshots/login-04-after-click.png', fullPage: true });

    const currentUrl1 = page.url();
    console.log(`Current URL: ${currentUrl1}\n`);

    // Wait for navigation or timeout
    console.log('Waiting up to 10 seconds for dashboard navigation...\n');
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Navigated to dashboard!\n');
    } catch (e) {
      console.log('⚠️  Did not navigate to dashboard within 10 seconds\n');
    }

    const currentUrl2 = page.url();
    console.log(`Current URL: ${currentUrl2}\n`);
    await page.screenshot({ path: './screenshots/login-05-after-wait.png', fullPage: true });

    // Check cookies after sign in
    console.log('📍 STEP 6: COOKIES AFTER SIGN IN ATTEMPT\n');
    const cookiesAfterSignIn = await context.cookies();
    console.log(`Total cookies: ${cookiesAfterSignIn.length}`);

    const refreshToken = cookiesAfterSignIn.find(c => c.name === 'refreshToken');
    const accessToken = cookiesAfterSignIn.find(c => c.name === 'accessToken');

    console.log(`\n🔐 Authentication Cookies:`);
    console.log(`  refreshToken: ${refreshToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`  accessToken: ${accessToken ? '✅ Present' : '❌ Missing'}\n`);

    if (refreshToken) {
      console.log(`  refreshToken details:`);
      console.log(`    Domain: ${refreshToken.domain}`);
      console.log(`    Path: ${refreshToken.path}`);
      console.log(`    Secure: ${refreshToken.secure}`);
      console.log(`    HttpOnly: ${refreshToken.httpOnly}`);
      console.log(`    SameSite: ${refreshToken.sameSite}`);
      console.log(`    Expires: ${new Date(refreshToken.expires * 1000).toISOString()}\n`);
    }

    // If on dashboard, observe loading behavior
    if (currentUrl2.includes('/dashboard')) {
      console.log('=' .repeat(80));
      console.log('📍 STEP 7: OBSERVING DASHBOARD LOADING BEHAVIOR');
      console.log('='.repeat(80) + '\n');

      // Check for loading indicators
      console.log('Checking for loading indicators...\n');
      const loadingSelectors = [
        '[data-loading="true"]',
        '.loading',
        '.spinner',
        '[role="progressbar"]',
        '[data-testid="loading"]',
        '.animate-spin',
        '[aria-busy="true"]'
      ];

      for (const selector of loadingSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`  ⏳ Found ${count} elements matching: ${selector}`);
        }
      }
      console.log();

      // Wait and check again
      console.log('Waiting 10 seconds and checking again...\n');
      await page.waitForTimeout(10000);
      await page.screenshot({ path: './screenshots/login-06-dashboard-after-10sec.png', fullPage: true });

      for (const selector of loadingSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`  ⏳ Still loading - ${count} elements matching: ${selector}`);
        }
      }
      console.log();

      // Check API calls still being made
      console.log('Checking for ongoing API requests...\n');
      const recentRequests = networkLog.slice(-10);
      recentRequests.forEach(req => {
        if (req.type === 'REQUEST' && req.url.includes('/api/')) {
          console.log(`  📤 ${req.method} ${req.url}`);
        }
      });
      console.log();

      // Wait longer
      console.log('Waiting another 10 seconds to see if loading persists...\n');
      await page.waitForTimeout(10000);
      await page.screenshot({ path: './screenshots/login-07-dashboard-after-20sec.png', fullPage: true });
    }

    // Generate report
    const apiCalls = networkLog.filter(l => l.url.includes('/api/'));
    const failedRequests = networkLog.filter(l => l.type === 'RESPONSE' && l.status >= 400);

    const debugReport = {
      timestamp: new Date().toISOString(),
      finalUrl: page.url(),
      cookies: cookiesAfterSignIn,
      networkLog: apiCalls,
      consoleMessages: consoleMessages,
      errors: errors,
      summary: {
        totalAPIRequests: apiCalls.filter(l => l.type === 'REQUEST').length,
        totalAPIResponses: apiCalls.filter(l => l.type === 'RESPONSE').length,
        failedRequests: failedRequests,
        refreshTokenPresent: !!refreshToken,
        accessTokenPresent: !!accessToken,
        consoleErrors: consoleMessages.filter(m => m.type === 'error').length,
        pageErrors: errors.length
      }
    };

    fs.writeFileSync('./screenshots/debug-login-report.json', JSON.stringify(debugReport, null, 2));
    console.log('\n✅ Debug report saved to screenshots/debug-login-report.json\n');

    // Print summary
    console.log('=' .repeat(80));
    console.log('🔍 DEBUG SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n📊 Network Activity:`);
    console.log(`  API Requests: ${debugReport.summary.totalAPIRequests}`);
    console.log(`  API Responses: ${debugReport.summary.totalAPIResponses}`);
    console.log(`  Failed Requests: ${debugReport.summary.failedRequests.length}`);

    console.log(`\n🔐 Authentication:`);
    console.log(`  Refresh Token: ${debugReport.summary.refreshTokenPresent ? '✅' : '❌'}`);
    console.log(`  Access Token: ${debugReport.summary.accessTokenPresent ? '✅' : '❌'}`);

    console.log(`\n⚠️  Errors:`);
    console.log(`  Console Errors: ${debugReport.summary.consoleErrors}`);
    console.log(`  Page Errors: ${debugReport.summary.pageErrors}`);

    if (debugReport.summary.failedRequests.length > 0) {
      console.log(`\n❌ Failed API Requests:`);
      debugReport.summary.failedRequests.forEach(req => {
        console.log(`\n  ${req.status} ${req.method} ${req.url}`);
        if (req.body) {
          try {
            const bodyObj = JSON.parse(req.body);
            console.log(`  Response:`, JSON.stringify(bodyObj, null, 2));
          } catch (e) {
            console.log(`  Response:`, req.body.substring(0, 200));
          }
        }
      });
    }

    if (consoleMessages.filter(m => m.type === 'error').length > 0) {
      console.log(`\n❌ Console Errors:`);
      consoleMessages.filter(m => m.type === 'error').slice(0, 10).forEach(msg => {
        console.log(`  - ${msg.text}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    console.log('    - Check the dashboard visually');
    console.log('    - Open DevTools to inspect network/console');
    console.log('    - Look for stuck loading states\n');

    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Debug script error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: './screenshots/debug-login-error.png', fullPage: true });

    const cookies = await context.cookies();
    console.log('\nCookies at error:', cookies);

    await page.waitForTimeout(10000);
  } finally {
    await context.close();
    await browser.close();
    console.log('✅ Browser closed');
  }
}

debugLoginDashboard().catch(console.error);
