const { chromium } = require('playwright');

async function comprehensiveFrontendDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Track all API requests and responses
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('/api/groups') && request.url().includes('/members')) {
      apiCalls.push({
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        status: 'pending'
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/groups') && response.url().includes('/members')) {
      const apiIndex = apiCalls.findIndex(c => c.url === response.url() && c.status === 'pending');
      if (apiIndex >= 0) {
        const data = await response.json();
        apiCalls[apiIndex].status = response.status();
        apiCalls[apiIndex].dataLength = data.data?.length || 0;
        apiCalls[apiIndex].success = data.success;
      }
    }
  });

  // We'll track API calls through Playwright's network events instead

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     COMPREHENSIVE FRONTEND DEBUG: Add Member Flow              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[SETUP] Navigating to production...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('[SETUP] Logging in...');
      await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
      await page.fill('input[type="password"]', '12!Michael');
      await page.click('button:has-text("Login")');
      await page.waitForNavigation({ waitUntil: 'load' });
    } else {
      console.log('[SETUP] Already logged in, navigating to dashboard...');
      await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
    }

    await page.waitForTimeout(2000);
    console.log('✅ Logged in\n');

    // Close modals
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      btns.forEach(btn => {
        if (btn.textContent.includes('Next') || btn.textContent.includes('Skip')) {
          btn.click();
        }
      });
    });

    for (let i = 0; i < 5; i++) {
      try { await page.press('body', 'Escape'); } catch (e) {}
      await page.waitForTimeout(100);
    }

    console.log('[NAVIGATION] Going to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log('✅ On Members page\n');

    // Get initial state
    console.log('[CHECK 1] Initial DOM state:');
    let state1 = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const modal = document.querySelector('[role="dialog"]');
      return {
        tableRows: rows.length,
        modalExists: !!modal,
        modalVisible: modal ? !modal.hidden : false
      };
    });
    console.log('  Table rows: ' + state1.tableRows);
    console.log('  Modal visible: ' + (state1.modalVisible ? '❌ YES (should be hidden)' : '✅ NO'));
    console.log('');

    // Open modal
    console.log('[ACTION] Clicking "Add Member" button...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) {
        btn.click();
      }
    });

    await page.waitForTimeout(1000);

    console.log('[CHECK 2] After opening modal:');
    let state2 = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      return {
        modalExists: !!modal,
        modalVisible: modal ? !modal.hidden : false,
        formInputs: {
          firstName: document.querySelector('input[name="firstName"]')?.value,
          lastName: document.querySelector('input[name="lastName"]')?.value,
          phone: document.querySelector('input[name="phone"]')?.value
        }
      };
    });
    console.log('  Modal visible: ' + (state2.modalVisible ? '✅ YES' : '❌ NO'));
    console.log('');

    // Fill form
    const timestamp = Date.now();
    const lastName = 'DebugTest' + timestamp;

    console.log('[ACTION] Filling form with: TestDebug ' + lastName);
    await page.fill('input[name="firstName"]', 'TestDebug');
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', '+15554444444');
    console.log('✅ Form filled\n');

    // Clear API call log to track only calls during submit
    apiCalls.length = 0;

    // Submit
    console.log('[ACTION] Clicking Submit button...');
    const submitTime = Date.now();

    await page.click('button[type="submit"]:has-text("Add Member")');

    console.log('[MONITOR] Waiting for API response (max 5 seconds)...');
    for (let i = 0; i < 10; i++) {
      if (apiCalls.length > 0 && apiCalls[0].status) {
        break;
      }
      await page.waitForTimeout(500);
    }

    console.log('[CHECK 3] API call during submit:');
    if (apiCalls.length > 0) {
      const call = apiCalls[0];
      console.log('  Method: ' + call.method);
      console.log('  Status: ' + (call.status || 'pending'));
      console.log('  Success: ' + (call.success ? '✅ YES' : '❌ NO'));
    } else {
      console.log('  ❌ No API call detected!');
    }
    console.log('');

    // Wait for modal to close
    console.log('[MONITOR] Waiting for modal to close (max 5 seconds)...');
    let modalClosed = false;
    for (let i = 0; i < 10; i++) {
      const stillOpen = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        return modal && !modal.hidden;
      });

      if (!stillOpen) {
        modalClosed = true;
        console.log('✅ Modal closed after ' + ((i + 1) * 500) + 'ms\n');
        break;
      }
      await page.waitForTimeout(500);
    }

    if (!modalClosed) {
      console.log('❌ Modal still open after 5 seconds!\n');
    }

    // Check if refetch happened
    console.log('[CHECK 4] API calls made during and after submit:');
    apiCalls.forEach((call, idx) => {
      console.log('  Call ' + (idx + 1) + ': ' + call.method + ' ' + (call.status || 'pending') + ' - ' + call.dataLength + ' members');
    });
    console.log('');

    // Wait for refetch delay
    console.log('[WAIT] Waiting 2 seconds for refetch to complete...');
    await page.waitForTimeout(2000);

    // Check final state
    console.log('[CHECK 5] Final table state:');
    let finalState = await page.evaluate((lastName) => {
      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => r.querySelector('td')?.textContent?.trim() || '');
      const hasNew = names.some(n => n.includes(lastName));

      return {
        tableRows: rows.length,
        hasNewMember: hasNew,
        firstNames: names.slice(0, 3)
      };
    }, lastName);

    console.log('  Table rows: ' + finalState.tableRows);
    console.log('  New member in table: ' + (finalState.hasNewMember ? '✅ YES' : '❌ NO'));
    console.log('  First 3 members: ' + finalState.firstNames.join(' | '));
    console.log('');

    console.log('');

    // Final verdict
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('DIAGNOSIS:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Modal opens: ' + (state2.modalVisible ? '✅' : '❌'));
    console.log('Modal closes: ' + (modalClosed ? '✅' : '❌'));
    console.log('API call made: ' + (apiCalls.length > 0 ? '✅' : '❌'));
    console.log('API success: ' + (apiCalls.length > 0 && apiCalls[0].success ? '✅' : '❌'));
    console.log('Refetch happens: ' + (apiCalls.length > 1 ? '✅' : '❌'));
    console.log('New member in table: ' + (finalState.hasNewMember ? '✅' : '❌'));
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

comprehensiveFrontendDebug();
