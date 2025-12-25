const { chromium } = require('playwright');

const TEST_EMAIL = `api-response-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'APIResponse123!';

async function captureAPIResponse() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 CAPTURE /auth/login API RESPONSE');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'API');
    await page.fill('input[name="lastName"]', 'Response');
    await page.fill('input[name="churchName"]', 'API Response Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    console.log(`✅ Registered: ${TEST_EMAIL}\n`);
    await page.waitForTimeout(1500);

    // NAVIGATE TO LOGIN
    console.log('Navigate to login page...\n');
    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // CAPTURE API RESPONSE
    console.log('Setting up API response capture...\n');

    let loginResponse = null;
    let loginError = null;

    page.on('response', async (response) => {
      if (response.url().includes('/auth/login')) {
        const status = response.status();
        let body = '';
        try {
          body = await response.text();
        } catch (e) {
          body = '[Could not read body]';
        }

        loginResponse = {
          status,
          statusText: response.statusText(),
          body,
          headers: {
            'content-type': response.headers()['content-type'],
            'set-cookie': response.headers()['set-cookie'],
          },
        };

        console.log(`\n✅ /auth/login RESPONSE CAPTURED`);
        console.log(`   Status: ${status}`);
        console.log(`   StatusText: ${response.statusText()}`);
        console.log(`   Body: ${body.substring(0, 500)}`);
      }
    });

    // FILL AND SUBMIT
    console.log('Filling form and submitting...\n');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // WAIT FOR RESPONSE
    console.log('Waiting for API response...\n');
    await page.waitForTimeout(10000);

    // RESULTS
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 API RESPONSE DETAILS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (!loginResponse) {
      console.log('❌ NO /auth/login RESPONSE CAPTURED');
      console.log('   The API request may not have been made');
    } else {
      console.log(`Status Code: ${loginResponse.status}`);
      console.log(`Status Text: ${loginResponse.statusText}`);
      console.log(`\nResponse Body:`);
      console.log(loginResponse.body);
      console.log(`\nHeaders:`);
      console.log(`  Content-Type: ${loginResponse.headers['content-type']}`);
      console.log(`  Set-Cookie: ${loginResponse.headers['set-cookie'] || '(none)'}`);

      // Parse JSON if possible
      try {
        const json = JSON.parse(loginResponse.body);
        console.log(`\nParsed JSON:`);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('\nNot valid JSON');
      }

      // ANALYZE
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔍 ANALYSIS');
      console.log('═══════════════════════════════════════════════════════\n');

      if (loginResponse.status === 200 || loginResponse.status === 201) {
        console.log('✅ API returned success (200/201)');
        console.log('   But page is still on /login');
        console.log('   This suggests the response handling or navigation failed');
      } else if (loginResponse.status === 401) {
        console.log('❌ API returned 401 (Unauthorized)');
        console.log('   Authentication failed');
        try {
          const json = JSON.parse(loginResponse.body);
          console.log('   Error: ' + (json.error || 'unknown'));
        } catch (e) {}
      } else if (loginResponse.status === 400) {
        console.log('⚠️ API returned 400 (Bad Request)');
        console.log('   Invalid request data');
        try {
          const json = JSON.parse(loginResponse.body);
          console.log('   Error: ' + (json.error || 'unknown'));
        } catch (e) {}
      } else {
        console.log(`⚠️ API returned status ${loginResponse.status}`);
      }
    }

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);
    console.log(`Still on login: ${finalUrl.includes('/login')}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

captureAPIResponse().catch(console.error);
