const axios = require('axios');

// Create axios instance with request/response interceptors
const api = axios.create({
  baseURL: 'https://api.koinoniasms.com',
  timeout: 60000, // 60 second timeout
});

// Log all requests
api.interceptors.request.use(
  (config) => {
    console.log(`📤 [${config.method.toUpperCase()}] ${config.url}`);
    if (config.headers.Authorization) {
      console.log(`   Token: ${config.headers.Authorization.substring(0, 30)}...`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Log all responses
api.interceptors.response.use(
  (response) => {
    console.log(`📥 [${response.status}] ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(`📥 [${error.response.status}] ${error.config.method.toUpperCase()} ${error.config.url}`);
    } else {
      console.log(`❌ No response: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

async function testLogout() {
  console.log('\n' + '='.repeat(70));
  console.log('🔐 LOGOUT DEBUG TEST');
  console.log('='.repeat(70) + '\n');

  const testEmail = `logout-debug-${Date.now()}@koinoniasms.com`;
  const testPassword = 'LogoutTest123!';

  try {
    // Step 1: Register
    console.log('Step 1: Register');
    const registerRes = await api.post('/api/auth/register', {
      email: testEmail,
      password: testPassword,
      firstName: 'Debug',
      lastName: 'User',
      churchName: 'Debug Church',
    });

    const { accessToken, refreshToken } = registerRes.data.data;
    console.log(`✅ Registered: ${testEmail}\n`);

    // Step 2: Test profile access before logout
    console.log('Step 2: Get profile (should work)');
    const profileBefore = await api.get('/api/admin/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`✅ Profile accessible\n`);

    // Step 3: Call logout (WITH DETAILED LOGGING)
    console.log('Step 3: Call logout endpoint');
    console.log(`🔐 Sending logout request with token...`);

    const logoutStartTime = Date.now();
    try {
      const logoutRes = await api.post(
        '/api/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 15000, // 15 second timeout for just this request
        }
      );
      const logoutTime = Date.now() - logoutStartTime;
      console.log(`✅ Logout completed in ${logoutTime}ms\n`);
    } catch (error) {
      const logoutTime = Date.now() - logoutStartTime;
      console.log(`❌ Logout failed after ${logoutTime}ms`);
      if (error.code === 'ECONNABORTED') {
        console.log(`   Timeout: Request took too long`);
      } else if (error.message) {
        console.log(`   Error: ${error.message}`);
      }
      if (error.response) {
        console.log(`   Response: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }

    // Step 4: Try profile after logout
    console.log('Step 4: Get profile (should fail with 401)');
    try {
      const profileAfter = await api.get('/api/admin/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      });

      console.log(`❌ PROBLEM: Profile still accessible after logout!`);
      console.log(`   Status: ${profileAfter.status}`);
      return false;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ Profile returns 401 - Token properly revoked\n`);
        return true;
      } else {
        console.log(`⚠️ Unexpected error: ${error.message}`);
        throw error;
      }
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testLogout().then((success) => {
  if (success) {
    console.log('='.repeat(70));
    console.log('✅ Logout working correctly!');
    console.log('='.repeat(70));
    process.exit(0);
  }
});
