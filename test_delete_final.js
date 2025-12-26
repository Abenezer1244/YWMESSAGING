const { chromium } = require('playwright');

async function testDeleteFinal() {
  console.log('\n🎯 REAL TEST: DELETE GROUPS - FINAL\n');
  console.log('Account: michaelbeki99@gmail.com\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let deletedCount = 0;

  try {
    // Login
    console.log('📍 Step 1: Login');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in\n');

    // Navigate to Groups
    console.log('📍 Step 2: Navigate to Groups');
    const groupsBtn = page.locator('a, button, div[role="button"]').filter({ hasText: /^Groups$/ }).first();
    await groupsBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ On Groups page\n');

    // Get initial group count
    const initialGroups = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
      return cards.length;
    });
    console.log(`Found ${initialGroups} groups\n`);

    // Delete first group
    console.log('📍 Step 3: Delete First Group\n');

    // Find all trash buttons - look for buttons with SVG trash icons or pink delete buttons
    const trashButtons = page.locator('button svg[class*="trash"], button svg[class*="Trash"], button[style*="background"], button:has(svg)').filter({ hasText: '' });
    let trashCount = await trashButtons.count();
    console.log(`Found ${trashCount} trash/icon buttons\n`);

    // Alternative: Find the pink delete buttons
    const pinkButtons = page.locator('button[style*="rgb"], button[class*="danger"], button[aria-label*="delete"], button[title*="delete"]');
    const pinkCount = await pinkButtons.count();
    console.log(`Found ${pinkCount} pink/danger buttons\n`);

    // Try clicking the first button that looks like a delete button (based on position/styling)
    // Get all group cards and find their delete buttons
    const groupCards = page.locator('[class*="card"], [class*="Card"]');
    const groupCount = await groupCards.count();
    console.log(`Group cards found: ${groupCount}\n`);

    if (groupCount > 0) {
      // Get the first group card
      const firstCard = groupCards.first();

      // Find the delete button within or near the card
      const deleteWithinCard = firstCard.locator('button').last(); // Usually delete is the last button in a card
      const deleteWithinText = await deleteWithinCard.textContent().catch(() => '');
      console.log(`First card's last button: "${deleteWithinText}"`);

      // Actually, let's find buttons by their styling - pink/danger buttons
      const allButtons = page.locator('button');
      const btnCount = await allButtons.count();

      console.log(`Total buttons on page: ${btnCount}\n`);

      // Find trash/delete buttons - look for all buttons and check for trash SVG
      for (let i = 0; i < Math.min(btnCount, 30); i++) {
        const btn = allButtons.nth(i);
        const svg = btn.locator('svg');
        const svgCount = await svg.count();
        const title = await btn.getAttribute('title').catch(() => null);
        const ariaLabel = await btn.getAttribute('aria-label').catch(() => null);
        const color = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);

        if (svgCount > 0 || title?.toLowerCase().includes('delete') || ariaLabel?.toLowerCase().includes('delete') || color.includes('255, ')) {
          console.log(`Button ${i}: SVG=${svgCount}, title="${title}", aria="${ariaLabel}", color="${color}"`);
        }
      }

      // Find the pink delete buttons more directly - they should have specific styling
      const deleteButtons = page.locator('button').filter({
        has: page.locator('svg[class*="Trash"], svg[class*="trash"]')
      });

      const deleteCount = await deleteButtons.count();
      console.log(`\n✅ Found ${deleteCount} delete buttons with trash icons\n`);

      if (deleteCount > 0) {
        // Delete first group
        console.log('📍 Deleting first group\n');
        const firstDeleteBtn = deleteButtons.first();

        console.log('🖱️  Clicking delete button...');
        await firstDeleteBtn.click();
        await page.waitForTimeout(1000);

        // Look for confirmation dialog
        const confirmBtn = page.locator('button').filter({ hasText: /Delete|delete|Confirm|Yes/i }).last();
        const confirmExists = await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false);

        if (confirmExists) {
          console.log('✅ Confirmation dialog found');
          const confirmText = await confirmBtn.textContent();
          console.log(`Clicking: "${confirmText}"`);
          await confirmBtn.click();
          await page.waitForTimeout(2000);
          deletedCount++;

          // Check for message
          const msg = await page.locator('[role="alert"], [class*="toast"]').first().textContent().catch(() => null);
          if (msg) {
            console.log(`✅ Result: ${msg}\n`);
          }
        } else {
          console.log('⚠️  No confirmation dialog\n');
        }

        // Take screenshot
        await page.screenshot({ path: 'delete_result_1.png', fullPage: true });

        // Delete second group
        const remainingDelete = await deleteButtons.count();
        if (remainingDelete > 0) {
          console.log('📍 Deleting second group\n');
          const secondDeleteBtn = deleteButtons.first();

          console.log('🖱️  Clicking delete button...');
          await secondDeleteBtn.click();
          await page.waitForTimeout(1000);

          const confirmBtn2 = page.locator('button').filter({ hasText: /Delete|delete|Confirm|Yes/i }).last();
          const confirmExists2 = await confirmBtn2.isVisible({ timeout: 5000 }).catch(() => false);

          if (confirmExists2) {
            console.log('✅ Confirmation dialog found');
            await confirmBtn2.click();
            await page.waitForTimeout(2000);
            deletedCount++;

            const msg2 = await page.locator('[role="alert"], [class*="toast"]').first().textContent().catch(() => null);
            if (msg2) {
              console.log(`✅ Result: ${msg2}\n`);
            }
          }

          await page.screenshot({ path: 'delete_result_2.png', fullPage: true });
        }
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Groups deleted: ${deletedCount}`);
    console.log(`📸 Screenshots saved: delete_result_1.png, delete_result_2.png\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

testDeleteFinal();
