const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('\n🧪 SIMPLE PRODUCTION TEST\n');

    // Just use the REST API directly instead of UI automation
    console.log('[1] Testing API directly...\n');

    // Login
    const loginRes = await page.request.post('https://api.koinoniasms.com/api/auth/login', {
      data: {
        email: 'DOKaA@GMAIL.COM',
        password: '12!Michael'
      }
    });

    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    console.log('✅ Logged in');

    const groupId = 'cmjnzo0wq0009o29s6zrc3wt8';

    // Get initial count
    const initialList = await page.request.get(
      `https://api.koinoniasms.com/api/groups/${groupId}/members?limit=100`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const initialData = await initialList.json();
    console.log('✅ Initial members from API: ' + initialData.data.length);

    // Add a member
    const timestamp = Date.now();
    const newMemberRes = await page.request.post(
      `https://api.koinoniasms.com/api/groups/${groupId}/members`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        data: {
          firstName: 'ProdTest',
          lastName: 'Fix' + timestamp,
          phone: '+15556664444',
          optInSms: true
        }
      }
    );

    const newMemberData = await newMemberRes.json();
    const newMemberId = newMemberData.data.id;
    console.log('✅ Member added with ID: ' + newMemberId);

    // Immediate check
    const checkRes1 = await page.request.get(
      `https://api.koinoniasms.com/api/groups/${groupId}/members?limit=100`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const checkData1 = await checkRes1.json();
    const found1 = checkData1.data.some(m => m.id === newMemberId);
    console.log('✅ Immediate check: new member ' + (found1 ? 'IN' : 'NOT IN') + ' list (' + checkData1.data.length + ' total)');

    // Wait and check again
    await new Promise(r => setTimeout(r, 2000));

    const checkRes2 = await page.request.get(
      `https://api.koinoniasms.com/api/groups/${groupId}/members?limit=100`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const checkData2 = await checkRes2.json();
    const found2 = checkData2.data.some(m => m.id === newMemberId);
    console.log('✅ After 2s: new member ' + (found2 ? 'IN' : 'NOT IN') + ' list (' + checkData2.data.length + ' total)');

    console.log('\n═════════════════════════════════════════════════');
    console.log('BACKEND API STATUS: ' + (found1 ? '✅ WORKING' : '❌ FAILED'));
    console.log('═════════════════════════════════════════════════\n');

    // Now test the UI
    console.log('[2] Testing UI flow...\n');

    await page.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Check if login form exists
    const emailInput = await page.$('input[type="email"]');
    if (!emailInput) {
      console.log('⚠️  Email input not found, might already be logged in');
      await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
    } else {
      console.log('Filling login form...');
      await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
      await page.fill('input[type="password"]', '12!Michael');
      await page.click('button:has-text("Login")');
      await page.waitForNavigation({ waitUntil: 'load' });
    }

    console.log('✅ On dashboard\n');

    // Wait and close modals
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      btns.forEach(btn => {
        if (btn.textContent.includes('Next') || btn.textContent.includes('Skip')) {
          btn.click();
        }
      });
    });

    for (let i = 0; i < 3; i++) {
      try {
        await page.press('body', 'Escape');
      } catch (e) {}
      await page.waitForTimeout(200);
    }

    // Navigate to members
    console.log('Going to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    console.log('✅ On Members page\n');

    // Check table
    const tableMembers = await page.evaluate((newMemberId) => {
      const rows = document.querySelectorAll('table tbody tr');
      const names = Array.from(rows).map(r => {
        const name = r.querySelector('td')?.textContent || '';
        return name.trim();
      });

      return {
        count: rows.length,
        includes: names.some(n => n.includes('Fix')),
        names: names.slice(0, 5)
      };
    }, newMemberId);

    console.log('UI Table state:');
    console.log('  Rows: ' + tableMembers.count);
    console.log('  Has new member: ' + (tableMembers.includes ? '❓ MAYBE' : '❌ NO'));
    console.log('  First members: ' + tableMembers.names.join(' | '));

    console.log('\n═════════════════════════════════════════════════');
    console.log('FINAL VERDICT:');
    console.log('  API: ' + (found1 ? '✅ Member persists' : '❌ Member not persisting'));
    console.log('  UI: ' + (tableMembers.includes ? '✅ Member visible' : '❌ Member not visible'));
    console.log('═════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

simpleTest();
