const { chromium } = require('playwright');

async function verifyBackgroundJob() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Verify: Background Job - Member Addition Test               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[LOGIN] Authenticating...');
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

    // Go to Members
    console.log('[NAVIGATE] Going to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Create unique identifier for this test
    const uniqueId = 'BGJob' + Date.now();
    const firstName = 'BackgroundJob';
    const lastName = uniqueId;
    const phone = '555' + String(Date.now()).slice(-7);

    // Get initial member count
    const getState = async () => {
      return await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const memberNames = rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return {
            name: cells[0]?.textContent?.trim() || '',
            phone: cells[2]?.textContent?.trim() || ''
          };
        });
        return { count: rows.length, members: memberNames };
      });
    };

    const before = await getState();
    console.log('[BEFORE] ' + before.count + ' members in database\n');

    // Add new member
    console.log('[ADD] Adding member: ' + firstName + ' ' + lastName + ' (' + phone + ')');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);

    // Fill form with unique data
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);

    // Submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      if (btn) btn.click();
    });

    console.log('✅ Form submitted\n');

    // Wait and check for the SPECIFIC new member
    console.log('[CHECKING] Polling for "' + lastName + '" to appear (max 20 seconds)...\n');

    let found = false;
    let foundAt = null;

    for (let waitSec = 1; waitSec <= 10; waitSec++) {
      await page.waitForTimeout(2000);

      const state = await getState();
      const memberFound = state.members.find(m => m.name.includes(lastName));

      console.log('  ' + (waitSec * 2) + 's: ' + state.count + ' members total');

      if (memberFound) {
        console.log('     ✅ FOUND: "' + memberFound.name + '" (' + memberFound.phone + ')');
        found = true;
        foundAt = waitSec * 2;
        break;
      }
    }

    console.log('\n' + '='.repeat(65));
    console.log('[RESULT]');
    console.log('='.repeat(65));

    const after = await getState();
    console.log('Members before: ' + before.count);
    console.log('Members after:  ' + after.count);
    console.log('Member added: ' + (after.count > before.count ? '✅ YES' : '❌ NO'));
    console.log('Member found: ' + (found ? '✅ YES (at ' + foundAt + 's)' : '❌ NO'));

    if (found && after.count > before.count) {
      console.log('\n🟢 ✅ SUCCESS: Background job is working perfectly!');
      console.log('   Member "' + lastName + '" was created and linked to group.');
    } else if (found) {
      console.log('\n⚠️ PARTIAL: Member found but count didn\'t increase');
      console.log('   (may be stale cache or count calculation issue)');
    } else {
      console.log('\n❌ FAILED: Member did not appear');
      console.log('   Background job may not be executing in production.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

verifyBackgroundJob();
