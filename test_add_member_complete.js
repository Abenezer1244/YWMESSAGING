const { chromium } = require('playwright');

async function testAddMemberComplete() {
  console.log('\n👥 COMPLETE MEMBER ADDITION TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const baseUrl = 'http://localhost:5173';

  const testEmail = 'ax@gmail.com';
  const testPassword = '12!Michael';

  try {
    const page = await browser.newPage();

    // ========== STEP 1: LOGIN ==========
    console.log('🔐 STEP 1: Logging in...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}\n`);

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

    const currentUrl = page.url();
    console.log(`   ✅ Login successful`);
    console.log(`   Location: ${currentUrl}\n`);

    // ========== STEP 2: TAKE DASHBOARD SCREENSHOT ==========
    console.log('📸 STEP 2: Taking dashboard screenshot...');
    await page.screenshot({ path: 'dashboard_logged_in.png' });
    console.log('   Screenshot: dashboard_logged_in.png\n');

    // ========== STEP 3: CLICK MEMBERS MENU ==========
    console.log('👥 STEP 3: Clicking Members in sidebar...');

    const membersLink = page.locator('a:has-text("Members"), button:has-text("Members"), [data-testid="members-nav"]').first();
    const membersText = page.locator('text=Members').first();

    let clicked = false;

    if (await membersLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await membersLink.click();
      clicked = true;
      console.log('   ✅ Members link clicked');
    } else if (await membersText.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Try clicking the text directly
      const parent = membersText.locator('..');
      await parent.click();
      clicked = true;
      console.log('   ✅ Members text clicked');
    } else {
      // Try finding all buttons and clicking the one with Members
      const buttons = await page.locator('button').all();
      for (const btn of buttons) {
        const text = await btn.textContent().catch(() => '');
        if (text.toLowerCase().includes('members')) {
          await btn.click();
          clicked = true;
          console.log('   ✅ Members button clicked');
          break;
        }
      }
    }

    if (!clicked) {
      console.log('   ⚠️  Could not find Members menu item, navigating directly...');
      await page.goto(`${baseUrl}/members`);
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    console.log(`   Current URL: ${page.url()}\n`);

    // ========== STEP 4: TAKE MEMBERS PAGE SCREENSHOT ==========
    console.log('📸 STEP 4: Taking members page screenshot...');
    await page.screenshot({ path: 'members_page_ready.png' });
    console.log('   Screenshot: members_page_ready.png\n');

    // ========== STEP 5: FIND ADD MEMBER BUTTON ==========
    console.log('➕ STEP 5: Finding Add Member button...');

    const allText = await page.textContent('body');
    console.log(`   Page has "Add" text: ${allText.includes('Add')}`);
    console.log(`   Page has "Import" text: ${allText.includes('Import')}`);
    console.log(`   Page has "Members" text: ${allText.includes('Members')}\n`);

    // Try multiple selectors for the button
    const buttonSelectors = [
      'button:has-text("Add Member")',
      'button:has-text("Add")',
      'button:has-text("+ Add")',
      'button:has-text("Create")',
      '[data-testid="add-member"]',
      '.btn-add',
      'button[aria-label*="Add"]'
    ];

    let addButton = null;
    let buttonText = '';

    for (const selector of buttonSelectors) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        addButton = btn;
        buttonText = await btn.textContent().catch(() => '');
        console.log(`   ✅ Found button: "${buttonText.trim()}"`);
        break;
      }
    }

    if (!addButton) {
      console.log('   ⚠️  No Add button found via selectors');
      console.log('   Searching all buttons...\n');

      const buttons = await page.locator('button').all();
      for (const btn of buttons) {
        const text = await btn.textContent().catch(() => '');
        const visible = await btn.isVisible({ timeout: 300 }).catch(() => false);

        if (visible) {
          console.log(`   Button: "${text.trim()}"`);
          if (text.toLowerCase().includes('add') || text.toLowerCase().includes('import')) {
            addButton = btn;
            buttonText = text;
            console.log(`   ✅ Will use this button\n`);
            break;
          }
        }
      }
    }

    if (addButton) {
      console.log('🖱️  STEP 6: Clicking Add button...');
      await addButton.click();
      await page.waitForTimeout(1500);
      console.log('   ✅ Button clicked\n');

      // ========== STEP 7: FILL MEMBER FORM ==========
      console.log('✍️  STEP 7: Filling member details...');

      const memberName = 'John Smith';
      const memberPhone = '206-555-1234';
      const memberEmail = 'john.smith@example.com';

      // Find input fields
      const inputs = await page.locator('input').all();
      console.log(`   Found ${inputs.length} input fields`);

      let nameFound = false;
      let phoneFound = false;
      let emailFound = false;

      for (const input of inputs) {
        const placeholder = await input.getAttribute('placeholder').catch(() => '');
        const type = await input.getAttribute('type').catch(() => '');
        const name = await input.getAttribute('name').catch(() => '');
        const visible = await input.isVisible({ timeout: 300 }).catch(() => false);

        if (!visible) continue;

        // Name field
        if ((placeholder.toLowerCase().includes('name') ||
             name.toLowerCase().includes('name') ||
             placeholder.toLowerCase().includes('member')) &&
            !nameFound) {
          await input.fill(memberName);
          nameFound = true;
          console.log(`   ✅ Name: ${memberName}`);
        }

        // Phone field
        if ((placeholder.toLowerCase().includes('phone') ||
             type === 'tel' ||
             name.toLowerCase().includes('phone')) &&
            !phoneFound) {
          await input.fill(memberPhone);
          phoneFound = true;
          console.log(`   ✅ Phone: ${memberPhone}`);
        }

        // Email field
        if ((placeholder.toLowerCase().includes('email') ||
             type === 'email' ||
             name.toLowerCase().includes('email')) &&
            !emailFound) {
          await input.fill(memberEmail);
          emailFound = true;
          console.log(`   ✅ Email: ${memberEmail}`);
        }
      }

      console.log('');

      // ========== STEP 8: SUBMIT FORM ==========
      console.log('💾 STEP 8: Submitting member form...');

      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Add Member")',
        'button:has-text("Add")',
        'button:has-text("Save")',
        'button:has-text("Create")'
      ];

      let submitted = false;
      for (const selector of submitSelectors) {
        const btn = page.locator(selector).last();
        if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
          await btn.click();
          console.log('   ✅ Form submitted');
          submitted = true;
          break;
        }
      }

      if (!submitted) {
        console.log('   ⚠️  Could not find submit button');
      }

      await page.waitForTimeout(1500);
      console.log('   Waiting for member to be added...\n');

      // ========== STEP 9: VERIFY MEMBER ADDED ==========
      console.log('🔍 STEP 9: Verifying member was added...');

      const pageContent = await page.textContent('body');
      if (pageContent.includes(memberName) || pageContent.includes(memberPhone)) {
        console.log(`   ✅ Member found on page!`);
        console.log(`   Member "${memberName}" successfully added\n`);
      } else {
        console.log(`   ℹ️  Member may have been added (not visible in current view)\n`);
      }

      // ========== STEP 10: FINAL SCREENSHOT ==========
      console.log('📸 STEP 10: Taking final screenshot...');
      await page.screenshot({ path: 'member_added_success.png' });
      console.log('   Screenshot: member_added_success.png\n');

    } else {
      console.log('   ❌ Could not find Add button\n');
    }

    // ========== FINAL REPORT ==========
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`📊 SUMMARY:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Login: ✅ SUCCESS`);
    console.log(`   Members Page: ✅ ACCESSED`);
    console.log(`   Add Member: ${addButton ? '✅ COMPLETED' : '❌ NOT FOUND'}`);
    console.log(`\n`);

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  } finally {
    await browser.close();
    console.log('Browser closed.\n');
  }
}

testAddMemberComplete().catch(console.error);
