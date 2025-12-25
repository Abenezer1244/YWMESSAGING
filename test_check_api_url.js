const { chromium } = require('playwright');

async function checkAPIURL() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 CHECK FRONTEND API URL');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Loading login page...\n');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // GET THE API BASE URL FROM THE PAGE
    console.log('Checking API configuration in frontend...\n');

    const apiConfig = await page.evaluate(() => {
      // Try to find the axios config or environment variables
      const scripts = document.querySelectorAll('script');
      const data = {
        hostname: window.location.hostname,
        href: window.location.href,
        origin: window.location.origin,
      };

      // Check if there's any reference to api.koinoniasms.com
      const bodyText = document.body.innerText;
      data.hasAPIReference = bodyText.includes('api.koinoniasms.com');

      // Check localStorage
      data.localStorage = {
        keys: Object.keys(localStorage),
        authState: localStorage.getItem('authState'),
      };

      //Check for environment variables or config exposed in window
      data.windowKeys = Object.keys(window).filter((k) => k.includes('API') || k.includes('api'));

      return data;
    });

    console.log('Frontend Configuration:');
    console.log(`  Hostname: ${apiConfig.hostname}`);
    console.log(`  Origin: ${apiConfig.origin}`);
    console.log(`  Has API reference in page: ${apiConfig.hasAPIReference}`);
    console.log(`  localStorage keys: ${apiConfig.localStorage.keys.join(', ')}`);
    console.log(`  Window API-related keys: ${apiConfig.windowKeys.join(', ') || '(none)'}\n`);

    // TRY TO INTERCEPT WHAT URL THE AXIOS REQUEST USES
    console.log('Monitoring network requests to identify actual API endpoint...\n');

    const allRequests = [];
    page.on('request', (request) => {
      allRequests.push({
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toLocaleTimeString(),
      });
      if (request.url().includes('/api/')) {
        console.log(`📡 API Request: ${request.method()} ${request.url()}`);
      }
    });

    // FILL AND SUBMIT FORM
    console.log('Filling and submitting login form...\n');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // WAIT AND COLLECT REQUESTS
    await page.waitForTimeout(8000);

    // ANALYZE REQUESTS
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 REQUESTS MADE AFTER FORM SUBMIT');
    console.log('═══════════════════════════════════════════════════════\n');

    const apiRequests = allRequests.filter((req) => req.url.includes('/api/'));

    if (apiRequests.length === 0) {
      console.log('❌ NO API REQUESTS CAPTURED');
    } else {
      console.log(`${apiRequests.length} API requests made:\n`);
      apiRequests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.method} ${req.url}`);
      });

      const loginRequests = apiRequests.filter((req) => req.url.includes('/auth/login'));
      if (loginRequests.length > 0) {
        console.log(`\n✅ Found /auth/login request:`);
        console.log(`   ${loginRequests[0].url}`);
      } else {
        console.log('\n❌ No /auth/login request found');
      }
    }

    console.log(`\nTotal requests captured: ${allRequests.length}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

checkAPIURL().catch(console.error);
