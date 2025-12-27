const { chromium } = require('playwright');

async function checkUIData() {
  console.log('\n🔍 REAL DATA CHECK - WHAT USERS ACTUALLY SEE IN UI\n');

  const browser = await chromium.launch({ headless: false });
  const results = [];

  try {
    // ============================================================
    // ACCOUNT 1: DOKaA@GMAIL.COM
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 1: DOKaA@GMAIL.COM');
    console.log('═══════════════════════════════════════════════════════════\n');

    const page1 = await browser.newPage();
    await page1.goto('https://koinoniasms.com/login', { waitUntil: 'load', timeout: 15000 });
    await page1.waitForTimeout(2000);

    try {
      await page1.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
      await page1.fill('input[type="password"]', '12!Michael');

      const buttons = await page1.$$('button');
      await buttons[0].click();

      await page1.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
      await page1.waitForTimeout(3000);

      for (let i = 0; i < 5; i++) {
        try { await page1.keyboard.press('Escape'); } catch (e) {}
      }

      console.log('[SUCCESS] Logged in');

      const data1 = await page1.evaluate(() => {
        const groups = document.querySelectorAll('[class*="Card"], div[class*="card"], li, [class*="group"]');
        const groupTexts = Array.from(groups)
          .map(g => g.innerText?.trim())
          .filter(t => t && t.length > 20)
          .slice(0, 3);

        return {
          url: window.location.href,
          groupCount: groups.length,
          visibleText: groupTexts
        };
      });

      console.log('URL:', data1.url);
      console.log('Groups/items visible:', data1.groupCount);
      if (data1.visibleText.length > 0) {
        console.log('First group preview:', data1.visibleText[0].substring(0, 80));
      }

      results.push({
        account: 'DOKaA@GMAIL.COM',
        data: data1
      });
    } catch (e) {
      console.log('Error with account 1:', e.message);
    }

    console.log('\n');

    // ============================================================
    // ACCOUNT 2: ab@gmail.com
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 2: ab@gmail.com');
    console.log('═══════════════════════════════════════════════════════════\n');

    const page2 = await browser.newPage();
    await page2.goto('https://koinoniasms.com/login', { waitUntil: 'load', timeout: 15000 });
    await page2.waitForTimeout(2000);

    try {
      await page2.fill('input[type="email"]', 'ab@gmail.com');
      await page2.fill('input[type="password"]', '12!Michael');

      const buttons2 = await page2.$$('button');
      await buttons2[0].click();

      await page2.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
      await page2.waitForTimeout(3000);

      for (let i = 0; i < 5; i++) {
        try { await page2.keyboard.press('Escape'); } catch (e) {}
      }

      console.log('[SUCCESS] Logged in');

      const data2 = await page2.evaluate(() => {
        const groups = document.querySelectorAll('[class*="Card"], div[class*="card"], li, [class*="group"]');
        const groupTexts = Array.from(groups)
          .map(g => g.innerText?.trim())
          .filter(t => t && t.length > 20)
          .slice(0, 3);

        return {
          url: window.location.href,
          groupCount: groups.length,
          visibleText: groupTexts
        };
      });

      console.log('URL:', data2.url);
      console.log('Groups/items visible:', data2.groupCount);
      if (data2.visibleText.length > 0) {
        console.log('First group preview:', data2.visibleText[0].substring(0, 80));
      }

      results.push({
        account: 'ab@gmail.com',
        data: data2
      });
    } catch (e) {
      console.log('Error with account 2:', e.message);
    }

    console.log('\n');

    // ============================================================
    // ACCOUNT 3: q@gmail.com (NEW)
    // ============================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 3: q@gmail.com (NEW - NO DATA ADDED)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const page3 = await browser.newPage();
    await page3.goto('https://koinoniasms.com/login', { waitUntil: 'load', timeout: 15000 });
    await page3.waitForTimeout(2000);

    try {
      await page3.fill('input[type="email"]', 'q@gmail.com');
      await page3.fill('input[type="password"]', '12!Michael');

      const buttons3 = await page3.$$('button');
      await buttons3[0].click();

      await page3.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
      await page3.waitForTimeout(3000);

      for (let i = 0; i < 5; i++) {
        try { await page3.keyboard.press('Escape'); } catch (e) {}
      }

      console.log('[SUCCESS] Logged in');

      const data3 = await page3.evaluate(() => {
        const groups = document.querySelectorAll('[class*="Card"], div[class*="card"], li, [class*="group"]');
        const groupTexts = Array.from(groups)
          .map(g => g.innerText?.trim())
          .filter(t => t && t.length > 20)
          .slice(0, 3);

        return {
          url: window.location.href,
          groupCount: groups.length,
          visibleText: groupTexts
        };
      });

      console.log('URL:', data3.url);
      console.log('Groups/items visible:', data3.groupCount);
      if (data3.visibleText.length > 0) {
        console.log('First group preview:', data3.visibleText[0].substring(0, 80));
      }

      results.push({
        account: 'q@gmail.com',
        data: data3
      });
    } catch (e) {
      console.log('Error with account 3:', e.message);
    }

  } catch (error) {
    console.log('ERROR:', error.message);
  } finally {
    await browser.close();
  }

  // ============================================================
  // COMPARISON
  // ============================================================
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('COMPARISON');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (results.length === 3) {
    console.log('Account 1 (DOKaA): ' + results[0].data.groupCount + ' items visible');
    console.log('Account 2 (ab): ' + results[1].data.groupCount + ' items visible');
    console.log('Account 3 (q - NEW): ' + results[2].data.groupCount + ' items visible');

    const allSame = results[0].data.groupCount === results[1].data.groupCount &&
                   results[1].data.groupCount === results[2].data.groupCount;

    console.log('\n' + (allSame ? '❌ ALL SAME - DATA LEAKAGE!' : '✅ DIFFERENT - ISOLATED'));

    if (results[2].data.groupCount > 0) {
      console.log('\n⚠️ CRITICAL: New account q@gmail.com sees ' + results[2].data.groupCount + ' items');
      console.log('This account had NO data added but is seeing data from other accounts!');
    }
  }

  console.log('\n');
}

checkUIData().catch(console.error);
