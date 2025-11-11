import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const screenshotDir = './screenshots';

// Create screenshots directory
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Generate unique test data
const timestamp = Date.now();
const randomId = Math.floor(Math.random() * 10000);
const testData = {
  firstName: 'John',
  lastName: 'Doe',
  churchName: `Test Church ${randomId}`,
  email: `test_${timestamp}_${randomId}@testmail.com`,
  password: 'TestPassword123!',
};

async function runTest() {
  console.log('════════════════════════════════════════════════');
  console.log('SIGNUP FORM DEBUG TEST - WITH CONSOLE LOGGING');
  console.log('════════════════════════════════════════════════');
  console.log('');
  console.log('Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: false }); // headless: false to see the browser
    const page = await browser.newPage();

    // Capture console messages
    page.on('console', (msg) => {
      console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    // Capture uncaught exceptions
    page.on('pageerror', (error) => {
      console.error(`[PAGE ERROR] ${error.message}`);
      console.error(error.stack);
    });

    // Capture network errors
    page.on('requestfailed', (request) => {
      console.error(`[NETWORK ERROR] ${request.method()} ${request.url()}: ${request.failure().errorText}`);
    });

    // Step 1: Navigate to register page
    console.log('Step 1: Navigating to register page...');
    console.log('URL:', `${BASE_URL}/register`);
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/01-register-page.png` });
    console.log('✅ Screenshot saved: 01-register-page.png');
    console.log('');

    // Step 2: Fill in registration form
    console.log('Step 2: Filling registration form...');

    // Fill First Name
    const firstNameInput = await page.$('input[placeholder="John"]');
    if (firstNameInput) {
      await firstNameInput.fill(testData.firstName);
      console.log('✅ Filled first name');
    } else {
      console.log('⚠️  Could not find first name input by placeholder');
      const inputs = await page.$$('input');
      console.log(`Found ${inputs.length} total inputs`);
    }

    // Fill Last Name
    await page.fill('input[placeholder="Doe"]', testData.lastName);
    console.log('✅ Filled last name');

    // Fill Church Name
    await page.fill('input[placeholder="Grace Community Church"]', testData.churchName);
    console.log('✅ Filled church name');

    // Fill Email
    await page.fill('input[placeholder="pastor@church.com"]', testData.email);
    console.log('✅ Filled email');

    // Fill Password fields
    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].fill(testData.password);
    console.log('✅ Filled password');

    await passwordInputs[1].fill(testData.password);
    console.log('✅ Filled confirm password');

    await page.screenshot({ path: `${screenshotDir}/02-form-filled.png` });
    console.log('✅ Form filled');
    console.log('✅ Screenshot saved: 02-form-filled.png');
    console.log('');

    // Step 3: Submit the form and monitor for network/navigation
    console.log('Step 3: Submitting registration...');

    // Listen for all network requests
    let apiResponse = null;
    page.on('response', (response) => {
      if (response.url().includes('/auth/register')) {
        console.log(`[API RESPONSE] ${response.status()} ${response.url()}`);
        apiResponse = response;
        response.json().then((data) => {
          console.log('[API RESPONSE DATA]:', JSON.stringify(data, null, 2));
        }).catch((e) => {
          console.log('[API RESPONSE] Could not parse JSON:', e.message);
        });
      }
    });

    // Find and click the submit button
    const buttons = await page.$$('button[type="submit"]');
    console.log(`Found ${buttons.length} submit buttons`);

    if (buttons.length > 0) {
      console.log('Clicking submit button...');
      await buttons[0].click();
    } else {
      console.log('⚠️  No submit button found, looking for button by text...');
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const text = await btn.textContent();
        if (text.includes('Create')) {
          console.log('Found create button:', text.trim());
          await btn.click();
          break;
        }
      }
    }

    // Wait for navigation or timeout
    console.log('Waiting for navigation or API response...');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 8000 });
      console.log('✅ Navigation detected');
    } catch (e) {
      console.log('⚠️  Navigation timeout - this is expected for SPAs');
    }

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);
    console.log('');

    await page.screenshot({ path: `${screenshotDir}/03-after-submit.png` });
    console.log('✅ Screenshot saved: 03-after-submit.png');

    // Step 4: Check for welcome modal
    console.log('Step 4: Looking for welcome modal...');
    const dialogElement = await page.$('[role="dialog"]');
    const modalDiv = await page.$('.modal, [class*="modal"]');

    if (dialogElement || modalDiv) {
      console.log('✅ WELCOME MODAL FOUND!');
      await page.screenshot({ path: `${screenshotDir}/04-welcome-modal.png` });
      console.log('✅ Screenshot saved: 04-welcome-modal.png');
    } else {
      console.log('❌ WELCOME MODAL NOT FOUND!');
      console.log('Current URL:', currentUrl);
      if (currentUrl.includes('/dashboard')) {
        console.log('✅ Navigated to dashboard, but modal not visible');
      } else if (currentUrl.includes('/register')) {
        console.log('❌ Still on register page - navigation failed');
      }
    }

    // Summary
    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('TEST COMPLETE');
    console.log('════════════════════════════════════════════════');
    console.log('Screenshots saved to:', screenshotDir);
    console.log('');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: `${screenshotDir}/error-screenshot.png` });
        }
      } catch (e) {
        console.error('Could not capture error screenshot');
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();
