const { chromium } = require('playwright');
const https = require('https');

async function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'https://api.koinoniasms.com');
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, success: res.statusCode >= 200 && res.statusCode < 300 });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, success: false });
        }
      });
    });

    req.on('timeout', () => { req.abort(); reject({ error: 'Request timeout' }); });
    req.on('error', (err) => { reject({ error: err.message }); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function realDeleteTest() {
  console.log('\n🎯 REAL GROUP DELETE TEST\n');
  console.log('📋 ACCOUNT: michaelbeki99@gmail.com\n');

  let token = null;
  let churchId = null;
  let branchId = null;
  let groupsToTest = [];

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Track all network activity
  const apiResponses = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      apiResponses.push({
        method: response.request().method(),
        status: response.status(),
        url: url.split('/api/').pop(),
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });

  try {
    // Step 1: Get API token and list groups
    console.log('📍 STEP 1: Setup - Get token and find groups\n');

    console.log('  1.1 - Login to API');
    const loginResp = await apiRequest('POST', '/api/auth/login', {
      email: 'michaelbeki99@gmail.com',
      password: '12!Michael'
    });

    if (!loginResp.success) {
      console.log('  ❌ API Login failed');
      return;
    }

    token = loginResp.data?.data?.accessToken;
    churchId = loginResp.data?.data?.church?.id;
    console.log('  ✅ API Login successful\n');

    console.log('  1.2 - Get branches');
    const branchesResp = await apiRequest('GET', `/api/branches/churches/${churchId}/branches`, null, token);
    if (!branchesResp.success || !branchesResp.data?.data?.[0]) {
      console.log('  ❌ No branches found');
      return;
    }
    branchId = branchesResp.data.data[0].id;
    console.log(`  ✅ Found branch: ${branchId}\n`);

    console.log('  1.3 - Get existing groups to delete');
    const groupsResp = await apiRequest('GET', `/api/groups/branches/${branchId}/groups`, null, token);
    if (!groupsResp.success || !groupsResp.data?.data?.length) {
      console.log('  ⚠️  No existing groups found, creating test groups\n');

      // Create 2 test groups
      console.log('  1.4 - Creating test groups for deletion');
      for (let i = 1; i <= 2; i++) {
        const createResp = await apiRequest('POST', `/api/groups/branches/${branchId}/groups`, {
          name: `DeleteTest_${Date.now()}_${i}`
        }, token);
        if (createResp.success) {
          groupsToTest.push({
            id: createResp.data?.data?.id,
            name: createResp.data?.data?.name
          });
          console.log(`    Created group ${i}: ${createResp.data?.data?.name}`);
        }
      }
      console.log();
    } else {
      // Use existing groups
      groupsToTest = groupsResp.data.data.slice(0, 2).map(g => ({
        id: g.id,
        name: g.name
      }));
      console.log(`  ✅ Found ${groupsToTest.length} existing groups to delete`);
      groupsToTest.forEach((g, i) => {
        console.log(`    ${i + 1}. ${g.name} (${g.id.substring(0, 8)}...)`);
      });
      console.log();
    }

    // Step 2: Browser login
    console.log('📍 STEP 2: Browser Login\n');

    console.log('  2.1 - Navigate to login');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    console.log('  ✅ Login page loaded\n');

    console.log('  2.2 - Enter credentials and sign in');
    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('  ✅ Signed in\n');

    // Step 3: Navigate to Groups
    console.log('📍 STEP 3: Navigate to Groups\n');

    console.log('  3.1 - Navigate to groups page');
    await page.goto(`https://koinoniasms.com/dashboard/branches/${branchId}/groups`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('  ✅ Groups page loaded\n');

    // Step 4: Delete groups
    console.log(`📍 STEP 4: Delete ${groupsToTest.length} Groups\n`);

    for (let i = 0; i < Math.min(2, groupsToTest.length); i++) {
      const group = groupsToTest[i];
      console.log(`  4.${i + 1} - Delete "${group.name}"\n`);

      // Look for delete button for this group
      const groupName = group.name;
      const groupCard = page.locator(`text=${groupName}`).first();
      const cardExists = await groupCard.isVisible({ timeout: 5000 }).catch(() => false);

      if (!cardExists) {
        console.log(`    ⚠️  Group card not found on page\n`);
        continue;
      }

      console.log(`    ✅ Group card found`);

      // Find delete button within card (look for trash icon button near the group name)
      const deleteBtn = page.locator('button svg[class*="trash"], button svg[class*="Trash"]').first();
      const deleteBtnExists = await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false);

      if (deleteBtnExists) {
        console.log(`    ✅ Delete button found`);

        // Click delete
        await deleteBtn.click();
        await page.waitForTimeout(500);
        console.log(`    ✅ Delete button clicked`);

        // Look for confirmation dialog
        const confirmDialog = page.locator('text=Delete Group').first();
        const confirmExists = await confirmDialog.isVisible({ timeout: 5000 }).catch(() => false);

        if (confirmExists) {
          console.log(`    ✅ Confirmation dialog appeared`);

          // Click confirm
          const confirmBtn = page.locator('button').filter({ hasText: /Delete|delete|Yes|yes|OK|ok/i }).last();
          await confirmBtn.click();
          console.log(`    ✅ Confirmed deletion`);

          // Wait for response
          await page.waitForTimeout(2000);

          // Check for success or error message
          const successMsg = page.locator('[role="alert"], [class*="toast"]').filter({ hasText: /success|deleted|removed/i }).first();
          const errorMsg = page.locator('[role="alert"], [class*="toast"]').filter({ hasText: /error|failed|denied|forbidden|access/i }).first();

          const successExists = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
          const errorExists = await errorMsg.isVisible({ timeout: 5000 }).catch(() => false);

          if (successExists) {
            const text = await successMsg.textContent();
            console.log(`    ✅ SUCCESS: ${text}\n`);
          } else if (errorExists) {
            const text = await errorMsg.textContent();
            console.log(`    ❌ ERROR: ${text}\n`);
          } else {
            console.log(`    ℹ️  No message visible after deletion\n`);
          }

          // Take screenshot
          await page.screenshot({ path: `delete_test_${i + 1}.png`, fullPage: true });
          console.log(`    📸 Screenshot: delete_test_${i + 1}.png\n`);

        } else {
          console.log(`    ⚠️  Confirmation dialog did not appear\n`);
        }
      } else {
        console.log(`    ❌ Delete button not found\n`);
      }
    }

    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`   Groups tested: ${Math.min(2, groupsToTest.length)}`);
    console.log(`   Account: michaelbeki99@gmail.com`);
    console.log(`   Church: ${churchId}`);
    console.log(`   Branch: ${branchId}`);
    console.log(`\n   API calls made: ${apiResponses.length}`);

    const errors = apiResponses.filter(r => r.status >= 400);
    if (errors.length > 0) {
      console.log(`   Errors during test: ${errors.length}`);
      errors.forEach(err => {
        console.log(`     [${err.status}] ${err.method} ${err.url}`);
      });
    } else {
      console.log(`   No API errors during test ✅`);
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('\n✅ Test Complete\n');
  }
}

realDeleteTest();
