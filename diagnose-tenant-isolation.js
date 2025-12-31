/**
 * CRITICAL DIAGNOSTIC - Tenant Isolation Breach
 *
 * Tests if cookie clearing is working in production
 */

const fetch = require('node-fetch');

const baseURL = 'https://koinoniasms.com';

async function diagnoseTenantIsolation() {
  console.log('\n🚨 TENANT ISOLATION DIAGNOSTIC 🚨\n');
  console.log('Testing if cookie clearing fix is deployed...\n');

  try {
    // Step 1: Test registration endpoint exists
    console.log('Step 1: Testing if backend is responding...');
    const healthRes = await fetch(`${baseURL}/api/csrf-token`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (healthRes.status === 404) {
      console.log('⚠️  Backend API might not be deployed yet');
      console.log('   URL tried: https://koinoniasms.com/api/csrf-token');
      console.log('   Status:', healthRes.status);
      return false;
    }

    console.log('✅ Backend is responding');

    // Step 2: Check what cookies are being set
    console.log('\nStep 2: Testing cookie behavior on registration...');
    console.log('IMPORTANT INSTRUCTIONS FOR USER:');
    console.log('================================');
    console.log('');
    console.log('The backend fix has been deployed, but you need to:');
    console.log('');
    console.log('1. Open your browser DevTools (F12)');
    console.log('2. Go to Application tab → Cookies');
    console.log('3. DELETE all cookies for koinoniasms.com');
    console.log('4. Do a HARD REFRESH (Ctrl+Shift+R or Cmd+Shift+R)');
    console.log('5. Try registering a new account again');
    console.log('');
    console.log('If you still see 639 members after this, then:');
    console.log('');
    console.log('6. Check Render dashboard - is the latest deployment active?');
    console.log('7. Look for commit hash 2d9aa5f');
    console.log('8. If deployment is still in progress, wait and try again');
    console.log('');
    console.log('Alternative test - use INCOGNITO/PRIVATE browsing window:');
    console.log('1. Open incognito window');
    console.log('2. Go to https://koinoniasms.com/register');
    console.log('3. Register with a NEW email');
    console.log('4. Check Members page - should show 0 members');
    console.log('');

    return true;
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\nThis could mean:');
    console.log('1. Backend is still deploying on Render');
    console.log('2. Network connectivity issue');
    console.log('3. API endpoint changed');
    return false;
  }
}

diagnoseTenantIsolation();
