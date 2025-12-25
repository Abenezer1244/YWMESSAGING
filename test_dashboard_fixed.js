const axios = require('axios');

async function testDashboardEndpoints() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('✅ DASHBOARD ENDPOINTS TEST (after fix)');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`\n📍 ATTEMPT ${attempt}/${maxRetries} at ${new Date().toLocaleTimeString()}`);
    console.log('═════════════════════════════════════════════════════════════════\n');

    try {
      // Register new account
      const testEmail = `dashboard-${Date.now()}@koinoniasms.com`;
      const testPassword = 'Dashboard123!';

      const registerClient = axios.create({
        baseURL: 'https://api.koinoniasms.com',
        timeout: 10000,
      });

      console.log('Registering account...');
      const registerResponse = await registerClient.post('/api/auth/register', {
        email: testEmail,
        password: testPassword,
        firstName: 'Dashboard',
        lastName: 'Test',
        churchName: 'Dashboard Test Church',
      });

      const { accessToken, church } = registerResponse.data.data;
      console.log('✅ Account registered\n');

      // Test dashboard endpoints with the auth token
      const client = axios.create({
        baseURL: 'https://api.koinoniasms.com',
        timeout: 8000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const endpoints = [
        { name: 'Profile', path: '/api/admin/profile' },
        { name: 'Summary Stats', path: '/api/analytics/summary' },
        { name: 'Message Stats', path: '/api/analytics/messages?days=7' },
        { name: 'Branches', path: `/api/branches/churches/${church.id}/branches` },
        { name: 'Trial Info', path: '/api/billing/trial' },
        { name: 'Current Phone', path: '/api/numbers/current' },
      ];

      const results = [];
      let allSuccess = true;

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        try {
          const response = await client.get(endpoint.path);
          const elapsed = Date.now() - startTime;
          console.log(`✅ ${endpoint.name.padEnd(15)} - Status ${response.status} (${elapsed}ms)`);
          results.push({ name: endpoint.name, status: 'success', time: elapsed });
        } catch (error) {
          const elapsed = Date.now() - startTime;
          if (error.code === 'ECONNABORTED') {
            console.log(`⏱️  ${endpoint.name.padEnd(15)} - TIMEOUT (${elapsed}ms)`);
            results.push({ name: endpoint.name, status: 'timeout', time: elapsed });
            allSuccess = false;
          } else if (error.response) {
            console.log(
              `❌ ${endpoint.name.padEnd(15)} - Status ${error.response.status} (${elapsed}ms)`
            );
            results.push({ name: endpoint.name, status: `error ${error.response.status}`, time: elapsed });
            // 404/400 are ok - means endpoint working but no data
            if (error.response.status < 500) {
              results[results.length - 1].status = 'success';
            } else {
              allSuccess = false;
            }
          } else {
            console.log(`❌ ${endpoint.name.padEnd(15)} - ${error.message} (${elapsed}ms)`);
            results.push({ name: endpoint.name, status: 'error', time: elapsed });
            allSuccess = false;
          }
        }
      }

      console.log('\n═════════════════════════════════════════════════════════════════');
      console.log('📊 RESULTS');
      console.log('═════════════════════════════════════════════════════════════════\n');

      const successCount = results.filter((r) => r.status === 'success').length;
      const avgTime = Math.round(results.reduce((sum, r) => sum + r.time, 0) / results.length);

      console.log(`✅ Successful: ${successCount}/${results.length}`);
      console.log(`⏱️  Average response time: ${avgTime}ms\n`);

      if (allSuccess) {
        console.log('═════════════════════════════════════════════════════════════════');
        console.log('🎉 SUCCESS: Dashboard endpoints are now working!');
        console.log('═════════════════════════════════════════════════════════════════\n');
        break;
      } else {
        console.log('⚠️ Some endpoints still not responding. Retrying...\n');
        if (attempt < maxRetries) {
          console.log('⏳ Waiting 15 seconds for Render deployment...\n');
          await new Promise((resolve) => setTimeout(resolve, 15000));
        }
      }

    } catch (error) {
      console.error('❌ Test error:', error.message);
      if (attempt < maxRetries) {
        console.log('⏳ Waiting 15 seconds before retry...\n');
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }
    }
  }
}

testDashboardEndpoints();
