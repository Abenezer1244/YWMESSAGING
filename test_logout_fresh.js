const axios = require('axios');
const https = require('https');

async function testLogout() {
  // Create axios with fresh HTTPS agent (no connection pooling)
  const axiosInstance = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    timeout: 15000,
    httpAgent: require('http').globalAgent,
    httpsAgent: new https.Agent({
      keepAlive: false, // Disable connection pooling
      timeout: 15000,
    }),
  });

  try {
    // Step 1: Register
    console.log('Step 1: Register');
    const registerRes = await axiosInstance.post('/api/auth/register', {
      email: `logout-test-${Date.now()}@koinoniasms.com`,
      password: 'LogoutTest123!',
      firstName: 'Test',
      lastName: 'User',
      churchName: 'Test Church',
    });

    const { accessToken } = registerRes.data.data;
    console.log('✅ Registered\n');

    // Step 2: Test profile access
    console.log('Step 2: Get profile (should work)');
    const profileRes = await axiosInstance.get('/api/admin/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`✅ Profile OK\n`);

    // Step 3: Logout
    console.log('Step 3: Call logout');
    const startTime = Date.now();
    try {
      const logoutRes = await axiosInstance.post(
        '/api/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const elapsed = Date.now() - startTime;
      console.log(`✅ Logout OK in ${elapsed}ms`);
      console.log(`Response: ${JSON.stringify(logoutRes.data)}\n`);

      // Step 4: Try profile again
      console.log('Step 4: Get profile after logout');
      try {
        await axiosInstance.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('❌ PROBLEM: Still accessible after logout');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Correctly returns 401 after logout');
        } else {
          console.log(`⚠️ Unexpected error: ${error.response?.status || error.code}`);
        }
      }
    } catch (logoutError) {
      const elapsed = Date.now() - startTime;
      console.log(`❌ Logout failed after ${elapsed}ms:`);
      console.log(`   ${logoutError.code || logoutError.message}`);
      if (logoutError.response) {
        console.log(`   Status: ${logoutError.response.status}`);
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLogout();
