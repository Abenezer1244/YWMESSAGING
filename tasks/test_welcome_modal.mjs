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

    // Step 1: Navigate to register page
    console.log('Step 1: Navigating to register page...');
    console.log('URL:', `${BASE_URL}/register`);
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/01-register-page.png` });
    console.log('✅ Screenshot saved: 01-register-page.png');
    console.log('');

    // Step 2: Fill in registration form
    console.log('Step 2: Filling registration form...');

    // Get all inputs
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} input fields`);

    let inputIndex = 0;
    await inputs[inputIndex++].fill(testData.firstName); // First Name
    await inputs[inputIndex++].fill(testData.lastName); // Last Name
    await inputs[inputIndex++].fill(testData.churchName); // Church Name
    await inputs[inputIndex++].fill(testData.email); // Email
    await inputs[inputIndex++].fill(testData.password); // Password
    await inputs[inputIndex++].fill(testData.password); // Confirm Password

    await page.screenshot({ path: `${screenshotDir}/02-form-filled.png` });
    console.log('✅ Form filled');
    console.log('✅ Screenshot saved: 02-form-filled.png');
    console.log('');

    // Step 3: Submit the form
    console.log('Step 3: Submitting registration...');
    const buttons = await page.$$('button');

    // Find and click the submit button (usually the last button or one with "Create" text)
    let submitClicked = false;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text.includes('Create') || text.includes('Sign up') || text.includes('Register')) {
        console.log('Found submit button:', text.trim());
        await btn.click();
        submitClicked = true;
        break;
      }
    }

    if (!submitClicked) {
      console.log('Could not find submit button, clicking last button');
      await buttons[buttons.length - 1].click();
    }

    console.log('Waiting for navigation...');
    try {
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
    } catch (e) {
      console.log('Navigation timeout (expected for single-page app)');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/03-after-signup.png` });
    console.log('✅ Registration submitted');
    console.log('✅ Screenshot saved: 03-after-signup.png');
    console.log('');

    // Step 4: Check for welcome modal
    console.log('Step 4: Looking for welcome modal...');

    // Check multiple ways to find the modal
    const dialogElement = await page.$('[role="dialog"]');
    const modalDiv = await page.$('.modal, [class*="modal"]');
    const welcomeText = await page.$('text=Welcome');

    console.log('Dialog found:', !!dialogElement);
    console.log('Modal div found:', !!modalDiv);
    console.log('Welcome text found:', !!welcomeText);

    if (dialogElement || modalDiv || welcomeText) {
      console.log('✅ WELCOME MODAL DETECTED!');
      await page.screenshot({ path: `${screenshotDir}/04-welcome-modal.png` });
      console.log('✅ Screenshot saved: 04-welcome-modal.png');
      console.log('');

      // Step 5: Select a role
      console.log('Step 5: Selecting role...');
      const radioButtons = await page.$$('input[type="radio"]');
      console.log(`Found ${radioButtons.length} radio buttons`);

      if (radioButtons.length > 0) {
        await radioButtons[0].click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screetshotDir}/05-role-selected.png` });
        console.log('✅ Role selected');
        console.log('✅ Screenshot saved: 05-role-selected.png');
        console.log('');

        // Step 6: Click Continue
        console.log('Step 6: Clicking Continue button...');
        const buttons2 = await page.$$('button');
        for (const btn of buttons2) {
          const text = await btn.textContent();
          if (text.includes('Continue') || text.includes('Next')) {
            await btn.click();
            await page.waitForTimeout(1500);
            break;
          }
        }
        await page.screenshot({ path: `${screenshotDir}/06-modal-closed.png` });
        console.log('✅ Screenshot saved: 06-modal-closed.png');
        console.log('');
      }
    } else {
      console.log('❌ WELCOME MODAL NOT FOUND!');
      const pageUrl = page.url();
      const title = await page.title();
      console.log('Current URL:', pageUrl);
      console.log('Page title:', title);
      await page.screenshot({ path: `${screenshotDir}/04-no-modal.png` });
      console.log('✅ Screenshot saved for debugging: 04-no-modal.png');
      console.log('');
    }

    // Summary
    console.log('════════════════════════════════════════════════');
    console.log('TEST COMPLETE');
    console.log('════════════════════════════════════════════════');
    console.log('');
    console.log('Screenshots saved to:', screenshotDir);
    console.log('');
    console.log('Test Summary:');
    console.log('✅ Signup page loaded');
    console.log('✅ Form filled and submitted');
    console.log(dialogElement || modalDiv || welcomeText ? '✅ Welcome modal appeared' : '❌ Welcome modal NOT found');
    console.log('');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (browser) {
      try {
        await browser.pages()[0]?.screenshot({ path: `${screenshotDir}/error-screenshot.png` });
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
