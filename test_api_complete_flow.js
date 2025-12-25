const { chromium } = require('playwright');

const TEST_EMAIL = `complete-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'CompleteFlow123!';

async function testCompleteFlow() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 COMPLETE API FLOW TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Complete');
    await page.fill('input[name="lastName"]', 'Flow');
    await page.fill('input[name="churchName"]', 'Complete Flow Church');
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

    // INTERCEPT RESPONSES TO FIND AUTH/LOGIN
    console.log('Setting up response monitoring...\n');

    const apiResponses = {};
    let loginRequestTime = null;
    let loginResponseTime = null;

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        const endpoint = url.substring(url.lastIndexOf('/api/'));
        apiResponses[endpoint] = apiResponses[endpoint] || [];

        const status = response.status();
        let body = '';
        try {
          body = await response.text();
        } catch (e) {
          body = '[Could not read body]';
        }

        apiResponses[endpoint].push({
          status,
          body: body.substring(0, 200),
          timestamp: new Date().toLocaleTimeString(),
        });

        if (endpoint.includes('/auth/login')) {
          loginResponseTime = Date.now();
          console.log(`\n✅ /auth/login RESPONSE:  Status ${status}`);
          if (status === 200 || status === 201) {
            console.log(`   Success response received`);
          } else {
            console.log(`   Error response: ${body.substring(0, 100)}`);
          }
        }
      }
    });

    // FILL AND SUBMIT
    console.log('Filling form...\n');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    console.log('Submitting form...\n');
    loginRequestTime = Date.now();
    await page.click('button[type="submit"]');

    // WAIT FOR RESPONSE
    console.log('Waiting for API response...\n');
    await page.waitForTimeout(10000);

    // CALCULATE TIMING
    let responseTime = null;
    if (loginRequestTime && loginResponseTime) {
      responseTime = loginResponseTime - loginRequestTime;
    }

    // RESULTS
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`API Responses captured:`);
    Object.entries(apiResponses).forEach(([endpoint, responses]) => {
      console.log(`\n${endpoint}:`);
      responses.forEach((resp, i) => {
        console.log(`  ${i + 1}. Status: ${resp.status} | Time: ${resp.timestamp}`);
      });
    });

    if (loginResponseTime && loginRequestTime) {
      console.log(`\n⏱️ Login API timing:  ${responseTime}ms from request to response`);
    } else if (loginRequestTime && !loginResponseTime) {
      const elapsed = Date.now() - loginRequestTime;
      console.log(`\n⏱️ Login API timing: ${elapsed}ms elapsed (no response yet)`);
    } else {
      console.log('\n⏱️ Login API: No request/response captured');
    }

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);
    console.log(`On dashboard: ${finalUrl.includes('dashboard')}`);

    // CHECK PAGE STATE
    const pageText = await page.locator('body').textContent();
    const hasError = pageText.toLowerCase().includes('error') || pageText.toLowerCase().includes('invalid');
    const hasToast = pageText.toLowerCase().includes('success') || pageText.toLowerCase().includes('failed');

    console.log(`\nPage has error text: ${hasError}`);
    console.log(`Page has toast/message: ${hasToast}`);

    // DIAGNOSIS
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 DIAGNOSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (!apiResponses['/api/auth/login'] || apiResponses['/api/auth/login'].length === 0) {
      console.log('❌ NO /api/auth/login RESPONSE');
      console.log('   API request was never made or response was not captured');
    } else {
      const loginResp = apiResponses['/api/auth/login'][0];
      if (loginResp.status === 200 || loginResp.status === 201) {
        console.log('✅ API returned success but page didn\'t navigate');
        console.log('   Issue: Response handling or navigation failed');
      } else if (loginResp.status === 401) {
        console.log('❌ API returned 401 (Unauthorized)');
        console.log('   Email/password may be incorrect');
        console.log('   Or credentials not saved properly');
      } else if (loginResp.status === 400) {
        console.log('❌ API returned 400 (Bad Request)');
        console.log('   Validation may have failed');
      } else {
        console.log(`⚠️ API returned status ${loginResp.status}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCompleteFlow().catch(console.error);
