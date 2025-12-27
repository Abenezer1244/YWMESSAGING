/**
 * VERIFICATION TEST: Cache Sync Fix for Member Deletion
 * This test verifies that the cache invalidation is now synchronous
 */
const { chromium } = require('@playwright/test');
const axios = require('axios');

const API_URL = 'https://api.koinoniasms.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  console.log(`[CACHE-SYNC TEST] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Step 1: Register
    log('STEP 1: Register new account');
    const email = `test${Date.now()}@cache-sync.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Cache');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', `Church${Date.now()}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await sleep(2000);

    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!token) {
      token = await page.evaluate(() => sessionStorage.getItem('accessToken'));
    }
    if (!token) {
      const cookies = await page.context().cookies();
      const tokenCookie = cookies.find(c => c.name === 'accessToken' || c.name === 'token');
      token = tokenCookie?.value;
    }
    if (!token) throw new Error('No token');
    log(`✅ Account created: ${email}`);

    // Step 2: Setup (create branch, group, add members)
    log('STEP 2: Setup (branch, group, members)');
    const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    const churchId = profileRes.data?.data?.church?.id;

    const branchRes = await axios.post(
      `${API_URL}/api/branches/churches/${churchId}/branches`,
      { name: `Branch${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    const branchId = branchRes.data?.data?.id;

    const groupRes = await axios.post(
      `${API_URL}/api/groups/branches/${branchId}/groups`,
      { name: `Group${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const groupId = groupRes.data?.data?.id;
    log(`✅ Setup complete: branch=${branchId}, group=${groupId}`);

    // Step 3: Add 5 members
    log('STEP 3: Add 5 test members');
    const memberIds = [];
    for (let i = 1; i <= 5; i++) {
      const memberRes = await axios.post(
        `${API_URL}/api/groups/${groupId}/members`,
        {
          firstName: `Member${i}`,
          lastName: `Test${i}`,
          phone: `+1200000${String(i).padStart(4, '0')}`,
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      memberIds.push(memberRes.data?.data?.id);
    }
    log(`✅ Added 5 members`);

    // Step 4: Verify count before deletion
    log('STEP 4: Get initial member count');
    const beforeRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const countBefore = beforeRes.data?.data?.length || 0;
    log(`Member count BEFORE deletion: ${countBefore}`);

    if (countBefore !== 5) {
      throw new Error(`Expected 5 members, got ${countBefore}`);
    }

    // Step 5: DELETE first member
    log('STEP 5: Delete first member');
    const deleteStartTime = Date.now();
    const deleteRes = await axios.delete(
      `${API_URL}/api/groups/${groupId}/members/${memberIds[0]}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const deleteTime = Date.now() - deleteStartTime;
    log(`✅ Delete returned status ${deleteRes.status} in ${deleteTime}ms`);

    // Step 6: CRITICAL TEST - Check count immediately (no wait)
    log('STEP 6: Get member count immediately after deletion (NO WAIT)');
    const immediateRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const countImmediate = immediateRes.data?.data?.length || 0;
    log(`Member count IMMEDIATELY after delete: ${countImmediate}`);

    // Step 7: Check count after short wait
    log('STEP 7: Wait 500ms and check count again');
    await sleep(500);
    const afterWaitRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const countAfterWait = afterWaitRes.data?.data?.length || 0;
    log(`Member count after 500ms wait: ${countAfterWait}`);

    // VERIFICATION
    log('\n🔍 CACHE SYNC FIX VERIFICATION:');
    if (countImmediate === countBefore - 1) {
      log(`✅ PASS: Cache was invalidated IMMEDIATELY`);
      log(`   Delete confirmed: ${countBefore} → ${countImmediate}`);
      log(`   This means synchronous cache invalidation IS WORKING`);
      process.exit(0); // Success
    } else if (countAfterWait === countBefore - 1) {
      log(`⚠️ PARTIAL: Cache invalidated after ${500}ms wait`);
      log(`   Delete confirmed: ${countBefore} → ${countAfterWait}`);
      log(`   This means async invalidation is still in place`);
      process.exit(1); // Partial
    } else {
      log(`❌ FAIL: Cache not invalidated even after wait`);
      log(`   Expected: ${countBefore - 1}, Got: ${countAfterWait}`);
      process.exit(1); // Failure
    }

  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    if (error.response?.data) {
      log(`Response: ${JSON.stringify(error.response.data)}`);
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
}

test().catch(err => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
