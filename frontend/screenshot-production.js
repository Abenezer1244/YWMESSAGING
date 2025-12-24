#!/usr/bin/env node

/**
 * Production Screenshot Tool
 *
 * Quick script to capture screenshots of Koinonia SMS production site
 *
 * Usage:
 *   node screenshot-production.js
 *
 * Requirements:
 *   npm install playwright
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://koinoniasms.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const TIMESTAMP = Date.now();

// Test credentials (will be created during test)
const TEST_EMAIL = `test.claude.${TIMESTAMP}@testmail.koinoniasms.dev`;
const TEST_PASSWORD = 'TestPassword123!';

// Viewports to test
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

// Pages to test (after login)
const PAGES = [
  '/dashboard',
  '/branches',
  '/groups',
  '/send',
  '/conversations',
  '/members',
  '/templates',
  '/billing',
  '/settings'
];

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

console.log('\n' + '='.repeat(60));
console.log('🧪 KOINONIA SMS - PRODUCTION SCREENSHOT TOOL');
console.log('='.repeat(60));
console.log(`📸 Screenshots will be saved to: ${SCREENSHOTS_DIR}`);
console.log(`📧 Test email: ${TEST_EMAIL}`);
console.log(`🔐 Test password: ${TEST_PASSWORD}`);
console.log('='.repeat(60) + '\n');

async function captureScreenshot(page, name, fullPage = true) {
  const filename = `${name}-${TIMESTAMP}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  await page.screenshot({
    path: filepath,
    fullPage: fullPage
  });

  console.log(`  ✓ Saved: ${filename}`);
  return filepath;
}

async function waitForLoad(page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (e) {
    // Continue even if networkidle times out
    console.log('    ⚠️ Network not idle, continuing...');
  }
}

async function testRegistration(page) {
  console.log('\n📝 TESTING REGISTRATION FLOW');
  console.log('-'.repeat(60));

  try {
    // Navigate to registration
    console.log('  → Navigating to /register');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await waitForLoad(page);

    // Capture empty registration page
    await captureScreenshot(page, '01-registration-page');

    // Fill form
    console.log('  → Filling registration form');
    await page.getByLabel('First Name').fill('TestUser');
    await page.getByLabel('Last Name').fill('Claude');
    await page.getByLabel('Church Name').fill('Test Church Claude');
    await page.getByLabel('Email Address').fill(TEST_EMAIL);

    // Find password fields more carefully
    const passwordFields = await page.locator('input[type="password"]').all();
    if (passwordFields.length >= 2) {
      await passwordFields[0].fill(TEST_PASSWORD);
      await passwordFields[1].fill(TEST_PASSWORD);
    } else {
      console.log('    ⚠️ Could not find password fields');
    }

    // Capture filled form
    await captureScreenshot(page, '02-registration-filled');

    // Submit form
    console.log('  → Submitting registration form');
    const submitButton = page.getByRole('button', { name: /create account/i });
    await submitButton.click();

    // Wait for redirect or error
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      console.log('  ✓ Registration successful - redirected to dashboard');

      // Capture dashboard
      await waitForLoad(page);
      await captureScreenshot(page, '03-dashboard-after-registration');

      return true;
    } catch (e) {
      console.log('  ⚠️ Did not redirect to dashboard');
      await captureScreenshot(page, '03-registration-error');

      // Check for error messages
      const bodyText = await page.textContent('body');
      if (bodyText.includes('rate limit') || bodyText.includes('too many')) {
        console.log('  ⚠️ Rate limit detected - registration may have been attempted too many times');
        console.log('  💡 Try again in 1 hour or use a different IP address');
      }

      return false;
    }
  } catch (error) {
    console.error('  ❌ Error during registration:', error.message);
    await captureScreenshot(page, '03-registration-exception');
    return false;
  }
}

async function testLogin(page) {
  console.log('\n🔐 TESTING LOGIN FLOW');
  console.log('-'.repeat(60));

  try {
    // Navigate to login
    console.log('  → Navigating to /login');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await waitForLoad(page);

    // Capture login page
    await captureScreenshot(page, '04-login-page');

    // Fill login form
    console.log('  → Filling login form');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);

    // Capture filled form
    await captureScreenshot(page, '05-login-filled');

    // Submit login
    console.log('  → Submitting login');
    await page.getByRole('button', { name: /login/i }).click();

    // Wait for redirect
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      console.log('  ✓ Login successful - redirected to dashboard');

      await waitForLoad(page);
      await captureScreenshot(page, '06-dashboard-after-login');

      return true;
    } catch (e) {
      console.log('  ⚠️ Did not redirect to dashboard after login');
      await captureScreenshot(page, '06-login-error');
      return false;
    }
  } catch (error) {
    console.error('  ❌ Error during login:', error.message);
    await captureScreenshot(page, '06-login-exception');
    return false;
  }
}

async function testPages(page) {
  console.log('\n📄 TESTING ALL PAGES');
  console.log('-'.repeat(60));

  const results = [];

  for (const pagePath of PAGES) {
    try {
      console.log(`  → Testing ${pagePath}`);
      await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'domcontentloaded' });
      await waitForLoad(page, 3000);

      // Check if page is blank
      const bodyText = await page.textContent('body');
      const isBlank = !bodyText || bodyText.trim().length < 50;

      if (isBlank) {
        console.log(`    ⚠️ Page appears blank`);
      } else {
        console.log(`    ✓ Page loaded`);
      }

      // Capture screenshot
      const filename = pagePath.replace(/\//g, '-').replace(/^-/, 'page-');
      await captureScreenshot(page, `07${filename}`);

      results.push({
        page: pagePath,
        success: !isBlank,
        blank: isBlank
      });

      // Small delay between pages
      await page.waitForTimeout(500);
    } catch (error) {
      console.error(`    ❌ Error loading ${pagePath}:`, error.message);
      results.push({
        page: pagePath,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

async function testResponsive(page) {
  console.log('\n📱 TESTING RESPONSIVE DESIGN');
  console.log('-'.repeat(60));

  const testPages = ['/register', '/login', '/dashboard'];

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`  → Testing ${viewportName} (${viewport.width}x${viewport.height})`);
    await page.setViewportSize(viewport);

    for (const testPage of testPages) {
      try {
        await page.goto(`${BASE_URL}${testPage}`, { waitUntil: 'domcontentloaded' });
        await waitForLoad(page, 2000);

        const pageName = testPage.replace(/\//g, '') || 'home';
        await captureScreenshot(page, `responsive-${pageName}-${viewportName}`, true);

        console.log(`    ✓ ${testPage}`);
      } catch (error) {
        console.log(`    ❌ ${testPage}: ${error.message}`);
      }

      await page.waitForTimeout(300);
    }
  }
}

async function checkConsoleErrors(page) {
  console.log('\n🐛 MONITORING CONSOLE ERRORS');
  console.log('-'.repeat(60));

  const consoleErrors = [];
  const networkErrors = [];

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`  ❌ Console Error: ${msg.text()}`);
    }
  });

  // Listen for network errors
  page.on('requestfailed', request => {
    const error = `${request.method()} ${request.url()} - ${request.failure()?.errorText}`;
    networkErrors.push(error);
    console.log(`  ❌ Network Error: ${error}`);
  });

  return { consoleErrors, networkErrors };
}

async function generateReport(registrationSuccess, loginSuccess, pageResults) {
  const reportPath = path.join(SCREENSHOTS_DIR, `test-report-${TIMESTAMP}.txt`);

  let report = '';
  report += '='.repeat(70) + '\n';
  report += 'KOINONIA SMS - PRODUCTION TEST REPORT\n';
  report += '='.repeat(70) + '\n';
  report += `Date: ${new Date().toISOString()}\n`;
  report += `Base URL: ${BASE_URL}\n`;
  report += `Test Email: ${TEST_EMAIL}\n`;
  report += `Test Password: ${TEST_PASSWORD}\n`;
  report += '='.repeat(70) + '\n\n';

  report += 'REGISTRATION FLOW\n';
  report += '-'.repeat(70) + '\n';
  report += `Status: ${registrationSuccess ? '✓ PASSED' : '❌ FAILED'}\n\n`;

  report += 'LOGIN FLOW\n';
  report += '-'.repeat(70) + '\n';
  report += `Status: ${loginSuccess ? '✓ PASSED' : '❌ FAILED'}\n\n`;

  report += 'PAGE TESTS\n';
  report += '-'.repeat(70) + '\n';
  pageResults.forEach(result => {
    const status = result.success ? '✓' : '❌';
    const note = result.blank ? ' (BLANK)' : result.error ? ` (${result.error})` : '';
    report += `${status} ${result.page}${note}\n`;
  });

  report += '\n' + '='.repeat(70) + '\n';
  report += 'SCREENSHOTS\n';
  report += '-'.repeat(70) + '\n';
  report += `Location: ${SCREENSHOTS_DIR}\n`;
  report += `Total Screenshots: ${fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).length}\n`;

  fs.writeFileSync(reportPath, report);

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(60));
  console.log(report);
  console.log(`📄 Full report saved to: ${reportPath}\n`);
}

async function main() {
  let browser;

  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await playwright.chromium.launch({
      headless: false, // Set to true for headless mode
      slowMo: 500 // Slow down actions for visibility
    });

    const context = await browser.newContext({
      viewport: VIEWPORTS.desktop,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Set up error monitoring
    checkConsoleErrors(page);

    // Run tests
    const registrationSuccess = await testRegistration(page);

    let loginSuccess = false;
    if (registrationSuccess) {
      loginSuccess = await testLogin(page);
    } else {
      console.log('\n⚠️ Skipping login test due to registration failure');
      console.log('💡 Attempting login with potentially existing account...\n');
      loginSuccess = await testLogin(page);
    }

    let pageResults = [];
    if (loginSuccess) {
      pageResults = await testPages(page);
      await testResponsive(page);
    } else {
      console.log('\n⚠️ Skipping page tests due to login failure');
    }

    // Generate report
    await generateReport(registrationSuccess, loginSuccess, pageResults);

    console.log('\n✅ TESTING COMPLETE!');
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`📧 Test account: ${TEST_EMAIL}`);
    console.log(`🔐 Password: ${TEST_PASSWORD}\n`);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
