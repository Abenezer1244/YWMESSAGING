const axios = require('axios');

async function testLoginWithRetries() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🔄 LOGIN TEST WITH RETRIES (waiting for Render deployment)');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const apiClient = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    withCredentials: true,
    timeout: 15000,
  });

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`\n📍 ATTEMPT ${attempt}/${maxRetries} at ${new Date().toLocaleTimeString()}\n`);

    let startTime = Date.now();

    try {
      console.log('Sending login request...');

      const response = await apiClient.post('/api/auth/login', {
        email: 'e2e-1766693295746@koinoniasms.com',
        password: 'E2ETest123!',
      });

      const elapsed = Date.now() - startTime;

      console.log(`✅ LOGIN SUCCEEDED in ${elapsed}ms\n`);
      console.log('Response Data:');
      console.log(JSON.stringify(response.data, null, 2));

      console.log('\n═════════════════════════════════════════════════════════════════');
      console.log('✅ FIX VERIFIED: Login endpoint is now working!');
      console.log('═════════════════════════════════════════════════════════════════\n');
      break;

    } catch (error) {
      const elapsed = Date.now() - startTime;

      if (error.code === 'ECONNABORTED') {
        console.log(`⏱️ Timeout after ${elapsed}ms - Backend still deploying`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Connection refused - Backend might be restarting`);
      } else if (error.response?.status) {
        console.log(`❌ HTTP ${error.response.status} - ${error.response.statusText}`);
        break;
      } else {
        console.log(`❌ Error: ${error.message}`);
      }

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting 10 seconds before retry...\n`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } else {
        console.log('\n❌ Max retries reached');
        console.log('⚠️ Render deployment may still be in progress');
      }
    }
  }
}

testLoginWithRetries();
