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
  console.log('🎯 MEMBER ADD PERFORMANCE TEST - Multiple Members\n');

  try {
    // 1. Register
    console.log('1️⃣ Registering test user...');
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

    // 4. Add multiple members
    console.log('4️⃣ Testing member add performance...\n');

    const members = [
      { firstName: 'John', lastName: 'Doe', phone: '2061233212' },
      { firstName: 'Jane', lastName: 'Smith', phone: '2065554433' },
      { firstName: 'Bob', lastName: 'Johnson', phone: '+1-206-555-5555' },
      { firstName: 'Alice', lastName: 'Williams', phone: '(206) 555-6666' },
    ];

    const addTimes = [];
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const startAdd = Date.now();

      const addResp = await makeRequest('POST', `/api/groups/${groupId}/members`, {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
      }, token);

      const addTime = Date.now() - startAdd;
      addTimes.push(addTime);

      if (addResp.success) {
        console.log(`   ✅ ${member.firstName} ${member.lastName}: ${addTime}ms`);
      } else {
        console.log(`   ❌ ${member.firstName} ${member.lastName}: FAILED - ${addResp.data?.error}`);
        return;
      }
    }

    // 5. Get members list
    console.log('\n5️⃣ Verifying all members are visible...');
    const membersResp = await makeRequest('GET', `/api/groups/${groupId}/members`, null, token);

    if (!membersResp.success) {
      console.log('❌ Get members failed:', membersResp.data);
      return;
    }

    const count = membersResp.data?.data?.length || 0;
    console.log(`✅ Retrieved members list in ${membersResp.time}ms`);
    console.log(`   Members count: ${count}\n`);

    // 6. Performance summary
    console.log('📊 PERFORMANCE SUMMARY:\n');
    const avgTime = addTimes.reduce((a, b) => a + b, 0) / addTimes.length;
    const minTime = Math.min(...addTimes);
    const maxTime = Math.max(...addTimes);

    console.log(`   Average response time: ${avgTime.toFixed(0)}ms`);
    console.log(`   Min response time: ${minTime}ms`);
    console.log(`   Max response time: ${maxTime}ms`);
    console.log(`   ✅ All under 2 seconds: ${maxTime < 2000 ? 'YES ✓' : 'NO ✗'}`);
    console.log(`   ✅ All members visible: ${count === members.length ? 'YES ✓' : 'NO ✗'}\n`);

    if (maxTime < 2000 && count === members.length) {
      console.log('🎉 SUCCESS! Member add is fast and reliable!\n');
      console.log('Members added:');
      membersResp.data?.data?.forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.firstName} ${m.lastName} - ${m.phone}`);
      });
    }

  } catch (err) {
    console.log('💥 FATAL ERROR:', err);
  }
}

test();
