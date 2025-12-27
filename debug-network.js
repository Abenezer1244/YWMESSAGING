const { chromium } = require('playwright');

async function debugNetwork() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Log ALL network requests and responses
  page.on('request', request => {
    if (request.url().includes('/api/members')) {
      console.log('\n[REQUEST] ' + request.method() + ' ' + request.url());
      const postData = request.postDataJSON().catch(() => ({}));
      postData.then(data => {
        console.log('Body:', JSON.stringify(data, null, 2));
      });
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/members')) {
      console.log('\n[RESPONSE] ' + response.status() + ' ' + response.url());
    }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Debug: Network Request/Response Tracing                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[LOGIN] Authenticating...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in\n');

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
    console.log('[NAVIGATE] Going to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    console.log('[OPEN] Opening Add Member form...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    console.log('[FILL] Filling form...');
    await page.fill('input[name="firstName"]', 'NetworkDebug');
    await page.fill('input[name="lastName"]', 'Test' + Date.now());
    await page.fill('input[name="phone"]', '555' + String(Date.now()).slice(-7));

    await page.waitForTimeout(500);

    console.log('[SUBMIT] Clicking submit button...\n');

    // Click and wait for network idle to catch all requests
    const submitButton = await page.$('button[type="submit"]:has-text("Add Member")');
    if (submitButton) {
      await submitButton.click();
      console.log('Waiting for network to settle...');
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    }

    await page.waitForTimeout(2000);
    console.log('\n[DONE] Network debug complete');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugNetwork();
