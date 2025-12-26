const { chromium } = require('playwright');

async function realTestDeleteGroups() {
  console.log('\n🎯 REAL TEST: Delete Groups from UI\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('📍 STEP 1: Login\n');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in\n');

    // Step 2: Navigate to Groups
    console.log('📍 STEP 2: Navigate to Groups\n');
    const groupsLink = page.locator('text=Groups').first();
    const groupsLinkExists = await groupsLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (groupsLinkExists) {
      console.log('✅ Found Groups link in sidebar');
      await groupsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('✅ Navigated to Groups\n');
    } else {
      console.log('❌ Groups link not found\n');
      return;
    }

    // Take screenshot
    await page.screenshot({ path: 'groups_list.png', fullPage: true });
    console.log('📸 Screenshot: groups_list.png\n');

    // Step 3: Check what groups are visible
    console.log('📍 STEP 3: Check Groups on Page\n');
    const groupsInfo = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1, h2')).map(h => h.textContent?.trim());
      const groupNames = Array.from(document.querySelectorAll('h3, [class*="title"], [class*="name"]')).map(e => e.textContent?.trim()).filter(t => t && t.length > 3);
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
      const bodyText = document.body.innerText.substring(0, 1000);

      return {
        headings: h1s,
        groupNames: groupNames.slice(0, 10),
        buttons: buttons.slice(0, 25),
        text: bodyText
      };
    });

    console.log(`Headings: ${groupsInfo.headings.join(', ')}`);
    console.log(`Group names found: ${groupsInfo.groupNames.join(', ')}`);
    console.log(`Buttons: ${groupsInfo.buttons.slice(0, 15).join(', ')}\n`);
    console.log(`Page text:\n${groupsInfo.text}\n`);

    // Step 4: Find and click delete buttons
    console.log('📍 STEP 4: Find Delete Buttons\n');

    // Look for trash/delete icons
    const deleteButtons = page.locator('button svg[class*="trash"], button svg[class*="Trash"], button[title*="delete" i], button[aria-label*="delete" i]');
    const deleteCount = await deleteButtons.count();

    console.log(`Found ${deleteCount} delete buttons\n`);

    if (deleteCount > 0) {
      // Delete first group
      console.log('📍 STEP 5: Delete First Group\n');

      const firstDelete = deleteButtons.first();
      console.log('✅ Clicking first delete button');
      await firstDelete.click();
      await page.waitForTimeout(1000);

      // Take screenshot of confirmation
      await page.screenshot({ path: 'delete_confirmation.png', fullPage: true });
      console.log('📸 Screenshot: delete_confirmation.png\n');

      // Look for confirmation dialog
      const confirmDialog = page.locator('text=Delete Group, [role="dialog"], [class*="modal"]').first();
      const dialogExists = await confirmDialog.isVisible({ timeout: 5000 }).catch(() => false);

      if (dialogExists) {
        console.log('✅ Confirmation dialog found');

        // Find confirm button
        const confirmBtn = page.locator('button').filter({ hasText: /Delete|delete|Confirm|confirm|Yes|yes|OK/i }).last();
        const confirmBtnText = await confirmBtn.textContent();
        console.log(`✅ Confirm button: "${confirmBtnText}"`);

        // Get the group name being deleted (look in dialog)
        const groupNameInDialog = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          if (!dialog) return null;
          const h3 = dialog.querySelector('h3');
          return h3 ? h3.textContent : null;
        });

        if (groupNameInDialog) {
          console.log(`📌 Deleting group: "${groupNameInDialog}"\n`);
        }

        console.log('🖱️  Clicking confirm button');
        await confirmBtn.click();
        await page.waitForTimeout(2000);

        // Check for success/error message
        const successMsg = page.locator('[role="alert"], [class*="toast"]').filter({ hasText: /success|deleted|removed/i }).first();
        const errorMsg = page.locator('[role="alert"], [class*="toast"]').filter({ hasText: /error|failed|denied|forbidden|access/i }).first();

        const successExists = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
        const errorExists = await errorMsg.isVisible({ timeout: 5000 }).catch(() => false);

        if (successExists) {
          const msg = await successMsg.textContent();
          console.log(`\n✅ SUCCESS MESSAGE: "${msg}"\n`);
        } else if (errorExists) {
          const msg = await errorMsg.textContent();
          console.log(`\n❌ ERROR MESSAGE: "${msg}"\n`);
        } else {
          console.log('\nℹ️  No visible success/error message\n');
        }

        // Take final screenshot
        await page.screenshot({ path: 'delete_result.png', fullPage: true });
        console.log('📸 Screenshot: delete_result.png\n');

        // Step 6: Try to delete second group
        console.log('📍 STEP 6: Delete Second Group\n');

        const allDeleteButtons = page.locator('button svg[class*="trash"], button svg[class*="Trash"]');
        const remainingDelete = await allDeleteButtons.count();

        if (remainingDelete > 0) {
          console.log(`✅ Found ${remainingDelete} more delete buttons`);

          const secondDelete = allDeleteButtons.first();
          console.log('🖱️  Clicking second delete button');
          await secondDelete.click();
          await page.waitForTimeout(1000);

          const confirmBtn2 = page.locator('button').filter({ hasText: /Delete|delete|Confirm|confirm|Yes|yes|OK/i }).last();
          await confirmBtn2.click();
          await page.waitForTimeout(2000);

          const successMsg2 = page.locator('[role="alert"], [class*="toast"]').filter({ hasText: /success|deleted|removed/i }).first();
          const errorMsg2 = page.locator('[role="alert"], [class*="toast"]').filter({ hasText: /error|failed|denied|forbidden|access/i }).first();

          const successExists2 = await successMsg2.isVisible({ timeout: 5000 }).catch(() => false);
          const errorExists2 = await errorMsg2.isVisible({ timeout: 5000 }).catch(() => false);

          if (successExists2) {
            const msg = await successMsg2.textContent();
            console.log(`✅ SUCCESS MESSAGE: "${msg}"\n`);
          } else if (errorExists2) {
            const msg = await errorMsg2.textContent();
            console.log(`❌ ERROR MESSAGE: "${msg}"\n`);
          }

          await page.screenshot({ path: 'delete_result2.png', fullPage: true });
          console.log('📸 Screenshot: delete_result2.png\n');
        } else {
          console.log('No more groups to delete\n');
        }

      } else {
        console.log('⚠️  Confirmation dialog not found\n');
      }
    }

    console.log('✅ Test Complete\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

realTestDeleteGroups();
