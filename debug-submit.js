const { chromium } = require('playwright');

async function debugSubmit() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Log console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[BROWSER ERROR] ' + msg.text());
    }
  });

  // Log network errors
  page.on('response', response => {
    if (!response.ok()) {
      response.text().then(text => {
        console.log('\n[API ERROR] ' + response.status() + ' ' + response.url());
        console.log('Response: ' + text.substring(0, 500));
      });
    }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Debug: Form Submission and Network Activity                ║');
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
    await page.fill('input[name="firstName"]', 'SubmitTest');
    await page.fill('input[name="lastName"]', 'Member' + Date.now());
    await page.fill('input[name="phone"]', '555' + String(Date.now()).slice(-7));

    await page.waitForTimeout(500);

    console.log('[SUBMIT] Submitting form...');

    // Set up a listener to catch the response
    let responseReceived = false;
    let responseStatus = null;
    let responseData = null;

    page.on('response', response => {
      if (response.url().includes('/api/members') && response.request().method() === 'POST') {
        responseReceived = true;
        responseStatus = response.status();
        response.json().then(body => {
          responseData = body;
          console.log('[API RESPONSE RECEIVED] Status: ' + response.status());
          console.log('Data:', JSON.stringify(body, null, 2));
        }).catch(() => {
          console.log('[API RESPONSE] Status: ' + response.status() + ' (non-JSON body)');
        });
      }
    });

    // Click submit
    await page.click('button[type="submit"]:has-text("Add Member")');

    // Wait for response
    await page.waitForTimeout(3000);

    console.log('\n[CHECK] Response status:');
    console.log('  Response received: ' + (responseReceived ? '✅ YES' : '❌ NO'));
    console.log('  Status code: ' + (responseStatus || 'N/A'));

    if (!responseReceived) {
      console.log('\n⚠️ WARNING: No API response after 3 seconds!');
      console.log('[CHECK] Checking page state after submit...');

      const state = await page.evaluate(() => {
        return {
          formVisible: !!document.querySelector('input[name="firstName"]'),
          submitButtonText: Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent.includes('Add Member')
          )?.textContent || 'N/A'
        };
      });

      console.log('  Form still visible: ' + (state.formVisible ? '🟡 YES' : '✅ NO (disappeared)'));
      console.log('  Submit button text: ' + state.submitButtonText);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugSubmit();
