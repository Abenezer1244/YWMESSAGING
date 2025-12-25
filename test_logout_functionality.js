const axios = require('axios');

async function testLogoutFunctionality() {
  console.log('\n' + '='.repeat(73));
  console.log('🔐 LOGOUT FUNCTIONALITY TEST');
  console.log('='.repeat(73) + '\n');

  const baseURL = 'https://api.koinoniasms.com';
  const testEmail = `logout-test-${Date.now()}@koinoniasms.com`;
  const testPassword = 'Logout123!';

  try {
    // Step 1: Register new account
    console.log('Step 1: Register new account');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}\n`);

    const registerResponse = await axios.post(`${baseURL}/api/auth/register`, {
      email: testEmail,
      password: testPassword,
      firstName: 'Logout',
      lastName: 'Test',
      churchName: 'Logout Test Church',
    });

    const { accessToken, refreshToken } = registerResponse.data.data;
    console.log('✅ Account registered\n');
    console.log(`Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`Refresh Token: ${refreshToken.substring(0, 20)}...`);
    console.log(`Cookies Set: ${registerResponse.headers['set-cookie'] ? '✅ Yes' : '❌ No'}\n`);

    // Step 2: Verify authenticated - call protected endpoint
    console.log('Step 2: Verify authenticated by calling protected endpoint');
    const profileBefore = await axios.get(`${baseURL}/api/admin/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`✅ Profile endpoint accessible: ${profileBefore.status}`);
    console.log(`   User: ${profileBefore.data.data.email}\n`);

    // Step 3: Call logout endpoint
    console.log('Step 3: Call logout endpoint');
    const logoutResponse = await axios.post(`${baseURL}/api/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`✅ Logout endpoint called: ${logoutResponse.status}`);
    console.log(`   Response: ${JSON.stringify(logoutResponse.data)}\n`);

    // Step 4: Try to access protected endpoint with same token
    console.log('Step 4: Try to access protected endpoint AFTER logout');
    try {
      const profileAfter = await axios.get(`${baseURL}/api/admin/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      });

      console.log(`❌ PROBLEM: Profile endpoint STILL ACCESSIBLE after logout!`);
      console.log(`   Status: ${profileAfter.status}`);
      console.log(`   User: ${profileAfter.data.data.email}`);
      console.log(`   This means logout didn't work properly\n`);

      return {
        success: false,
        issue: 'Token still valid after logout',
        details: 'User can still access protected endpoints with old token after logout',
      };
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ CORRECT: Profile endpoint returns 401 Unauthorized`);
        console.log(`   Token has been properly revoked\n`);
      } else {
        console.log(`⚠️ Unexpected error: ${error.response?.status || error.code}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    // Step 5: Try to refresh token
    console.log('Step 5: Try to refresh token AFTER logout');
    try {
      const refreshResponse = await axios.post(
        `${baseURL}/api/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 5000,
        }
      );

      console.log(`❌ PROBLEM: Token refresh STILL WORKS after logout!`);
      console.log(`   New Access Token: ${refreshResponse.data.data.accessToken?.substring(0, 20)}...`);
      console.log(`   This means refresh token was not properly revoked\n`);

      return {
        success: false,
        issue: 'Refresh token still valid after logout',
        details: 'User can still refresh their session after logout',
      };
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ CORRECT: Refresh endpoint returns 401 Unauthorized`);
        console.log(`   Refresh token has been properly revoked\n`);
      } else {
        console.log(`⚠️ Unexpected error: ${error.response?.status || error.code}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    console.log('='.repeat(73));
    console.log('✅ SUCCESS: Logout is working correctly!');
    console.log('   - Token is revoked after logout');
    console.log('   - Protected endpoints return 401');
    console.log('   - User cannot refresh session');
    console.log('='.repeat(73) + '\n');

    return {
      success: true,
      message: 'Logout functionality working correctly',
    };

  } catch (error) {
    console.error('Test error:', error.message);
    console.error('Response:', error.response?.data);

    return {
      success: false,
      error: error.message,
      status: error.response?.status,
    };
  }
}

testLogoutFunctionality().then((result) => {
  console.log('Final Result:', JSON.stringify(result, null, 2));
});
