const { chromium } = require('playwright');
const http = require('http');

async function captureServerLogs() {
  // This test will add a member and then check the server logs
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Monitor all console logs from the page
  const browserLogs = [];
  page.on('console', msg => {
    browserLogs.push(msg.text());
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Debug: Full Flow with API Response Details                 ║');
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
    console.log('[NAVIGATE] Going to Members...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get group ID from URL
    const groupId = await page.evaluate(() => {
      const url = window.location.href;
      const match = url.match(/groups\/([^/?]+)/);
      return match ? match[1] : 'unknown';
    });

    console.log('[GROUP] ID: ' + groupId + '\n');

    // Open form
    console.log('[OPEN] Opening Add Member form...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    // Prepare member data
    const uniqueId = 'FullFlow' + Date.now();
    const firstName = 'TestFirst';
    const lastName = uniqueId;
    const phone = '555' + String(Date.now()).slice(-7);

    console.log('[FILL] Filling with: ' + firstName + ' ' + lastName + ' (' + phone + ')');
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);

    // Monitor the API response
    let apiResponse = null;
    let apiError = null;

    page.on('response', async response => {
      if (response.url().includes('/api/groups') && response.url().includes('/members') &&
          response.request().method() === 'POST') {
        try {
          apiResponse = await response.json();
          console.log('\n[API RESPONSE]');
          console.log('Status: ' + response.status());
          console.log('URL: ' + response.url());
          console.log('Body: ' + JSON.stringify(apiResponse, null, 2).substring(0, 500));
        } catch (err) {
          apiError = err.message;
        }
      }
    });

    console.log('[SUBMIT] Submitting form...\n');
    const startTime = Date.now();

    await page.click('button[type="submit"]:has-text("Add Member")');
    await page.waitForTimeout(3000);

    const endTime = Date.now();

    console.log('\n[TIMING] Request took: ' + (endTime - startTime) + 'ms');

    if (apiResponse) {
      console.log('[MEMBER ID] ' + (apiResponse.data?.id || apiResponse.id || 'N/A'));
    } else {
      console.log('[ERROR] No API response captured!');
    }

    // Wait and check if member appears
    console.log('\n[WAIT] Waiting for member to appear...');
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(2000);
      const state = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        return {
          count: rows.length,
          names: Array.from(rows).map(r => r.querySelector('td')?.textContent?.trim())
        };
      });

      console.log('  +' + ((i + 1) * 2) + 's: ' + state.count + ' members');

      if (state.names.includes(lastName)) {
        console.log('     ✅ FOUND: ' + lastName);
        break;
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureServerLogs();
