/**
 * DEBUG: Focused import test to understand the 99/100 discrepancy
 */
const { chromium } = require('@playwright/test');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'https://api.koinoniasms.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  console.log(`[DEBUG] ${msg}`);
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Step 1: Register new account
    log('STEP 1: Register account');
    const email = `test${Date.now()}@debug-import.com`;
    const password = 'TestPassword123!';

    await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="firstName"]', 'Debug');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="churchName"]', `Church${Date.now()}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await sleep(2000); // Wait for auth store to update

    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!token) {
      token = await page.evaluate(() => sessionStorage.getItem('accessToken'));
    }

    if (!token) {
      // Try different storage locations
      const cookies = await page.context().cookies();
      const tokenCookie = cookies.find(c => c.name === 'accessToken' || c.name === 'token');
      token = tokenCookie?.value;
    }

    if (!token) {
      throw new Error('Could not retrieve auth token after registration');
    }
    log(`Account created: ${email}, Token length: ${token.length}`);

    // Step 2: Get church/profile info
    log('STEP 2: Get church info');
    const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    const churchId = profileRes.data?.data?.church?.id;
    log(`Church ID: ${churchId}`);

    // Step 3: Create branch
    log('STEP 3: Create branch');
    const branchRes = await axios.post(
      `${API_URL}/api/branches/churches/${churchId}/branches`,
      { name: `Branch${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
    );
    const branchId = branchRes.data?.data?.id;
    log(`Branch created: ${branchId}`);

    // Step 4: Create group
    log('STEP 4: Create group');
    const groupRes = await axios.post(
      `${API_URL}/api/groups/branches/${branchId}/groups`,
      { name: `Group${Date.now()}` },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
    );
    const groupId = groupRes.data?.data?.id;
    log(`Group created: ${groupId}`);

    // Step 5: Count members BEFORE import
    log('STEP 5: Count members before import');
    const beforeRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
    );
    const beforeMembers = beforeRes.data?.data || [];
    log(`Members before: ${beforeMembers.length}`);
    if (beforeMembers.length > 0) {
      log(`  First member: ${beforeMembers[0].firstName} ${beforeMembers[0].lastName} (${beforeMembers[0].phone})`);
    }

    // Step 6: Create CSV with 100 members - VALID PHONE NUMBERS
    log('STEP 6: Create CSV');
    let csvContent = 'firstName,lastName,phone\n';
    const phones = [];
    for (let i = 1; i <= 100; i++) {
      // Create valid US phone numbers in E.164 format: +1 + 10 digits
      const phone = `+1200000${String(i).padStart(4, '0')}`;
      phones.push(phone);
      csvContent += `First${i},Last${i},${phone}\n`;
    }

    const csvLines = csvContent.split('\n').filter(l => l.trim()).length;
    log(`CSV created: ${csvLines} data rows (plus 1 header)`);
    log(`Sample phones: ${phones.slice(0, 3).join(', ')} ... ${phones.slice(-2).join(', ')}`);

    // Step 7: Import members
    log('STEP 7: Import 100 members');
    const form = new FormData();
    form.append('file', Buffer.from(csvContent), { filename: 'test.csv' });

    const importRes = await axios.post(
      `${API_URL}/api/groups/${groupId}/members/import`,
      form,
      {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
        timeout: 120000,
      }
    );

    const importData = importRes.data?.data || {};
    log(`Import response: imported=${importData.imported}, failed=${importData.failed}`);

    if (importData.failedDetails && importData.failedDetails.length > 0) {
      log(`Failed members (${importData.failedDetails.length}):`);
      importData.failedDetails.slice(0, 5).forEach((fail, idx) => {
        log(`  ${idx + 1}. ${fail.member.firstName} ${fail.member.lastName}: ${fail.errors.join(' | ')}`);
      });
      if (importData.failedDetails.length > 5) {
        log(`  ... and ${importData.failedDetails.length - 5} more`);
      }
    }

    // Step 8: Wait a bit for DB
    log('STEP 8: Wait for DB (2 seconds)');
    await sleep(2000);

    // Step 9: Count members AFTER import
    log('STEP 9: Count members after import');
    const afterRes = await axios.get(
      `${API_URL}/api/groups/${groupId}/members?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
    );
    const afterMembers = afterRes.data?.data || [];
    log(`Members after: ${afterMembers.length}`);
    log(`Net new: ${afterMembers.length - beforeMembers.length} (expected: 100)`);

    // Step 10: Detailed analysis
    log('STEP 10: Analysis');
    if (afterMembers.length !== beforeMembers.length + 100) {
      log(`❌ MISMATCH: Expected ${beforeMembers.length + 100}, got ${afterMembers.length}`);
      log(`Missing: ${beforeMembers.length + 100 - afterMembers.length} members`);

      // Check if any imported members are missing
      const importedPhones = new Set(phones);
      const afterPhones = new Set(afterMembers.map(m => m.phone));

      let missingCount = 0;
      const missingSamples = [];
      for (const phone of importedPhones) {
        if (!afterPhones.has(phone)) {
          missingCount++;
          if (missingSamples.length < 3) {
            missingSamples.push(phone);
          }
        }
      }

      if (missingCount > 0) {
        log(`Members not found in final list: ${missingCount}`);
        log(`  Samples: ${missingSamples.join(', ')}`);
      }
    } else {
      log(`✅ SUCCESS: All 100 members imported correctly`);
    }

    // Step 11: Verify member data integrity
    log('STEP 11: Verify data integrity');
    const sampleMember = afterMembers[0];
    log(`Sample member from response: ${sampleMember.firstName} ${sampleMember.lastName} (${sampleMember.phone})`);

  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    if (error.response?.data) {
      log(`Response: ${JSON.stringify(error.response.data)}`);
    }
  } finally {
    await browser.close();
  }
}

test().catch(console.error);
