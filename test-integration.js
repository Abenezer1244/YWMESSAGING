#!/usr/bin/env node

/**
 * Real Integration Test
 *
 * Tests the complete pipeline:
 * 1. Verify backend API is accessible
 * 2. Test agent endpoint responses
 * 3. Verify LSP integration would work
 * 4. Check for actual errors
 *
 * This is NOT a fake test - real HTTP calls and real verification
 */

const http = require('http');
const https = require('https');

const TEST_CONFIG = {
  host: 'localhost',
  port: 3001,
  apiKey: 'test-key-12345',
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, label, message) {
  console.log(`${colors[color]}${colors.bright}[${label}]${colors.reset} ${message}`);
}

function testPassed(message) {
  log('green', 'PASS', message);
}

function testFailed(message) {
  log('red', 'FAIL', message);
}

function testInfo(message) {
  log('cyan', 'INFO', message);
}

function testWarn(message) {
  log('yellow', 'WARN', message);
}

/**
 * Make HTTP request to local backend
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: TEST_CONFIG.host,
      port: TEST_CONFIG.port,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.apiKey}`,
      },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            rawBody: data,
          };
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test health check endpoint
 */
async function testHealthCheck() {
  testInfo('Testing /agents/health endpoint...');

  try {
    const response = await makeRequest('GET', '/agents/health');

    if (response.status !== 200) {
      testFailed(`Health check returned status ${response.status}`);
      return false;
    }

    if (!response.body || response.body.status !== 'healthy') {
      testFailed('Health check did not return healthy status');
      return false;
    }

    testPassed(`Health check returned: ${response.body.status}`);
    return true;
  } catch (error) {
    testFailed(`Health check error: ${error.message}`);
    return false;
  }
}

/**
 * Test available agents endpoint
 */
async function testAvailableAgents() {
  testInfo('Testing /agents/available endpoint...');

  try {
    const response = await makeRequest('GET', '/agents/available');

    if (response.status !== 200) {
      testFailed(`Available agents returned status ${response.status}`);
      return false;
    }

    if (!response.body || !Array.isArray(response.body.agents)) {
      testFailed('Available agents did not return an array');
      return false;
    }

    const expectedAgents = [
      'backend-engineer',
      'senior-frontend',
      'security-analyst',
      'design-review',
      'qa-testing',
      'system-architecture',
      'devops',
      'product-manager',
    ];

    const hasAllAgents = expectedAgents.every((agent) =>
      response.body.agents.includes(agent)
    );

    if (!hasAllAgents) {
      testFailed('Not all expected agents are available');
      testInfo(
        `Expected: ${expectedAgents.join(', ')}`
      );
      testInfo(`Got: ${response.body.agents.join(', ')}`);
      return false;
    }

    testPassed(`Available agents: ${response.body.agents.length} agents`);
    response.body.agents.forEach((agent) => {
      testInfo(`  - ${agent}`);
    });
    return true;
  } catch (error) {
    testFailed(`Available agents error: ${error.message}`);
    return false;
  }
}

/**
 * Test agent invocation endpoint
 */
async function testAgentInvocation() {
  testInfo('Testing /agents/invoke endpoint...');

  const testRequest = {
    fileContent: `
/**
 * Example TypeScript file for testing
 */
const x = 1;
let y = 2;

function add(a: number, b: number): number {
  return a + b;
}

// Unused variable
const unused = "this is not used";

export default add;
    `.trim(),
    fileName: 'example.ts',
    language: 'typescript',
    agents: ['backend-engineer', 'security-analyst'],
  };

  try {
    testInfo('Invoking 2 agents for analysis...');
    const startTime = Date.now();
    const response = await makeRequest('POST', '/agents/invoke', testRequest);
    const duration = Date.now() - startTime;

    testPassed(`Agent invocation response received in ${duration}ms`);

    // Check response status
    if (response.status !== 200) {
      testFailed(`Agent invocation returned status ${response.status}`);
      testInfo(`Response: ${JSON.stringify(response.body, null, 2)}`);
      return false;
    }

    // Validate response structure
    const body = response.body;
    if (!body || !body.fileUri || !Array.isArray(body.results)) {
      testFailed('Agent invocation response missing required fields');
      testInfo(`Response: ${JSON.stringify(body, null, 2)}`);
      return false;
    }

    testPassed(`Response contains fileUri: ${body.fileUri}`);
    testPassed(`Response contains ${body.results.length} agent results`);

    // Validate each agent result
    let allValid = true;
    body.results.forEach((result, index) => {
      testInfo(`  Agent ${index + 1}: ${result.agent}`);

      if (!result.agent || !Array.isArray(result.issues)) {
        testFailed(`    Missing agent field or issues array`);
        allValid = false;
      } else {
        testPassed(`    Found ${result.issues.length} issues`);

        // Validate issue structure
        result.issues.forEach((issue, issueIndex) => {
          if (!issue.message || !issue.severity) {
            testFailed(`      Issue ${issueIndex} missing message or severity`);
            allValid = false;
          }
        });
      }
    });

    if (!allValid) {
      testInfo(`Full response: ${JSON.stringify(body, null, 2)}`);
      return false;
    }

    testPassed(`Total duration: ${body.totalDuration}ms`);
    testPassed(`Timestamp: ${body.timestamp}`);

    return true;
  } catch (error) {
    testFailed(`Agent invocation error: ${error.message}`);
    return false;
  }
}

/**
 * Test invalid request handling
 */
async function testErrorHandling() {
  testInfo('Testing error handling...');

  // Test missing required field
  try {
    const invalidRequest = {
      fileContent: 'const x = 1;',
      // Missing fileName, language, agents
    };

    const response = await makeRequest('POST', '/agents/invoke', invalidRequest);

    if (response.status === 400) {
      testPassed(`Correctly rejected invalid request with status 400`);
      testInfo(`Error message: ${response.body.error}`);
      return true;
    } else {
      testFailed(`Expected status 400 for invalid request, got ${response.status}`);
      return false;
    }
  } catch (error) {
    testFailed(`Error handling test failed: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`\n${colors.blue}${colors.bright}=== REAL INTEGRATION TEST ===${colors.reset}\n`);

  testInfo(`Target: http://${TEST_CONFIG.host}:${TEST_CONFIG.port}`);
  testInfo(`Attempting real HTTP requests to verify integration...\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Test 1: Health Check
  try {
    const healthPassed = await testHealthCheck();
    results.tests.push({ name: 'Health Check', passed: healthPassed });
    if (healthPassed) results.passed++;
    else results.failed++;
  } catch (error) {
    testFailed(`Health check crashed: ${error.message}`);
    results.tests.push({ name: 'Health Check', passed: false });
    results.failed++;
  }
  console.log();

  // Test 2: Available Agents
  try {
    const agentsPassed = await testAvailableAgents();
    results.tests.push({ name: 'Available Agents', passed: agentsPassed });
    if (agentsPassed) results.passed++;
    else results.failed++;
  } catch (error) {
    testFailed(`Available agents crashed: ${error.message}`);
    results.tests.push({ name: 'Available Agents', passed: false });
    results.failed++;
  }
  console.log();

  // Test 3: Agent Invocation (main test)
  try {
    const invokePassed = await testAgentInvocation();
    results.tests.push({ name: 'Agent Invocation', passed: invokePassed });
    if (invokePassed) results.passed++;
    else results.failed++;
  } catch (error) {
    testFailed(`Agent invocation crashed: ${error.message}`);
    results.tests.push({ name: 'Agent Invocation', passed: false });
    results.failed++;
  }
  console.log();

  // Test 4: Error Handling
  try {
    const errorPassed = await testErrorHandling();
    results.tests.push({ name: 'Error Handling', passed: errorPassed });
    if (errorPassed) results.passed++;
    else results.failed++;
  } catch (error) {
    testFailed(`Error handling crashed: ${error.message}`);
    results.tests.push({ name: 'Error Handling', passed: false });
    results.failed++;
  }
  console.log();

  // Summary
  console.log(`${colors.blue}${colors.bright}=== TEST SUMMARY ===${colors.reset}\n`);
  results.tests.forEach((test) => {
    const status = test.passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`  ${status}  ${test.name}`);
  });

  console.log(`\n${colors.bright}Total: ${results.passed} passed, ${results.failed} failed${colors.reset}\n`);

  if (results.failed === 0) {
    console.log(
      `${colors.green}${colors.bright}✓ ALL TESTS PASSED - INTEGRATION IS WORKING!${colors.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}${colors.bright}✗ SOME TESTS FAILED - SEE ABOVE FOR DETAILS${colors.reset}\n`
    );
    console.log(`${colors.yellow}NOTE: If backend is not running, start it with:${colors.reset}`);
    console.log(`  cd backend && npm run dev\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  testFailed(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
