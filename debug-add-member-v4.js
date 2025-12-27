const { chromium } = require('playwright');

async function debugAddMember() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture network calls
  const apiCalls = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/members') && response.request().method() === 'POST') {
      apiCalls.push({
        url: url,
        status: response.status(),
        method: response.request().method()
      });
    }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║    DEBUG: Add Member - Playwright fill() Method v4             ║');
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
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        memberCount: countMatch ? parseInt(countMatch[1]) : 0
      };
    });

    console.log(`Initial: ${initialInfo.memberCount} total members`);

    // Click "Add Member" button
    console.log('\n[STEP 3] Clicking "Add Member" button to open modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent.trim() === 'Add Member');
      if (addBtn) addBtn.click();
    });

    await page.waitForTimeout(1000);

    // Use Playwright's fill method directly on form inputs
    console.log('\n[STEP 4] Filling form with Playwright fill() method...');
    const timestamp = Date.now();
    const testFirstName = `John${timestamp.toString().slice(-4)}`;
    const testLastName = `Doe${timestamp.toString().slice(-4)}`;
    const testPhone = `555000${timestamp.toString().slice(-4)}`;

    // Fill using form field names
    await page.fill('input[name="firstName"]', testFirstName);
    console.log(`  ✓ firstName: ${testFirstName}`);

    await page.fill('input[name="lastName"]', testLastName);
    console.log(`  ✓ lastName: ${testLastName}`);

    await page.fill('input[name="phone"]', testPhone);
    console.log(`  ✓ phone: ${testPhone}`);

    // Verify form values
    const formValues = await page.evaluate(() => {
      return {
        firstName: document.querySelector('input[name="firstName"]')?.value || '',
        lastName: document.querySelector('input[name="lastName"]')?.value || '',
        phone: document.querySelector('input[name="phone"]')?.value || ''
      };
    });

    console.log(`\nVerified form values:`, JSON.stringify(formValues));

    // Clear API log and submit
    console.log('\n[STEP 5] Submitting form by clicking submit button...');
    apiCalls.length = 0;

    // Click submit button
    const submitClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
      const submitBtn = buttons.find(b => b.textContent.includes('Add Member'));
      if (submitBtn) {
        console.log('Submit button found, clicking...');
        submitBtn.click();
        return true;
      }
      return false;
    });

    console.log(`Submit button clicked: ${submitClicked}`);

    // Wait for response
    console.log('\n[STEP 6] Waiting for API response (3 seconds)...');
    await page.waitForTimeout(3000);

    // Check POST calls
    console.log(`\nPOST API Calls:`);
    const postCalls = apiCalls.filter(c => c.method === 'POST');
    if (postCalls.length === 0) {
      console.log('  ❌ NO POST CALLS');
    } else {
      postCalls.forEach((call, i) => {
        console.log(`  ${i + 1}. ${call.method} ${call.url.split('?')[0]}`);
        console.log(`     Status: ${call.status}`);
      });
    }

    // Check for errors in console
    console.log('\n[STEP 7] Checking browser console for errors...');
    const hasErrors = await page.evaluate(() => {
      // This is a simple check - just see if any error messages are visible
      const text = document.body.innerText.toLowerCase();
      return text.includes('error') && !text.includes('errs');
    });

    console.log(`Error messages visible: ${hasErrors ? '⚠️ YES' : '✅ NO'}`);

    // Check final state
    const finalInfo = await page.evaluate(() => {
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        memberCount: countMatch ? parseInt(countMatch[1]) : 0
      };
    });

    console.log('\n[STEP 8] Final state:');
    console.log(`Member count: ${finalInfo.memberCount} (was ${initialInfo.memberCount})`);
    console.log(`Count increased: ${finalInfo.memberCount > initialInfo.memberCount ? '✅ YES' : '❌ NO'}`);

    console.log('\n[STEP 9] DIAGNOSIS:');
    if (postCalls.length === 0) {
      console.log('❌ PROBLEM: Form submit button click did not trigger API POST call');
      console.log('   Possible causes:');
      console.log('   1. React Hook Form validation failed silently');
      console.log('   2. Form submit handler is not attached correctly');
      console.log('   3. Browser event handling issue');
      console.log('\n   Next: Check React Hook Form validation and form submission handler');
    } else {
      console.log('API call was made but member not saved - check backend');
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

debugAddMember();
