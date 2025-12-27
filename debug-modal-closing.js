const { chromium } = require('playwright');

async function debugModalClosing() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 DEBUG: Is Modal Closing After Submit?\n');

    // Login via REST API for speed
    const loginRes = await page.request.post('https://api.koinoniasms.com/api/auth/login', {
      data: {
        email: 'DOKaA@GMAIL.COM',
        password: '12!Michael'
      }
    });

    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    // Navigate to members page
    await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

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
      try {
        await page.press('body', 'Escape');
      } catch (e) {}
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

    console.log('[1] Initial state:');
    let state = await page.evaluate(() => {
      return {
        tableExists: !!document.querySelector('table'),
        tableRowCount: document.querySelectorAll('table tbody tr').length,
        addButtonExists: !!Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.trim() === 'Add Member'
        )
      };
    });
    console.log('  Table exists: ' + (state.tableExists ? '✅' : '❌'));
    console.log('  Table rows: ' + state.tableRowCount);
    console.log('  Add Member button: ' + (state.addButtonExists ? '✅' : '❌') + '\n');

    // Open modal
    console.log('[2] Opening Add Member modal...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) {
        console.log('Clicking Add Member button');
        btn.click();
      }
    });

    await page.waitForTimeout(1000);

    let modalOpenBefore = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      const isOpen = modal && !modal.hidden;
      console.log('Modal state: ' + (isOpen ? 'OPEN' : 'CLOSED'));
      return isOpen;
    });

    console.log('✅ Modal ' + (modalOpenBefore ? 'OPENED' : 'NOT OPENED') + '\n');

    if (modalOpenBefore) {
      // Fill and submit
      const timestamp = Date.now();
      const lastName = 'ModalTest' + timestamp;

      console.log('[3] Filling form...');
      await page.fill('input[name="firstName"]', 'TestModal');
      await page.fill('input[name="lastName"]', lastName);
      await page.fill('input[name="phone"]', '5559999999');
      console.log('✅ Form filled\n');

      console.log('[4] Submitting form...');
      await page.click('button[type="submit"]:has-text("Add Member")');
      await page.waitForTimeout(500); // Wait for submit to process

      // Track modal state after submit
      console.log('[5] Monitoring modal state after submit...\n');
      for (let i = 0; i < 10; i++) {
        const modalState = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          return {
            exists: !!modal,
            hidden: modal ? modal.hidden : null,
            visible: modal ? !modal.hidden : false,
            displayNone: modal ? window.getComputedStyle(modal).display === 'none' : null,
            opacity: modal ? window.getComputedStyle(modal).opacity : null
          };
        });

        const elapsed = (i + 1) * 200;
        console.log(`  +${elapsed}ms: Modal ${modalState.visible ? 'VISIBLE' : 'HIDDEN'}`);

        if (!modalState.visible && !modalState.hidden) {
          console.log('       → Modal closed!\n');
          break;
        }

        await page.waitForTimeout(200);
      }

      // Check if table updated
      console.log('[6] Checking if table updated...');
      let tableAfter = await page.evaluate((lastName) => {
        const rows = document.querySelectorAll('table tbody tr');
        const names = Array.from(rows).map(r => r.querySelector('td')?.textContent?.trim() || '');
        const hasNew = names.some(n => n.includes(lastName));

        return {
          count: rows.length,
          hasNewMember: hasNew,
          firstNames: names.slice(0, 3)
        };
      }, lastName);

      console.log('  Rows in table: ' + tableAfter.count);
      console.log('  Has new member: ' + (tableAfter.hasNewMember ? '✅' : '❌'));
      console.log('  First 3: ' + tableAfter.firstNames.join(' | ') + '\n');

      console.log('[7] Console logs during submit:');
      // Check React dev tools state
      const reactState = await page.evaluate(() => {
        // Try to find React fiber in browser console
        const logs = [];
        return {
          message: 'Modal behavior complete. Check above for modal state transitions.'
        };
      });
      console.log('  See timestamps above for modal lifecycle\n');

    } else {
      console.log('❌ Modal did not open - cannot test modal closing behavior\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugModalClosing();
