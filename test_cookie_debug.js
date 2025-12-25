const { chromium } = require('playwright');

const TEST_EMAIL = `test-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'TestPassword123!';

async function testCookies() {
  console.log('🚀 Starting cookie debug test...\n');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to register and register
    console.log('📝 Registering account...');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="churchName"]', 'Test Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    console.log('📝 Submitting registration...');
    const [response] = await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => null),
      page.click('button[type="submit"]')
    ]);

    await page.waitForTimeout(2000);
    console.log(`Registered, redirected to: ${page.url()}\n`);

    // Check cookies immediately after registration
    const cookies = await context.cookies();
    console.log(`📋 Total cookies: ${cookies.length}`);

    cookies.forEach(cookie => {
      console.log(`\n🍪 ${cookie.name}`);
      console.log(`   Value: ${cookie.value.substring(0, 50)}...`);
      console.log(`   Domain: ${cookie.domain}`);
      console.log(`   Path: ${cookie.path}`);
      console.log(`   Secure: ${cookie.secure}`);
      console.log(`   HttpOnly: ${cookie.httpOnly}`);
      console.log(`   SameSite: ${cookie.sameSite}`);
      console.log(`   Expires: ${new Date(cookie.expires * 1000).toISOString()}`);
    });

    // Now make an API request and check headers
    console.log('\n\n📡 Testing API request with cookies...');

    page.on('request', req => {
      if (req.url().includes('api.koinoniasms.com/api/auth/me')) {
        const cookieHeader = req.headers()['cookie'];
        console.log(`\nRequest to: ${req.url()}`);
        console.log(`Cookie header present: ${!!cookieHeader}`);
        if (cookieHeader) {
          console.log(`Cookie header value: ${cookieHeader.substring(0, 100)}`);
        } else {
          console.log('❌ NO COOKIE HEADER SENT!');
        }
      }
    });

    page.on('response', res => {
      if (res.url().includes('api.koinoniasms.com/api/auth/me')) {
        console.log(`Response status: ${res.status()}`);
      }
    });

    console.log('Making /auth/me request...');
    const meResponse = await page.evaluate(() => {
      return fetch('https://api.koinoniasms.com/api/auth/me', {
        credentials: 'include'
      }).then(r => r.json()).catch(e => ({ error: e.message }));
    });

    console.log(`\n/auth/me response:`, JSON.stringify(meResponse, null, 2));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }

  await browser.close();
}

testCookies();
