const { chromium } = require('playwright');

async function testDelete() {
  console.log('\n🎯 DELETE GROUPS - REAL TEST V3\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Login
    console.log('📍 Login');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in\n');

    // Navigate to Groups - try different methods
    console.log('📍 Navigate to Groups\n');

    // Try method 1: Click using exact text match
    const groupsBtn = page.locator('a, button, div[role="button"]').filter({ hasText: /^Groups$/ }).first();
    const exists1 = await groupsBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (exists1) {
      console.log('✅ Found Groups button (method 1)');
      await groupsBtn.click();
    } else {
      // Try method 2: Direct URL navigation
      console.log('⏭️  Groups not found via sidebar, navigating directly');
      await page.goto('https://koinoniasms.com/dashboard/branches/cmjm2ze4i0008885ny11u1pzy/groups', { waitUntil: 'domcontentloaded' });
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test_groups_page.png', fullPage: true });
    console.log('📸 Took screenshot\n');

    // Check page content
    const content = await page.evaluate(() => {
      const all = document.body.innerText;
      const hasGroups = all.toLowerCase().includes('group');
      const hasNew = all.toLowerCase().includes('new group');
      const url = window.location.href;
      const h1s = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).slice(0, 5);

      return { hasGroups, hasNew, url, headings: h1s, text: all.substring(0, 500) };
    });

    console.log(`✅ Page loaded`);
    console.log(`   URL: ${content.url}`);
    console.log(`   Has "group" text: ${content.hasGroups}`);
    console.log(`   Headings: ${content.headings.join(', ')}\n`);

    // Find delete buttons
    console.log('📍 Looking for delete buttons\n');

    const deleteButtons = page.locator('button').filter({ hasText: /Delete|delete/i });
    const deleteCount = await deleteButtons.count();

    console.log(`Found ${deleteCount} delete buttons\n`);

    if (deleteCount > 0) {
      // Delete first group
      console.log('📍 Deleting first group\n');

      const firstBtn = deleteButtons.first();
      const btnText = await firstBtn.textContent();
      console.log(`Clicking: "${btnText}"`);

      await firstBtn.click();
      await page.waitForTimeout(1000);

      // Look for confirmation
      const confirmText = await page.locator('text=Delete').first().textContent().catch(() => null);
      console.log(`Confirmation appears: ${!!confirmText}\n`);

      if (confirmText) {
        // Find and click confirm
        const confirmBtn = page.locator('button').filter({ hasText: /Delete|delete|Confirm|yes/i }).last();
        console.log('Clicking confirm...');
        await confirmBtn.click();
        await page.waitForTimeout(2000);

        // Check result
        const resultMsg = await page.locator('[role="alert"], [class*="toast"]').first().textContent().catch(() => null);
        if (resultMsg) {
          console.log(`\n✅ RESULT: ${resultMsg}\n`);
        }

        // Take screenshot
        await page.screenshot({ path: 'test_delete_result.png', fullPage: true });
        console.log('📸 Result screenshot saved');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('\n✅ Done\n');
  }
}

testDelete();
