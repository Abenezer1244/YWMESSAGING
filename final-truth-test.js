const { chromium } = require('playwright');

async function finalTruthTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        FINAL TEST: Is the member addition fix working?         ║');
  console.log('║   (Create fresh group, add member, check if it appears)        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Login
    console.log('[LOGIN] Starting...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in\n');

    await page.waitForTimeout(2000);

    // Close modals
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);
    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    // Go to Groups to create a new group
    console.log('[CREATE GROUP] Creating fresh group...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Groups'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const groupName = `TestGroup_${Date.now()}`;

    // Click "New Group" button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === 'New Group');
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    // Fill group form
    const groupInputs = await page.locator('input[type="text"]').all();
    if (groupInputs.length > 0) {
      await groupInputs[0].fill(groupName);
      console.log(`Group name: ${groupName}`);

      // Submit
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('Create')
        );
        if (btn) btn.click();
      });

      await page.waitForTimeout(2000);
      console.log('✅ Group created\n');
    }

    // Navigate to Members
    console.log('[NAVIGATE MEMBERS] Going to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify empty state
    const initialState = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).length;
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        rows,
        count: countMatch ? parseInt(countMatch[1]) : 0
      };
    });

    console.log(`Initial state: ${initialState.rows} rows, ${initialState.count} total members`);

    if (initialState.count > 0) {
      console.log('⚠️  Group is NOT empty! Test invalid. Using what we have...\n');
    } else {
      console.log('✅ Group is empty (fresh)\n');
    }

    // Add member
    console.log('[ADD MEMBER] Adding a member...');
    const timestamp = Date.now();
    const firstName = `FinalTest`;
    const lastName = `${timestamp}`;
    const phone = `555${String(timestamp).slice(-7)}`;

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    // Fill form
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);

    console.log(`Filled: ${firstName} ${lastName} ${phone}`);

    // Submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      if (btn) btn.click();
    });

    console.log('✅ Form submitted\n');

    // Wait and check
    console.log('[VERIFY] Waiting 5 seconds for page to update...');
    await page.waitForTimeout(5000);

    const finalState = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
      return {
        rows: rows.length,
        count: countMatch ? parseInt(countMatch[1]) : 0,
        members: rows.map(r => {
          const cells = Array.from(r.querySelectorAll('td'));
          return cells[0]?.textContent?.trim() || '';
        })
      };
    });

    console.log(`Final state: ${finalState.rows} rows, ${finalState.count} total members`);
    console.log(`Members: ${finalState.members.join(', ')}`);

    // Verdict
    console.log('\n' + '='.repeat(65));
    const increased = finalState.count > initialState.count;
    const memberFound = finalState.members.some(m => m === firstName || m.includes('FinalTest'));

    if (increased && memberFound) {
      console.log('🟢 ✅ SUCCESS: FIX IS WORKING! Members persist and appear!');
    } else if (increased) {
      console.log('🟡 PARTIAL: Count increased but member not visible in list');
    } else if (memberFound) {
      console.log('🟡 PARTIAL: Member visible but count unchanged');
    } else {
      console.log('❌ FAILED: Member was NOT added');
      console.log(`\nDetails:`);
      console.log(`- Before: ${initialState.count} members`);
      console.log(`- After: ${finalState.count} members`);
      console.log(`- Added member found: ${memberFound}`);
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

finalTruthTest();
