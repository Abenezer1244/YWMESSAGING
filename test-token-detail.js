const { chromium } = require('playwright');

async function testTokenDetail() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('=== STEP 1: LOGIN ===');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');

    // Intercept all requests to see details
    const requestLog = [];
    page.on('request', request => {
      if (request.url().includes('/api/') && !request.url().includes('csrf')) {
        requestLog.push({
          url: request.url(),
          method: request.method(),
          time: new Date().toISOString()
        });
      }
    });

    const responseLog = [];
    page.on('response', response => {
      if (response.url().includes('/api/') && !response.url().includes('csrf')) {
        responseLog.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          time: new Date().toISOString()
        });
        // Log detail for auth calls
        if (response.url().includes('/login') || response.url().includes('/refresh') || response.url().includes('/me')) {
          response.text().then(text => {
            console.log(`[${response.status()}] ${response.url().substring(response.url().lastIndexOf('/'))} - ${text.substring(0, 100)}`);
          });
        }
      }
    });

    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in successfully');

    // Get cookies
    const cookies = await page.context().cookies();
    const accessToken = cookies.find(c => c.name === 'accessToken');
    console.log(`Access token received (length: ${accessToken.value.length})`);
    console.log(`Token parts (signature): ${accessToken.value.split('.')[2].substring(0, 20)}...`);

    console.log('\n=== STEP 2: CALL /api/admin/me ===');
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        return {
          status: res.status,
          error: data.error,
          success: res.ok
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log(`/api/admin/me response: status=${response.status}, error=${response.error}, success=${response.success}`);

    if (response.status === 401) {
      console.log('\n❌ CRITICAL: Fresh token is being rejected with 401');
      console.log('This means the token revocation check is failing.');
    }

    console.log('\n=== STEP 3: DETAILED API CALLS ===');
    console.log('Request/Response log:');
    responseLog.forEach(r => {
      console.log(`  [${r.status}] ${r.method} ${r.url.substring(r.url.lastIndexOf('/'))}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testTokenDetail();
