import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Step 1: Logging in...');
    await page.goto('https://koinoniasms.com/login');
    await page.waitForLoadState('domcontentloaded');

    // Fill login form
    await page.fill('input[type="email"]', 'mike@gmail.com');
    await page.fill('input[type="password"]', '12!Michael');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for dashboard
    try {
      await page.waitForURL('**/dashboard**', { timeout: 60000 });
      console.log('✅ Logged in successfully');
    } catch (e) {
      console.log('Login may have failed or took too long');
      const url = page.url();
      console.log('Current URL:', url);
      if (!url.includes('/dashboard')) {
        await page.screenshot({ path: 'screenshots/member-test-login-failed.png', fullPage: true });
        throw new Error('Login failed');
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/member-test-03-dashboard.png', fullPage: true });

    console.log('\nStep 2: Navigating to members page...');
    // Click on Members in sidebar
    await page.click('text=Members');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/member-test-04-members-before.png', fullPage: true });

    // Get member count before adding
    const memberRows = await page.locator('tbody tr').count();
    console.log('Current members in table:', memberRows);

    console.log('\nStep 3: Adding a new member...');
    await page.click('button:has-text("Add Member")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/member-test-05-modal.png', fullPage: true });

    // Fill member form
    const timestamp = Date.now();
    const firstName = 'Test';
    const lastName = 'User' + timestamp;
    const phone = '202-555-0199';
    const email = 'test' + timestamp + '@example.com';
    
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', phone);
    await page.fill('input[name="email"]', email);
    await page.screenshot({ path: 'screenshots/member-test-06-form-filled.png', fullPage: true });

    console.log('Adding member:', firstName, lastName, phone, email);

    // Submit
    await page.click('button[type="submit"]:has-text("Add")');
    await page.waitForTimeout(3000);
    console.log('✅ Member form submitted');
    await page.screenshot({ path: 'screenshots/member-test-07-after-submit.png', fullPage: true });

    const membersAfterAdd = await page.locator('tbody tr').count();
    console.log('Members after adding:', membersAfterAdd);

    console.log('\nStep 4: Reloading page...');
    await page.reload();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/member-test-08-after-reload.png', fullPage: true });

    const membersAfterReload = await page.locator('tbody tr').count();
    console.log('Members after reload:', membersAfterReload);

    console.log('\nStep 5: Navigate away and back...');
    await page.click('text=Dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/member-test-09-dashboard.png', fullPage: true });

    await page.click('text=Members');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/member-test-10-members-after-nav.png', fullPage: true });

    const membersAfterNav = await page.locator('tbody tr').count();
    console.log('Members after navigation:', membersAfterNav);

    console.log('\n========== RESULTS ==========');
    console.log('Before:', memberRows, 'members');
    console.log('After Add:', membersAfterAdd, 'members');
    console.log('After Reload:', membersAfterReload, 'members');
    console.log('After Navigation:', membersAfterNav, 'members');

    if (membersAfterReload < membersAfterAdd || membersAfterNav < membersAfterAdd) {
      console.log('\n❌ BUG CONFIRMED: Members disappear!');
      console.log('Expected:', membersAfterAdd);
      console.log('After Reload:', membersAfterReload, '(Lost:', (membersAfterAdd - membersAfterReload), ')');
      console.log('After Nav:', membersAfterNav, '(Lost:', (membersAfterAdd - membersAfterNav), ')');
    } else {
      console.log('\n✅ Members persist correctly');
    }

    await page.waitForTimeout(3000);
    await browser.close();
  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: 'screenshots/member-test-error.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }
})();
