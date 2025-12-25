const axios = require('axios');

async function testLoginVerbose() {
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('🔍 VERBOSE LOGIN TEST');
  console.log('═════════════════════════════════════════════════════════════════\n');

  // Create an axios instance with request/response logging
  const apiClient = axios.create({
    baseURL: 'https://api.koinoniasms.com',
    withCredentials: true,
    timeout: 30000,
  });

  // Log all requests
  apiClient.interceptors.request.use((config) => {
    console.log(`[REQUEST] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`[HEADERS] ${JSON.stringify(config.headers)}`);
    if (config.data) {
      console.log(`[BODY] ${JSON.stringify(config.data)}`);
    }
    return config;
  });

  // Log all responses
  apiClient.interceptors.response.use(
    (response) => {
      console.log(`[RESPONSE] Status ${response.status}`);
      console.log(`[HEADERS] ${JSON.stringify(response.headers)}`);
      console.log(`[DATA] ${JSON.stringify(response.data).substring(0, 300)}`);
      return response;
    },
    (error) => {
      if (error.response) {
        console.log(`[ERROR RESPONSE] Status ${error.response.status}`);
        console.log(`[ERROR DATA] ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.log(`[ERROR REQUEST] No response received`);
        console.log(`[REQUEST MADE AT] ${new Date().toISOString()}`);
      } else {
        console.log(`[ERROR] ${error.message}`);
      }
      throw error;
    }
  );

  try {
    console.log('Attempting login...\n');

    const startTime = Date.now();
    console.log(`[START] ${new Date().toISOString()}`);

    const response = await apiClient.post('/api/auth/login', {
      email: 'e2e-1766693295746@koinoniasms.com',
      password: 'E2ETest123!',
    });

    const elapsed = Date.now() - startTime;
    console.log(`[ELAPSED] ${elapsed}ms`);
    console.log(`\n✅ LOGIN SUCCEEDED`);

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`[ELAPSED] ${elapsed}ms`);
    console.log(`\n❌ LOGIN FAILED`);

    if (error.code === 'ECONNABORTED') {
      console.log('\nERROR TYPE: Request timeout');
      console.log('LIKELY CAUSE: Backend not responding within 30 seconds');
      console.log('POSSIBLE REASONS:');
      console.log('  1. Backend process is hanging/frozen');
      console.log('  2. Database query is taking too long');
      console.log('  3. Network connectivity issue');
      console.log('  4. Backend server is overloaded');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\nERROR TYPE: Connection refused');
      console.log('LIKELY CAUSE: Backend server not running or wrong port');
    } else if (error.response) {
      console.log('\nERROR TYPE: HTTP error response');
      console.log(`Status: ${error.response.status}`);
    } else {
      console.log('\nERROR TYPE: Network error');
      console.log(`Message: ${error.message}`);
    }
  }

  console.log('\n═════════════════════════════════════════════════════════════════\n');
}

const startTime = Date.now();
testLoginVerbose().finally(() => {
  const totalTime = Date.now() - startTime;
  console.log(`[TOTAL TIME] ${totalTime}ms`);
});
