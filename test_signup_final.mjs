import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5174';
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
  console.log('WELCOME MODAL TEST - LOCAL BROWSER TEST');
  console.log('════════════════════════════════════════════════');
  console.log('');
  console.log('Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Capture console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    // Step 1: Navigate to register page
    console.log('Step 1: Navigating to register page...');
    console.log('URL:', `${BASE_URL}/register`);
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${screenshotDir}/01-register-page.png` });
    console.log('✅ Screenshot saved: 01-register-page.png');
    console.log('');

    // Step 2: Fill in registration form
    console.log('Step 2: Filling registration form...');

    // Fill First Name
    await page.fill('input[placeholder="John"]', testData.firstName);
    console.log('✅ Filled first name');

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
    await passwordInputs[1].fill(testData.password);
    console.log('✅ Filled password fields');

    await page.screenshot({ path: `${screenshotDir}/02-form-filled.png` });
    console.log('✅ Screenshot saved: 02-form-filled.png');
    console.log('');

    // Step 3: Submit the form
    console.log('Step 3: Submitting registration...');

    // Monitor API responses
    page.on('response', (response) => {
      if (response.url().includes('/auth/register')) {
        console.log(`[API] POST /auth/register → ${response.status()}`);
      }
    });

    // Click submit button
    const buttons = await page.$$('button[type="submit"]');
    if (buttons.length > 0) {
      await buttons[0].click();
      console.log('Clicked submit button');
    }

    // Wait for navigation or modal to appear
    console.log('Waiting for response...');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 8000 });
      console.log('✅ Navigation detected');
    } catch (e) {
      console.log('⚠️  No full navigation (SPA - expected)');
    }

    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    console.log('');

    await page.screenshot({ path: `${screenshotDir}/03-after-submit.png` });
    console.log('✅ Screenshot saved: 03-after-submit.png');
    console.log('');

    // Step 4: Check for welcome modal
    console.log('Step 4: Looking for welcome modal...');
    const dialogElement = await page.$('[role="dialog"]');

    if (dialogElement) {
      console.log('✅ WELCOME MODAL DETECTED!');
      await page.screenshot({ path: `${screenshotDir}/04-welcome-modal.png` });
      console.log('✅ Screenshot saved: 04-welcome-modal.png');
      console.log('');

      // Step 5: Select a role
      console.log('Step 5: Selecting role...');
      const radioButtons = await page.$$('input[type="radio"]');
      if (radioButtons.length > 0) {
        await radioButtons[0].click();
        await page.waitForTimeout(500);
        console.log('✅ Role selected');
        console.log('');

        // Step 6: Click Continue button
        console.log('Step 6: Clicking Continue button...');
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await btn.textContent();
          if (text.includes('Continue') || text.includes('Next')) {
            await btn.click();
            await page.waitForTimeout(1500);
            break;
          }
        }
        await page.screenshot({ path: `${screenshotDir}/05-after-continue.png` });
        console.log('✅ Screenshot saved: 05-after-continue.png');
        console.log('');
      }
    } else {
      console.log('❌ WELCOME MODAL NOT FOUND!');
      console.log('Current URL:', currentUrl);

      if (currentUrl.includes('/dashboard')) {
        console.log('⚠️  On dashboard but modal not visible');
      } else if (currentUrl.includes('/register')) {
        console.log('❌ Still on register page - signup failed');

        // Check for error messages on page
        const errorElements = await page.$$('text=/error|failed|invalid/i');
        if (errorElements.length > 0) {
          for (const el of errorElements) {
            console.log('Error found:', await el.textContent());
          }
        }
      }
    }

    // Summary
    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('TEST COMPLETE');
    console.log('════════════════════════════════════════════════');
    console.log('');
    console.log('Result:', dialogElement ? '✅ WELCOME MODAL APPEARED' : '❌ WELCOME MODAL NOT FOUND');
    console.log('Screenshots:', screenshotDir);
    console.log('');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();
