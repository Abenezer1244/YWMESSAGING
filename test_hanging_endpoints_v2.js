const axios = require('axios');

async function testHangingEndpoints() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🔍 TESTING SPECIFIC ENDPOINTS FOR HANGS');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const apiClient = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    withCredentials: true,
    timeout: 10000,
  });

  try {
    // First, register and login with a new account
    const testEmail = `hang-${Date.now()}@koinoniasms.com`;
    const testPassword = 'Hang123!';

    console.log(`Creating test account: ${testEmail}\n`);

    // Register
    const registerResponse = await apiClient.post('/api/auth/register', {
      email: testEmail,
      password: testPassword,
      firstName: 'Hang',
      lastName: 'Test',
      churchName: 'Hang Test Church',
    });

    const { admin, church, accessToken } = registerResponse.data.data;
    console.log(`✅ Account created`);
    console.log(`Church ID: ${church.id}\n`);

    // Test each potentially hanging endpoint
    const endpoints = [
      {
        name: 'Get Branches',
        method: 'GET',
        url: `/api/branches/churches/${church.id}/branches`,
      },
      {
        name: 'Get Trial Info',
        method: 'GET',
        url: `/api/billing/trial`,
      },
      {
        name: 'Get Current Phone',
        method: 'GET',
        url: `/api/numbers/current`,
      },
      {
        name: 'Get Profile',
        method: 'GET',
        url: `/api/admin/profile`,
      },
      {
        name: 'Get Summary Stats',
        method: 'GET',
        url: `/api/analytics/summary`,
      },
      {
        name: 'Get Message Stats',
        method: 'GET',
        url: `/api/analytics/messages?days=7`,
      },
    ];

    console.log('Testing Dashboard Endpoints:\n');

    for (const endpoint of endpoints) {
      const client = axios.create({
        baseURL: 'https://api.koinoniasms.com',
        withCredentials: true,
        timeout: 8000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const startTime = Date.now();
      console.log(`📤 ${endpoint.name}`);
      console.log(`   ${endpoint.method} ${endpoint.url}`);

      try {
        const response = await client.request({
          method: endpoint.method,
          url: endpoint.url,
        });
        const elapsed = Date.now() - startTime;
        console.log(`   ✅ Status ${response.status} - ${elapsed}ms\n`);
      } catch (error) {
        const elapsed = Date.now() - startTime;

        if (error.code === 'ECONNABORTED') {
          console.log(`   ⏱️  TIMEOUT after ${elapsed}ms\n`);
        } else if (error.response) {
          console.log(`   ❌ Status ${error.response.status} - ${elapsed}ms`);
          const errorData = error.response.data;
          if (typeof errorData === 'object') {
            console.log(`   Error: ${JSON.stringify(errorData).substring(0, 100)}\n`);
          } else {
            console.log(`   ${errorData}\n`);
          }
        } else {
          console.log(`   ❌ ${error.message} (${elapsed}ms)\n`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testHangingEndpoints();
