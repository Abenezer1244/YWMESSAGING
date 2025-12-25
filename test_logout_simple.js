const axios = require('axios');

async function testLogout() {
  console.log('\n' + '='.repeat(73));
  console.log('🔐 LOGOUT FUNCTIONALITY TEST');
  console.log('='.repeat(73) + '\n');

  const baseURL = 'https://api.koinoniasms.com';
  const testEmail = `logout-${Date.now()}@koinoniasms.com`;
  const testPassword = 'LogoutTest123!';

  try {
    // Step 1: Register
    console.log('Step 1: Register new account');
    const register = await axios.post(`${baseURL}/api/auth/register`, {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      churchName: 'Test Church',
    });

    const { accessToken, refreshToken } = register.data.data;
    console.log(`✅ Registered: ${testEmail}`);
    console.log(`   Access: ${accessToken.substring(0, 20)}...`);
    console.log(`   Refresh: ${refreshToken.substring(0, 20)}...\n`);

    // Step 2: Verify we can access profile before logout
    console.log('Step 2: Access /api/admin/profile BEFORE logout');
    const beforeLogout = await axios.get(`${baseURL}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`✅ Profile accessible (200): ${JSON.stringify(beforeLogout.data).substring(0, 50)}...\n`);

    // Step 3: Call logout
    console.log('Step 3: Call logout endpoint');
    const logoutRes = await axios.post(`${baseURL}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`✅ Logout called (${logoutRes.status})\n`);

    // Step 4: Try profile again after logout
    console.log('Step 4: Access /api/admin/profile AFTER logout');
    try {
      const afterLogout = await axios.get(`${baseURL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      });

      console.log(`❌ PROBLEM: Profile still accessible after logout!`);
      console.log(`   Status: ${afterLogout.status}`);
      console.log(`   This means the token was NOT revoked\n`);

      console.log('='.repeat(73));
      console.log('❌ BUG FOUND: Logout is not working properly');
      console.log('   User can still use their token after logout');
      console.log('='.repeat(73) + '\n');

    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ Profile returns 401 - Token properly revoked\n`);

        console.log('='.repeat(73));
        console.log('✅ Logout is working correctly');
        console.log('   Token is revoked and cannot be used');
        console.log('='.repeat(73) + '\n');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status || error.code}`);
        console.log(`   Message: ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

testLogout();
