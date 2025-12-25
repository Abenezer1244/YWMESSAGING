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

  // Use a test account that we know exists
  const testEmail = 'e2e-1766695192238@koinoniasms.com';
  const testPassword = 'Dashboard123!';

  try {
    // First, login to get auth tokens
    console.log('Logging in to get auth tokens...\n');
    const loginResponse = await apiClient.post('/api/auth/login', {
      email: testEmail,
      password: testPassword,
    });

    const { accessToken, data: { admin, church } } = loginResponse.data;
    console.log(`✅ Logged in as: ${admin.email}`);
    console.log(`Church ID: ${church.id}\n`);

    // Set auth headers for subsequent requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Test each potentially hanging endpoint
    const endpoints = [
      {
        name: 'Get Branches',
        method: 'GET',
        url: `/api/branches/churches/${church.id}/branches`,
        timeout: 5000,
      },
      {
        name: 'Get Trial Info',
        method: 'GET',
        url: `/api/billing/trial`,
        timeout: 5000,
      },
      {
        name: 'Get Current Phone',
        method: 'GET',
        url: `/api/numbers/current`,
        timeout: 5000,
      },
      {
        name: 'Get Profile',
        method: 'GET',
        url: `/api/admin/profile`,
        timeout: 5000,
      },
      {
        name: 'Get Summary Stats',
        method: 'GET',
        url: `/api/analytics/summary`,
        timeout: 5000,
      },
      {
        name: 'Get Message Stats',
        method: 'GET',
        url: `/api/analytics/messages?days=7`,
        timeout: 5000,
      },
    ];

    console.log('Testing Dashboard Endpoints:\n');

    for (const endpoint of endpoints) {
      const client = axios.create({
        baseURL: 'https://api.koinoniasms.com',
        withCredentials: true,
        timeout: endpoint.timeout,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const startTime = Date.now();
      console.log(`📤 ${endpoint.name} (${endpoint.method} ${endpoint.url})`);

      try {
        const response = await client.get(endpoint.url);
        const elapsed = Date.now() - startTime;
        console.log(`   ✅ Status ${response.status} - ${elapsed}ms\n`);
      } catch (error) {
        const elapsed = Date.now() - startTime;

        if (error.code === 'ECONNABORTED') {
          console.log(`   ⏱️  TIMEOUT after ${elapsed}ms - Endpoint not responding\n`);
        } else if (error.response) {
          console.log(`   ❌ Status ${error.response.status} - ${elapsed}ms`);
          if (error.response.status >= 500) {
            console.log(`   Server error! Response: ${JSON.stringify(error.response.data).substring(0, 100)}\n`);
          } else {
            console.log(`   Client error\n`);
          }
        } else {
          console.log(`   ❌ Error: ${error.message} (${elapsed}ms)\n`);
        }
      }
    }

  } catch (error) {
    console.error('Failed to login:', error.message);
  }
}

testHangingEndpoints();
