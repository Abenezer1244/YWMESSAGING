const axios = require('axios');
const { chromium } = require('@playwright/test');

const API_URL = 'https://api.koinoniasms.com';

function log(msg) {
  console.log(`[PHASE5-ISOLATED] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Register
    log('Registering new account...');
    const email = `test${Date.now()}@phase5isolated.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Phase5');
    await page.fill('input[name="lastName"]', 'Isolated');
    await page.fill('input[name="churchName"]', `Church${Date.now()}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));

    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!token) token = await page.evaluate(() => sessionStorage.getItem('accessToken'));
    if (!token) {
      const cookies = await page.context().cookies();
      const tc = cookies.find(c => c.name === 'accessToken' || c.name === 'token');
      token = tc?.value;
    }
    if (!token) throw new Error('No token');

    log(`✅ Account created: ${email}`);

    // Setup
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

    log(`✅ Setup complete: group=${groupId}`);

    // Import 100 members
    log('Creating and importing 100 members...');
    let csvContent = 'firstName,lastName,phone\n';
    for (let i = 1; i <= 100; i++) {
      csvContent += `Member${i},Test${i},+1300000${String(i).padStart(4, '0')}\n`;
    }

    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', Buffer.from(csvContent), { filename: 'test.csv' });

    const importRes = await axios.post(
      `${API_URL}/api/groups/${groupId}/members/import`,
      form,
      {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
        timeout: 300000,
      }
    );
    const importData = importRes.data?.data || {};
    log(`✅ Imported: ${importData.imported}, Failed: ${importData.failed}`);

    // Get member list to verify
    log('Fetching member list after import...');
    const listRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const membersBefore = listRes.data?.data || [];
    const countBefore = membersBefore.length;
    log(`Members before deletion: ${countBefore}`);

    if (countBefore === 0) {
      log('❌ No members to delete!');
      process.exit(1);
    }

    // Delete first member
    const firstMember = membersBefore[0];
    const memberId = firstMember.id;
    log(`Deleting member: ${firstMember.firstName} ${firstMember.lastName} (ID: ${memberId})`);

    const deleteRes = await axios.delete(
      `${API_URL}/api/groups/${groupId}/members/${memberId}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    log(`✅ Delete response: ${deleteRes.status}`);

    // Check count immediately
    log('Checking member count immediately after delete (NO WAIT)...');
    const afterImmediateRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const countImmediate = afterImmediateRes.data?.data?.length || 0;
    log(`Members immediately after delete: ${countImmediate}`);

    // Check count after 500ms
    log('Waiting 500ms and checking again...');
    await new Promise(r => setTimeout(r, 500));
    const after500Res = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const count500 = after500Res.data?.data?.length || 0;
    log(`Members after 500ms: ${count500}`);

    // Verification
    log('\n🔍 VERIFICATION:');
    log(`Before: ${countBefore}, After: ${countImmediate}, Expected: ${countBefore - 1}`);

    if (countImmediate === countBefore - 1) {
      log('✅ PASS: Deletion works immediately!');
      process.exit(0);
    } else if (count500 === countBefore - 1) {
      log('⚠️ PARTIAL: Took 500ms to reflect');
      process.exit(1);
    } else {
      log('❌ FAIL: Deletion not reflected');
      log(`Details: First member was: ${JSON.stringify(firstMember)}`);
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
