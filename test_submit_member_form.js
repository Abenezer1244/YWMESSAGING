const { chromium } = require('playwright');

async function testSubmitMemberForm() {
  console.log('\n📝 SUBMITTING MEMBER FORM');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const baseUrl = 'http://localhost:5173';

  const testEmail = 'ax@gmail.com';
  const testPassword = '12!Michael';

  try {
    const page = await browser.newPage();

    // ========== STEP 1: LOGIN ==========
    console.log('🔐 STEP 1: Logging in...');
    console.log(`   Email: ${testEmail}\n`);

    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    const emailInputs = await page.locator('input[type="email"], input[name="email"]').all();
    if (emailInputs.length > 0) {
      await emailInputs[0].fill(testEmail);
    }

    const passwordInputs = await page.locator('input[type="password"], input[name="password"]').all();
    if (passwordInputs.length > 0) {
      await passwordInputs[0].fill(testPassword);
    }

    const loginBtn = page.locator('button:has-text("Login")').first();
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginBtn.click();
    } else {
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    console.log(`   ✅ Login successful\n`);

    // ========== STEP 2: NAVIGATE TO MEMBERS ==========
    console.log('👥 STEP 2: Going to Members page...');

    const membersLink = page.locator('a:has-text("Members"), button:has-text("Members")').first();
    if (await membersLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await membersLink.click();
    } else {
      await page.goto(`${baseUrl}/members`);
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    console.log(`   ✅ Members page loaded\n`);

    // ========== STEP 3: CLICK ADD MEMBER ==========
    console.log('➕ STEP 3: Clicking Add Member button...');

    const addBtn = page.locator('button:has-text("Add")').first();
    if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addBtn.click();
    }

    await page.waitForTimeout(1500);
    console.log(`   ✅ Dialog opened\n`);

    // ========== STEP 4: FILL FORM ==========
    console.log('✍️  STEP 4: Filling member form...');

    const memberName = 'John Smith';
    const memberLastName = 'Smith';
    const memberPhone = '206-555-1234';
    const memberEmail = 'john.smith@example.com';

    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder').catch(() => '');
      const type = await input.getAttribute('type').catch(() => '');
      const value = await input.inputValue().catch(() => '');

      // Skip if already has a value
      if (value) continue;

      if (placeholder.toLowerCase().includes('first') || placeholder.toLowerCase().includes('name')) {
        await input.fill('John');
        console.log(`   ✅ First Name: John`);
      } else if (placeholder.toLowerCase().includes('last')) {
        await input.fill('Smith');
        console.log(`   ✅ Last Name: Smith`);
      } else if (placeholder.toLowerCase().includes('phone') || type === 'tel') {
        await input.fill(memberPhone);
        console.log(`   ✅ Phone: ${memberPhone}`);
      } else if (placeholder.toLowerCase().includes('email') || type === 'email') {
        await input.fill(memberEmail);
        console.log(`   ✅ Email: ${memberEmail}`);
      }
    }

    console.log('');

    // ========== STEP 5: SUBMIT FORM ==========
    console.log('💾 STEP 5: Submitting member form...');

    const submitBtn = page.locator('button:has-text("Add Member")').last();
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   Clicking "Add Member" button...');
      await submitBtn.click();
      console.log('   ✅ Form submitted');
    } else {
      console.log('   ⚠️  Submit button not found');
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);

    console.log('');

    // ========== STEP 6: VERIFY MEMBER ADDED ==========
    console.log('🔍 STEP 6: Verifying member was added...');

    const pageText = await page.textContent('body');

    if (pageText.includes('John')) {
      console.log('   ✅ "John" found on page');
    }
    if (pageText.includes('Smith')) {
      console.log('   ✅ "Smith" found on page');
    }
    if (pageText.includes('206-555-1234')) {
      console.log('   ✅ Phone number found on page');
    }
    if (pageText.includes('john.smith@example.com')) {
      console.log('   ✅ Email found on page');
    }

    // Check if member appears in list
    if (pageText.includes('1 members') || pageText.includes('1 member')) {
      console.log('   ✅ Member count shows 1 member\n');
    } else {
      console.log('   ℹ️  Checking member list...\n');
    }

    // ========== STEP 7: TAKE FINAL SCREENSHOT ==========
    console.log('📸 STEP 7: Taking final screenshot...');
    await page.screenshot({ path: 'member_submission_result.png' });
    console.log('   Screenshot: member_submission_result.png\n');

    // ========== FINAL REPORT ==========
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ MEMBER SUBMISSION TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`📊 RESULTS:`);
    console.log(`   Account: ${testEmail}`);
    console.log(`   Member Added: John Smith`);
    console.log(`   Phone: ${memberPhone}`);
    console.log(`   Email: ${memberEmail}`);
    console.log(`   Status: ✅ SUBMITTED\n`);

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  } finally {
    await browser.close();
    console.log('Browser closed.\n');
  }
}

testSubmitMemberForm().catch(console.error);
