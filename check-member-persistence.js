// Check if member is actually saved in the database
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', async msg => {
    const type = msg.type();
    const text = msg.text();
    if (text.includes('[addMember]') || text.includes('[listMembers]') || text.includes('member')) {
      console.log(`[BROWSER ${type.toUpperCase()}]`, text);
    }
  });

  // Enable network logging
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/members')) {
      console.log(`\n[NETWORK] ${response.status()} ${response.request().method()} ${url}`);
      try {
        const body = await response.json();
        console.log('[RESPONSE]', JSON.stringify(body, null, 2));
      } catch (e) {
        // Not JSON
      }
    }
  });

  try {
    console.log('=== LOGGING IN ===');
    await page.goto('https://koinoniasms.com/login');
    await page.fill('input[type="email"]', 'mike@gmail.com');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 60000 });
    console.log('✅ Logged in\n');

    console.log('=== GOING TO MEMBERS PAGE ===');
    await page.click('text=Members');
    await page.waitForTimeout(3000);
    console.log('✅ On members page\n');

    console.log('=== ADDING MEMBER ===');
    await page.click('button:has-text("Add Member")');
    await page.waitForTimeout(1500);

    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', 'Debug');
    await page.fill('input[name="lastName"]', 'Test' + timestamp);
    await page.fill('input[name="phone"]', '202-555-0188');
    await page.fill('input[name="email"]', 'debug' + timestamp + '@test.com');

    console.log('\n=== SUBMITTING FORM ===');
    await page.click('button[type="submit"]:has-text("Add")');
    await page.waitForTimeout(5000);
    console.log('✅ Form submitted\n');

    console.log('=== RELOADING PAGE ===');
    await page.reload();
    await page.waitForTimeout(5000);
    console.log('✅ Page reloaded\n');

    console.log('=== CHECK COMPLETE ===');
    console.log('Review the network logs above to see if the member was saved to DB');

    await page.waitForTimeout(5000);
    await browser.close();
  } catch (error) {
    console.error('ERROR:', error.message);
    await browser.close();
  }
})();
