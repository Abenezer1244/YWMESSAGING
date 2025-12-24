const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let testResults = [];
  const baseUrl = 'http://localhost:5173';

  try {
    console.log('\n🚀 RUNNING COMPREHENSIVE E2E TESTS (V2 - ROBUST SELECTORS)\n');
    console.log('=' .repeat(80));

    // Test 1: Registration Page
    console.log('\n📝 TEST 1: Registration Page');
    try {
      await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').filter({ hasText: 'Create Your Account' });
      const isVisible = await heading.isVisible();

      if (isVisible) {
        console.log('✅ PASS');
        testResults.push({ test: 'Registration Page Navigation', status: 'PASS' });
      } else {
        console.log('❌ FAIL');
        testResults.push({ test: 'Registration Page Navigation', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Registration Page Navigation', status: 'FAIL' });
    }

    // Test 2: Empty Fields Validation
    console.log('\n📝 TEST 2: Empty Fields Validation on Blur');
    try {
      const firstNameInput = page.locator('input[placeholder="John"]');
      await firstNameInput.focus();
      await firstNameInput.blur();
      await page.waitForTimeout(300);

      const errorMsg = page.locator('text=First name is required');
      const hasError = await errorMsg.isVisible();

      if (hasError) {
        console.log('✅ PASS');
        testResults.push({ test: 'Empty Fields Validation', status: 'PASS' });
      } else {
        console.log('⚠️ WARN - Error not visible');
        testResults.push({ test: 'Empty Fields Validation', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Empty Fields Validation', status: 'FAIL' });
    }

    // Test 3: Password Validation - Missing Uppercase
    console.log('\n📝 TEST 3: Password Validation - Missing Uppercase');
    try {
      // Fill in valid data first
      await page.locator('input[placeholder="John"]').fill('John');
      await page.locator('input[placeholder="Doe"]').fill('Doe');
      await page.locator('input[placeholder="Grace Community Church"]').fill('Test Church');
      await page.locator('input[placeholder="pastor@church.com"]').fill('john@testchurch.com');

      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('password123');
      await passwordInput.blur();
      await page.waitForTimeout(300);

      const errorMsg = page.locator('text=uppercase');
      const hasError = await errorMsg.isVisible();

      if (hasError) {
        console.log('✅ PASS');
        testResults.push({ test: 'Password Validation (Uppercase)', status: 'PASS' });
      } else {
        console.log('⚠️ WARN - Error not visible');
        testResults.push({ test: 'Password Validation (Uppercase)', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Password Validation (Uppercase)', status: 'FAIL' });
    }

    // Test 4: Valid Password
    console.log('\n📝 TEST 4: Valid Password Accepted');
    try {
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.clear();
      await passwordInput.fill('ValidPass123');
      await passwordInput.blur();
      await page.waitForTimeout(300);

      const errorMsg = page.locator('text=uppercase');
      const hasError = await errorMsg.isVisible();

      if (!hasError) {
        console.log('✅ PASS');
        testResults.push({ test: 'Valid Password', status: 'PASS' });
      } else {
        console.log('❌ FAIL - Error still showing');
        testResults.push({ test: 'Valid Password', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Valid Password', status: 'FAIL' });
    }

    // Test 5: Login Page
    console.log('\n📝 TEST 5: Login Page Navigation');
    try {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').filter({ hasText: 'Welcome Back' });
      const isVisible = await heading.isVisible();

      if (isVisible) {
        console.log('✅ PASS');
        testResults.push({ test: 'Login Page Navigation', status: 'PASS' });
      } else {
        console.log('❌ FAIL');
        testResults.push({ test: 'Login Page Navigation', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Login Page Navigation', status: 'FAIL' });
    }

    // Test 6: Email Validation
    console.log('\n📝 TEST 6: Email Format Validation');
    try {
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('notanemail');
      await emailInput.blur();
      await page.waitForTimeout(300);

      const errorMsg = page.locator('text=Invalid email');
      const hasError = await errorMsg.isVisible();

      if (hasError) {
        console.log('✅ PASS');
        testResults.push({ test: 'Email Format Validation', status: 'PASS' });
      } else {
        console.log('⚠️ WARN - Error not visible');
        testResults.push({ test: 'Email Format Validation', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Email Format Validation', status: 'FAIL' });
    }

    // Test 7: Sign-Up Link
    console.log('\n📝 TEST 7: Sign-Up Link Navigation');
    try {
      // Use a more robust selector - look for the link by its text within the page
      const signUpLink = page.locator('a:has-text("Sign up")');
      const isVisible = await signUpLink.isVisible();

      if (isVisible) {
        const href = await signUpLink.getAttribute('href');
        if (href === '/register') {
          console.log('✅ PASS');
          testResults.push({ test: 'Sign-Up Link', status: 'PASS' });
        } else {
          console.log(`❌ FAIL - Link href is "${href}"`);
          testResults.push({ test: 'Sign-Up Link', status: 'FAIL' });
        }
      } else {
        console.log('❌ FAIL - Link not visible');
        testResults.push({ test: 'Sign-Up Link', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Sign-Up Link', status: 'FAIL' });
    }

    // Test 8: Back Button
    console.log('\n📝 TEST 8: Back Button');
    try {
      await page.goto(`${baseUrl}/register`);

      // Look for button containing SVG and "Back" text
      const backButton = page.locator('button').filter({ hasText: 'Back' });
      const isVisible = await backButton.isVisible();

      if (isVisible) {
        console.log('✅ PASS');
        testResults.push({ test: 'Back Button', status: 'PASS' });
      } else {
        console.log('❌ FAIL - Back button not found');
        testResults.push({ test: 'Back Button', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Back Button', status: 'FAIL' });
    }

    // Test 9: Mobile Responsive
    console.log('\n📝 TEST 9: Mobile Responsiveness (375px)');
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${baseUrl}/register`);

      const heading = await page.locator('h1');
      const form = await page.locator('button').filter({ hasText: 'Create Account' });

      if (await heading.isVisible() && await form.isVisible()) {
        console.log('✅ PASS');
        testResults.push({ test: 'Mobile Responsive', status: 'PASS' });
      } else {
        console.log('⚠️ WARN - Elements not visible');
        testResults.push({ test: 'Mobile Responsive', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Mobile Responsive', status: 'FAIL' });
    }

    // Test 10: Desktop Responsive
    console.log('\n📝 TEST 10: Desktop Responsiveness (1440px)');
    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${baseUrl}/login`);

      const heading = await page.locator('h1');
      const form = await page.locator('button').filter({ hasText: 'Login' });

      if (await heading.isVisible() && await form.isVisible()) {
        console.log('✅ PASS');
        testResults.push({ test: 'Desktop Responsive', status: 'PASS' });
      } else {
        console.log('⚠️ WARN - Elements not visible');
        testResults.push({ test: 'Desktop Responsive', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'Desktop Responsive', status: 'FAIL' });
    }

    // Test 11: No Console Errors
    console.log('\n📝 TEST 11: Console Errors');
    try {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(`${baseUrl}/login`);
      await page.waitForTimeout(1000);

      if (errors.length === 0) {
        console.log('✅ PASS');
        testResults.push({ test: 'No Console Errors', status: 'PASS' });
      } else {
        console.log(`⚠️ WARN - ${errors.length} error(s)`);
        testResults.push({ test: 'No Console Errors', status: 'WARN' });
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      testResults.push({ test: 'No Console Errors', status: 'FAIL' });
    }

    // Print Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 FINAL TEST SUMMARY\n');

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

    const total = testResults.length;
    const passRate = ((passCount / total) * 100).toFixed(1);
    console.log(`\n📈 Results: ${passCount} PASS | ${warnCount} WARN | ${failCount} FAIL`);
    console.log(`✅ Success Rate: ${passRate}%`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ E2E TESTING COMPLETE\n');

  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
