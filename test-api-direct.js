const http = require('http');
const https = require('https');

async function testAPIDirect() {
  console.log('=== TEST 1: Login ===');

  const loginData = JSON.stringify({
    email: 'DOKaA@GMAIL.COM',
    password: '12!Michael'
  });

  const loginOptions = {
    hostname: 'api.koinoniasms.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  return new Promise((resolve) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Login response status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log(`Login success: ${parsed.success}`);
          const token = parsed.data?.accessToken;
          console.log(`Access token received (length: ${token?.length})`);

          if (token) {
            console.log(`\n=== TEST 2: Call /api/auth/me with token ===`);
            testGroupsAPI(token);
          }
        } catch (e) {
          console.log(`Login response (not JSON): ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });

    req.on('error', err => {
      console.error('Login error:', err);
      resolve();
    });

    req.write(loginData);
    req.end();
  });
}

function testGroupsAPI(token) {
  const groupsOptions = {
    hostname: 'api.koinoniasms.com',
    port: 443,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Cookie': `accessToken=${token}`,
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(groupsOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`/api/auth/me response status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log(`Response: ${JSON.stringify(parsed).substring(0, 200)}`);
        } catch (e) {
          console.log(`Response (not JSON): ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });

    req.on('error', err => {
      console.error('API error:', err);
      resolve();
    });

    req.end();
  });
}

testAPIDirect();
