const https = require('https');

function makeRequest(method, path, body = null, authToken = null, timeout = 30000) {  // 30 second timeout
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: 'api.koinoniasms.com',
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

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

    req.setTimeout(timeout, () => {
      req.abort();
      resolve({ error: `timeout after ${timeout}ms`, duration: timeout });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function quickTest() {
  console.log('Quick Member Add Test (30 second timeout)\n');

  const timestamp = Date.now();
  const testEmail = `test_${timestamp}@example.com`;
  
  console.log('1️⃣  Registering...');
  const reg = await makeRequest('POST', '/api/auth/register', {
    churchName: `TestChurch_${timestamp}`,
    firstName: 'Test',
    lastName: 'Church',
    email: testEmail,
    password: 'Test@123456',
    confirmPassword: 'Test@123456'
  }, null, 30000);

  if (reg.status !== 200 && reg.status !== 201) {
    console.log('❌ Registration failed:', reg.status, reg.body?.error);
    return;
  }

  const token = reg.body.data?.accessToken;
  const churchId = reg.body.data?.church?.id;
  console.log('✅ Registered (', reg.duration, 'ms)\n');

  console.log('2️⃣  Creating branch...');
  const br = await makeRequest('POST', `/api/branches/churches/${churchId}/branches`,
    { name: `Branch_${timestamp}` }, token, 30000);
  
  const branchId = br.body.data?.id;
  if (!branchId) {
    console.log('❌ Branch creation failed:', br.status, br.body?.error);
    return;
  }
  console.log('✅ Branch created (', br.duration, 'ms)\n');

  console.log('3️⃣  Creating group...');
  const gr = await makeRequest('POST', `/api/groups/branches/${branchId}/groups`,
    { name: `Group_${timestamp}` }, token, 30000);
  
  const groupId = gr.body.data?.id;
  if (!groupId) {
    console.log('❌ Group creation failed:', gr.status, gr.body?.error);
    return;
  }
  console.log('✅ Group created (', gr.duration, 'ms)\n');

  console.log('4️⃣  Adding member (this is where it times out)...');
  const am = await makeRequest('POST', `/api/groups/${groupId}/members`, {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+12025551234',
    email: `john_${timestamp}@example.com`,
    optInSms: true
  }, token, 30000);

  console.log('Member add response:', am.duration, 'ms');
  if (am.error) {
    console.log('❌ ERROR:', am.error);
    return;
  }

  console.log('Status:', am.status);
  console.log('Body:', JSON.stringify(am.body, null, 2));

  if (am.status === 201 || am.status === 200) {
    console.log('✅ SUCCESS: Member was added!');
  } else {
    console.log('❌ FAILED: Member add returned error');
  }
}

quickTest().catch(console.error);
