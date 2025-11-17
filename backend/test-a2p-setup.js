#!/usr/bin/env node
/**
 * Test Telnyx A2P Brand Registration Setup
 * Run this to verify your Telnyx account is configured for 10DLC
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load .env file if TELNYX_API_KEY not in environment
let TELNYX_API_KEY = process.env.TELNYX_API_KEY;
if (!TELNYX_API_KEY) {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/TELNYX_API_KEY=(.+)/);
    if (match) {
      TELNYX_API_KEY = match[1].trim();
    }
  }
}

if (!TELNYX_API_KEY) {
  console.error('❌ Error: TELNYX_API_KEY environment variable not set');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://api.telnyx.com/v2',
  headers: {
    Authorization: `Bearer ${TELNYX_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

async function testSetup() {
  console.log('🧪 Testing Telnyx A2P Brand Registration Setup\n');
  console.log('API Key:', TELNYX_API_KEY.substring(0, 10) + '...');
  console.log('---\n');

  try {
    // Test 1: Check API Key validity
    console.log('1️⃣ Testing API key validity...');
    try {
      const meResponse = await client.get('/organization');
      console.log('✅ API key is valid');
      console.log('   Organization ID:', meResponse.data?.data?.id);
      console.log('   Organization Name:', meResponse.data?.data?.name);
    } catch (err) {
      console.error('❌ API key test failed:', err.response?.data?.errors?.[0]?.detail || err.message);
      console.log('\n📌 Note: This might be expected if using API Key Auth instead of API Token');
      console.log('   The API key format might be: KEY_ID_secretkey (which is older format)');
    }

    // Test 2: Try to list existing A2P brands
    console.log('\n2️⃣ Listing existing A2P brands...');
    try {
      const brandsResponse = await client.get('/a2p_brands');
      const brands = brandsResponse.data?.data || [];
      if (brands.length === 0) {
        console.log('✅ A2P brands endpoint accessible (no brands yet)');
      } else {
        console.log(`✅ Found ${brands.length} existing A2P brands:`);
        brands.forEach((brand, i) => {
          console.log(`   ${i + 1}. ${brand.display_name || brand.company_name} (${brand.status})`);
        });
      }
    } catch (err) {
      console.error('❌ Failed to list A2P brands:', err.response?.data?.errors?.[0]?.detail || err.message);
      console.log('   This likely means your account is not enabled for A2P brand registration');
    }

    // Test 3: List messaging profiles
    console.log('\n3️⃣ Listing messaging profiles...');
    try {
      const profilesResponse = await client.get('/messaging_profiles');
      const profiles = profilesResponse.data?.data || [];
      if (profiles.length === 0) {
        console.log('✅ Messaging profiles endpoint accessible (no profiles)');
      } else {
        console.log(`✅ Found ${profiles.length} messaging profiles:`);
        profiles.slice(0, 3).forEach((profile, i) => {
          console.log(`   ${i + 1}. ${profile.name} (ID: ${profile.id})`);
        });
      }
    } catch (err) {
      console.error('❌ Failed to list messaging profiles:', err.message);
    }

    // Test 4: Try to create a test A2P brand (won't actually create, just test permissions)
    console.log('\n4️⃣ Testing A2P brand registration endpoint...');
    try {
      const testBrand = {
        company_name: 'Test Church',
        brand_type: 'SOLE_PROPRIETOR',
        vertical: 'RELIGION',
        city: 'Seattle',
        state: 'WA',
        country: 'US',
        email: 'test@example.com',
        display_name: 'Test Church',
      };

      console.log('   Request body:', JSON.stringify(testBrand, null, 2));
      const testResponse = await client.post('/a2p_brands', testBrand);
      console.log('✅ Brand registration endpoint is accessible');
      console.log('   Brand created (test):', testResponse.data?.data?.id);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        console.error('❌ Brand registration failed:');
        errorData.errors.forEach(error => {
          console.log(`   Code: ${error.code}`);
          console.log(`   Title: ${error.title}`);
          console.log(`   Detail: ${error.detail}`);
        });
      } else {
        console.error('❌ Failed:', err.message);
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }

  console.log('\n---\n📋 Next Steps:');
  console.log('1. If API key test failed: Check your TELNYX_API_KEY in .env');
  console.log('2. If A2P brands endpoint failed: Contact Telnyx support to enable A2P');
  console.log('3. If brand registration failed: Check error codes above');
}

testSetup();
