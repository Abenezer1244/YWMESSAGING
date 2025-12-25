const axios = require('axios');

async function test() {
  const api = axios.create({ baseURL: 'https://api.koinoniasms.com' });

  try {
    // Register
    const registerRes = await api.post('/api/auth/register', {
      email: `test-${Date.now()}@koinoniasms.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      churchName: 'Test Church',
    });

    const token = registerRes.data.data.accessToken;
    console.log('✅ Registered');

    // Try logout with 10-second timeout
    console.log('Trying logout with 10s timeout...');
    try {
      const logoutRes = await axios.post(
        'https://api.koinoniasms.com/api/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      console.log(`✅ Logout succeeded: ${logoutRes.status}`);
    } catch (error) {
      console.log(`❌ Logout failed: ${error.code || error.message}`);
    }
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

test();
