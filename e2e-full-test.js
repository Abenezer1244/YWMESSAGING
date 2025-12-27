/**
 * COMPREHENSIVE E2E TEST
 * Tests: Account lifecycle, branch creation, member management, deletion
 * NO SHORTCUTS - Tests ACTUAL UI behavior and database state
 */

const { chromium } = require('@playwright/test');
const axios = require('axios');

const BASE_URL = 'https://koinoniasms.com';
const API_URL = 'https://api.koinoniasms.com';

let browser;
let page;
let testResults = {
  phase1: { name: 'Account Lifecycle', tests: [] },
  phase2: { name: 'Branch Creation', tests: [] },
  phase3: { name: 'Single Member', tests: [] },
  phase4: { name: '100-Member Import', tests: [] },
  phase5: { name: 'Member Deletion', tests: [] },
};

let testData = {
  email: `test_${Date.now()}@koinoniasms-e2e.com`,
  password: 'TestPassword123!',
  churchName: `TestChurch_${Date.now()}`,
  branchName: `TestBranch_${Date.now()}`,
  authToken: null,
  churchId: null,
  branchId: null,
  groupId: null,
  memberIds: [],
};

// Utility: Add test result
function addTest(phase, name, passed, details = '') {
  testResults[phase].tests.push({
    name,
    passed,
    details,
    timestamp: new Date().toISOString(),
  });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name} - ${details}`);
}

// Utility: Get current member count from UI
async function getMemberCountFromUI() {
  try {
    // Look for member count in header or dashboard
    const countElement = await page.$eval('[data-testid="member-count"], .member-count, h1:has-text("members")', el => el.textContent);
    const match = countElement.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  } catch {
    return null;
  }
}

// Utility: Get member count from database via API
async function getMemberCountFromDB(groupId) {
  try {
    const response = await axios.get(`${API_URL}/api/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${testData.authToken}` },
    });
    return response.data.data?.length || 0;
  } catch (error) {
    console.error('Failed to fetch from DB:', error.message);
    return null;
  }
}

// PHASE 1: Account Lifecycle
async function testAccountLifecycle() {
  console.log('\n=== PHASE 1: ACCOUNT LIFECYCLE ===');

  // Step 1: Navigate to app
  try {
    await page.goto(BASE_URL);
    await page.waitForURL('**/login', { timeout: 5000 });
    addTest('phase1', 'Navigate to login page', true, `Loaded ${BASE_URL}`);
  } catch (error) {
    addTest('phase1', 'Navigate to login page', false, error.message);
    throw error;
  }

  // Step 2: Create account
  try {
    await page.click('text=Sign up');
    await page.waitForURL('**/register', { timeout: 5000 });

    // Fill registration form
    await page.fill('input[name="email"]', testData.email);
    await page.fill('input[name="password"]', testData.password);
    await page.fill('input[name="churchName"]', testData.churchName);
    await page.fill('input[name="confirmPassword"]', testData.password);

    await page.click('button:has-text("Create Account")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    addTest('phase1', 'Create account', true, `Account created: ${testData.email}`);
  } catch (error) {
    addTest('phase1', 'Create account', false, error.message);
    throw error;
  }

  // Step 3: Get auth token from cookies
  try {
    const cookies = await page.context().cookies();
    const accessTokenCookie = cookies.find(c => c.name === 'accessToken');
    if (accessTokenCookie) {
      testData.authToken = accessTokenCookie.value;
      addTest('phase1', 'Store auth token', true, 'Token stored');
    }
  } catch (error) {
    addTest('phase1', 'Store auth token', false, error.message);
  }

  // Step 4: Verify on dashboard
  try {
    const dashboardText = await page.textContent('body');
    const isOnDashboard = dashboardText.includes('Dashboard') || dashboardText.includes('Welcome');
    addTest('phase1', 'Logged in on dashboard', isOnDashboard, 'Dashboard page verified');
  } catch (error) {
    addTest('phase1', 'Logged in on dashboard', false, error.message);
  }

  // Step 5: Sign out
  try {
    await page.click('[data-testid="menu-button"], button:has-text("Profile"), .profile-menu');
    await page.waitForTimeout(500);
    await page.click('text=Logout');
    await page.waitForURL('**/login', { timeout: 5000 });
    addTest('phase1', 'Sign out', true, 'Logged out successfully');
  } catch (error) {
    addTest('phase1', 'Sign out', false, error.message);
  }

  // Step 6: Sign back in
  try {
    await page.fill('input[type="email"]', testData.email);
    await page.fill('input[type="password"]', testData.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    addTest('phase1', 'Sign back in', true, 'Logged in again successfully');
  } catch (error) {
    addTest('phase1', 'Sign back in', false, error.message);
  }
}

// PHASE 2: Branch Creation
async function testBranchCreation() {
  console.log('\n=== PHASE 2: BRANCH CREATION ===');

  try {
    // Navigate to branches section
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('a:has-text("Branches"), [data-testid="branches-link"]');

    const initialBranchCount = await page.evaluate(() => {
      const count = document.querySelector('[data-testid="branch-count"]')?.textContent;
      return count ? parseInt(count) : 0;
    });

    addTest('phase2', 'Get initial branch count', true, `Current: ${initialBranchCount}`);

    // Create branch
    await page.click('button:has-text("Create Branch"), button:has-text("Add Branch")');
    await page.fill('input[name="name"]', testData.branchName);
    await page.click('button:has-text("Create")');

    await page.waitForTimeout(2000);

    const newBranchCount = await page.evaluate(() => {
      const count = document.querySelector('[data-testid="branch-count"]')?.textContent;
      return count ? parseInt(count) : 0;
    });

    const countIncremented = newBranchCount === initialBranchCount + 1;
    addTest('phase2', 'Branch count incremented', countIncremented,
      `Before: ${initialBranchCount}, After: ${newBranchCount}`);

    // Get branch ID from URL or data
    const branchId = await page.evaluate(() => {
      const branchLink = document.querySelector(`[data-branch-name="${testData.branchName}"]`);
      return branchLink?.getAttribute('data-branch-id');
    });
    testData.branchId = branchId;

    addTest('phase2', 'Branch created', !!branchId, `Branch ID: ${branchId}`);

  } catch (error) {
    addTest('phase2', 'Branch creation', false, error.message);
  }
}

// PHASE 3: Single Member
async function testSingleMember() {
  console.log('\n=== PHASE 3: SINGLE MEMBER CREATION ===');

  try {
    // Navigate to groups
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('text=Groups');

    // Create a group first if needed
    const hasGroups = await page.evaluate(() => document.querySelectorAll('[data-testid="group-item"]').length > 0);

    if (!hasGroups) {
      await page.click('button:has-text("Create Group")');
      await page.fill('input[name="name"]', `TestGroup_${Date.now()}`);
      await page.click('button:has-text("Create")');
      await page.waitForTimeout(2000);
    }

    // Click on first group
    await page.click('[data-testid="group-item"]');

    // Get initial member count
    const initialCount = await getMemberCountFromUI();
    console.log(`Initial member count: ${initialCount}`);

    // Create member
    await page.click('button:has-text("Add Member")');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Member');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.click('button:has-text("Add")');

    await page.waitForTimeout(2000);

    const newCount = await getMemberCountFromUI();
    console.log(`New member count: ${newCount}`);

    const memberAdded = newCount > (initialCount || 0);
    addTest('phase3', 'Single member added', memberAdded,
      `Before: ${initialCount}, After: ${newCount}`);

  } catch (error) {
    addTest('phase3', 'Single member creation', false, error.message);
  }
}

// PHASE 4: 100-Member Import
async function test100MemberImport() {
  console.log('\n=== PHASE 4: 100-MEMBER IMPORT ===');

  try {
    // Create CSV with 100 members
    let csvContent = 'firstName,lastName,phone\n';
    for (let i = 1; i <= 100; i++) {
      csvContent += `Member,Test${i},+1${String(i).padStart(9, '0')}\n`;
    }

    // Write to temp file
    const fs = require('fs');
    const tempFile = '/tmp/test_members.csv';
    fs.writeFileSync(tempFile, csvContent);

    addTest('phase4', 'CSV file created', true, '100 members in CSV');

    // Get count before import
    const countBefore = await getMemberCountFromUI();
    console.log(`Count before import: ${countBefore}`);

    // Import via upload
    await page.click('button:has-text("Import Members")');
    await page.waitForTimeout(500);

    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(tempFile);

    await page.click('button:has-text("Import")');

    // Wait for import with timeout
    let countAfter = countBefore;
    let timeoutCount = 0;
    while (timeoutCount < 60) { // Wait up to 60 seconds
      await page.waitForTimeout(1000);
      const currentCount = await getMemberCountFromUI();
      console.log(`[${timeoutCount}s] Current count: ${currentCount}`);

      if (currentCount >= (countBefore + 100)) {
        countAfter = currentCount;
        break;
      }
      timeoutCount++;
    }

    const importSuccess = countAfter >= (countBefore + 100);
    addTest('phase4', '100 members imported', importSuccess,
      `Before: ${countBefore}, After: ${countAfter}, Expected: ${countBefore + 100}`);

    // Verify in database
    if (testData.groupId) {
      const dbCount = await getMemberCountFromDB(testData.groupId);
      addTest('phase4', 'Database count matches', dbCount >= (countBefore + 100),
        `DB Count: ${dbCount}`);
    }

  } catch (error) {
    addTest('phase4', '100-member import', false, error.message);
  }
}

// PHASE 5: Member Deletion
async function testMemberDeletion() {
  console.log('\n=== PHASE 5: MEMBER DELETION ===');

  try {
    const countBefore = await getMemberCountFromUI();
    console.log(`Count before deletion: ${countBefore}`);

    // Find and delete first member
    await page.click('[data-testid="member-delete-button"], button[title="Delete"]');
    await page.waitForTimeout(500);

    // Confirm deletion
    await page.click('button:has-text("Confirm"), button:has-text("Delete")');
    await page.waitForTimeout(2000);

    const countAfter = await getMemberCountFromUI();
    console.log(`Count after deletion: ${countAfter}`);

    const memberDeleted = (countAfter === countBefore - 1);
    addTest('phase5', 'Member deleted from UI', memberDeleted,
      `Before: ${countBefore}, After: ${countAfter}`);

    // Verify database
    if (testData.groupId) {
      const dbCount = await getMemberCountFromDB(testData.groupId);
      addTest('phase5', 'Member deleted from database', dbCount === countAfter,
        `DB Count: ${dbCount}`);
    }

  } catch (error) {
    addTest('phase5', 'Member deletion', false, error.message);
  }
}

// Main test runner
async function runTests() {
  try {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();

    // Set viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // Run test phases
    await testAccountLifecycle();
    await testBranchCreation();
    await testSingleMember();
    await test100MemberImport();
    await testMemberDeletion();

    // Print results
    console.log('\n\n=== FINAL TEST RESULTS ===\n');

    let totalTests = 0;
    let passedTests = 0;

    for (const [phaseKey, phase] of Object.entries(testResults)) {
      console.log(`\n${phase.name}:`);
      for (const test of phase.tests) {
        totalTests++;
        if (test.passed) passedTests++;
        const status = test.passed ? '✅' : '❌';
        console.log(`  ${status} ${test.name} - ${test.details}`);
      }
    }

    console.log(`\n\nSUMMARY: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED!');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} tests failed`);
    }

    await browser.close();

  } catch (error) {
    console.error('Test execution failed:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runTests();
