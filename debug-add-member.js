const { chromium } = require('playwright');

async function debugAddMember() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen to all network requests and responses
  const networkLog = [];
  page.on('response', response => {
    networkLog.push({
      url: response.url(),
      status: response.status(),
      method: response.request().method(),
      postData: response.request().postData()
    });
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         DEBUG: Single Member Addition Flow                      ║');
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

    // Get initial member count
    const initialInfo = await page.evaluate(() => {
      const memberRows = Array.from(document.querySelectorAll('table tbody tr'));
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        memberCount: countMatch ? parseInt(countMatch[1]) : 0,
        membersOnPage: memberRows.length
      };
    });

    console.log(`Initial state: ${initialInfo.memberCount} total members, ${initialInfo.membersOnPage} on page 1`);

    // Click "Add Member" button
    console.log('\n[STEP 3] Clicking "Add Member" button...');
    const timestamp = Date.now();
    const testName = `TestMember${timestamp}`;
    const testPhone = `555000${timestamp.toString().slice(-4)}`;

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) {
        console.log('Found Add Member button');
        btn.click();
      }
    });

    // Wait for modal to appear
    await page.waitForTimeout(1000);
    const modalVisible = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"], .modal, div[class*="modal"]');
      return !!modal;
    });

    console.log(`Modal visible: ${modalVisible ? '✅ YES' : '❌ NO'}`);

    if (!modalVisible) {
      console.log('❌ Modal did not appear. Check page content:');
      const content = await page.evaluate(() => document.body.innerText);
      console.log(content.substring(0, 500));
      throw new Error('Modal did not appear after clicking Add Member');
    }

    // Fill form
    console.log('\n[STEP 4] Filling form with test data...');
    console.log(`Name: ${testName}, Phone: ${testPhone}`);

    await page.fill('input[type="text"]:first-of-type', 'Test', { timeout: 5000 });
    await page.fill('input[type="text"]:nth-of-type(2)', testName, { timeout: 5000 });
    await page.fill('input[type="tel"]', testPhone, { timeout: 5000 });

    const formValues = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return {
        field1: inputs[0]?.value || 'N/A',
        field2: inputs[1]?.value || 'N/A',
        field3: inputs[2]?.value || 'N/A'
      };
    });

    console.log(`Form filled: ${JSON.stringify(formValues)}`);

    // Find submit button - it might be "Add Member", "Save", "Submit", etc
    console.log('\n[STEP 5] Finding and clicking submit button...');
    const submitClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      // Look for submit button in modal
      const submitBtn = btns.find(b => {
        const text = b.textContent.toLowerCase();
        return text.includes('add') || text.includes('save') || text.includes('submit');
      });

      if (submitBtn && submitBtn.textContent.trim() !== 'Add Member') {
        console.log(`Found submit button: "${submitBtn.textContent}"`);
        submitBtn.click();
        return true;
      } else if (submitBtn) {
        console.log(`Found Add Member button in modal`);
        submitBtn.click();
        return true;
      }
      return false;
    });

    if (!submitClicked) {
      console.log('❌ Could not find submit button');
      const allButtons = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim())
      );
      console.log('Available buttons:', allButtons);
      throw new Error('Submit button not found');
    }

    console.log('✅ Form submitted');

    // Wait for response
    console.log('\n[STEP 6] Waiting for API response...');
    await page.waitForTimeout(1500);

    // Check network log for member creation API call
    const memberApiCalls = networkLog.filter(call =>
      call.url.includes('/members') && (call.method === 'POST' || call.method === 'post')
    );

    console.log(`Member API calls detected: ${memberApiCalls.length}`);
    memberApiCalls.forEach((call, i) => {
      console.log(`  Call ${i + 1}: ${call.method} ${call.url} -> Status ${call.status}`);
      if (call.postData) {
        console.log(`    Data: ${call.postData.substring(0, 100)}`);
      }
    });

    // Check for success toast
    const hasSuccessToast = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('success') || text.includes('added') || text.includes('Member added');
    });

    console.log(`Success message shown: ${hasSuccessToast ? '✅ YES' : '❌ NO'}`);

    // Wait for modal to close
    await page.waitForTimeout(1000);
    const modalStillOpen = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"], .modal, div[class*="modal"]');
      return !!modal;
    });

    console.log(`Modal closed: ${!modalStillOpen ? '✅ YES' : '❌ NO (still open)'}`);

    // Check final member count
    console.log('\n[STEP 7] Checking final member count...');
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

    console.log(`Final state: ${finalInfo.memberCount} total members, ${finalInfo.membersOnPage} on page 1`);
    console.log(`Members visible: ${finalInfo.memberNames.join(', ')}`);

    // Determine result
    console.log('\n[STEP 8] Analysis:');
    const memberCountIncreased = finalInfo.memberCount > initialInfo.memberCount;
    const newMemberVisible = finalInfo.memberNames.some(name => name.includes(testName));

    if (memberCountIncreased && newMemberVisible) {
      console.log('✅ SUCCESS: Member was added and is visible in the list!');
    } else if (memberCountIncreased && !newMemberVisible) {
      console.log('⚠️ PARTIAL: Member count increased but new member not visible');
    } else if (!memberCountIncreased && newMemberVisible) {
      console.log('⚠️ PARTIAL: New member visible but count did not increase');
    } else {
      console.log('❌ FAILURE: Member was NOT added successfully');
      console.log(`   - Count increased: ${memberCountIncreased}`);
      console.log(`   - New member visible: ${newMemberVisible}`);
    }

    // Network debugging
    console.log('\n[STEP 9] Network Activity Summary:');
    const groupApiCalls = networkLog.filter(call =>
      call.url.includes('/groups') && call.status < 400
    );
    console.log(`Group API calls: ${groupApiCalls.length}`);

    const allErrorCalls = networkLog.filter(call => call.status >= 400);
    if (allErrorCalls.length > 0) {
      console.log(`❌ Error responses detected: ${allErrorCalls.length}`);
      allErrorCalls.forEach(call => {
        console.log(`  ${call.method} ${call.url} -> ${call.status}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

debugAddMember();
