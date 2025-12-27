const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n✅ SIMPLE FINAL TEST\n');

    // Login
    await page.request.post('https://api.koinoniasms.com/api/auth/login', {
      data: {
        email: 'DOKaA@GMAIL.COM',
        password: '12!Michael'
      }
    });

    await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Close modals
    for (let i = 0; i < 5; i++) {
      try { await page.press('body', 'Escape'); } catch (e) {}
      await page.waitForTimeout(100);
    }

    // Go to Members
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Create member
    const ts = Date.now();
    const firstName = 'NEW' + ts.toString().slice(-6);
    const lastName = 'MEM' + ts.toString().slice(-4);

    console.log('Adding member: ' + firstName + ' ' + lastName);

    // Add member
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', '+15558888888');
    await page.click('button[type="submit"]:has-text("Add Member")');

    // Wait for modal to close and refetch
    await page.waitForTimeout(2500);

    // Get all members
    const members = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('table tbody tr')).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 1) {
          return cells[0].textContent.trim();
        }
        return '';
      });
    });

    console.log('\nTable now has ' + members.length + ' members');
    console.log('First member: ' + members[0]);
    console.log('Looking for: ' + firstName);
    const found = members.some(m => m.startsWith(firstName));
    console.log('\nResult: ' + (found ? '✅ FOUND' : '❌ NOT FOUND'));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

simpleTest();
