const { chromium } = require('playwright');

async function checkErrors() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Capture network errors
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        status: response.status(),
        url: response.url(),
        method: response.request().method()
      });
    }
  });

  try {
    console.log('Checking for errors during member addition...\n');

    // Login
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });

    await page.waitForTimeout(2000);

    // Close modals
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);

    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    // Go to Members
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Clear console logs before test
    consoleLogs.length = 0;
    networkErrors.length = 0;

    // Add member
    const timestamp = Date.now();
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    await page.fill('input[name="firstName"]', 'TestF');
    await page.fill('input[name="lastName"]', `Test${timestamp}`);
    await page.fill('input[name="phone"]', `555${String(timestamp).slice(-7)}`);

    // Submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      if (btn) btn.click();
    });

    // Wait for any errors
    await page.waitForTimeout(3000);

    // Report
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ERROR DIAGNOSTICS                           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`CONSOLE MESSAGES (${consoleLogs.length}):`);
    const errors = consoleLogs.filter(m => m.type === 'error');
    const warnings = consoleLogs.filter(m => m.type === 'warning');

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.slice(0, 5).forEach(msg => {
        console.log(`  [${msg.type}] ${msg.text.substring(0, 100)}`);
      });
    } else {
      console.log('✅ No console errors');
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.slice(0, 5).forEach(msg => {
        console.log(`  [${msg.type}] ${msg.text.substring(0, 100)}`);
      });
    }

    console.log(`\nNETWORK ERRORS (${networkErrors.length}):`);
    if (networkErrors.length > 0) {
      networkErrors.forEach(err => {
        console.log(`  ❌ ${err.method} ${err.url.split('?')[0]} -> ${err.status}`);
      });
    } else {
      console.log('✅ No network errors');
    }

    // Check page state
    const pageState = await page.evaluate(() => {
      return {
        hasForm: !!document.querySelector('form'),
        hasModal: !!document.querySelector('[role="dialog"]'),
        hasAddBtn: !!Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.trim() === 'Add Member'
        )
      };
    });

    console.log(`\nPAGE STATE:`);
    console.log(`  Form present: ${pageState.hasForm}`);
    console.log(`  Modal visible: ${pageState.hasModal}`);
    console.log(`  Add button found: ${pageState.hasAddBtn}`);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkErrors();
