const axios = require('axios');
const https = require('https');

async function testTokenRevocation() {
  const axiosInstance = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    timeout: 15000,
    httpsAgent: new https.Agent({ keepAlive: false }),
  });

  try {
    // Register
    console.log('1. Register user');
    const registerRes = await axiosInstance.post('/api/auth/register', {
      email: `token-test-${Date.now()}@koinoniasms.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      churchName: 'Test Church',
    });

    const token = registerRes.data.data.accessToken;
    console.log(`✅ Token obtained: ${token.substring(0, 40)}...`);

    // Verify token works
    console.log('\n2. Verify token works');
    const testRes = await axiosInstance.get('/api/admin/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ Token valid (200): Profile accessible\n`);

    // Check token revocation status BEFORE logout
    console.log('3. Check token revocation status BEFORE logout');
    const beforeRes = await axiosInstance.get('/api/auth/revocation-status?token=' + token.substring(0, 20), {
      validateStatus: () => true, // Don't throw on any status
    });
    console.log(`Response: ${JSON.stringify(beforeRes.data)}`);

    // Call logout
    console.log('\n4. Call logout');
    const logoutRes = await axiosInstance.post(
      '/api/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Logout: ${JSON.stringify(logoutRes.data)}\n`);

    // Wait a moment for Redis to be updated
    console.log('5. Waiting 2 seconds for Redis revocation...');
    await new Promise(r => setTimeout(r, 2000));

    // Try token again (should fail)
    console.log('\n6. Try token AFTER logout');
    const afterRes = await axiosInstance.get('/api/admin/profile', {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (afterRes.status === 401) {
      console.log(`✅ CORRECT: Token revoked (401)`);
    } else {
      console.log(`❌ PROBLEM: Token still valid (${afterRes.status})`);
      console.log(`Response: ${JSON.stringify(afterRes.data)}`);
    }

    // Check token revocation status AFTER logout
    console.log('\n7. Check token revocation status AFTER logout');
    const afterCheckRes = await axiosInstance.get('/api/auth/revocation-status?token=' + token.substring(0, 20), {
      validateStatus: () => true,
    });
    console.log(`Response: ${JSON.stringify(afterCheckRes.data)}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testTokenRevocation();
