const axios = require('axios');

async function testSimpleQueries() {
  console.log('\n📊 Testing Individual Dashboard Queries\n');

  try {
    // Register test account
    const testEmail = `simple-${Date.now()}@koinoniasms.com`;
    const testPassword = 'Simple123!';

    console.log('🔐 Registering test account...');
    const registerResponse = await axios.post(
      'https://api.koinoniasms.com/api/auth/register',
      {
        email: testEmail,
        password: testPassword,
        firstName: 'Simple',
        lastName: 'Test',
        churchName: 'Simple Test Church',
      },
      { timeout: 10000 }
    );

    const { accessToken, church, admin } = registerResponse.data.data;
    console.log('✅ Account registered');
    console.log(`   Church ID: ${church.id}`);
    console.log(`   Admin ID: ${admin.id}\n`);

    const client = axios.create({
      baseURL: 'https://api.koinoniasms.com',
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Test each endpoint individually
    const tests = [
      { name: 'Profile', url: '/api/admin/profile' },
      { name: 'Branches', url: `/api/branches/churches/${church.id}/branches` },
      { name: 'Current Phone', url: '/api/numbers/current' },
      { name: 'Trial Info', url: '/api/billing/trial' },
      { name: 'Summary Stats', url: '/api/analytics/summary' },
      { name: 'Message Stats (7d)', url: '/api/analytics/messages?days=7' },
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const response = await client.get(test.url);
        const elapsed = Date.now() - start;
        console.log(`✅ ${test.name.padEnd(15)} - ${response.status} (${elapsed}ms)`);
        if (test.name.includes('Stats')) {
          console.log(`   Data keys: ${Object.keys(response.data).join(', ')}`);
        }
      } catch (error) {
        const elapsed = Date.now() - start;
        if (error.response?.data?.details) {
          console.log(
            `❌ ${test.name.padEnd(15)} - ${error.response.status} (${elapsed}ms) - ${error.response.data.details}`
          );
        } else {
          console.log(`❌ ${test.name.padEnd(15)} - ${error.response?.status || error.code} (${elapsed}ms)`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testSimpleQueries();
