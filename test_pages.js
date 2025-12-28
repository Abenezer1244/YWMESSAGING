const http = require('http');

async function testPage(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasGroups = (data.includes('/groups') || data.includes('Groups') || data.includes('group'));
        resolve({ status: res.statusCode, hasGroups });
      });
    });

    req.on('error', () => resolve({ status: 'error' }));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Testing Frontend Pages for Group References');
  console.log('═══════════════════════════════════════════════════');

  const pages = [
    { path: '/login', label: 'Login' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/members', label: 'Members' },
    { path: '/send-message', label: 'Send Message' },
    { path: '/branches', label: 'Branches' },
  ];

  for (const page of pages) {
    const result = await testPage(page.path);
    const status = result.status === 200 ? '✅' : '⚠️ ';
    const groups = result.hasGroups ? '❌ GROUPS FOUND' : '✅ NO GROUPS';
    console.log(`${status} ${page.label.padEnd(20)} | HTTP: ${result.status} | ${groups}`);
  }

  console.log('═══════════════════════════════════════════════════\n');
}

runTests();
