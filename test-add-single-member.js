const axios = require('axios');
const { chromium } = require('@playwright/test');

const API_URL = 'https://api.koinoniasms.com';

function log(msg) {
  console.log(`[SINGLE-MEMBER] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Register
    log('Registering new account...');
    const email = `test${Date.now()}@singlemember.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Single');
    await page.fill('input[name="lastName"]', 'Member');
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

    // Get church
    const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    const churchId = profileRes.data?.data?.church?.id;

    // Create branch
    const branchRes = await axios.post(
      `${API_URL}/api/branches/churches/${churchId}/branches`,
      { name: `BranchSingle${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    const branchId = branchRes.data?.data?.id;

    // Create group
    const groupRes = await axios.post(
      `${API_URL}/api/groups/branches/${branchId}/groups`,
      { name: `GroupSingle${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const groupId = groupRes.data?.data?.id;

    log(`✅ Setup complete`);

    // Add single member via API
    log('Adding single member via API...');
    const addStart = Date.now();
    const memberRes = await axios.post(
      `${API_URL}/api/groups/${groupId}/members`,
      {
        firstName: 'TestMember',
        lastName: 'Single',
        phone: '+12000000001',
      },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const addTime = Date.now() - addStart;

    log(`✅ Member added in ${addTime}ms`);
    log(`   Member ID: ${memberRes.data?.data?.id}`);

    // Add another member
    log('Adding second member...');
    const member2Res = await axios.post(
      `${API_URL}/api/groups/${groupId}/members`,
      {
        firstName: 'TestMember',
        lastName: 'Two',
        phone: '+12000000002',
      },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );

    // List members
    log('Listing members...');
    const listRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const count = listRes.data?.data?.length || 0;
    log(`✅ Final member count: ${count}`);

    if (count === 2) {
      log('\n✅ SUCCESS: Single member add works!');
      process.exit(0);
    } else {
      log(`\n❌ FAIL: Expected 2 members, got ${count}`);
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
