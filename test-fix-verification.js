const { chromium } = require('playwright');

async function testFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║       Test: AddMember Fix Verification                         ║');
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

    // Navigate to Members
    console.log('\n[STEP 2] Navigating to Members...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get initial count
    const getInfo = async () => {
      return await page.evaluate(() => {
        const countMatch = document.body.innerText.match(/(\d+)\s*members?/i);
        const memberCount = countMatch ? parseInt(countMatch[1]) : 0;
        const tableRows = Array.from(document.querySelectorAll('table tbody tr')).length;
        const memberNames = Array.from(document.querySelectorAll('table tbody tr')).map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return cells[0]?.textContent?.trim() || 'N/A';
        });
        return { memberCount, tableRows, memberNames };
      });
    };

    const initialInfo = await getInfo();
    console.log(`Initial: ${initialInfo.memberCount} total members, ${initialInfo.tableRows} rows`);

    // Add member
    console.log('\n[STEP 3] Adding new member...');
    const timestamp = Date.now();
    const firstName = `TestJohn${timestamp.toString().slice(-4)}`;
    const lastName = `TestDoe${timestamp.toString().slice(-4)}`;
    const phone = `555${String(timestamp).slice(-7)}`;

    // Click Add Member
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

    console.log(`  ✓ Form filled: ${firstName} ${lastName} ${phone}`);

    // Submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      if (btn) btn.click();
    });

    console.log('✅ Form submitted');

    // Wait for API and page to refresh
    console.log('\n[STEP 4] Waiting for page update (5 seconds)...');
    await page.waitForTimeout(5000);

    // Check if member appears
    const finalInfo = await getInfo();
    console.log(`Final: ${finalInfo.memberCount} total members, ${finalInfo.tableRows} rows`);
    console.log(`Members: ${finalInfo.memberNames.join(', ')}`);

    // Result
    const memberFound = finalInfo.memberNames.some(name => name.includes('TestJohn'));
    const countIncreased = finalInfo.memberCount > initialInfo.memberCount;

    console.log('\n[RESULT]:');
    if (countIncreased && memberFound) {
      console.log('🟢 ✅ SUCCESS! Member was added and is visible!');
      console.log(`   Count: ${initialInfo.memberCount} → ${finalInfo.memberCount}`);
      console.log(`   Member visible: ${memberFound}`);
    } else if (countIncreased) {
      console.log('🟡 PARTIAL: Count increased but member not visible yet');
    } else if (memberFound) {
      console.log('🟡 PARTIAL: Member visible but count unchanged');
    } else {
      console.log('❌ FAILED: Member not added');
      console.log(`   Count: ${finalInfo.memberCount} (expected > ${initialInfo.memberCount})`);
      console.log(`   Member found: ${memberFound}`);
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testFix();
