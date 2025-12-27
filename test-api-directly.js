const { chromium } = require('playwright');

async function testApiDirectly() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  let token = null;
  let groupId = null;

  // Capture authorization header from requests
  page.on('request', request => {
    const authHeader = request.headerValue('authorization');
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Test: Add Member + Check API Response                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[LOGIN] Authenticating...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in\n');

    // Wait for token to be captured
    await page.waitForTimeout(2000);

    // Close modals
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);

    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    // Go to Members
    console.log('[NAVIGATE] Going to Members...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    groupId = await page.evaluate(() => {
      const url = window.location.href;
      const match = url.match(/groups\/([^/?]+)/);
      return match ? match[1] : null;
    });

    console.log('[GROUP] ID: ' + (groupId || 'NOT FOUND'));

    if (!groupId) {
      console.error('❌ Could not extract group ID from URL');
      return;
    }

    if (!token) {
      console.error('❌ Could not capture authorization token');
      return;
    }

    console.log('✅ Token captured\n');

    // Get initial member count
    console.log('[API] Getting initial member count...');
    const initialResponse = await page.evaluate(async (groupId, token) => {
      const response = await fetch(
        `https://api.koinoniasms.com/api/groups/${groupId}/members?limit=100`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      return {
        status: response.status,
        count: data.data?.length || 0,
        members: data.data?.map(m => ({ id: m.id, firstName: m.firstName, lastName: m.lastName })) || []
      };
    }, groupId, token);

    console.log('Initial members: ' + initialResponse.count);
    if (initialResponse.members.length > 0) {
      console.log('First member: ' + JSON.stringify(initialResponse.members[0]));
    }

    // Now add a new member
    console.log('\n[FORM] Opening Add Member form...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    const uniqueId = 'APITest' + Date.now();
    const firstName = 'APITest';
    const lastName = uniqueId;
    const phone = '555' + String(Date.now()).slice(-7);

    console.log('[FILL] Filling with: ' + firstName + ' ' + lastName + ' (' + phone + ')');
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);

    // Monitor POST response
    let addResponse = null;
    page.on('response', async response => {
      if (response.url().includes('/api/groups') && response.url().includes('/members') &&
          response.request().method() === 'POST') {
        try {
          addResponse = await response.json();
        } catch (err) {
          // ignore
        }
      }
    });

    console.log('[SUBMIT] Submitting form...\n');
    const startTime = Date.now();
    await page.click('button[type="submit"]:has-text("Add Member")');
    await page.waitForTimeout(1500); // Wait for response

    const addDuration = Date.now() - startTime;
    console.log('Add member took: ' + addDuration + 'ms');
    console.log('Add response status: ' + (addResponse ? (addResponse.success ? '✅ SUCCESS' : '❌ FAILED') : '❌ NO RESPONSE'));
    const newMemberId = addResponse?.data?.id;
    console.log('New member ID: ' + (newMemberId || 'N/A'));

    // Immediate check - before any UI polling
    console.log('\n[API] Checking list members immediately after add...');
    const immediateResponse = await page.evaluate(async (groupId, token) => {
      const response = await fetch(
        `https://api.koinoniasms.com/api/groups/${groupId}/members?limit=100`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      return {
        status: response.status,
        count: data.data?.length || 0,
        members: data.data?.map(m => ({ id: m.id, firstName: m.firstName, lastName: m.lastName })) || []
      };
    }, groupId, token);

    console.log('Immediate members count: ' + immediateResponse.count);
    const newMemberInList = immediateResponse.members.find(m => m.id === newMemberId);
    console.log('New member in API response: ' + (newMemberInList ? ('✅ YES - ' + JSON.stringify(newMemberInList)) : '❌ NO'));

    if (!newMemberInList) {
      console.log('\nAll members returned by API:');
      immediateResponse.members.forEach((m, idx) => {
        console.log('  ' + (idx + 1) + '. ' + m.firstName + ' ' + m.lastName + ' (ID: ' + m.id + ')');
      });
    }

    // Wait a bit and check again
    console.log('\n[WAIT] Waiting 3 seconds and checking again...');
    await page.waitForTimeout(3000);

    const delayedResponse = await page.evaluate(async (groupId, token) => {
      const response = await fetch(
        `https://api.koinoniasms.com/api/groups/${groupId}/members?limit=100`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      return {
        status: response.status,
        count: data.data?.length || 0,
        members: data.data?.map(m => ({ id: m.id, firstName: m.firstName, lastName: m.lastName })) || []
      };
    }, groupId, token);

    console.log('Delayed members count: ' + delayedResponse.count);
    const newMemberInDelayed = delayedResponse.members.find(m => m.id === newMemberId);
    console.log('New member in delayed check: ' + (newMemberInDelayed ? '✅ YES' : '❌ NO'));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testApiDirectly();
