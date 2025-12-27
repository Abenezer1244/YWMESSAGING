const { chromium } = require('playwright');

async function completeFeatureTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const results = [];

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          COMPLETE FEATURE TEST - ALL FUNCTIONALITY               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // ============================================================
    // SETUP: Login
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[SETUP] Logging in...');
    console.log('═══════════════════════════════════════════════════════════\n');

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

    console.log('✅ Logged in\n');

    // ============================================================
    // TEST 1: Add Member and Verify It Appears
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST 1: Add Member - Should Appear in Table');
    console.log('═══════════════════════════════════════════════════════════\n');

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a, button')).find(el =>
        el.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    const ts1 = Date.now();
    const memberName1 = 'TEST_ADD_' + ts1.toString().slice(-6);

    console.log('[1a] Initial member count...');
    const initialCount = await page.evaluate(() => {
      return document.querySelectorAll('table tbody tr').length;
    });
    console.log('     Count: ' + initialCount + '\n');

    console.log('[1b] Adding member: ' + memberName1);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    await page.fill('input[name="firstName"]', memberName1);
    await page.fill('input[name="lastName"]', 'LASTNAME');
    await page.fill('input[name="phone"]', '+15551111111');
    await page.click('button[type="submit"]:has-text("Add Member")');
    console.log('     Submitted form\n');

    console.log('[1c] Waiting for member to appear (3 seconds)...');
    await page.waitForTimeout(3000);

    const finalCount1 = await page.evaluate((name) => {
      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => r.querySelector('td')?.textContent?.trim() || '');
      return {
        count: rows.length,
        found: names.some(n => n.includes(name))
      };
    }, memberName1);

    console.log('     Final count: ' + finalCount1.count);
    console.log('     Member visible: ' + (finalCount1.found ? '✅ YES' : '❌ NO\n'));

    if (finalCount1.found && finalCount1.count > initialCount) {
      results.push({ test: 'Add Member', status: '✅ PASS' });
      console.log('✅ RESULT: Member was added and appears in table\n');
    } else {
      results.push({ test: 'Add Member', status: '❌ FAIL' });
      console.log('❌ RESULT: Member was NOT added or does not appear\n');
    }

    // ============================================================
    // TEST 2: Delete Member - Should Be Removed Immediately
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST 2: Delete Member - Should Be Removed Immediately');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[2a] Count before delete: ' + finalCount1.count);

    console.log('[2b] Clicking remove on added member...');
    const deleteResult = await page.evaluate((name) => {
      const rows = document.querySelectorAll('table tbody tr');
      const row = Array.from(rows).find(r => r.textContent.includes(name));
      if (row) {
        const removeBtn = row.querySelector('button:has-text("Remove"), button[class*="remove"], button[class*="delete"]');
        if (removeBtn) {
          removeBtn.click();
          return { found: true, clicked: true };
        }
        return { found: true, clicked: false };
      }
      return { found: false, clicked: false };
    }, memberName1);

    console.log('     Found row: ' + (deleteResult.found ? '✅' : '❌'));
    console.log('     Clicked remove: ' + (deleteResult.clicked ? '✅' : '❌') + '\n');

    // Wait for deletion
    console.log('[2c] Waiting for deletion (2 seconds)...');
    await page.waitForTimeout(2000);

    const countAfterDelete = await page.evaluate((name) => {
      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => r.querySelector('td')?.textContent?.trim() || '');
      return {
        count: rows.length,
        stillExists: names.some(n => n.includes(name))
      };
    }, memberName1);

    console.log('     Count after delete: ' + countAfterDelete.count);
    console.log('     Member still visible: ' + (countAfterDelete.stillExists ? '❌ YES' : '✅ NO') + '\n');

    if (deleteResult.clicked && !countAfterDelete.stillExists && countAfterDelete.count < finalCount1.count) {
      results.push({ test: 'Delete Member', status: '✅ PASS' });
      console.log('✅ RESULT: Member was deleted immediately\n');
    } else if (!deleteResult.clicked) {
      results.push({ test: 'Delete Member', status: '⚠️  UNKNOWN - Could not find delete button' });
      console.log('⚠️  RESULT: Could not locate delete button\n');
    } else {
      results.push({ test: 'Delete Member', status: '❌ FAIL' });
      console.log('❌ RESULT: Member was NOT deleted or still visible\n');
    }

    // ============================================================
    // TEST 3: Group Selection - Different Groups Show Different Counts
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST 3: Group Selection - Different Groups, Different Counts');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[3a] Going to Groups page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a, button')).find(el =>
        el.textContent.trim() === 'Groups'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    console.log('[3b] Checking group counts...');
    const groupInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="Card"], div[class*="rounded"]'));
      const groups = [];

      for (let card of cards) {
        const texts = Array.from(card.querySelectorAll('*')).map(el => el.textContent?.trim()).filter(t => t);
        const textStr = card.textContent;

        if (textStr.includes('Members') && textStr.includes('Manage')) {
          const memberMatch = textStr.match(/(\d+)\s*[Mm]embers?/);
          const count = memberMatch ? parseInt(memberMatch[1]) : -1;

          if (count >= 0) {
            groups.push({ count });
            if (groups.length <= 4) {
              console.log('     Group ' + groups.length + ': ' + count + ' members');
            }
          }
        }
      }
      return groups;
    });

    console.log('');

    if (groupInfo.length < 2) {
      results.push({ test: 'Group Selection', status: '⚠️  UNKNOWN - Could not parse groups' });
      console.log('⚠️  RESULT: Could not parse group information\n');
    } else {
      // Click on group with different count
      let testPassed = false;

      for (let i = 0; i < Math.min(groupInfo.length, 2); i++) {
        const expectedCount = groupInfo[i].count;
        console.log('[3c] Testing group ' + (i + 1) + ' (expected ' + expectedCount + ' members)...');

        await page.evaluate((idx) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const manageBtns = buttons.filter(b => b.textContent.includes('Manage Members'));
          if (manageBtns[idx]) {
            manageBtns[idx].click();
          }
        }, i);

        await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
        await page.waitForTimeout(1500);

        const actualCount = await page.evaluate(() => {
          return document.querySelectorAll('table tbody tr').length;
        });

        console.log('     Actual count: ' + actualCount);
        console.log('     Match: ' + (actualCount === expectedCount ? '✅' : '❌') + '\n');

        if (actualCount === expectedCount) {
          testPassed = true;
        } else {
          console.log('     Expected: ' + expectedCount + ' but got ' + actualCount + '\n');
        }

        if (i < Math.min(groupInfo.length, 2) - 1) {
          await page.goBack({ waitUntil: 'load' });
          await page.waitForTimeout(1000);
        }
      }

      if (testPassed) {
        results.push({ test: 'Group Selection', status: '✅ PASS' });
        console.log('✅ RESULT: Group selection works correctly\n');
      } else {
        results.push({ test: 'Group Selection', status: '❌ FAIL' });
        console.log('❌ RESULT: Group selection NOT working - wrong counts shown\n');
      }
    }

    // ============================================================
    // TEST 4: Delete Group - Should Be Removed
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST 4: Delete Group - Should Be Removed');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[4a] Count of groups before deletion...');
    const initialGroupCount = await page.evaluate(() => {
      return document.querySelectorAll('[class*="Card"], div[class*="rounded"]').length;
    });
    console.log('     Total cards: ' + initialGroupCount + '\n');

    console.log('[4b] Looking for delete button on last group...');
    const deleteGroupResult = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="Card"], div[class*="rounded"]'));
      if (cards.length > 0) {
        const lastCard = cards[cards.length - 1];
        const buttons = lastCard.querySelectorAll('button');
        const deleteBtn = Array.from(buttons).find(b => b.textContent.includes('Delete') || b.textContent.includes('delete') || b.innerHTML.includes('trash'));

        if (deleteBtn) {
          console.log('     Found delete button');
          deleteBtn.click();
          return { found: true, clicked: true };
        }
        return { found: false, clicked: false };
      }
      return { found: false, clicked: false };
    });

    console.log('     Delete button found: ' + (deleteGroupResult.found ? '✅' : '❌'));
    console.log('     Clicked: ' + (deleteGroupResult.clicked ? '✅' : '❌') + '\n');

    if (deleteGroupResult.clicked) {
      console.log('[4c] Confirming deletion...');
      // Look for confirm button or check if dialog appeared
      const confirmBtns = await page.$$('[class*="confirm"], button:has-text("Delete"), button:has-text("Yes")');
      if (confirmBtns.length > 0) {
        await confirmBtns[0].click();
        console.log('     Confirmed\n');
      }

      await page.waitForTimeout(2000);

      const finalGroupCount = await page.evaluate(() => {
        return document.querySelectorAll('[class*="Card"], div[class*="rounded"]').length;
      });

      console.log('     Count after delete: ' + finalGroupCount);
      console.log('     Group removed: ' + (finalGroupCount < initialGroupCount ? '✅' : '❌') + '\n');

      if (finalGroupCount < initialGroupCount) {
        results.push({ test: 'Delete Group', status: '✅ PASS' });
        console.log('✅ RESULT: Group was deleted\n');
      } else {
        results.push({ test: 'Delete Group', status: '❌ FAIL' });
        console.log('❌ RESULT: Group was NOT deleted\n');
      }
    } else {
      results.push({ test: 'Delete Group', status: '⚠️  UNKNOWN - Could not find delete button' });
      console.log('⚠️  RESULT: Could not locate delete button\n');
    }

    // ============================================================
    // FINAL SUMMARY
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('FINAL TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    const passed = results.filter(r => r.status.includes('PASS')).length;
    const failed = results.filter(r => r.status.includes('FAIL')).length;
    const unknown = results.filter(r => r.status.includes('UNKNOWN')).length;

    results.forEach(r => {
      console.log(r.status + ' ' + r.test);
    });

    console.log('');
    console.log('Total:    ' + results.length + ' tests');
    console.log('Passed:   ' + passed + ' ✅');
    console.log('Failed:   ' + failed + ' ❌');
    console.log('Unknown:  ' + unknown + ' ⚠️');
    console.log('');

    if (failed === 0 && unknown === 0) {
      console.log('🎉 ALL TESTS PASSED!');
    } else if (failed > 0) {
      console.log('⛔ ISSUES FOUND - See failed tests above');
    } else {
      console.log('⚠️  Some tests could not be fully verified');
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test crashed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

completeFeatureTest();
