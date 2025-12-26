const https = require('https');

function makeRequest(method, path) {
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
          resolve({ status: res.statusCode, duration, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, duration, body: data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message, duration: Date.now() - startTime });
    });

    req.setTimeout(10000, () => {
      req.abort();
      resolve({ error: 'timeout', duration: 10000 });
    });

    req.end();
  });
}

async function test() {
  console.log('Testing API health...\n');
  
  console.log('1. Testing health endpoint...');
  const health = await makeRequest('GET', '/api/health');
  console.log('Status:', health.status);
  console.log('Duration:', health.duration + 'ms');
  console.log('Body:', health.body);
  
  console.log('\n2. Testing database from health check...');
  if (health.body?.checks?.database) {
    console.log('Database status:', health.body.checks.database);
  }
  
  console.log('\n3. Conclusion:');
  if (health.status === 200) {
    console.log('✅ API is responding');
    if (health.body?.checks?.database === 'healthy') {
      console.log('✅ Database is healthy');
    } else {
      console.log('❌ Database might not be healthy:', health.body?.checks?.database);
    }
  } else {
    console.log('❌ API is not responding properly');
  }
}

test().catch(console.error);
