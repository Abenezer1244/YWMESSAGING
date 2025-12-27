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

  console.log('✅ Account created and on dashboard');

  // Wait longer and see what's on the page
  console.log('Waiting 3 seconds...');
  await page.waitForTimeout(3000);

  const text = await page.textContent('body');
  const hasRoleModal = text.includes('How would you describe your role');
  const hasBranches = text.includes('Branch');
  const hasMessaging = text.includes('Messaging');

  console.log(`\nPage state:`);
  console.log(`  - Has role modal: ${hasRoleModal}`);
  console.log(`  - Has "Branch" text: ${hasBranches}`);
  console.log(`  - Has "Messaging" text: ${hasMessaging}`);

  // Try navigating directly to messaging page
  console.log('\nNavigating directly to messaging page...');
  await page.goto('https://koinoniasms.com/dashboard/messaging', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const messagingUrl = page.url();
  const messagingText = await page.textContent('body');

  console.log(`\nMessaging page:`);
  console.log(`  - URL: ${messagingUrl}`);
  console.log(`  - First 500 chars: ${messagingText.substring(0, 500)}`);

  const buttons = await page.$$('button');
  const visibleButtons = [];
  for (let btn of buttons) {
    const visible = await btn.isVisible();
    if (visible) {
      const text = await btn.textContent();
      if (text.trim().length > 0 && text.trim().length < 50) {
        visibleButtons.push(text.trim());
      }
    }
  }

  console.log(`\nVisible buttons on messaging page:`);
  visibleButtons.forEach(b => console.log(`  - "${b}"`));

  // Look for group creation or messaging UI
  const groups = await page.$$('[data-testid="group-item"]');
  console.log(`\nGroups found on page: ${groups.length}`);

  // Look for "Create Group" button
  const createGroupBtn = await page.$('button:has-text("Create Group")');
  console.log(`Create Group button found: ${createGroupBtn ? 'Yes' : 'No'}`);

  // Look for any inputs for creating a group
  const inputs = await page.$$('input');
  console.log(`Input fields found: ${inputs.length}`);
  for (let i = 0; i < Math.min(5, inputs.length); i++) {
    const name = await inputs[i].getAttribute('name');
    const type = await inputs[i].getAttribute('type');
    console.log(`  Input ${i}: name="${name}" type="${type}"`);
  }

  await browser.close();
}

test().catch(console.error);
