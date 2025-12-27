const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function verifyMembersVisible() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║            VERIFY MEMBERS ARE VISIBLE IN UI                    ║');
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

    // Navigate to Members
    console.log('\n[STEP 2] Navigating to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Close phone number modal
    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(1000);

    // Take screenshot
    console.log('[STEP 3] Taking screenshot of Members page...');
    await page.screenshot({ path: '/tmp/members_page.png' });
    console.log('✅ Screenshot saved to /tmp/members_page.png');

    // Get page content
    console.log('\n[STEP 4] Members page content:');
    const content = await page.evaluate(() => {
      return {
        title: document.querySelector('h1')?.textContent || 'N/A',
        memberCount: document.body.innerText.match(/(\d+)\s*members?/i)?.[1] || '0',
        tableRows: Array.from(document.querySelectorAll('tr')).length,
        memberItems: Array.from(document.querySelectorAll('[data-testid*="member"], .member-item')).length,
        allButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.length > 0 && t.length < 50),
        hasAddMemberBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Member')),
        text: document.body.innerText.substring(0, 500)
      };
    });

    console.log('Title:', content.title);
    console.log('Member count in text:', content.memberCount);
    console.log('Table rows found:', content.tableRows);
    console.log('Member items found:', content.memberItems);
    console.log('Has Add Member button:', content.hasAddMemberBtn);
    console.log('\nButtons on page:');
    content.allButtons.forEach(btn => console.log(`  - ${btn}`));
    console.log('\nPage text (first 500 chars):');
    console.log(content.text);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

verifyMembersVisible();
