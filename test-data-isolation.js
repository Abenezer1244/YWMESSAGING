const { chromium } = require('playwright');

async function testDataIsolation() {
  const browser1 = await chromium.launch({ headless: false });
  const browser2 = await chromium.launch({ headless: false });
  
  const page1 = await browser1.newPage();
  const page2 = await browser2.newPage();

  try {
    console.log('\n🔒 DATA ISOLATION TEST\n');

    // Account 1: DOKaA@GMAIL.COM
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 1: DOKaA@GMAIL.COM (12!Michael)');
    console.log('═══════════════════════════════════════════════════════════\n');

    await page1.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page1.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page1.fill('input[type="password"]', '12!Michael');
    await page1.click('button:has-text("Sign In")');
    await page1.waitForNavigation({ waitUntil: 'load' });
    await page1.waitForTimeout(2000);

    // Close modals
    for (let i = 0; i < 5; i++) {
      try { await page1.press('body', 'Escape'); } catch (e) {}
      await page1.waitForTimeout(100);
    }

    const account1Data = await page1.evaluate(() => {
      return {
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1, h2')).map(el => el.textContent?.trim()).slice(0, 3),
        groupElements: document.querySelectorAll('[class*="Card"], div[class*="rounded"]').length,
      };
    });

    console.log('Account 1 Data:');
    console.log('  URL:', account1Data.url);
    console.log('  Headings:', account1Data.headings);
    console.log('  Group/Card elements:', account1Data.groupElements);
    console.log('');

    // Account 2: ab@gmail.com
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ACCOUNT 2: ab@gmail.com (12!Michael) [NEW ACCOUNT]');
    console.log('═══════════════════════════════════════════════════════════\n');

    await page2.goto('https://koinoniasms.com/login', { waitUntil: 'load' });
    await page2.fill('input[type="email"]', 'ab@gmail.com');
    await page2.fill('input[type="password"]', '12!Michael');
    await page2.click('button:has-text("Sign In")');
    await page2.waitForNavigation({ waitUntil: 'load' });
    await page2.waitForTimeout(2000);

    // Close modals
    for (let i = 0; i < 5; i++) {
      try { await page2.press('body', 'Escape'); } catch (e) {}
      await page2.waitForTimeout(100);
    }

    const account2Data = await page2.evaluate(() => {
      return {
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1, h2')).map(el => el.textContent?.trim()).slice(0, 3),
        groupElements: document.querySelectorAll('[class*="Card"], div[class*="rounded"]').length,
      };
    });

    console.log('Account 2 Data:');
    console.log('  URL:', account2Data.url);
    console.log('  Headings:', account2Data.headings);
    console.log('  Group/Card elements:', account2Data.groupElements);
    console.log('');

    // Compare
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DATA ISOLATION ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (account1Data.groupElements === account2Data.groupElements && account1Data.groupElements > 0) {
      console.log('❌ CRITICAL: Both accounts see the SAME number of groups!');
      console.log('   Account 1 groups:', account1Data.groupElements);
      console.log('   Account 2 groups:', account2Data.groupElements);
      console.log('   This suggests data is NOT properly isolated per account\n');
    } else {
      console.log('✅ OK: Accounts see different group counts');
      console.log('   Account 1 groups:', account1Data.groupElements);
      console.log('   Account 2 groups:', account2Data.groupElements);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await browser1.close();
    await browser2.close();
  }
}

testDataIsolation();
