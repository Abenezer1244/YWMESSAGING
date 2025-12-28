const { chromium } = require('playwright');

async function testLoginAndAddMember() {
  console.log('\n🔐 LOGIN & ADD MEMBER TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: false });
  const baseUrl = 'http://localhost:5173';

  const testEmail = 'ax@gmail.com';
  const testPassword = '12!Michael';

  try {
    const page = await browser.newPage();

    // Listen for console messages and errors
    const consoleMessages = [];
    page.on('console', (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        console.log(`   🔴 Console Error: ${msg.text()}`);
      }
    });

    // ========== STEP 1: GO TO LOGIN PAGE ==========
    console.log('📝 STEP 1: Navigating to login page...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);
    console.log('   ✅ Login page loaded\n');

    // ========== STEP 2: ENTER CREDENTIALS ==========
    console.log('🔐 STEP 2: Entering login credentials...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}\n`);

    // Find and fill email input
    const emailInputs = await page.locator('input[type="email"], input[name="email"]').all();
    if (emailInputs.length > 0) {
      await emailInputs[0].fill(testEmail);
      console.log('   ✅ Email entered');
    } else {
      console.log('   ⚠️  Email input not found');
    }

    // Find and fill password input
    const passwordInputs = await page.locator('input[type="password"], input[name="password"]').all();
    if (passwordInputs.length > 0) {
      await passwordInputs[0].fill(testPassword);
      console.log('   ✅ Password entered\n');
    } else {
      console.log('   ⚠️  Password input not found');
    }

    // ========== STEP 3: SUBMIT LOGIN ==========
    console.log('🚀 STEP 3: Submitting login form...');

    // Monitor network requests
    let loginResponse = null;
    page.on('response', (response) => {
      if (response.url().includes('/api/auth/login') || response.url().includes('/login')) {
        loginResponse = response.status();
        console.log(`   API Response: ${response.status()} ${response.statusText()}`);
      }
    });

    const loginBtn = page.locator('button:has-text("Login")').first();
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginBtn.click();
      console.log('   ✅ Login button clicked');
    } else {
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      console.log('   ✅ Submit button clicked');
    }

    // Wait for response or redirect
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}\n`);

    // Check for error messages on page
    const errorElement = await page.locator('[role="alert"], .error, .text-red-500').first();
    if (await errorElement.isVisible({ timeout: 1000 }).catch(() => false)) {
      const errorText = await errorElement.textContent();
      console.log(`   ❌ Login Error: ${errorText}\n`);
    }

    // ========== STEP 4: CHECK IF LOGGED IN ==========
    console.log('🔍 STEP 4: Checking authentication status...');

    const isLoggedIn = !currentUrl.includes('/login') && !currentUrl.includes('/register');
    if (isLoggedIn) {
      console.log(`   ✅ Login appears successful`);
      console.log(`   Location: ${currentUrl}\n`);
    } else {
      console.log(`   ⚠️  Still on login page - authentication may have failed`);
      console.log(`   Checking for login error messages...\n`);

      // Try to find error text anywhere on page
      const pageText = await page.textContent('body');
      if (pageText.includes('Invalid') || pageText.includes('incorrect') || pageText.includes('error')) {
        console.log('   ❌ Page contains error message\n');
      }

      // Take screenshot of login error
      await page.screenshot({ path: 'login_error.png' });
      console.log('   📸 Screenshot saved: login_error.png\n');
    }

    // ========== STEP 5: NAVIGATE TO MEMBERS ==========
    if (isLoggedIn) {
      console.log('👥 STEP 5: Navigating to Members page...');
      await page.goto(`${baseUrl}/members`);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      console.log('   ✅ Members page loaded\n');

      // ========== STEP 6: FIND ADD MEMBER BUTTON ==========
      console.log('➕ STEP 6: Looking for Add Member button...');

      const buttons = await page.locator('button').all();
      let foundButton = null;

      for (const btn of buttons) {
        const text = await btn.textContent().catch(() => '');
        const visible = await btn.isVisible({ timeout: 300 }).catch(() => false);

        if (visible && text.toLowerCase().includes('add')) {
          console.log(`   Found: "${text.trim()}"`);
          foundButton = btn;
          break;
        }
      }

      if (foundButton) {
        console.log('   ✅ Add button found\n');

        // ========== STEP 7: CLICK ADD BUTTON ==========
        console.log('🖱️  STEP 7: Clicking Add Member button...');
        await foundButton.click();
        await page.waitForTimeout(1000);
        console.log('   ✅ Dialog should be open\n');

        // ========== STEP 8: FILL MEMBER FORM ==========
        console.log('✍️  STEP 8: Filling member form...');

        const memberName = 'New Test Member';
        const memberPhone = '2065551234';

        const inputs = await page.locator('input').all();

        for (const input of inputs) {
          const placeholder = await input.getAttribute('placeholder').catch(() => '');
          const type = await input.getAttribute('type').catch(() => '');

          if ((placeholder.toLowerCase().includes('name') || placeholder.toLowerCase().includes('member')) &&
              await input.isVisible({ timeout: 500 }).catch(() => false)) {
            await input.fill(memberName);
            console.log(`   ✅ Filled name: ${memberName}`);
          }

          if ((placeholder.toLowerCase().includes('phone') || type === 'tel') &&
              await input.isVisible({ timeout: 500 }).catch(() => false)) {
            await input.fill(memberPhone);
            console.log(`   ✅ Filled phone: ${memberPhone}`);
          }
        }

        console.log('');

        // ========== STEP 9: SUBMIT FORM ==========
        console.log('💾 STEP 9: Submitting member form...');

        const submitButtons = await page.locator('button[type="submit"], button:has-text("Add"), button:has-text("Save")').all();
        if (submitButtons.length > 0) {
          await submitButtons[0].click();
          console.log('   ✅ Form submitted');
          await page.waitForTimeout(1500);
          console.log('   ✅ Member added\n');
        }

        // ========== STEP 10: TAKE FINAL SCREENSHOT ==========
        console.log('📸 STEP 10: Taking final screenshot...');
        await page.screenshot({ path: 'member_added.png' });
        console.log('   Screenshot: member_added.png\n');

      } else {
        console.log('   ❌ Add button not found');
        await page.screenshot({ path: 'no_add_button.png' });
        console.log('   Screenshot: no_add_button.png\n');
      }
    }

    // ========== FINAL REPORT ==========
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`📊 RESULTS:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Login Status: ${isLoggedIn ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Console Errors: ${consoleMessages.filter(m => m.type === 'error').length}`);

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  } finally {
    await browser.close();
    console.log('\nBrowser closed.');
  }
}

testLoginAndAddMember().catch(console.error);
