const { chromium } = require('@playwright/test');

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Creating account...');
  const email = `test${Date.now()}@test-e2e.com`;
  const password = 'TestPassword123!';

  // Register
  await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="churchName"]', `Church${Date.now()}`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button:has-text("Create Account")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  console.log('✅ Account created');

  // MUST select a role!
  console.log('\nSelecting role...');
  const roleRadios = await page.$$('input[type="radio"][name="role"]');
  if (roleRadios.length > 0) {
    await roleRadios[0].click();
    await page.waitForTimeout(300);
  }

  // Click confirm
  const confirmBtn = await page.$('button:has-text("Select a role to continue")');
  if (confirmBtn) {
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log('Role selected');

  // NOW click the Messaging button (not navigate by URL!)
  console.log('\nClicking Messaging button from sidebar...');
  const messagingBtn = await page.$('button:has-text("Messaging")');
  if (messagingBtn) {
    await messagingBtn.click();
    console.log('Clicking button...');

    // Wait for page navigation and content to load
    await page.waitForTimeout(4000);

    // Wait for any content to appear
    try {
      await page.waitForSelector('button, h1, h2, [data-testid], [class*="group"]', { timeout: 5000 });
    } catch (e) {
      console.log('No elements found after waiting');
    }
  }

  const url = page.url();
  const text = await page.textContent('body');
  const hasRoleModal = text.includes('How would you describe your role');
  const hasGroups = text.includes('Group');
  const hasMessaging = text.includes('Messaging') || text.includes('Message');

  console.log(`\nAfter clicking Messaging:`);
  console.log(`  - URL: ${url}`);
  console.log(`  - Has role modal: ${hasRoleModal}`);
  console.log(`  - Has "Group" text: ${hasGroups}`);
  console.log(`  - Has "Messaging/Message" text: ${hasMessaging}`);
  console.log(`  - Body text length: ${text.length}`);
  console.log(`  - First 600 chars:\n${text.substring(0, 600)}`);

  // Look for UI elements
  const groups = await page.$$('[data-testid="group-item"], [class*="group"], li:has-text("Group")');
  console.log(`\nGroups found: ${groups.length}`);

  const buttons = await page.$$('button');
  const visibleBtns = [];
  for (let btn of buttons) {
    const visible = await btn.isVisible();
    if (visible) {
      const t = await btn.textContent();
      if (t && t.trim().length > 0 && t.trim().length < 40) {
        visibleBtns.push(t.trim());
      }
    }
  }

  console.log(`\nVisible buttons: ${visibleBtns.length}`);
  visibleBtns.forEach(b => console.log(`  - "${b}"`));

  await page.screenshot({ path: '/tmp/with-click.png', fullPage: true });
  console.log('\n✅ Screenshot saved');

  await browser.close();
}

test().catch(console.error);
