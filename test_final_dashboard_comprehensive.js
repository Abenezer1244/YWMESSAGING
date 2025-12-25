const axios = require('axios');

async function comprehensiveDashboardTest() {
  console.log('\n' + '='.repeat(73));
  console.log('🎯 COMPREHENSIVE DASHBOARD ENDPOINTS TEST');
  console.log('='.repeat(73) + '\n');

  let testsPassed = 0;
  let testsFailed = 0;
  const results = [];

  try {
    // Register test account
    const testEmail = `dashboard-final-${Date.now()}@koinoniasms.com`;
    const testPassword = 'Final123!';

    console.log('🔐 Creating test account...');
    const registerResponse = await axios.post(
      'https://api.koinoniasms.com/api/auth/register',
      {
        email: testEmail,
        password: testPassword,
        firstName: 'Dashboard',
        lastName: 'Final',
        churchName: 'Dashboard Final Church',
      },
      { timeout: 10000 }
    );

    const { accessToken, church } = registerResponse.data.data;
    console.log(`✅ Account created: ${testEmail}`);
    console.log(`   Church ID: ${church.id}\n`);

    const client = axios.create({
      baseURL: 'https://api.koinoniasms.com',
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Define all dashboard endpoints
    const endpoints = [
      {
        name: 'Profile',
        url: '/api/admin/profile',
        expectedStatus: 200,
        description: 'Get admin profile information',
      },
      {
        name: 'Branches',
        url: `/api/branches/churches/${church.id}/branches`,
        expectedStatus: 200,
        description: 'Get all branches for church',
      },
      {
        name: 'Trial Info',
        url: '/api/billing/trial',
        expectedStatus: 200,
        description: 'Get trial subscription info',
      },
      {
        name: 'Summary Stats',
        url: '/api/analytics/summary',
        expectedStatus: 200,
        description: 'Get dashboard summary statistics',
      },
      {
        name: 'Message Stats',
        url: '/api/analytics/messages?days=7',
        expectedStatus: 200,
        description: 'Get message delivery statistics',
      },
      {
        name: 'Current Phone',
        url: '/api/numbers/current',
        expectedStatus: [200, 404],
        description: 'Get current phone number (404 expected if none assigned)',
      },
    ];

    console.log('📊 Testing Dashboard Endpoints:\n');
    console.log('Endpoint'.padEnd(15) + 'Status'.padEnd(10) + 'Time'.padEnd(10) + 'Result');
    console.log('-'.repeat(73) + '\n');

    for (const endpoint of endpoints) {
      const start = Date.now();
      try {
        const response = await client.get(endpoint.url);
        const elapsed = Date.now() - start;

        const expectedStatuses = Array.isArray(endpoint.expectedStatus)
          ? endpoint.expectedStatus
          : [endpoint.expectedStatus];

        const isExpected = expectedStatuses.includes(response.status);
        const statusEmoji = isExpected ? '✅' : '❌';

        console.log(
          endpoint.name.padEnd(15) +
          `${response.status}`.padEnd(10) +
          `${elapsed}ms`.padEnd(10) +
          `${statusEmoji} Success`
        );

        results.push({
          endpoint: endpoint.name,
          status: response.status,
          time: elapsed,
          pass: isExpected,
          description: endpoint.description,
        });

        if (isExpected) {
          testsPassed++;
        } else {
          testsFailed++;
        }
      } catch (error) {
        const elapsed = Date.now() - start;
        const status = error.response?.status || error.code;

        const expectedStatuses = Array.isArray(endpoint.expectedStatus)
          ? endpoint.expectedStatus
          : [endpoint.expectedStatus];

        const isExpected = expectedStatuses.includes(status);
        const statusEmoji = isExpected ? '✅' : '❌';

        console.log(
          endpoint.name.padEnd(15) +
          `${status}`.padEnd(10) +
          `${elapsed}ms`.padEnd(10) +
          `${statusEmoji} ${isExpected ? 'Expected' : 'Unexpected'}`
        );

        results.push({
          endpoint: endpoint.name,
          status,
          time: elapsed,
          pass: isExpected,
          description: endpoint.description,
          error: error.response?.data?.error || error.message,
        });

        if (isExpected) {
          testsPassed++;
        } else {
          testsFailed++;
        }
      }
    }

    console.log('\n' + '='.repeat(73));
    console.log('📈 TEST RESULTS SUMMARY');
    console.log('='.repeat(73) + '\n');

    const totalTests = results.length;
    const avgTime = Math.round(results.reduce((sum, r) => sum + r.time, 0) / results.length);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${testsPassed} ✅`);
    console.log(`Failed: ${testsFailed} ❌`);
    console.log(`Average Response Time: ${avgTime}ms\n`);

    // Detailed results
    console.log('Detailed Results:');
    console.log('-'.repeat(73) + '\n');
    results.forEach((result, i) => {
      const icon = result.pass ? '✅' : '❌';
      console.log(`${i + 1}. ${icon} ${result.endpoint}`);
      console.log(`   Status: ${result.status} | Time: ${result.time}ms`);
      console.log(`   Description: ${result.description}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    console.log('='.repeat(73));
    if (testsFailed === 0) {
      console.log('🎉 SUCCESS: All dashboard endpoints are working correctly!');
      console.log('   Dashboard is production-ready ✅');
    } else {
      console.log('⚠️  ATTENTION: Some endpoints need attention');
      console.log(`   ${testsFailed} endpoint(s) not responding as expected`);
    }
    console.log('='.repeat(73) + '\n');

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    process.exit(1);
  }
}

comprehensiveDashboardTest();
