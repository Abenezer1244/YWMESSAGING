const { chromium } = require('playwright');

const TEST_EMAIL = `check-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'CheckFields123!';

async function checkFields() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 CHECK FIELD STRUCTURE');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Check');
    await page.fill('input[name="lastName"]', 'Fields');
    await page.fill('input[name="churchName"]', 'Check Fields Church');
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

    // USE LOCATOR TO CHECK IF FIELDS EXIST
    console.log('Checking if input fields exist...\n');

    const emailVisible = await page.locator('input[name="email"]').isVisible();
    const passwordVisible = await page.locator('input[name="password"]').isVisible();
    const emailCount = await page.locator('input[name="email"]').count();
    const passwordCount = await page.locator('input[name="password"]').count();
    const allInputs = await page.locator('input').count();

    console.log(`Email input visible: ${emailVisible}`);
    console.log(`Email input count: ${emailCount}`);
    console.log(`Password input visible: ${passwordVisible}`);
    console.log(`Password input count: ${passwordCount}`);
    console.log(`Total inputs on page: ${allInputs}\n`);

    // FILL FORM
    console.log('Filling form...\n');
    await page.fill('input[name="email"]', TEST_EMAIL);
    const emailValue = await page.locator('input[name="email"]').inputValue();
    console.log(`Email value after fill: ${emailValue}`);

    await page.fill('input[name="password"]', TEST_PASSWORD);
    const passwordValue = await page.locator('input[name="password"]').inputValue();
    console.log(`Password value after fill: ${passwordValue}\n`);

    // FIND AND CLICK BUTTON
    console.log('Checking submit button...\n');

    const buttonVisible = await page.locator('button[type="submit"]').isVisible();
    const buttonDisabled = await page.locator('button[type="submit"]').isDisabled();
    const buttonCount = await page.locator('button[type="submit"]').count();

    console.log(`Button visible: ${buttonVisible}`);
    console.log(`Button disabled: ${buttonDisabled}`);
    console.log(`Button count: ${buttonCount}\n`);

    // MONITOR NETWORK
    console.log('Monitoring network and console...\n');

    const networkRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('/auth/login')) {
        networkRequests.push(`REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', (response) => {
      if (response.url().includes('/auth/login')) {
        networkRequests.push(`RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    const consoleLogs = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[LoginPage]') || text.includes('[auth.login]')) {
        consoleLogs.push(`[${msg.type()}] ${text}`);
      }
    });

    // CLICK BUTTON
    console.log('Clicking submit button...\n');
    await page.locator('button[type="submit"]').click();

    // WAIT FOR SOMETHING TO HAPPEN
    await page.waitForTimeout(5000);

    // RESULTS
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Network requests for /auth/login: ${networkRequests.length}`);
    networkRequests.forEach((req) => console.log(`  ${req}`));

    console.log(`\nConsole logs captured: ${consoleLogs.length}`);
    consoleLogs.forEach((log) => console.log(`  ${log}`));

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);
    console.log(`On dashboard: ${finalUrl.includes('dashboard')}`);

    if (networkRequests.length === 0) {
      console.log('\n❌ NO /auth/login REQUEST MADE');
      console.log('   This is the root cause - the login API is never called');
    }

    if (consoleLogs.length === 0) {
      console.log('\n❌ NO [LoginPage] OR [auth.login] LOGS');
      console.log('   This means the onSubmit callback was never called');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

checkFields().catch(console.error);
