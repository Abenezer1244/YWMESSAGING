/**
 * Test Production Registration API
 * Tests the production API to debug 400 Bad Request error
 */

import axios from 'axios';

async function testProductionRegistration() {
  console.log('\n🔍 Testing Production Registration API...\n');

  const testData = {
    email: `debug-test-${Date.now()}@test.com`,
    password: 'TestPass123!',
    firstName: 'Debug',
    lastName: 'Test',
    churchName: `Debug Church ${Date.now()}`
  };

  console.log('📤 Sending registration request:');
  console.log('   API: https://api.koinoniasms.com/api/auth/register');
  console.log('   Data:', JSON.stringify(testData, null, 2));
  console.log('');

  try {
    const response = await axios.post(
      'https://api.koinoniasms.com/api/auth/register',
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 90000 // 90 second timeout
      }
    );

    console.log('✅ SUCCESS!');
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    console.log('');

  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.log('❌ SERVER ERROR:');
      console.log('   Status:', error.response.status);
      console.log('   Status Text:', error.response.statusText);
      console.log('   Error Data:', JSON.stringify(error.response.data, null, 2));
      console.log('   Headers:', JSON.stringify(error.response.headers, null, 2));
      console.log('');

      // Check for specific validation errors
      if (error.response.data?.details) {
        console.log('🔍 VALIDATION ERRORS:');
        error.response.data.details.forEach((detail, index) => {
          console.log(`   ${index + 1}. Field: ${detail.field || 'unknown'}`);
          console.log(`      Message: ${detail.message || 'No message'}`);
          console.log(`      Code: ${detail.code || 'No code'}`);
        });
        console.log('');
      }

    } else if (error.request) {
      // Request made but no response
      console.log('❌ NO RESPONSE:');
      console.log('   Request was made but no response received');
      console.log('   This could indicate:');
      console.log('   - Server is down');
      console.log('   - Network issue');
      console.log('   - DNS problem');
      console.log('');

    } else {
      // Something else went wrong
      console.log('❌ REQUEST ERROR:');
      console.log('   Error:', error.message);
      console.log('');
    }

    process.exit(1);
  }
}

// Test different scenarios
async function runFullTest() {
  console.log('═══════════════════════════════════════════════════');
  console.log('PRODUCTION REGISTRATION API TEST');
  console.log('═══════════════════════════════════════════════════\n');

  // Test 1: Valid registration
  console.log('[TEST 1] Valid Registration Data\n');
  await testProductionRegistration();

  console.log('═══════════════════════════════════════════════════');
  console.log('✅ All tests completed');
  console.log('═══════════════════════════════════════════════════\n');
  process.exit(0);
}

runFullTest();
