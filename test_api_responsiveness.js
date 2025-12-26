const https = require('https');

function makeRequest(method, path, body = null, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: 'api.koinoniasms.com',
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          resolve({ status: res.statusCode, duration, body: JSON.parse(data), success: true });
        } catch {
          resolve({ status: res.statusCode, duration, body: data, success: true });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message, duration: Date.now() - startTime, success: false });
    });

    req.setTimeout(timeout, () => {
      req.abort();
      resolve({ error: `timeout after ${timeout}ms`, duration: timeout, success: false });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  console.log('API Responsiveness Test\n');

  // Test 1: Login with invalid credentials (should fail quickly)
  console.log('1️⃣  Testing auth login with bad credentials (should get 401)...');
  const login = await makeRequest('POST', '/api/auth/login', {
    email: 'nonexistent@example.com',
    password: 'wrong'
  });
  console.log('   Status:', login.status, '| Duration:', login.duration + 'ms');
  if (login.status === 401) {
    console.log('   ✅ API is responsive\n');
  } else {
    console.log('   ❌ Unexpected response:', login.body?.error, '\n');
  }

  // Test 2: Try basic auth
  console.log('2️⃣  Testing simple POST to /api/auth/register (structure validation)...');
  const start = Date.now();
  const reg = await makeRequest('POST', '/api/auth/register', {
    churchName: 'Test',
    firstName: 'Test',
    lastName: 'Test',
    email: 'test@test.com',
    password: 'Test@123',
    confirmPassword: 'Test@123'
  }, 10000);
  const elapsed = Date.now() - start;
  console.log('   Duration:', elapsed + 'ms');
  console.log('   Status:', reg.status);
  if (reg.error) {
    console.log('   ❌ ERROR:', reg.error);
  } else {
    console.log('   Body (first 100 chars):', JSON.stringify(reg.body).substring(0, 100));
  }

  console.log('\n📊 Analysis:');
  if (login.success && login.duration < 1000) {
    console.log('   ✅ API is responsive and fast');
  } else if (!login.success && login.error?.includes('timeout')) {
    console.log('   ❌ API is hanging/timing out - network or infrastructure issue');
  } else {
    console.log('   ⚠️  API response is unpredictable');
  }
}

test().catch(console.error);
