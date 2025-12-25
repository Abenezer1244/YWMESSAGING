const axios = require('axios');
const https = require('https');

async function testLogout() {
  const api = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    httpsAgent: new https.Agent({ keepAlive: false }),
    validateStatus: () => true, // Don't throw on any status
  });

  try {
    // Register
    console.log('1. Register');
    const reg = await api.post('/api/auth/register', {
      email: `test-${Date.now()}@koinoniasms.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      churchName: 'Test',
    });

    if (reg.status !== 201) {
      console.log(`❌ Register failed: ${reg.status}`);
      console.log(JSON.stringify(reg.data, null, 2));
      return;
    }

    const token = reg.data.data.accessToken;
    console.log(`✅ Registered. Token: ${token.substring(0, 30)}...\n`);

    // Test profile before logout
    console.log('2. Get profile (should be 200)');
    const profileBefore = await api.get('/api/admin/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (profileBefore.status === 401) {
      console.log(`❌ Profile returns 401 even BEFORE logout!`);
      console.log(`   Error: ${profileBefore.data.error}`);
      console.log(`   This means Redis token revocation is blocking access`);
      console.log(`   Likely cause: Redis not available in production\n`);
      return;
    }

    console.log(`✅ Profile accessible (${profileBefore.status})\n`);

    // Logout
    console.log('3. Call logout');
    const logout = await api.post(
      '/api/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`Status: ${logout.status}`);
    console.log(`Response: ${JSON.stringify(logout.data)}\n`);

    if (logout.status !== 200) {
      console.log(`⚠️ Logout returned ${logout.status}, expected 200`);
    } else {
      console.log('✅ Logout successful\n');
    }

    // Test profile after logout
    console.log('4. Get profile after logout');
    const profileAfter = await api.get('/api/admin/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`Status: ${profileAfter.status}`);
    if (profileAfter.status === 401) {
      console.log(`✅ CORRECT: Profile returns 401 after logout`);
      console.log(`   Message: ${profileAfter.data.error}`);
    } else {
      console.log(`❌ PROBLEM: Profile still works (${profileAfter.status})`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogout();
