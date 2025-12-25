const { chromium } = require('playwright');

const TEST_EMAIL = `debug-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'Debug123!';

async function testLoginResponse() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🔍 DETAILED LOGIN RESPONSE CAPTURE');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const capturedData = {
    loginRequest: null,
    loginResponse: null,
    loginResponseData: null,
    navigationEvents: [],
  };

  // Intercept all auth requests/responses
  page.on('request', (request) => {
    if (request.url().includes('/auth/login')) {
      console.log(`📤 LOGIN REQUEST intercepted`);
      console.log(`   URL: ${request.url()}`);
      console.log(`   Method: ${request.method()}`);
      capturedData.loginRequest = request;
    }
  });

  page.on('response', (response) => {
    if (response.url().includes('/auth/login')) {
      console.log(`📥 LOGIN RESPONSE intercepted`);
      console.log(`   Status: ${response.status()}`);
      console.log(`   Status Text: ${response.statusText()}`);
      capturedData.loginResponse = response;

      // Try to capture the response body
      response
        .json()
        .then((data) => {
          console.log(`   Data received: ${JSON.stringify(data).substring(0, 200)}`);
          capturedData.loginResponseData = data;
        })
        .catch((e) => {
          console.log(`   Could not parse response as JSON: ${e.message}`);
        });
    }
  });

  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      console.log(`🔄 Navigation event: ${frame.url()}`);
      capturedData.navigationEvents.push(frame.url());
    }
  });

  try {
    // Register account
    console.log('STEP 1: Registering account\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Debug');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'Debug Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(2000);
    console.log('✅ Registration complete\n');

    // Clear and login
    console.log('STEP 2: Logging in\n');
    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Perform login
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    console.log('Submitting login form...\n');

    // Wait for login response with explicit timeout
    const navigationPromise = page.waitForNavigation({ timeout: 15000 }).catch(() => {
      console.log('Navigation promise rejected (timeout)');
      return null;
    });

    await page.click('button[type="submit"]');

    // Wait a bit for response to be captured
    await page.waitForTimeout(5000);

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('📊 CAPTURE RESULTS');
    console.log('═════════════════════════════════════════════════════════════════\n');

    console.log(`Login Request Captured: ${capturedData.loginRequest ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Login Response Captured: ${capturedData.loginResponse ? 'YES ✅' : 'NO ❌'}`);

    if (capturedData.loginResponse) {
      console.log(`\nResponse Status: ${capturedData.loginResponse.status()}`);
      console.log(`Response Status Text: ${capturedData.loginResponse.statusText()}`);
    }

    if (capturedData.loginResponseData) {
      console.log(`\nResponse Data Structure:`);
      console.log(JSON.stringify(capturedData.loginResponseData, null, 2).substring(0, 500));
    }

    console.log(`\nNavigation Events: ${capturedData.navigationEvents.length}`);
    capturedData.navigationEvents.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`);
    });

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);
    console.log(`On Dashboard: ${finalUrl.includes('dashboard') ? 'YES ✅' : 'NO ❌'}`);

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginResponse().catch(console.error);
