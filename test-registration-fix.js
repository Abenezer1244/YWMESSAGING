/**
 * Verify Connection Limit Fix
 * Tests that tenant registration works after increasing connection_limit to 95
 */

const axios = require('axios');

async function testRegistration() {
  console.log('🔍 Testing tenant registration with increased connection limit...\n');

  const registerData = {
    email: `test-verify-${Date.now()}@test.com`,
    password: 'SecurePass123!',
    firstName: 'Verify',
    lastName: 'ConnectionFix',
    churchName: `Verification Church ${Date.now()}`,
    phoneNumber: `+1206555${Math.floor(1000 + Math.random() * 9000)}`
  };

  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', registerData, {
      timeout: 90000 // 90 second timeout for database provisioning
    });

    if (response.data.data.accessToken) {
      console.log('✅ REGISTRATION SUCCESSFUL!');
      console.log(`   Tenant ID: ${response.data.data.tenantId}`);
      console.log(`   Church Name: ${registerData.churchName}`);
      console.log(`   Email: ${registerData.email}`);
      console.log('\n✅ CONNECTION LIMIT FIX VERIFIED - Registrations working again!\n');
      console.log('📊 Updated Configuration:');
      console.log('   • connection_limit: 30 → 95');
      console.log('   • Render Pro-4gb: Supports 97 connections');
      console.log('   • Capacity: ~47 tenant databases with 95 connection limit\n');
      process.exit(0);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server not running');
      console.log('   Start with: cd backend && npm run dev\n');
    } else {
      console.log('❌ Registration still failing:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      console.log('\n⚠️ Backend may need restart to apply .env changes');
      console.log('   Restart with: Ctrl+C in backend terminal, then npm run dev\n');
    }
    process.exit(1);
  }
}

testRegistration();
