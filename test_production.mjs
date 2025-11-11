import { chromium } from 'playwright';
import fs from 'fs';

const PRODUCTION_URL = 'https://connect-yw-frontend.onrender.com';
const screenshotDir = './screenshots_production';

// Create screenshots directory
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Generate unique test data
const timestamp = Date.now();
const randomId = Math.floor(Math.random() * 10000);
const testData = {
  firstName: 'Test',
  lastName: 'User',
  churchName: `Church ${randomId}`,
  email: `test_${timestamp}_${randomId}@testmail.com`,
  password: 'TestPassword123!',
};

async function runTest() {
  console.log('════════════════════════════════════════════════');
  console.log('WELCOME MODAL PRODUCTION TEST');
  console.log('════════════════════════════════════════════════');
  console.log('');
  console.log('Test URL:', `${PRODUCTION_URL}/register`);
  console.log('Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Step 1: Navigate
    console.log('Step 1: Navigating to production register page...');
    await page.goto(`${PRODUCTION_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `${screenshotDir}/01-register-page.png` });
    console.log('✅ Page loaded');
    console.log('');

    // Step 2: Fill form
    console.log('Step 2: Filling registration form...');
    try {
      await page.fill('input[placeholder="John"]', testData.firstName);
      await page.fill('input[placeholder="Doe"]', testData.lastName);
      await page.fill('input[placeholder="Grace Community Church"]', testData.churchName);
      await page.fill('input[placeholder="pastor@church.com"]', testData.email);

      const passwordInputs = await page.$$('input[type="password"]');
      await passwordInputs[0].fill(testData.password);
      await passwordInputs[1].fill(testData.password);

      console.log('✅ Form filled');
    } catch (e) {
      console.log('❌ Error filling form:', e.message);
      await page.screenshot({ path: `${screenshotDir}/02-form-error.png` });
    }

    await page.screenshot({ path: `${screenshotDir}/02-form-filled.png` });
    console.log('✅ Screenshot saved');
    console.log('');

    // Step 3: Submit
    console.log('Step 3: Submitting registration...');
    const buttons = await page.$$('button[type="submit"]');
    if (buttons.length > 0) {
      await buttons[0].click();
      console.log('✅ Form submitted');
    }

    // Wait for response
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    console.log('');

    await page.screenshot({ path: `${screenshotDir}/03-after-submit.png` });
    console.log('✅ Screenshot saved: 03-after-submit.png');
    console.log('');

    // Step 4: Check for modal
    console.log('Step 4: Checking for welcome modal...');
    const dialogElement = await page.$('[role="dialog"]');
    const welcomeHeading = await page.$('text=Welcome');

    if (dialogElement || welcomeHeading) {
      console.log('✅✅✅ WELCOME MODAL FOUND! ✅✅✅');
      await page.screenshot({ path: `${screenshotDir}/04-welcome-modal-FOUND.png` });
      console.log('✅ Screenshot saved: 04-welcome-modal-FOUND.png');
      console.log('');

      // Try clicking a role
      console.log('Step 5: Testing role selection...');
      const radios = await page.$$('input[type="radio"]');
      if (radios.length > 0) {
        await radios[0].click();
        await page.waitForTimeout(500);
        console.log('✅ Role selected');

        // Find and click continue
        const allButtons = await page.$$('button');
        for (const btn of allButtons) {
          const text = await btn.textContent();
          if (text.includes('Continue')) {
            await btn.click();
            await page.waitForTimeout(2000);
            break;
          }
        }

        await page.screenshot({ path: `${screenshotDir}/05-after-continue.png` });
        console.log('✅ Continue clicked');
      }
    } else {
      console.log('❌ WELCOME MODAL NOT FOUND');
      console.log('Current URL:', currentUrl);
      await page.screenshot({ path: `${screenshotDir}/04-no-modal.png` });
    }

    console.log('');
    console.log('════════════════════════════════════════════════');
    console.log('TEST COMPLETE');
    console.log('════════════════════════════════════════════════');
    console.log('');
    console.log('Result:', dialogElement || welcomeHeading ? '✅ SUCCESS - Modal Found!' : '❌ FAILURE - Modal Not Found');
    console.log('Screenshots:', screenshotDir);

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();
