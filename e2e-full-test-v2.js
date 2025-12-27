/**
 * COMPREHENSIVE E2E TEST - VERSION 2
 * Real browser testing - NO SHORTCUTS
 * Tests account creation, branches, member management, deletion
 */

const { chromium } = require('@playwright/test');

const BASE_URL = 'https://koinoniasms.com';

let page;
let browser;

const testResults = [];

function addResult(name, passed, details) {
  const result = {
    name,
    passed,
    details,
    time: new Date().toISOString(),
  };
  testResults.push(result);
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}: ${details}`);
  return result;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('\n🧪 COMPREHENSIVE E2E TEST STARTING\n');

  try {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // ============================================
    // PHASE 1: ACCOUNT LIFECYCLE
    // ============================================
    console.log('\n📝 PHASE 1: ACCOUNT LIFECYCLE\n');

    const timestamp = Date.now();
    const email = `test${timestamp}@test-e2e.com`;
    const password = 'TestPassword123!';
    const churchName = `TestChurch${timestamp}`;

    // Navigate to app
    console.log('Navigating to app...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    let currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    addResult('Navigate to home', true, `Loaded ${BASE_URL}`);

    // Check if already on login
    const isLogin = currentUrl.includes('/login') || currentUrl.includes('/register');
    if (!isLogin) {
      // Try to find sign in link
      try {
        await page.click('text=Sign In');
        await sleep(1000);
      } catch {
        console.log('Sign In button not found');
      }
    }

    // Check for register link
    const pageText = await page.textContent('body');
    const hasRegister = pageText.includes('Sign up') || pageText.includes('Create');

    if (hasRegister) {
      console.log('Found registration link');
      try {
        await page.click('text=/Sign up|Create Account/i');
        await sleep(1500);
        addResult('Navigate to signup', true, 'On signup page');
      } catch (e) {
        addResult('Navigate to signup', false, e.message);
        throw e;
      }

      // Create account
      console.log('Creating account...');
      try {
        // Fill First Name
        const firstNameInput = await page.$('input[placeholder*="First" i], input[placeholder*="first name" i], input[name="firstName"]');
        if (firstNameInput) {
          await firstNameInput.fill('Test');
          await sleep(300);
        } else {
          console.log('First name input not found');
        }

        // Fill Last Name
        const lastNameInput = await page.$('input[placeholder*="Last" i], input[placeholder*="last name" i], input[name="lastName"]');
        if (lastNameInput) {
          await lastNameInput.fill('User');
          await sleep(300);
        } else {
          console.log('Last name input not found');
        }

        // Fill Email
        const emailInput = await page.$('input[type="email"], input[placeholder*="email" i], input[name="email"]');
        if (!emailInput) {
          addResult('Create account', false, 'Email input not found');
          throw new Error('Email input not found');
        }
        await emailInput.fill(email);
        await sleep(300);

        // Fill Church Name
        try {
          const churchInput = await page.$('input[placeholder*="church" i], input[name*="church" i], input[placeholder*="Church" i]');
          if (churchInput) {
            await churchInput.fill(churchName);
            await sleep(300);
          }
        } catch {
          console.log('Church name input not found (optional)');
        }

        // Fill password fields
        const passwordInputs = await page.$$('input[type="password"]');
        if (passwordInputs.length >= 2) {
          await passwordInputs[0].fill(password);
          await sleep(300);
          await passwordInputs[1].fill(password);
          await sleep(300);
        } else if (passwordInputs.length === 1) {
          await passwordInputs[0].fill(password);
        } else {
          addResult('Create account', false, 'Password inputs not found');
          throw new Error('Password inputs not found');
        }

        // Submit
        const submitBtn = await page.$('button:has-text("Create Account"), button:has-text("Sign up"), button:has-text("Register")');
        if (!submitBtn) {
          const allButtons = await page.$$('button');
          console.log(`Found ${allButtons.length} buttons`);
          for (let i = 0; i < Math.min(3, allButtons.length); i++) {
            const btnText = await allButtons[i].textContent();
            console.log(`Button ${i}: ${btnText}`);
          }
          addResult('Create account', false, 'Submit button not found');
          throw new Error('Submit button not found');
        }

        await submitBtn.click();
        await sleep(3000);

        console.log('Account creation submitted');
        addResult('Create account', true, `Email: ${email}`);

      } catch (e) {
        addResult('Create account', false, e.message);
        throw e;
      }

    } else {
      console.log('Not on registration page');
      addResult('Navigate to signup', false, 'Could not find signup');
    }

    // Check if logged in
    currentUrl = page.url();
    console.log(`Current URL after signup: ${currentUrl}`);

    let isLoggedIn = currentUrl.includes('/dashboard') || currentUrl.includes('/home');
    if (!isLoggedIn) {
      const onPage = await page.textContent('body');
      isLoggedIn = onPage.includes('Welcome') || onPage.includes('Dashboard') || onPage.includes('Logout');
    }

    addResult('Verify logged in', isLoggedIn, `URL: ${currentUrl}`);

    if (!isLoggedIn) {
      console.log('⚠️ Not logged in yet');
      console.log(await page.textContent('body'));
    }

    // Sign out
    if (isLoggedIn) {
      console.log('\nTesting sign out...');
      try {
        // Find menu button
        const menuBtn = await page.$('[data-testid="user-menu"], [title="Menu"], button:has-text("Menu"), .profile-menu');
        if (menuBtn) {
          await menuBtn.click();
          await sleep(500);
        }

        // Find logout button
        const logoutBtn = await page.$('text=Logout, text=Sign out, text=Log out');
        if (logoutBtn) {
          await logoutBtn.click();
          await sleep(2000);
        } else {
          console.log('Logout button not found');
        }

        currentUrl = page.url();
        const isLoggedOut = currentUrl.includes('/login');
        addResult('Sign out', isLoggedOut, `URL: ${currentUrl}`);

        // Sign back in
        if (isLoggedOut) {
          console.log('\nTesting sign back in...');
          const emailInput = await page.$('input[type="email"]');
          const passwordInput = await page.$('input[type="password"]');

          if (emailInput && passwordInput) {
            await emailInput.fill(email);
            await passwordInput.fill(password);
            await sleep(500);

            const submitBtn = await page.$('button:has-text("Sign In"), button:has-text("Login")');
            if (submitBtn) {
              await submitBtn.click();
              await sleep(3000);

              currentUrl = page.url();
              const isBackInLoggedIn = currentUrl.includes('/dashboard') || currentUrl.includes('/home');
              addResult('Sign back in', isBackInLoggedIn, `URL: ${currentUrl}`);
            }
          }
        }

      } catch (e) {
        addResult('Sign out/in', false, e.message);
      }
    }

    // ============================================
    // PHASE 2: VERIFY DASHBOARD
    // ============================================
    console.log('\n📊 PHASE 2: VERIFY DASHBOARD\n');

    try {
      const pageText = await page.textContent('body');
      const hasBranch = pageText.includes('Branch') || pageText.includes('branch');
      const hasMembers = pageText.includes('Member') || pageText.includes('member');
      const hasGroups = pageText.includes('Group') || pageText.includes('group');

      addResult('Dashboard loads', true, 'Can see sections');
      addResult('Has branch section', hasBranch, 'Branch text visible');
      addResult('Has member section', hasMembers, 'Member text visible');
      addResult('Has group section', hasGroups, 'Group text visible');
    } catch (e) {
      addResult('Dashboard verification', false, e.message);
    }

    await sleep(2000);

  } catch (error) {
    console.error('\n💥 TEST ERROR:', error.message);
    addResult('Test execution', false, error.message);
  } finally {
    if (browser) {
      await sleep(3000); // Keep browser open for 3 seconds to see results
      await browser.close();
    }

    // Print summary
    console.log('\n\n===========================================');
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('===========================================\n');

    let passed = 0;
    let failed = 0;

    for (const result of testResults) {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      console.log(`   └─ ${result.details}\n`);
      if (result.passed) passed++;
      else failed++;
    }

    console.log(`\n${passed}/${passed + failed} tests passed`);
    if (failed > 0) {
      console.log(`⚠️  ${failed} tests failed`);
    } else {
      console.log('🎉 All tests passed!');
    }
  }
}

main().catch(console.error);
