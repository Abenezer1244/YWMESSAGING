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

  // IMPORTANT: We MUST select a role, not skip!
  console.log('Selecting a role (first radio button)...');
  const roleRadios = await page.$$('input[type="radio"][name="role"]');
  if (roleRadios.length > 0) {
    await roleRadios[0].click();
    console.log('Role selected');
  }

  await page.waitForTimeout(500);

  // Click "Select a role to continue" button
  console.log('Clicking confirm button...');
  const confirmBtn = await page.$('button:has-text("Select a role to continue")');
  if (confirmBtn) {
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }

  const url = page.url();
  const text = await page.textContent('body');
  const hasRoleModal = text.includes('How would you describe your role');

  console.log(`\nAfter role selection:`);
  console.log(`  - URL: ${url}`);
  console.log(`  - Modal still visible: ${hasRoleModal}`);

  // NOW try to navigate to messaging
  console.log('\nNavigating to messaging page...');
  await page.goto('https://koinoniasms.com/dashboard/messaging', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const messagingUrl = page.url();
  const messagingText = await page.textContent('body');

  console.log(`\nMessaging page:`);
  console.log(`  - URL: ${messagingUrl}`);
  console.log(`  - First 800 chars: ${messagingText.substring(0, 800)}`);

  // Check for groups/messaging UI
  const groups = await page.$$('[data-testid="group-item"]');
  console.log(`\n- Groups found: ${groups.length}`);

  const createGroupBtn = await page.$('button:has-text("Create Group")');
  console.log(`- Create Group button: ${createGroupBtn ? 'Found' : 'Not found'}`);

  const createMessageBtn = await page.$('button:has-text("Create")');
  console.log(`- Create button: ${createMessageBtn ? 'Found' : 'Not found'}`);

  // List all visible buttons
  const buttons = await page.$$('button');
  const visibleBtns = [];
  for (let btn of buttons) {
    const visible = await btn.isVisible();
    if (visible) {
      const t = await btn.textContent();
      if (t.trim().length > 0 && t.trim().length < 40) {
        visibleBtns.push(t.trim());
      }
    }
  }

  console.log(`\nVisible buttons:`);
  visibleBtns.forEach(b => console.log(`  - "${b}"`));

  await page.screenshot({ path: '/tmp/with-role.png', fullPage: true });
  console.log('\nScreenshot saved');

  await browser.close();
}

test().catch(console.error);
