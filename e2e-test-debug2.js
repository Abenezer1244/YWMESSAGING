const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'log') {
      consoleMessages.push(msg.text());
    }
  });

  try {
    console.log('\n🔍 DEBUGGING WITH PROPER CHANGE EVENTS\n');
    console.log('=' .repeat(80));

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('\n1. Using type() to trigger onChange properly...');
    const firstNameInput = page.locator('input[placeholder="John"]');

    // Clear any existing value first
    await firstNameInput.click();
    await firstNameInput.press('Control+A');
    await firstNameInput.press('Backspace');

    // Type a value - this should trigger onChange
    console.log('2. Typing "TestName"...');
    await firstNameInput.type('TestName', { delay: 50 });
    await page.waitForTimeout(500);

    // Now press Delete key to clear - this might trigger onChange
    console.log('3. Selecting all and deleting...');
    await firstNameInput.press('Control+A');
    await firstNameInput.press('Delete');
    await page.waitForTimeout(500);

    // Check for error in DOM
    const errorElement = page.locator('text=First name is required');
    const errorCount = await errorElement.count();
    console.log(`\n4. Error elements found: ${errorCount}`);

    if (errorCount > 0) {
      console.log('   ✅ ERROR IS IN THE DOM!');
    } else {
      console.log('   ❌ ERROR NOT IN DOM');
    }

    // Check console messages
    console.log('\n5. Console messages logged:');
    const errorMessages = consoleMessages.filter(msg => msg.includes('Form errors'));
    if (errorMessages.length > 0) {
      errorMessages.forEach(msg => console.log(`   ${msg}`));
    } else {
      console.log('   No form error logs found');
    }

    // Try password validation
    console.log('\n6. Testing password validation...');
    await page.locator('input[placeholder="John"]').type('John', { delay: 30 });
    await page.locator('input[placeholder="Doe"]').type('Doe', { delay: 30 });
    await page.locator('input[placeholder="Grace Community Church"]').type('Test Church', { delay: 30 });
    await page.locator('input[placeholder="pastor@church.com"]').type('test@test.com', { delay: 30 });
    await page.waitForTimeout(300);

    const passwordInput = page.locator('input[type="password"]').first();
    console.log('7. Typing invalid password...');
    await passwordInput.type('password123', { delay: 30 });
    await page.waitForTimeout(500);

    const uppercaseError = page.locator('text=uppercase');
    const uppercaseCount = await uppercaseError.count();
    console.log(`   Uppercase error elements found: ${uppercaseCount}`);

    if (uppercaseCount > 0) {
      console.log('   ✅ PASSWORD ERROR IS IN THE DOM!');
    } else {
      console.log('   ❌ PASSWORD ERROR NOT IN DOM');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ DEBUG COMPLETE\n');

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
