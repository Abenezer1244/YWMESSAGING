/**
 * DEBUG: Focused branch creation test
 */
const { chromium } = require('@playwright/test');
const axios = require('axios');

const API_URL = 'https://api.koinoniasms.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  console.log(`[DEBUG] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Step 1: Register new account
    log('STEP 1: Register account');
    const email = `test${Date.now()}@branch-debug.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Branch');
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
    if (!token) {
      throw new Error('Could not retrieve auth token after registration');
    }
    log(`Account created: ${email}, Token length: ${token.length}`);

    // Step 2: Get church info
    log('STEP 2: Get church info');
    const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    const churchId = profileRes.data?.data?.church?.id;
    log(`Church ID: ${churchId}`);

    if (!churchId) {
      throw new Error('No church ID in profile');
    }

    // Step 3: Try branch creation with longer timeout
    log('STEP 3: Create branch (with 30s timeout)');
    const startTime = Date.now();
    try {
      const branchRes = await axios.post(
        `${API_URL}/api/branches/churches/${churchId}/branches`,
        { name: `TestBranch${Date.now()}` },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000, // 30 seconds
        }
      );
      const elapsed = Date.now() - startTime;
      log(`✅ Branch created in ${elapsed}ms: ${branchRes.data?.data?.id}`);
    } catch (error) {
      const elapsed = Date.now() - startTime;
      log(`❌ Failed after ${elapsed}ms: ${error.message}`);
      if (error.response?.data) {
        log(`Response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }

  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
  } finally {
    await browser.close();
  }
}

test().catch(console.error);
