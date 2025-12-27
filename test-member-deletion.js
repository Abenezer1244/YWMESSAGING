const { chromium } = require('playwright');

async function testMemberDeletion() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const networkLog = [];
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      networkLog.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method(),
      });
    }
  });

  try {
    console.log('\n=== STEP 1: LOGIN ===');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in');

    // Get the access token from cookies
    const cookies = await page.context().cookies();
    const accessTokenCookie = cookies.find(c => c.name === 'accessToken');
    console.log(`Access token (first 50 chars): ${accessTokenCookie.value.substring(0, 50)}...`);

    console.log('\n=== STEP 2: NAVIGATE TO MEMBERS PAGE ===');
    await page.goto('https://koinoniasms.com/dashboard/members', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Members page loaded');

    // Wait for members to load
    await page.waitForTimeout(2000);

    console.log('\n=== STEP 3: GET MEMBER COUNT FROM PAGE ===');
    const memberCountText = await page.evaluate(() => {
      // Look for member count in UI
      const text = document.body.innerText;
      const countMatch = text.match(/\d+\s*(members?|Members?)/);
      return countMatch ? countMatch[0] : 'Count not found';
    });
    console.log(`Member count on page: ${memberCountText}`);

    // Get actual members from page
    const membersList = await page.evaluate(() => {
      const rows = document.querySelectorAll('[data-testid*="member-row"], tr');
      const members = [];
      rows.forEach((row, i) => {
        const text = row.innerText;
        if (text && !text.includes('Name') && !text.includes('Phone')) {
          members.push(text.substring(0, 100)); // First 100 chars
        }
      });
      return members;
    });
    console.log(`Members on page (${membersList.length} found):`);
    membersList.slice(0, 3).forEach(m => console.log(`  - ${m}`));

    if (membersList.length === 0) {
      console.log('⚠️  No members found on page, checking API directly...');

      console.log('\n=== STEP 4: CALL API DIRECTLY ===');
      const groupId = await page.evaluate(() => {
        // Try to get groupId from URL or page context
        const url = window.location.href;
        return url.includes('groupId') ? url.split('groupId=')[1].split('&')[0] : null;
      });

      console.log(`GroupId: ${groupId}`);

      if (groupId) {
        const response = await page.evaluate(async (gid) => {
          const res = await fetch(`/api/groups/${gid}/members?page=1&limit=50`);
          return {
            status: res.status,
            data: await res.json()
          };
        }, groupId);

        console.log(`API Response status: ${response.status}`);
        if (response.status === 200) {
          console.log(`Members returned: ${response.data.data ? response.data.data.length : 0}`);
          console.log(`First member: ${response.data.data && response.data.data[0] ? JSON.stringify(response.data.data[0]).substring(0, 100) : 'None'}`);
        } else {
          console.log(`API Error: ${JSON.stringify(response.data).substring(0, 200)}`);
        }
      }
    }

    console.log('\n=== STEP 5: CHECK NETWORK LOG ===');
    const apiCalls = networkLog.filter(log => log.url.includes('/members'));
    console.log(`Members API calls (${apiCalls.length}):`);
    apiCalls.forEach(call => {
      console.log(`  ${call.method} ${call.url.substring(call.url.lastIndexOf('/'))} - Status: ${call.status}`);
    });

    console.log('\n=== DIAGNOSIS ===');
    const unauthorized401s = networkLog.filter(log => log.status === 401);
    if (unauthorized401s.length > 0) {
      console.log(`❌ Found ${unauthorized401s.length} 401 Unauthorized errors`);
      console.log('This is the token revocation bug - fresh tokens are marked as revoked');
    } else {
      console.log('✅ No 401 errors - authentication is working');
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

testMemberDeletion();
