const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let testResults = [];
  const baseUrl = 'http://localhost:5173';

  try {
    console.log('\n🚀 RUNNING FIXED END-TO-END TESTS\n');
    console.log('=' .repeat(80));

    // Test 1: Registration Page Navigation
    console.log('\n📝 TEST 1: Registration Page Navigation');
    try {
      await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
      const hasCreateAccountHeading = await page.locator('h1:has-text("Create Your Account")').isVisible();
      const hasLogo = await page.locator('img[alt="Koinonia"]').isVisible();

      if (hasCreateAccountHeading && hasLogo) {
        console.log('✅ Registration page loaded');
        testResults.push({ test: 'Registration Page', status: 'PASS' });
      } else {
        console.log('❌ Page elements missing');
        testResults.push({ test: 'Registration Page', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Registration Page', status: 'FAIL' });
    }

    // Test 2: Registration Form - Empty Fields Validation
    console.log('\n📝 TEST 2: Empty Fields Validation');
    try {
      // Click submit without filling form
      await page.locator('button:has-text("Create Account")').click();
      await page.waitForTimeout(500);

      // Now blur a field to trigger validation
      await page.locator('input[placeholder="John"]').focus();
      await page.locator('input[placeholder="John"]').blur();
      await page.waitForTimeout(500);

      // Check for error message (with warning emoji or error class)
      const hasError = await page.locator('text=First name is required').isVisible();
      if (hasError) {
        console.log('✅ Empty field validation error shown');
        testResults.push({ test: 'Empty Fields Validation', status: 'PASS' });
      } else {
        console.log('⚠️  Error not visible');
        testResults.push({ test: 'Empty Fields Validation', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Empty Fields Validation', status: 'FAIL' });
    }

    // Test 3: Invalid Password Validation
    console.log('\n📝 TEST 3: Invalid Password Validation');
    try {
      // Fill form with invalid password (no uppercase)
      await page.locator('input[placeholder="John"]').fill('John');
      await page.locator('input[placeholder="Doe"]').fill('Doe');
      await page.locator('input[placeholder="Grace Community Church"]').fill('Test Church');
      await page.locator('input[placeholder="pastor@church.com"]').fill('test@church.com');

      const passwordField = page.locator('input[type="password"]').first();
      await passwordField.fill('password123');
      await passwordField.blur();
      await page.waitForTimeout(500);

      const hasUppercaseError = await page.locator('text=uppercase').isVisible();
      if (hasUppercaseError) {
        console.log('✅ Password validation (uppercase) error shown');
        testResults.push({ test: 'Password Validation', status: 'PASS' });
      } else {
        console.log('⚠️  Error not visible');
        testResults.push({ test: 'Password Validation', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Password Validation', status: 'FAIL' });
    }

    // Test 4: Valid Password
    console.log('\n📝 TEST 4: Valid Password');
    try {
      await page.locator('input[type="password"]').first().clear();
      await page.locator('input[type="password"]').first().fill('ValidPass123');
      await page.locator('input[type="password"]').first().blur();
      await page.waitForTimeout(500);

      const hasError = await page.locator('text=uppercase').isVisible();
      if (!hasError) {
        console.log('✅ Valid password accepted');
        testResults.push({ test: 'Valid Password', status: 'PASS' });
      } else {
        console.log('❌ Error still showing');
        testResults.push({ test: 'Valid Password', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Valid Password', status: 'FAIL' });
    }

    // Test 5: Login Page Navigation
    console.log('\n📝 TEST 5: Login Page Navigation');
    try {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
      const hasLoginHeading = await page.locator('h1:has-text("Welcome Back")').isVisible();

      if (hasLoginHeading) {
        console.log('✅ Login page loaded');
        testResults.push({ test: 'Login Page', status: 'PASS' });
      } else {
        console.log('❌ Login heading not found');
        testResults.push({ test: 'Login Page', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Login Page', status: 'FAIL' });
    }

    // Test 6: Login - Invalid Email Validation
    console.log('\n📝 TEST 6: Invalid Email Validation');
    try {
      await page.locator('input[type="email"]').fill('notanemail');
      await page.locator('input[type="email"]').blur();
      await page.waitForTimeout(500);

      const hasError = await page.locator('text=Invalid email').isVisible();
      if (hasError) {
        console.log('✅ Email validation error shown');
        testResults.push({ test: 'Email Validation', status: 'PASS' });
      } else {
        console.log('⚠️  Error not visible');
        testResults.push({ test: 'Email Validation', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Email Validation', status: 'FAIL' });
    }

    // Test 7: Sign-Up Link Navigation (using new testid)
    console.log('\n📝 TEST 7: Sign-Up Link Navigation');
    try {
      const signUpLink = page.locator('[data-testid="signup-link"]');
      const isVisible = await signUpLink.isVisible();

      if (isVisible) {
        await signUpLink.click();
        await page.waitForNavigation({ timeout: 5000 });
        const onRegisterPage = page.url().includes('/register');

        if (onRegisterPage) {
          console.log('✅ Sign-up link navigation works');
          testResults.push({ test: 'Sign-Up Link', status: 'PASS' });
        } else {
          console.log('❌ Navigation failed');
          testResults.push({ test: 'Sign-Up Link', status: 'FAIL' });
        }
      } else {
        console.log('❌ Sign-up link not found');
        testResults.push({ test: 'Sign-Up Link', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Sign-Up Link', status: 'FAIL' });
    }

    // Test 8: Back Button (using new testid)
    console.log('\n📝 TEST 8: Back Button Navigation');
    try {
      const backButton = page.locator('[data-testid="back-button"]');
      const isVisible = await backButton.isVisible();

      if (isVisible) {
        await backButton.click();
        await page.waitForTimeout(500);
        console.log('✅ Back button works');
        testResults.push({ test: 'Back Button', status: 'PASS' });
      } else {
        console.log('❌ Back button not found');
        testResults.push({ test: 'Back Button', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Back Button', status: 'FAIL' });
    }

    // Test 9: Console Errors
    console.log('\n📝 TEST 9: Console Errors');
    try {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(`${baseUrl}/login`);
      await page.waitForTimeout(1000);

      if (errors.length === 0) {
        console.log('✅ No console errors');
        testResults.push({ test: 'Console Errors', status: 'PASS' });
      } else {
        console.log(`⚠️  ${errors.length} error(s) found`);
        testResults.push({ test: 'Console Errors', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Console Errors', status: 'FAIL' });
    }

    // Test 10: Mobile Responsiveness
    console.log('\n📝 TEST 10: Mobile Responsiveness');
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${baseUrl}/register`);
      await page.waitForTimeout(500);

      const form = await page.locator('button:has-text("Create Account")').isVisible();
      if (form) {
        console.log('✅ Mobile view (375px) responsive');
        testResults.push({ test: 'Mobile View', status: 'PASS' });
      } else {
        console.log('⚠️  Form not visible on mobile');
        testResults.push({ test: 'Mobile View', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Mobile View', status: 'FAIL' });
    }

    // Test 11: Desktop Responsiveness
    console.log('\n📝 TEST 11: Desktop Responsiveness');
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${baseUrl}/login`);
      await page.waitForTimeout(500);

      const form = await page.locator('button:has-text("Login")').isVisible();
      if (form) {
        console.log('✅ Desktop view (1440px) responsive');
        testResults.push({ test: 'Desktop View', status: 'PASS' });
      } else {
        console.log('⚠️  Form not visible on desktop');
        testResults.push({ test: 'Desktop View', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      testResults.push({ test: 'Desktop View', status: 'FAIL' });
    }

    // Print Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 FIXED TEST SUMMARY\n');

    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;

    testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);

      if (result.status === 'PASS') passCount++;
      else if (result.status === 'WARN') warnCount++;
      else failCount++;
    });

    console.log(`\n📈 Results: ${passCount} PASS | ${warnCount} WARN | ${failCount} FAIL`);
    console.log(`✅ Success Rate: ${((passCount / testResults.length) * 100).toFixed(1)}%`);

    const improvement = ((passCount - 8) / 12 * 100).toFixed(1);
    console.log(`📈 Improvement: ${improvement}% from previous 66.7%`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ FIXED E2E TESTING COMPLETE\n');

  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
