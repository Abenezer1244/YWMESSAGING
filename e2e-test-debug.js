const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';

  try {
    console.log('\n🔍 DEBUGGING VALIDATION ERROR VISIBILITY\n');
    console.log('=' .repeat(80));

    console.log('\n📝 TEST: Check if error elements are in the DOM');

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Type and clear first name to trigger onChange validation
    const firstNameInput = page.locator('input[placeholder="John"]');
    console.log('\n1. Typing "Test" in first name field...');
    await firstNameInput.fill('Test');
    await page.waitForTimeout(200);

    console.log('2. Clearing first name field (triggering onChange with empty value)...');
    await firstNameInput.clear();
    await page.waitForTimeout(500);

    // Get the full HTML of the form to see what's being rendered
    console.log('\n3. Inspecting DOM for error elements...');

    // Check for any text containing "First name is required"
    const allText = await page.locator('text=First name is required');
    const count = await allText.count();
    console.log(`   Found ${count} element(s) with text "First name is required"`);

    if (count > 0) {
      try {
        const isVisible = await allText.isVisible();
        console.log(`   First element visible: ${isVisible}`);

        if (!isVisible) {
          const boundingBox = await allText.boundingBox();
          console.log(`   Bounding box: ${JSON.stringify(boundingBox)}`);
          const display = await allText.evaluate(el => window.getComputedStyle(el).display);
          console.log(`   CSS display: ${display}`);
        }
      } catch (e) {
        console.log(`   Error checking visibility: ${e.message}`);
      }
    }

    // Try to get the Input container
    console.log('\n4. Checking for input error messages in all descendants...');
    const inputs = await page.locator('input[placeholder="John"]');
    const inputCount = await inputs.count();
    console.log(`   Found ${inputCount} input(s) with placeholder "John"`);

    // Get the parent form section
    const formSections = await page.locator('div').filter({ hasText: 'First Name' });
    const sectionCount = await formSections.count();
    console.log(`   Found ${sectionCount} section(s) containing 'First Name' label`);

    if (sectionCount > 0) {
      const sectionHTML = await formSections.first().innerHTML();
      console.log('\n5. HTML of first "First Name" section:');
      console.log(sectionHTML.substring(0, 500));

      if (sectionHTML.includes('First name is required')) {
        console.log('\n   ✅ ERROR TEXT IS IN THE DOM!');

        // Try to find it
        const errorElement = formSections.first().locator('text=First name is required');
        const visible = await errorElement.isVisible();
        console.log(`   Visible: ${visible}`);
      } else {
        console.log('\n   ❌ ERROR TEXT IS NOT IN THE DOM');
      }
    }

    // Check password validation
    console.log('\n6. Testing password validation error...');
    const passwordInput = page.locator('input[type="password"]').first();
    await page.locator('input[placeholder="John"]').fill('John');
    await page.locator('input[placeholder="Doe"]').fill('Doe');
    await page.locator('input[placeholder="Grace Community Church"]').fill('Test Church');
    await page.locator('input[placeholder="pastor@church.com"]').fill('test@test.com');

    console.log('   Typing invalid password (lowercase only)...');
    await passwordInput.fill('password123');
    await page.waitForTimeout(500);

    const passwordSection = await page.locator('div').filter({ hasText: 'Password' }).first();
    const passwordHTML = await passwordSection.innerHTML();
    console.log('\n7. HTML of Password section:');
    console.log(passwordHTML.substring(0, 700));

    if (passwordHTML.includes('uppercase')) {
      console.log('\n   ✅ PASSWORD ERROR TEXT IS IN THE DOM!');
    } else {
      console.log('\n   ❌ PASSWORD ERROR TEXT IS NOT IN THE DOM');
    }

    // Check console errors
    console.log('\n8. Checking for console errors...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`   Console error: ${msg.text()}`);
      }
    });

    await page.waitForTimeout(1000);

    console.log('\n' + '='.repeat(80));
    console.log('\n🔍 DEBUG COMPLETE\n');

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
