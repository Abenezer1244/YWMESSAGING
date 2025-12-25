const { chromium } = require('playwright');
const fs = require('fs');

async function debugDashboardLoading() {
  console.log('🔍 Starting Dashboard Loading Debug Investigation...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Track all network requests
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

    // Try to get response body for API calls
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
    // Create unique test user
    const timestamp = Date.now();
    const testEmail = `debug.test.${timestamp}@koinoniasms.dev`;
    const testPassword = 'DebugTest123!';

    console.log(`\n📧 Test Credentials:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}\n`);

    // STEP 1: Sign Up
    console.log('=' .repeat(80));
    console.log('📍 STEP 1: SIGN UP NEW USER');
    console.log('='.repeat(80));

    await page.goto('https://koinoniasms.com/signup', { waitUntil: 'networkidle' });
    await page.screenshot({ path: './screenshots/debug-01-signup-page.png', fullPage: true });
    console.log('✅ Signup page loaded');

    // Fill signup form
    await page.getByLabel('First Name').fill('Debug');
    await page.getByLabel('Last Name').fill('Test');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);
    await page.getByLabel('Church Name').fill('Debug Test Church');

    await page.screenshot({ path: './screenshots/debug-02-signup-filled.png', fullPage: true });
    console.log('✅ Signup form filled');

    // Click Sign Up
    console.log('\n📍 Clicking Sign Up button...');
    const signUpButton = page.getByRole('button', { name: 'Sign Up' });
    await signUpButton.click();

    // Wait for either redirect or error
    await page.waitForTimeout(3000);
    await page.screenshot({ path: './screenshots/debug-03-after-signup.png', fullPage: true });

    const currentUrl = page.url();
    console.log(`Current URL after signup: ${currentUrl}`);

    // If we're on dashboard, user was created and logged in
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Automatically logged in after signup - now on dashboard');

      // Observe dashboard loading behavior
      console.log('\n📍 Observing dashboard loading...');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: './screenshots/debug-04-dashboard-initial.png', fullPage: true });

      // Check for loading indicators
      const loadingIndicators = await page.locator('[data-loading="true"], .loading, .spinner, [role="progressbar"], [data-testid="loading"]').count();
      console.log(`Loading indicators found: ${loadingIndicators}`);

      // Wait longer to see if loading persists
      console.log('\n📍 Waiting 15 seconds to observe loading state...');
      await page.waitForTimeout(15000);
      await page.screenshot({ path: './screenshots/debug-05-dashboard-after-15sec.png', fullPage: true });

      const stillLoading = await page.locator('[data-loading="true"], .loading, .spinner, [role="progressbar"], [data-testid="loading"]').count();
      console.log(`Loading indicators after 15sec: ${stillLoading}`);

    } else if (currentUrl.includes('/signup')) {
      console.log('⚠️  Still on signup page - checking for errors...');

      // Look for error messages
      const errorMessages = await page.locator('[role="alert"], .error, .text-danger').allTextContents();
      if (errorMessages.length > 0) {
        console.log('❌ Signup errors found:', errorMessages);
      }

      // Try to login with existing account if signup failed
      console.log('\n📍 Attempting to login instead...');
      await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
      await page.screenshot({ path: './screenshots/debug-06-login-page.png', fullPage: true });

      await page.locator('input[type="email"]').fill(testEmail);
      await page.locator('input[type="password"]').fill(testPassword);
      await page.screenshot({ path: './screenshots/debug-07-login-filled.png', fullPage: true });

      console.log('\n📍 Clicking Sign In...');
      await page.locator('button:has-text("Sign In")').click();

      await page.waitForTimeout(3000);
      await page.screenshot({ path: './screenshots/debug-08-after-signin.png', fullPage: true });

      const afterLoginUrl = page.url();
      console.log(`URL after sign in: ${afterLoginUrl}`);

      if (afterLoginUrl.includes('/dashboard')) {
        console.log('✅ Successfully logged in - now on dashboard');

        // Observe dashboard
        await page.waitForTimeout(5000);
        await page.screenshot({ path: './screenshots/debug-09-dashboard-state.png', fullPage: true });

        const loadingCount = await page.locator('[data-loading="true"], .loading, .spinner, [role="progressbar"]').count();
        console.log(`Loading indicators on dashboard: ${loadingCount}`);

        await page.waitForTimeout(15000);
        await page.screenshot({ path: './screenshots/debug-10-dashboard-after-wait.png', fullPage: true });
      }
    }

    // Check cookies
    console.log('\n📍 Checking authentication cookies...');
    const cookies = await context.cookies();
    const refreshToken = cookies.find(c => c.name === 'refreshToken');
    const accessToken = cookies.find(c => c.name === 'accessToken');

    console.log(`\n🔐 Authentication Cookies:`);
    console.log(`  refreshToken: ${refreshToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`  accessToken: ${accessToken ? '✅ Present' : '❌ Missing'}`);

    if (refreshToken) {
      console.log(`  refreshToken details:`, {
        domain: refreshToken.domain,
        path: refreshToken.path,
        secure: refreshToken.secure,
        httpOnly: refreshToken.httpOnly,
        sameSite: refreshToken.sameSite
      });
    }

    // Generate report
    const apiCalls = networkLog.filter(l => l.url.includes('/api/'));
    const failedRequests = networkLog.filter(l => l.type === 'RESPONSE' && l.status >= 400);

    const debugReport = {
      timestamp: new Date().toISOString(),
      testCredentials: {
        email: testEmail,
        password: '***hidden***'
      },
      currentUrl: page.url(),
      cookies: cookies,
      networkLog: apiCalls,
      consoleMessages: consoleMessages,
      errors: errors,
      summary: {
        totalAPIRequests: apiCalls.filter(l => l.type === 'REQUEST').length,
        totalAPIResponses: apiCalls.filter(l => l.type === 'RESPONSE').length,
        failedRequests: failedRequests.length,
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
    console.log(`  API Requests: ${debugReport.summary.totalAPIRequests}`);
    console.log(`  API Responses: ${debugReport.summary.totalAPIResponses}`);
    console.log(`  Failed Requests (4xx/5xx): ${debugReport.summary.failedRequests}`);

    console.log(`\n🔐 Authentication:`);
    console.log(`  Refresh Token: ${debugReport.summary.refreshTokenPresent ? '✅' : '❌'}`);
    console.log(`  Access Token: ${debugReport.summary.accessTokenPresent ? '✅' : '❌'}`);

    console.log(`\n⚠️  Errors:`);
    console.log(`  Console Errors: ${debugReport.summary.consoleErrors}`);
    console.log(`  Page Errors: ${debugReport.summary.pageErrors}`);

    if (failedRequests.length > 0) {
      console.log(`\n❌ Failed API Requests:`);
      failedRequests.forEach(req => {
        console.log(`  ${req.status} ${req.method} ${req.url}`);
        if (req.body) {
          try {
            const bodyObj = JSON.parse(req.body);
            console.log(`     Response:`, bodyObj);
          } catch (e) {
            console.log(`     Response:`, req.body);
          }
        }
      });
    }

    if (consoleMessages.filter(m => m.type === 'error').length > 0) {
      console.log(`\n❌ Console Errors:`);
      consoleMessages.filter(m => m.type === 'error').forEach(msg => {
        console.log(`  ${msg.text}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Debug script error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: './screenshots/debug-error-state.png', fullPage: true });

    // Still try to capture what we can
    const cookies = await context.cookies();
    console.log('\nCookies at error:', cookies);

    await page.waitForTimeout(10000); // Give time to inspect
  } finally {
    await context.close();
    await browser.close();
    console.log('✅ Browser closed');
  }
}

debugDashboardLoading().catch(console.error);
