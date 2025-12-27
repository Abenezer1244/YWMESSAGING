const { chromium } = require('playwright');

async function honestMemberTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  HONEST TEST: Do Manually Added Members Actually Appear?        ║');
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

    // Go to Members page
    console.log('\n[STEP 2] Going to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get current state
    const getBefore = async () => {
      return await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return {
          tableRows: rows.length,
          members: rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            return {
              firstName: cells[0]?.textContent?.trim() || '',
              phone: cells[1]?.textContent?.trim() || ''
            };
          })
        };
      });
    };

    const before = await getBefore();
    console.log(`\nBEFORE: ${before.tableRows} members in table`);
    if (before.members.length > 0) {
      console.log('Current members:');
      before.members.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.firstName} (${m.phone})`);
      });
    }

    // Add a member
    console.log('\n[STEP 3] Adding a new member...');
    const timestamp = Date.now();
    const testName = `RealTest${timestamp.toString().slice(-5)}`;
    const testPhone = `555${String(timestamp).slice(-7)}`;

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    // Fill form
    await page.fill('input[name="firstName"]', 'Real');
    await page.fill('input[name="lastName"]', testName);
    await page.fill('input[name="phone"]', testPhone);

    console.log(`Form filled: Real ${testName} ${testPhone}`);

    // Submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      if (btn) btn.click();
    });

    console.log('✅ Form submitted, waiting for update...');

    // Wait for page to refresh
    await page.waitForTimeout(5000);

    // Check final state
    const after = await getBefore();
    console.log(`\nAFTER: ${after.tableRows} members in table`);
    if (after.members.length > 0) {
      console.log('Updated members list:');
      after.members.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.firstName} (${m.phone})`);
      });
    }

    // Look for the new member
    const newMemberFound = after.members.some(m =>
      m.firstName === 'Real' || m.firstName.includes(testName)
    );

    console.log('\n' + '='.repeat(65));
    console.log('RESULT:');
    console.log('='.repeat(65));
    console.log(`Members before: ${before.tableRows}`);
    console.log(`Members after:  ${after.tableRows}`);
    console.log(`Increased:      ${after.tableRows > before.tableRows ? '✅ YES' : '❌ NO'}`);
    console.log(`New member visible: ${newMemberFound ? '✅ YES' : '❌ NO'}`);

    if (after.tableRows > before.tableRows && newMemberFound) {
      console.log('\n🟢 ✅ FIX CONFIRMED: Members are being added and appearing!');
    } else if (after.tableRows > before.tableRows) {
      console.log('\n🟡 PARTIAL: Count increased but new member not found');
    } else if (newMemberFound) {
      console.log('\n🟡 PARTIAL: New member visible but count unchanged (cache issue?)');
    } else {
      console.log('\n❌ FAILED: Member addition not working');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

honestMemberTest();
