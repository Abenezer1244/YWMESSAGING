const axios = require('axios');

async function testBackendLogin() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🔌 BACKEND LOGIN ENDPOINT TEST');
  console.log('═════════════════════════════════════════════════════════════════\n');

  // Use the test account from previous tests
  const testData = {
    email: 'e2e-1766693295746@koinoniasms.com',
    password: 'E2ETest123!',
  };

  const apiClient = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    withCredentials: true,
    timeout: 10000,
  });

  try {
    console.log(`Testing login with:`);
    console.log(`  Email: ${testData.email}`);
    console.log(`  Password: ${testData.password}\n`);

    console.log('Sending POST /api/auth/login...\n');

    const response = await apiClient.post('/api/auth/login', testData);

    console.log('✅ RESPONSE RECEIVED\n');
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}\n`);

    console.log('Response Headers:');
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase().includes('content') || key.toLowerCase().includes('set-cookie')) {
        console.log(`  ${key}: ${value}`);
      }
    });

    console.log('\nResponse Data:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('✅ BACKEND IS RESPONDING');
    console.log('═════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.log('❌ ERROR\n');

    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Status Text: ${error.response.statusText}\n`);
      console.log('Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ CONNECTION REFUSED - Backend is not running');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ REQUEST TIMEOUT - Backend not responding');
    } else {
      console.log(`Error: ${error.message}`);
      console.log(`Code: ${error.code}`);
    }

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('❌ BACKEND IS NOT RESPONDING PROPERLY');
    console.log('═════════════════════════════════════════════════════════════════\n');
  }
}

testBackendLogin();
