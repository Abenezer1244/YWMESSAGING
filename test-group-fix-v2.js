const { chromium } = require('playwright');

async function testGroupFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🧪 TEST: Group Selection Fix v2\n');

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

    // Navigate to Groups via sidebar
    console.log('[STEP 1] Clicking Groups in sidebar...');
    await page.click('a:has-text("Groups"), button:has-text("Groups")');
    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Take screenshot to see what's on the page
    await page.screenshot({ path: '/tmp/groups-page.png' });
    console.log('  Screenshot saved to /tmp/groups-page.png\n');

    // Get the URL to verify we're on Groups page
    const currentUrl = page.url();
    console.log('  Current URL: ' + currentUrl + '\n');

    // Test 1: Click on first group's "Manage Members"
    console.log('[TEST 1] Clicking "Manage Members" on first group...');
    const firstGroupResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const manageBtn = buttons.find(b => b.textContent.includes('Manage Members'));

      if (manageBtn) {
        // Get the group name and member count from the card
        const card = manageBtn.closest('[class*="Card"], div[class*="rounded"]');
        if (card) {
          const texts = Array.from(card.querySelectorAll('*')).map(el => el.textContent?.trim()).filter(t => t);
          console.log('Card content:', texts.slice(0, 5).join(' | '));
        }
        manageBtn.click();
        return { clicked: true, text: manageBtn.textContent };
      }
      return { clicked: false };
    });

    if (!firstGroupResult.clicked) {
      console.log('  ❌ Could not find "Manage Members" button\n');
    } else {
      console.log('  ✅ Clicked "Manage Members"\n');
    }

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(1500);

    // Check the Members page
    console.log('[TEST 1 RESULT] Checking Members page...');
    const membersPageInfo = await page.evaluate(() => {
      const header = document.querySelector('h1, h2');
      const memberCountText = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent?.includes('members')
      )?.textContent?.trim() || '';

      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => {
        const cells = r.querySelectorAll('td');
        return cells[0]?.textContent?.trim() || '';
      }).slice(0, 3);

      return {
        header: header?.textContent?.trim() || 'N/A',
        memberCountText: memberCountText,
        tableRows: rows.length,
        firstNames: names
      };
    });

    console.log('  Header: ' + membersPageInfo.header);
    console.log('  Member text: ' + membersPageInfo.memberCountText);
    console.log('  Table rows: ' + membersPageInfo.tableRows);
    console.log('  First 3 names: ' + membersPageInfo.firstNames.join(' | '));
    console.log('');

    // Go back and test another group
    console.log('[TEST 2] Going back to Groups...');
    await page.goBack({ waitUntil: 'load' });
    await page.waitForTimeout(2000);

    console.log('[TEST 2] Clicking "Manage Members" on second group...');
    const secondGroupResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const manageBtns = buttons.filter(b => b.textContent.includes('Manage Members'));

      if (manageBtns.length > 1) {
        manageBtns[1].click();
        return { clicked: true };
      }
      return { clicked: false };
    });

    if (!secondGroupResult.clicked) {
      console.log('  ⚠️ Could not find second "Manage Members" button\n');
    } else {
      console.log('  ✅ Clicked "Manage Members" on second group\n');
    }

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(1500);

    // Check if it's a different group
    console.log('[TEST 2 RESULT] Checking if different group is shown...');
    const secondMembersInfo = await page.evaluate(() => {
      const memberCountText = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent?.includes('members')
      )?.textContent?.trim() || '';

      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => {
        const cells = r.querySelectorAll('td');
        return cells[0]?.textContent?.trim() || '';
      }).slice(0, 3);

      return {
        memberCountText: memberCountText,
        tableRows: rows.length,
        firstNames: names
      };
    });

    console.log('  Member text: ' + secondMembersInfo.memberCountText);
    console.log('  Table rows: ' + secondMembersInfo.tableRows);
    console.log('  First 3 names: ' + secondMembersInfo.firstNames.join(' | '));
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST RESULTS:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Test 1 - First group members: ' + membersPageInfo.tableRows + ' rows');
    console.log('Test 2 - Second group members: ' + secondMembersInfo.tableRows + ' rows');

    if (membersPageInfo.tableRows !== secondMembersInfo.tableRows) {
      console.log('\n✅ PASS: Different groups show different member counts!');
      console.log('   Group 1: ' + membersPageInfo.tableRows + ' members');
      console.log('   Group 2: ' + secondMembersInfo.tableRows + ' members');
    } else {
      console.log('\n❌ FAIL: Both groups show the same member count (' + membersPageInfo.tableRows + ')');
      console.log('   This suggests the group selection fix is not working.');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testGroupFix();
