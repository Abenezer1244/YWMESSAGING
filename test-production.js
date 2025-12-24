const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testKoinoniaSMS() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down to see what's happening
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
  });

  // Capture network errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]:`, error.message);
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const testEmail = `testuser.prod.${timestamp}@koinoniasms.dev`;
  const testPassword = 'Production123';

  const report = {
    timestamp: new Date().toISOString(),
    testEmail: testEmail,
    steps: []
  };

  try {
    console.log('\n========================================');
    console.log('STEP 1: CREATE TEST ACCOUNT');
    console.log('========================================\n');

    // Navigate to registration page
    console.log('Navigating to http://localhost:5173/register');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-registration-page.png'), fullPage: true });

    report.steps.push({
      step: 'Navigate to Registration Page',
      status: 'SUCCESS',
      url: page.url(),
      screenshot: '01-registration-page.png'
    });

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('Registration form found');

    // Fill in registration form
    console.log('\nFilling registration form with test data:');
    console.log('- First Name: TestUser');
    console.log('- Last Name: Prod');
    console.log(`- Email: ${testEmail}`);
    console.log('- Password: Production123');
    console.log('- Church Name: Production Test Church');

    // Try to find input fields by various selectors
    const firstNameSelectors = ['input[name="firstName"]', 'input[placeholder*="First"]', 'input[type="text"]:first-of-type'];
    for (const selector of firstNameSelectors) {
      try {
        await page.fill(selector, 'TestUser', { timeout: 2000 });
        console.log(`✓ Filled first name using: ${selector}`);
        break;
      } catch (e) {
        console.log(`✗ Could not fill first name with: ${selector}`);
      }
    }

    const lastNameSelectors = ['input[name="lastName"]', 'input[placeholder*="Last"]'];
    for (const selector of lastNameSelectors) {
      try {
        await page.fill(selector, 'Prod', { timeout: 2000 });
        console.log(`✓ Filled last name using: ${selector}`);
        break;
      } catch (e) {
        console.log(`✗ Could not fill last name with: ${selector}`);
      }
    }

    const emailSelectors = ['input[name="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'];
    for (const selector of emailSelectors) {
      try {
        await page.fill(selector, testEmail, { timeout: 2000 });
        console.log(`✓ Filled email using: ${selector}`);
        break;
      } catch (e) {
        console.log(`✗ Could not fill email with: ${selector}`);
      }
    }

    const passwordSelectors = ['input[name="password"]', 'input[type="password"]'];
    for (const selector of passwordSelectors) {
      try {
        await page.fill(selector, testPassword, { timeout: 2000 });
        console.log(`✓ Filled password using: ${selector}`);
        break;
      } catch (e) {
        console.log(`✗ Could not fill password with: ${selector}`);
      }
    }

    const churchNameSelectors = ['input[name="churchName"]', 'input[placeholder*="Church" i]', 'input[placeholder*="Organization" i]'];
    for (const selector of churchNameSelectors) {
      try {
        await page.fill(selector, 'Production Test Church', { timeout: 2000 });
        console.log(`✓ Filled church name using: ${selector}`);
        break;
      } catch (e) {
        console.log(`✗ Could not fill church name with: ${selector}`);
      }
    }

    // Fill confirm password field
    const confirmPasswordSelectors = ['input[name="confirmPassword"]', 'input[placeholder*="Confirm" i]'];
    for (const selector of confirmPasswordSelectors) {
      try {
        await page.fill(selector, testPassword, { timeout: 2000 });
        console.log(`✓ Filled confirm password using: ${selector}`);
        break;
      } catch (e) {
        console.log(`✗ Could not fill confirm password with: ${selector}`);
      }
    }

    await page.screenshot({ path: path.join(screenshotsDir, '02-registration-form-filled.png'), fullPage: true });

    // Submit form
    console.log('\nSubmitting registration form...');
    const submitSelectors = ['button[type="submit"]', 'button:has-text("Register")', 'button:has-text("Sign Up")', 'button:has-text("Create Account")'];
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        await page.click(selector, { timeout: 2000 });
        console.log(`✓ Clicked submit using: ${selector}`);
        submitted = true;
        break;
      } catch (e) {
        console.log(`✗ Could not click submit with: ${selector}`);
      }
    }

    if (!submitted) {
      throw new Error('Could not find submit button');
    }

    // Wait for navigation or error message
    try {
      await page.waitForNavigation({ timeout: 10000 });
      console.log('✓ Navigation occurred after form submission');
      console.log(`Current URL: ${page.url()}`);
    } catch (e) {
      console.log('⚠ No navigation detected, checking for errors...');
    }

    await page.screenshot({ path: path.join(screenshotsDir, '03-post-registration.png'), fullPage: true });

    // Check for error messages
    const errorSelectors = ['.error', '[role="alert"]', '.text-danger', '.alert-danger', 'p:has-text("error" i)'];
    let hasError = false;
    for (const selector of errorSelectors) {
      try {
        const errorElement = await page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          console.log(`❌ Error found: ${errorText}`);
          hasError = true;
          report.steps.push({
            step: 'Submit Registration Form',
            status: 'FAILED',
            error: errorText,
            screenshot: '03-post-registration.png'
          });
        }
      } catch (e) {
        // No error found with this selector
      }
    }

    if (!hasError) {
      report.steps.push({
        step: 'Submit Registration Form',
        status: 'SUCCESS',
        url: page.url(),
        screenshot: '03-post-registration.png'
      });
    }

    console.log('\n========================================');
    console.log('STEP 2: TEST POST-REGISTRATION PAGES');
    console.log('========================================\n');

    // Test each page
    const pagesToTest = [
      { name: 'Dashboard', url: 'http://localhost:5173/dashboard', screenshot: '04-dashboard.png' },
      { name: 'Groups', url: 'http://localhost:5173/groups', screenshot: '05-groups.png' },
      { name: 'Send Message', url: 'http://localhost:5173/send', screenshot: '06-send-message.png' },
      { name: 'Settings', url: 'http://localhost:5173/settings', screenshot: '07-settings.png' }
    ];

    for (const pageTest of pagesToTest) {
      console.log(`\nTesting ${pageTest.name} page...`);
      try {
        await page.goto(pageTest.url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000); // Wait for any dynamic content
        await page.screenshot({ path: path.join(screenshotsDir, pageTest.screenshot), fullPage: true });

        const currentUrl = page.url();
        console.log(`✓ ${pageTest.name} page loaded: ${currentUrl}`);

        report.steps.push({
          step: `${pageTest.name} Page`,
          status: 'SUCCESS',
          url: currentUrl,
          screenshot: pageTest.screenshot
        });
      } catch (error) {
        console.log(`❌ ${pageTest.name} page failed: ${error.message}`);
        await page.screenshot({ path: path.join(screenshotsDir, pageTest.screenshot), fullPage: true });

        report.steps.push({
          step: `${pageTest.name} Page`,
          status: 'FAILED',
          error: error.message,
          screenshot: pageTest.screenshot
        });
      }
    }

    console.log('\n========================================');
    console.log('STEP 3: TEST LOGIN PAGE');
    console.log('========================================\n');

    // Test login page
    console.log('\nTesting Login page...');
    try {
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(screenshotsDir, '08-login-page.png'), fullPage: true });
      console.log(`Login page URL: ${page.url()}`);

      report.steps.push({
        step: 'Login Page',
        status: 'SUCCESS',
        url: page.url(),
        screenshot: '08-login-page.png'
      });
    } catch (error) {
      console.log(`❌ Login page failed: ${error.message}`);
      await page.screenshot({ path: path.join(screenshotsDir, '08-login-page.png'), fullPage: true });
      report.steps.push({
        step: 'Login Page',
        status: 'FAILED',
        error: error.message,
        screenshot: '08-login-page.png'
      });
    }

  } catch (error) {
    console.error('\n\n❌ CRITICAL ERROR:', error);
    report.criticalError = error.message;
    await page.screenshot({ path: path.join(screenshotsDir, 'error-critical.png'), fullPage: true });
  } finally {
    // Save report
    fs.writeFileSync(
      path.join(__dirname, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Save console logs
    fs.writeFileSync(
      path.join(__dirname, 'console-logs.txt'),
      consoleLogs.join('\n')
    );

    console.log('\n========================================');
    console.log('TEST COMPLETE');
    console.log('========================================\n');
    console.log(`Test Email: ${testEmail}`);
    console.log(`Test Password: ${testPassword}`);
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    console.log(`Report saved to: test-report.json`);
    console.log(`Console logs saved to: console-logs.txt`);

    await browser.close();
  }
}

testKoinoniaSMS();
