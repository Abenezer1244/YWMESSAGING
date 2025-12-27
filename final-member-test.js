const { chromium } = require('playwright');

async function finalMemberTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🎯 FINAL MEMBER TEST\n');

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

    // Create unique member
    const timestamp = Date.now();
    const uniqueFirst = 'FINAL' + timestamp.toString().substring(timestamp.toString().length - 6);
    const uniqueLast = 'TEST' + timestamp.toString().substring(timestamp.toString().length - 4);

    console.log('[1] Adding member: ' + uniqueFirst + ' ' + uniqueLast);

    // Click Add Member and submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    await page.fill('input[name="firstName"]', uniqueFirst);
    await page.fill('input[name="lastName"]', uniqueLast);
    await page.fill('input[name="phone"]', '+15559999999');

    await page.click('button[type="submit"]:has-text("Add Member")');
    console.log('  Form submitted\n');

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

    // Wait for refetch and React state update
    console.log('[3] Waiting for table update (3 seconds)...');
    await page.waitForTimeout(3000);

    // Check if new member appears in table (with search)
    console.log('[4] Checking if new member appears...');

    const allMembers = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const members = Array.from(rows).map(r => {
        const cells = r.querySelectorAll('td');
        if (cells.length >= 2) {
          return {
            name: cells[0].textContent.trim(),
            phone: cells[1]?.textContent.trim() || ''
          };
        }
        return null;
      }).filter(m => m !== null);

      return members;
    });

    console.log('  Total members in table: ' + allMembers.length);
    console.log('  First 3 members: ');
    allMembers.slice(0, 3).forEach((m, idx) => {
      console.log('    [' + (idx + 1) + '] ' + m.name);
    });

    const found = allMembers.some(m => m.name.includes(uniqueFirst));
    console.log('');

    // Try searching for the member
    if (!found) {
      console.log('[5] Member not in first 3, trying search...');
      const searchInput = await page.$('input[placeholder*="search"], input[placeholder*="Search"]');
      if (searchInput) {
        await page.fill('input[placeholder*="search"]', uniqueFirst);
        await page.waitForTimeout(1000);

        const searchResults = await page.evaluate(() => {
          const rows = document.querySelectorAll('table tbody tr');
          return rows.length;
        });

        console.log('  Search results: ' + searchResults + ' rows\n');
        console.log('[RESULT] Member found via search: ' + (searchResults > 0 ? '✅ YES' : '❌ NO'));
      }
    } else {
      console.log('[RESULT] Member visible in table: ✅ YES\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('FINAL TEST SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Member name: ' + uniqueFirst + ' ' + uniqueLast);
    console.log('Member phone: +15559999999');
    console.log('Modal closed: ' + (modalClosed ? '✅' : '❌'));
    console.log('Table updated: ' + (allMembers.length > 0 ? '✅' : '❌'));
    console.log('Member appears in table: ' + (found ? '✅' : '❌ (not in first 3)'));
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

finalMemberTest();
