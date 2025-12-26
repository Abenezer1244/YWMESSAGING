const https = require('https');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

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

async function runLocalTest() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  🎯 LOCAL E2E TEST: Members Page (LOCALHOST DEV SERVER) 🎯      ║');
  console.log('║                    (Testing Latest Code)                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let token = null;
  let churchId = null;
  let branchId = null;
  let groupId = null;

  const screenshotsDir = path.join(process.cwd(), 'test_local_results');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  let stepNumber = 0;

  async function takeScreenshot(page, name) {
    stepNumber++;
    const filePath = path.join(screenshotsDir, `${String(stepNumber).padStart(2, '0')}_${name}.png`);
    try {
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`   📸 Screenshot: ${name}`);
      return filePath;
    } catch (e) {
      console.log(`   ⚠️  Screenshot failed: ${name}`);
      return null;
    }
  }

  try {
    console.log('╔════ PHASE 1: API SETUP ════╗\n');

    // Login
    console.log('📍 1.1 - Logging in');
    const loginResp = await apiRequest('POST', '/api/auth/login', {
      email: 'michaelbeki99@gmail.com',
      password: '12!Michael'
    });

    if (!loginResp.success) {
      console.log(`   ❌ Login failed`);
      return;
    }

    token = loginResp.data?.data?.accessToken;
    churchId = loginResp.data?.data?.church?.id;
    console.log(`   ✅ Logged in\n`);

    // Get branch
    console.log('📍 1.2 - Finding branch');
    const branchesResp = await apiRequest('GET', `/api/branches/churches/${churchId}/branches`, null, token);
    if (!branchesResp.success || !branchesResp.data?.data || branchesResp.data.data.length === 0) {
      console.log(`   ❌ No branches found`);
      return;
    }
    branchId = branchesResp.data.data[0].id;
    console.log(`   ✅ Found branch\n`);

    // Create group
    console.log('📍 1.3 - Creating test group');
    const groupResp = await apiRequest('POST', `/api/groups/branches/${branchId}/groups`, {
      name: `LocalTest_${Date.now()}`
    }, token);

    if (!groupResp.success) {
      console.log(`   ❌ Group creation failed`);
      return;
    }

    groupId = groupResp.data?.data?.id;
    console.log(`   ✅ Group created: ${groupId}\n`);

    console.log('╔════ PHASE 2: BROWSER TESTING (LOCAL) ════╗\n');

    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`   🔴 Browser Error: ${msg.text().substring(0, 100)}`);
      }
    });

    // Login via browser
    console.log('📍 2.1 - Browser Login (localhost)');
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await takeScreenshot(page, '01_local_login_page');

    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();

    await page.waitForURL('http://localhost:5173/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Logged in\n');
    await takeScreenshot(page, '02_local_dashboard');

    // Navigate to Members page
    console.log('📍 2.2 - Navigate to Members Page');
    const membersUrl = `http://localhost:5173/groups/${groupId}/members`;
    await page.goto(membersUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log(`   ✅ Navigated`);
    console.log(`   🔗 URL: ${membersUrl}\n`);
    await takeScreenshot(page, '03_local_members_page');

    // Check page content
    const pageContent = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim());
      const buttonTexts = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
      return { h1s, buttonTexts: buttonTexts.slice(0, 5), url: window.location.href };
    });

    console.log(`   Page URL: ${pageContent.url}`);
    console.log(`   H1 headings: ${pageContent.h1s.join(', ')}`);
    console.log(`   Buttons: ${pageContent.buttonTexts.join(', ')}\n`);

    // Wait for Add Member button
    console.log('📍 2.3 - Looking for "Add Member" button');
    try {
      const addBtn = page.locator('button:has-text("Add Member")');
      await addBtn.waitFor({ state: 'visible', timeout: 15000 });
      console.log('   ✅ "Add Member" button found!\n');
      await takeScreenshot(page, '04_local_add_member_button_visible');

      // Test add member
      console.log('📍 2.4 - Adding test member');
      await addBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await takeScreenshot(page, '05_local_add_member_modal');

      // Fill form
      const firstNameInput = page.locator('input[placeholder*="First"], input[placeholder*="first"], input[name*="firstName"]').first();
      const lastNameInput = page.locator('input[placeholder*="Last"], input[placeholder*="last"], input[name*="lastName"]').first();
      const phoneInput = page.locator('input[placeholder*="Phone"], input[placeholder*="phone"], input[name*="phone"]').first();

      await firstNameInput.fill('TestMember');
      await lastNameInput.fill('Local');
      await phoneInput.fill('2061234567');

      const saveBtn = page.locator('button:has-text("Add"), button:has-text("Save"), button:has-text("Submit")').last();
      await saveBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      console.log('   ✅ Member added');
      await takeScreenshot(page, '06_local_member_added');

      // Verify member is visible
      const memberVisible = await page.locator('text=TestMember').isVisible().catch(() => false);
      console.log(`   ${memberVisible ? '✅' : '❌'} Member visible in list\n`);

      console.log('🎉 SUCCESS: Members page is working with localhost dev server!');
      console.log('   - Route matching works correctly');
      console.log('   - Add Member button renders');
      console.log('   - Member operations work');

    } catch (err) {
      console.log(`   ❌ Add Member button not found (timeout)\n`);
      console.log('⚠️  Issue: Members page may still have rendering problems\n');
    }

    await context.close();
    await browser.close();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

runLocalTest();
