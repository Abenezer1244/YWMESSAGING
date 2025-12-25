const { chromium } = require('playwright');

const TEST_EMAIL = `field-reg-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'FieldReg123!';

async function testFieldRegistration() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 FIELD REGISTRATION TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // REGISTER
    console.log('Register account...\n');
    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('input[name="firstName"]', 'Field');
    await page.fill('input[name="lastName"]', 'Reg');
    await page.fill('input[name="churchName"]', 'Field Reg Church');
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

    // INSPECT FIELDS
    console.log('Inspecting input fields...\n');

    const fieldInfo = await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      const form = document.querySelector('form');

      console.log('[DEBUG] Checking email input:');
      if (!emailInput) {
        console.log('[DEBUG]   ❌ NOT FOUND');
        return { error: 'Email input not found' };
      }

      console.log('[DEBUG]   ✅ Found');
      console.log('[DEBUG]   name:', emailInput.getAttribute('name'));
      console.log('[DEBUG]   value:', emailInput.value);
      console.log('[DEBUG]   type:', emailInput.getAttribute('type'));
      console.log('[DEBUG]   All attributes:');
      Array.from(emailInput.attributes).forEach((attr) => {
        console.log(`[DEBUG]     ${attr.name} = "${attr.value}"`);
      });

      console.log('[DEBUG] Checking password input:');
      if (!passwordInput) {
        console.log('[DEBUG]   ❌ NOT FOUND');
        return { error: 'Password input not found' };
      }

      console.log('[DEBUG]   ✅ Found');
      console.log('[DEBUG]   name:', passwordInput.getAttribute('name'));
      console.log('[DEBUG]   value:', passwordInput.value);
      console.log('[DEBUG]   type:', passwordInput.getAttribute('type'));
      console.log('[DEBUG]   All attributes:');
      Array.from(passwordInput.attributes).forEach((attr) => {
        console.log(`[DEBUG]     ${attr.name} = "${attr.value}"`);
      });

      console.log('[DEBUG] Checking form element:');
      console.log('[DEBUG]   form found:', !!form);
      if (form) {
        console.log('[DEBUG]   form method:', form.getAttribute('method') || 'not set (defaults to POST)');
        console.log('[DEBUG]   form action:', form.getAttribute('action') || 'not set (submits to same URL)');
        console.log('[DEBUG]   form noValidate:', form.getAttribute('novalidate'));
        console.log('[DEBUG]   form children (inputs):');
        const inputs = form.querySelectorAll('input');
        console.log('[DEBUG]     Total inputs in form:', inputs.length);
        inputs.forEach((input, i) => {
          console.log(`[DEBUG]     ${i}: name="${input.name}", type="${input.type}"`);
        });
      }

      return { success: true };
    });

    if (fieldInfo.error) {
      console.log(`\n❌ ${fieldInfo.error}`);
      await browser.close();
      return;
    }

    // FILL FORM AND INSPECT AGAIN
    console.log('\n\nFilling form...\n');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    console.log('Checking values after filling...\n');

    const filledInfo = await page.evaluate((_email) => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      console.log('[DEBUG] Email input value:', emailInput?.value);
      console.log('[DEBUG] Password input value:', passwordInput?.value);
      console.log('[DEBUG] Email matches expected:', emailInput?.value === _email);

      // Check if React Hook Form has attached anything to the inputs
      const emailKeys = emailInput ? Object.keys(emailInput) : [];
      const rhfKeyEmail = emailKeys.find((key) => key.startsWith('__react'));
      const rhfKeyPassword = passwordInput ? Object.keys(passwordInput).find((key) => key.startsWith('__react')) : null;

      console.log('[DEBUG] Email has React key:', !!rhfKeyEmail, rhfKeyEmail);
      console.log('[DEBUG] Password has React key:', !!rhfKeyPassword, rhfKeyPassword);

      return { success: true };
    }, TEST_EMAIL);

    // NOW TRY TO SUBMIT
    console.log('\n\nTrying to submit...\n');

    page.on('console', (msg) => {
      if (msg.text().includes('[LoginPage]') || msg.text().includes('[auth.login]') || msg.text().includes('[DEBUG]')) {
        console.log(`ℹ️ ${msg.text()}`);
      }
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // CHECK IF ANYTHING HAPPENED
    const currentUrl = page.url();
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Final URL: ${currentUrl}`);
    console.log(`Still on login: ${currentUrl.includes('/login')}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFieldRegistration().catch(console.error);
