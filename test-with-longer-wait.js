const { chromium } = require('playwright');

async function testWithLongerWait() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Test: Member Addition with Extended Wait (20 seconds)       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

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

    // Go to Members
    console.log('[NAVIGATE] Going to Members...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get initial state
    const getState = async () => {
      return await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr')).length;
        const memberNames = Array.from(document.querySelectorAll('table tbody tr')).map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return cells[0]?.textContent?.trim() || '';
        });
        return { rows, memberNames };
      });
    };

    const before = await getState();
    console.log(`[BEFORE] ${before.rows} members: ${before.memberNames.join(', ')}\n`);

    // Add member
    console.log('[ADD] Adding new member...');
    const timestamp = Date.now();
    const firstName = 'Extended';
    const lastName = `Wait${timestamp}`;
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

    // Submit
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      if (btn) btn.click();
    });

    console.log(`✅ Form submitted: ${firstName} ${lastName}\n`);

    // EXTENDED WAIT with status updates
    console.log('[WAITING] Checking for member appearance every 2 seconds (20 seconds total)...\n');

    let memberAppeared = false;
    for (let waitSec = 1; waitSec <= 10; waitSec++) {
      await page.waitForTimeout(2000);

      const current = await getState();
      const found = current.memberNames.some(name => name.includes('Extended') || name.includes('Wait'));

      console.log(`  ${waitSec * 2}s: ${current.rows} members - ${current.memberNames.join(', ')}`);

      if (found) {
        console.log(`     🟢 ✅ MEMBER FOUND!`);
        memberAppeared = true;
        break;
      }
    }

    console.log('\n' + '='.repeat(65));
    console.log('[RESULT]:');
    console.log('='.repeat(65));

    const after = await getState();
    console.log(`Members before: ${before.rows}`);
    console.log(`Members after:  ${after.rows}`);
    console.log(`Member appeared: ${memberAppeared ? '✅ YES' : '❌ NO'}`);
    console.log(`Member visible: ${after.memberNames.some(n => n.includes('Extended')) ? '✅ YES' : '❌ NO'}`);

    if (memberAppeared) {
      console.log('\n🟢 ✅ SUCCESS: Background job is working! Member appeared!');
    } else {
      console.log('\n❌ FAILED: Member did not appear even after 20 seconds');
      console.log('This suggests the background job is still failing silently');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testWithLongerWait();
