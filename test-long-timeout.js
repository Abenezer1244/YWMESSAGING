const axios = require('axios');
const { chromium } = require('@playwright/test');

const API_URL = 'https://api.koinoniasms.com';

function log(msg) {
  console.log(`[LONG-TIMEOUT] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Register
    log('Registering new account...');
    const email = `test${Date.now()}@longtimeout.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'LongTimeout');
    await page.fill('input[name="lastName"]', 'Test');
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
      { name: `BranchLong${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    const branchId = branchRes.data?.data?.id;

    // Create group
    const groupRes = await axios.post(
      `${API_URL}/api/groups/branches/${branchId}/groups`,
      { name: `GroupLong${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const groupId = groupRes.data?.data?.id;

    log(`✅ Setup complete`);

    // Test with 30 second timeout
    log('Testing add member with 30-second timeout...');
    const startTime = Date.now();
    try {
      const memberRes = await axios.post(
        `${API_URL}/api/groups/${groupId}/members`,
        {
          firstName: 'LongTest',
          lastName: 'Member',
          phone: '+12000000001',
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
      );
      const elapsed = Date.now() - startTime;
      log(`✅ Member added successfully in ${elapsed}ms`);
      log(`   Member ID: ${memberRes.data?.data?.id}`);
      process.exit(0);
    } catch (error) {
      const elapsed = Date.now() - startTime;
      log(`❌ Failed after ${elapsed}ms: ${error.message}`);
      if (error.response?.data) {
        log(`Response: ${JSON.stringify(error.response.data)}`);
      }
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
