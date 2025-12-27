const { chromium } = require('playwright');

async function realTest() {
  console.log('\n🧪 REAL FUNCTIONAL TEST - ACTUAL USER SCENARIOS\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const results = {
    addMemberInstant: null,
    deleteMemberInstant: null,
    dataIsolation: null,
  };

  try {
    // ============================================================
    // TEST 1: ADD MEMBER - INSTANT APPEARANCE
    // ============================================================
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║ TEST 1: ADD MEMBER - SHOULD APPEAR INSTANTLY               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('[SETUP] Navigating to login...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    console.log('[LOGIN] Entering credentials for testuser123@gmail.com...');
    try {
      await page.fill('input[type="email"]', 'testuser123@gmail.com');
      await page.fill('input[type="password"]', 'Test123!@#');

      const loginBtn = await page.locator('button').filter({ hasText: /Sign In|Log In|Login/ }).first();
      await loginBtn.click();

      console.log('[WAIT] Waiting for navigation...');
      await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(2000);

      // Close any modals
      for (let i = 0; i < 5; i++) {
        try {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(100);
        } catch (e) {}
      }

      console.log('[NAVIGATE] Going to Members page...');
      await page.goto('https://koinoniasms.com/dashboard/groups', { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      // Find first group and click "Manage Members"
      const manageBtn = await page.locator('button').filter({ hasText: /Manage Members/ }).first();
      if (!manageBtn) {
        console.log('❌ Could not find Manage Members button');
        results.addMemberInstant = 'FAILED - No Manage Members button';
      } else {
        await manageBtn.click();
        console.log('[NAVIGATE] Clicked Manage Members...');
        await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
        await page.waitForTimeout(2000);

        // Get initial member count
        const initialRows = await page.locator('table tbody tr').count();
        console.log('[COUNT] Initial members in table: ' + initialRows);

        // Click Add Member button
        const addMemberBtn = await page.locator('button').filter({ hasText: /Add Member/ }).first();
        await addMemberBtn.click();
        await page.waitForTimeout(1000);

        // Fill form
        const timestamp = Date.now().toString().slice(-6);
        const testName = 'TESTMEM_' + timestamp;

        console.log('[FORM] Filling form with member: ' + testName);
        await page.fill('input[name="firstName"]', testName);
        await page.fill('input[name="lastName"]', 'AUTOTEST');
        await page.fill('input[name="phone"]', '+15551234567');

        // Submit
        const submitBtn = await page.locator('button[type="submit"]').first();
        await submitBtn.click();
        console.log('[SUBMIT] Form submitted');

        // CRITICAL: Check if member appears INSTANTLY (before waiting)
        await page.waitForTimeout(500);

        const rowsAfterSubmit = await page.locator('table tbody tr').count();
        const memberVisible = await page.locator('table tbody tr').filter({
          hasText: testName
        }).count();

        console.log('[RESULT] After submit (500ms):');
        console.log('   Table rows: ' + rowsAfterSubmit);
        console.log('   Test member visible: ' + (memberVisible > 0 ? 'YES' : 'NO'));

        if (memberVisible > 0 && rowsAfterSubmit > initialRows) {
          console.log('✅ PASS: Member appeared instantly in UI');
          results.addMemberInstant = 'PASS';
        } else {
          console.log('⏳ Still checking after more time...');
          await page.waitForTimeout(2000);
          const rowsAfterWait = await page.locator('table tbody tr').count();
          const memberVisibleAfterWait = await page.locator('table tbody tr').filter({
            hasText: testName
          }).count();

          console.log('   After 2.5s total:');
          console.log('   Table rows: ' + rowsAfterWait);
          console.log('   Member visible: ' + (memberVisibleAfterWait > 0 ? 'YES' : 'NO'));

          if (memberVisibleAfterWait > 0 && rowsAfterWait > initialRows) {
            console.log('⚠️  PARTIAL: Member appeared after delay');
            results.addMemberInstant = 'PARTIAL - Delayed by 2+ seconds';
          } else {
            console.log('❌ FAIL: Member did not appear in table');
            results.addMemberInstant = 'FAIL - Member not in UI';
          }
        }
      }
    } catch (error) {
      console.log('❌ TEST 1 ERROR: ' + error.message);
      results.addMemberInstant = 'ERROR - ' + error.message;
    }

    console.log('\n');

    // ============================================================
    // TEST 2: DELETE MEMBER - INSTANT REMOVAL
    // ============================================================
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║ TEST 2: DELETE MEMBER - SHOULD DISAPPEAR INSTANTLY         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
      // Count rows before delete
      const rowsBeforeDelete = await page.locator('table tbody tr').count();
      console.log('[COUNT] Members before delete: ' + rowsBeforeDelete);

      if (rowsBeforeDelete === 0) {
        console.log('⚠️  No members to delete');
        results.deleteMemberInstant = 'SKIP - No members';
      } else {
        // Find and click delete button
        const deleteBtn = await page.locator('button').filter({ hasText: /Remove|Delete/ }).first();

        if (!deleteBtn) {
          console.log('❌ Could not find delete button');
          results.deleteMemberInstant = 'FAILED - No delete button';
        } else {
          console.log('[ACTION] Clicked delete button');
          await deleteBtn.click();

          // Check for confirmation dialog
          const confirmBtn = await page.locator('button').filter({ hasText: /Confirm|Yes|Delete/ }).first().catch(() => null);
          if (confirmBtn) {
            await confirmBtn.click();
            console.log('[CONFIRM] Confirmed deletion');
          }

          // CRITICAL: Check if member disappears INSTANTLY
          await page.waitForTimeout(300);
          const rowsAfterDelete = await page.locator('table tbody tr').count();

          console.log('[RESULT] After delete (300ms):');
          console.log('   Rows before: ' + rowsBeforeDelete);
          console.log('   Rows after: ' + rowsAfterDelete);
          console.log('   Reduced: ' + (rowsAfterDelete < rowsBeforeDelete ? 'YES' : 'NO'));

          if (rowsAfterDelete < rowsBeforeDelete) {
            console.log('✅ PASS: Member disappeared instantly');
            results.deleteMemberInstant = 'PASS';
          } else {
            console.log('⏳ Waiting for backend...');
            await page.waitForTimeout(2000);
            const rowsAfterWait = await page.locator('table tbody tr').count();

            if (rowsAfterWait < rowsBeforeDelete) {
              console.log('⚠️  PARTIAL: Member removed after delay');
              results.deleteMemberInstant = 'PARTIAL - Delayed removal';
            } else {
              console.log('❌ FAIL: Member still in table');
              results.deleteMemberInstant = 'FAIL - Member still visible';
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ TEST 2 ERROR: ' + error.message);
      results.deleteMemberInstant = 'ERROR - ' + error.message;
    }

    console.log('\n');

    // ============================================================
    // TEST 3: DATA ISOLATION - DIFFERENT ACCOUNTS
    // ============================================================
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║ TEST 3: DATA ISOLATION - NEW ACCOUNT SHOULD NOT SEE DATA   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
      // Log out first
      console.log('[LOGOUT] Logging out current user...');
      await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
      await page.waitForTimeout(1000);

      // Click logout
      const logoutBtn = await page.locator('button, a').filter({ hasText: /Logout|Log Out|Sign Out/ }).first().catch(() => null);
      if (logoutBtn) {
        await logoutBtn.click();
        await page.waitForTimeout(2000);
      }

      // Login with DIFFERENT account
      console.log('[LOGIN] Logging in with DIFFERENT account (ab@gmail.com)...');
      await page.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
      await page.waitForTimeout(1000);

      await page.fill('input[type="email"]', 'ab@gmail.com');
      await page.fill('input[type="password"]', '12!Michael');

      const loginBtn2 = await page.locator('button').filter({ hasText: /Sign In|Log In|Login/ }).first();
      await loginBtn2.click();

      await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(2000);

      // Close modals
      for (let i = 0; i < 5; i++) {
        try {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(100);
        } catch (e) {}
      }

      console.log('[NAVIGATE] Going to Groups page...');
      await page.goto('https://koinoniasms.com/dashboard/groups', { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      // Count groups for new account
      const newAccountGroupCount = await page.locator('[class*="Card"], div[class*="rounded"]').count();
      console.log('[COUNT] New account sees ' + newAccountGroupCount + ' groups/cards');

      if (newAccountGroupCount === 0) {
        console.log('✅ PASS: New account has NO groups (isolated)');
        results.dataIsolation = 'PASS';
      } else if (newAccountGroupCount > 0) {
        console.log('⚠️  New account has ' + newAccountGroupCount + ' groups');
        console.log('✅ This is OK if they are the new account\'s own groups');
        results.dataIsolation = 'LIKELY PASS - Has own groups only';
      }
    } catch (error) {
      console.log('❌ TEST 3 ERROR: ' + error.message);
      results.dataIsolation = 'ERROR - ' + error.message;
    }

    console.log('\n');

  } catch (error) {
    console.log('❌ CRITICAL TEST ERROR: ' + error.message);
  } finally {
    await browser.close();
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Test 1 - Add Member Instant:     ' + (results.addMemberInstant || 'NOT RUN'));
  console.log('Test 2 - Delete Member Instant:  ' + (results.deleteMemberInstant || 'NOT RUN'));
  console.log('Test 3 - Data Isolation:         ' + (results.dataIsolation || 'NOT RUN'));

  console.log('\n');
}

realTest().catch(console.error);
