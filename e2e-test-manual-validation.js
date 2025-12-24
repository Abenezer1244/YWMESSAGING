const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';

  try {
    console.log('\n🔍 TESTING MANUAL VALIDATION\n');
    console.log('=' .repeat(80));

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('\n1. Testing validation error visibility with manual validation...');

    const passwordInput = page.locator('input[type="password"]').first();

    console.log('2. Typing invalid password (lowercase only)...');
    await passwordInput.type('password123', { delay: 30 });
    await page.waitForTimeout(800); // Wait longer for watch() to trigger validation

    // Check all possible error message locations
    const allErrorTexts = [
      'uppercase',
      'at least one uppercase',
      'Password must contain at least one uppercase letter',
      'Uppercase',
      'UPPERCASE'
    ];

    console.log('\n3. Searching for error messages in multiple formats...');
    let errorFound = false;

    for (const errorText of allErrorTexts) {
      const errorElement = page.locator(`text=${errorText}`);
      const count = await errorElement.count();
      if (count > 0) {
        console.log(`   ✅ Found "${errorText}" (${count} occurrence(s))`);
        errorFound = true;
        const visible = await errorElement.isVisible();
        console.log(`      Visible: ${visible}`);
        break;
      }
    }

    if (!errorFound) {
      console.log('   ❌ No error messages found');

      // Try to get the actual HTML
      console.log('\n4. Checking password input container HTML...');
      const passwordContainer = page.locator('input[type="password"]').first();
      const parentDiv = await passwordContainer.evaluate(el => {
        let parent = el.parentElement;
        while (parent && !parent.innerHTML.includes('⚠️')) {
          parent = parent.parentElement;
        }
        return parent ? parent.innerHTML.substring(0, 500) : 'Not found';
      });

      console.log(parentDiv);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ TEST COMPLETE\n');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
