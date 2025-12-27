const { chromium } = require('playwright');

async function testGroupSelection() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🧪 TEST: Group Selection Fix\n');

    // Login
    console.log('[SETUP] Logging in...');
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

    // Navigate to Groups
    console.log('[STEP 1] Navigating to Groups page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a, button')).find(el =>
        el.textContent.trim() === 'Groups'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get all groups and their member counts
    console.log('[STEP 2] Reading groups and member counts...');
    const groupsInfo = await page.evaluate(() => {
      const groups = Array.from(document.querySelectorAll('[class*="SoftCard"]')).map(card => {
        const nameEl = card.querySelector('h3, [class*="font-bold"]');
        const memberEl = Array.from(card.querySelectorAll('p')).find(p =>
          p.textContent.includes('Members') || p.textContent.match(/^\d+$/)
        );

        const name = nameEl?.textContent?.trim() || '';
        const memberText = memberEl?.textContent?.trim() || '0';
        const memberCount = parseInt(memberText) || 0;

        return { name, memberCount };
      }).filter(g => g.name && g.memberCount >= 0);

      return groups;
    });

    console.log('Found ' + groupsInfo.length + ' groups:');
    groupsInfo.forEach((g, idx) => {
      console.log('  [' + (idx + 1) + '] ' + g.name + ' - ' + g.memberCount + ' members');
    });
    console.log('');

    // Test each group
    const results = [];

    for (let i = 0; i < groupsInfo.length && i < 3; i++) {
      const expectedCount = groupsInfo[i].memberCount;
      const groupName = groupsInfo[i].name;

      console.log('[TEST ' + (i + 1) + '] Testing group: ' + groupName + ' (' + expectedCount + ' members)');

      // Click "Manage Members" button for this group
      await page.evaluate((idx) => {
        const cards = Array.from(document.querySelectorAll('[class*="SoftCard"]'));
        const targetCard = cards[idx];
        if (targetCard) {
          const manageBtn = targetCard.querySelector('button:has-text("Manage Members"), button:has(svg):last-of-type');
          if (!manageBtn) {
            const buttons = Array.from(targetCard.querySelectorAll('button'));
            const lastBtn = buttons[buttons.length - 2]; // Second to last (before delete)
            if (lastBtn && lastBtn.textContent.includes('Manage')) {
              lastBtn.click();
              return true;
            }
          } else {
            manageBtn.click();
            return true;
          }
        }
        return false;
      }, i);

      await page.waitForTimeout(1000);

      // Check the member count displayed on Members page
      const pageInfo = await page.evaluate(() => {
        const header = document.querySelector('h1, h2, [class*="text-"]');
        const memberCountEl = Array.from(document.querySelectorAll('p, span')).find(el =>
          el.textContent.includes('members')
        );

        const rows = document.querySelectorAll('table tbody tr');
        const displayedCount = rows.length;

        return {
          header: header?.textContent?.trim() || '',
          memberText: memberCountEl?.textContent?.trim() || '',
          tableRows: displayedCount
        };
      });

      console.log('  Page shows: ' + pageInfo.memberText);
      console.log('  Table rows: ' + pageInfo.tableRows);
      console.log('  Expected: ' + expectedCount + ' members');

      const passed = pageInfo.tableRows === expectedCount || pageInfo.memberText.includes(expectedCount.toString());
      results.push({
        group: groupName,
        expected: expectedCount,
        actual: pageInfo.tableRows,
        passed: passed ? '✅' : '❌'
      });

      console.log('  Result: ' + (passed ? '✅ PASS' : '❌ FAIL') + '\n');

      // Go back to Groups
      await page.goBack({ waitUntil: 'load' });
      await page.waitForTimeout(1000);
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════');
    results.forEach(r => {
      console.log(r.passed + ' ' + r.group);
      console.log('    Expected: ' + r.expected + ' members | Actual: ' + r.actual + ' rows');
    });

    const allPassed = results.every(r => r.passed === '✅');
    console.log('');
    console.log('OVERALL: ' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testGroupSelection();
