/**
 * Debug Production Registration Error
 * Captures console logs, network requests, and detailed error information
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const errors = [];
const logs = [];
const networkLogs = [];
const consoleLogs = [];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  console.log(logEntry);
  logs.push(logEntry);
}

async function debugRegistration() {
  let browser;
  let page;

  try {
    log('🔍 Starting Registration Debug Test\n');

    browser = await chromium.launch({
      headless: false,
      slowMo: 300
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });

    page = await context.newPage();

    // Capture console logs
    page.on('console', (msg) => {
      const logEntry = `[CONSOLE ${msg.type()}] ${msg.text()}`;
      console.log(logEntry);
      consoleLogs.push(logEntry);
    });

    // Capture network requests
    page.on('request', (request) => {
      const logEntry = `[REQUEST] ${request.method()} ${request.url()}`;
      if (request.url().includes('/api/')) {
        console.log(logEntry);
        networkLogs.push({
          type: 'request',
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    // Capture network responses
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const logEntry = `[RESPONSE] ${response.status()} ${response.url()}`;
        console.log(logEntry);

        let responseBody;
        try {
          responseBody = await response.text();
        } catch (e) {
          responseBody = 'Could not read response body';
        }

        networkLogs.push({
          type: 'response',
          status: response.status(),
          url: response.url(),
          headers: response.headers(),
          body: responseBody
        });
      }
    });

    // Navigate to registration
    log('Navigating to registration page...');
    await page.goto('https://koinoniasms.com/register', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.screenshot({ path: 'screenshots/debug-01-registration-page.png', fullPage: true });

    // Fill form
    log('Filling registration form...');
    const testData = {
      firstName: 'Debug',
      lastName: 'Test',
      churchName: `Debug Church ${Date.now()}`,
      email: `debug-${Date.now()}@test.com`,
      password: 'DebugTest123!'
    };

    await page.fill('input[name="firstName"]', testData.firstName);
    await page.fill('input[name="lastName"]', testData.lastName);
    await page.fill('input[name="churchName"]', testData.churchName);
    await page.fill('input[type="email"]', testData.email);
    await page.fill('input[name="password"]', testData.password);
    await page.fill('input[name="confirmPassword"]', testData.password);

    log(`Form filled: ${testData.email}`);
    await page.screenshot({ path: 'screenshots/debug-02-form-filled.png', fullPage: true });

    // Submit
    log('Submitting form...');
    await page.click('button[type="submit"]');

    // Wait and observe
    log('Waiting for response...');
    await page.waitForTimeout(15000); // Wait 15 seconds

    await page.screenshot({ path: 'screenshots/debug-03-after-submit.png', fullPage: true });

    // Check for any toast/error messages
    const toasts = await page.$$('.toast, [role="alert"], .error, .alert');
    if (toasts.length > 0) {
      log(`Found ${toasts.length} toast/alert elements`);
      for (let i = 0; i < toasts.length; i++) {
        const text = await toasts[i].textContent();
        log(`Toast ${i + 1}: ${text}`);
      }
    } else {
      log('No toast/alert elements found');
    }

    // Check current URL
    const currentURL = page.url();
    log(`Current URL: ${currentURL}`);

    // Check if still on registration page
    if (currentURL.includes('/register')) {
      log('⚠️ Still on registration page - registration likely failed');
    } else if (currentURL.includes('/dashboard')) {
      log('✅ Redirected to dashboard - registration successful!');
    }

    // Save all collected data
    const report = {
      testData,
      timestamp: new Date().toISOString(),
      finalURL: currentURL,
      errors,
      logs,
      consoleLogs,
      networkLogs: networkLogs.filter(l =>
        l.url && (l.url.includes('/register') || l.url.includes('/auth'))
      )
    };

    writeFileSync('registration-debug-report.json', JSON.stringify(report, null, 2));
    log('\n📄 Debug report saved to: registration-debug-report.json');

    // Print network logs summary
    log('\n═══ NETWORK ACTIVITY SUMMARY ═══');
    const registerRequests = networkLogs.filter(l => l.url && l.url.includes('/auth/register'));
    log(`\nFound ${registerRequests.length} registration API calls:`);
    registerRequests.forEach((req, index) => {
      log(`\n${index + 1}. ${req.type.toUpperCase()}`);
      if (req.method) log(`   Method: ${req.method}`);
      if (req.status) log(`   Status: ${req.status}`);
      if (req.body) log(`   Body: ${req.body.substring(0, 200)}`);
    });

    log('\nKeeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'error');
    if (page) {
      await page.screenshot({ path: 'screenshots/debug-error.png', fullPage: true });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugRegistration().catch(console.error);
