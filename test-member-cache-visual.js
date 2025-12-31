/**
 * Visual test for member cache fix using Playwright
 *
 * Tests:
 * 1. Login
 * 2. Navigate to members page
 * 3. Count members before
 * 4. Add a member
 * 5. Reload page
 * 6. Count members after
 * 7. Verify member persists immediately
 */

const { chromium } = require('playwright');

async function testMemberCacheFix() {
  console.log('\n=== MEMBER CACHE FIX VISUAL TEST ===\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('Step 1: Navigating to login...');
    await page.goto('https://koinoniasms.com/login');
    await page.waitForLoadState('networkidle');

    console.log('Step 2: Filling login form...');
    await page.fill('input[type="email"]', 'mike@gmail.com');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button[type="submit"]');

    console.log('Step 3: Waiting for dashboard...');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Login successful');

    // Step 4: Navigate to members page
    console.log('\nStep 4: Navigating to members page...');
    await page.click('text=Members');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for member list to load

    // Step 5: Count members before
    console.log('\nStep 5: Counting members before...');
    const memberRowsBefore = await page.locator('table tbody tr').count();
    console.log(`✅ Members visible: ${memberRowsBefore}`);

    // Step 6: Add a new member
    console.log('\nStep 6: Adding new member...');
    await page.click('button:has-text("Add Member")');
    await page.waitForTimeout(1000);

    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', 'CacheTest');
    await page.fill('input[name="lastName"]', `Fix${timestamp}`);
    await page.fill('input[name="phone"]', `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`);
    await page.fill('input[name="email"]', `cachetest${timestamp}@test.com`);

    console.log('Step 7: Submitting member...');
    await page.click('button:has-text("Add"):not(:has-text("Add Member"))');
    await page.waitForTimeout(2000); // Wait for API call

    // Step 8: IMMEDIATELY reload the page (this is where the bug occurred)
    console.log('\nStep 8: RELOADING PAGE IMMEDIATELY...');
    console.log('   (This tests if cache eviction properly awaited disconnect)');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 9: Count members after reload
    console.log('\nStep 9: Counting members after reload...');
    const memberRowsAfter = await page.locator('table tbody tr').count();
    console.log(`✅ Members visible after reload: ${memberRowsAfter}`);

    // Step 10: Verify the fix
    console.log('\n=== TEST RESULT ===');
    const expectedCount = memberRowsBefore + 1;

    if (memberRowsAfter === expectedCount) {
      console.log('✅ CACHE FIX VERIFIED!');
      console.log(`   - Before: ${memberRowsBefore} members`);
      console.log(`   - After reload: ${memberRowsAfter} members`);
      console.log('   - New member persists immediately');
      console.log('   - No cache race condition detected');

      await page.screenshot({ path: 'screenshots/cache-fix-success.png', fullPage: true });
      console.log('\n📸 Screenshot saved: screenshots/cache-fix-success.png');

      return true;
    } else {
      console.log('❌ CACHE ISSUE DETECTED!');
      console.log(`   - Expected: ${expectedCount} members`);
      console.log(`   - Got: ${memberRowsAfter} members`);
      console.log('   - Member disappeared after reload');

      await page.screenshot({ path: 'screenshots/cache-fix-failure.png', fullPage: true });
      console.log('\n📸 Screenshot saved: screenshots/cache-fix-failure.png');

      return false;
    }

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    await page.screenshot({ path: 'screenshots/cache-fix-error.png', fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testMemberCacheFix()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
