const { chromium } = require('playwright');

const TEST_EMAIL = `hook-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'Hook123!';

async function testHook() {
  console.log('\n🔍 Testing axios hook\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Register
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Hook');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', 'Hook Church');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    console.log(`✅ Registered: ${TEST_EMAIL}\n`);
    await page.waitForTimeout(1500);

    // Login
    const context = page.context();
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Fill form
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    console.log('Submitting form...\n');

    // Capture all console output
    const logs = [];
    page.on('console', (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error' || msg.text().includes('login') || msg.text().includes('error')) {
        console.log(`📍 ${msg.text()}`);
      }
    });

    // Click
    await page.click('button[type="submit"]');

    // Wait
    await page.waitForTimeout(8000);

    console.log(`\n📊 Total logs: ${logs.length}`);
    const relevantLogs = logs.filter((log) =>
      log.includes('login') ||
      log.includes('error') ||
      log.includes('401') ||
      log.includes('Invalid')
    );
    console.log(`Relevant logs: ${relevantLogs.length}`);
    relevantLogs.forEach((log) => console.log(`  ${log}`));

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);
    console.log(`On dashboard: ${finalUrl.includes('dashboard')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testHook().catch(console.error);
