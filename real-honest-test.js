const { chromium } = require('playwright');

async function realTest() {
  console.log('\n🧪 REAL HONEST TEST - WHAT I ACTUALLY SEE\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const results = {};

  try {
    // ============================================================
    // TEST 1: Can we login and see the dashboard?
    // ============================================================
    console.log('TEST 1: Basic Login and Navigation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Opening login page...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'load', timeout: 10000 });
    
    const emailInput = await page.$('input[type="email"]');
    if (!emailInput) {
      console.log('❌ Login page missing email input');
      results.login = 'FAILED - No email field';
    } else {
      console.log('✅ Login page loaded');
      
      console.log('Logging in with DOKaA@GMAIL.COM...');
      await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
      await page.fill('input[type="password"]', '12!Michael');
      
      const btn = await page.$('button');
      await btn.click();
      
      await page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log('After login, URL is: ' + currentUrl);
      
      if (currentUrl.includes('dashboard') || currentUrl.includes('groups')) {
        console.log('✅ Successfully logged in and at dashboard');
        results.login = 'PASS';
      } else {
        console.log('⚠️  Login may have worked but unexpected URL');
        results.login = 'UNKNOWN URL';
      }
    }

  } catch (error) {
    console.log('❌ ERROR: ' + error.message);
    results.login = 'ERROR - ' + error.message;
  }

  console.log('\n');

  try {
    // ============================================================
    // TEST 2: API-level data isolation (the one that worked before)
    // ============================================================
    console.log('TEST 2: API Data Isolation (Cross-Account Access Block)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const axios = require('axios');

    console.log('Logging in Account 1 (DOKaA@GMAIL.COM)...');
    const login1 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'DOKaA@GMAIL.COM',
      password: '12!Michael'
    });

    const token1 = login1.data.data.accessToken;
    const churchId1 = login1.data.data.church.id;
    console.log('✅ Logged in. Church ID: ' + churchId1);

    console.log('Logging in Account 2 (ab@gmail.com)...');
    const login2 = await axios.post('https://api.koinoniasms.com/api/auth/login', {
      email: 'ab@gmail.com',
      password: '12!Michael'
    });

    const token2 = login2.data.data.accessToken;
    const churchId2 = login2.data.data.church.id;
    console.log('✅ Logged in. Church ID: ' + churchId2);

    // Get Account 2's group
    console.log('\nFinding Account 2\'s group...');
    const branchesRes = await axios.get(
      'https://api.koinoniasms.com/api/branches/churches/' + churchId2 + '/branches',
      { headers: { Authorization: 'Bearer ' + token2 } }
    );

    let testGroupId = null;
    if (branchesRes.data.data && branchesRes.data.data.length > 0) {
      const groupsRes = await axios.get(
        'https://api.koinoniasms.com/api/groups/branches/' + branchesRes.data.data[0].id + '/groups',
        { headers: { Authorization: 'Bearer ' + token2 } }
      );
      if (groupsRes.data.data && groupsRes.data.data.length > 0) {
        testGroupId = groupsRes.data.data[0].id;
      }
    }

    if (!testGroupId) {
      console.log('⚠️  Could not find test group');
      results.apiIsolation = 'SKIP - No group found';
    } else {
      console.log('✅ Found group: ' + testGroupId);

      // CRITICAL TEST: Account 1 tries to access Account 2's group
      console.log('\nAccount 1 (DOKaA) attempting to access Account 2\'s group...');
      const crossAccess = await axios.get(
        'https://api.koinoniasms.com/api/groups/' + testGroupId + '/members',
        {
          headers: { Authorization: 'Bearer ' + token1 },
          validateStatus: () => true
        }
      );

      console.log('Response status: ' + crossAccess.status);

      if (crossAccess.status === 403) {
        console.log('✅ ACCESS DENIED (403)');
        console.log('Error message: ' + crossAccess.data.error);
        console.log('\n✅✅✅ SECURITY FIX IS WORKING ✅✅✅');
        results.apiIsolation = 'PASS - 403 Forbidden';
      } else if (crossAccess.status === 200) {
        console.log('❌ ACCESS ALLOWED (200)');
        console.log('Data returned: ' + (crossAccess.data.data ? crossAccess.data.data.length + ' members' : 'N/A'));
        console.log('\n❌ SECURITY BREACH - Data leakage detected');
        results.apiIsolation = 'FAIL - 200 OK (leak)';
      } else {
        console.log('⚠️  Unexpected status: ' + crossAccess.status);
        results.apiIsolation = 'UNKNOWN status: ' + crossAccess.status;
      }
    }

  } catch (error) {
    console.log('❌ ERROR: ' + error.message);
    results.apiIsolation = 'ERROR - ' + error.message;
  }

  console.log('\n');
  await browser.close();

  // Summary
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║           FINAL TEST RESULTS                       ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log('Test 1 - Login/Dashboard:        ' + (results.login || 'NOT RUN'));
  console.log('Test 2 - API Data Isolation:     ' + (results.apiIsolation || 'NOT RUN'));

  console.log('\n');
}

realTest().catch(console.error);
