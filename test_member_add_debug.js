const https = require('https');

const BASE_URL = 'https://api.koinoniasms.com';

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const url = new URL(path, BASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const elapsed = Date.now() - startTime;
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            time: elapsed,
            data: parsed,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            time: elapsed,
            data: data,
            success: false,
            parseError: true,
          });
        }
      });
    });

    req.on('timeout', () => {
      req.abort();
      reject({ error: 'Request timeout', time: Date.now() - startTime });
    });

    req.on('error', (err) => {
      reject({ error: err.message, time: Date.now() - startTime });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function test() {
  console.log('🧪 MEMBER ADD DEBUGGER - Real End-to-End Test\n');

  try {
    // 1. Register
    console.log('1️⃣ Registering user...');
    const email = `testuser${Date.now()}@test.com`;
    const registerResp = await makeRequest('POST', '/api/auth/register', {
      email,
      password: 'Test123!@',
      firstName: 'Test',
      lastName: 'User',
      churchName: 'Test Church',
    });

    if (!registerResp.success) {
      console.log('❌ Register failed:', registerResp.data);
      return;
    }

    const token = registerResp.data?.data?.accessToken;
    const churchId = registerResp.data?.data?.church?.id;
    console.log(`✅ Registered in ${registerResp.time}ms\n`);

    // 2. Create branch
    console.log('2️⃣ Creating branch...');
    const branchResp = await makeRequest('POST', `/api/branches/churches/${churchId}/branches`, {
      name: 'Test Branch',
    }, token);

    if (!branchResp.success) {
      console.log('❌ Branch failed:', branchResp.data);
      return;
    }

    const branchId = branchResp.data?.data?.id;
    console.log(`✅ Branch created in ${branchResp.time}ms\n`);

    // 3. Create group
    console.log('3️⃣ Creating group...');
    const groupResp = await makeRequest('POST', `/api/groups/branches/${branchId}/groups`, {
      name: 'Test Group',
    }, token);

    if (!groupResp.success) {
      console.log('❌ Group failed:', groupResp.data);
      return;
    }

    const groupId = groupResp.data?.data?.id;
    console.log(`✅ Group created in ${groupResp.time}ms\n`);

    // 4. GET members BEFORE adding
    console.log('4️⃣ Getting members list BEFORE adding...');
    const membersBeforeResp = await makeRequest('GET', `/api/groups/${groupId}/members`, null, token);
    console.log(`✅ Got members list in ${membersBeforeResp.time}ms`);
    console.log(`   Members count BEFORE: ${membersBeforeResp.data?.data?.length || 0}\n`);

    // 5. ADD MEMBER (The critical test)
    console.log('5️⃣ Adding member (THIS IS WHERE IT HANGS)...');
    const startAdd = Date.now();
    let addResp;
    try {
      addResp = await makeRequest('POST', `/api/groups/${groupId}/members`, {
        firstName: 'John',
        lastName: 'Doe',
        phone: '2061233212',
      }, token);
      const addTime = Date.now() - startAdd;
      console.log(`Response received in ${addTime}ms`);
    } catch (err) {
      const addTime = Date.now() - startAdd;
      console.log(`❌ TIMEOUT/ERROR after ${addTime}ms: ${err.error}`);
      console.log(`This is the actual issue - request hangs for ${addTime}ms\n`);

      // Try to get members anyway to see if it was added
      console.log('6️⃣ Checking if member was added despite timeout...');
      await new Promise(r => setTimeout(r, 2000));
      const membersAfterTimeoutResp = await makeRequest('GET', `/api/groups/${groupId}/members`, null, token);
      console.log(`✅ Got members list in ${membersAfterTimeoutResp.time}ms`);
      const memberCount = membersAfterTimeoutResp.data?.data?.length || 0;
      console.log(`   Members count AFTER timeout: ${memberCount}`);
      if (memberCount > 0) {
        console.log('   ✅ Member WAS added despite timeout!');
        console.log('   Members:', membersAfterTimeoutResp.data?.data);
      } else {
        console.log('   ❌ Member was NOT added');
      }
      return;
    }

    if (!addResp.success) {
      console.log(`❌ Add member failed:`, addResp.data);
      console.log(`   Status: ${addResp.status}`);
      return;
    }

    console.log(`✅ Member added successfully in ${addResp.time}ms\n`);

    // 6. GET members AFTER adding
    console.log('6️⃣ Getting members list AFTER adding...');
    const membersAfterResp = await makeRequest('GET', `/api/groups/${groupId}/members`, null, token);
    console.log(`✅ Got members list in ${membersAfterResp.time}ms`);
    const finalCount = membersAfterResp.data?.data?.length || 0;
    console.log(`   Members count AFTER: ${finalCount}`);

    if (finalCount > 0) {
      console.log('\n✅ SUCCESS! Member was added and is visible\n');
      console.log('Member details:');
      console.log(JSON.stringify(membersAfterResp.data?.data?.[0], null, 2));
    } else {
      console.log('\n❌ Member was added but NOT visible in list!');
    }

  } catch (err) {
    console.log('💥 FATAL ERROR:', err);
  }
}

test();
