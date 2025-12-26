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

async function debug() {
  console.log('\n🔍 DEBUG: Checking Members Page Rendering\n');

  try {
    // Setup
    const loginResp = await apiRequest('POST', '/api/auth/login', { email: 'michaelbeki99@gmail.com', password: '12!Michael' });
    const token = loginResp.data?.data?.accessToken;
    const churchId = loginResp.data?.data?.church?.id;

    const branchesResp = await apiRequest('GET', `/api/branches/churches/${churchId}/branches`, null, token);
    const branchId = branchesResp.data.data[0].id;

    const groupsResp = await apiRequest('GET', `/api/groups/branches/${branchId}/groups`, null, token);
    let groupId = groupsResp.data.data[0]?.id;

    if (!groupId) {
      const createGroupResp = await apiRequest('POST', `/api/groups/branches/${branchId}/groups`, { name: `DEBUG_${Date.now()}` }, token);
      groupId = createGroupResp.data?.data?.id;
    }

    console.log(`✅ Setup: Group=${groupId}\n`);

    // Browser
    const browser = await chromium.launch({ headless: false, slowMo: 200 });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Collect errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`  🔴 ${msg.text().substring(0, 100)}`);
      }
    });

    // Login
    console.log('📍 Logging in...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    console.log('✅ Logged in\n');

    // Navigate to members
    console.log(`📍 Navigating to /groups/${groupId}/members`);
    const membersUrl = `https://koinoniasms.com/groups/${groupId}/members`;
    await page.goto(membersUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Page loaded\n');

    // Wait for rendering
    await page.waitForTimeout(2000);

    // Check what's actually rendered
    console.log('🔍 Checking DOM content:');
    const pageContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input');

      const h1Texts = Array.from(h1s).map(h => h.textContent?.trim());
      const h2Texts = Array.from(h2s).map(h => h.textContent?.trim());
      const buttonTexts = Array.from(buttons).map(b => b.textContent?.trim()).filter(Boolean);

      return {
        rootExists: !!root,
        rootHTML: root?.innerHTML?.substring(0, 500) || '(empty)',
        h1Count: h1s.length,
        h1Texts: h1Texts,
        h2Count: h2s.length,
        h2Texts: h2Texts,
        buttonCount: buttons.length,
        buttonTexts: buttonTexts.slice(0, 10),
        inputCount: inputs.length,
        url: window.location.href,
        title: document.title,
      };
    });

    console.log(`  Root exists: ${pageContent.rootExists}`);
    console.log(`  URL: ${pageContent.url}`);
    console.log(`  Title: ${pageContent.title}`);
    console.log(`  H1 tags: ${pageContent.h1Count} - ${pageContent.h1Texts.join(', ')}`);
    console.log(`  H2 tags: ${pageContent.h2Count} - ${pageContent.h2Texts.join(', ')}`);
    console.log(`  Button count: ${pageContent.buttonCount}`);
    console.log(`  Button texts: ${pageContent.buttonTexts.join(', ')}`);
    console.log(`  Input count: ${pageContent.inputCount}`);
    console.log(`\n📄 Root HTML preview (first 300 chars):`);
    console.log(`  ${pageContent.rootHTML.substring(0, 300)}...\n`);

    // Check for "Add Member" button specifically
    const addMemberBtn = page.locator('button:has-text("Add Member")');
    const isAddMemberVisible = await addMemberBtn.isVisible().catch(() => false);
    console.log(`  Add Member button visible: ${isAddMemberVisible ? '✅ YES' : '❌ NO'}`);

    // Check for specific text patterns
    const membersText = await page.locator('text=/Members/i').isVisible().catch(() => false);
    console.log(`  "Members" heading visible: ${membersText ? '✅ YES' : '❌ NO'}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Console errors detected: ${errors.length}`);
      errors.slice(0, 5).forEach(e => console.log(`    - ${e.substring(0, 100)}`));
    }

    await context.close();
    await browser.close();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

debug();
