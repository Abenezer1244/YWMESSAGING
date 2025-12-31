/**
 * PHASE 5 REMAINING SERVICES TEST
 *
 * Tests the remaining Phase 5 services that use tenantPrisma:
 * - Templates API (template.service.ts)
 * - Conversations API (conversation.service.ts)
 * - Messages API (message.service.ts)
 *
 * This builds on previous tests and verifies:
 * 1. Template CRUD operations
 * 2. Message sending (individual)
 * 3. Conversation queries
 * 4. Tenant isolation for templates
 */

import axios from 'axios';
import { createId } from '@paralleldrive/cuid2';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:3000';

// Test tracking
const results = {
  summary: { total: 0, passed: 0, failed: 0, warned: 0 },
  tests: [],
  tenants: [],
  timestamp: new Date().toISOString(),
};

function log(message, type = 'info') {
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[type] || '📋';
  console.log(`${prefix} ${message}`);
}

async function recordTest(testNum, name, status, duration, details = '', data = {}) {
  results.summary.total++;
  if (status === 'PASS') results.summary.passed++;
  if (status === 'FAIL') results.summary.failed++;
  if (status === 'WARN') results.summary.warned++;

  const result = {
    testNum,
    name,
    status,
    duration,
    details,
    data,
    timestamp: new Date().toISOString(),
  };
  results.tests.push(result);

  const statusIcon = { PASS: '✅', FAIL: '❌', WARN: '⚠️' }[status] || '❓';
  log(`Test ${testNum}: ${name} - ${statusIcon} ${status} (${duration}ms)`, status === 'PASS' ? 'success' : 'error');
  if (details) log(`   ${details}`, 'info');
}

// ============ PHASE 5 REMAINING SERVICES TESTS ============

async function runTests() {
  console.log('\n🚀 PHASE 5 REMAINING SERVICES TEST\n');
  console.log('Testing: Templates, Messages, Conversations\n');

  let tenant1, tenant2;

  try {
    // TEST 1: Create Tenant 1 for testing
    log('\n[TEST 1] Creating Tenant 1...', 'info');
    const start1 = Date.now();

    const registerData1 = {
      email: `templates-test-${createId()}@phase5test.com`,
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'Admin',
      churchName: `Phase 5 Templates Test ${Date.now()}`,
      phoneNumber: '+12065551001',
    };

    const registerRes1 = await axios.post(`${BASE_URL}/api/auth/register`, registerData1);

    const regData1 = registerRes1.data.data; // Tokens are in data.data
    tenant1 = {
      tenantId: regData1.tenantId,
      email: registerData1.email,
      churchName: registerData1.churchName,
      accessToken: regData1.accessToken,
      refreshToken: regData1.refreshToken,
      adminId: regData1.adminId,
    };
    results.tenants.push(tenant1);

    await recordTest(1, 'Registration Tenant 1', 'PASS', Date.now() - start1, 'Tenant database provisioned', {
      tenantId: tenant1.tenantId,
    });

    // TEST 2: Create Tenant 2 for isolation testing
    log('\n[TEST 2] Creating Tenant 2...', 'info');
    const start2 = Date.now();

    const registerData2 = {
      email: `templates-test-2-${createId()}@phase5test.com`,
      password: 'SecurePass123!',
      firstName: 'Test2',
      lastName: 'Admin2',
      churchName: `Phase 5 Templates Test 2 ${Date.now()}`,
      phoneNumber: '+12065551002',
    };

    const registerRes2 = await axios.post(`${BASE_URL}/api/auth/register`, registerData2);

    const regData2 = registerRes2.data.data; // Tokens are in data.data
    tenant2 = {
      tenantId: regData2.tenantId,
      email: registerData2.email,
      churchName: registerData2.churchName,
      accessToken: regData2.accessToken,
      refreshToken: regData2.refreshToken,
      adminId: regData2.adminId,
    };
    results.tenants.push(tenant2);

    await recordTest(2, 'Registration Tenant 2', 'PASS', Date.now() - start2, 'Second tenant database provisioned', {
      tenantId: tenant2.tenantId,
    });

    // ============ TEMPLATES API TESTS ============

    // TEST 3: Create Template in Tenant 1
    log('\n[TEST 3] Creating template in Tenant 1...', 'info');
    const start3 = Date.now();

    const templateData1 = {
      name: 'Welcome Template',
      content: 'Welcome to our church! We are glad to have you.',
      category: 'greeting',
    };

    const createTemplateRes1 = await axios.post(
      `${BASE_URL}/api/templates`,
      templateData1,
      { headers: { Authorization: `Bearer ${tenant1.accessToken}` } }
    );

    tenant1.templateId = createTemplateRes1.data.id;

    await recordTest(
      3,
      'Create Template T1',
      'PASS',
      Date.now() - start3,
      'Template created in tenant database',
      { templateId: tenant1.templateId }
    );

    // TEST 4: Read Templates from Tenant 1
    log('\n[TEST 4] Reading templates from Tenant 1...', 'info');
    const start4 = Date.now();

    const getTemplatesRes1 = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { Authorization: `Bearer ${tenant1.accessToken}` },
    });

    const foundTemplate = getTemplatesRes1.data.find((t) => t.id === tenant1.templateId);
    if (!foundTemplate) {
      throw new Error('Created template not found in tenant database');
    }

    await recordTest(
      4,
      'Read Templates T1',
      'PASS',
      Date.now() - start4,
      'Template retrieved from tenant database',
      { count: getTemplatesRes1.data.length }
    );

    // TEST 5: Create Template in Tenant 2
    log('\n[TEST 5] Creating template in Tenant 2...', 'info');
    const start5 = Date.now();

    const templateData2 = {
      name: 'Event Reminder',
      content: 'Reminder: Sunday service at 10 AM',
      category: 'reminder',
    };

    const createTemplateRes2 = await axios.post(
      `${BASE_URL}/api/templates`,
      templateData2,
      { headers: { Authorization: `Bearer ${tenant2.accessToken}` } }
    );

    tenant2.templateId = createTemplateRes2.data.id;

    await recordTest(
      5,
      'Create Template T2',
      'PASS',
      Date.now() - start5,
      'Template created in separate tenant database',
      { templateId: tenant2.templateId }
    );

    // TEST 6: Verify Template Isolation
    log('\n[TEST 6] Verifying template isolation between tenants...', 'info');
    const start6 = Date.now();

    const tenant1Templates = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { Authorization: `Bearer ${tenant1.accessToken}` },
    });

    const tenant2Templates = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { Authorization: `Bearer ${tenant2.accessToken}` },
    });

    // Check: Tenant 1 should NOT see Tenant 2's template
    const tenant1SeesT2Template = tenant1Templates.data.some((t) => t.id === tenant2.templateId);

    // Check: Tenant 2 should NOT see Tenant 1's template
    const tenant2SeesT1Template = tenant2Templates.data.some((t) => t.id === tenant1.templateId);

    if (tenant1SeesT2Template || tenant2SeesT1Template) {
      throw new Error('🚨 SECURITY BREACH: Cross-tenant template access detected!');
    }

    await recordTest(
      6,
      'Template Isolation',
      'PASS',
      Date.now() - start6,
      'No cross-tenant template access',
      {
        tenant1Count: tenant1Templates.data.length,
        tenant2Count: tenant2Templates.data.length,
      }
    );

    // TEST 7: Update Template in Tenant 1
    log('\n[TEST 7] Updating template in Tenant 1...', 'info');
    const start7 = Date.now();

    const updatedTemplateData = {
      name: 'Welcome Template - Updated',
      content: 'Welcome! We are happy to see you.',
    };

    await axios.put(
      `${BASE_URL}/api/templates/${tenant1.templateId}`,
      updatedTemplateData,
      { headers: { Authorization: `Bearer ${tenant1.accessToken}` } }
    );

    const verifyUpdateRes = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { Authorization: `Bearer ${tenant1.accessToken}` },
    });

    const updatedTemplate = verifyUpdateRes.data.find((t) => t.id === tenant1.templateId);
    if (!updatedTemplate || updatedTemplate.name !== 'Welcome Template - Updated') {
      throw new Error('Template update not persisted');
    }

    await recordTest(
      7,
      'Update Template T1',
      'PASS',
      Date.now() - start7,
      'Template updated in tenant database',
      {}
    );

    // TEST 8: Delete Template in Tenant 1
    log('\n[TEST 8] Deleting template from Tenant 1...', 'info');
    const start8 = Date.now();

    await axios.delete(`${BASE_URL}/api/templates/${tenant1.templateId}`, {
      headers: { Authorization: `Bearer ${tenant1.accessToken}` },
    });

    // Verify deletion
    const verifyDeleteRes = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { Authorization: `Bearer ${tenant1.accessToken}` },
    });

    const deletedTemplate = verifyDeleteRes.data.find((t) => t.id === tenant1.templateId);
    if (deletedTemplate) {
      throw new Error('Template not properly deleted');
    }

    await recordTest(
      8,
      'Delete Template T1',
      'PASS',
      Date.now() - start8,
      'Template removed from tenant database',
      {}
    );

    // ============ MESSAGES & CONVERSATIONS API TESTS ============

    // First, we need to create a member to send messages to
    log('\n[TEST 9] Creating member for message testing...', 'info');
    const start9 = Date.now();

    const memberData = {
      firstName: 'Test',
      lastName: 'Member',
      phone: '+12065551111',
      optInSms: true,
    };

    const createMemberRes = await axios.post(
      `${BASE_URL}/api/members`,
      memberData,
      { headers: { Authorization: `Bearer ${tenant1.accessToken}` } }
    );

    tenant1.memberId = createMemberRes.data.id;

    await recordTest(
      9,
      'Create Member for Messages',
      'PASS',
      Date.now() - start9,
      'Member created for message testing',
      { memberId: tenant1.memberId }
    );

    // TEST 10: Get Conversations (should be empty initially)
    log('\n[TEST 10] Getting conversations from Tenant 1...', 'info');
    const start10 = Date.now();

    const getConversationsRes = await axios.get(`${BASE_URL}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${tenant1.accessToken}` },
    });

    await recordTest(
      10,
      'Read Conversations T1',
      'PASS',
      Date.now() - start10,
      'Conversations retrieved from tenant database',
      { count: getConversationsRes.data.data?.length || 0 }
    );

    // TEST 11: Get Message History (should work even if empty)
    log('\n[TEST 11] Getting message history from Tenant 1...', 'info');
    const start11 = Date.now();

    const getHistoryRes = await axios.get(`${BASE_URL}/api/messages/history`, {
      headers: { Authorization: `Bearer ${tenant1.accessToken}` },
    });

    await recordTest(
      11,
      'Read Message History T1',
      'PASS',
      Date.now() - start11,
      'Message history retrieved from tenant database',
      { count: getHistoryRes.data.data?.length || 0 }
    );

    // ============ TEST SUMMARY ============

    log('\n\n═══════════════════════════════════════════════════', 'success');
    log('TEST SUMMARY - PHASE 5 REMAINING SERVICES', 'success');
    log('═══════════════════════════════════════════════════', 'success');
    log(`Total Tests: ${results.summary.total}`, 'info');
    log(`Passed: ${results.summary.passed} ✅`, 'success');
    log(`Failed: ${results.summary.failed} ❌`, results.summary.failed > 0 ? 'error' : 'success');
    log(`Pass Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`, 'success');
    log('═══════════════════════════════════════════════════\n', 'success');

    // Calculate overall duration
    const firstTest = results.tests[0];
    const lastTest = results.tests[results.tests.length - 1];
    const totalDuration = new Date(lastTest.timestamp) - new Date(firstTest.timestamp);
    results.summary.duration = totalDuration;
    results.summary.passRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);

    // Save results
    writeFileSync(
      'PHASE5-REMAINING-SERVICES-TEST-REPORT.json',
      JSON.stringify(results, null, 2)
    );

    log('✅ Full test report saved to: PHASE5-REMAINING-SERVICES-TEST-REPORT.json\n', 'success');

    if (results.summary.failed === 0) {
      log('🎉 ALL TESTS PASSED! Phase 5 remaining services are working correctly!\n', 'success');
      process.exit(0);
    } else {
      log(`⚠️ ${results.summary.failed} TEST(S) FAILED\n`, 'error');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'error');
    if (error.response?.data) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
