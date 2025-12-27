const { chromium } = require('playwright');

async function debugDOMChanges() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Track all fetch/XHR requests made from the page
  const requests = [];

  page.on('request', request => {
    requests.push({
      method: request.method(),
      url: request.url(),
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Log all console messages (including errors)
  const logs = [];
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toLocaleTimeString()
    });
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Debug: DOM Changes and Console Logs After Submit            ║');
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
    await page.fill('input[name="firstName"]', 'DOMDebug');
    await page.fill('input[name="lastName"]', 'Test' + Date.now());
    await page.fill('input[name="phone"]', '555' + String(Date.now()).slice(-7));

    // Reset request tracking
    requests.length = 0;
    logs.length = 0;

    console.log('[SUBMIT] Clicking submit...');
    const before = new Date().getTime();
    await page.click('button[type="submit"]:has-text("Add Member")');
    await page.waitForTimeout(3000);
    const after = new Date().getTime();

    console.log('\n[REQUESTS MADE] (' + (after - before) + 'ms)');
    if (requests.length === 0) {
      console.log('  ❌ NO REQUESTS MADE');
    } else {
      requests.forEach((req, i) => {
        console.log('  ' + (i + 1) + '. ' + req.method + ' ' + req.url);
      });
    }

    console.log('\n[CONSOLE MESSAGES]');
    if (logs.length === 0) {
      console.log('  No messages');
    } else {
      logs.forEach(log => {
        const prefix = log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : 'ℹ️';
        console.log('  ' + prefix + ' [' + log.type.toUpperCase() + '] ' + log.text);
      });
    }

    console.log('\n[DOM STATE]');
    const state = await page.evaluate(() => {
      const form = document.querySelector('input[name="firstName"]');
      const modal = document.querySelector('[role="dialog"]');
      const button = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Add Member')
      );

      return {
        formExists: !!form,
        modalExists: !!modal,
        addMemberButtonText: button?.textContent || 'N/A',
        pageTitle: document.title,
        hasTables: !!document.querySelector('table'),
        tableRows: document.querySelectorAll('table tbody tr').length
      };
    });

    console.log('  Form exists: ' + (state.formExists ? '🟡 YES' : '✅ NO'));
    console.log('  Modal exists: ' + (state.modalExists ? '🟡 YES' : '✅ NO'));
    console.log('  Add Member button: ' + state.addMemberButtonText);
    console.log('  Has tables: ' + (state.hasTables ? '✅ YES' : '❌ NO'));
    console.log('  Table rows: ' + state.tableRows);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugDOMChanges();
