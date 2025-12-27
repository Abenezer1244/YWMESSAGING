/**
 * DETAILED TEST: Phase 4 (Import 100) + Phase 5 (Delete)
 * Matches exact E2E test flow to debug the issue
 */
const { chromium } = require('@playwright/test');
const axios = require('axios');

const API_URL = 'http://localhost:5000';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  console.log(`[PHASE-4-5] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Setup
    log('Setting up account, branch, group...');
    const email = `test${Date.now()}@phase45.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Phase45');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', `Church${Date.now()}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await sleep(2000);

    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!token) token = await page.evaluate(() => sessionStorage.getItem('accessToken'));
    if (!token) {
      const cookies = await page.context().cookies();
      const tc = cookies.find(c => c.name === 'accessToken' || c.name === 'token');
      token = tc?.value;
    }
    if (!token) throw new Error('No token');

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
    log(`✅ Setup: church=${churchId.slice(0, 8)}..., branch=${branchId.slice(0, 8)}..., group=${groupId.slice(0, 8)}...`);

    // PHASE 4: Import 100 members
    log('\n═══ PHASE 4: IMPORT 100 MEMBERS ═══');
    log('[4.1] Count members before import');
    const countBeforeImport = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const beforeImport = countBeforeImport.data?.data?.length || 0;
    log(`Members before import: ${beforeImport}`);

    // Create CSV with VALID phones
    log('[4.2] Create CSV with 100 valid phone numbers');
    let csvContent = 'firstName,lastName,phone\n';
    for (let i = 1; i <= 100; i++) {
      csvContent += `Import${i},Test${i},+1300000${String(i).padStart(4, '0')}\n`;
    }
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', Buffer.from(csvContent), { filename: 'test.csv' });

    log('[4.3] Call import endpoint');
    const importStart = Date.now();
    const importRes = await axios.post(
      `${API_URL}/api/groups/${groupId}/members/import`,
      form,
      {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
        timeout: 300000,
      }
    );
    const importTime = Date.now() - importStart;
    const importData = importRes.data?.data || {};
    log(`✅ Import response: imported=${importData.imported}, failed=${importData.failed} (took ${importTime}ms)`);

    log('[4.4] Count members after import (wait 1s)');
    await sleep(1000);
    const countAfterImport = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const afterImport = countAfterImport.data?.data?.length || 0;
    log(`Members after import: ${afterImport} (expected: ${beforeImport + 100})`);

    if (afterImport !== beforeImport + 100) {
      log(`❌ WARNING: Import count mismatch! Expected ${beforeImport + 100}, got ${afterImport}`);
    }

    // PHASE 5: Delete member
    log('\n═══ PHASE 5: DELETE MEMBER ═══');
    log('[5.1] Get current member list');
    const beforeDeleteRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const membersBeforeDelete = beforeDeleteRes.data?.data || [];
    const countBefore = membersBeforeDelete.length;
    log(`Members before delete: ${countBefore}`);

    if (countBefore === 0) {
      log('❌ No members to delete!');
      process.exit(1);
    }

    const firstMember = membersBeforeDelete[0];
    const memberId = firstMember.id;
    log(`[5.2] Delete first member: ${firstMember.firstName} ${firstMember.lastName} (${firstMember.phone})`);

    log('[5.3] Call delete endpoint');
    const deleteStart = Date.now();
    const deleteRes = await axios.delete(
      `${API_URL}/api/groups/${groupId}/members/${memberId}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const deleteTime = Date.now() - deleteStart;
    log(`✅ Delete response: status=${deleteRes.status} (took ${deleteTime}ms)`);

    log('[5.4] Count members immediately after delete (NO WAIT)');
    const afterDeleteImmediateRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const countAfterImmediate = afterDeleteImmediateRes.data?.data?.length || 0;
    log(`Members after delete (immediate): ${countAfterImmediate}`);

    log('[5.5] Count members after 500ms wait');
    await sleep(500);
    const afterDelete500Res = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const countAfter500 = afterDelete500Res.data?.data?.length || 0;
    log(`Members after delete (500ms wait): ${countAfter500}`);

    // VERIFICATION
    log('\n🔍 VERIFICATION:');
    log(`Phase 4: ${beforeImport} + 100 import = ${afterImport} (${afterImport === beforeImport + 100 ? '✅' : '❌'})`);
    log(`Phase 5: ${countBefore} - 1 delete = ${countAfterImmediate} immediately (${countAfterImmediate === countBefore - 1 ? '✅' : '❌'})`);
    log(`Phase 5: ${countBefore} - 1 delete = ${countAfter500} after 500ms (${countAfter500 === countBefore - 1 ? '✅' : '❌'})`);

    if (countAfterImmediate === countBefore - 1 || countAfter500 === countBefore - 1) {
      log('\n✅ PASS: Deletion works correctly');
      process.exit(0);
    } else {
      log('\n❌ FAIL: Deletion not reflected in count');
      log(`Details: Members list before delete had ${membersBeforeDelete.length} items`);
      log(`First member was: ${firstMember}`);
      process.exit(1);
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
  log(`Fatal: ${err.message}`);
  process.exit(1);
});
