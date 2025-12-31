import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  let accessToken = null;

  // Intercept requests to capture the token
  page.on('request', request => {
    const authHeader = request.headers()['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
    }
    const cookies = request.headers()['cookie'];
    if (cookies && cookies.includes('accessToken=')) {
      const match = cookies.match(/accessToken=([^;]+)/);
      if (match) {
        accessToken = match[1];
      }
    }
  });

  try {
    console.log('=== LOGGING IN ===');
    await page.goto('https://koinoniasms.com/login');
    await page.fill('input[type="email"]', 'mike@gmail.com');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 60000 });
    console.log('✅ Logged in\n');

    await page.waitForTimeout(2000);

    if (accessToken) {
      console.log('=== JWT TOKEN CAPTURED ===');
      console.log('Token (first 50 chars):', accessToken.substring(0, 50) + '...');

      // Decode JWT payload (middle part)
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('\n=== JWT PAYLOAD ===');
        console.log(JSON.stringify(payload, null, 2));
        console.log('\n🔍 Church ID (tenantId):', payload.churchId);
        console.log('🔍 Admin ID:', payload.adminId);
        console.log('🔍 Email:', payload.email);
      }
    } else {
      console.log('❌ Could not capture access token');
    }

    console.log('\n=== MAKING A TEST REQUEST ===');
    await page.click('text=Members');
    await page.waitForTimeout(3000);

    console.log('\nCheck the server logs to see which tenant database is being used');
    console.log('The churchId in the JWT should match the tenant database being queried');

    await page.waitForTimeout(3000);
    await browser.close();
  } catch (error) {
    console.error('ERROR:', error.message);
    await browser.close();
  }
})();
