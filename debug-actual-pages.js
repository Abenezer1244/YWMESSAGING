const { chromium } = require('@playwright/test');

async function debug() {
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
  await page.waitForTimeout(3000);

  console.log('✅ Account created');

  // Try pressing Escape to close the modal
  console.log('Trying to close modal with Escape key...');
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Escape press failed, trying alternative...');
  }

  // Check if modal is still there
  const modalStill = await page.$('div[class*="fixed"][class*="inset-0"]');
  if (modalStill) {
    console.log('Modal still visible, trying click outside...');
    // Click on the dark overlay to close
    await page.click('div[class*="bg-black"][class*="fixed"]');
    await page.waitForTimeout(1000);
  }

  console.log('\n=== DASHBOARD PAGE ===');
  const dashboardText = await page.textContent('body');
  console.log(dashboardText.substring(0, 1000));

  // Click Branches
  console.log('\nClicking Branches button...');
  const branchesBtn = await page.$('button:has-text("Branches")');
  if (branchesBtn) {
    await branchesBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log('\n=== BRANCHES PAGE ===');
  const branchesText = await page.textContent('body');
  console.log(`URL: ${page.url()}`);
  console.log(branchesText.substring(0, 2000));

  const branchesButtons = await page.$$('button');
  console.log('\n=== BUTTONS ON BRANCHES PAGE ===');
  for (let i = 0; i < Math.min(30, branchesButtons.length); i++) {
    const t = await branchesButtons[i].textContent();
    const visible = await branchesButtons[i].isVisible();
    if (visible && t.trim().length > 0) {
      console.log(`Button: "${t.trim()}" [visible]`);
    }
  }

  // Now click Messaging
  console.log('\n\nClicking Messaging button...');
  const messagingBtn = await page.$('button:has-text("Messaging")');
  if (messagingBtn) {
    await messagingBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log('\n=== MESSAGING PAGE ===');
  const messagingText = await page.textContent('body');
  console.log(`URL: ${page.url()}`);
  console.log(messagingText.substring(0, 2000));

  const messagingButtons = await page.$$('button');
  console.log('\n=== BUTTONS ON MESSAGING PAGE ===');
  for (let i = 0; i < Math.min(30, messagingButtons.length); i++) {
    const t = await messagingButtons[i].textContent();
    const visible = await messagingButtons[i].isVisible();
    if (visible && t.trim().length > 0) {
      console.log(`Button: "${t.trim()}" [visible]`);
    }
  }

  await page.screenshot({ path: '/tmp/debug-pages.png', fullPage: true });
  console.log('\n✅ Screenshot saved to /tmp/debug-pages.png');

  await browser.close();
}

debug().catch(console.error);
