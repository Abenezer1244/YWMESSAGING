const axios = require('axios');
const { chromium } = require('@playwright/test');

const API_URL = 'https://api.koinoniasms.com';

function log(msg) {
  console.log(`[SMALL-IMPORT] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Register
    log('Registering new account...');
    const email = `test${Date.now()}@smallimport.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Small');
    await page.fill('input[name="lastName"]', 'Import');
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
      { name: `BranchSmall${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    const branchId = branchRes.data?.data?.id;

    // Create group
    const groupRes = await axios.post(
      `${API_URL}/api/groups/branches/${branchId}/groups`,
      { name: `GroupSmall${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const groupId = groupRes.data?.data?.id;

    log(`✅ Setup complete`);

    // Import only 10 members (small test)
    log('Creating CSV with 10 members...');
    let csvContent = 'firstName,lastName,phone\n';
    for (let i = 1; i <= 10; i++) {
      csvContent += `Member${i},Test${i},+1200000${String(i).padStart(4, '0')}\n`;
    }

    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', Buffer.from(csvContent), { filename: 'test.csv' });

    log('Calling import endpoint with 10 members (timeout: 60s)...');
    const importStart = Date.now();
    const importRes = await axios.post(
      `${API_URL}/api/groups/${groupId}/members/import`,
      form,
      {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
        timeout: 60000,
      }
    );
    const importTime = Date.now() - importStart;
    const importData = importRes.data?.data || {};

    log(`✅ Import completed in ${importTime}ms`);
    log(`   Imported: ${importData.imported}, Failed: ${importData.failed}`);

    // Check count
    const listRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    const count = listRes.data?.data?.length || 0;
    log(`✅ Final member count: ${count}`);

    if (count === 10) {
      log('\n✅ SUCCESS: Small import works!');
      process.exit(0);
    } else {
      log(`\n❌ FAIL: Expected 10 members, got ${count}`);
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
