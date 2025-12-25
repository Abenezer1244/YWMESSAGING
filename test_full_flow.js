const { chromium } = require('playwright');
const fs = require('fs');

const TEST_EMAIL = `test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'TestPassword123!';
const BASE_URL = 'https://koinoniasms.com';

let browser, page;
const logs = [];
const errors = [];
const networkRequests = [];

async function log(message) {
  console.log(message);
  logs.push(message);
}

async function logError(message, details = '') {
  console.error(`❌ ${message}`, details);
  errors.push({ message, details });
}

async function setupBrowser() {
  log('🚀 Starting Playwright test with Chromium...');
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    const level = msg.type().toUpperCase();
    const text = msg.text();
    log(`[CONSOLE-${level}] ${text}`);
    if (level === 'ERROR' || level === 'WARNING') {
      errors.push({ type: 'CONSOLE', level, text });
    }
  });

  // Capture network requests
  page.on('requestfailed', request => {
    const error = `[NETWORK-FAILED] ${request.method()} ${request.url()} - ${request.failure().errorText}`;
    log(error);
    networkRequests.push({ url: request.url(), status: 'FAILED', error: request.failure().errorText });
    errors.push({ type: 'NETWORK', error });
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      const msg = `[NETWORK-ERROR] ${response.status()} ${response.url()}`;
      log(msg);
      networkRequests.push({ url: response.url(), status: response.status() });
      if (response.status() >= 500) {
        errors.push({ type: 'NETWORK', status: response.status(), url: response.url() });
      }
    }
  });

  log('✅ Browser started');
}

async function register() {
  log('\n📝 Step 1: REGISTRATION');
  log(`Creating account with email: ${TEST_EMAIL}`);

  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

  // Take screenshot of register page
  await page.screenshot({ path: 'screenshot-register-page.png' });
  log('📸 Screenshot: register-page');

  // Fill registration form
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[placeholder*="Password"]', TEST_PASSWORD);
  await page.fill('input[placeholder*="First Name"]', 'Test');
  await page.fill('input[placeholder*="Last Name"]', 'User');
  await page.fill('input[placeholder*="Church"]', 'Test Church');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for either dashboard redirect or error
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    log('✅ Registration successful - redirected to dashboard');
  } catch (e) {
    await page.screenshot({ path: 'screenshot-register-error.png' });
    logError('Registration failed or didn\'t redirect to dashboard', e.message);
    return false;
  }

  return true;
}

async function testDashboard() {
  log('\n📊 Step 2: TESTING DASHBOARD');
  await page.waitForLoadState('networkidle');

  log('Waiting for dashboard to fully load...');
  try {
    await page.waitForSelector('h1, h2, [role="main"]', { timeout: 5000 });
  } catch {
    logError('Dashboard content not loaded after 5 seconds');
  }

  await page.screenshot({ path: 'screenshot-dashboard.png' });
  log('📸 Screenshot: dashboard');

  // Check for critical elements
  const hasContent = await page.isVisible('body') &&
                     await page.locator('text=Dashboard, Settings, Branches, Groups, Messages, Billing').first().isVisible().catch(() => false);

  log(`Dashboard loaded: ${hasContent ? '✅' : '⚠️'}`);
}

async function testSettings() {
  log('\n⚙️ Step 3: TESTING SETTINGS PAGE');

  try {
    await page.click('a[href*="settings"], button:has-text("Settings")');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[role="main"], main', { timeout: 5000 });

    await page.screenshot({ path: 'screenshot-settings.png' });
    log('✅ Settings page loaded');
    log('📸 Screenshot: settings');
  } catch (e) {
    logError('Settings page failed to load', e.message);
  }
}

async function testBranches() {
  log('\n🌳 Step 4: TESTING BRANCHES PAGE');

  try {
    await page.goto(`${BASE_URL}/dashboard/branches`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="main"], main', { timeout: 5000 });

    await page.screenshot({ path: 'screenshot-branches.png' });
    log('✅ Branches page loaded');
    log('📸 Screenshot: branches');
  } catch (e) {
    logError('Branches page failed to load', e.message);
  }
}

async function testGroups() {
  log('\n👥 Step 5: TESTING GROUPS PAGE');

  try {
    await page.goto(`${BASE_URL}/dashboard/groups`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="main"], main', { timeout: 5000 });

    await page.screenshot({ path: 'screenshot-groups.png' });
    log('✅ Groups page loaded');
    log('📸 Screenshot: groups');
  } catch (e) {
    logError('Groups page failed to load', e.message);
  }
}

async function testMessages() {
  log('\n💬 Step 6: TESTING MESSAGES PAGE');

  try {
    await page.goto(`${BASE_URL}/dashboard/messages`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="main"], main', { timeout: 5000 });

    await page.screenshot({ path: 'screenshot-messages.png' });
    log('✅ Messages page loaded');
    log('📸 Screenshot: messages');
  } catch (e) {
    logError('Messages page failed to load', e.message);
  }
}

async function testBilling() {
  log('\n💳 Step 7: TESTING BILLING PAGE');

  try {
    await page.goto(`${BASE_URL}/dashboard/billing`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="main"], main', { timeout: 5000 });

    await page.screenshot({ path: 'screenshot-billing.png' });
    log('✅ Billing page loaded');
    log('📸 Screenshot: billing');
  } catch (e) {
    logError('Billing page failed to load', e.message);
  }
}

async function testLogout() {
  log('\n🚪 Step 8: TESTING LOGOUT');

  try {
    await page.click('button:has-text("Logout"), button:has-text("Sign out")');
    await page.waitForURL('**/login', { timeout: 5000 });
    log('✅ Logout successful');
  } catch (e) {
    logError('Logout failed', e.message);
  }
}

async function generateReport() {
  log('\n\n📋 TEST REPORT');
  log(`Total Logs: ${logs.length}`);
  log(`Total Errors: ${errors.length}`);
  log(`Network Requests with Issues: ${networkRequests.filter(r => r.status >= 400 || r.status === 'FAILED').length}`);

  if (errors.length > 0) {
    log('\n❌ ERRORS FOUND:');
    errors.forEach((err, idx) => {
      log(`${idx + 1}. ${err.type || 'UNKNOWN'}: ${err.message || err.text || JSON.stringify(err)}`);
    });
  } else {
    log('\n✅ NO ERRORS FOUND');
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    testEmail: TEST_EMAIL,
    totalLogs: logs.length,
    totalErrors: errors.length,
    errors: errors,
    networkRequests: networkRequests.filter(r => r.status >= 400 || r.status === 'FAILED'),
    logs: logs.slice(-50) // Last 50 logs
  };

  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  log('\n📄 Detailed report saved to: test-report.json');
}

async function cleanup() {
  if (browser) {
    await browser.close();
    log('🔒 Browser closed');
  }
}

async function runTests() {
  try {
    await setupBrowser();
    const registered = await register();

    if (registered) {
      await testDashboard();
      await testSettings();
      await testBranches();
      await testGroups();
      await testMessages();
      await testBilling();
      await testLogout();
    }

    await generateReport();
  } catch (e) {
    logError('Test suite failed', e.message);
    console.error(e);
  } finally {
    await cleanup();
  }
}

runTests();
