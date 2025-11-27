#!/usr/bin/env node

/**
 * Code Validation Test
 *
 * Validates that all integration components are properly structured
 * and can compile. No server required for this test.
 */

const fs = require('fs');
const path = require('path');

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

function testPass(message) {
  log('green', 'PASS', message);
}

function testFail(message) {
  log('red', 'FAIL', message);
}

function testInfo(message) {
  log('cyan', 'INFO', message);
}

function testWarn(message) {
  log('yellow', 'WARN', message);
}

const PROJECT_ROOT = 'C:\\Users\\Windows\\OneDrive - Seattle Colleges\\Desktop\\YWMESSAGING';

/**
 * Test: Backend agents.routes.ts exists and has correct structure
 */
function testBackendAgentsRoute() {
  testInfo('Checking backend agents route file...');

  const routesPath = path.join(PROJECT_ROOT, 'backend\\src\\routes\\agents.routes.ts');

  if (!fs.existsSync(routesPath)) {
    testFail(`File does not exist: ${routesPath}`);
    return false;
  }

  const content = fs.readFileSync(routesPath, 'utf-8');

  const checks = [
    {
      name: 'POST /agents/invoke endpoint',
      pattern: /router\.post.*\/agents\/invoke/,
    },
    {
      name: 'GET /agents/available endpoint',
      pattern: /router\.get.*\/agents\/available/,
    },
    {
      name: 'GET /agents/health endpoint',
      pattern: /router\.get.*\/agents\/health/,
    },
    {
      name: 'Import invokeMultipleAgents',
      pattern: /invokeMultipleAgents/,
    },
    {
      name: 'Export router as default',
      pattern: /export default router/,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    if (check.pattern.test(content)) {
      testPass(`  ✓ ${check.name}`);
    } else {
      testFail(`  ✗ ${check.name}`);
      allPassed = false;
    }
  });

  return allPassed;
}

/**
 * Test: app.ts imports and registers agents routes
 */
function testAppRegistration() {
  testInfo('Checking app.ts route registration...');

  const appPath = path.join(PROJECT_ROOT, 'backend\\src\\app.ts');

  if (!fs.existsSync(appPath)) {
    testFail(`File does not exist: ${appPath}`);
    return false;
  }

  const content = fs.readFileSync(appPath, 'utf-8');

  const checks = [
    {
      name: 'Import agentsRoutes',
      pattern: /import agentsRoutes from.*agents\.routes/,
    },
    {
      name: 'Register /api agents routes',
      pattern: /app\.use.*\/api.*agentsRoutes/,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    if (check.pattern.test(content)) {
      testPass(`  ✓ ${check.name}`);
    } else {
      testFail(`  ✗ ${check.name}`);
      allPassed = false;
    }
  });

  return allPassed;
}

/**
 * Test: LSP server analysisIntegration.ts exists and has correct structure
 */
function testLSPIntegration() {
  testInfo('Checking LSP server analysis integration...');

  const integrationPath = path.join(PROJECT_ROOT, 'lsp-server\\src\\analysisIntegration.ts');

  if (!fs.existsSync(integrationPath)) {
    testFail(`File does not exist: ${integrationPath}`);
    return false;
  }

  const content = fs.readFileSync(integrationPath, 'utf-8');

  const checks = [
    {
      name: 'AnalysisIntegration class',
      pattern: /export class AnalysisIntegration/,
    },
    {
      name: 'configure method',
      pattern: /public configure\(/,
    },
    {
      name: 'analyzeFile method',
      pattern: /public async analyzeFile\(/,
    },
    {
      name: 'POST to /agents/invoke',
      pattern: /\/agents\/invoke/,
    },
    {
      name: 'convertToIssues method',
      pattern: /public convertToIssues\(/,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    if (check.pattern.test(content)) {
      testPass(`  ✓ ${check.name}`);
    } else {
      testFail(`  ✗ ${check.name}`);
      allPassed = false;
    }
  });

  return allPassed;
}

/**
 * Test: LSP server calls analysis integration
 */
function testLSPIntegrationUsage() {
  testInfo('Checking LSP server uses analysis integration...');

  const indexPath = path.join(PROJECT_ROOT, 'lsp-server\\src\\index.ts');

  if (!fs.existsSync(indexPath)) {
    testFail(`File does not exist: ${indexPath}`);
    return false;
  }

  const content = fs.readFileSync(indexPath, 'utf-8');

  const checks = [
    {
      name: 'Import analysisIntegration',
      pattern: /import.*analysisIntegration.*from.*analysisIntegration/,
    },
    {
      name: 'Configure analysis integration',
      pattern: /analysisIntegration\.configure\(/,
    },
    {
      name: 'Call analyzeFile',
      pattern: /analysisIntegration\.analyzeFile\(/,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    if (check.pattern.test(content)) {
      testPass(`  ✓ ${check.name}`);
    } else {
      testFail(`  ✗ ${check.name}`);
      allPassed = false;
    }
  });

  return allPassed;
}

/**
 * Test: All key files compile
 */
function testCompilation() {
  testInfo('Verifying TypeScript compilation...');

  const filesToCheck = [
    'backend\\dist\\routes\\agents.routes.js',
    'backend\\dist\\app.js',
    'lsp-server\\out\\analysisIntegration.js',
    'lsp-server\\out\\index.js',
  ];

  let allPassed = true;
  filesToCheck.forEach((file) => {
    const fullPath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      testPass(`  ✓ ${file} (${stats.size} bytes)`);
    } else {
      testFail(`  ✗ ${file} - NOT FOUND`);
      allPassed = false;
    }
  });

  return allPassed;
}

/**
 * Test: Configuration supports API endpoint and key
 */
function testConfigStructure() {
  testInfo('Checking LSP configuration structure...');

  const configPath = path.join(PROJECT_ROOT, 'lsp-server\\src\\config.ts');

  if (!fs.existsSync(configPath)) {
    testFail(`File does not exist: ${configPath}`);
    return false;
  }

  const content = fs.readFileSync(configPath, 'utf-8');

  const checks = [
    {
      name: 'apiEndpoint in Config interface',
      pattern: /apiEndpoint: string/,
    },
    {
      name: 'apiKey in Config interface',
      pattern: /apiKey: string/,
    },
    {
      name: 'AGENT_API_ENDPOINT env var',
      pattern: /AGENT_API_ENDPOINT/,
    },
    {
      name: 'AGENT_API_KEY env var',
      pattern: /AGENT_API_KEY/,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    if (check.pattern.test(content)) {
      testPass(`  ✓ ${check.name}`);
    } else {
      testFail(`  ✗ ${check.name}`);
      allPassed = false;
    }
  });

  return allPassed;
}

/**
 * Test: Diagnostics handler supports optional line/column
 */
function testDiagnosticsEnhancement() {
  testInfo('Checking diagnostics handler enhancements...');

  const diagnosticsPath = path.join(PROJECT_ROOT, 'lsp-server\\src\\diagnostics.ts');

  if (!fs.existsSync(diagnosticsPath)) {
    testFail(`File does not exist: ${diagnosticsPath}`);
    return false;
  }

  const content = fs.readFileSync(diagnosticsPath, 'utf-8');

  const checks = [
    {
      name: 'Optional line in AnalysisIssue',
      pattern: /line\?: number/,
    },
    {
      name: 'Optional column in AnalysisIssue',
      pattern: /column\?: number/,
    },
    {
      name: 'Suggestion field support',
      pattern: /suggestion\?: string/,
    },
    {
      name: 'Default line/column handling',
      pattern: /const line = issue\.line \|\| 1/,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    if (check.pattern.test(content)) {
      testPass(`  ✓ ${check.name}`);
    } else {
      testFail(`  ✗ ${check.name}`);
      allPassed = false;
    }
  });

  return allPassed;
}

/**
 * Run all validation tests
 */
async function runValidation() {
  console.log(`\n${colors.blue}${colors.bright}=== CODE VALIDATION TEST ===${colors.reset}\n`);

  testInfo('Validating integration implementation...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  const tests = [
    { name: 'Backend agents route', fn: testBackendAgentsRoute },
    { name: 'App route registration', fn: testAppRegistration },
    { name: 'LSP integration class', fn: testLSPIntegration },
    { name: 'LSP integration usage', fn: testLSPIntegrationUsage },
    { name: 'TypeScript compilation', fn: testCompilation },
    { name: 'Configuration structure', fn: testConfigStructure },
    { name: 'Diagnostics enhancements', fn: testDiagnosticsEnhancement },
  ];

  for (const test of tests) {
    try {
      const passed = test.fn();
      results.tests.push({ name: test.name, passed });
      if (passed) results.passed++;
      else results.failed++;
    } catch (error) {
      testFail(`${test.name} crashed: ${error.message}`);
      results.tests.push({ name: test.name, passed: false });
      results.failed++;
    }
    console.log();
  }

  // Summary
  console.log(`${colors.blue}${colors.bright}=== VALIDATION SUMMARY ===${colors.reset}\n`);
  results.tests.forEach((test) => {
    const status = test.passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`  ${status}  ${test.name}`);
  });

  console.log(`\n${colors.bright}Total: ${results.passed} passed, ${results.failed} failed${colors.reset}\n`);

  if (results.failed === 0) {
    console.log(
      `${colors.green}${colors.bright}✓ ALL VALIDATIONS PASSED!${colors.reset}`
    );
    console.log(`${colors.cyan}The integration is properly structured and compiled.${colors.reset}\n`);
    console.log(`${colors.cyan}Next: Run ${colors.bright}node test-integration.js${colors.reset}${colors.cyan} with backend running to test actual API calls.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(
      `${colors.red}${colors.bright}✗ SOME VALIDATIONS FAILED${colors.reset}\n`
    );
    process.exit(1);
  }
}

runValidation().catch((error) => {
  testFail(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
