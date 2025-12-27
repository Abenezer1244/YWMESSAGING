const { chromium } = require('playwright');

async function verifyProductionFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     PRODUCTION VERIFICATION: Member Addition Flow               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Step 1: Login
    console.log('[STEP 1] Logging in to production...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in\n');

    // Step 2: Close modals
    console.log('[STEP 2] Closing modals...');
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);

    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }
    console.log('✅ Modals closed\n');

    // Step 3: Navigate to Members
    console.log('[STEP 3] Navigating to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log('✅ On Members page\n');

    // Step 4: Get initial member count
    console.log('[STEP 4] Getting initial member count from DOM...');
    const initialCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    console.log('✅ Initial members in table: ' + initialCount + '\n');

    // Step 5: Open Add Member modal
    console.log('[STEP 5] Opening Add Member modal...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);
    console.log('✅ Modal opened\n');

    // Step 6: Fill in member details
    const timestamp = Date.now();
    const firstName = 'TestVerify';
    const lastName = 'Prod' + timestamp;
    const phone = '555' + String(timestamp).slice(-7);

    console.log('[STEP 6] Filling member form...');
    console.log('  Name: ' + firstName + ' ' + lastName);
    console.log('  Phone: ' + phone);

    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);
    console.log('✅ Form filled\n');

    // Step 7: Submit form
    console.log('[STEP 7] Submitting form...');
    const startSubmit = Date.now();

    let apiResponse = null;
    page.on('response', async response => {
      if (response.url().includes('/api/groups') && response.url().includes('/members') &&
          response.request().method() === 'POST') {
        try {
          apiResponse = await response.json();
        } catch (err) {
          // ignore
        }
      }
    });

    await page.click('button[type="submit"]:has-text("Add Member")');
    await page.waitForTimeout(1500); // Wait for response and modal to process

    const submitDuration = Date.now() - startSubmit;
    console.log('API Status: ' + (apiResponse ? (apiResponse.success ? '✅ SUCCESS' : '❌ FAILED') : '❓ NO RESPONSE'));
    console.log('Submit took: ' + submitDuration + 'ms\n');

    // Step 8: Wait for modal to close and UI to update
    console.log('[STEP 8] Waiting for member to appear in UI...');
    console.log('⏳ Waiting for list refetch (800ms delay in code)...\n');

    let memberFound = false;
    let finalCount = initialCount;

    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(1500); // Wait 1.5s between checks

      const tableState = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        return {
          count: rows.length,
          names: Array.from(rows).map(r => {
            const cells = r.querySelectorAll('td');
            if (cells.length > 0) {
              return cells[0].textContent.trim();
            }
            return '';
          })
        };
      });

      finalCount = tableState.count;
      const timeElapsed = (i + 1) * 1.5;

      console.log(`  +${timeElapsed.toFixed(1)}s: ${tableState.count} members in table`);

      // Check if our new member is in the list
      const newMemberFound = tableState.names.some(name =>
        name.includes(firstName) && name.includes(lastName)
      );

      if (newMemberFound) {
        memberFound = true;
        console.log(`     ✅ FOUND: ${firstName} ${lastName}\n`);
        break;
      }
    }

    // Step 9: Final verdict
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('VERIFICATION RESULTS:');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Initial members count: ' + initialCount);
    console.log('Final members count: ' + finalCount);
    console.log('Members added: ' + (finalCount - initialCount));
    console.log('New member visible in UI: ' + (memberFound ? '✅ YES' : '❌ NO'));

    console.log('\n' + (memberFound ? '🎉 FIX VERIFIED: Member addition is working in production!' : '❌ FIX FAILED: Member did not appear in UI'));

    console.log('\n═══════════════════════════════════════════════════════════════\n');

    return memberFound ? 0 : 1;

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    return 1;
  } finally {
    await browser.close();
  }
}

verifyProductionFix().then(code => process.exit(code));
