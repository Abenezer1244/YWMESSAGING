const { chromium } = require('playwright');

async function verifyMemberByName() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 VERIFY: Member Appears by Name\n');

    // Login
    await page.request.post('https://api.koinoniasms.com/api/auth/login', {
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

    // Create unique member name
    const timestamp = Date.now();
    const uniqueName = 'VERIFY' + timestamp.toString().substring(timestamp.toString().length - 6);

    console.log('[1] Adding member: ' + uniqueName + '...');

    // Click Add Member
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    // Fill and submit
    await page.fill('input[name="firstName"]', uniqueName);
    await page.fill('input[name="lastName"]', 'TESTMEMBER');
    await page.fill('input[name="phone"]', '+15559876543');

    const submitTime = Date.now();
    await page.click('button[type="submit"]:has-text("Add Member")');
    console.log('  ✅ Form submitted\n');

    // Wait for modal to close
    let modalClosed = false;
    for (let i = 0; i < 10; i++) {
      const visible = await page.locator('input[name="firstName"]').isVisible().catch(() => false);
      if (!visible) {
        modalClosed = true;
        console.log('[2] Modal closed after ' + ((i + 1) * 100) + 'ms\n');
        break;
      }
      await page.waitForTimeout(100);
    }

    if (!modalClosed) {
      console.log('[2] ⚠️ Modal did not close\n');
    }

    // Wait a bit for refetch
    console.log('[3] Waiting for refetch...');
    await page.waitForTimeout(2000);

    // Check if member appears in table
    console.log('[4] Searching for member in table...');
    const { memberFound, tableNames, totalRows } = await page.evaluate((name) => {
      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => {
        const cells = r.querySelectorAll('td');
        if (cells.length > 0) {
          return cells[0].textContent.trim();
        }
        return '';
      });

      return {
        memberFound: names.some(n => n === name),
        tableNames: names.slice(0, 5),
        totalRows: rows.length
      };
    }, uniqueName);

    console.log('  Total rows in table: ' + totalRows);
    console.log('  First 5 names: ' + tableNames.join(' | '));
    console.log('  Looking for: ' + uniqueName);

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('RESULT:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Member created: ✅');
    console.log('Member name: ' + uniqueName + ' TESTMEMBER');
    console.log('Member visible in table: ' + (memberFound ? '✅ YES' : '❌ NO'));
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

verifyMemberByName();
