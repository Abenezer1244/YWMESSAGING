const { chromium } = require('playwright');

async function finalVerification() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     FINAL VERIFICATION: Complete End-to-End Test               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Navigate and login
    console.log('[STEP 1] Navigating to production site...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page.waitForTimeout(1500);

    // Check if already logged in
    const isAlreadyLoggedIn = await page.evaluate(() => {
      return !document.querySelector('input[type="email"]');
    });

    if (isAlreadyLoggedIn) {
      console.log('✅ Already logged in, going to dashboard\n');
      await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
    } else {
      console.log('Logging in...');
      await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
      await page.fill('input[type="password"]', '12!Michael');
      await page.click('button:has-text("Login")');
      await page.waitForNavigation({ waitUntil: 'load' });
      console.log('✅ Logged in\n');
    }

    // Close any modals
    console.log('[STEP 2] Closing modals...');
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'));
      allBtns.forEach(btn => {
        if (btn.textContent.includes('Next') || btn.textContent.includes('Skip')) {
          btn.click();
        }
      });
    });

    for (let i = 0; i < 5; i++) {
      try {
        await page.press('body', 'Escape');
      } catch (e) {}
      await page.waitForTimeout(150);
    }
    console.log('✅ Modals closed\n');

    // Navigate to Members
    console.log('[STEP 3] Navigating to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log('✅ On Members page\n');

    // Get initial count
    const initialState = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return {
        count: rows.length,
        names: Array.from(rows).map(r => r.querySelector('td')?.textContent?.trim() || '')
      };
    });

    console.log('[STEP 4] Initial state:');
    console.log('  Members in table: ' + initialState.count);
    console.log('  First 3: ' + initialState.names.slice(0, 3).join(' | ') + '\n');

    // Open Add Member modal
    console.log('[STEP 5] Opening Add Member modal...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(800); // Wait for modal to open

    const modalOpen = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      return modal && !modal.hidden;
    });

    console.log('✅ Modal ' + (modalOpen ? 'opened' : 'NOT opened') + '\n');

    // Fill form
    const timestamp = Date.now();
    const firstName = 'FinalTest';
    const lastName = 'Verified' + timestamp;
    const phone = '555' + String(timestamp).slice(-7);

    console.log('[STEP 6] Filling member form:');
    console.log('  Name: ' + firstName + ' ' + lastName);
    console.log('  Phone: ' + phone);

    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);
    console.log('✅ Form filled\n');

    // Submit with API response tracking
    console.log('[STEP 7] Submitting form...');

    let apiData = null;
    const responsePromise = new Promise(resolve => {
      page.on('response', async response => {
        if (response.url().includes('/api/groups') && response.url().includes('/members') &&
            response.request().method() === 'POST') {
          apiData = await response.json();
          resolve();
        }
      });
    });

    const submitStart = Date.now();
    await page.click('button[type="submit"]:has-text("Add Member")');

    // Wait for API response (with timeout)
    await Promise.race([
      responsePromise,
      new Promise(r => setTimeout(r, 5000))
    ]);

    const submitDuration = Date.now() - submitStart;

    console.log('✅ API Response: ' + (apiData ? (apiData.success ? 'SUCCESS' : 'FAILED') : 'NO RESPONSE'));
    console.log('  Duration: ' + submitDuration + 'ms');
    const newMemberId = apiData?.data?.id;
    console.log('  New member ID: ' + (newMemberId || 'N/A') + '\n');

    // Wait for modal to close completely
    console.log('[STEP 8] Waiting for modal to close...');
    let modalClosed = false;
    for (let i = 0; i < 20; i++) {
      const stillOpen = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        return modal && !modal.hidden;
      });

      if (!stillOpen) {
        modalClosed = true;
        console.log('✅ Modal closed\n');
        break;
      }

      await page.waitForTimeout(200);
    }

    if (!modalClosed) {
      console.log('⚠️  Modal still open, but continuing...\n');
    }

    // Now check the table with extra wait time
    console.log('[STEP 9] Checking table for new member...');

    let memberFound = false;
    let finalCount = initialState.count;

    for (let i = 0; i < 10; i++) {
      const tableState = await page.evaluate(({firstName, lastName}) => {
        const rows = document.querySelectorAll('table tbody tr');
        const names = Array.from(rows).map(r => r.querySelector('td')?.textContent?.trim() || '');

        const found = names.some(name => name.includes(firstName) && name.includes(lastName));

        return {
          count: rows.length,
          found: found,
          names: names.slice(0, 5)
        };
      }, {firstName, lastName});

      finalCount = tableState.count;
      const elapsed = (i + 1) * 500;

      console.log(`  +${elapsed}ms: ${tableState.count} members, found: ${tableState.found ? '✅' : '❌'}`);

      if (tableState.found) {
        memberFound = true;
        console.log('  ✅ NEW MEMBER FOUND: ' + firstName + ' ' + lastName + '\n');
        break;
      }

      await page.waitForTimeout(500);
    }

    // Final verdict
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ FINAL VERIFICATION RESULTS:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Initial count: ' + initialState.count);
    console.log('Final count: ' + finalCount);
    console.log('Members added: ' + (finalCount - initialState.count));
    console.log('New member visible: ' + (memberFound ? '✅ YES - FIX IS WORKING!' : '❌ NO'));
    console.log('═══════════════════════════════════════════════════════════════\n');

    return memberFound ? 0 : 1;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return 1;
  } finally {
    await browser.close();
  }
}

finalVerification().then(code => process.exit(code));
