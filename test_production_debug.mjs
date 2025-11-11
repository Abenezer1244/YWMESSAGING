import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://connect-yw-frontend.onrender.com';

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
  console.log('PRODUCTION API DEBUG TEST');
  console.log('════════════════════════════════════════════════');
  console.log('');
  console.log('Test Data:', testData.email);
  console.log('');

  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture all responses
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
          console.log(`[API] POST /auth/register → ${response.status()}`);
          if (response.status() !== 200) {
            console.log(`Response: ${body}`);
          }
        } catch (e) {
          console.log(`Could not read response: ${e.message}`);
        }
      }
    });

    // Capture console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    console.log('Navigating to production register page...');
    await page.goto(`${PRODUCTION_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Page loaded');
    console.log('');

    console.log('Filling registration form...');
    await page.fill('input[placeholder="John"]', testData.firstName);
    await page.fill('input[placeholder="Doe"]', testData.lastName);
    await page.fill('input[placeholder="Grace Community Church"]', testData.churchName);
    await page.fill('input[placeholder="pastor@church.com"]', testData.email);

    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].fill(testData.password);
    await passwordInputs[1].fill(testData.password);
    console.log('✅ Form filled');
    console.log('');

    console.log('Submitting form...');
    const buttons = await page.$$('button[type="submit"]');
    if (buttons.length > 0) {
      await buttons[0].click();
    }

    // Wait for response
    await page.waitForTimeout(5000);

    console.log('');
    console.log('API Responses:');
    console.log(JSON.stringify(responses, null, 2));

    const currentUrl = page.url();
    console.log('');
    console.log('Final URL:', currentUrl);

    if (responses.length > 0 && responses[0].status === 400) {
      console.log('');
      console.log('⚠️  Registration failed with 400 error');
      console.log('Error details:', responses[0].body);
    }

    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();
