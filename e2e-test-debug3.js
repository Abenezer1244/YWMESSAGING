const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  try {
    console.log('\n🔍 DEBUGGING BLUR VALIDATION\n');
    console.log('=' .repeat(80));

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('\n1. Test field blur for onBlur validation...');
    const firstNameInput = page.locator('input[placeholder="John"]');

    // Click to focus
    console.log('2. Clicking field (focus)...');
    await firstNameInput.click();
    await page.waitForTimeout(100);

    // Type something
    console.log('3. Typing "John"...');
    await firstNameInput.type('John', { delay: 30 });
    await page.waitForTimeout(100);

    // Now blur by pressing Tab (standard blur trigger)
    console.log('4. Pressing Tab to blur...');
    await firstNameInput.press('Tab');
    await page.waitForTimeout(500);

    // Check for error
    let errorElement = page.locator('text=First name is required');
    let errorCount = await errorElement.count();
    console.log(`\n5. After blur, error elements found: ${errorCount}`);

    // Now test empty field validation
    console.log('\n6. Clearing the field to trigger empty validation...');
    await firstNameInput.click();
    await firstNameInput.press('Control+A');
    await firstNameInput.press('Delete');
    await page.waitForTimeout(100);

    console.log('7. Pressing Tab to blur again...');
    await firstNameInput.press('Tab');
    await page.waitForTimeout(500);

    errorElement = page.locator('text=First name is required');
    errorCount = await errorElement.count();
    console.log(`\n8. After clearing and blur, error elements found: ${errorCount}`);

    if (errorCount > 0) {
      console.log('   ✅ ERROR IS NOW IN THE DOM!');
    } else {
      console.log('   ❌ ERROR STILL NOT IN DOM');
    }

    // Log console messages
    console.log('\n9. Console messages:');
    consoleMessages.slice(0, 10).forEach(msg => {
      if (msg.includes('Form errors') || msg.includes('error') || msg.includes('Error')) {
        console.log(`   ${msg}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ DEBUG COMPLETE\n');

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
