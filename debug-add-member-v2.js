const { chromium } = require('playwright');

async function debugAddMember() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Intercept API calls
  const apiCalls = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/members') || url.includes('/groups')) {
      apiCalls.push({
        url: url,
        status: response.status(),
        method: response.request().method()
      });
    }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║    DEBUG: Add Member - Form Interaction & API Testing           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[STEP 1] Logging in...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in');

    await page.waitForTimeout(2000);

    // Close welcome modal
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);

    // Close phone number modal
    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    // Navigate to Members page
    console.log('\n[STEP 2] Navigating to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get initial state
    const initialInfo = await page.evaluate(() => {
      const memberRows = Array.from(document.querySelectorAll('table tbody tr'));
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        memberCount: countMatch ? parseInt(countMatch[1]) : 0,
        membersOnPage: memberRows.length
      };
    });

    console.log(`Initial: ${initialInfo.memberCount} total members`);

    // Click "Add Member" button
    console.log('\n[STEP 3] Clicking "Add Member" button...');
    const timestamp = Date.now();
    const testName = `Test${timestamp.toString().slice(-6)}`;
    const testPhone = `555000${timestamp.toString().slice(-4)}`;

    // Clear previous API calls log
    apiCalls.length = 0;

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(800);

    // Find and fill form inputs
    console.log('\n[STEP 4] Filling form...');
    const inputs = await page.locator('input[type="text"], input[type="tel"], input[type="email"]').all();
    console.log(`Found ${inputs.length} input fields`);

    if (inputs.length >= 3) {
      console.log(`  - Field 1: filling with "Test"`);
      await inputs[0].fill('Test');

      console.log(`  - Field 2: filling with "${testName}"`);
      await inputs[1].fill(testName);

      console.log(`  - Field 3 (phone): filling with "${testPhone}"`);
      await inputs[2].fill(testPhone);
    }

    // Verify form values
    const formValues = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]'));
      return inputs.map(i => ({
        type: i.type,
        value: i.value
      }));
    });

    console.log('\nForm values after fill:');
    formValues.forEach((val, i) => {
      console.log(`  Field ${i + 1}: type=${val.type}, value="${val.value}"`);
    });

    // Click submit button
    console.log('\n[STEP 5] Clicking submit button...');
    const submitBtn = await page.locator('button').filter({
      hasText: /^Add Member$/
    }).last();

    const btnCount = await submitBtn.count();
    console.log(`Found ${btnCount} "Add Member" button(s)`);

    if (btnCount > 0) {
      console.log('Clicking the last "Add Member" button (should be in modal)');
      await submitBtn.click();
    } else {
      console.log('❌ No submit button found');
    }

    // Wait for API response
    console.log('\n[STEP 6] Waiting for API response (3 seconds)...');
    await page.waitForTimeout(3000);

    // Check API calls
    console.log('\nAPI Calls Made:');
    if (apiCalls.length === 0) {
      console.log('  ❌ NO API CALLS DETECTED!');
    } else {
      apiCalls.forEach((call, i) => {
        console.log(`  ${i + 1}. ${call.method} ${call.url}`);
        console.log(`     Status: ${call.status}`);
      });
    }

    // Look for error messages
    console.log('\n[STEP 7] Checking for errors or messages...');
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasError = pageText.includes('error') || pageText.includes('Error') || pageText.includes('failed');
    const hasSuccess = pageText.includes('success') || pageText.includes('added') || pageText.includes('Member');

    console.log(`Error message found: ${hasError ? '⚠️ YES' : '❌ NO'}`);
    console.log(`Success message found: ${hasSuccess ? '✅ YES' : '❌ NO'}`);

    // Get final member count
    console.log('\n[STEP 8] Checking final member count...');
    await page.waitForTimeout(1000);

    const finalInfo = await page.evaluate(() => {
      const memberRows = Array.from(document.querySelectorAll('table tbody tr'));
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        memberCount: countMatch ? parseInt(countMatch[1]) : 0,
        membersOnPage: memberRows.length,
        memberNames: memberRows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return cells[0]?.textContent?.trim() || 'N/A';
        })
      };
    });

    console.log(`Final: ${finalInfo.memberCount} total members (${finalInfo.membersOnPage} on page)`);
    console.log(`Members list: ${finalInfo.memberNames.join(', ')}`);

    // Result analysis
    console.log('\n[STEP 9] RESULT:');
    const countIncreased = finalInfo.memberCount > initialInfo.memberCount;
    const newMemberVisible = finalInfo.memberNames.some(name =>
      name.includes(testName) || name.toLowerCase().includes('test')
    );

    console.log(`Member count increased: ${countIncreased ? '✅ YES' : '❌ NO'}`);
    console.log(`New member visible: ${newMemberVisible ? '✅ YES' : '❌ NO'}`);
    console.log(`API called: ${apiCalls.length > 0 ? '✅ YES' : '❌ NO'}`);

    if (!countIncreased && !newMemberVisible && apiCalls.length === 0) {
      console.log('\n🔴 CRITICAL ISSUE: No API call was made at all!');
      console.log('   This suggests the form submission is not triggering the API request.');
      console.log('   Check: AddMemberModal.tsx onSubmit handler');
    } else if (apiCalls.length > 0 && !countIncreased) {
      console.log('\n🟡 API ISSUE: API was called but member was not saved');
      console.log('   This suggests the backend rejected the request or there was a processing error.');
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

debugAddMember();
