const { chromium } = require('playwright');

async function debugAddMember() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture network calls
  const apiCalls = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/members') || url.includes('/groups')) {
      apiCalls.push({
        url: url,
        status: response.status(),
        method: response.request().method(),
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║    DEBUG: Add Member - Modal Form Isolation v3                 ║');
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

    // Clear search first
    console.log('\n[STEP 3] Clearing search input...');
    await page.evaluate(() => {
      const searchInputs = Array.from(document.querySelectorAll('input[type="text"]')).filter(inp =>
        inp.placeholder?.includes('Search') ||
        inp.placeholder?.includes('search')
      );
      console.log(`Found ${searchInputs.length} search inputs`);
      if (searchInputs.length > 0) {
        searchInputs[0].value = '';
        searchInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        searchInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(500);

    // Click "Add Member" button
    console.log('\n[STEP 4] Clicking "Add Member" button...');
    const timestamp = Date.now();
    const testName = `TestMem${timestamp.toString().slice(-5)}`;
    const testPhone = `555${String(timestamp).slice(-7)}`;

    apiCalls.length = 0; // Clear API log

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent.trim() === 'Add Member');
      console.log(`Found Add Member button: ${!!addBtn}`);
      if (addBtn) {
        addBtn.click();
      }
    });

    await page.waitForTimeout(1000);

    // Now fill the MODAL form - not the page inputs
    console.log('\n[STEP 5] Finding and filling modal form...');
    const formInfo = await page.evaluate(() => {
      // Look for form inside any modal/overlay
      const forms = Array.from(document.querySelectorAll('form'));
      console.log(`Found ${forms.length} forms on page`);

      if (forms.length === 0) {
        return { error: 'No forms found' };
      }

      // Get the last form (should be the modal form)
      const form = forms[forms.length - 1];
      const inputs = Array.from(form.querySelectorAll('input'));
      console.log(`Form has ${inputs.length} inputs`);

      return {
        hasForm: true,
        inputCount: inputs.length,
        inputTypes: inputs.map(i => ({
          type: i.type,
          name: i.name,
          placeholder: i.placeholder,
          value: i.value
        }))
      };
    });

    console.log(`Form Info:`, JSON.stringify(formInfo, null, 2));

    if (formInfo.error) {
      console.log('❌ Modal form not found!');
      throw new Error(formInfo.error);
    }

    // Fill the form using form-aware method
    const filled = await page.evaluate(({ testName, testPhone }) => {
      const forms = Array.from(document.querySelectorAll('form'));
      if (forms.length === 0) return { success: false, error: 'No form' };

      const form = forms[forms.length - 1];
      const inputs = Array.from(form.querySelectorAll('input'));

      if (inputs.length < 3) return { success: false, error: `Only ${inputs.length} inputs` };

      // Fill: firstName, lastName, phone
      inputs[0].value = 'John';
      inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));

      inputs[1].value = testName;
      inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));

      inputs[2].value = testPhone;
      inputs[2].dispatchEvent(new Event('change', { bubbles: true }));
      inputs[2].dispatchEvent(new Event('input', { bubbles: true }));

      return {
        success: true,
        filled: [
          inputs[0].value,
          inputs[1].value,
          inputs[2].value
        ]
      };
    }, { testName, testPhone });

    console.log(`Form fill result:`, JSON.stringify(filled));

    // Click submit button in the form
    console.log('\n[STEP 6] Submitting form...');
    await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      if (forms.length === 0) return;

      const form = forms[forms.length - 1];
      const submitBtn = form.querySelector('button[type="submit"]');

      console.log(`Found submit button: ${!!submitBtn}`);
      console.log(`Submit button text: ${submitBtn?.textContent}`);

      if (submitBtn) {
        submitBtn.click();
      }
    });

    // Wait for response
    console.log('\n[STEP 7] Waiting for API response...');
    await page.waitForTimeout(2000);

    // Check API calls
    console.log(`\nAPI Calls (since form submit):`);
    if (apiCalls.length === 0) {
      console.log('  ❌ NO API CALLS');
    } else {
      apiCalls.forEach((call, i) => {
        console.log(`  ${i + 1}. ${call.method} ${call.url.split('?')[0]}`);
        console.log(`     Status: ${call.status}`);
      });
    }

    // Check final state
    console.log('\n[STEP 8] Checking final state...');
    const finalInfo = await page.evaluate(() => {
      const memberRows = Array.from(document.querySelectorAll('table tbody tr'));
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        memberCount: countMatch ? parseInt(countMatch[1]) : 0,
        membersOnPage: memberRows.length
      };
    });

    console.log(`Final: ${finalInfo.memberCount} total members (${finalInfo.membersOnPage} on page)`);

    // Result
    console.log('\n[STEP 9] RESULT:');
    const countIncreased = finalInfo.memberCount > initialInfo.memberCount;
    const hasApiCall = apiCalls.filter(c => c.method === 'POST').length > 0;

    console.log(`Member count increased: ${countIncreased ? '✅ YES' : '❌ NO'}`);
    console.log(`POST API call made: ${hasApiCall ? '✅ YES' : '❌ NO'}`);

    if (hasApiCall && !countIncreased) {
      console.log('\n🟡 API was called but member not saved - check backend logs');
    } else if (!hasApiCall) {
      console.log('\n🔴 CRITICAL: No API call - form submission failed');
    } else {
      console.log('\n🟢 SUCCESS: Member added!');
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

debugAddMember();
