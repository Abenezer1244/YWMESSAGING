const https = require('https');

async function testMemberOps() {
  console.log('=== STEP 1: LOGIN ===');

  const loginData = JSON.stringify({
    email: 'DOKaA@GMAIL.COM',
    password: '12!Michael'
  });

  return new Promise((resolve) => {
    const loginReq = https.request({
      hostname: 'api.koinoniasms.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, (loginRes) => {
      let data = '';
      loginRes.on('data', chunk => data += chunk);
      loginRes.on('end', () => {
        const parsed = JSON.parse(data);
        const token = parsed.data?.accessToken;
        const churchId = parsed.data?.church?.id;
        console.log(`✅ Login success, token length: ${token.length}`);

        // Step 2: Get first branch
        console.log('\n=== STEP 2: GET BRANCHES ===');
        const branchReq = https.request({
          hostname: 'api.koinoniasms.com',
          path: '/api/branches',
          method: 'GET',
          headers: {
            'Cookie': `accessToken=${token}`,
            'Authorization': `Bearer ${token}`
          }
        }, (branchRes) => {
          let branchData = '';
          branchRes.on('data', chunk => branchData += chunk);
          branchRes.on('end', () => {
            console.log(`/api/branches status: ${branchRes.statusCode}`);
            try {
              const branches = JSON.parse(branchData);
              console.log(`Branches response: ${JSON.stringify(branches).substring(0, 150)}`);
            } catch (e) {
              console.log(`Response: ${branchData.substring(0, 100)}`);
            }
            resolve();
          });
        });
        branchReq.end();
      });
    });
    loginReq.write(loginData);
    loginReq.end();
  });
}

testMemberOps();
