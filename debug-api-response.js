const { chromium } = require('playwright');

async function debugAPIResponse() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept and log all network requests
  await page.on('response', response => {
    if (response.url().includes('/api/members')) {
      response.json().then(body => {
        console.log('\n[API RESPONSE] ' + response.url());
        console.log('Status: ' + response.status());
        console.log('Body:', JSON.stringify(body, null, 2));
      }).catch(() => {
        console.log('\n[API RESPONSE] ' + response.url() + ' (non-JSON)');
      });
    }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Debug: API Response for Member Addition                   ║');
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

    // Create unique identifier
    const uniqueId = 'Debug' + Date.now();
    const firstName = 'DebugTest';
    const lastName = uniqueId;
    const phone = '555' + String(Date.now()).slice(-7);

    console.log('[ADD] Adding member: ' + firstName + ' ' + lastName + ' (' + phone + ')\n');

    // Open modal
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    // Fill form
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);

    // Wait for API response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/members') && response.request().method() === 'POST'
    );

    // Submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      if (btn) btn.click();
    });

    const response = await responsePromise;
    const data = await response.json();

    console.log('\n[API CREATE MEMBER]');
    console.log('Status: ' + response.status());
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status() === 201) {
      console.log('\n✅ Member created successfully!');
      console.log('Member ID: ' + (data.id || data.data?.id || 'N/A'));
    } else {
      console.log('\n❌ API error! Status: ' + response.status());
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugAPIResponse();
