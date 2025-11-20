import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';

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
  console.log('API ERROR DEBUGGING TEST');
  console.log('════════════════════════════════════════════════');
  console.log('');

  let browser;
  try {
    browser = await chromium.launch({ headless: false }); // headless: false to watch
    const page = await browser.newPage();

    // Capture all network activity
    const responses = [];
    page.on('response', async (response) => {
      if (response.url().includes('/auth/register')) {
        try {
          const body = await response.text();
          responses.push({
            status: response.status(),
            url: response.url(),
            body: body
          });
          console.log(`[API Response] Status: ${response.status()}`);
          console.log(`Response Body: ${body}`);
        } catch (e) {
          console.log(`Could not read response: ${e.message}`);
        }
      }
    });

    // Navigate to register
    console.log('Navigating to register page...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

    // Fill form
    console.log('Filling registration form...');
    await page.fill('input[placeholder="John"]', testData.firstName);
    await page.fill('input[placeholder="Doe"]', testData.lastName);
    await page.fill('input[placeholder="Grace Community Church"]', testData.churchName);
    await page.fill('input[placeholder="pastor@church.com"]', testData.email);
    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].fill(testData.password);
    await passwordInputs[1].fill(testData.password);
    console.log('Form filled');
    console.log('');

    // Submit
    console.log('Submitting form...');
    const buttons = await page.$$('button[type="submit"]');
    if (buttons.length > 0) {
      await buttons[0].click();
    }

    // Wait for response
    await page.waitForTimeout(3000);

    console.log('');
    console.log('Captured Responses:');
    console.log(JSON.stringify(responses, null, 2));

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();
