const { chromium } = require('playwright');

async function testDeleteWithAPIMonitoring() {
  console.log('\n🐛 DEBUG: Monitor Delete API Requests\n');

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const apiRequests = [];
  const apiResponses = [];

  // Monitor all API requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push({
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toLocaleTimeString()
      });
      console.log(`📤 ${request.method()} ${request.url().split('/api/').pop()}`);
    }
  });

  // Monitor all API responses
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      const statusText = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
      console.log(`${statusText} ${status} ${response.url().split('/api/').pop()}`);

      apiResponses.push({
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });

  try {
    // Login
    console.log('📍 Step 1: Login\n');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();

    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('\n✅ Logged in\n');

    // Navigate to groups
    console.log('📍 Step 2: Navigate to Groups\n');
    const groupsBtn = page.locator('a, button, div[role="button"]').filter({ hasText: /^Groups$/ }).first();
    await groupsBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('\n✅ On Groups page\n');

    // Get initial group count
    console.log('📍 Step 3: Check Initial Groups\n');
    const initialGroups = await page.evaluate(() => {
      return document.querySelectorAll('[class*="card"], [class*="Card"]').length;
    });
    console.log(`  Groups on page: ${initialGroups}\n`);

    // Clear API request/response logs
    apiRequests.length = 0;
    apiResponses.length = 0;

    // Click delete
    console.log('📍 Step 4: Delete First Group\n');
    const deleteButtons = page.locator('button').filter({
      has: page.locator('svg[class*="Trash"], svg[class*="trash"]')
    });

    if (await deleteButtons.count() > 0) {
      console.log('  Clicking delete button...\n');
      await deleteButtons.first().click();
      await page.waitForTimeout(1000);

      // Handle confirmation
      const confirmBtn = page.locator('button').filter({ hasText: /Delete|delete/i }).last();
      const confirmExists = await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false);

      if (confirmExists) {
        console.log('  Confirming deletion...\n');
        await confirmBtn.click();

        // Wait for API response
        await page.waitForTimeout(3000);

        console.log('\n📊 API CALLS DURING DELETE:\n');
        apiRequests.forEach((req, idx) => {
          const resp = apiResponses[idx];
          console.log(`  ${idx + 1}. ${req.method} ${req.url.split('/api/').pop()}`);
          if (resp) {
            console.log(`     → ${resp.status}`);
          }
        });

        // Check success message
        const successMsg = page.locator('[role="alert"], [class*="toast"]').first();
        const msgExists = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
        if (msgExists) {
          const msg = await successMsg.textContent();
          console.log(`\n✅ Message: ${msg}\n`);
        }

        // Wait a bit
        await page.waitForTimeout(2000);

        // Check final group count on page
        console.log('📍 Step 5: Check Final Groups\n');
        const finalGroups = await page.evaluate(() => {
          return document.querySelectorAll('[class*="card"], [class*="Card"]').length;
        });
        console.log(`  Groups on page before refresh: ${finalGroups}`);
        console.log(`  Change: ${initialGroups} → ${finalGroups} (${finalGroups < initialGroups ? 'DECREASED ✅' : 'SAME ❌'})\n`);

        // Refresh page manually
        console.log('📍 Step 6: Manual Refresh\n');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        const afterRefreshGroups = await page.evaluate(() => {
          return document.querySelectorAll('[class*="card"], [class*="Card"]').length;
        });
        console.log(`  Groups after refresh: ${afterRefreshGroups}\n`);

        // Take screenshot
        await page.screenshot({ path: 'debug_delete_state.png', fullPage: true });
        console.log('📸 Screenshot: debug_delete_state.png\n');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('✅ Done\n');
  }
}

testDeleteWithAPIMonitoring();
