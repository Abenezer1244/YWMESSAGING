const axios = require('axios');

async function testBackendHealth() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🏥 BACKEND HEALTH CHECK');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const apiClient = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    timeout: 5000,
  });

  const endpoints = [
    { name: 'Health Check', path: '/health' },
    { name: 'Auth Register', path: '/api/auth/register', method: 'POST', data: { test: true } },
    { name: 'Auth Refresh', path: '/api/auth/refresh', method: 'POST' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name}`);
      console.log(`  Path: ${endpoint.path}`);

      const method = endpoint.method || 'GET';
      const config = { timeout: 5000 };

      let response;
      if (method === 'POST') {
        response = await apiClient.post(endpoint.path, endpoint.data || {});
      } else {
        response = await apiClient.get(endpoint.path);
      }

      console.log(`  ✅ Status: ${response.status} ${response.statusText}\n`);
    } catch (error) {
      const name = endpoint.name;
      if (error.code === 'ECONNREFUSED') {
        console.log(`  ❌ Connection refused\n`);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        console.log(`  ❌ Timeout\n`);
      } else if (error.response) {
        console.log(`  ⚠️ Status: ${error.response.status}\n`);
      } else {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }
  }

  console.log('═════════════════════════════════════════════════════════════════\n');
}

testBackendHealth();
