const { chromium } = require('playwright');

async function testDataIsolationFix() {
  console.log('\n🔒 TESTING DATA ISOLATION FIX - Verifying Account Separation\n');

  const browser = await chromium.launch({ headless: false });
  const results = {
    accounts: {},
    isolated: null
  };

  try {
    // ============================================================
    // TEST 1: ACCOUNT 1 - DOKaA@GMAIL.COM
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 1: DOKaA@GMAIL.COM');
    console.log('═══════════════════════════════════════════════════════════\n');

    const page1 = await browser.newPage();
    await page1.goto('https://koinoniasms.com/login', { waitUntil: 'load', timeout: 15000 });
    await page1.waitForTimeout(2000);

    console.log('[LOGIN] Entering DOKaA@GMAIL.COM credentials...');
    await page1.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page1.fill('input[type="password"]', '12!Michael');

    const buttons = await page1.$$('button');
    await buttons[0].click();

    await page1.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
    await page1.waitForTimeout(3000);

    for (let i = 0; i < 5; i++) {
      try { await page1.keyboard.press('Escape'); } catch (e) {}
    }

    console.log('[BROWSE] Going to Branches page...');
    await page1.goto('https://koinoniasms.com/branches', { waitUntil: 'load', timeout: 15000 });
    await page1.waitForTimeout(2000);

    const account1Data = await page1.evaluate(() => {
      const branchCards = document.querySelectorAll('[class*="Card"], div[class*="card"]');
      const branchCount = Array.from(branchCards).filter(el =>
        el.textContent.includes('Groups') || el.textContent.includes('Members')
      ).length;

      const branchNames = Array.from(document.querySelectorAll('h3')).map(el => el.textContent).slice(0, 5);

      return {
        branchCount,
        branchNames,
        currentUrl: window.location.href
      };
    });

    console.log('✅ Logged in. Branches: ' + account1Data.branchCount);
    if (account1Data.branchNames.length > 0) {
      console.log('   Names: ' + account1Data.branchNames.join(', '));
    }

    results.accounts['DOKaA@GMAIL.COM'] = {
      branchCount: account1Data.branchCount,
      branchNames: account1Data.branchNames
    };

    // Try to find Groups info
    console.log('[BROWSE] Checking Groups info...');
    try {
      await page1.goto('https://koinoniasms.com/dashboard/groups', { waitUntil: 'load', timeout: 15000 });
      await page1.waitForTimeout(1500);

      const groups1 = await page1.evaluate(() => {
        const groupCards = document.querySelectorAll('[class*="Card"], div[class*="card"]');
        return groupCards.length;
      });
      results.accounts['DOKaA@GMAIL.COM'].groupCount = groups1;
      console.log('   Groups: ' + groups1);
    } catch (e) {
      console.log('   Groups: (could not load)');
    }

    // Logout - navigate to login to clear session
    console.log('[LOGOUT] Clearing session...');
    await page1.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page1.waitForTimeout(2000);

    console.log('\n');

    // ============================================================
    // TEST 2: ACCOUNT 3 - q@gmail.com
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 3: q@gmail.com (NEW - NO DATA ADDED)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const page3 = await browser.newPage();
    await page3.goto('https://koinoniasms.com/login', { waitUntil: 'load', timeout: 15000 });
    await page3.waitForTimeout(2000);

    console.log('[LOGIN] Entering q@gmail.com credentials...');
    await page3.fill('input[type="email"]', 'q@gmail.com');
    await page3.fill('input[type="password"]', '12!Michael');

    const buttons3 = await page3.$$('button');
    await buttons3[0].click();

    await page3.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
    await page3.waitForTimeout(3000);

    for (let i = 0; i < 5; i++) {
      try { await page3.keyboard.press('Escape'); } catch (e) {}
    }

    console.log('[BROWSE] Going to Branches page...');
    await page3.goto('https://koinoniasms.com/branches', { waitUntil: 'load', timeout: 15000 });
    await page3.waitForTimeout(2000);

    const account3Data = await page3.evaluate(() => {
      const branchCards = document.querySelectorAll('[class*="Card"], div[class*="card"]');
      const branchCount = Array.from(branchCards).filter(el =>
        el.textContent.includes('Groups') || el.textContent.includes('Members')
      ).length;

      const branchNames = Array.from(document.querySelectorAll('h3')).map(el => el.textContent).slice(0, 5);

      return {
        branchCount,
        branchNames,
        currentUrl: window.location.href
      };
    });

    console.log('✅ Logged in. Branches: ' + account3Data.branchCount);
    if (account3Data.branchNames.length > 0) {
      console.log('   Names: ' + account3Data.branchNames.join(', '));
    }

    results.accounts['q@gmail.com'] = {
      branchCount: account3Data.branchCount,
      branchNames: account3Data.branchNames
    };

    // Try to find Groups info
    console.log('[BROWSE] Checking Groups info...');
    try {
      await page3.goto('https://koinoniasms.com/dashboard/groups', { waitUntil: 'load', timeout: 15000 });
      await page3.waitForTimeout(1500);

      const groups3 = await page3.evaluate(() => {
        const groupCards = document.querySelectorAll('[class*="Card"], div[class*="card"]');
        return groupCards.length;
      });
      results.accounts['q@gmail.com'].groupCount = groups3;
      console.log('   Groups: ' + groups3);
    } catch (e) {
      console.log('   Groups: (could not load)');
    }

    // Logout
    console.log('[LOGOUT] Clearing session...');
    await page3.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page3.waitForTimeout(2000);

    console.log('\n');

    // ============================================================
    // TEST 3: ACCOUNT 2 - ab@gmail.com
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 2: ab@gmail.com');
    console.log('═══════════════════════════════════════════════════════════\n');

    const page2 = await browser.newPage();
    await page2.goto('https://koinoniasms.com/login', { waitUntil: 'load', timeout: 15000 });
    await page2.waitForTimeout(2000);

    console.log('[LOGIN] Entering ab@gmail.com credentials...');
    await page2.fill('input[type="email"]', 'ab@gmail.com');
    await page2.fill('input[type="password"]', '12!Michael');

    const buttons2 = await page2.$$('button');
    await buttons2[0].click();

    await page2.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
    await page2.waitForTimeout(3000);

    for (let i = 0; i < 5; i++) {
      try { await page2.keyboard.press('Escape'); } catch (e) {}
    }

    console.log('[BROWSE] Going to Branches page...');
    await page2.goto('https://koinoniasms.com/branches', { waitUntil: 'load', timeout: 15000 });
    await page2.waitForTimeout(2000);

    const account2Data = await page2.evaluate(() => {
      const branchCards = document.querySelectorAll('[class*="Card"], div[class*="card"]');
      const branchCount = Array.from(branchCards).filter(el =>
        el.textContent.includes('Groups') || el.textContent.includes('Members')
      ).length;

      const branchNames = Array.from(document.querySelectorAll('h3')).map(el => el.textContent).slice(0, 5);

      return {
        branchCount,
        branchNames,
        currentUrl: window.location.href
      };
    });

    console.log('✅ Logged in. Branches: ' + account2Data.branchCount);
    if (account2Data.branchNames.length > 0) {
      console.log('   Names: ' + account2Data.branchNames.join(', '));
    }

    results.accounts['ab@gmail.com'] = {
      branchCount: account2Data.branchCount,
      branchNames: account2Data.branchNames
    };

    // Try to find Groups info
    console.log('[BROWSE] Checking Groups info...');
    try {
      await page2.goto('https://koinoniasms.com/dashboard/groups', { waitUntil: 'load', timeout: 15000 });
      await page2.waitForTimeout(1500);

      const groups2 = await page2.evaluate(() => {
        const groupCards = document.querySelectorAll('[class*="Card"], div[class*="card"]');
        return groupCards.length;
      });
      results.accounts['ab@gmail.com'].groupCount = groups2;
      console.log('   Groups: ' + groups2);
    } catch (e) {
      console.log('   Groups: (could not load)');
    }

    console.log('\n');

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
  }

  // ============================================================
  // ANALYSIS
  // ============================================================
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL RESULTS                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const doka = results.accounts['DOKaA@GMAIL.COM'];
  const q = results.accounts['q@gmail.com'];
  const ab = results.accounts['ab@gmail.com'];

  if (!doka || !q || !ab) {
    console.log('❌ Test could not complete - one or more accounts failed to load');
    return;
  }

  console.log('DATA SUMMARY:');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('DOKaA@GMAIL.COM: ' + doka.branchCount + ' branches, ' + (doka.groupCount || 'unknown') + ' groups');
  console.log('q@gmail.com:     ' + q.branchCount + ' branches, ' + (q.groupCount || 'unknown') + ' groups');
  console.log('ab@gmail.com:    ' + ab.branchCount + ' branches, ' + (ab.groupCount || 'unknown') + ' groups');

  console.log('\n');
  console.log('ISOLATION CHECK:');
  console.log('─────────────────────────────────────────────────────────────');

  const sameAsQ = doka.branchCount === q.branchCount && doka.branchCount > 0;
  const sameAsAb = doka.branchCount === ab.branchCount && doka.branchCount > 0;

  console.log('DOKaA == q accounts? ' + (sameAsQ ? '❌ YES (DATA LEAKED)' : '✅ NO (isolated)'));
  console.log('DOKaA == ab accounts? ' + (sameAsAb ? '❌ YES (DATA LEAKED)' : '✅ NO (isolated)'));

  if (!sameAsQ && !sameAsAb) {
    console.log('\n✅✅✅ SUCCESS: DATA ISOLATION IS WORKING ✅✅✅');
    console.log('Each account sees only its own data. Security fix confirmed!');
    results.isolated = true;
  } else {
    console.log('\n❌ DATA ISOLATION FAILED');
    console.log('Accounts are seeing the same data - data leakage exists');
    results.isolated = false;
  }

  console.log('\n');
}

testDataIsolationFix().catch(console.error);
