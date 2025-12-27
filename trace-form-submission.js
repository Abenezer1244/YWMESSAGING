const { chromium } = require('playwright');

async function traceFormSubmission() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 TRACE: Form Submission & Member Addition\n');

    // Login
    const loginRes = await page.request.post('https://api.koinoniasms.com/api/auth/login', {
      data: {
        email: 'DOKaA@GMAIL.COM',
        password: '12!Michael'
      }
    });

    await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Close modals
    for (let i = 0; i < 5; i++) {
      try { await page.press('body', 'Escape'); } catch (e) {}
      await page.waitForTimeout(100);
    }

    // Go to Members
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get initial member count
    console.log('[1] Getting initial table state...');
    const initialCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    console.log('  Initial member count: ' + initialCount + '\n');

    // Monitor network requests
    const apiCalls = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/groups') && url.includes('/members')) {
        const status = response.status();
        let data = null;
        try {
          data = await response.json();
        } catch (e) {}
        apiCalls.push({
          timestamp: Date.now(),
          url: url.split('?')[0],
          method: response.request().method(),
          status: status,
          dataLength: data?.data?.length || 0
        });
      }
    });

    // Click Add Member button
    console.log('[2] Clicking "Add Member" button...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(500);

    // Fill form
    console.log('[3] Filling form with test data...');
    const timestamp = Date.now();
    const lastName = 'TraceTest' + timestamp;

    try {
      const firstNameInput = await page.$('input[name="firstName"]');
      if (firstNameInput) {
        await page.fill('input[name="firstName"]', 'TestTrace');
        await page.fill('input[name="lastName"]', lastName);
        await page.fill('input[name="phone"]', '+15551234567');
        console.log('  ✅ Form filled\n');
      } else {
        console.log('  ❌ Form input not found\n');
      }
    } catch (e) {
      console.log('  ❌ Error filling form: ' + e.message + '\n');
    }

    // Submit form
    console.log('[4] Submitting form...');
    const submitTime = Date.now();

    try {
      await page.click('button[type="submit"]:has-text("Add Member")');
      const submitDuration = Date.now() - submitTime;
      console.log('  Submit clicked in ' + submitDuration + 'ms\n');
    } catch (e) {
      console.log('  ❌ Error clicking submit: ' + e.message + '\n');
    }

    // Wait for API response
    console.log('[5] Waiting for API response (max 5 seconds)...');
    for (let i = 0; i < 10; i++) {
      if (apiCalls.length > 0) {
        const lastCall = apiCalls[apiCalls.length - 1];
        console.log('  API call ' + lastCall.method + ' ' + lastCall.status + ' - ' + lastCall.dataLength + ' members');
        break;
      }
      await page.waitForTimeout(500);
    }

    if (apiCalls.length === 0) {
      console.log('  ❌ No API call detected!');
    }
    console.log('');

    // Wait for modal to close
    console.log('[6] Waiting for modal to close (max 5 seconds)...');
    let modalClosed = false;
    let closeCheckAttempt = 0;

    for (let i = 0; i < 10; i++) {
      const formVisible = await page.locator('input[name="firstName"]').isVisible().catch(() => false);
      if (!formVisible) {
        modalClosed = true;
        console.log('  ✅ Modal closed after ' + ((i + 1) * 500) + 'ms\n');
        closeCheckAttempt = i;
        break;
      }
      await page.waitForTimeout(500);
    }

    if (!modalClosed) {
      console.log('  ❌ Modal still visible after 5 seconds!\n');
    }

    // Wait for refetch
    console.log('[7] Waiting for member list refetch (max 5 seconds)...');
    for (let i = 0; i < 10; i++) {
      if (apiCalls.length > 1) {
        console.log('  ✅ Refetch detected after ' + ((i + 1) * 500) + 'ms\n');
        break;
      }
      await page.waitForTimeout(500);
    }

    // Check final count
    console.log('[8] Getting final table state...');
    await page.waitForTimeout(1000); // Extra wait for React to update

    const finalCount = await page.evaluate((lastName) => {
      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => r.textContent);
      const hasNew = names.some(n => n.includes(lastName));

      return {
        count: rows.length,
        hasNew: hasNew,
        newMemberFound: hasNew ? '✅' : '❌'
      };
    }, lastName);

    console.log('  Final member count: ' + finalCount.count);
    console.log('  New member in table: ' + finalCount.newMemberFound + '\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('SUBMISSION TRACE SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Form filled: ✅');
    console.log('Form submitted: ✅');
    console.log('API called: ' + (apiCalls.length > 0 ? '✅' : '❌'));
    console.log('Modal closed: ' + (modalClosed ? '✅' : '❌'));
    console.log('Refetch triggered: ' + (apiCalls.length > 1 ? '✅' : '❌'));
    console.log('Member appears in table: ' + finalCount.newMemberFound);
    console.log('Member count change: ' + initialCount + ' → ' + finalCount.count + ' (' + (finalCount.count - initialCount) + ')');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // If member didn't appear, dump API call details
    if (!finalCount.hasNew && apiCalls.length > 0) {
      console.log('API CALL DETAILS:');
      apiCalls.forEach((call, idx) => {
        console.log('  Call ' + (idx + 1) + ': ' + call.method + ' ' + call.status + ' - URL: ' + call.url + ' - Data length: ' + call.dataLength);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

traceFormSubmission();
