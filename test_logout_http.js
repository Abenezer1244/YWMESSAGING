const https = require('https');

async function testLogout() {
  // Use curl to register first
  const { execSync } = require('child_process');

  const email = `test-${Date.now()}@koinoniasms.com`;

  try {
    // Register with curl
    console.log('Registering...');
    const registerCmd = `curl -s -X POST https://api.koinoniasms.com/api/auth/register \\
      -H "Content-Type: application/json" \\
      -d '{"email":"${email}","password":"Test123!","firstName":"Test","lastName":"User","churchName":"Test"}'`;

    const registerResult = execSync(registerCmd, { encoding: 'utf-8' });
    const registerData = JSON.parse(registerResult);
    const token = registerData.data.accessToken;

    console.log('✅ Registered');
    console.log(`Token: ${token.substring(0, 30)}...`);

    // Now test logout with native https
    console.log('\nTesting logout with native https...');

    const options = {
      hostname: 'api.koinoniasms.com',
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': '2',
      },
      timeout: 10000,
    };

    const startTime = Date.now();

    const req = https.request(options, (res) => {
      const duration = Date.now() - startTime;
      console.log(`✅ Logout responded: ${res.statusCode} (${duration}ms)`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Response: ${data}`);
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ Logout error after ${duration}ms: ${error.message}`);
    });

    req.on('timeout', () => {
      console.log('❌ Request timed out after 10s');
      req.destroy();
    });

    req.write('{}');
    req.end();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogout();
