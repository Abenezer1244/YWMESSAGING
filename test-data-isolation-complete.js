const { chromium } = require('playwright');

async function testDataIsolation() {
  console.log('\n🔒 DATA ISOLATION SECURITY TEST\n');
  
  const browser1 = await chromium.launch({ headless: true });
  const browser2 = await chromium.launch({ headless: true });
  
  const page1 = await browser1.newPage();
  const page2 = await browser2.newPage();

  try {
    // ============================================================
    // ACCOUNT 1: DOKaA@GMAIL.COM
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 1: DOKaA@GMAIL.COM');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[1] Navigating to login...');
    await page1.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    
    console.log('[2] Logging in with DOKaA@GMAIL.COM...');
    await page1.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page1.fill('input[type="password"]', '12!Michael');
    await page1.click('button:has-text("Sign In"), button:has-text("Log In")');
    
    await page1.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page1.waitForTimeout(3000);

    // Close modals
    for (let i = 0; i < 5; i++) {
      try { await page1.press('body', 'Escape'); } catch (e) {}
      await page1.waitForTimeout(100);
    }

    console.log('[3] Navigating to Groups page...');
    // Try to find and click Groups link
    await page1.click('a:has-text("Groups"), button:has-text("Groups"), [class*="menu"] a:nth-child(n):has-text("Groups")').catch(() => {
      console.log('   Could not find Groups link, trying alternative navigation...');
    });

    await page1.waitForTimeout(2000);

    const account1Data = await page1.evaluate(() => {
      const groupCards = document.querySelectorAll('[class*="Card"], div[class*="rounded"]');
      const groupTexts = Array.from(groupCards).map(card => {
        return card.textContent?.trim().substring(0, 100) || '';
      }).filter(t => t.length > 0);

      return {
        url: window.location.href,
        groupCount: groupCards.length,
        groupsFound: groupTexts.slice(0, 5),
      };
    });

    console.log('[4] Account 1 Data Collected:');
    console.log('    URL:', account1Data.url);
    console.log('    Group cards found:', account1Data.groupCount);
    console.log('    Sample groups:', account1Data.groupsFound.slice(0, 2));
    console.log('');

    // ============================================================
    // ACCOUNT 2: ab@gmail.com
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 2: ab@gmail.com (NEW ACCOUNT)');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('[1] Navigating to login...');
    await page2.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    
    console.log('[2] Logging in with ab@gmail.com...');
    await page2.fill('input[type="email"]', 'ab@gmail.com');
    await page2.fill('input[type="password"]', '12!Michael');
    await page2.click('button:has-text("Sign In"), button:has-text("Log In")');
    
    await page2.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page2.waitForTimeout(3000);

    // Close modals
    for (let i = 0; i < 5; i++) {
      try { await page2.press('body', 'Escape'); } catch (e) {}
      await page2.waitForTimeout(100);
    }

    console.log('[3] Navigating to Groups page...');
    await page2.click('a:has-text("Groups"), button:has-text("Groups"), [class*="menu"] a:nth-child(n):has-text("Groups")').catch(() => {
      console.log('   Could not find Groups link, trying alternative navigation...');
    });

    await page2.waitForTimeout(2000);

    const account2Data = await page2.evaluate(() => {
      const groupCards = document.querySelectorAll('[class*="Card"], div[class*="rounded"]');
      const groupTexts = Array.from(groupCards).map(card => {
        return card.textContent?.trim().substring(0, 100) || '';
      }).filter(t => t.length > 0);

      return {
        url: window.location.href,
        groupCount: groupCards.length,
        groupsFound: groupTexts.slice(0, 5),
      };
    });

    console.log('[4] Account 2 Data Collected:');
    console.log('    URL:', account2Data.url);
    console.log('    Group cards found:', account2Data.groupCount);
    console.log('    Sample groups:', account2Data.groupsFound.slice(0, 2));
    console.log('');

    // ============================================================
    // ANALYSIS
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DATA ISOLATION ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const isolation = account1Data.groupCount !== account2Data.groupCount ||
                     account1Data.groupsFound[0] !== account2Data.groupsFound[0];

    if (isolation) {
      console.log('✅ PASS: Accounts have DIFFERENT data - data is properly isolated');
      console.log('');
      console.log('   Account 1 groups: ' + account1Data.groupCount);
      console.log('   Account 2 groups: ' + account2Data.groupCount);
      console.log('');
      if (account2Data.groupCount === 0) {
        console.log('   ✅ Account 2 (new) has no groups - PERFECT isolation');
      } else {
        console.log('   Account 2 groups differ from Account 1 - isolation working');
      }
    } else {
      console.log('❌ FAIL: Accounts have the SAME data - DATA LEAK DETECTED!');
      console.log('');
      console.log('   Account 1 groups: ' + account1Data.groupCount);
      console.log('   Account 2 groups: ' + account2Data.groupCount);
      console.log('');
      console.log('   First account group: ' + (account1Data.groupsFound[0] || 'N/A'));
      console.log('   Second account group: ' + (account2Data.groupsFound[0] || 'N/A'));
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

    await browser1.close();
    await browser2.close();

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    await browser1.close();
    await browser2.close();
  }
}

testDataIsolation();
