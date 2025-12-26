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

async function testDeleteBug() {
  console.log('\n🐛 TEST: Group Deletion Bug Reproduction\n');

  let token = null;
  let churchId = null;
  let branchId = null;
  let testGroupId = null;

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Step 1: Get API setup (token, church, branch)
    console.log('📍 STEP 1: API Setup\n');

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

    console.log('  1.3 - Get existing groups');
    const groupsResp = await apiRequest('GET', `/api/groups/branches/${branchId}/groups`, null, token);
    if (!groupsResp.success || !groupsResp.data?.data?.length) {
      console.log('  ⚠️  No groups found');
      return;
    }
    testGroupId = groupsResp.data.data[0].id;
    const testGroupName = groupsResp.data.data[0].name;
    console.log(`  ✅ Found group to test: "${testGroupName}"\n`);

    // Step 2: Browser login
    console.log('📍 STEP 2: Browser Login\n');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('  ✅ Browser login successful\n');

    // Step 3: Navigate to groups page
    console.log('📍 STEP 3: Navigate to Groups Page\n');
    await page.goto(`https://koinoniasms.com/dashboard/branches/${branchId}/groups`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('  ✅ Groups page loaded\n');

    // Step 4: GET initial group count (before delete)
    console.log('📍 STEP 4: Get Initial Group Count\n');
    const initialGroupsResp = await apiRequest('GET', `/api/groups/branches/${branchId}/groups`, null, token);
    const initialCount = initialGroupsResp.data?.data?.length || 0;
    console.log(`  Groups in database BEFORE delete: ${initialCount}\n`);

    // Step 5: Click delete button via UI
    console.log(`📍 STEP 5: Click Delete Button for "${testGroupName}"\n`);
    const deleteButtons = page.locator('button').filter({
      has: page.locator('svg[class*="Trash"], svg[class*="trash"]')
    });
    const deleteCount = await deleteButtons.count();
    console.log(`  Found ${deleteCount} delete buttons`);

    if (deleteCount > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(500);
      console.log('  ✅ Delete button clicked\n');

      // Step 6: Handle confirmation dialog
      console.log('📍 STEP 6: Handle Confirmation Dialog\n');
      const confirmBtn = page.locator('button').filter({ hasText: /Delete|delete/i }).last();
      const confirmExists = await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false);

      if (confirmExists) {
        console.log('  ✅ Confirmation dialog found');
        await confirmBtn.click();
        await page.waitForTimeout(2000);
        console.log('  ✅ Confirmed deletion\n');

        // Check for success message
        const successMsg = page.locator('[role="alert"], [class*="toast"]').filter({ hasText: /success|deleted/i }).first();
        const successExists = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);

        if (successExists) {
          const msg = await successMsg.textContent();
          console.log(`  ✅ Success message: "${msg}"\n`);
        } else {
          console.log('  ⚠️  No success message visible\n');
        }

        // Take screenshot
        await page.screenshot({ path: 'bug_after_delete_ui.png', fullPage: true });
        console.log('  📸 Screenshot: bug_after_delete_ui.png\n');
      }
    }

    // Step 7: Check database immediately after delete
    console.log('📍 STEP 7: Check Database After Delete (via API)\n');
    const afterDeleteResp = await apiRequest('GET', `/api/groups/branches/${branchId}/groups`, null, token);
    const afterCount = afterDeleteResp.data?.data?.length || 0;
    console.log(`  Groups in database AFTER delete: ${afterCount}`);

    if (afterCount === initialCount) {
      console.log(`  ⚠️  BUG CONFIRMED: Count didn't change! (${initialCount} → ${afterCount})\n`);
    } else if (afterCount === initialCount - 1) {
      console.log(`  ✅ Count changed correctly (${initialCount} → ${afterCount})\n`);
    }

    // Check if group still exists
    const stillExists = afterDeleteResp.data?.data?.some(g => g.id === testGroupId);
    console.log(`  Group still in database: ${stillExists ? '❌ YES' : '✅ NO'}\n`);

    // Step 8: Try to delete same group again via API
    console.log('📍 STEP 8: Try to Delete Same Group Again (via API)\n');
    const secondDeleteResp = await apiRequest('DELETE', `/api/groups/${testGroupId}`, null, token);
    console.log(`  API Response: ${secondDeleteResp.status} ${secondDeleteResp.data?.error || 'OK'}\n`);

    if (secondDeleteResp.status === 403) {
      console.log('  ⚠️  Got 403 "Access denied" - but group still exists in DB!\n');
    } else if (secondDeleteResp.status === 404) {
      console.log('  ✅ Got 404 - group was properly deleted\n');
    } else if (secondDeleteResp.status === 200) {
      console.log('  ⚠️  Got 200 - group deleted successfully on second try\n');
    }

    // Step 9: Refresh page and check UI
    console.log('📍 STEP 9: Refresh UI and Check Groups List\n');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const finalGroupsCount = await page.evaluate(() => {
      return document.querySelectorAll('[class*="card"], [class*="Card"]').length;
    });

    console.log(`  Groups visible in UI: ${finalGroupsCount}\n`);

    // Take final screenshot
    await page.screenshot({ path: 'bug_final_state.png', fullPage: true });
    console.log('  📸 Screenshot: bug_final_state.png\n');

    // Summary
    console.log('📊 BUG ANALYSIS:');
    console.log(`  Initial count: ${initialCount}`);
    console.log(`  After delete (API): ${afterCount}`);
    console.log(`  Group still exists: ${stillExists}`);
    console.log(`  Second delete response: ${secondDeleteResp.status}`);
    console.log(`  UI groups after refresh: ${finalGroupsCount}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await context.close();
    await browser.close();
    console.log('\n✅ Test Complete\n');
  }
}

testDeleteBug();
