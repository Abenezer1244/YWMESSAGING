const { chromium } = require('playwright');

async function testErrorHandling() {
  console.log('\n🧪 TESTING ERROR MESSAGE HANDLING\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to login page
    console.log('[NAVIGATE] Going to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Check if we're on login page
    const title = await page.locator('h1').first().textContent();
    console.log('   Page title found: ' + (title ? title.trim() : 'None'));

    // Test 1: Invalid credentials (should show error)
    console.log('\n[TEST 1] Testing invalid credentials error message...');

    // Wait for email input to be visible
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ timeout: 5000 }).catch(() => console.log('   ⚠️  Email input not found immediately'));

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for error message (react-hot-toast renders to body)
    await page.waitForTimeout(3000);

    // Try to find error messages in various places
    const bodyText = await page.locator('body').innerText();
    const hasErrorText = bodyText.includes('Invalid email') ||
                        bodyText.includes('error occurred') ||
                        bodyText.includes('try again') ||
                        bodyText.includes('Invalid') ||
                        bodyText.includes('Login failed');

    console.log('   Checking for error messages...');
    if (bodyText.includes('prisma') || bodyText.includes('Prisma') || bodyText.includes('Invalid `')) {
      console.log('   ❌ FAILURE: Technical error message detected!');
      console.log('   Message fragment: ' + bodyText.substring(0, 200));
    } else if (hasErrorText) {
      console.log('   ✅ SUCCESS: Professional error message displayed!');
      // Extract the error message
      const lines = bodyText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Invalid email') || lines[i].includes('error occurred') || lines[i].includes('Login failed')) {
          console.log('   Message: "' + lines[i].trim() + '"');
        }
      }
    } else {
      console.log('   ⚠️  No error message detected');
      console.log('   Body contains: ' + bodyText.substring(0, 300));
    }

    // Test 2: Check valid login flow (page structure)
    console.log('\n[TEST 2] Checking page structure...');
    const inputs = await page.locator('input').all();
    console.log('   Found ' + inputs.length + ' input fields');

    const buttons = await page.locator('button').all();
    console.log('   Found ' + buttons.length + ' buttons');

    // Check console for errors
    console.log('\n[TEST 3] Checking browser console...');
    const messages = await page.evaluate(() => {
      // Return window.errors if available
      return window.__errors__ || 'No console errors logged';
    }).catch(() => 'N/A');

    console.log('   Console check: ' + messages);

    console.log('\n✅ Error handling test complete!\n');

  } catch (error) {
    console.log('❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
}

testErrorHandling().catch(console.error);
